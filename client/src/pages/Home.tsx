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

    /* ─── OPEN ANIMATION ─── */
    /* Fase 1: aba dobra para cima */
    #envelope-screen.opening .env-flap-wrap {
      transform: perspective(1200px) rotateX(-180deg);
    }
    /* Corpo some DEPOIS que a aba termina de dobrar (delay de 1.0s) */
    #envelope-screen.opening .env-body-layer {
      opacity: 0;
      transition: opacity 0.5s ease 1.0s;
    }
    #envelope-screen.opening .tap-hint {
      opacity: 0;
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

    /* ─── CARD HEADER ─── */
    .card-header {
      background: linear-gradient(155deg, var(--olive-mid) 0%, var(--olive) 60%, #3d4535 100%);
      padding: 40px 28px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .card-header::before {
      content: '';
      position: absolute;
      top: -60px; left: -60px;
      width: 240px; height: 240px;
      border-radius: 50%;
      background: rgba(255,255,255,0.035);
    }
    .card-header::after {
      content: '';
      position: absolute;
      bottom: -50px; right: -50px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.025);
    }

    .arch-monogram {
      display: inline-block;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .arch-monogram img {
      width: 120px;
      height: 120px;
      display: block;
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
    }

    .estd-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }
    .estd-row span {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 4px;
      color: rgba(245,240,232,0.55);
      text-transform: uppercase;
    }
    .estd-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--gold-light);
      opacity: 0.6;
    }

    .header-verse {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 13px;
      color: rgba(245,240,232,0.72);
      line-height: 1.7;
      max-width: 260px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* ─── CARD BODY ─── */
    .card-body {
      padding: 36px 28px 28px;
      text-align: center;
      background: var(--white);
      position: relative;
    }
    .card-body::before {
      content: '';
      position: absolute;
      top: 0; left: 28px; right: 28px;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-pale), transparent);
    }

    /* Staggered reveal */
    .reveal {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.9s ease, transform 0.9s ease;
    }
    #invite-wrapper.visible .reveal { opacity: 1; transform: translateY(0); }
    #invite-wrapper.visible .reveal:nth-child(1)  { transition-delay: 0.3s; }
    #invite-wrapper.visible .reveal:nth-child(2)  { transition-delay: 0.45s; }
    #invite-wrapper.visible .reveal:nth-child(3)  { transition-delay: 0.58s; }
    #invite-wrapper.visible .reveal:nth-child(4)  { transition-delay: 0.7s; }
    #invite-wrapper.visible .reveal:nth-child(5)  { transition-delay: 0.82s; }
    #invite-wrapper.visible .reveal:nth-child(6)  { transition-delay: 0.94s; }
    #invite-wrapper.visible .reveal:nth-child(7)  { transition-delay: 1.06s; }
    #invite-wrapper.visible .reveal:nth-child(8)  { transition-delay: 1.18s; }
    #invite-wrapper.visible .reveal:nth-child(9)  { transition-delay: 1.3s; }
    #invite-wrapper.visible .reveal:nth-child(10) { transition-delay: 1.42s; }
    #invite-wrapper.visible .reveal:nth-child(11) { transition-delay: 1.54s; }
    #invite-wrapper.visible .reveal:nth-child(12) { transition-delay: 1.66s; }

    .handwritten-phrase {
      font-family: 'Great Vibes', cursive;
      font-size: 26px;
      color: var(--olive-light);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .couple-names { margin: 8px 0 20px; }
    .name-line {
      font-family: 'Great Vibes', cursive;
      color: var(--olive);
      line-height: 1.1;
    }
    .name-line.name-1   { font-size: 52px; }
    .name-line.ampersand { font-size: 34px; color: var(--gold); }
    .name-line.name-2   { font-size: 52px; }

    .invite-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: var(--text-mid);
      letter-spacing: 0.3px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .ornament-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 auto 24px;
      max-width: 200px;
    }
    .ornament-divider::before,
    .ornament-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-light), transparent);
    }
    .ornament-divider span { color: var(--gold); font-size: 13px; }

    .date-block {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .date-unit { text-align: center; padding: 0 20px; }
    .date-unit .num {
      font-family: 'Cinzel', serif;
      font-size: 34px;
      font-weight: 500;
      color: var(--olive);
      line-height: 1;
      letter-spacing: 1px;
    }
    .date-unit .label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 3px;
      color: var(--olive-light);
      text-transform: uppercase;
      margin-top: 4px;
    }
    .date-sep {
      width: 1px; height: 42px;
      background: linear-gradient(to bottom, transparent, var(--gold-light), transparent);
      flex-shrink: 0;
    }

    .year-tag {
      font-family: 'Cinzel', serif;
      font-size: 12px;
      letter-spacing: 5px;
      color: var(--olive-light);
      margin-bottom: 24px;
    }

    .location-block { margin-bottom: 30px; }
    .location-block p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      color: var(--text-mid);
      line-height: 1.8;
    }
    .location-name {
      font-family: 'Cinzel', serif !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      color: var(--olive) !important;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    .buttons-label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 4px;
      color: var(--olive-light);
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .invite-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 15px 24px;
      border: 1.5px solid rgba(74,82,64,0.32);
      border-radius: 50px;
      background: transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .invite-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--olive-mid) 0%, var(--olive) 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .invite-btn:hover { border-color: var(--olive); box-shadow: 0 4px 18px rgba(74,82,64,0.18); }
    .invite-btn:hover::before { transform: scaleX(1); }
    .invite-btn:hover .btn-icon,
    .invite-btn:hover .btn-text { color: var(--cream); }
    .invite-btn:active { transform: scale(0.97); }

    .btn-icon {
      font-size: 16px;
      position: relative; z-index: 1;
      transition: color 0.35s ease;
      flex-shrink: 0; width: 22px; text-align: center;
      color: var(--olive-light);
    }
    .btn-text {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 2.5px;
      color: var(--olive);
      text-transform: uppercase;
      position: relative; z-index: 1;
      transition: color 0.35s ease;
      flex: 1; text-align: left;
    }

    /* ─── CARD FOOTER ─── */
    .card-footer {
      padding: 20px 28px 26px;
      text-align: center;
      background: var(--cream);
      position: relative;
    }
    .card-footer::before {
      content: '';
      position: absolute;
      top: 0; left: 28px; right: 28px;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-pale), transparent);
    }
    .footer-sig {
      font-family: 'Great Vibes', cursive;
      font-size: 26px;
      color: var(--olive-light);
    }
    .footer-date-small {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 3.5px;
      color: rgba(74,82,64,0.45);
      margin-top: 6px;
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
    let opened = false;

    function openEnvelope() {
      if (opened) return;
      opened = true;

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
    <img class="env-body-layer" src="/manus-storage/envelope_body_web_74094ee4.jpg" alt="Envelope" draggable="false" />

    <!-- ABA: triângulo superior com o selo (dobra para cima ao clicar) -->
    <div class="env-flap-wrap" id="env-flap">
      <img class="env-flap-img" src="/manus-storage/envelope_flap_web_7b1ba885.png" alt="Aba do envelope" draggable="false" />
    </div>

    <!-- Vignette -->
    <div class="env-overlay"></div>

    <!-- Tap hint -->
    <div class="tap-hint">
      <span class="tap-icon">☞</span>
      Toque no selo
    </div>
  </div>

  <!-- ════════════════════════════════
       INVITATION CARD
  ════════════════════════════════ -->
  <div id="invite-wrapper">
    <div id="invitation-card">

      <!-- Header -->
      <div class="card-header">
        <div class="arch-monogram">
          <img src="/manus-storage/seal_monogram_04b56b7f.png" alt="Monograma HA" />
        </div>
        <div class="estd-row">
          <span>ESTD</span>
          <div class="estd-dot"></div>
          <span>2025</span>
        </div>
        <p class="header-verse">
          "Grandes coisas fez o Senhor por nós,<br/>
          e por isso estamos alegres."<br/>
          <em>— Salmos 126:3</em>
        </p>
      </div>

      <!-- Body -->
      <div class="card-body">

        <p class="reveal handwritten-phrase">Convidamos você</p>

        <div class="reveal couple-names">
          <div class="name-line name-1">Horberlan</div>
          <div class="name-line ampersand">&amp;</div>
          <div class="name-line name-2">Analia</div>
        </div>

        <p class="reveal invite-text">Convidam para a celebração do seu casamento</p>

        <div class="reveal ornament-divider"><span>✦</span></div>

        <div class="reveal date-block">
          <div class="date-unit">
            <div class="num">20</div>
            <div class="label">Dia</div>
          </div>
          <div class="date-sep"></div>
          <div class="date-unit">
            <div class="num">JUN</div>
            <div class="label">Mês</div>
          </div>
          <div class="date-sep"></div>
          <div class="date-unit">
            <div class="num">16h</div>
            <div class="label">Hora</div>
          </div>
        </div>

        <div class="reveal year-tag">2026</div>

        <div class="reveal location-block">
          <p class="location-name">Nome do Local</p>
          <p>Nome da rua, nº</p>
          <p>Cidade — UF</p>
        </div>

        <p class="reveal buttons-label">Toque nos botões</p>

        <div class="reveal btn-group">
          <a href="#" class="invite-btn" onclick="return false;">
            <span class="btn-icon">💍</span>
            <span class="btn-text">Site do Casal</span>
          </a>
          <a href="#" class="invite-btn" onclick="return false;">
            <span class="btn-icon">✓</span>
            <span class="btn-text">Confirmar Presença</span>
          </a>
          <a href="#" class="invite-btn" onclick="return false;">
            <span class="btn-icon">🎁</span>
            <span class="btn-text">Lista de Presentes</span>
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer reveal">
        <div class="footer-sig">Horberlan &amp; Analia</div>
        <div class="footer-date-small">20 · JUNHO · 2026</div>
      </div>

    </div>
  </div>`
      }}
    />
  );
}
