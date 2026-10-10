/**
 * Scroll reveal: elementos com a classe `.reveal` aparecem quando entram na tela.
 * Inspirado em iurie-anamaria.github.io (main.js): observer único, revela uma vez.
 *
 * - Elementos que entram juntos recebem um atraso escalonado (--d) em ordem de leitura;
 *   um --d definido inline tem prioridade.
 * - Ao fim da transição, as classes `reveal`/`in` são removidas para devolver ao
 *   elemento as próprias transições (hover/:active de botões).
 * - Com prefers-reduced-motion, tudo é revelado imediatamente.
 */

const STEP_MS = 90;
const MAX_STEPS = 4;

/** Atrasos em ms para `count` elementos que entram juntos: 0, 90, 180, 270, 360, 360… */
export function staggerDelays(
  count: number,
  stepMs = STEP_MS,
  maxSteps = MAX_STEPS
): number[] {
  return Array.from(
    { length: count },
    (_, i) => Math.min(i, maxSteps) * stepMs
  );
}

function settle(el: HTMLElement) {
  el.classList.remove("reveal", "in");
  if (el.dataset.revealAutoDelay) {
    el.style.removeProperty("--d");
    delete el.dataset.revealAutoDelay;
  }
}

export function initScrollReveal(root: ParentNode = document): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach(settle);
    return () => {};
  }

  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName !== "opacity" || e.target !== e.currentTarget) return;
    const el = e.currentTarget as HTMLElement;
    el.removeEventListener("transitionend", onTransitionEnd);
    settle(el);
  };

  const observer = new IntersectionObserver(
    entries => {
      const entering = entries
        .filter(e => e.isIntersecting)
        .map(e => e.target as HTMLElement)
        .sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1
        );
      const delays = staggerDelays(entering.length);

      entering.forEach((el, i) => {
        observer.unobserve(el);
        if (!el.style.getPropertyValue("--d")) {
          el.style.setProperty("--d", `${delays[i]}ms`);
          el.dataset.revealAutoDelay = "1";
        }
        el.addEventListener("transitionend", onTransitionEnd);
        el.classList.add("in");
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach(el => observer.observe(el));

  return () => {
    observer.disconnect();
    elements.forEach(el =>
      el.removeEventListener("transitionend", onTransitionEnd)
    );
  };
}
