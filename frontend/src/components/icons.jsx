// Minimal hand-drawn-feeling icons (SVG, currentColor, 1.5 stroke)
export const Icon = ({ children, size = 22, stroke = 1.5, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

export const IconHome = (p) => (
  <Icon {...p}>
    <path d="M4 11 L 12 4 L 20 11 L 20 20 L 14 20 L 14 14 L 10 14 L 10 20 L 4 20 Z"/>
  </Icon>
);

export const IconFootprint = (p) => (
  <Icon {...p}>
    {/* Footprint, top-down — solid silhouette so it reads at small size.
        Uses fill="currentColor" to override the parent SVG's fill="none". */}
    <g fill="currentColor" stroke="none">
      {/* Ball + arch + heel, as one tapered shape */}
      <path d="M11 6.2 C 14.2 6.2, 15.6 8.4, 15.4 10.8 C 15.2 12.6, 14 13.6, 13.2 14.6 C 12.6 15.4, 12.6 16, 12.6 16.8 C 12.6 18.8, 11.8 21, 9.6 21 C 7 21, 5.6 18.8, 5.8 16.6 C 6 14.4, 7.2 13, 7.6 11.6 C 8 10.2, 7.6 6.2, 11 6.2 Z" />
      {/* Five toes, arcing up and outward from the ball */}
      <ellipse cx="13.2" cy="4.4" rx="1.4" ry="1.7" />
      <ellipse cx="16"   cy="4.6" rx="1.1" ry="1.35" />
      <ellipse cx="18.1" cy="5.8" rx="0.9" ry="1.1" />
      <ellipse cx="19.4" cy="7.6" rx="0.78" ry="0.95" />
      <ellipse cx="19.9" cy="9.6" rx="0.66" ry="0.82" />
    </g>
  </Icon>
);

export const IconMirror = (p) => (
  <Icon {...p}>
    {/* Hand mirror */}
    <circle cx="11" cy="9" r="6" />
    <path d="M11 15 L 11 21" />
    <path d="M8 21 L 14 21" />
    <path d="M8.5 7 Q 9.5 5.5, 11 5.5" />
  </Icon>
);

export const IconSandbox = (p) => (
  <Icon {...p}>
    {/* Hourglass / question — a beaker with a swirl */}
    <path d="M7 3 L 17 3" />
    <path d="M8 3 L 8 8 L 5 19 Q 5 21, 7 21 L 17 21 Q 19 21, 19 19 L 16 8 L 16 3" />
    <path d="M7 13 Q 12 15, 17 13" opacity="0.6" />
  </Icon>
);

export const IconVault = (p) => (
  <Icon {...p}>
    {/* Padlock — slightly sketched */}
    <rect x="5" y="10" width="14" height="11" rx="1.5" />
    <path d="M8 10 L 8 7 Q 8 4, 12 4 Q 16 4, 16 7 L 16 10" />
    <circle cx="12" cy="15" r="1.3" />
    <path d="M12 16.3 L 12 18.5" />
  </Icon>
);

export const IconCadence = (p) => (
  <Icon {...p}>
    {/* Pulse / metronome-ish wave */}
    <path d="M3 14 L 6 14 L 8 9 L 11 18 L 14 6 L 16 14 L 21 14" />
  </Icon>
);

export const IconYouTube = (p) => (
  <Icon {...p} stroke={1.4}>
    <rect x="2.5" y="6" width="19" height="12" rx="3" />
    <path d="M10.5 9.5 L 15 12 L 10.5 14.5 Z" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M16 16 L 20 20" />
  </Icon>
);

export const IconArrowUp = (p) => (
  <Icon {...p} size={p.size || 14} stroke={2}>
    <path d="M12 19 L 12 5" />
    <path d="M6 11 L 12 5 L 18 11" />
  </Icon>
);

export const IconArrowDown = (p) => (
  <Icon {...p} size={p.size || 14} stroke={2}>
    <path d="M12 5 L 12 19" />
    <path d="M6 13 L 12 19 L 18 13" />
  </Icon>
);

export const IconPlay = (p) => (
  <Icon {...p}>
    <path d="M7 5 L 19 12 L 7 19 Z" fill="currentColor" stroke="none"/>
  </Icon>
);

export const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M12 4 L 12 15" />
    <path d="M7 11 L 12 16 L 17 11" />
    <path d="M5 20 L 19 20" />
  </Icon>
);

export const IconRefresh = (p) => (
  <Icon {...p}>
    <path d="M4 12 a 8 8 0 0 1 14 -5" />
    <path d="M18 4 L 18 8 L 14 8" />
    <path d="M20 12 a 8 8 0 0 1 -14 5" />
    <path d="M6 20 L 6 16 L 10 16" />
  </Icon>
);

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5 12.5 L 10 17.5 L 19 7" />
  </Icon>
);

export const IconX = (p) => (
  <Icon {...p}>
    <path d="M6 6 L 18 18" />
    <path d="M18 6 L 6 18" />
  </Icon>
);

export const IconLockOpen = (p) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="10" rx="1.5" />
    <path d="M8 11 L 8 7 Q 8 4, 12 4 Q 16 4, 16 7" />
  </Icon>
);

export const IconCalendar = (p) => (
  <Icon {...p}>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 10 L 20 10" />
    <path d="M9 3 L 9 7" />
    <path d="M15 3 L 15 7" />
  </Icon>
);

export const IconSun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2 L 12 4" />
    <path d="M12 20 L 12 22" />
    <path d="M2 12 L 4 12" />
    <path d="M20 12 L 22 12" />
    <path d="M5 5 L 6.5 6.5" />
    <path d="M17.5 17.5 L 19 19" />
    <path d="M5 19 L 6.5 17.5" />
    <path d="M17.5 6.5 L 19 5" />
  </Icon>
);

export const IconMoon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5 A 8 8 0 1 1 9.5 4 A 6.5 6.5 0 0 0 20 14.5 Z" />
  </Icon>
);

// Decorative geometric stamps for corners
export const DecoTriangle = ({ size = 36, color = "var(--red-pale)", style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    <path d="M 20 4 L 36 34 L 4 34 Z" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
export const DecoCircle = ({ size = 36, color = "var(--red-pale)", filled = false, style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    <circle cx="20" cy="20" r="14" fill={filled ? color : "none"} stroke={color} strokeWidth="1.4" />
  </svg>
);
export const DecoSquare = ({ size = 36, color = "var(--red-pale)", style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    <rect x="6" y="6" width="28" height="28" fill="none" stroke={color} strokeWidth="1.4" transform="rotate(8 20 20)" />
  </svg>
);
export const DecoCross = ({ size = 24, color = "var(--red-pale)", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path d="M12 3 L 12 21 M 3 12 L 21 12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
export const DecoDots = ({ size = 36, color = "var(--ink-faint)", style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    {[...Array(9)].map((_, i) => (
      <circle key={i} cx={6 + (i % 3) * 14} cy={6 + Math.floor(i/3) * 14} r="1.3" fill={color} />
    ))}
  </svg>
);
