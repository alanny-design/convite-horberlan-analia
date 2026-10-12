import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listPhotos,
  PAGE_SIZE,
  friendlyUploadError,
  uploadPhoto,
  validateFile,
  type Photo,
} from "@/lib/photos";

// Mesma paleta e tipografia do convite (Home.tsx)
const PHOTOS_CSS = `
.fotos-page {
  --olive: #4a5240; --olive-dark: #3a4232; --olive-light: #7a8a6a;
  --cream: #f4efe5; --paper: #fbf8f1; --gold: #b8975a; --gold-light: #d4b07a;
  --ease: cubic-bezier(.22, .8, .24, 1);
  min-height: 100vh;
  background: var(--cream);
  color: var(--olive);
  font-family: 'Cormorant Garamond', serif;
}
.fotos-header {
  position: relative;
  background: linear-gradient(175deg, var(--olive) 0%, var(--olive-dark) 60%, #2e3628 100%);
  color: #f5f0e8;
  text-align: center;
  padding: 64px 24px 72px;
  overflow: hidden;
}
.fotos-back {
  position: absolute; top: 18px; left: 18px;
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
  color: rgba(245,240,232,.8); text-decoration: none;
  padding: 8px 10px; border-radius: 8px;
}
.fotos-back:hover, .fotos-back:focus-visible { color: #fff; background: rgba(255,255,255,.08); }
.fotos-mono { width: 44px; height: auto; margin: 0 auto 14px; display: block; filter: drop-shadow(0 2px 10px rgba(0,0,0,.4)); }
.fotos-kicker { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: rgba(245,240,232,.65); }
.fotos-title { font-family: 'Imperial Script', cursive; font-weight: 400; font-size: clamp(46px, 12vw, 64px); line-height: 1.05; margin: 6px 0 10px; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,.3); }
.fotos-lead { font-style: italic; font-size: 17px; line-height: 1.6; max-width: 320px; margin: 0 auto; color: rgba(245,240,232,.85); }

.fotos-main { max-width: 1080px; margin: 0 auto; padding: 0 16px 64px; }

/* ─── Envio ─── */
.fotos-drop {
  position: relative; z-index: 2;
  max-width: 460px; margin: -40px auto 0;
  background: var(--paper);
  border: 1.5px dashed rgba(122,138,106,.55);
  border-radius: 16px;
  padding: 28px 22px 24px;
  text-align: center;
  box-shadow: 0 10px 34px rgba(74,82,64,.18);
  transition: border-color .2s ease, background .2s ease, transform .2s var(--ease);
}
.fotos-drop.is-over { border-color: var(--gold); background: #fffdf7; transform: scale(1.01); }
.fotos-drop-icon { width: 52px; height: 52px; margin: 0 auto 12px; border-radius: 50%; background: rgba(74,82,64,.08); display: grid; place-items: center; color: var(--olive); }
.fotos-drop-title { font-family: 'Cinzel', serif; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
.fotos-drop-text { font-size: 15px; color: #6b7360; line-height: 1.5; margin-bottom: 18px; }
.fotos-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 48px; padding: 14px 26px; border-radius: 8px; border: none; cursor: pointer;
  background: var(--olive); color: #f5f0e8;
  font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
  box-shadow: 0 4px 18px rgba(74,82,64,.28);
  transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
}
.fotos-btn:hover { background: #414938; }
.fotos-btn:active { transform: scale(.97); }
.fotos-btn:focus-visible, .fotos-ghost:focus-visible, .fotos-tile:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.fotos-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 12px 22px; border-radius: 8px; cursor: pointer;
  background: transparent; color: var(--olive); border: 1.5px solid rgba(74,82,64,.35);
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
}
.fotos-hint { margin-top: 12px; font-size: 13px; color: #8a907f; }

/* Fila de envio */
.fotos-queue { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 8px; text-align: left; }
.fotos-qitem { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: 12px; padding: 8px; border-radius: 10px; background: rgba(74,82,64,.05); }
.fotos-qthumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; background: rgba(74,82,64,.12); }
.fotos-qname { font-size: 14px; color: var(--olive); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fotos-qstatus { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #8a907f; }
.fotos-qstatus.is-done { color: #5f7a4a; }
.fotos-qstatus.is-error { color: #a0503c; }
.fotos-qaction { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--olive); background: none; border: 1px solid rgba(74,82,64,.3); border-radius: 6px; padding: 6px 8px; cursor: pointer; }
.fotos-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(74,82,64,.2); border-top-color: var(--olive); animation: fotos-spin .8s linear infinite; }
@keyframes fotos-spin { to { transform: rotate(360deg); } }
.fotos-summary { margin-top: 12px; font-size: 14px; color: #6b7360; }

/* ─── Galeria ─── */
.fotos-gallery-head { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin: 56px 0 6px; }
.fotos-gallery-title { font-family: 'Cinzel', serif; font-size: 20px; letter-spacing: 4px; text-transform: uppercase; font-weight: 400; }
.fotos-gallery-count { font-style: italic; font-size: 15px; color: var(--olive-light); }
.fotos-divider { width: 44px; height: 1px; background: var(--gold); margin: 0 auto 24px; }
.fotos-grid { column-count: 2; column-gap: 8px; }
@media (min-width: 640px) { .fotos-grid { column-count: 3; column-gap: 10px; } }
@media (min-width: 1024px) { .fotos-grid { column-count: 4; column-gap: 12px; } }
.fotos-tile {
  display: block; width: 100%; padding: 0; margin: 0 0 8px; border: none; cursor: zoom-in;
  break-inside: avoid; border-radius: 8px; overflow: hidden; background: rgba(74,82,64,.1);
}
@media (min-width: 640px) { .fotos-tile { margin-bottom: 10px; } }
.fotos-tile img { display: block; width: 100%; height: auto; opacity: 0; transform: scale(1.02); transition: opacity .6s var(--ease), transform .6s var(--ease); }
.fotos-tile img.is-loaded { opacity: 1; transform: none; }
.fotos-tile:hover img.is-loaded { transform: scale(1.03); }
.fotos-skeleton { break-inside: avoid; margin-bottom: 8px; border-radius: 8px; background: linear-gradient(100deg, rgba(74,82,64,.08) 30%, rgba(74,82,64,.14) 50%, rgba(74,82,64,.08) 70%); background-size: 300% 100%; animation: fotos-shimmer 1.4s ease infinite; }
@keyframes fotos-shimmer { to { background-position: -100% 0; } }
.fotos-empty, .fotos-error { text-align: center; padding: 32px 16px; color: #6b7360; font-size: 16px; line-height: 1.6; }
.fotos-empty strong { display: block; font-family: 'Imperial Script', cursive; font-weight: 400; font-size: 34px; color: var(--olive); margin-bottom: 4px; }
.fotos-more { display: flex; justify-content: center; margin-top: 20px; }

/* ─── Visualizador ─── */
.fotos-lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(30,34,26,.96); display: flex; align-items: center; justify-content: center; touch-action: pan-y; }
.fotos-lightbox img { max-width: calc(100vw - 32px); max-height: calc(100vh - 140px); object-fit: contain; border-radius: 4px; box-shadow: 0 10px 40px rgba(0,0,0,.5); user-select: none; }
.fotos-lb-bar { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 0 18px; color: rgba(245,240,232,.85); font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; }
.fotos-lb-actions { display: flex; gap: 6px; }
.fotos-icon-btn { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; border: none; background: rgba(255,255,255,.08); color: #f5f0e8; cursor: pointer; text-decoration: none; }
.fotos-icon-btn:hover, .fotos-icon-btn:focus-visible { background: rgba(255,255,255,.18); outline: none; }
.fotos-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); }
.fotos-lb-nav.prev { left: 10px; }
.fotos-lb-nav.next { right: 10px; }
@media (max-width: 640px) { .fotos-lb-nav { display: none; } }

.sr-only-fotos { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .fotos-page *, .fotos-page *::before { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`;

type QueueStatus = "waiting" | "uploading" | "done" | "error";
type QueueItem = {
  id: string;
  file: File;
  preview: string;
  status: QueueStatus;
  error?: string;
};

const CONCURRENCY = 3;

const STATUS_LABEL: Record<QueueStatus, string> = {
  waiting: "Na fila",
  uploading: "Enviando…",
  done: "Enviada",
  error: "Erro",
};

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  camera:
    "M3 8.5A2.5 2.5 0 0 1 5.5 6h1.6l1.4-2h7l1.4 2h1.6A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-9ZM12 16.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  back: "M15 18l-6-6 6-6",
  next: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  download: "M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14",
  check: "M5 12.5l4.5 4.5L19 7",
};

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = useRef(0);

  // Fundo creme na página toda (o index.html pinta de oliva para o envelope)
  useEffect(() => {
    const prev = [
      document.documentElement.style.background,
      document.body.style.background,
    ];
    document.documentElement.style.background = "#f4efe5";
    document.body.style.background = "#f4efe5";
    document.title = "Fotos — Horberlan & Analia";
    return () => {
      document.documentElement.style.background = prev[0];
      document.body.style.background = prev[1];
    };
  }, []);

  const load = useCallback(async (offset: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const page = await listPhotos(offset);
      setPhotos(current => (offset === 0 ? page : [...current, ...page]));
      setHasMore(page.length === PAGE_SIZE);
    } catch {
      setLoadError("Não foi possível carregar a galeria agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) load(0);
    else {
      setLoading(false);
      setLoadError("A galeria ainda não foi configurada.");
    }
  }, [load]);

  // Fila de envio: até CONCURRENCY fotos ao mesmo tempo
  useEffect(() => {
    const waiting = queue.filter(item => item.status === "waiting");
    const slots = CONCURRENCY - active.current;
    waiting.slice(0, Math.max(0, slots)).forEach(item => {
      active.current += 1;
      setQueue(q =>
        q.map(i => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );
      uploadPhoto(item.file)
        .then(photo => {
          setPhotos(current => [photo, ...current]);
          setQueue(q =>
            q.map(i => (i.id === item.id ? { ...i, status: "done" } : i))
          );
        })
        .catch((err: unknown) => {
          const message = friendlyUploadError(err);
          setQueue(q =>
            q.map(i =>
              i.id === item.id ? { ...i, status: "error", error: message } : i
            )
          );
        })
        .finally(() => {
          active.current -= 1;
          setQueue(q => [...q]); // reavalia a fila
        });
    });
  }, [queue]);

  // Libera as URLs de pré-visualização ao sair
  const queueRef = useRef(queue);
  queueRef.current = queue;
  useEffect(
    () => () =>
      queueRef.current.forEach(
        i => i.preview && URL.revokeObjectURL(i.preview)
      ),
    []
  );

  function addFiles(list: FileList | null) {
    if (!list || !isSupabaseConfigured) return;
    const items: QueueItem[] = Array.from(list).map(file => {
      const invalid = validateFile(file);
      return {
        id: crypto.randomUUID(),
        file,
        // só gera miniatura para imagens (evita ícone de imagem quebrada)
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
        status: invalid ? "error" : "waiting",
        error: invalid ?? undefined,
      };
    });
    setQueue(q => [...items, ...q]);
  }

  function retry(id: string) {
    setQueue(q =>
      q.map(i =>
        i.id === id && !validateFile(i.file)
          ? { ...i, status: "waiting", error: undefined }
          : i
      )
    );
  }

  const done = queue.filter(i => i.status === "done").length;
  const pending = queue.filter(
    i => i.status === "waiting" || i.status === "uploading"
  ).length;

  return (
    <div className="fotos-page">
      <style dangerouslySetInnerHTML={{ __html: PHOTOS_CSS }} />

      <header className="fotos-header">
        <a className="fotos-back" href="/">
          <Icon d={ICONS.back} size={14} /> Convite
        </a>
        <img
          className="fotos-mono"
          src="/manus-storage/monograma_adaa041c.webp"
          alt="Monograma HA"
        />
        <p className="fotos-kicker">Horberlan &amp; Analia · 28.01.2027</p>
        <h1 className="fotos-title">Nossas memórias</h1>
        <p className="fotos-lead">
          Compartilhe as fotos que você tirou no nosso casamento e veja os
          momentos registrados por todos.
        </p>
      </header>

      <main className="fotos-main">
        <section
          className={`fotos-drop${dragOver ? " is-over" : ""}`}
          aria-labelledby="fotos-drop-title"
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <div className="fotos-drop-icon">
            <Icon d={ICONS.camera} size={24} />
          </div>
          <h2 className="fotos-drop-title" id="fotos-drop-title">
            Enviar fotos
          </h2>
          <p className="fotos-drop-text">
            Escolha uma ou várias fotos da galeria do seu celular.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="fotos-btn"
            disabled={!isSupabaseConfigured}
            onClick={() => inputRef.current?.click()}
          >
            <Icon d={ICONS.camera} size={16} /> Escolher fotos
          </button>
          <p className="fotos-hint">
            JPG, PNG ou HEIC · até 40 MB cada · ou arraste para cá
          </p>

          {queue.length > 0 && (
            <>
              <p className="fotos-summary" aria-live="polite">
                {pending > 0
                  ? `Enviando… ${done} de ${done + pending} concluídas`
                  : `${done} ${done === 1 ? "foto enviada" : "fotos enviadas"}. Obrigado!`}
              </p>
              <ul className="fotos-queue">
                {queue.map(item => (
                  <li className="fotos-qitem" key={item.id}>
                    {item.preview ? (
                      <img className="fotos-qthumb" src={item.preview} alt="" />
                    ) : (
                      <span className="fotos-qthumb" aria-hidden="true" />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div className="fotos-qname">{item.file.name}</div>
                      <div
                        className={`fotos-qstatus${item.status === "done" ? " is-done" : ""}${item.status === "error" ? " is-error" : ""}`}
                      >
                        {STATUS_LABEL[item.status]}
                        {item.error ? ` — ${item.error}` : ""}
                      </div>
                    </div>
                    {item.status === "uploading" && (
                      <span className="fotos-spinner" aria-hidden="true" />
                    )}
                    {item.status === "done" && (
                      <span style={{ color: "#5f7a4a" }}>
                        <Icon d={ICONS.check} size={18} />
                      </span>
                    )}
                    {item.status === "error" && !validateFile(item.file) && (
                      <button
                        type="button"
                        className="fotos-qaction"
                        onClick={() => retry(item.id)}
                      >
                        Tentar de novo
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="fotos-gallery-title">
          <div className="fotos-gallery-head">
            <h2 className="fotos-gallery-title" id="fotos-gallery-title">
              Galeria
            </h2>
            {photos.length > 0 && (
              <span className="fotos-gallery-count">
                {photos.length}
                {hasMore ? "+" : ""} {photos.length === 1 ? "foto" : "fotos"}
              </span>
            )}
          </div>
          <div className="fotos-divider" />

          {loadError && photos.length === 0 ? (
            <div className="fotos-error" role="alert">
              {loadError}
              {isSupabaseConfigured && (
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="fotos-ghost"
                    onClick={() => load(0)}
                  >
                    Tentar de novo
                  </button>
                </div>
              )}
            </div>
          ) : !loading && photos.length === 0 ? (
            <div className="fotos-empty">
              <strong>Ainda não há fotos</strong>
              Seja o primeiro a compartilhar um momento!
            </div>
          ) : (
            <div className="fotos-grid">
              {photos.map((photo, index) => (
                <button
                  type="button"
                  key={photo.name}
                  className="fotos-tile"
                  onClick={() => setViewer(index)}
                  aria-label={`Abrir foto ${index + 1}`}
                >
                  <img
                    src={photo.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onLoad={e => e.currentTarget.classList.add("is-loaded")}
                  />
                </button>
              ))}
              {loading &&
                Array.from({ length: photos.length ? 4 : 8 }, (_, i) => (
                  <div
                    key={`s${i}`}
                    className="fotos-skeleton"
                    style={{ height: [180, 240, 150, 210][i % 4] }}
                  />
                ))}
            </div>
          )}

          {hasMore && !loading && (
            <div className="fotos-more">
              <button
                type="button"
                className="fotos-ghost"
                onClick={() => load(photos.length)}
              >
                Carregar mais
              </button>
            </div>
          )}
        </section>
      </main>

      {viewer !== null && photos[viewer] && (
        <Lightbox
          photos={photos}
          index={viewer}
          onChange={setViewer}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const photo = photos[index];
  const go = useCallback(
    (delta: number) =>
      onChange((index + delta + photos.length) % photos.length),
    [index, onChange, photos.length]
  );

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div
      className="fotos-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${photos.length}`}
      onClick={e => e.target === e.currentTarget && onClose()}
      onTouchStart={e => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="fotos-lb-bar">
        <span>
          {index + 1} / {photos.length}
        </span>
        <div className="fotos-lb-actions">
          <a
            className="fotos-icon-btn"
            href={`${photo.url}?download=`}
            aria-label="Baixar foto"
          >
            <Icon d={ICONS.download} />
          </a>
          <button
            ref={closeRef}
            type="button"
            className="fotos-icon-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            <Icon d={ICONS.close} />
          </button>
        </div>
      </div>

      {photos.length > 1 && (
        <button
          type="button"
          className="fotos-icon-btn fotos-lb-nav prev"
          onClick={() => go(-1)}
          aria-label="Foto anterior"
        >
          <Icon d={ICONS.back} />
        </button>
      )}
      <img src={photo.url} alt={`Foto ${index + 1} do casamento`} />
      {photos.length > 1 && (
        <button
          type="button"
          className="fotos-icon-btn fotos-lb-nav next"
          onClick={() => go(1)}
          aria-label="Próxima foto"
        >
          <Icon d={ICONS.next} />
        </button>
      )}
      <span className="sr-only-fotos" aria-live="polite">
        Foto {index + 1} de {photos.length}
      </span>
    </div>
  );
}
