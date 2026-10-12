import { supabase } from "./supabase";

/** Bucket criado por supabase/storage-fotos.sql */
export const PHOTOS_BUCKET = "fotos";
/** Limite do bucket (o mesmo de supabase/storage-fotos.sql) */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
/** Limite do arquivo escolhido, antes da compressão no navegador */
export const MAX_SOURCE_BYTES = 40 * 1024 * 1024;
/** Maior lado da foto enviada, em px */
export const MAX_DIMENSION = 2048;
export const PAGE_SIZE = 48;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export type Photo = { name: string; url: string; createdAt: string | null };

/** Mensagem de erro para o usuário, ou null se o arquivo pode ser enviado */
export function validateFile(file: Pick<File, "type" | "size">): string | null {
  if (!file.type.startsWith("image/")) return "não é uma imagem";
  if (file.size > MAX_SOURCE_BYTES) return "arquivo muito grande (máx. 40 MB)";
  return null;
}

/** Traduz erros do envio (Supabase/rede) para uma mensagem curta em português */
export function friendlyUploadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (/bucket not found/i.test(message)) return "galeria ainda não configurada";
  if (/row-level security|unauthorized|not allowed|403/i.test(message))
    return "envio não permitido";
  if (/too large|exceeded|payload|413/i.test(message))
    return "arquivo muito grande (máx. 15 MB)";
  if (/mime|formato não suportado|invalid_mime/i.test(message))
    return "formato não suportado";
  if (/failed to fetch|network|load failed/i.test(message))
    return "sem conexão — tente de novo";
  if (/muito grande/.test(message)) return message;
  return "falha no envio — tente de novo";
}

/** Reduz (w, h) para caber em max × max mantendo a proporção; nunca amplia */
export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/** Nome único e ordenável: 1769626800000-a1b2c3d4.jpg */
export function buildPhotoPath(date: Date, random: string, ext: string) {
  return `${date.getTime()}-${random}.${ext}`;
}

/**
 * Redimensiona e reconverte para JPEG no navegador.
 * Além de deixar o envio rápido, remove os metadados EXIF (ex.: localização GPS).
 * Se o navegador não decodificar o formato (ex.: HEIC fora do Safari), envia o original.
 */
async function prepareImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const { width, height } = fitWithin(
      bitmap.width,
      bitmap.height,
      MAX_DIMENSION
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (blob) return blob;
  } catch {
    // formato não decodificável aqui — segue com o original
  }
  return file;
}

export async function uploadPhoto(file: File): Promise<Photo> {
  if (!supabase) throw new Error("Supabase não configurado");
  const blob = await prepareImage(file);
  if (!ACCEPTED_TYPES.includes(blob.type)) {
    throw new Error("formato não suportado");
  }
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("arquivo muito grande (máx. 15 MB)");
  }

  const ext = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1];
  const random = crypto.randomUUID().slice(0, 8);
  const path = buildPhotoPath(new Date(), random, ext);

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, blob, {
      contentType: blob.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;

  return {
    name: path,
    url: publicUrl(path),
    createdAt: new Date().toISOString(),
  };
}

function publicUrl(path: string) {
  return supabase!.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

/** Fotos mais recentes primeiro */
export async function listPhotos(offset = 0): Promise<Photo[]> {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data, error } = await supabase.storage.from(PHOTOS_BUCKET).list("", {
    limit: PAGE_SIZE,
    offset,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter(item => item.id && !item.name.startsWith("."))
    .map(item => ({
      name: item.name,
      url: publicUrl(item.name),
      createdAt: item.created_at ?? null,
    }));
}
