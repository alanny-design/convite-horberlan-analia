import { useEffect, useRef } from "react";

/**
 * Pétalas caindo + poeira dourada subindo, desenhadas em um único <canvas>.
 * Adaptado do efeito do projeto Gyan-akshita (js/particles.js), com a paleta
 * do convite (marfim, dourado e sálvia) e ajustes de desempenho:
 * - respeita prefers-reduced-motion (e reage se a preferência mudar);
 * - pausa o loop quando a aba fica oculta;
 * - no resize mantém as partículas existentes (a barra de endereço do
 *   celular dispara resize ao rolar, e recriar tudo causaria "saltos").
 *
 * Só aparece e começa a animar quando o envelope é aberto (evento "invite:open").
 */

type Tone = "ivory" | "gold" | "sage";

type Petal = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  drift: number;
  sway: number;
  phase: number;
  rotation: number;
  spin: number;
  tilt: number;
  tone: Tone;
};

type Dust = {
  x: number;
  y: number;
  r: number;
  a: number;
  speed: number;
  drift: number;
  phase: number;
};

// Paleta do template: --white/--cream, --gold-light, --olive-light
const TONES: Record<Tone, { fill: string; edge: string }> = {
  ivory: { fill: "253,250,242", edge: "184,151,90" },
  gold: { fill: "212,176,122", edge: "184,151,90" },
  sage: { fill: "168,184,152", edge: "122,138,106" },
};
const DUST_RGB = "184,151,90";

const rgba = (rgb: string, a: number) => `rgba(${rgb},${a.toFixed(3)})`;

export default function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let petals: Petal[] = [];
    let dust: Dust[] = [];
    let raf = 0;
    let last = 0;
    let opened = false;

    const isSmall = () => window.innerWidth < 600;
    const petalTarget = () => (isSmall() ? 16 : 26);
    const dustTarget = () => (isSmall() ? 16 : 26);

    function makePetal(initial: boolean): Petal {
      // A maioria nasce perto das bordas para não cobrir o texto central
      const fromEdge = Math.random() < 0.75;
      const left = Math.random() < 0.5;
      const x = fromEdge
        ? left
          ? -12 + Math.random() * width * 0.22
          : width * 0.78 + Math.random() * width * 0.22
        : Math.random() * width;
      const r = Math.random();
      return {
        x,
        y: initial ? Math.random() * height : -24,
        size: 5 + Math.random() * 5,
        alpha: 0.45 + Math.random() * 0.35,
        speed: 0.28 + Math.random() * 0.34,
        drift: (Math.random() - 0.5) * 0.18,
        sway: 22 + Math.random() * 38,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.008,
        tilt: 0.72 + Math.random() * 0.42,
        tone: r < 0.5 ? "ivory" : r < 0.8 ? "gold" : "sage",
      };
    }

    function makeDust(initial: boolean): Dust {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 8,
        r: 0.5 + Math.random() * 1.2,
        a: 0.18 + Math.random() * 0.35,
        speed: 0.08 + Math.random() * 0.22,
        drift: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Ajusta a quantidade sem recriar as partículas que já estão na tela
      while (petals.length < petalTarget()) petals.push(makePetal(true));
      petals.length = petalTarget();
      while (dust.length < dustTarget()) dust.push(makeDust(true));
      dust.length = dustTarget();
    }

    function drawPetal(p: Petal, time: number) {
      const tone = TONES[p.tone];
      const sway = Math.sin(time * 0.00038 + p.phase) * p.sway;
      const alpha = p.alpha * (0.75 + 0.25 * Math.sin(time * 0.0008 + p.phase));
      const s = p.size;

      ctx!.save();
      ctx!.translate(p.x + sway, p.y);
      ctx!.rotate(p.rotation + Math.sin(time * 0.00045 + p.phase) * 0.12);
      ctx!.scale(p.tilt, 1);

      const g = ctx!.createLinearGradient(-s, 0, s, s * 1.7);
      g.addColorStop(0, rgba(tone.fill, alpha * 0.6));
      g.addColorStop(0.55, rgba(tone.fill, alpha));
      g.addColorStop(1, rgba(tone.fill, alpha * 0.35));

      ctx!.beginPath();
      ctx!.moveTo(0, -s * 1.05);
      ctx!.bezierCurveTo(s * 0.92, -s * 0.58, s * 0.82, s * 0.72, 0, s * 1.22);
      ctx!.bezierCurveTo(
        -s * 0.82,
        s * 0.72,
        -s * 0.92,
        -s * 0.58,
        0,
        -s * 1.05
      );
      ctx!.fillStyle = g;
      ctx!.fill();
      // Contorno sutil: dá definição às pétalas claras sobre o fundo creme
      ctx!.strokeStyle = rgba(tone.edge, alpha * 0.35);
      ctx!.lineWidth = 0.6;
      ctx!.stroke();

      // Nervura central
      ctx!.beginPath();
      ctx!.moveTo(0, -s * 0.72);
      ctx!.quadraticCurveTo(s * 0.1, s * 0.2, 0, s * 0.88);
      ctx!.strokeStyle = rgba(tone.edge, alpha * 0.3);
      ctx!.lineWidth = 0.45;
      ctx!.stroke();
      ctx!.restore();
    }

    function frame(time: number) {
      const dt = Math.min((time - last) / 16.67, 2) || 1;
      last = time;
      ctx!.clearRect(0, 0, width, height);

      for (const p of dust) {
        const alpha = p.a * (0.72 + 0.28 * Math.sin(time * 0.001 + p.phase));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = rgba(DUST_RGB, alpha);
        ctx!.fill();
        p.y -= p.speed * dt;
        p.x += (Math.sin(time * 0.00045 + p.phase) * 0.18 + p.drift) * dt;
        if (p.y < -8 || p.x < -10 || p.x > width + 10)
          Object.assign(p, makeDust(false));
      }

      for (const p of petals) {
        p.y += p.speed * dt;
        p.x += (Math.sin(time * 0.00042 + p.phase) * 0.16 + p.drift) * dt;
        p.rotation += p.spin * dt;
        if (p.y > height + 24 || p.x < -60 || p.x > width + 60)
          Object.assign(p, makePetal(false));
        drawPetal(p, time);
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!opened || raf || reducedMotion.matches || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onMotionChange() {
      if (reducedMotion.matches) {
        stop();
        ctx!.clearRect(0, 0, width, height);
      } else start();
    }

    function onInviteOpen() {
      opened = true;
      canvas!.classList.add("is-visible");
      start();
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    window.addEventListener("invite:open", onInviteOpen);
    if ((window as { __envelopeOpened?: boolean }).__envelopeOpened)
      onInviteOpen();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
      window.removeEventListener("invite:open", onInviteOpen);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="falling-petals" aria-hidden="true" />
  );
}
