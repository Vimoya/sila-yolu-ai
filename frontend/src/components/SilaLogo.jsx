export default function SilaLogo({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Road/route path */}
      <rect width="40" height="40" rx="12" fill="url(#grad)" />
      {/* Stylized S-curve road */}
      <path d="M8 32 Q10 20 20 20 Q30 20 32 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      {/* Car body */}
      <rect x="13" y="17" width="14" height="7" rx="2.5" fill="white"/>
      {/* Car roof */}
      <path d="M16 17 L17.5 13.5 H22.5 L24 17Z" fill="white"/>
      {/* Wheels */}
      <circle cx="16" cy="24.5" r="2" fill="#e8192c"/>
      <circle cx="24" cy="24.5" r="2" fill="#e8192c"/>
      {/* Windshield */}
      <path d="M17.2 17 L18.2 14.5 H21.8 L22.8 17Z" fill="#1a237e" opacity="0.6"/>
      {/* TR flag stripe */}
      <rect x="13" y="28" width="14" height="2" rx="1" fill="#e8192c" opacity="0.8"/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#e8192c"/>
          <stop offset="100%" stopColor="#1a237e"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
