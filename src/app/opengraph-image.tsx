import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Banlieuwood — Le jeu collaboratif de creation cinematographique";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #08090E 0%, #0E1017 50%, #15181F 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Clapper icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 64 64"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <rect x="6" y="4" width="52" height="14" rx="3" fill="#FF6B35" />
          <path d="M10 18L16 18L22 4L16 4Z" fill="#08090E" opacity="0.85" />
          <path d="M24 18L30 18L36 4L30 4Z" fill="#08090E" opacity="0.85" />
          <path d="M38 18L44 18L50 4L44 4Z" fill="#08090E" opacity="0.85" />
          <circle cx="9" cy="18" r="3" fill="#FF6B35" />
          <circle cx="55" cy="18" r="3" fill="#FF6B35" />
          <rect x="6" y="21" width="52" height="39" rx="4" fill="#FF6B35" />
          <rect x="10" y="25" width="44" height="31" rx="2.5" fill="#08090E" />
          <path d="M27 35L27 47L39 41Z" fill="#FF6B35" opacity="0.3" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "0.08em",
            display: "flex",
            background: "linear-gradient(135deg, #FF6B35, #D4A843)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          BANLIEUWOOD
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94A3B8",
            marginTop: 16,
            letterSpacing: "0.02em",
          }}
        >
          Le jeu collaboratif de creation cinematographique
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 40,
            color: "#64748B",
            fontSize: 18,
          }}
        >
          <span>5-30 joueurs</span>
          <span style={{ color: "#FF6B35" }}>•</span>
          <span>45 min</span>
          <span style={{ color: "#FF6B35" }}>•</span>
          <span>Gratuit</span>
          <span style={{ color: "#FF6B35" }}>•</span>
          <span>Sans compte</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
