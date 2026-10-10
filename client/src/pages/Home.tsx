import { useEffect } from "react";
import FallingPetals from "@/components/FallingPetals";
import { initScrollReveal } from "@/lib/reveal";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type HomeProps = {
  /** Nome do convidado quando acessado por /convite/:slug */
  guestName?: string;
};

const INVITE_CSS = `:root {
      --olive:        #4a5240;
      --olive-mid:    #5c6650;
      --olive-light:  #7a8a6a;
      --cream:        #f4efe5;
      --white:        #fdfcf9;
      --gold:         #b8975a;
      --gold-light:   #d4b07a;
      --gold-pale:    #e8d4a8;
      --text-mid:     #4a5240;
      /* easing padrão das animações (expo-out suave) */
      --ease:         cubic-bezier(.22, .8, .24, 1);
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }

    body {
    /* Ocultar scrollbar globalmente */
    * { scrollbar-width: none; -ms-overflow-style: none; }
    *::-webkit-scrollbar { display: none; }

      font-family: 'Lato', sans-serif;
      background: var(--cream);
    }

    /* ─── Pétalas caindo (canvas — FallingPetals.tsx) ─── */
    .falling-petals {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 60; /* acima do convite (50), abaixo do envelope (100) e do modal */
      opacity: 0;
      transition: opacity 1.8s ease;
    }
    .falling-petals.is-visible { opacity: 0.9; }
    @media (max-width: 600px) {
      .falling-petals.is-visible { opacity: 0.8; }
    }

    /* ════════════════════════════════════
       ENVELOPE SCREEN — FULLSCREEN
       Sequência (inspirada em iurie-anamaria.github.io):
       selo racha → aba sobe → abas laterais/inferior saem → carta sobe → toque → convite
    ════════════════════════════════════ */
    #envelope-screen {
      position: fixed;
      inset: 0;
      z-index: 100;
      cursor: pointer;
      overflow: hidden;
      background: #353b2d; /* interior do envelope, visível quando as abas saem */
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      /* saída: dissolve com leve zoom e blur (classe .leaving via JS) */
      transition: opacity 1.1s ease, transform 1.1s ease, filter 1.1s ease;
      will-change: transform, opacity;
      --paper-noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    /* ─── Corpo do envelope: a mesma imagem recortada (clip-path via JS) em 4 camadas ─── */
    .env-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .env-layer img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .env-back { z-index: 1; }
    /* sombra no pai: o clip-path no filho cortaria a própria sombra */
    .env-side, .env-bottom {
      filter: drop-shadow(0 1px 1.5px rgba(20,24,16,.35)) drop-shadow(0 8px 16px rgba(20,24,16,.18));
      will-change: transform;
    }
    .env-side { z-index: 3; }
    .env-bottom { z-index: 4; }

    /* ─── Aba superior (triângulo com o selo) ─── */
    .env-flap-wrap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;
      overflow: visible;
      transform-origin: top center;
      will-change: transform;
      z-index: 5;
    }
    .env-flap-img, .seal-half img {
      pointer-events: none;
    }
    .env-flap-img {
      position: relative;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;
      display: block;
      max-height: 95vh;
      object-fit: contain;
      object-position: top center;
    }

    /* ─── Metades do selo (posições e recortes calculados via JS) ─── */
    .seal-half {
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      z-index: 6;
      pointer-events: none;
      transform-origin: var(--seal-x) var(--seal-y);
      -webkit-mask-image: radial-gradient(circle var(--seal-r) at var(--seal-x) var(--seal-y), #000 calc(var(--seal-r) - 0.5px), transparent var(--seal-r));
              mask-image: radial-gradient(circle var(--seal-r) at var(--seal-x) var(--seal-y), #000 calc(var(--seal-r) - 0.5px), transparent var(--seal-r));
    }
    .seal-half img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: top center;
      display: block;
    }

    /* ─── A carta que sai do envelope ─── */
    .env-letter {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: grid;
      place-items: center;
      padding: 24px;
      pointer-events: none;
    }
    .env-letter-paper {
      position: relative;
      width: min(80vw, 340px);
      padding: 38px 26px 32px;
      text-align: center;
      color: var(--olive);
      background-color: #fbf8f1;
      background-image: var(--paper-noise);
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0,0,0,.18), 0 22px 48px rgba(0,0,0,.38);
      opacity: 0;
      transform: translateY(24vh) scale(.94);
      transition: transform 1.4s var(--ease), opacity .5s ease;
    }
    .env-letter-paper::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1px solid rgba(184,151,90,.55);
      pointer-events: none;
    }
    .env-letter-paper > * {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(3px);
    }
    .env-letter-mono {
      width: 40px;
      height: 58px;
      margin: 0 auto 14px;
      background: var(--olive);
      -webkit-mask: url('/manus-storage/monograma_ha_arco2_168a90a4.webp') center / contain no-repeat;
              mask: url('/manus-storage/monograma_ha_arco2_168a90a4.webp') center / contain no-repeat;
    }
    .env-letter-for {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 19px;
      line-height: 1.35;
      color: #5c6650;
      text-wrap: balance;
    }
    .env-letter-names {
      font-family: 'Imperial Script', cursive;
      font-size: 46px;
      line-height: 0.95;
      color: var(--olive);
      margin: 12px 0 8px;
    }
    .env-letter-amp {
      display: block;
      font-size: 30px;
      line-height: 1.1;
      color: var(--gold);
    }
    .env-letter-line {
      display: block;
      width: 44px;
      height: 1px;
      margin: 4px auto 14px;
      background: var(--gold);
    }
    .env-letter-date, .env-letter-place {
      font-family: 'Cinzel', serif;
      font-size: 10.5px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      line-height: 1.7;
    }
    .env-letter-place { color: #7a8a6a; margin-top: 2px; }
    .env-letter-hint {
      position: absolute;
      left: 0;
      right: 0;
      bottom: max(6%, 28px);
      text-align: center;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      color: rgba(245,240,232,.85);
      opacity: 0;
      transition: opacity 1s ease;
    }

    /* Overlay vignette */
    .env-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 90% 90% at 50% 50%,
        transparent 55%,
        rgba(0,0,0,0.15) 100%);
      pointer-events: none;
      z-index: 7;
    }

    /* ─── "TOQUE NO SELO" (posicionado via JS sobre o selo) ─── */
    .tap-hint-svg {
      position: relative;
      pointer-events: none;
      animation: pulse-hint 2.2s ease-in-out infinite;
      transition: opacity 0.4s ease;
      width: 210px;
      height: 210px;
      display: block;
    }
    .tap-hint-wrap {
      position: fixed;
      left: 50%;
      top: 86vh;
      transform: translate(-50%, -50%);
      width: 210px;
      height: 210px;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.4s ease;
    }
    @keyframes pulse-hint {
      0%, 100% { opacity: 0.55; scale: 1; }
      50%       { opacity: 1;   scale: 1.04; }
    }

    /* ─── SEQUÊNCIA DE ABERTURA ─── */
    /* 0ms: o selo racha em duas metades */
    #envelope-screen.opening .tap-hint-wrap { opacity: 0; }
    #envelope-screen.opening .env-flap-img {
      -webkit-mask-image: radial-gradient(circle var(--seal-r) at var(--seal-x) var(--seal-y), transparent calc(var(--seal-r) - 0.5px), #000 var(--seal-r));
              mask-image: radial-gradient(circle var(--seal-r) at var(--seal-x) var(--seal-y), transparent calc(var(--seal-r) - 0.5px), #000 var(--seal-r));
    }
    #envelope-screen.opening .seal-half { display: block; }
    #envelope-screen.opening .seal-half.l { animation: sealHalfL 1s cubic-bezier(.3, 0, .3, 1) forwards; }
    #envelope-screen.opening .seal-half.r { animation: sealHalfR 1s cubic-bezier(.3, 0, .3, 1) forwards; }
    /* 350ms: a aba superior gira para cima */
    #envelope-screen.opening .env-flap-wrap { animation: flapUp 1.1s .35s cubic-bezier(.5, 0, .3, 1) forwards; }
    /* 1400ms: abas laterais e inferior saem */
    #envelope-screen.opening .env-side.l { animation: slideL 1.2s 1.4s cubic-bezier(.6, 0, .3, 1) forwards; }
    #envelope-screen.opening .env-side.r { animation: slideR 1.2s 1.4s cubic-bezier(.6, 0, .3, 1) forwards; }
    #envelope-screen.opening .env-bottom { animation: slideB 1.2s 1.5s cubic-bezier(.6, 0, .3, 1) forwards; }
    /* 800ms (classe .letter-out): a carta sobe de dentro do envelope */
    #envelope-screen.letter-out .env-letter-paper { opacity: 1; transform: none; }
    #envelope-screen.letter-out .env-letter-paper > * {
      animation: letterInk 1.1s var(--d, 0s) ease forwards;
    }
    #envelope-screen.letter-out .env-letter-names {
      clip-path: inset(-20% 100% -20% -5%);
      animation: letterInk .01s var(--d) forwards, letterWrite 1.5s var(--d) cubic-bezier(.5, 0, .3, 1) forwards;
    }
    #envelope-screen.letter-ready .env-letter-hint {
      opacity: .85;
      animation: breathe 2.4s ease-in-out infinite;
    }
    /* Saída: o envelope se dissolve enquanto o convite surge por baixo */
    #envelope-screen.leaving {
      opacity: 0;
      transform: scale(1.04);
      filter: blur(4px);
      pointer-events: none;
    }

    @keyframes sealHalfL { 30% { transform: translateX(-6px) rotate(-5deg); opacity: 1; } 100% { transform: translate(-60px, 30px) rotate(-24deg); opacity: 0; } }
    @keyframes sealHalfR { 30% { transform: translateX(6px) rotate(5deg); opacity: 1; } 100% { transform: translate(60px, 30px) rotate(24deg); opacity: 0; } }
    @keyframes flapUp { 0% { transform: perspective(1200px) rotateX(0); } 60% { opacity: 1; } 100% { transform: perspective(1200px) rotateX(-165deg); opacity: 0; } }
    @keyframes slideL { to { transform: translateX(-105%); } }
    @keyframes slideR { to { transform: translateX(105%); } }
    @keyframes slideB { to { transform: translateY(105%); } }
    @keyframes letterInk { to { opacity: 1; transform: none; filter: none; } }
    @keyframes letterWrite { to { clip-path: inset(-20% -5% -20% -5%); } }
    @keyframes breathe { 50% { opacity: .35; } }

    /* ════════════════════════════════════
       INVITATION CARD
    ════════════════════════════════════ */
    #invite-wrapper {
      position: fixed;
      inset: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      background: var(--cream);
      /* Inicia invisível e levemente abaixo; surge sob o envelope que se dissolve */
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
      transition:
        opacity 0.9s var(--ease),
        transform 1.1s var(--ease);
    }
    #invite-wrapper::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 70% 50% at 15% 15%, rgba(74,82,64,0.07) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 85% 85%, rgba(184,151,90,0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    /* Quando visível: assenta na posição final */
    #invite-wrapper.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    #invitation-card {
      width: 100%;
      max-width: 100%;
      background: var(--cream);
      box-shadow:
        0 32px 80px rgba(74,82,64,0.18),
        0 8px 28px rgba(74,82,64,0.12);
      position: relative;
      z-index: 1;
      /* Sem animação extra no card — o wrapper já anima */
      opacity: 1;
      transform: none;
    }

    /* ════════════════════════════════════
       NEW INVITE PAGE — REFERENCE STYLE
    ════════════════════════════════════ */

    /* Scroll reveal (client/src/lib/reveal.ts adiciona .in ao entrar na tela).
       O id aumenta a especificidade para não perder para transições próprias
       de botões (.cal-save-btn, .map-btn); o JS remove .reveal ao terminar. */
    #invitation-card .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition:
        opacity 1s var(--ease) var(--d, 0s),
        transform 1s var(--ease) var(--d, 0s),
        filter 1s var(--ease) var(--d, 0s);
    }
    #invitation-card .reveal[data-reveal="ink"] { filter: blur(3px); }
    #invitation-card .reveal.in { opacity: 1; transform: none; filter: none; }

    /* ─── HERO SECTION ─── */
    .hero-section {
      position: relative;
      z-index: 2; /* rosas da base passam por cima da seção seguinte */
      --torn-h: clamp(36px, 16vw, 90px);
      --flowers-w: min(100vw, 500px);
      background: var(--olive); /* reserva enquanto a foto (.hero-bg) carrega */
      min-height: 520px;
      display: flex;
      flex-direction: column;
      align-items: center;
     justify-content: center;
     text-align: center;
     overflow: visible;
      padding: 5px 28px 90px;
     min-height: 580px;
    }
    /* Foto do casal: camada própria para o zoom de entrada não vazar do hero */
    .hero-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;
    }
    .hero-bg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 47% 30%;
      display: block;
      transform: scale(1.12);
      transition: transform 6s cubic-bezier(.2, .6, .2, 1);
      will-change: transform;
    }
    /* Véu oliva para manter o texto legível */
    .hero-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(175deg, rgba(74,82,64,0.55) 0%, rgba(58,66,50,0.45) 55%, rgba(46,54,40,0.75) 100%);
    }

    /* ─── Entrada do hero (coreografia após abrir o envelope) ─── */
    .hero-flowers-tl, .hero-monogram-center, .hero-date-label, .hero-date-value {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 1.1s var(--ease), transform 1.1s var(--ease), filter 1.1s var(--ease);
    }
    .hero-flowers-tl { transform: translate(-14px, -14px); transition-delay: .1s; }
    .hero-monogram-center { transition-delay: .2s; }
    .hero-date-label { filter: blur(3px); transition-delay: .25s; }
    .hero-date-value { transition-delay: .35s; }
    /* Nomes "escritos à mão": wipe da esquerda para a direita */
    .hero-name-1, .hero-name-2 {
      clip-path: inset(-20% 100% -20% -5%);
      transition: clip-path 1.4s cubic-bezier(.5, 0, .3, 1);
    }
    .hero-name-1 { transition-delay: .5s; }
    .hero-name-2 { transition-delay: 1.1s; }
    #invite-wrapper.visible .hero-bg img { transform: scale(1.02); }
    #invite-wrapper.visible .hero-flowers-tl,
    #invite-wrapper.visible .hero-monogram-center,
    #invite-wrapper.visible .hero-date-label,
    #invite-wrapper.visible .hero-date-value {
      opacity: 1;
      transform: none;
      filter: none;
    }
    #invite-wrapper.visible .hero-name-1,
    #invite-wrapper.visible .hero-name-2 {
      clip-path: inset(-20% -5% -20% -5%);
    }

    .hero-flowers-tl {
      position: absolute;
      top: -87px; left: -90px;
      width: 65vw;
      max-width: 320px;
      pointer-events: none;
      z-index: 2;
    }
    .hero-flowers-br {
      position: absolute;
      bottom: -20px; right: -20px;
      width: 65vw;
      max-width: 320px;
      pointer-events: none;
      z-index: 2;
      transform: rotate(180deg);
    }
    .hero-flowers-tr {
      position: absolute;
      top: -30px; right: -30px;
      width: 65vw;
      max-width: 320px;
      pointer-events: none;
      z-index: 2;
      transform: scaleX(-1);
    }
    .hero-flowers-mr {
      position: absolute;
      top: 67%;
      right: -20px;
      transform: translateY(-50%);
      width: 28vw;
      max-width: 130px;
      pointer-events: none;
      z-index: 2;
      opacity: 0.85;
      filter: blur(3px);
      mix-blend-mode: screen;
    }
    .hero-date-tag {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 4px;
      color: rgba(245,240,232,0.65);
      text-transform: uppercase;
      margin-bottom: 18px;
      position: relative; z-index: 3;
     display: flex;
     flex-direction: column;
     align-items: center;
      gap: 1px;
     width: 100%;
     text-align: center;
     text-shadow: 0 1px 10px rgba(0,0,0,0.55);
   }
   .hero-date-label {
     font-family: 'Cinzel', serif;
     font-size: 8px;
      letter-spacing: 3px;
     color: rgba(245,240,232,0.55);
     text-transform: uppercase;
   }
.hero-date-value {
     font-family: 'MonteCarlo', cursive;
     font-size: 34px;
     letter-spacing: 2px;
     color: rgba(245,240,232,0.95);
     font-weight: 400;
     text-transform: none;
      margin-bottom: 12px;
     position: relative; z-index: 3;
   }
    .hero-names {
      position: relative; z-index: 3;
      margin-bottom: 12px;
      width: 100%;
      text-align: center;
    }
    .hero-name-1, .hero-name-2 {
      font-family: 'Imperial Script', cursive;
      color: #fff;
      line-height: 0.9;
      text-shadow: 0 2px 20px rgba(0,0,0,0.35);
      display: block;
    }
    .hero-name-1 { font-size: 72px; }
    .hero-name-2 { font-size: 72px; }
    .hero-ampersand {
      font-family: 'Imperial Script', cursive;
      font-size: 44px;
      color: var(--gold-light);
      display: block;
      line-height: 1;
    }
    .hero-invite-text {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 16px;
      color: rgba(245,240,232,0.82);
      line-height: 1.6;
      max-width: 280px;
      margin: 16px auto 0;
      position: relative; z-index: 3;
      text-align: center;
    }
    .hero-verse {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 12px;
      color: rgba(245,240,232,0.5);
      line-height: 1.7;
      max-width: 260px;
      margin: 12px auto 0;
      position: relative; z-index: 3;
    }
    .hero-monogram {
      position: relative; z-index: 3;
      margin-bottom: 16px;
      width: 100%;
      display: flex;
      justify-content: center; 
    }
   .hero-monogram img {
     width: 62px; height: auto;
     filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
   }
   .hero-monogram-tr {
     position: absolute; top: 16px; right: 14px;
     z-index: 5;
   }
   .hero-monogram-tr img {
     width: 44px; height: auto;
     filter: drop-shadow(0 2px 8px rgba(0,0,0,0.35));
     opacity: 0.92;
   }
    .hero-monogram-center {
      display: flex; justify-content: center;
      width: 100%; margin-bottom: 10px;
    }
    .hero-monogram-center img {
      width: 52px; height: auto;
      filter: drop-shadow(0 2px 10px rgba(0,0,0,0.4));
      opacity: 0.95;
    }
    .hero-monogram svg, .footer-monogram svg {
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.35));
    }
    /* Torn paper edge at bottom of hero */
    .hero-torn {
      position: absolute;
      bottom: -2px; left: 0;
      display: block;
      width: 100%;
      /* mantém a proporção do viewBox (375x60) em qualquer largura */
      height: var(--torn-h);
      z-index: 1;
      pointer-events: none;
    }
    /* Rosas da base ancoradas nas ondas do rasgo.
       A faixa densa da imagem termina a ~89% da altura (altura = 56,2% da largura),
       e a linha média da onda fica a ~55% da altura do rasgo, medido de baixo. */
    .hero-flowers-base {
      position: absolute;
      left: 50%;
      bottom: calc(var(--torn-h) * 0.15 - 2px - var(--flowers-w) * 0.562 * 0.11);
      transform: translateX(-50%) translateY(16px);
      width: var(--flowers-w);
      height: auto;
      z-index: 4;
      pointer-events: none;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
      opacity: 0;
      transition: opacity 1.2s var(--ease) .3s, transform 1.2s var(--ease) .3s;
    }
    #invite-wrapper.visible .hero-flowers-base {
      opacity: 1;
      transform: translateX(-50%);
    }

    /* ─── DEAR GUESTS SECTION ─── */
    .dear-section {
      background: var(--cream);
      padding: 48px 32px 72px;
      text-align: center;
      position: relative;
    }
    .dear-title {
      font-family: 'Imperial Script', cursive;
      font-size: 36px;
      letter-spacing: 1px;
      color: var(--olive);
      text-transform: none;
      margin-bottom: 16px;
    }
    /* Data e horário logo abaixo do título */
    .dear-when {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin: 0 auto 22px;
    }
    .dear-when-date {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: var(--olive);
      line-height: 1.6;
      text-wrap: balance;
      max-width: 280px;
    }
    .dear-when-time {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px;
      font-weight: 600;
      color: var(--olive);
      line-height: 1;
    }
    .dear-when-time::before,
    .dear-when-time::after {
      content: '';
      width: 28px;
      height: 1px;
      background: var(--gold);
    }
    .dear-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      color: #555;
      line-height: 1.8;
      max-width: 300px;
      margin: 0 auto 28px;
    }
    .dear-date-big {
      font-family: 'Cinzel', serif;
      font-size: 46px;
      font-weight: 600;
      color: var(--olive);
      letter-spacing: 2px;
      line-height: 1;
      margin-bottom: 10px;
    }
    .dear-date-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 15px;
      color: #888;
      margin-bottom: 8px;
    }
    /* ─── CALENDÁRIO ─── */
    .dear-calendar {
      background: #fff;
      border: 1.5px solid rgba(90,100,70,0.15);
      border-radius: 16px;
      padding: 16px 18px 12px;
      max-width: 300px;
      margin: 0 auto 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    }
    .cal-header {
      display: flex;
      justify-content: center;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 12px;
    }
    .cal-month {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--olive);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .cal-year {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      color: #aaa;
      letter-spacing: 1px;
    }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .cal-day-name {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      color: #aaa;
      text-align: center;
      padding: 2px 0 6px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .cal-day {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13px;
      color: #555;
      text-align: center;
      padding: 4px 2px;
      border-radius: 50%;
      line-height: 1.4;
      min-width: 28px;
      min-height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cal-day.empty { visibility: hidden; }
    .cal-day.cal-highlight {
      position: relative;
      flex-direction: column;
      gap: 0;
    }
    .cal-heart {
      font-size: 28px;
      color: var(--olive);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.18;
      line-height: 1;
    }
    .cal-num {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--olive);
      position: relative;
      z-index: 1;
    }
    .cal-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 13px;
      color: #888;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .cal-save-btn {
      background: var(--olive);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px 28px;
      width: 100%;
      max-width: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(74,82,64,0.25);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .cal-save-btn:active {
      transform: scale(0.97);
      box-shadow: 0 2px 8px rgba(74,82,64,0.2);
    }
    .dear-flowers-right {
      display: none;
    }
    .dear-flowers-deco {
      width: 100%;
      max-height: 80px;
      object-fit: contain;
      opacity: 0.35;
      margin-bottom: 16px;
      pointer-events: none;
    }

    /* ─── DIVIDER GOLD ─── */
    .gold-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-light), transparent);
      margin: 0 32px;
    }

    /* ─── LOCATION SECTION ─── */
    .location-section {
      background: var(--cream);
      /* espaço para a metade inferior das rosas que ficam sobre a emenda */
      padding: calc(min(100vw, 500px) * 0.19 + 32px) 0px 52px;
      text-align: center;
      position: relative;
      overflow: visible;
    }
    .location-section .section-title { color: var(--olive); }
    .location-section .section-subtitle { color: var(--olive-light); }
    .location-flowers-bl {
      position: absolute;
      bottom: -10px; left: -14px;
      width: 55vw;
      max-width: 260px;
      pointer-events: none;
      transform: scaleY(-1);
      z-index: 2;
    }
    .location-flowers-tr {
      position: absolute;
      top: -10px; right: -14px;
      width: 55vw;
      max-width: 260px;
      pointer-events: none;
      z-index: 2;
      transform: scaleX(-1);
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      letter-spacing: 4px;
      color: #fff;
      text-transform: uppercase;
      margin-bottom: 6px;
      position: relative; z-index: 2;
    }
    .section-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 13px;
      color: rgba(245,240,232,0.55);
      letter-spacing: 1px;
      margin-bottom: 28px;
      position: relative; z-index: 2;
    }
    .location-name-big {
      font-family: 'Imperial Script', cursive;
      font-size: 38px;
      color: var(--olive);
      margin-bottom: 12px;
      position: relative; z-index: 2;
    }
    .location-photo-wrap {
      width: 100%;
      max-width: 340px;
      margin: 0 auto 20px;
      position: relative;
      z-index: 2;
      border-radius: 12px;
      overflow: hidden;
    }
    .location-photo {
      width: 100%;
      height: 200px;
      object-fit: cover;
      object-position: center 40%;
      display: block;
    }
    .location-address {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: #6b6558;
      line-height: 1.8;
      position: relative; z-index: 2;
    }
    .location-address strong {
      color: var(--olive);
      font-weight: 600;
    }
    .map-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 22px;
      margin-left: auto;
      margin-right: auto;
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      background: var(--olive);
      color: #fff;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative; z-index: 2;
      width: 100%;
      max-width: 300px;
    }
    .map-btn:hover { background: #3a4232; }
    .map-btn:active { transform: scale(0.97); }

    /* ─── DRESS CODE SECTION ─── */
    .dresscode-section {
      background: var(--white);
      padding: 52px 0 0;
      text-align: center;
      position: relative;
    }
    .dresscode-section > *:not(.dresscode-outfits-img) {
      padding-left: 32px;
      padding-right: 32px;
    }
    .dresscode-flowers-sprig {
      display: block;
      margin: 0 auto 18px;
      width: 65%;
      max-width: 280px;
      opacity: 0.6;
      pointer-events: none;
    }
    .dresscode-section .section-title {
      color: var(--olive);
      font-size: 30px;
      letter-spacing: 5px;
      line-height: 1.25;
      margin-bottom: 8px;
    }
    .dresscode-section .section-subtitle { color: var(--olive-light); }
    .dresscode-outfits-img {
      display: block;
      width: 100%;
      height: auto;
      margin: 20px 0 0;
      border-radius: 0;
    }
    .dresscode-img-wrap {
      display: flex;
      justify-content: center;
      margin: 20px 0 4px;
    }
    .dresscode-img-wrap img {
      width: 160px;
      height: auto;
      opacity: 0.85;
    }
    .dresscode-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: #666;
      line-height: 1.8;
      max-width: 290px;
      margin: 0 auto 28px;
    }
    .color-palette {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-top: 8px;
    }
    .palette-dot {
      width: 44px; height: 44px;
      border-radius: 50%;
      box-shadow: 0 3px 12px rgba(0,0,0,0.12);
    }
    .palette-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
    }
    .palette-name {
      font-family: 'Cinzel', serif;
      font-size: 7px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--olive-light);
      text-align: center;
      max-width: 52px;
      line-height: 1.4;
    }
    .dress-icons {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 24px;
    }
    .dress-icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .dress-icon-item svg {
      width: 52px; height: 52px;
      stroke: var(--olive);
      fill: none;
      stroke-width: 1.2;
    }
    .dress-icon-label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 2px;
      color: var(--olive-light);
      text-transform: uppercase;
    }

    /* ─── Rosas sobre a emenda entre seções ───
       Mesma arte das rosas do hero: largura limitada e o centro do buquê
       (~56% da altura; altura = 56,2% da largura) exatamente sobre a emenda. */
    .flowers-seam {
      --seam-w: min(100vw, 500px);
      position: absolute;
      left: 50%;
      width: var(--seam-w);
      transform: translate(-50%, -56%);
      line-height: 0;
      pointer-events: none;
      z-index: 3;
    }
    .flowers-seam img {
      width: 100%;
      height: auto;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
    }

    /* Em telas mais largas que a arte, suaviza o corte reto nas laterais */
    @media (min-width: 520px) {
      .flowers-seam img {
        -webkit-mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
                mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
      }
    }

    /* ─── DETAILS SECTION ─── */
    .details-section {
      /* faixa de transição de cor no início e no fim */
      --fade: clamp(96px, 18vw, 180px);
      /* parte das rosas que invade a seção, abaixo/acima do centro do buquê */
      --flower-clear: calc(min(100vw, 500px) * 0.19);
      background:
        linear-gradient(to bottom, rgba(244,239,229,1.000) 0%, rgba(244,239,229,0.976) 10%, rgba(244,239,229,0.905) 20%, rgba(244,239,229,0.794) 30%, rgba(244,239,229,0.655) 40%, rgba(244,239,229,0.500) 50%, rgba(244,239,229,0.345) 60%, rgba(244,239,229,0.206) 70%, rgba(244,239,229,0.095) 80%, rgba(244,239,229,0.024) 90%, rgba(244,239,229,0.000) 100%) top / 100% var(--fade) no-repeat,
        linear-gradient(to bottom, rgba(245,240,232,0.000) 0%, rgba(245,240,232,0.024) 10%, rgba(245,240,232,0.095) 20%, rgba(245,240,232,0.206) 30%, rgba(245,240,232,0.345) 40%, rgba(245,240,232,0.500) 50%, rgba(245,240,232,0.655) 60%, rgba(245,240,232,0.794) 70%, rgba(245,240,232,0.905) 80%, rgba(245,240,232,0.976) 90%, rgba(245,240,232,1.000) 100%) bottom / 100% var(--fade) no-repeat,
        linear-gradient(170deg, #3a4232 0%, var(--olive) 100%);
      padding: calc(max(var(--fade), var(--fade) / 2 + var(--flower-clear)) + 28px) 48px;
      text-align: center;
      position: relative;
      overflow: visible;
    }
    .details-section > .flowers-seam.top { top: calc(var(--fade) / 2); }
    .details-section > .flowers-seam.bottom { top: calc(100% - var(--fade) / 2); }
    .location-section > .flowers-seam.top { top: 0; }
    .details-flowers-tr {
      position: absolute;
      top: -20px; right: -20px;
      width: 60vw;
      max-width: 260px;
      pointer-events: none;
      transform: scaleX(-1) rotate(-15deg);
      transform-origin: top right;
      z-index: 2;
    }
    .details-flowers-bl {
      position: absolute;
      bottom: -20px; left: -20px;
      width: 60vw;
      max-width: 260px;
      pointer-events: none;
      transform: scaleY(-1) rotate(-15deg);
      transform-origin: bottom left;
      z-index: 2;
    }
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      text-align: left;
      margin-bottom: 20px;
      position: relative; z-index: 2;
    }
    .detail-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--gold-light);
      flex-shrink: 0;
      margin-top: 6px;
    }
    .detail-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: rgba(245,240,232,0.85);
      line-height: 1.7;
    }

    /* ─── CONFIRM SECTION ─── */
    .confirm-section {
      background: var(--white);
      padding: 52px 32px 44px;
      text-align: center;
      position: relative;
    }
    .confirm-section .section-title { color: var(--olive); }
    .confirm-section .section-subtitle { color: var(--olive-light); }
    .confirm-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: #666;
      line-height: 1.8;
      max-width: 290px;
      margin: 0 auto 28px;
    }
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 12px;
    }
    .action-btn:active { transform: scale(0.97); }
    .action-btn.primary {
      background: var(--olive);
      color: var(--cream);
      border: none;
      box-shadow: 0 4px 18px rgba(74,82,64,0.28);
    }
    .action-btn.primary:hover { background: var(--olive-mid); }
    .action-btn.outline {
      background: transparent;
      color: var(--olive);
      border: 1.5px solid rgba(74,82,64,0.35);
    }
    .action-btn.outline:hover { border-color: var(--olive); background: rgba(74,82,64,0.05); }

    /* ─── FOOTER SECTION ─── */
    /* ─── CALENDAR MODAL ─── */
    .cal-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 9999;
      align-items: flex-end;
      justify-content: center;
    }
    .cal-modal-overlay.open {
      display: flex;
    }
    .cal-modal {
      background: var(--white);
      border-radius: 20px 20px 0 0;
      padding: 28px 24px 36px;
      width: 100%;
      max-width: 480px;
      animation: slideUp 0.35s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .cal-modal-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 3px;
      color: var(--olive);
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 6px;
    }
    .cal-modal-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 14px;
      color: #999;
      text-align: center;
      margin-bottom: 22px;
    }
    .cal-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 15px 18px;
      border-radius: 12px;
      border: 1.5px solid rgba(74,82,64,0.18);
      margin-bottom: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s ease;
      background: transparent;
      width: 100%;
    }
    .cal-option:hover { background: rgba(74,82,64,0.05); border-color: var(--olive); }
    .cal-option:active { transform: scale(0.98); }
    .cal-option-icon { font-size: 22px; flex-shrink: 0; }
    .cal-option-label {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 1.5px;
      color: var(--olive);
      text-transform: uppercase;
    }
    .cal-close {
      display: block;
      width: 100%;
      padding: 13px;
      margin-top: 6px;
      border: none;
      background: none;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 2px;
      color: #aaa;
      text-transform: uppercase;
      cursor: pointer;
      text-align: center;
    }

    .footer-section {
      background-image: url('/manus-storage/nos.jpeg');
      background-size: cover;
      background-position: center top;
      padding: 72px 32px 72px;
      text-align: center;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .footer-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(30, 36, 24, 0.55);
      z-index: 1;
    }
    .footer-section > * {
      position: relative;
      z-index: 2;
    }
    .footer-monogram img {
      width: 55px; height: auto;
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
      margin-bottom: 16px;
    }
    .footer-sig {
      font-family: 'Imperial Script', cursive;
      font-size: 34px;
      color: #fff;
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
      margin-bottom: 8px;
    }
    .footer-date-small {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 4px;
      color: rgba(245,240,232,0.7);
    }
    .footer-verse {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 12px;
      color: rgba(245,240,232,0.5);
      line-height: 1.7;
      max-width: 240px;
      margin: 16px auto 0;
      position: relative; z-index: 2;
    }

    /* ─── COUNTDOWN ─── */
    .countdown-section {
      background: #ffffff;
      padding: 72px 24px 48px;
      text-align: center;
      position: relative;
    }
    .countdown-sprig {
      display: block;
      margin: 0 auto 14px;
      opacity: 0.55;
    }
    .countdown-heading {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 4px;
      color: var(--olive);
      text-transform: uppercase;
      margin-bottom: 4px;
      text-align: center;
    }
    .countdown-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 15px;
      color: var(--olive-light);
      margin-bottom: 22px;
      letter-spacing: 1px;
    }
    .countdown-grid {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      justify-content: center;
      align-items: center;
      gap: 0;
      margin-top: 0;
    }
    .countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 68px;
    }
    .countdown-num {
      font-family: 'Cinzel', serif;
      font-size: 40px;
      font-weight: 700;
      color: var(--olive);
      line-height: 1;
      letter-spacing: 1px;
      font-variant-numeric: tabular-nums;
      transition: opacity 0.18s ease, transform 0.18s ease;
      display: inline-block;
    }
    .countdown-num.flip-out {
      opacity: 0;
      transform: translateY(-8px) scale(0.92);
    }
    .countdown-num.flip-in {
      opacity: 0;
      transform: translateY(8px) scale(0.92);
    }
    .countdown-label {
      font-family: 'Cinzel', serif;
      font-size: 6px;
      letter-spacing: 1.5px;
      color: var(--olive-light);
      text-transform: uppercase;
      margin-top: 6px;
      white-space: nowrap;
    }
    .countdown-sep {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--olive);
      opacity: 0.35;
      line-height: 1;
      margin: 0 2px;
      padding-bottom: 14px;
      align-self: flex-end;
    }

    /* ─── FORM ─── */
    .form-section {
      background: var(--cream);
      padding: 52px 28px 52px;
      text-align: center;
      position: relative;
    }
    .form-flowers-tr {
      position: absolute;
      top: -10px; right: -14px;
      width: 44vw;
      max-width: 190px;
      pointer-events: none;
      transform: scaleX(-1);
      z-index: 2;
    }
    .form-flowers-bl {
      position: absolute;
      bottom: -10px; left: -14px;
      width: 44vw;
      max-width: 190px;
      pointer-events: none;
      transform: scaleY(-1);
      z-index: 2;
    }
    .form-card {
      background: var(--white);
      border: 1px solid rgba(74,82,64,0.12);
      border-radius: 16px;
      padding: 32px 24px 28px;
      max-width: 340px;
      margin: 0 auto;
      box-shadow: 0 6px 32px rgba(74,82,64,0.10);
      position: relative;
      z-index: 3;
    }
    .form-divider {
      width: 40px;
      height: 1px;
      background: rgba(74,82,64,0.2);
      margin: 0 auto 20px;
    }
    .action-btns-wrap {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 340px;
      margin: 20px auto 0;
      position: relative;
      z-index: 3;
    }
    .action-btns-label {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      letter-spacing: 3px;
      color: var(--olive-light);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .form-section .section-title { color: var(--olive); }
    .form-section .section-subtitle { color: var(--olive-light); }
    .invite-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 24px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }
    .form-label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 2.5px;
      color: var(--olive-light);
      text-transform: uppercase;
    }
    .form-input, .form-select {
      width: 100%;
      padding: 14px 16px;
      border: 1.5px solid rgba(74,82,64,0.25);
      border-radius: 10px;
      background: var(--white);
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      color: var(--olive);
      outline: none;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      -webkit-appearance: none;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--olive);
      box-shadow: 0 0 0 3px rgba(74,82,64,0.1);
    }
    .form-input::placeholder { color: rgba(74,82,64,0.35); }
    .form-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 24px;
      border-radius: 8px;
      background: var(--olive);
      color: var(--cream);
      border: none;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 18px rgba(74,82,64,0.28);
      margin-top: 6px;
    }
    .form-submit:hover { background: var(--olive-mid); }
    .form-submit:active { transform: scale(0.97); }
    .form-success {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 28px 0;
    }
    .form-success.show { display: flex; }
    .form-success-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: var(--olive);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;
    }
    .form-success-title {
      font-family: 'Imperial Script', cursive;
      font-size: 28px;
      color: var(--olive);
    }
    .form-success-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: #777;
      line-height: 1.7;
    }

    /* ─── Reduzir movimento: tudo aparece no estado final, sem animação ─── */
    @media (prefers-reduced-motion: reduce) {
      #invitation-card .reveal,
      .hero-flowers-tl, .hero-monogram-center, .hero-date-label, .hero-date-value,
      .hero-name-1, .hero-name-2, .hero-bg img {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        clip-path: none !important;
      }
      .hero-flowers-base { opacity: 1 !important; transform: translateX(-50%) !important; }
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        transition-delay: 0s !important;
      }
    }`;

export default function Home({ guestName }: HomeProps) {
  const guest = guestName ? escapeHtml(guestName) : undefined;
  useEffect(() => {
    // Run envelope script
    const script = document.createElement("script");
    script.textContent = `
    /* ─── Envelope ─── */
    window.__envelopeOpened = false;

    // A carta usa Imperial Script, mas só aparece após o toque: carrega a fonte já
    if (document.fonts && document.fonts.load) document.fonts.load('46px "Imperial Script"');

    /* Geometria da arte (px da imagem original) — medida nas linhas das dobras */
    var BODY_W = 828, BODY_H = 1480;
    var BODY_POLYS = {
      back:   [[0,0],[828,0],[828,280],[549,668],[279,668],[0,280]],
      l:      [[-2,276],[281,668],[-2,1101]],
      r:      [[830,276],[547,668],[830,1101]],
      bottom: [[279,666],[549,666],[830,1097],[830,1480],[-2,1480],[-2,1097]]
    };
    var FLAP_W = 784, FLAP_H = 842;
    var SEAL = { x: 0.4974, y: 0.8355, r: 0.168 }; // centro e raio relativos à aba

    /* Recorta as camadas do corpo e posiciona selo/metades/hint conforme a tela */
    function layoutEnvelope() {
      var screen = document.getElementById('envelope-screen');
      var flap = document.querySelector('.env-flap-img');
      if (!screen || !flap) return;
      var W = screen.clientWidth, H = screen.clientHeight;

      // object-fit: cover + object-position: center top
      var s = Math.max(W / BODY_W, H / BODY_H);
      var ox = (W - BODY_W * s) / 2;
      var toPoly = function(pts) {
        return 'polygon(' + pts.map(function(p) { return (ox + p[0] * s) + 'px ' + (p[1] * s) + 'px'; }).join(',') + ')';
      };
      [['back','.env-back img'],['l','.env-side.l img'],['r','.env-side.r img'],['bottom','.env-bottom img']].forEach(function(pair) {
        var img = screen.querySelector(pair[1]);
        if (img) img.style.clipPath = toPoly(BODY_POLYS[pair[0]]);
      });

      // aba: object-fit: contain + top center (dimensões sem transformação)
      var fw = flap.offsetWidth, fh = flap.offsetHeight;
      var fs = Math.min(fw / FLAP_W, fh / FLAP_H);
      var cx = fw / 2 + (SEAL.x - 0.5) * FLAP_W * fs;
      var cy = SEAL.y * FLAP_H * fs;
      var r = SEAL.r * FLAP_W * fs;
      screen.style.setProperty('--seal-x', cx + 'px');
      screen.style.setProperty('--seal-y', cy + 'px');
      screen.style.setProperty('--seal-r', r + 'px');

      // metades do selo: mesma caixa da aba, recorte com borda irregular
      var crackL = [[-1.3,-1.3],[0.06,-1.3],[-0.08,-0.45],[0.1,0.1],[-0.05,0.6],[0.04,1.3],[-1.3,1.3]];
      var crackR = [[0.06,-1.3],[1.3,-1.3],[1.3,1.3],[0.04,1.3],[-0.05,0.6],[0.1,0.1],[-0.08,-0.45]];
      var toCrack = function(pts) {
        return 'polygon(' + pts.map(function(p) { return (cx + p[0] * r) + 'px ' + (cy + p[1] * r) + 'px'; }).join(',') + ')';
      };
      screen.querySelectorAll('.seal-half').forEach(function(half) {
        half.style.width = fw + 'px';
        half.style.height = fh + 'px';
        half.querySelector('img').style.clipPath = toCrack(half.classList.contains('l') ? crackL : crackR);
      });

      // "TOQUE NO SELO" centralizado no selo
      var hint = document.querySelector('.tap-hint-wrap');
      if (hint) {
        hint.style.left = (cx - 105) + 'px';
        hint.style.top = (cy - 105) + 'px';
        hint.style.transform = 'none';
      }
    }
    window.addEventListener('load', layoutEnvelope);
    window.addEventListener('resize', layoutEnvelope);
    setTimeout(layoutEnvelope, 100);
    setTimeout(layoutEnvelope, 600);
    document.querySelectorAll('#envelope-screen img').forEach(function(img) {
      img.addEventListener('load', layoutEnvelope);
    });

    /* ─── Toque/clique/teclado: 1º abre o envelope, depois (com a carta pronta) abre o convite ─── */
    var letterReady = false;
    function onEnvelopeActivate() {
      if (!window.__envelopeOpened) openEnvelope();
      else if (letterReady) leaveEnvelope();
    }
    (function() {
      var env = document.getElementById('envelope-screen');
      if (!env) return;
      env.addEventListener('pointerup', onEnvelopeActivate);
      env.addEventListener('touchend', onEnvelopeActivate);
      env.addEventListener('click', onEnvelopeActivate);
      env.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEnvelopeActivate();
        }
      });
    })();

    var timers = [];
    var reducedMotion = function() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
    window.__cancelEnvelope = function() {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };

    function openEnvelope() {
      if (window.__envelopeOpened) return;
      window.__envelopeOpened = true;

      var envScreen = document.getElementById('envelope-screen');
      if (!envScreen || !document.getElementById('invite-wrapper')) {
        window.__envelopeOpened = false;
        return;
      }
      window.dispatchEvent(new Event('invite:open'));

      // Sem animação: pula a carta e vai direto ao convite
      if (reducedMotion()) { leaveEnvelope(); return; }

      layoutEnvelope();
      // 0ms: selo racha; 350ms: aba sobe; 1400ms: abas saem (tempos no CSS)
      envScreen.classList.add('opening');
      // 800ms: a carta sobe de dentro do envelope
      timers.push(setTimeout(function() { envScreen.classList.add('letter-out'); }, 800));
      // 2600ms: carta pronta — toque para abrir o convite
      timers.push(setTimeout(function() {
        letterReady = true;
        envScreen.classList.add('letter-ready');
        envScreen.setAttribute('aria-label', 'Toque para abrir o convite');
      }, 2600));
      // 9000ms: abre sozinho se ninguém tocar
      timers.push(setTimeout(leaveEnvelope, 9000));
    }

    function leaveEnvelope() {
      var envScreen = document.getElementById('envelope-screen');
      var wrapper = document.getElementById('invite-wrapper');
      if (!envScreen || !wrapper || envScreen.classList.contains('leaving')) return;
      window.__cancelEnvelope();
      var reduced = reducedMotion();
      // o envelope se dissolve (1.1s) e o convite surge por baixo 350ms depois
      envScreen.classList.add('leaving');
      timers.push(setTimeout(function() {
        wrapper.classList.add('visible');
        window.dispatchEvent(new Event('invite:visible'));
      }, reduced ? 0 : 350));
      timers.push(setTimeout(function() {
        envScreen.style.display = 'none';
      }, reduced ? 0 : 1150));
    }`;
    document.body.appendChild(script);

    // Contador regressivo
    const cdScript = document.createElement("script");
    cdScript.textContent = `
    (function() {
      var target = new Date('2027-01-28T15:30:00-03:00').getTime();
      function pad(n) { return String(n).padStart(2,'0'); }
      function tick() {
        var now = Date.now();
        var diff = target - now;
        if (diff <= 0) {
          document.getElementById('cd-days').textContent = '00';
          document.getElementById('cd-hours').textContent = '00';
          document.getElementById('cd-mins').textContent = '00';
          document.getElementById('cd-secs').textContent = '00';
          return;
        }
        var days  = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var mins  = Math.floor((diff % 3600000) / 60000);
        var secs  = Math.floor((diff % 60000) / 1000);
        function flipNum(id, val) {
          var el = document.getElementById(id);
          if (!el) return;
          var newVal = pad(val);
          if (el.textContent === newVal) return;
          el.classList.add('flip-out');
          setTimeout(function() {
            el.textContent = newVal;
            el.classList.remove('flip-out');
            el.classList.add('flip-in');
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                el.classList.remove('flip-in');
              });
            });
          }, 180);
        }
        flipNum('cd-days', days);
        flipNum('cd-hours', hours);
        flipNum('cd-mins', mins);
        flipNum('cd-secs', secs);
      }
      tick();
      setInterval(tick, 1000);
    })();

    function submitConfirm(e) {
      e.preventDefault();
      var name   = document.getElementById('cf-name').value.trim();
      var phone  = document.getElementById('cf-phone').value.trim();
      if (!name) return;

      // Prazo de confirmação: até 31/12/2026 (inclusive)
      if (new Date() >= new Date(2027, 0, 1)) {
        document.getElementById('confirm-form').style.display = 'none';
        document.getElementById('confirm-expired').style.display = 'flex';
        return;
      }

      // Envia via WhatsApp para os noivos
      var msg = 'Olá Horberlan e Analia! 💍 Confirmo minha presença no casamento de vocês!%0A%0A'
              + '👤 Nome: ' + encodeURIComponent(name) + '%0A'
              + (phone ? '📱 WhatsApp: ' + encodeURIComponent(phone) + '%0A' : '')
              + '%0A📅 28 de Janeiro de 2027 · Restaurante O Mirante, Sousa — PB';

      window.open('https://wa.me/558398414629?text=' + msg, '_blank');

      // Mostra mensagem de sucesso
      document.getElementById('confirm-form').style.display = 'none';
      var success = document.getElementById('confirm-success');
      success.classList.add('show');
      success.style.display = 'flex';
    }

    function openCalModal() {
      var title = encodeURIComponent('Casamento de Horberlan & Analia');
      var details = encodeURIComponent('Cerimônia e Recepção no Restaurante O Mirante, Sousa — PB');
      var location = encodeURIComponent('Restaurante O Mirante, R. José Damião da Silva Dellamari S/N, Distrito São Gonçalo, Sousa, PB, 58814-000');
      var startDate = '20270128T153000';
      var endDate   = '20270128T230000';
      var startDateZ = '20270128T183000Z';
      var endDateZ   = '20270129T020000Z';

      // Google Calendar
      var googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + '&text=' + title
        + '&dates=' + startDateZ + '/' + endDateZ
        + '&details=' + details
        + '&location=' + location;
      document.getElementById('cal-google').href = googleUrl;

      // iCal / Apple Calendar
      var CRLF = '\\r\\n';
      var ics = 'BEGIN:VCALENDAR' + CRLF + 'VERSION:2.0' + CRLF + 'BEGIN:VEVENT' + CRLF
        + 'DTSTART;TZID=America/Fortaleza:' + startDate + CRLF
        + 'DTEND;TZID=America/Fortaleza:' + endDate + CRLF
        + 'SUMMARY:Casamento de Horberlan e Analia' + CRLF
        + 'DESCRIPTION:Cerimonia e Recepcao no Restaurante O Mirante, Sousa PB' + CRLF
        + 'LOCATION:Restaurante O Mirante, R. Jose Damiao da Silva Dellamari S/N, Distrito Sao Goncalo, Sousa, PB, 58814-000' + CRLF
        + 'END:VEVENT' + CRLF + 'END:VCALENDAR';
      var blob = new Blob([ics], {type: 'text/calendar'});
      document.getElementById('cal-ical').href = URL.createObjectURL(blob);

      // Outlook
      var outlookUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?subject=' + title
        + '&startdt=2027-01-28T15:30:00-03:00&enddt=2027-01-28T23:00:00-03:00'
        + '&body=' + details + '&location=' + location;
      document.getElementById('cal-outlook').href = outlookUrl;

      document.getElementById('cal-modal-overlay').classList.add('open');
    }

    function closeCalModal(e) {
      if (!e || e.target === document.getElementById('cal-modal-overlay')) {
        document.getElementById('cal-modal-overlay').classList.remove('open');
      }
    }
    `;

    document.body.appendChild(cdScript);

    // Scroll reveal começa quando o convite aparece (evento disparado em openEnvelope)
    let stopReveal: (() => void) | undefined;
    const onInviteVisible = () => {
      const card = document.getElementById("invitation-card");
      if (card) stopReveal = initScrollReveal(card);
    };
    window.addEventListener("invite:visible", onInviteVisible, { once: true });

    return () => {
      (window as { __cancelEnvelope?: () => void }).__cancelEnvelope?.();
      window.removeEventListener("invite:visible", onInviteVisible);
      stopReveal?.();
      script.remove();
      cdScript.remove();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INVITE_CSS }} />
      <FallingPetals />
      <div
        dangerouslySetInnerHTML={{
          __html: `
  <!-- ════════════════════════════════
       FULLSCREEN ENVELOPE
  ════════════════════════════════ -->
  <div id="envelope-screen" role="button" tabindex="0" aria-label="Toque no selo para abrir o convite">

    <!-- CORPO: a mesma arte recortada em camadas (fundo, abas laterais e inferior) -->
    <div class="env-layer env-back"><img src="/manus-storage/envelope_body_web_7870a1c4.webp" alt="" draggable="false" /></div>

    <!-- CARTA: sobe de dentro do envelope -->
    <div class="env-letter" aria-hidden="true">
      <div class="env-letter-paper">
        <div class="env-letter-mono" style="--d:.1s"></div>
        <p class="env-letter-for" style="--d:.3s">${guest ? `Para ${guest}` : "Você está convidado!"}</p>
        <p class="env-letter-names" style="--d:.7s">Horberlan<span class="env-letter-amp">&amp;</span>Analia</p>
        <span class="env-letter-line" style="--d:1.6s"></span>
        <p class="env-letter-date" style="--d:1.8s">28 de janeiro de 2027 · 15h30</p>
        <p class="env-letter-place" style="--d:2s">Restaurante O Mirante · <span style="white-space:nowrap">Sousa — PB</span></p>
      </div>
    </div>

    <div class="env-layer env-side l"><img src="/manus-storage/envelope_body_web_7870a1c4.webp" alt="" draggable="false" /></div>
    <div class="env-layer env-side r"><img src="/manus-storage/envelope_body_web_7870a1c4.webp" alt="" draggable="false" /></div>
    <div class="env-layer env-bottom"><img src="/manus-storage/envelope_body_web_7870a1c4.webp" alt="" draggable="false" /></div>

    <!-- ABA: triângulo superior com o selo -->
    <div class="env-flap-wrap" id="env-flap">
      <img class="env-flap-img" src="/manus-storage/aba_7dcc1dac.webp" alt="Envelope lacrado com selo HA" draggable="false" />
    </div>

    <!-- SELO: duas metades que se separam ao abrir -->
    <div class="seal-half l"><img src="/manus-storage/aba_7dcc1dac.webp" alt="" draggable="false" /></div>
    <div class="seal-half r"><img src="/manus-storage/aba_7dcc1dac.webp" alt="" draggable="false" /></div>

    <!-- "TOQUE NO SELO" — posicionado sobre o selo -->
    <div class="tap-hint-wrap">
      <svg class="tap-hint-svg" viewBox="0 0 210 210" width="210" height="210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="circle-path" d="M 105,105 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
        </defs>
        <text font-family="Cinzel, serif" font-size="9.5" letter-spacing="10" fill="rgba(245,240,232,0.9)" text-anchor="middle">
          <textPath href="#circle-path" startOffset="25%" text-anchor="middle">TOQUE NO SELO</textPath>
        </text>
      </svg>
    </div>

    <p class="env-letter-hint">Toque para abrir o convite</p>

    <!-- Vignette -->
    <div class="env-overlay"></div>
  </div>

  <!-- ════════════════════════════════
       INVITATION CARD
  ════════════════════════════════ -->
  <div id="invite-wrapper">
    <div id="invitation-card">

      <!-- ── HERO ── -->
      <div class="hero-section">
        <div class="hero-bg"><img src="/manus-storage/hero.jpeg" alt="" fetchpriority="high" decoding="async" /></div>
       <img class="hero-flowers-tl" src="/manus-storage/flowers_hero_top_left_510999d2.webp" alt="" />
       <img class="hero-flowers-mr" src="/manus-storage/flor2_57213108.webp" alt="" />


        <div class="hero-date-tag">
          <div class="hero-monogram-center"><img src="/manus-storage/monograma_adaa041c.webp" alt="Monograma HA" /></div>
          <span class="hero-date-label">Dia do Casamento</span>
          <span class="hero-date-value">28.01.2027</span>
        </div>
        <div class="hero-names">
          <span class="hero-name-1">Horberlan</span>
          <span class="hero-name-2">Analia</span>
        </div>

        <!-- Torn paper SVG -->
        <svg class="hero-torn" viewBox="0 0 375 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 L0,28 C20,22 35,38 55,30 C75,22 90,10 115,18 C140,26 155,40 180,32 C205,24 220,8 245,16 C270,24 285,38 310,28 C335,18 355,30 375,22 L375,60 Z" fill="#f4efe5"/>
        </svg>

        <!-- Flores base: sempre sobre as ondas do rasgo -->
        <img class="hero-flowers-base" src="/manus-storage/flowers_hero_base_2051eb57.webp" alt="" />
      </div>

      <!-- ── QUERIDOS CONVIDADOS ── -->
      <div class="dear-section">
        <h2 class="dear-title reveal" data-reveal="ink" id="dear-title-el">${guest ? `Para ${guest},` : "Queridos Convidados!"}</h2>
        <time class="dear-when reveal" datetime="2027-01-28T15:30-03:00">
          <span class="dear-when-date">Quinta-feira, <span style="white-space:nowrap">28 de janeiro de 2027</span></span>
          <span class="dear-when-time">15h30</span>
        </time>
        <p class="dear-text reveal" id="dear-text-el">${guest ? `É com imensa alegria que convidamos ${guest} para compartilhar conosco este momento tão especial — o nosso casamento!` : "Em breve acontecerá um momento muito especial e alegre para nós — o nosso casamento!"}</p>
        <!-- Calendário de Janeiro 2027 -->
        <div class="dear-calendar reveal">
          <div class="cal-header">
            <span class="cal-month">Janeiro</span>
            <span class="cal-year">2027</span>
          </div>
          <div class="cal-grid">
            <div class="cal-day-name">Dom</div>
            <div class="cal-day-name">Seg</div>
            <div class="cal-day-name">Ter</div>
            <div class="cal-day-name">Qua</div>
            <div class="cal-day-name">Qui</div>
            <div class="cal-day-name">Sex</div>
            <div class="cal-day-name">Sáb</div>
            <!-- Semana 1: Jan começa na Sexta (col 6) -->
            <div class="cal-day empty"></div>
            <div class="cal-day empty"></div>
            <div class="cal-day empty"></div>
            <div class="cal-day empty"></div>
            <div class="cal-day empty"></div>
            <div class="cal-day">1</div>
            <div class="cal-day">2</div>
            <!-- Semana 2 -->
            <div class="cal-day">3</div>
            <div class="cal-day">4</div>
            <div class="cal-day">5</div>
            <div class="cal-day">6</div>
            <div class="cal-day">7</div>
            <div class="cal-day">8</div>
            <div class="cal-day">9</div>
            <!-- Semana 3 -->
            <div class="cal-day">10</div>
            <div class="cal-day">11</div>
            <div class="cal-day">12</div>
            <div class="cal-day">13</div>
            <div class="cal-day">14</div>
            <div class="cal-day">15</div>
            <div class="cal-day">16</div>
            <!-- Semana 4 -->
            <div class="cal-day">17</div>
            <div class="cal-day">18</div>
            <div class="cal-day">19</div>
            <div class="cal-day">20</div>
            <div class="cal-day">21</div>
            <div class="cal-day">22</div>
            <div class="cal-day">23</div>
            <!-- Semana 5 -->
            <div class="cal-day">24</div>
            <div class="cal-day">25</div>
            <div class="cal-day">26</div>
            <div class="cal-day">27</div>
            <div class="cal-day cal-highlight">
              <span class="cal-heart">&#9829;</span>
              <span class="cal-num">28</span>
            </div>
            <div class="cal-day">29</div>
            <div class="cal-day">30</div>
            <!-- Semana 6 -->
            <div class="cal-day">31</div>
          </div>
          <p class="cal-sub">Quinta-feira · 15h30</p>
        </div>
        <button class="cal-save-btn reveal" onclick="openCalModal()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" style="display:inline-block;vertical-align:middle;margin-right:7px;flex-shrink:0">
  <path d="M15.5 2V6M7.5 2V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
  <path d="M2.5 10H20.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
  <path d="M20.5 12C20.5 8.22876 20.5 6.34315 19.3284 5.17157C18.1569 4 16.2712 4 12.5 4H10.5C6.72876 4 4.84315 4 3.67157 5.17157C2.5 6.34315 2.5 8.22876 2.5 12V14C2.5 17.7712 2.5 19.6569 3.67157 20.8284C4.84315 22 6.72876 22 10.5 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
  <path d="M14.515 15.3866C15.5876 14.7469 16.5238 15.0047 17.0863 15.4153C17.3169 15.5837 17.4322 15.6679 17.5 15.6679C17.5678 15.6679 17.6831 15.5837 17.9137 15.4153C18.4762 15.0047 19.4124 14.7469 20.485 15.3866C21.8928 16.2261 22.2113 18.9958 18.9642 21.3324C18.3457 21.7775 18.0365 22 17.5 22C16.9635 22 16.6543 21.7775 16.0358 21.3324C12.7887 18.9958 13.1072 16.2261 14.515 15.3866Z" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/>
</svg> Salvar no Calendário</button>
        <p class="dear-text reveal" style="margin-bottom:0">Convidamos você a compartilhar conosco a alegria deste dia.</p>
      </div>

      <div class="gold-divider"></div>

      <!-- ── LOCAL ── -->
      <div class="location-section" style="padding-bottom:32px;">
        <!-- Rosas sobre a emenda com a seção anterior -->
        <div class="flowers-seam top"><img class="reveal" src="/manus-storage/flowers_hero_base_2051eb57.webp" alt="" loading="lazy" /></div>
        <h2 class="section-title reveal" data-reveal="ink">Local</h2>
        <p class="section-subtitle reveal">Onde nos encontraremos</p>
        <p class="location-name-big reveal">Restaurante O Mirante</p>
        <p class="location-address reveal">
          Aguardamos você no endereço:<br/>
          <strong>R. José Damião da Silva Dellamari</strong><br/>
          Distrito São Gonçalo, Sousa — PB, 58814-000
        </p>
        <a href="https://maps.google.com/?q=R.+Jos%C3%A9+Dami%C3%A3o+da+Silva+Dellamari,+S%2FN,+Distrito+S%C3%A3o+Gon%C3%A7alo,+Sousa,+PB,+58814-000,+Brazil" target="_blank" class="map-btn reveal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="currentColor" stroke-width="1.5"/></svg>
          Ver no Mapa
        </a>
        <!-- Foto do restaurante, largura total da tela -->
        <div class="reveal" style="width:calc(100% + 64px);margin-left:-32px;margin-right:-32px;margin-top:32px;line-height:0;">
          <img src="/manus-storage/restaurante_mirante_c19d6c25.webp" alt="Restaurante O Mirante" style="width:100%;height:auto;display:block;" loading="lazy" />
        </div>

      </div>
      <!-- ── DRESS CODE (oculto temporariamente) ──
      <div class="dresscode-section">
        <div class="dresscode-img-wrap reveal">
          <img src="/manus-storage/bowtie_dresscode_8f0dbf55.webp" alt="Dress Code" style="width:120px;height:auto;" loading="lazy" />
        </div>
        <h2 class="section-title reveal" data-reveal="ink">Dress<br/>Code</h2>
        <p class="section-subtitle reveal">Sugestão de traje</p>
        <p class="dresscode-text reveal">Ficaremos felizes em ver você com trajes que combinem com a paleta de cores do nosso casamento.</p>
        <div class="color-palette reveal">
          <div class="palette-item">
            <div class="palette-dot" style="background:#4a5240;"></div>
            <span class="palette-name">Verde Oliva</span>
          </div>
          <div class="palette-item">
            <div class="palette-dot" style="background:#a8c5a0;"></div>
            <span class="palette-name">Verde Menta</span>
          </div>
          <div class="palette-item">
            <div class="palette-dot" style="background:#b8975a;"></div>
            <span class="palette-name">Dourado</span>
          </div>
          <div class="palette-item">
            <div class="palette-dot" style="background:#f4efe5; border: 1px solid rgba(74,82,64,0.15);"></div>
            <span class="palette-name">Creme</span>
          </div>
        </div>
        <img class="dresscode-outfits-img reveal" src="/manus-storage/pasted_file_vUHaJW_image_bed50782.webp" alt="Sugestao de trajes" loading="lazy" />
      </div>
      -->

      <!-- ── DETALHES ── -->
      <!-- ── DETALHES: wrapper sem background, flores ultrapassam ── -->
      <div style="position:relative;overflow:visible;">
        
        <!-- Background verde oliva apenas no conteúdo -->
        
        <div class="details-section">
        <!-- Rosas sobre a faixa de transição de cor (início) -->
        <div class="flowers-seam top"><img class="reveal" src="/manus-storage/flowers_hero_base_2051eb57.webp" alt="" loading="lazy" /></div>
          <h2 class="section-title reveal" data-reveal="ink">Detalhes</h2>
          <p class="section-subtitle reveal">Informações importantes</p>
          <div class="detail-item reveal">
            <div class="detail-dot"></div>
            <p class="detail-text">Nossa celebração será realizada em ambiente cristão, em adoração e gratidão a Deus.</p>
          </div>
          <div class="detail-item reveal">
            <div class="detail-dot"></div>
            <p class="detail-text">Não haverá consumo de bebidas alcoólicas durante a recepção.</p>
          </div>
          <div class="detail-item reveal">
            <div class="detail-dot"></div>
            <p class="detail-text">Pedimos, por gentileza, que os celulares permaneçam no modo silencioso durante a cerimônia.</p>
          </div>
          <div class="detail-item reveal">
            <div class="detail-dot"></div>
            <p class="detail-text">Sua presença é o nosso maior presente, mas, se desejar nos presentear, nossa lista estará disponível abaixo.</p>
          </div>
        <!-- Rosas sobre a faixa de transição de cor (fim) -->
        <div class="flowers-seam bottom"><img class="reveal" src="/manus-storage/flowers_hero_base_2051eb57.webp" alt="" loading="lazy" /></div>
        </div>
      </div>

      <!-- ── CONTADOR REGRESSIVO ── -->
      <div class="countdown-section" style="background:#f5f0e8;padding-top:72px;padding-bottom:88px;">

        <div class="reveal" style="text-align:center;margin-bottom:12px;position:relative;z-index:2;">
          <img src="/manus-storage/monograma_ha_arco2_168a90a4.webp" alt="Monograma HA" style="width:80px;height:auto;object-fit:contain;display:inline-block;" loading="lazy" />
        </div>
        <h2 class="section-title reveal" data-reveal="ink" style="color:var(--olive);text-align:center;width:100%;">Faltam:</h2>
        <div class="countdown-grid reveal" id="countdown-grid" style="display:flex;flex-direction:row;justify-content:center;align-items:center;flex-wrap:nowrap;">
          <div class="countdown-unit" style="display:flex;flex-direction:column;align-items:center;width:68px;">
            <span class="countdown-num" id="cd-days" style="font-family:'Cinzel',serif;font-size:40px;font-weight:700;color:#4a5240;line-height:1;">--</span>
            <span class="countdown-label" style="font-family:'Cinzel',serif;font-size:6px;letter-spacing:1.5px;color:#7a8a6a;text-transform:uppercase;margin-top:6px;white-space:nowrap;">Dias</span>
          </div>
          <span class="countdown-sep" style="font-family:'Cinzel',serif;font-size:32px;font-weight:700;color:#4a5240;opacity:0.35;line-height:1;margin:0 2px;padding-bottom:14px;align-self:flex-end;">:</span>
          <div class="countdown-unit" style="display:flex;flex-direction:column;align-items:center;width:68px;">
            <span class="countdown-num" id="cd-hours" style="font-family:'Cinzel',serif;font-size:40px;font-weight:700;color:#4a5240;line-height:1;">--</span>
            <span class="countdown-label" style="font-family:'Cinzel',serif;font-size:6px;letter-spacing:1.5px;color:#7a8a6a;text-transform:uppercase;margin-top:6px;white-space:nowrap;">Horas</span>
          </div>
          <span class="countdown-sep" style="font-family:'Cinzel',serif;font-size:32px;font-weight:700;color:#4a5240;opacity:0.35;line-height:1;margin:0 2px;padding-bottom:14px;align-self:flex-end;">:</span>
          <div class="countdown-unit" style="display:flex;flex-direction:column;align-items:center;width:68px;">
            <span class="countdown-num" id="cd-mins" style="font-family:'Cinzel',serif;font-size:40px;font-weight:700;color:#4a5240;line-height:1;">--</span>
            <span class="countdown-label" style="font-family:'Cinzel',serif;font-size:6px;letter-spacing:1.5px;color:#7a8a6a;text-transform:uppercase;margin-top:6px;white-space:nowrap;">Minutos</span>
          </div>
          <span class="countdown-sep" style="font-family:'Cinzel',serif;font-size:32px;font-weight:700;color:#4a5240;opacity:0.35;line-height:1;margin:0 2px;padding-bottom:14px;align-self:flex-end;">:</span>
          <div class="countdown-unit" style="display:flex;flex-direction:column;align-items:center;width:68px;">
            <span class="countdown-num" id="cd-secs" style="font-family:'Cinzel',serif;font-size:40px;font-weight:700;color:#4a5240;line-height:1;">--</span>
            <span class="countdown-label" style="font-family:'Cinzel',serif;font-size:6px;letter-spacing:1.5px;color:#7a8a6a;text-transform:uppercase;margin-top:6px;white-space:nowrap;">Segundos</span>
          </div>
        </div>
        <p class="reveal" style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;color:#4a5240;line-height:1.7;max-width:280px;margin:32px auto 0;text-align:center;position:relative;z-index:2;">"E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição."</p>
        <p class="reveal" style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#7a8a6a;text-transform:uppercase;margin-top:10px;text-align:center;position:relative;z-index:2;">Colossenses 3:14</p>
      </div>

      <!-- ── SEPARADOR FLORAL ── -->
      <div style="position:relative;height:0;overflow:visible;z-index:10;pointer-events:none;">
        <img src="/manus-storage/flor2_57213108.webp" alt="" style="width:140px;height:auto;display:block;position:absolute;right:-10px;top:-160px;opacity:1;z-index:10;pointer-events:none;" />
      </div>
      <!-- ── CONFIRMAR PRESENÇA (FORMULÁRIO) ── -->
      <div class="form-section" style="background:#f5f0e8;padding:72px 28px 52px;text-align:center;position:relative;overflow:visible;">
        <h2 class="section-title reveal" data-reveal="ink" style="font-family:'Cinzel',serif;font-size:22px;letter-spacing:4px;color:#4a5240;text-transform:uppercase;margin-bottom:6px;position:relative;z-index:3;text-align:center;">Confirmar Presença</h2>
        <p class="section-subtitle reveal" style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#7a8a6a;letter-spacing:1px;margin-bottom:28px;position:relative;z-index:3;text-align:center;">Sua presença é a nossa maior alegria</p>
        <div class="form-card reveal" style="background:#4a5240;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:32px 24px 28px;max-width:340px;margin:0 auto;box-shadow:0 6px 32px rgba(74,82,64,0.25);position:relative;z-index:3;">
          <p style="margin:0 0 18px;font-family:'Cormorant Garamond',serif;font-size:14px;color:rgba(245,240,232,0.8);line-height:1.8;text-align:center;">Ficamos felizes em tê-lo entre os nossos convidados!<br/>Confirme sua presença até <strong style="color:#fff;">31 de dezembro de 2026</strong>.</p>
          <div style="width:40px;height:1px;background:rgba(255,255,255,0.25);margin:0 auto 20px;"></div>
          <form class="invite-form" id="confirm-form" onsubmit="submitConfirm(event)" style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;flex-direction:column;gap:6px;text-align:left;">
              <label style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2.5px;color:rgba(245,240,232,0.7);text-transform:uppercase;" for="cf-name">Seu nome completo</label>
              <input style="width:100%;padding:14px 16px;border:1.5px solid rgba(245,240,232,0.4);border-radius:10px;background:#4a5240;font-family:'Cormorant Garamond',serif;font-size:16px;color:#f5f0e8;outline:none;box-sizing:border-box;" id="cf-name" type="text" placeholder="Ex: Maria Silva" value="${guest ?? ""}" required />
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;text-align:left;">
              <label style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2.5px;color:rgba(245,240,232,0.7);text-transform:uppercase;" for="cf-phone">WhatsApp (opcional)</label>
              <input style="width:100%;padding:14px 16px;border:1.5px solid rgba(245,240,232,0.4);border-radius:10px;background:#4a5240;font-family:'Cormorant Garamond',serif;font-size:16px;color:#f5f0e8;outline:none;box-sizing:border-box;" id="cf-phone" type="tel" placeholder="(83) 99999-9999" />
            </div>
            <button type="submit" style="display:flex;align-items:center;justify-content:center;width:100%;padding:16px 24px;border-radius:8px;background:#f5f0e8;color:#4a5240;border:none;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,0.2);margin-top:6px;">Confirmar Minha Presença</button>
          </form>
          <div class="form-success" id="confirm-success" style="display:none;flex-direction:column;align-items:center;gap:12px;padding:28px 0;">
            <div style="width:56px;height:56px;border-radius:50%;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:24px;color:#4a5240;">✓</div>
            <div style="font-family:'Imperial Script',cursive;font-size:28px;color:#fff;">Presença confirmada!</div>
            <p style="font-family:'Cormorant Garamond',serif;font-size:15px;color:rgba(245,240,232,0.8);line-height:1.7;">Ficamos muito felizes! Te esperamos no dia 28 de janeiro de 2027 no Restaurante O Mirante, Sousa — PB.</p>
          </div>
          <div class="form-success" id="confirm-expired" style="display:none;flex-direction:column;align-items:center;gap:12px;padding:28px 0;">
            <div style="width:56px;height:56px;border-radius:50%;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:24px;color:#4a5240;">!</div>
            <div style="font-family:'Imperial Script',cursive;font-size:28px;color:#fff;">Prazo encerrado</div>
            <p style="font-family:'Cormorant Garamond',serif;font-size:15px;color:rgba(245,240,232,0.8);line-height:1.7;">O prazo para confirmar presença terminou em 31 de dezembro de 2026. Para falar com os noivos, entre em contato diretamente.</p>
          </div>
        </div>
        <div class="action-btns-wrap reveal" style="display:flex;flex-direction:column;gap:10px;max-width:340px;margin:20px auto 0;position:relative;z-index:3;">
          <p style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;color:#7a8a6a;text-transform:uppercase;margin-bottom:4px;">Mais opções</p>
          <button type="button" onclick="openCalModal()" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px 24px;border-radius:8px;background:#4a5240;color:#f5f0e8;border:none;font-family:'Cinzel',serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 18px rgba(74,82,64,0.28);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M15.5 2V6M7.5 2V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M2.5 10H20.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M20.5 12C20.5 8.22876 20.5 6.34315 19.3284 5.17157C18.1569 4 16.2712 4 12.5 4H10.5C6.72876 4 4.84315 4 3.67157 5.17157C2.5 6.34315 2.5 8.22876 2.5 12V14C2.5 17.7712 2.5 19.6569 3.67157 20.8284C4.84315 22 6.72876 22 10.5 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M14.515 15.3866C15.5876 14.7469 16.5238 15.0047 17.0863 15.4153C17.3169 15.5837 17.4322 15.6679 17.5 15.6679C17.5678 15.6679 17.6831 15.5837 17.9137 15.4153C18.4762 15.0047 19.4124 14.7469 20.485 15.3866C21.8928 16.2261 22.2113 18.9958 18.9642 21.3324C18.3457 21.7775 18.0365 22 17.5 22C16.9635 22 16.6543 21.7775 16.0358 21.3324C12.7887 18.9958 13.1072 16.2261 14.515 15.3866Z" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg> Salvar no Calendário</button>
          <a href="https://www.finalfeliz.de/analia-horberlan" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px 24px;border-radius:8px;background:transparent;color:#4a5240;border:1.5px solid rgba(74,82,64,0.35);font-family:'Cinzel',serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;text-decoration:none;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M4 11V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C20 19.9497 20 18.2998 20 15V11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M3 9C3 8.25231 3 7.87846 3.20096 7.6C3.33261 7.41758 3.52197 7.26609 3.75 7.16077C4.09808 7 4.56538 7 5.5 7H18.5C19.4346 7 19.9019 7 20.25 7.16077C20.478 7.26609 20.6674 7.41758 20.799 7.6C21 7.87846 21 8.25231 21 9C21 9.74769 21 10.1215 20.799 10.4C20.6674 10.5824 20.478 10.7339 20.25 10.8392C19.9019 11 19.4346 11 18.5 11H5.5C4.56538 11 4.09808 11 3.75 10.8392C3.52197 10.7339 3.33261 10.5824 3.20096 10.4C3 10.1215 3 9.74769 3 9Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="M6 3.78571C6 2.79949 6.79949 2 7.78571 2H8.14286C10.2731 2 12 3.7269 12 5.85714V7H9.21429C7.43908 7 6 5.56091 6 3.78571Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="M18 3.78571C18 2.79949 17.2005 2 16.2143 2H15.8571C13.7269 2 12 3.7269 12 5.85714V7H14.7857C16.5609 7 18 5.56091 18 3.78571Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="M12 11L12 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg> Lista de Presentes</a>
        </div>
      </div>
      <!-- ── FOOTER ── -->
      <!-- ── FOOTER ── -->
      <div class="footer-section">
        <div class="footer-monogram reveal"><img src="/manus-storage/monograma_adaa041c.webp" alt="Monograma HA" /></div>
        <div class="footer-sig reveal">Horberlan &amp; Analia</div>
        <div class="footer-date-small reveal">28 · JANEIRO · 2027</div>
      </div>

    </div>
  </div>

  <!-- ── MODAL CALENDÁRIO ── -->
  <div class="cal-modal-overlay" id="cal-modal-overlay" onclick="closeCalModal(event)">
    <div class="cal-modal">
      <div class="cal-modal-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" style="display:inline-block;vertical-align:middle;margin-right:7px;flex-shrink:0"><path d="M15.5 2V6M7.5 2V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M2.5 10H20.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M20.5 12C20.5 8.22876 20.5 6.34315 19.3284 5.17157C18.1569 4 16.2712 4 12.5 4H10.5C6.72876 4 4.84315 4 3.67157 5.17157C2.5 6.34315 2.5 8.22876 2.5 12V14C2.5 17.7712 2.5 19.6569 3.67157 20.8284C4.84315 22 6.72876 22 10.5 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M14.515 15.3866C15.5876 14.7469 16.5238 15.0047 17.0863 15.4153C17.3169 15.5837 17.4322 15.6679 17.5 15.6679C17.5678 15.6679 17.6831 15.5837 17.9137 15.4153C18.4762 15.0047 19.4124 14.7469 20.485 15.3866C21.8928 16.2261 22.2113 18.9958 18.9642 21.3324C18.3457 21.7775 18.0365 22 17.5 22C16.9635 22 16.6543 21.7775 16.0358 21.3324C12.7887 18.9958 13.1072 16.2261 14.515 15.3866Z" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg> Salvar no Calendário</div>
      <p class="cal-modal-sub">Escolha sua agenda preferida</p>
      <a class="cal-option" id="cal-google" href="#" target="_blank" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid rgba(74,82,64,0.18);border-radius:10px;text-decoration:none;color:#4a5240;transition:all 0.2s ease;margin-bottom:10px;">
        <img src="/manus-storage/google_calendar_icon_5a708a16.webp" alt="Google Calendar" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" loading="lazy" />
        <span class="cal-option-label" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Google Calendar</span>
      </a>
      <a class="cal-option" id="cal-ical" href="#" download="casamento-horberlan-analia.ics" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid rgba(74,82,64,0.18);border-radius:10px;text-decoration:none;color:#4a5240;transition:all 0.2s ease;margin-bottom:10px;">
        <img src="/manus-storage/apple_calendar_icon_69adac8e.webp" alt="Apple Calendar" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" loading="lazy" />
        <span class="cal-option-label" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Apple Calendar / iCal</span>
      </a>
      <a class="cal-option" id="cal-outlook" href="#" target="_blank" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid rgba(74,82,64,0.18);border-radius:10px;text-decoration:none;color:#4a5240;transition:all 0.2s ease;margin-bottom:10px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" style="flex-shrink:0;"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#0078d4" stroke-width="1.5"/><path d="M2 8l10 6 10-6" stroke="#0078d4" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span class="cal-option-label" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Outlook / Office 365</span>
      </a>
      <button class="cal-close" onclick="closeCalModal()">Fechar</button>
    </div>
  </div>`,
        }}
      />
    </>
  );
}
