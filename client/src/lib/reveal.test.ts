import { describe, expect, it } from "vitest";
import { staggerDelays } from "./reveal";

describe("staggerDelays", () => {
  it("escalona em passos de 90ms", () => {
    expect(staggerDelays(3)).toEqual([0, 90, 180]);
  });

  it("limita o atraso máximo a 4 passos", () => {
    expect(staggerDelays(7)).toEqual([0, 90, 180, 270, 360, 360, 360]);
  });

  it("aceita passo e limite customizados", () => {
    expect(staggerDelays(4, 50, 2)).toEqual([0, 50, 100, 100]);
  });

  it("retorna vazio quando nada entra na tela", () => {
    expect(staggerDelays(0)).toEqual([]);
  });
});
