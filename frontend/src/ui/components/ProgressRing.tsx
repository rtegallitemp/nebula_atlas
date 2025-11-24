export function ProgressRing({ progress, size = 60 }: { progress: number; size?: number }) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="animate-float-slow">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F0FF"/>
          <stop offset="50%" stopColor="#6B87FF"/>
          <stop offset="100%" stopColor="#A07CFF"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle
        stroke="rgba(255,255,255,0.08)"
        fill="transparent"
        strokeWidth="6"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#grad)"
        fill="transparent"
        strokeWidth="6"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ filter: "url(#glow)" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-xs fill-white/80"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}


