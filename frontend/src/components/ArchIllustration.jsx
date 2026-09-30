export default function ArchIllustration({ variant = "skyline", className = "" }) {
  if (variant === "plot") {
    return (
      <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="220" width="360" height="2" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        {[60, 140, 220, 300].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="60" x2={x} y2="220" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
          </g>
        ))}
        <line x1="20" y1="60" x2="380" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
        <path d="M60 60 L140 60 L140 220 L60 220 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="100" cy="140" r="3" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  if (variant === "apartment") {
    return (
      <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice">
        <rect x="130" y="40" width="140" height="240" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 4 }).map((_, col) => (
            <rect key={`${row}-${col}`} x={145 + col * 28} y={55 + row * 36} width="16" height="20"
              fill="currentColor" opacity={(row + col) % 3 === 0 ? "0.35" : "0.12"} />
          ))
        )}
        <rect x="30" y="180" width="70" height="100" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="300" y="140" width="80" height="140" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    );
  }

  // skyline (default)
  return (
    <svg viewBox="0 0 800 200" className={className} preserveAspectRatio="xMidYMid slice">
      {[
        [40, 90], [110, 130], [190, 70], [260, 150], [330, 100],
        [410, 160], [490, 85], [560, 120], [640, 95], [710, 140],
      ].map(([x, h], i) => (
        <rect key={i} x={x} y={200 - h} width="55" height={h} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      ))}
    </svg>
  );
}