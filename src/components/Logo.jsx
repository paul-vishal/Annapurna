function Logo({ className = "w-12 h-12" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#gradient1)" />

      {/* Plate */}
      <ellipse cx="50" cy="55" rx="32" ry="30" fill="white" opacity="0.95" />
      <ellipse cx="50" cy="55" rx="28" ry="26" fill="url(#gradient2)" />

      {/* Fork */}
      <g transform="translate(28, 30)">
        <rect x="8" y="0" width="2" height="25" rx="1" fill="white" />
        <rect x="6" y="0" width="1.5" height="8" rx="0.75" fill="white" />
        <rect x="10.5" y="0" width="1.5" height="8" rx="0.75" fill="white" />
      </g>

      {/* Spoon */}
      <g transform="translate(60, 30)">
        <rect x="8" y="8" width="2" height="17" rx="1" fill="white" />
        <ellipse cx="9" cy="4" rx="3.5" ry="4" fill="white" />
      </g>

      {/* Checkmark (representing VP - Verified Planner) */}
      <g transform="translate(44, 50)">
        <path
          d="M 4 8 L 8 12 L 16 4"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;
