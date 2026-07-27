import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Inject styles
    const style = document.createElement("style");
    style.textContent = `:root {
      --olive:        #4a5240;
      --olive-mid:    #5c6650;
      --olive-light:  #7a8a6a;
      --cream:        #f4efe5;
      --white:        #fdfcf9;
      --gold:         #b8975a;
      --gold-light:   #d4b07a;
      --gold-pale:    #e8d4a8;
      --text-mid:     #4a5240;
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

    /* ─── Floating petals ─── */
    .petal {
      position: fixed;
      border-radius: 50% 0 50% 0;
      opacity: 0;
      pointer-events: none;
      z-index: 1;
      animation: fall linear infinite;
    }
    @keyframes fall {
      0%   { transform: translateY(-30px) rotate(0deg) translateX(0); opacity: 0; }
      5%   { opacity: 0.28; }
      50%  { transform: translateY(50vh) rotate(180deg) translateX(20px); }
      95%  { opacity: 0.1; }
      100% { transform: translateY(110vh) rotate(360deg) translateX(-10px); opacity: 0; }
    }

    /* ════════════════════════════════════
       ENVELOPE SCREEN — FULLSCREEN
    ════════════════════════════════════ */
    #envelope-screen {
      position: fixed;
      inset: 0;
      z-index: 100;
      cursor: pointer;
      background: var(--olive);
      /* transition para o slide-up via JS */
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease;
      will-change: transform, opacity;
    }

    /* ─── CORPO do envelope (parte de baixo, estática) ─── */
    .env-body-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    /* ─── ABA superior (triângulo com o selo) — dobra para cima ─── */
    .env-flap-wrap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      /* A aba ocupa 61% da altura da imagem original (1681/2752) */
      /* Usamos height: auto via a imagem interna */
      height: auto;
      overflow: visible;
      transform-origin: top center;
      transform-style: preserve-3d;
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
      z-index: 2;
      /* Garantir que a aba cubra a tela corretamente */
      min-height: 61vh;
    }
    .env-flap-img {
      position: relative;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;
      display: block;
      /* A imagem PNG já tem a forma triangular com transparência */
    }

    /* Overlay vignette */
    .env-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 90% 90% at 50% 50%,
        transparent 55%,
        rgba(0,0,0,0.15) 100%);
      pointer-events: none;
      z-index: 3;
    }

    /* ─── TAP HINT ─── */
    .tap-hint {
      position: absolute;
      bottom: 9%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: rgba(245,240,232,0.8);
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 4px;
      text-transform: uppercase;
      animation: pulse-hint 2.2s ease-in-out infinite;
      white-space: nowrap;
      pointer-events: none;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
      transition: opacity 0.4s ease;
      z-index: 4;
    }
    @keyframes pulse-hint {
      0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
      50%       { opacity: 1;   transform: translateX(-50%) translateY(-3px); }
    }
    .tap-icon {
      display: block;
      font-size: 22px;
      margin-bottom: 6px;
    }
    .tap-hint-svg {
      position: relative;
      pointer-events: none;
      animation: pulse-hint 2.2s ease-in-out infinite;
      transition: opacity 0.4s ease;
      z-index: 4;
      width: 210px;
      height: 210px;
      display: block;
    }
    /* Wrapper do hint — posicionado sobre o centro do selo, acima de tudo */
    .tap-hint-wrap {
      position: fixed;
      left: 50%;
      top: 86vh;
      transform: translate(-50%, -50%);
      width: 210px;
      height: 210px;
      pointer-events: none;
      z-index: 9999;
    }
    /* ─── Posicionar hint sobre o selo ─── */
    @keyframes pulse-hint {
      0%, 100% { opacity: 0.55; scale: 1; }
      50%       { opacity: 1;   scale: 1.04; }
    }

    /* ─── OPEN ANIMATION ─── */
    /* Fase 1: aba dobra para cima */
    #envelope-screen.opening .env-flap-wrap {
      transform: perspective(1200px) rotateX(-180deg);
    }
    /* Corpo some DEPOIS que a aba termina de dobrar (delay de 1.0s) */
    #envelope-screen.opening .env-body-layer {
      opacity: 0;
      transition: opacity 0.25s ease 0.4s;
    }
    #envelope-screen.opening .tap-hint {
      opacity: 0;
    }
    #envelope-screen.opening .tap-hint-wrap,
    #envelope-screen.slide-up .tap-hint-wrap {
      opacity: 0;
      pointer-events: none;
    }
    /* Fase 2: envelope inteiro sai da tela */
    #envelope-screen.slide-up {
      transform: translateY(-105%) !important;
      opacity: 0 !important;
    }

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
      padding: 0 0 48px;
      background: var(--cream);
      /* Inicia completamente abaixo da tela e invisível */
      opacity: 0;
      transform: translateY(100%);
      pointer-events: none;
      transition:
        opacity 0.8s ease,
        transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
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
    /* Quando visível: sobe para a posição final */
    #invite-wrapper.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    #invitation-card {
      width: 100%;
      max-width: 100%;
      background: var(--white);
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

    /* Staggered reveal */
    .reveal {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.9s ease, transform 0.9s ease;
    }
    #invite-wrapper.visible .reveal { opacity: 1; transform: translateY(0); }
    #invite-wrapper.visible .reveal:nth-child(1)  { transition-delay: 0.2s; }
    #invite-wrapper.visible .reveal:nth-child(2)  { transition-delay: 0.35s; }
    #invite-wrapper.visible .reveal:nth-child(3)  { transition-delay: 0.5s; }
    #invite-wrapper.visible .reveal:nth-child(4)  { transition-delay: 0.65s; }
    #invite-wrapper.visible .reveal:nth-child(5)  { transition-delay: 0.8s; }
    #invite-wrapper.visible .reveal:nth-child(6)  { transition-delay: 0.95s; }
    #invite-wrapper.visible .reveal:nth-child(7)  { transition-delay: 1.1s; }
    #invite-wrapper.visible .reveal:nth-child(8)  { transition-delay: 1.25s; }
    #invite-wrapper.visible .reveal:nth-child(9)  { transition-delay: 1.4s; }
    #invite-wrapper.visible .reveal:nth-child(10) { transition-delay: 1.55s; }
    #invite-wrapper.visible .reveal:nth-child(11) { transition-delay: 1.7s; }
    #invite-wrapper.visible .reveal:nth-child(12) { transition-delay: 1.85s; }
    #invite-wrapper.visible .reveal:nth-child(n+13) { transition-delay: 2s; }

    /* ─── HERO SECTION ─── */
    .hero-section {
      position: relative;
      background: linear-gradient(175deg, var(--olive) 0%, #3a4232 55%, #2e3628 100%);
      min-height: 520px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: visible;
      padding: 80px 28px 90px;
      min-height: 580px;
    }
    .hero-flowers-tl {
      position: absolute;
      top: -30px; left: -30px;
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
      top: 50%;
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
      gap: 4px;
      width: 100%;
      text-align: center;
    }
    .hero-date-label {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 5px;
      color: rgba(245,240,232,0.55);
      text-transform: uppercase;
    }
    .hero-date-value {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      letter-spacing: 3px;
      color: rgba(245,240,232,0.95);
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 18px;
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
    .hero-monogram svg, .footer-monogram svg {
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.35));
    }
    /* Torn paper edge at bottom of hero */
    .hero-torn {
      position: absolute;
      bottom: -2px; left: 0; right: 0;
      height: 60px;
    }
    .hero-flowers-base {
      position: absolute;
      bottom: -10px; left: 50%;
      transform: translateX(-50%);
      width: 110%;
      max-width: 500px;
      z-index: 10;
      pointer-events: none;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
    }
    .hero-flowers-base-wrap {
      position: relative;
      width: 100%;
      z-index: 10;
      margin-top: -20px;
      pointer-events: none;
      text-align: center;
      overflow: visible;
    }
    .hero-flowers-base-wrap .hero-flowers-base {
      display: block;
      margin: 0 auto;
      width: 100%;
      max-width: 500px;
      pointer-events: none;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
      z-index: 4;
    }

    /* ─── DEAR GUESTS SECTION ─── */
    .dear-section {
      background: var(--white);
      padding: 48px 32px 40px;
      text-align: center;
      position: relative;
    }
    .dear-title {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      letter-spacing: 3px;
      color: var(--olive);
      text-transform: uppercase;
      margin-bottom: 16px;
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
      background: linear-gradient(170deg, var(--olive) 0%, #3a4232 100%);
      padding: 52px 32px 52px;
      text-align: center;
      position: relative;
      overflow: visible;
    }
    .location-flowers-bl {
      position: absolute;
      bottom: -10px; left: -15px;
      width: 150px;
      pointer-events: none;
      opacity: 0.7;
      transform: rotate(10deg);
    }
    .location-flowers-tr {
      position: absolute;
      top: -14px; right: -10px;
      width: 120px;
      pointer-events: none;
      z-index: 2;
      opacity: 0.75;
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
      color: #fff;
      margin-bottom: 12px;
      position: relative; z-index: 2;
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .location-address {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: rgba(245,240,232,0.78);
      line-height: 1.8;
      position: relative; z-index: 2;
    }
    .location-address strong {
      color: #fff;
      font-weight: 600;
    }
    .map-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 22px;
      padding: 13px 28px;
      border: 1.5px solid rgba(255,255,255,0.45);
      border-radius: 50px;
      background: transparent;
      color: #fff;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative; z-index: 2;
    }
    .map-btn:hover { background: rgba(255,255,255,0.12); }
    .map-btn:active { transform: scale(0.97); }

    /* ─── DRESS CODE SECTION ─── */
    .dresscode-section {
      background: var(--white);
      padding: 52px 32px 44px;
      text-align: center;
      position: relative;
    }
    .dresscode-flowers-sprig {
      display: block;
      margin: 0 auto 18px;
      width: 65%;
      max-width: 280px;
      opacity: 0.6;
      pointer-events: none;
    }
    .dresscode-section .section-title { color: var(--olive); }
    .dresscode-section .section-subtitle { color: var(--olive-light); }
    .dresscode-img-wrap {
      display: flex;
      justify-content: center;
      margin: 20px 0 16px;
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

    /* ─── DETAILS SECTION ─── */
    .details-section {
      background: linear-gradient(170deg, #3a4232 0%, var(--olive) 100%);
      padding: 52px 32px 44px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .details-flowers-tr {
      position: absolute;
      top: -10px; right: -15px;
      width: 140px;
      pointer-events: none;
      opacity: 0.65;
      transform: scaleX(-1) rotate(-10deg);
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
      border-radius: 50px;
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
      background: linear-gradient(170deg, var(--olive) 0%, #2e3628 100%);
      padding: 52px 32px 60px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .footer-flowers-bottom {
      position: absolute;
      bottom: -10px; left: 50%;
      transform: translateX(-50%);
      width: 100%;
      pointer-events: none;
      opacity: 0.55;
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
      color: rgba(245,240,232,0.5);
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

    /* ─── PARTICLES ─── */
    .particle {
    /* ─── COUNTDOWN ─── */
    .countdown-section {
      background: linear-gradient(170deg, var(--olive) 0%, #3a4232 100%);
      padding: 48px 32px 44px;
      text-align: center;
    }
    .countdown-grid {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 24px;
    }
    .countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 16px 14px 12px;
      min-width: 68px;
    }
    .countdown-num {
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 600;
      color: #fff;
      line-height: 1;
      letter-spacing: 1px;
    }
    .countdown-label {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      letter-spacing: 2px;
      color: rgba(245,240,232,0.55);
      text-transform: uppercase;
      margin-top: 6px;
    }
    .countdown-sep {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      color: var(--gold-light);
      align-self: center;
      padding-bottom: 8px;
      opacity: 0.7;
    }

    /* ─── FORM ─── */
    .form-section {
      background: var(--cream);
      padding: 52px 32px 44px;
      text-align: center;
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
      border-radius: 50px;
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

    /* ─── PARTICLES ─── */
    .particle {
      position: fixed;
      pointer-events: none;
      z-index: 200;
      animation: particle-fly var(--dur, 1.2s) ease-out forwards;
    }
    @keyframes particle-fly {
      0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; }
    }`;
    document.head.appendChild(style);

    // Run envelope script
    const script = document.createElement("script");
    script.textContent = `/* ─── Floating petals ─── */
    (function() {
      const container = document.getElementById('petals-container');
      const colors = ['#7a8a6a','#b8975a','#c9a86c','#4a5240','#d4b07a','#a8b898'];
      for (let i = 0; i < 22; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        const size = 5 + Math.random() * 8;
        p.style.cssText = \`
          left: \${Math.random() * 100}vw;
          top: -20px;
          width: \${size}px;
          height: \${size * 1.4}px;
          background: \${colors[Math.floor(Math.random() * colors.length)]};
          opacity: 0;
          animation-duration: \${10 + Math.random() * 15}s;
          animation-delay: \${Math.random() * 14}s;
        \`;
        container.appendChild(p);
      }
    })();

    /* ─── Open envelope ─── */
    if (typeof window.__envelopeOpened === 'undefined') window.__envelopeOpened = false;

    

    function openEnvelope() {
      if (window.__envelopeOpened) return;
      window.__envelopeOpened = true;

      const envScreen = document.getElementById('envelope-screen');
      const wrapper   = document.getElementById('invite-wrapper');

      // Fase 1: dispara partículas + esconde hint
      envScreen.classList.add('opening');
      spawnParticles(window.innerWidth / 2, window.innerHeight * 0.72);

      // Fase 2: aba dobra em 1.2s
      // Corpo some: delay 1.0s + fade 0.5s = some completamente em ~1.5s
      // Envelope sai após o corpo sumir
      setTimeout(() => {
        envScreen.classList.add('slide-up');
      }, 1550);

      // Fase 3: convite sobe logo após o envelope sair da tela
      setTimeout(() => {
        wrapper.classList.add('visible');
      }, 1800);

      // Fase 4: remove o envelope do DOM
      setTimeout(() => {
        envScreen.style.display = 'none';
      }, 2600);
    }

    /* ─── Particle burst ─── */
    function spawnParticles(cx, cy) {
      const colors = ['#b8975a','#d4b07a','#7a8a6a','#f5f0e8','#4a5240','#c9a86c','#e8d4a8'];
      for (let i = 0; i < 36; i++) {
        const p     = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.5;
        const dist  = 70 + Math.random() * 130;
        const tx    = Math.cos(angle) * dist;
        const ty    = Math.sin(angle) * dist;
        const size  = 4 + Math.random() * 9;
        const dur   = 0.7 + Math.random() * 0.9;
        const rot   = ((Math.random() - 0.5) * 480) + 'deg';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const round = Math.random() > 0.5 ? '50%' : '2px';

        p.className = 'particle';
        p.style.cssText = \`
          left: \${cx}px; top: \${cy}px;
          width: \${size}px; height: \${size}px;
          background: \${color};
          border-radius: \${round};
          --tx: \${tx}px; --ty: \${ty}px;
          --rot: \${rot}; --dur: \${dur}s;
        \`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000 + 200);
      }
    }`;
    document.body.appendChild(script);

    // Contador regressivo
    const cdScript = document.createElement("script");
    cdScript.textContent = `
    (function() {
      var target = new Date('2027-01-28T16:00:00-03:00').getTime();
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
        document.getElementById('cd-days').textContent  = pad(days);
        document.getElementById('cd-hours').textContent = pad(hours);
        document.getElementById('cd-mins').textContent  = pad(mins);
        document.getElementById('cd-secs').textContent  = pad(secs);
      }
      tick();
      setInterval(tick, 1000);
    })();

    function submitConfirm(e) {
      e.preventDefault();
      var name   = document.getElementById('cf-name').value.trim();
      var guests = document.getElementById('cf-guests').value;
      var phone  = document.getElementById('cf-phone').value.trim();
      if (!name) return;

      // Envia via WhatsApp para os noivos
      var guestText = guests === '0' ? 'somente eu' : 'eu + ' + guests + ' acompanhante(s)';
      var msg = 'Olá Horberlan e Analia! 💍 Confirmo minha presença no casamento de vocês!%0A%0A'
              + '👤 Nome: ' + encodeURIComponent(name) + '%0A'
              + '👥 Acompanhantes: ' + encodeURIComponent(guestText) + '%0A'
              + (phone ? '📱 WhatsApp: ' + encodeURIComponent(phone) + '%0A' : '')
              + '%0A📅 28 de Janeiro de 2027 · Restaurante O Mirante, São Gonçalo — PB';

      // Envia para os dois números dos noivos
      window.open('https://wa.me/5583881556540?text=' + msg, '_blank');
      setTimeout(function() {
        window.open('https://wa.me/5583881856267?text=' + msg, '_blank');
      }, 800);

      // Mostra mensagem de sucesso
      document.getElementById('confirm-form').style.display = 'none';
      var success = document.getElementById('confirm-success');
      success.classList.add('show');
    }

    function openCalModal() {
      var title = encodeURIComponent('Casamento de Horberlan & Analia');
      var details = encodeURIComponent('Cerimônia e Recepção no Restaurante O Mirante, São Gonçalo — PB');
      var location = encodeURIComponent('Restaurante O Mirante, R. Alto Gruta, São Gonçalo, PB, 58814-000');
      var startDate = '20270128T160000';
      var endDate   = '20270128T230000';
      var startDateZ = '20270128T190000Z';
      var endDateZ   = '20270128T020000Z';

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
        + 'DESCRIPTION:Cerimonia e Recepcao no Restaurante O Mirante, Sao Goncalo PB' + CRLF
        + 'LOCATION:Restaurante O Mirante, R. Alto Gruta, Sao Goncalo, PB' + CRLF
        + 'END:VEVENT' + CRLF + 'END:VCALENDAR';
      var blob = new Blob([ics], {type: 'text/calendar'});
      document.getElementById('cal-ical').href = URL.createObjectURL(blob);

      // Outlook
      var outlookUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?subject=' + title
        + '&startdt=2027-01-28T16:00:00&enddt=2027-01-28T23:00:00'
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

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- Floating petals -->
  <div id="petals-container" style="position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;"></div>

  <!-- ════════════════════════════════
       FULLSCREEN ENVELOPE
  ════════════════════════════════ -->
  <div id="envelope-screen" onclick="openEnvelope()">

    <!-- CORPO: envelope sem aba, limpo para a transição -->
    <img class="env-body-layer" src="/manus-storage/envelope_body_web_7870a1c4.jpg" alt="Envelope" draggable="false" />

    <!-- ABA: triângulo superior com o selo (dobra para cima ao clicar) -->
    <div class="env-flap-wrap" id="env-flap">
      <img class="env-flap-img" src="/manus-storage/aba_7dcc1dac.png" alt="Aba do envelope" draggable="false" />
    </div>

    <!-- Tap hint — fora da aba, diretamente no envelope-screen com z-index máximo -->
    <div class="tap-hint-wrap">
      <svg class="tap-hint-svg" viewBox="0 0 210 210" width="210" height="210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="circle-path" d="M 105,105 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
        </defs>
        <text font-family="Cinzel, serif" font-size="9.5" letter-spacing="5" fill="rgba(245,240,232,0.9)" text-anchor="middle">
          <textPath href="#circle-path" startOffset="0%">TOQUE NO SELO · TOQUE NO SELO · TOQUE NO SELO · </textPath>
        </text>
      </svg>
    </div>

    <!-- Vignette -->
    <div class="env-overlay"></div>
  </div>

  <!-- ════════════════════════════════
       INVITATION CARD
  ════════════════════════════════ -->
  <div id="invite-wrapper">
    <div id="invitation-card">

      <!-- ── HERO ── -->
      <div class="hero-section reveal">
        <img class="hero-flowers-tl" src="/manus-storage/flowers_hero_top_left_510999d2.png" alt="" />
        <img class="hero-flowers-mr" src="/manus-storage/flor2_57213108.png" alt="" />

        <div class="hero-date-tag">
          <span class="hero-date-label">Dia do Casamento</span>
          <span class="hero-date-value">28.01.2027</span>
        </div>
        <div class="hero-names">
          <span class="hero-name-1">Horberlan</span>
          <span class="hero-name-2">Analia</span>
        </div>

        <!-- Torn paper SVG -->
        <svg class="hero-torn" viewBox="0 0 375 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 L0,28 C20,22 35,38 55,30 C75,22 90,10 115,18 C140,26 155,40 180,32 C205,24 220,8 245,16 C270,24 285,38 310,28 C335,18 355,30 375,22 L375,60 Z" fill="#fdfcf9"/>
        </svg>
      </div>

      <!-- Flores base hero extravasando entre seções -->
      <div class="hero-flowers-base-wrap">
        <img class="hero-flowers-base" src="/manus-storage/flowers_hero_base_2051eb57.png" alt="" />
      </div>

      <!-- ── QUERIDOS CONVIDADOS ── -->
      <div class="dear-section">
        <img class="dear-flowers-right" src="/manus-storage/flowers_right_e4488cf3.png" alt="" />
        <h2 class="dear-title reveal">Queridos Convidados!</h2>
        <p class="dear-text reveal">Em breve acontecerá um momento muito especial e alegre para nós — o nosso casamento!</p>
        <div class="dear-date-big reveal">28.01.27</div>
        <p class="dear-date-sub reveal">Quinta-feira · 16 horas</p>
        <p class="dear-text reveal" style="margin-bottom:0">Convidamos você a compartilhar conosco a alegria deste dia.</p>
      </div>

      <div class="gold-divider"></div>

      <!-- ── LOCAL ── -->
      <div class="location-section">
        <img class="location-flowers-tr" src="/manus-storage/flowers_corner_local_b218fe3a.png" alt="" />
        <img class="location-flowers-bl" src="/manus-storage/flowers_top_left_f226d5fb.png" alt="" />
        <h2 class="section-title reveal">Local</h2>
        <p class="section-subtitle reveal">Onde nos encontraremos</p>
        <p class="location-name-big reveal">Restaurante O Mirante</p>
        <p class="location-address reveal">
          Aguardamos você no endereço:<br/>
          <strong>Restaurante O Mirante</strong><br/>
          São Gonçalo — PB
        </p>
        <a href="https://maps.google.com/?q=Restaurante+O+Mirante,+R.+Alto+Gruta,+S%C3%A3o+Gon%C3%A7alo,+PB,+58814-000,+Brazil" target="_blank" class="map-btn reveal">
          📍 Ver no Mapa
        </a>
      </div>

      <!-- ── DRESS CODE ── -->
      <div class="dresscode-section">
        <img class="dresscode-flowers-sprig" src="/manus-storage/flowers_sprig_dresscode_ba565860.png" alt="" />
        <h2 class="section-title reveal">Dress Code</h2>
        <p class="section-subtitle reveal">Sugestão de traje</p>
        <div class="dresscode-img-wrap reveal">
          <img src="/manus-storage/pasted_file_vy5qFx_image_7124b6af.png" alt="Dress Code" style="width:180px;height:auto;opacity:0.9;" />
        </div>
        <p class="dresscode-text reveal">Ficaremos felizes em ver você com trajes que combinem com a paleta de cores do nosso casamento.</p>
        <div class="color-palette reveal">
          <div class="palette-dot" style="background:#4a5240;" title="Verde Oliva"></div>
          <div class="palette-dot" style="background:#f4efe5;" title="Creme"></div>
          <div class="palette-dot" style="background:#b8975a;" title="Dourado"></div>
          <div class="palette-dot" style="background:#fdfcf9;" title="Branco"></div>
        </div>
      </div>

      <!-- ── DETALHES ── -->
      <div class="details-section">
        <img class="details-flowers-tr" src="/manus-storage/flowers_right_e4488cf3.png" alt="" />
        <h2 class="section-title reveal">Detalhes</h2>
        <p class="section-subtitle reveal">Informações importantes</p>
        <div class="detail-item reveal">
          <div class="detail-dot"></div>
          <p class="detail-text">Se desejar nos presentear, ficaremos muito gratos por uma contribuição para o nosso novo lar e vida a dois.</p>
        </div>
        <div class="detail-item reveal">
          <div class="detail-dot"></div>
          <p class="detail-text">Se planejava trazer flores, uma garrafa de vinho com seus votos e desejos será uma lembrança muito especial para nós.</p>
        </div>
        <div class="detail-item reveal">
          <div class="detail-dot"></div>
          <p class="detail-text">Crianças são bem-vindas! Por favor, informe ao confirmar presença para que possamos preparar tudo com carinho.</p>
        </div>
      </div>

      <!-- ── CONTADOR REGRESSIVO ── -->
      <div class="countdown-section">
        <h2 class="section-title reveal">Faltam...</h2>
        <p class="section-subtitle reveal">Para o grande dia</p>
        <div class="countdown-grid reveal" id="countdown-grid">
          <div class="countdown-unit">
            <span class="countdown-num" id="cd-days">--</span>
            <span class="countdown-label">Dias</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-num" id="cd-hours">--</span>
            <span class="countdown-label">Horas</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-num" id="cd-mins">--</span>
            <span class="countdown-label">Min</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-num" id="cd-secs">--</span>
            <span class="countdown-label">Seg</span>
          </div>
        </div>
      </div>

      <!-- ── CONFIRMAR PRESENÇA (FORMULÁRIO) ── -->
      <div class="form-section">
        <h2 class="section-title reveal">Confirmar Presença</h2>
        <p class="section-subtitle reveal">Sua confirmação é muito importante</p>
        <p class="confirm-text reveal">Ficamos felizes em tê-lo entre os nossos convidados! Por favor, confirme sua presença até <strong>10 de janeiro de 2027</strong>.</p>

        <!-- Formulário -->
        <form class="invite-form reveal" id="confirm-form" onsubmit="submitConfirm(event)">
          <div class="form-field">
            <label class="form-label" for="cf-name">Seu nome completo</label>
            <input class="form-input" id="cf-name" type="text" placeholder="Ex: Maria Silva" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="cf-guests">Número de acompanhantes</label>
            <select class="form-select" id="cf-guests">
              <option value="0">Somente eu</option>
              <option value="1">Eu + 1 acompanhante</option>
              <option value="2">Eu + 2 acompanhantes</option>
              <option value="3">Eu + 3 acompanhantes</option>
              <option value="4">Eu + 4 ou mais</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label" for="cf-phone">WhatsApp (opcional)</label>
            <input class="form-input" id="cf-phone" type="tel" placeholder="(83) 99999-9999" />
          </div>
          <button type="submit" class="form-submit">✓ Confirmar Minha Presença</button>
        </form>

        <!-- Mensagem de sucesso -->
        <div class="form-success" id="confirm-success">
          <div class="form-success-icon">✓</div>
          <div class="form-success-title">Presença confirmada!</div>
          <p class="form-success-text">Ficamos muito felizes! Te esperamos no dia 28 de janeiro de 2027 no Restaurante O Mirante, São Gonçalo — PB.</p>
        </div>

        <button type="button" class="action-btn outline reveal" style="margin-top:16px" onclick="openCalModal()">📅 Salvar no Calendário</button>
        <a href="#" class="action-btn outline reveal" onclick="return false;">💍 Site do Casal</a>
        <a href="#" class="action-btn outline reveal" onclick="return false;">🎁 Lista de Presentes</a>
      </div>

      <!-- ── FOOTER ── -->
      <div class="footer-section">
        <img class="footer-flowers-bottom" src="/manus-storage/flowers_bottom_a04c744e.png" alt="" />
        <div class="footer-monogram reveal"><img src="/manus-storage/monograma_adaa041c.png" alt="Monograma HA" /></div>
        <div class="footer-sig reveal">Horberlan &amp; Analia</div>
        <div class="footer-date-small reveal">28 · JANEIRO · 2027</div>
      </div>

    </div>
  </div>

  <!-- ── MODAL CALENDÁRIO ── -->
  <div class="cal-modal-overlay" id="cal-modal-overlay" onclick="closeCalModal(event)">
    <div class="cal-modal">
      <div class="cal-modal-title">📅 Salvar no Calendário</div>
      <p class="cal-modal-sub">Escolha sua agenda preferida</p>
      <a class="cal-option" id="cal-google" href="#" target="_blank">
        <span class="cal-option-icon">📆</span>
        <span class="cal-option-label">Google Calendar</span>
      </a>
      <a class="cal-option" id="cal-ical" href="#" download="casamento-horberlan-analia.ics">
        <span class="cal-option-icon">🍎</span>
        <span class="cal-option-label">Apple Calendar / iCal</span>
      </a>
      <a class="cal-option" id="cal-outlook" href="#" target="_blank">
        <span class="cal-option-icon">📧</span>
        <span class="cal-option-label">Outlook / Office 365</span>
      </a>
      <button class="cal-close" onclick="closeCalModal()">Fechar</button>
    </div>
  </div>`
      }}
    />
  );
}
