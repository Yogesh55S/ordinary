/**
 * Inline stroke icons copied from the portfolio design reference.
 * Decorative by default (aria-hidden). `accent` colours the two-tone pillar icons.
 */

const RED = 'var(--ol-red)';
const INK = 'var(--ol-ink)';

const ICONS = {
  arrowUpRight: () => <path d="M7 17L17 7M8 7h9v9" />,
  arrowRight: () => <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: () => <path d="M19 12H5M11 6l-6 6 6 6" />,
  check: () => <path d="M20 6L9 17l-5-5" />,
  send: () => <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  plus: () => <path d="M12 5v14M5 12h14" />,
  minus: () => <path d="M5 12h14" />,
  menu: () => <path d="M4 7h16M4 12h16M4 17h16" />,
  close: () => <path d="M6 6l12 12M18 6L6 18" />,
  mail: () => (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  linkedin: () => (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </>
  ),
  lock: () => (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  unlock: () => (
    <>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  ),
  brackets: () => <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  code: () => <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  codeSimple: () => <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  box: () => (
    <>
      <path d="M12 2l9 5v10l-9 5-9-5V7z" />
      <path d="M12 22V12M21 7l-9 5-9-5" />
    </>
  ),
  layout: () => (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 14h4" />
    </>
  ),
  database: () => (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  globe: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </>
  ),
  wrench: () => <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  chat: () => <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  clock: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  image: () => (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-9 9" />
    </>
  ),
  // Two-tone pillar icons (ink outline + red accent).
  monitorCode: (accent) => (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 20h20" />
      <path d="M10 8l-2 2 2 2M14 8l2 2-2 2" stroke={accent} />
    </>
  ),
  bulb: (accent) => (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" stroke={accent} />
    </>
  ),
  growth: (accent) => (
    <>
      <path d="M4 20v-4M9 20v-7M14 20v-5M19 20V9" />
      <path d="M4 11l5-4 4 3 7-6M16 4h4v4" stroke={accent} />
    </>
  ),
  target: (accent) => (
    <>
      <circle cx="12" cy="12" r="9" stroke={accent} />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={accent} stroke={accent} />
    </>
  ),
};

export default function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, accent = RED, className, style }) {
  const draw = ICONS[name];
  if (!draw) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {draw(accent)}
    </svg>
  );
}

export { RED, INK };
