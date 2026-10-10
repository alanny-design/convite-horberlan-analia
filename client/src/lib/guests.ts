// Lista de convidados — fonte: .context/convidados.md
export const GUEST_NAMES = [
  "Ivan e Ana",
  "Cícera e Ronildo",
  "Maria do Socorro e Guilherme",
  "Alanne e Borja",
  "Patriky e Lindairis",
  "Aline e Jackson",
  "Maria Auxiliadora e Pedro",
  "Marcymmianna e Francisco",
  "Ivan e Francisca",
  "Vânia",
  "Vanaldo e Rosielia",
  "Vanuza e Sebastião",
  "Vaneide",
  "Miriam",
  "Rafael",
  "Gabriela",
  "Mayonaria",
  "Myllenny",
  "Annanda",
  "Nicoli e Matheus",
  "Maria e Gustavo",
  "Aparecida e Vanildo",
  "Pastor e Geisane",
  "Henrique",
  "Sonally",
  "Luiza",
  "Lucas e Michele",
] as const;

/** "Vanuza e Sebastião" → "vanuza-e-sebastiao" */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const GUESTS = GUEST_NAMES.map(name => ({ name, slug: slugify(name) }));

const guestsBySlug = new Map(GUESTS.map(g => [g.slug, g.name]));

export function findGuestBySlug(slug: string): string | undefined {
  return guestsBySlug.get(slug);
}
