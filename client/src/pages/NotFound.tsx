import { useLocation } from "wouter";

// Mesma paleta e tipografia do convite (Home.tsx)
const OLIVE = "#4a5240";
const CREAM = "#f5f0e8";
const GOLD_LIGHT = "#d4b07a";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(175deg, ${OLIVE} 0%, #3a4232 55%, #2e3628 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 28px min(160px, 20vh)",
        textAlign: "center",
      }}
    >
      <img
        src="/manus-storage/flowers_hero_top_left_510999d2.webp"
        alt=""
        style={{
          position: "absolute",
          top: -30,
          left: -30,
          // limita pela altura para não cobrir o texto em telas baixas
          width: "min(65vw, 320px, 32vh)",
          pointerEvents: "none",
        }}
      />

      <img
        src="/manus-storage/flowers_hero_base_2051eb57.webp"
        alt=""
        style={{
          position: "absolute",
          bottom: -10,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(110vw, 500px, 50vh)",
          pointerEvents: "none",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
        }}
      />

      <img
        src="/manus-storage/monograma_adaa041c.webp"
        alt="Monograma HA"
        style={{
          position: "relative",
          width: 52,
          height: "auto",
          marginBottom: 18,
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.4))",
        }}
      />

      <span
        style={{
          position: "relative",
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          letterSpacing: 4,
          color: "rgba(245,240,232,0.65)",
          textTransform: "uppercase",
        }}
      >
        Página não encontrada
      </span>

      <h1
        style={{
          position: "relative",
          fontFamily: "'MonteCarlo', cursive",
          fontWeight: 400,
          fontSize: 72,
          lineHeight: 1.1,
          color: "rgba(245,240,232,0.95)",
          margin: "6px 0 4px",
        }}
      >
        404
      </h1>

      <p
        style={{
          position: "relative",
          fontFamily: "'Imperial Script', cursive",
          fontSize: 40,
          lineHeight: 1,
          color: "#fff",
          textShadow: "0 2px 20px rgba(0,0,0,0.35)",
          marginBottom: 16,
        }}
      >
        Convite não encontrado
      </p>

      <p
        style={{
          position: "relative",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.6,
          color: "rgba(245,240,232,0.82)",
          maxWidth: 290,
          marginBottom: 28,
        }}
      >
        Este link não corresponde a nenhum convite. Confira se ele foi copiado
        por inteiro ou fale com os noivos.
      </p>

      <button
        type="button"
        onClick={() => setLocation("/")}
        style={{
          position: "relative",
          padding: "16px 28px",
          borderRadius: 8,
          background: CREAM,
          color: OLIVE,
          border: "none",
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(0,0,0,0.2)",
        }}
      >
        Ver o convite
      </button>

      <span
        style={{
          position: "relative",
          marginTop: 22,
          fontFamily: "'Imperial Script', cursive",
          fontSize: 26,
          color: GOLD_LIGHT,
        }}
      >
        Horberlan &amp; Analia
      </span>
    </div>
  );
}
