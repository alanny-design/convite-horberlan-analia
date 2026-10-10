import { describe, expect, it } from "vitest";
import { GUESTS, GUEST_NAMES, findGuestBySlug, slugify } from "./guests";

describe("slugify", () => {
  it("remove acentos, usa minúsculas e separa por hífen", () => {
    expect(slugify("Vanuza e Sebastião")).toBe("vanuza-e-sebastiao");
    expect(slugify("Cícera e Ronildo")).toBe("cicera-e-ronildo");
    expect(slugify("Vânia")).toBe("vania");
  });
});

describe("GUESTS", () => {
  it("gera um slug único para cada convidado", () => {
    const slugs = new Set(GUESTS.map(g => g.slug));
    expect(slugs.size).toBe(GUEST_NAMES.length);
  });
});

describe("findGuestBySlug", () => {
  it("encontra o convidado pelo slug", () => {
    expect(findGuestBySlug("ivan-e-ana")).toBe("Ivan e Ana");
    expect(findGuestBySlug("maria-do-socorro-e-guilherme")).toBe(
      "Maria do Socorro e Guilherme"
    );
  });

  it("retorna undefined para slug inexistente", () => {
    expect(findGuestBySlug("fulano")).toBeUndefined();
    expect(findGuestBySlug("")).toBeUndefined();
    expect(findGuestBySlug("Ivan e Ana")).toBeUndefined();
  });
});
