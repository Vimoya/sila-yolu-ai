// Animated route with cartoon car — DE → TR

function Tree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-1" y="0" width="2" height="6" rx="0.5" fill="#3F2A06"/>
      <circle cx="0" cy="-2.5" r="5" fill="#2A6B43"/>
      <circle cx="-3.5" cy="-3.5" r="3" fill="#3FA76B"/>
      <circle cx="3" cy="-3.5" r="3" fill="#3FA76B"/>
      <circle cx="0" cy="-6" r="2.6" fill="#56C885"/>
    </g>
  );
}

function CartoonCar({ pathId, dur = '11s' }) {
  return (
    <g>
      <g>
        <line x1="-30" y1="-4" x2="-44" y2="-4" stroke="rgba(255,255,255,0.5)" strokeWidth="0.9" strokeLinecap="round" style={{ animation: 'sy-speed-line 0.5s linear infinite' }}/>
        <line x1="-30" y1="2" x2="-46" y2="2" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" strokeLinecap="round" style={{ animation: 'sy-speed-line 0.5s linear infinite 0.15s' }}/>
        <line x1="-30" y1="8" x2="-48" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeLinecap="round" style={{ animation: 'sy-speed-line 0.5s linear infinite 0.3s' }}/>
        <line x1="-30" y1="13" x2="-44" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" strokeLinecap="round" style={{ animation: 'sy-speed-line 0.5s linear infinite 0.45s' }}/>
      </g>
      <g>
        <circle cx="-32" cy="6" r="3" fill="rgba(255,255,255,0.5)">
          <animate attributeName="r" values="1.5;4;5" dur="1.4s" begin="0s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0.4;0" dur="1.4s" begin="0s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="-30;-42;-50" dur="1.4s" begin="0s" repeatCount="indefinite"/>
        </circle>
        <circle cx="-32" cy="4" r="2" fill="rgba(255,255,255,0.5)">
          <animate attributeName="r" values="1;3;4" dur="1.4s" begin="0.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.3;0" dur="1.4s" begin="0.5s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="-30;-40;-48" dur="1.4s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
      </g>
      <circle cx="40" cy="4" r="30" fill="url(#sy-headlight)"/>
      <ellipse cx="0" cy="22" rx="26" ry="3" fill="#000" opacity="0.45"/>
      <g style={{ animation: 'sy-bob 0.7s ease-in-out infinite' }}>
        <g>
          <line x1="14" y1="-12" x2="14" y2="-30" stroke="#3F2A06" strokeWidth="0.5"/>
          <circle cx="14" cy="-30" r="0.6" fill="#1F1402"/>
          <g style={{ animation: 'sy-flag-wave 0.5s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'left center' }}>
            <rect x="14" y="-30" width="8" height="5.5" fill="#E30A17"/>
            <circle cx="17" cy="-27.3" r="1.4" fill="#fff"/>
            <circle cx="17.7" cy="-27.3" r="1.1" fill="#E30A17"/>
            <circle cx="20" cy="-27.3" r="0.5" fill="#fff"/>
          </g>
        </g>
        <g style={{ animation: 'sy-luggage-wobble 1.3s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
          <rect x="-14" y="-13" width="28" height="1.2" rx="0.6" fill="#3F2A06"/>
          <rect x="-14" y="-11.2" width="28" height="0.8" rx="0.4" fill="#3F2A06"/>
          <rect x="-12" y="-20" width="24" height="7" rx="1.5" fill="#8C5F12"/>
          <rect x="-12" y="-17" width="24" height="0.6" fill="#5A4220"/>
          <rect x="-3" y="-21" width="6" height="1.4" rx="0.7" fill="#5A4220"/>
          <circle cx="-9" cy="-15" r="0.4" fill="#3F2A06"/>
          <circle cx="9" cy="-15" r="0.4" fill="#3F2A06"/>
          <ellipse cx="0" cy="-23" rx="11" ry="3.5" fill="#F5B544"/>
          <path d="M -11 -23 Q 0 -27 11 -23" stroke="#8C5F12" strokeWidth="0.5" fill="none" strokeDasharray="1.4 1.2"/>
          <line x1="-7" y1="-26" x2="-7" y2="-20" stroke="#3F2A06" strokeWidth="0.4"/>
          <line x1="7" y1="-26" x2="7" y2="-20" stroke="#3F2A06" strokeWidth="0.4"/>
          <ellipse cx="-2" cy="-27" rx="5.5" ry="2.4" fill="#56C885"/>
          <ellipse cx="-2" cy="-27" rx="5.5" ry="2.4" fill="none" stroke="#1F5A3A" strokeWidth="0.4"/>
          <path d="M -6 -27 Q -5 -29 -4 -27" stroke="#1F5A3A" strokeWidth="0.5" fill="none"/>
          <path d="M -3 -27 Q -2 -29 -1 -27" stroke="#1F5A3A" strokeWidth="0.5" fill="none"/>
          <path d="M 0 -27 Q 1 -29 2 -27" stroke="#1F5A3A" strokeWidth="0.5" fill="none"/>
          <path d="M -2 -29.5 Q -1 -30.5 0 -29.5" stroke="#1F5A3A" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
          <rect x="-15" y="-17" width="4" height="5" rx="0.8" fill="#2F4156"/>
          <rect x="-14" y="-18" width="2" height="1" rx="0.3" fill="#1A2533"/>
          <path d="M -14 -12 Q -16 -18 -11 -22" stroke="#3F2A06" strokeWidth="0.5" fill="none"/>
          <path d="M 14 -12 Q 16 -18 11 -22" stroke="#3F2A06" strokeWidth="0.5" fill="none"/>
        </g>
        <path d="M -16 -12 Q -13 -3 -12 -1 L 12 -1 Q 13 -3 16 -12 Z" fill="#B82F3A"/>
        <path d="M -13.5 -10 L -10 -3 L -1 -3 L -1 -10 Z" fill="#B4DCFF" opacity="0.75"/>
        <path d="M 1 -10 L 1 -3 L 10 -3 L 13.5 -10 Z" fill="#B4DCFF" opacity="0.75"/>
        <path d="M -12 -9 L -11 -5" stroke="#fff" strokeWidth="0.6" opacity="0.6" strokeLinecap="round"/>
        <path d="M 2 -9 L 3 -5" stroke="#fff" strokeWidth="0.6" opacity="0.6" strokeLinecap="round"/>
        <g transform="translate(-7 -6.5)">
          <ellipse cx="0" cy="-2.2" rx="2.2" ry="0.9" fill="#1F1402"/>
          <circle r="1.9" fill="#F5C8A0"/>
          <circle cx="-0.55" cy="-0.2" r="0.27" fill="#1F1402"/>
          <circle cx="0.55" cy="-0.2" r="0.27" fill="#1F1402"/>
          <path d="M -0.6 0.7 Q 0 1.1 0.6 0.7" stroke="#1F1402" strokeWidth="0.28" fill="none" strokeLinecap="round"/>
        </g>
        <g transform="translate(7 -6.5)">
          <ellipse cx="0" cy="-2.2" rx="2.2" ry="0.9" fill="#3F2A06"/>
          <circle r="1.9" fill="#E5B89A"/>
          <path d="M -0.7 0.4 Q 0 0.6 0.7 0.4" stroke="#1F1402" strokeWidth="0.45" fill="none" strokeLinecap="round"/>
          <circle cx="-0.55" cy="-0.2" r="0.27" fill="#1F1402"/>
          <circle cx="0.55" cy="-0.2" r="0.27" fill="#1F1402"/>
        </g>
        <g style={{ animation: 'sy-wave 0.55s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'right bottom' }}>
          <line x1="-14" y1="-5" x2="-17" y2="-9" stroke="#F5C8A0" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="-17" cy="-9.5" r="1.1" fill="#F5C8A0"/>
          <line x1="-17.5" y1="-10.3" x2="-17.3" y2="-11" stroke="#F5C8A0" strokeWidth="0.5" strokeLinecap="round"/>
          <line x1="-16.5" y1="-10.3" x2="-16.7" y2="-11" stroke="#F5C8A0" strokeWidth="0.5" strokeLinecap="round"/>
        </g>
        <rect x="-22" y="-2" width="44" height="16" rx="5" fill="#E63946"/>
        <rect x="-20" y="-1" width="40" height="2" rx="1" fill="#F26B7A" opacity="0.7"/>
        <line x1="0" y1="-1" x2="0" y2="12" stroke="#B82F3A" strokeWidth="0.6"/>
        <rect x="-10" y="3" width="3" height="0.8" rx="0.4" fill="#7A1F2A"/>
        <rect x="7" y="3" width="3" height="0.8" rx="0.4" fill="#7A1F2A"/>
        <circle cx="20" cy="5" r="2.2" fill="#FFE08A"/>
        <circle cx="20" cy="5" r="1" fill="#fff"/>
        <path d="M 15 11 Q 19 13 22 10" stroke="#7A1F2A" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <rect x="-22.5" y="3" width="2.5" height="3.5" rx="0.6" fill="#FFE08A"/>
        <rect x="-22.5" y="3" width="2.5" height="3.5" rx="0.6" fill="#fff" opacity="0.4"/>
        <path d="M -22 12 Q -20 14 -16 14" stroke="#7A1F2A" strokeWidth="0.6" fill="none"/>
        <path d="M 16 14 Q 20 14 22 12" stroke="#7A1F2A" strokeWidth="0.6" fill="none"/>
        <g transform="translate(-13 15)">
          <circle r="5.5" fill="#1F1402"/>
          <circle r="4.5" fill="#0a0500"/>
          <g style={{ animation: 'sy-wheel-spin 0.45s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r="3.2" fill="#5A4220"/>
            <circle r="1.2" fill="#1F1402"/>
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#F5B544" strokeWidth="0.6" strokeLinecap="round"/>
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#F5B544" strokeWidth="0.6" strokeLinecap="round"/>
            <line x1="-2.1" y1="-2.1" x2="2.1" y2="2.1" stroke="#F5B544" strokeWidth="0.5" strokeLinecap="round"/>
            <line x1="-2.1" y1="2.1" x2="2.1" y2="-2.1" stroke="#F5B544" strokeWidth="0.5" strokeLinecap="round"/>
          </g>
        </g>
        <g transform="translate(13 15)">
          <circle r="5.5" fill="#1F1402"/>
          <circle r="4.5" fill="#0a0500"/>
          <g style={{ animation: 'sy-wheel-spin 0.45s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r="3.2" fill="#5A4220"/>
            <circle r="1.2" fill="#1F1402"/>
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#F5B544" strokeWidth="0.6" strokeLinecap="round"/>
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#F5B544" strokeWidth="0.6" strokeLinecap="round"/>
            <line x1="-2.1" y1="-2.1" x2="2.1" y2="2.1" stroke="#F5B544" strokeWidth="0.5" strokeLinecap="round"/>
            <line x1="-2.1" y1="2.1" x2="2.1" y2="-2.1" stroke="#F5B544" strokeWidth="0.5" strokeLinecap="round"/>
          </g>
        </g>
      </g>
      <animateMotion dur={dur} repeatCount="indefinite" rotate="auto" calcMode="linear">
        <mpath href={`#${pathId}`}/>
      </animateMotion>
    </g>
  );
}

export function AnimatedRouteSection() {
  const W = 1100, H = 200;
  const points = [
    { x: 50,   y: 130, code: 'DE', city: 'München' },
    { x: 230,  y: 75,  code: 'AT', city: 'Wien' },
    { x: 430,  y: 130, code: 'HU', city: 'Budapest' },
    { x: 630,  y: 80,  code: 'RS', city: 'Belgrad' },
    { x: 830,  y: 135, code: 'BG', city: 'Sofia' },
    { x: 1050, y: 60,  code: 'TR', city: 'İstanbul' },
  ];
  const path = `M ${points[0].x} ${points[0].y}
    C ${points[0].x+120} ${points[0].y-60}, ${points[1].x-80} ${points[1].y+10}, ${points[1].x} ${points[1].y}
    S ${points[2].x-60} ${points[2].y+50}, ${points[2].x} ${points[2].y}
    S ${points[3].x-60} ${points[3].y-40}, ${points[3].x} ${points[3].y}
    S ${points[4].x-60} ${points[4].y+50}, ${points[4].x} ${points[4].y}
    S ${points[5].x-100} ${points[5].y-40}, ${points[5].x} ${points[5].y}`;

  const cities = [
    ['DE', 'München', '0 km'],
    ['AT', 'Wien', '405 km'],
    ['HU', 'Budapest', '648 km'],
    ['RS', 'Belgrad', '1.034 km'],
    ['BG', 'Sofia', '1.422 km'],
    ['TR', 'İstanbul', '2.380 km'],
  ];

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(180deg, rgba(245,181,68,0.06), rgba(10,12,16,0.6) 70%)', border: '1px solid var(--glass-border)', borderRadius: 32, overflow: 'hidden', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 50% 0%, rgba(245,181,68,0.10), transparent 60%), radial-gradient(50% 40% at 85% 100%, rgba(255,224,138,0.06), transparent 60%)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', padding: '40px 32px 24px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="sy-trail-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#F5B544" stopOpacity="0"/>
              <stop offset="20%" stopColor="#F5B544" stopOpacity="0.6"/>
              <stop offset="80%" stopColor="#FFE08A" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FFE08A" stopOpacity="0.5"/>
            </linearGradient>
            <radialGradient id="sy-headlight">
              <stop offset="0%" stopColor="#FFE08A" stopOpacity="0.9"/>
              <stop offset="60%" stopColor="#F5B544" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#F5B544" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="sy-horizon" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
            </linearGradient>
          </defs>
          <line x1="0" y1="195" x2={W} y2="195" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4"/>
          <path d={`M 0 180 Q 180 165 360 175 T 720 170 T ${W} 175 L ${W} 200 L 0 200 Z`} fill="url(#sy-horizon)"/>
          <g style={{ animation: 'sy-scroll-x 14s linear infinite' }}>
            {[50, 220, 380, 540, 720, 880, 1050].map((x, i) => <Tree key={'a'+i} x={x} y={172 + ((i*5)%8)} scale={0.9 + ((i%3)*0.15)}/>)}
            {[50, 220, 380, 540, 720, 880, 1050].map((x, i) => <Tree key={'b'+i} x={x+1100} y={172 + ((i*5)%8)} scale={0.9 + ((i%3)*0.15)}/>)}
          </g>
          <g opacity="0.5" style={{ animation: 'sy-scroll-x 28s linear infinite' }}>
            {[120, 320, 500, 680, 860, 1040].map((x, i) => <Tree key={'c'+i} x={x} y={166} scale={0.55}/>)}
            {[120, 320, 500, 680, 860, 1040].map((x, i) => <Tree key={'d'+i} x={x+1100} y={166} scale={0.55}/>)}
          </g>
          <path id="sy-route-anim-path" d={path} stroke="rgba(255,255,255,0.16)" strokeWidth="2" fill="none" strokeDasharray="5 9" strokeLinecap="round"/>
          <path d={path} stroke="url(#sy-trail-grad)" strokeWidth="3.5" fill="none" strokeLinecap="round" style={{ strokeDasharray: 1700, strokeDashoffset: 1700, filter: 'drop-shadow(0 0 6px #F5B544)', animation: 'sy-draw 9s linear infinite', '--sy-trail-len': 1700 }}/>
          {points.map((p, i) => {
            const accent = i === 0 || i === points.length - 1;
            return (
              <g key={i}>
                {accent && (
                  <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="#F5B544" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values="10;20;10" dur="2.4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
                  </circle>
                )}
                <circle cx={p.x} cy={p.y} r="11" fill="#0A0C10" stroke={accent ? '#F5B544' : 'rgba(255,255,255,0.25)'} strokeWidth="1.5"/>
                <circle cx={p.x} cy={p.y} r="4" fill={accent ? '#F5B544' : 'rgba(255,255,255,0.6)'}/>
                <text x={p.x} y={p.y+32} textAnchor="middle" fill={accent ? '#F5B544' : 'rgba(255,255,255,0.8)'} fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="13" letterSpacing="1">{p.code}</text>
              </g>
            );
          })}
          <CartoonCar pathId="sy-route-anim-path" dur="11s"/>
        </svg>
      </div>

      <div style={{ borderTop: '1px solid var(--line)', padding: '18px 24px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: 'rgba(10,12,16,0.5)' }}>
        {cities.map(([code, city, km], i) => {
          const accent = i === 0 || i === cities.length - 1;
          return (
            <div key={code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', borderRight: i < cities.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div className="sy-pump" style={{ fontSize: 13, color: accent ? 'var(--turkis)' : 'var(--fg-2)', fontWeight: 800 }}>{code}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{city}</div>
              <div className="sy-pump" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{km}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnimatedRouteMini() {
  const W = 340, H = 56;
  const points = [
    { x: 18,  y: 36 },
    { x: 90,  y: 18 },
    { x: 162, y: 36 },
    { x: 234, y: 18 },
    { x: 322, y: 32 },
  ];
  const codes = ['DE', 'AT', 'HU', 'RS', 'TR'];
  const path = `M ${points[0].x} ${points[0].y}
    Q ${points[0].x+30} ${points[0].y-30}, ${points[1].x} ${points[1].y}
    T ${points[2].x} ${points[2].y}
    T ${points[3].x} ${points[3].y}
    Q ${points[3].x+50} ${points[3].y+10}, ${points[4].x} ${points[4].y}`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 56, display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="sy-mini-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#F5B544" stopOpacity="0"/>
            <stop offset="50%" stopColor="#F5B544"/>
            <stop offset="100%" stopColor="#FFE08A"/>
          </linearGradient>
          <radialGradient id="sy-mini-head">
            <stop offset="0%" stopColor="#FFE08A" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#FFE08A" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <path id="sy-route-mini-path" d={path} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" strokeDasharray="3 5" strokeLinecap="round"/>
        <path d={path} stroke="url(#sy-mini-grad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ strokeDasharray: 500, strokeDashoffset: 500, filter: 'drop-shadow(0 0 3px #F5B544)', animation: 'sy-draw 7s linear infinite', '--sy-trail-len': 500 }}/>
        {points.map((p, i) => {
          const accent = i === 0 || i === points.length - 1;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#0A0C10" stroke={accent ? '#F5B544' : 'rgba(255,255,255,0.3)'} strokeWidth="1"/>
              <circle cx={p.x} cy={p.y} r="2" fill={accent ? '#F5B544' : 'rgba(255,255,255,0.7)'}/>
              <text x={p.x} y={p.y+14} textAnchor="middle" fill={accent ? '#F5B544' : 'rgba(255,255,255,0.55)'} fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="8" letterSpacing="0.5">{codes[i]}</text>
            </g>
          );
        })}
        <g>
          <circle cx="-13" cy="2" r="1.5" fill="rgba(255,255,255,0.5)">
            <animate attributeName="r" values="0.5;1.5;2" dur="1.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.3;0" dur="1.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="14" cy="1" r="10" fill="url(#sy-mini-head)"/>
          <ellipse cx="0" cy="8" rx="10" ry="1.4" fill="#000" opacity="0.4"/>
          <g style={{ animation: 'sy-bob 0.7s ease-in-out infinite' }}>
            <rect x="-5" y="-7" width="10" height="0.6" rx="0.3" fill="#3F2A06"/>
            <ellipse cx="0" cy="-9" rx="4.5" ry="1.6" fill="#F5B544"/>
            <rect x="-3" y="-9" width="6" height="2" rx="0.5" fill="#8C5F12"/>
            <path d="M -6.5 -5 Q -5.5 -1 -5 0 L 5 0 Q 5.5 -1 6.5 -5 Z" fill="#B82F3A"/>
            <path d="M -5.5 -4.2 L -4 -0.7 L -0.5 -0.7 L -0.5 -4.2 Z" fill="#B4DCFF" opacity="0.75"/>
            <path d="M 0.5 -4.2 L 0.5 -0.7 L 4 -0.7 L 5.5 -4.2 Z" fill="#B4DCFF" opacity="0.75"/>
            <rect x="-9" y="-1" width="18" height="6" rx="2" fill="#E63946"/>
            <rect x="-8" y="-0.5" width="16" height="0.8" rx="0.4" fill="#F26B7A" opacity="0.7"/>
            <circle cx="7.5" cy="1.6" r="0.9" fill="#FFE08A"/>
            <rect x="-9" y="1" width="1.2" height="1.4" rx="0.3" fill="#FFE08A"/>
            <g transform="translate(-5 5.5)">
              <circle r="2.2" fill="#1F1402"/>
              <g style={{ animation: 'sy-wheel-spin 0.4s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle r="1.2" fill="#5A4220"/>
                <line x1="-1.1" y1="0" x2="1.1" y2="0" stroke="#F5B544" strokeWidth="0.3"/>
                <line x1="0" y1="-1.1" x2="0" y2="1.1" stroke="#F5B544" strokeWidth="0.3"/>
              </g>
            </g>
            <g transform="translate(5 5.5)">
              <circle r="2.2" fill="#1F1402"/>
              <g style={{ animation: 'sy-wheel-spin 0.4s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle r="1.2" fill="#5A4220"/>
                <line x1="-1.1" y1="0" x2="1.1" y2="0" stroke="#F5B544" strokeWidth="0.3"/>
                <line x1="0" y1="-1.1" x2="0" y2="1.1" stroke="#F5B544" strokeWidth="0.3"/>
              </g>
            </g>
          </g>
          <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" calcMode="linear">
            <mpath href="#sy-route-mini-path"/>
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}
