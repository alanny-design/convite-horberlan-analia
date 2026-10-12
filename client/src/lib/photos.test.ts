import { describe, expect, it } from "vitest";
import {
  buildPhotoPath,
  fitWithin,
  friendlyUploadError,
  validateFile,
} from "./photos";

describe("validateFile", () => {
  it("aceita imagens dentro do limite", () => {
    expect(validateFile({ type: "image/jpeg", size: 5_000_000 })).toBeNull();
    expect(validateFile({ type: "image/heic", size: 3_000_000 })).toBeNull();
  });

  it("recusa arquivos que não são imagem", () => {
    expect(validateFile({ type: "video/mp4", size: 1000 })).toBe(
      "não é uma imagem"
    );
    expect(validateFile({ type: "", size: 1000 })).toBe("não é uma imagem");
  });

  it("recusa arquivos acima de 40 MB", () => {
    expect(validateFile({ type: "image/png", size: 41 * 1024 * 1024 })).toMatch(
      /muito grande/
    );
  });
});

describe("fitWithin", () => {
  it("reduz mantendo a proporção", () => {
    expect(fitWithin(4000, 3000, 2048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(3000, 4000, 2048)).toEqual({ width: 1536, height: 2048 });
  });

  it("não amplia imagens menores", () => {
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
  });
});

describe("buildPhotoPath", () => {
  it("gera nome ordenável pelo horário", () => {
    const date = new Date("2027-01-28T18:30:00Z");
    expect(buildPhotoPath(date, "a1b2c3d4", "jpg")).toBe(
      `${date.getTime()}-a1b2c3d4.jpg`
    );
  });
});

describe("friendlyUploadError", () => {
  it("traduz erros comuns do Supabase", () => {
    expect(friendlyUploadError(new Error("Bucket not found"))).toBe(
      "galeria ainda não configurada"
    );
    expect(
      friendlyUploadError(
        new Error("new row violates row-level security policy")
      )
    ).toBe("envio não permitido");
    expect(
      friendlyUploadError(
        new Error("The object exceeded the maximum allowed size")
      )
    ).toMatch(/muito grande/);
    expect(friendlyUploadError(new TypeError("Failed to fetch"))).toMatch(
      /sem conexão/
    );
  });

  it("usa mensagem genérica para erros desconhecidos", () => {
    expect(friendlyUploadError(new Error("boom"))).toBe(
      "falha no envio — tente de novo"
    );
    expect(friendlyUploadError(undefined)).toBe(
      "falha no envio — tente de novo"
    );
  });
});
