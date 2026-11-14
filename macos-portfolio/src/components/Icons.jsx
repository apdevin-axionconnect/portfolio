// App icons: hand-drawn SVG in the macOS squircle style (no Apple assets).
const Squircle = ({ fill, children, id }) => (
  <svg className="appicon" viewBox="0 0 64 64">
    <defs>
      <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={fill[0]} />
        <stop offset="1" stopColor={fill[1]} />
      </linearGradient>
      <linearGradient id={`s-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M20 2h24c10 0 18 8 18 18v24c0 10-8 18-18 18H20C10 62 2 54 2 44V20C2 10 10 2 20 2z" fill={`url(#g-${id})`} />
    {children}
    <path d="M20 2h24c10 0 18 8 18 18v24c0 10-8 18-18 18H20C10 62 2 54 2 44V20C2 10 10 2 20 2z" fill={`url(#s-${id})`} opacity="0.5" />
    <path d="M20 2h24c10 0 18 8 18 18v24c0 10-8 18-18 18H20C10 62 2 54 2 44V20C2 10 10 2 20 2z" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
  </svg>
);

const ICONS = {
  finder: () => (
    <svg className="appicon" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fb4ff" /><stop offset="1" stopColor="#1a7cf0" /></linearGradient>
        <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e4e7ee" /></linearGradient>
      </defs>
      <path d="M20 2h24c10 0 18 8 18 18v24c0 10-8 18-18 18H20C10 62 2 54 2 44V20C2 10 10 2 20 2z" fill="url(#fb)" />
      <path d="M32 2h12c10 0 18 8 18 18v24c0 10-8 18-18 18H32c4-6 6-14 6-20h-5c0-8 2-14 5-18h-6z" fill="url(#fa)" />
      <path d="M32 2c-3 5-6 11-6 20h5c0 8-2 14-5 20h6" fill="none" stroke="#1a5db8" strokeWidth="1.6" />
      <ellipse cx="19" cy="26" rx="2.6" ry="3.6" fill="#1a5db8" /><ellipse cx="46" cy="26" rx="2.6" ry="3.6" fill="#fff" />
      <path d="M13 40c5 5 11 7 18 6" fill="none" stroke="#1a5db8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M33 46c7 1 13-1 18-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  safari: () => (
    <Squircle id="safari" fill={['#ffffff', '#e9ecf2']}>
      <circle cx="32" cy="32" r="24" fill="#1b8cff" />
      <circle cx="32" cy="32" r="24" fill="url(#g-safari)" opacity="0.1" />
      {[...Array(36)].map((_, i) => <line key={i} x1="32" y1="9" x2="32" y2={i % 3 === 0 ? 14 : 12} stroke="#fff" strokeWidth="1.2" transform={`rotate(${i * 10} 32 32)`} opacity="0.9" />)}
      <path d="M44 20L28 28l-8 16 16-8z" fill="#fff" /><path d="M44 20L28 28l4 4z" fill="#ff3b30" />
    </Squircle>
  ),
  notes: () => (
    <Squircle id="notes" fill={['#fff6cc', '#f7f7f7']}>
      <rect x="2" y="2" width="60" height="18" rx="0" fill="#ffd60a" />
      <path d="M2 20h60" stroke="#e0b800" strokeWidth="1" />
      {[20, 27, 34, 41, 48, 55].map((x) => <circle key={x} cx={x - 6} cy="11" r="2.2" fill="#8c7a00" opacity="0.6" />)}
      {[30, 38, 46].map((y) => <line key={y} x1="14" y1={y} x2="50" y2={y} stroke="#bdbdbd" strokeWidth="1.4" strokeLinecap="round" />)}
    </Squircle>
  ),
  terminal: () => (
    <Squircle id="terminal" fill={['#3a3a3e', '#1b1b1e']}>
      <rect x="2" y="2" width="60" height="12" rx="0" fill="#5b5b60" />
      <text x="12" y="38" fontFamily="Menlo, monospace" fontSize="16" fontWeight="700" fill="#fff">&gt;_</text>
    </Squircle>
  ),
  mail: () => (
    <Squircle id="mail" fill={['#4fb3ff', '#1e7bf5']}>
      <rect x="12" y="19" width="40" height="27" rx="4" fill="#fff" />
      <path d="M12 23l20 14 20-14" fill="none" stroke="#1e7bf5" strokeWidth="2.4" strokeLinejoin="round" />
    </Squircle>
  ),
  calculator: () => (
    <Squircle id="calc" fill={['#4a4a4e', '#1f1f23']}>
      <rect x="12" y="12" width="40" height="40" rx="5" fill="#2b2b2f" />
      <rect x="14" y="14" width="36" height="9" rx="2" fill="#fff" opacity="0.9" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '' + c} x={14 + c * 12.5} y={26 + r * 8.5} width="10" height="6.5" rx="1.5" fill={c === 2 ? '#ff9f0a' : '#8e8e93'} />))}
    </Squircle>
  ),
  photos: () => (
    <Squircle id="photos" fill={['#ffffff', '#f0f0f3']}>
      {['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa', '#007aff', '#5856d6', '#ff2d55'].map((c, i) => (
        <ellipse key={c} cx="32" cy="18" rx="7" ry="13" fill={c} opacity="0.85" transform={`rotate(${i * 45} 32 32)`} />
      ))}
    </Squircle>
  ),
  settings: () => (
    <Squircle id="settings" fill={['#8e8e93', '#5c5c61']}>
      <circle cx="32" cy="32" r="18" fill="#c9c9ce" />
      {[...Array(8)].map((_, i) => <rect key={i} x="29" y="8" width="6" height="9" rx="1.5" fill="#c9c9ce" transform={`rotate(${i * 45} 32 32)`} />)}
      <circle cx="32" cy="32" r="12" fill="#5c5c61" /><circle cx="32" cy="32" r="6" fill="#c9c9ce" />
    </Squircle>
  ),
  preview: () => (
    <Squircle id="preview" fill={['#7cc9ff', '#2d8cf0']}>
      <rect x="14" y="12" width="36" height="40" rx="3" fill="#fff" />
      <path d="M14 42l10-12 8 9 6-5 12 12v4a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="#34c759" />
      <circle cx="40" cy="22" r="4" fill="#ffcc00" />
    </Squircle>
  ),
  chatgpt: () => (
    <Squircle id="chatgpt" fill={['#1a1a1a', '#000000']}>
      <g transform="translate(32 32) scale(1.15)" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M0 -16 L13.8 -8 L13.8 8" transform={`rotate(${a})`} />)}
      </g>
    </Squircle>
  ),
  siri: () => (
    <Squircle id="siri" fill={['#1b1b1f', '#0b0b0e']}>
      <defs><radialGradient id="siri-g" cx="40%" cy="40%"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor="#9fb2ff" /><stop offset="0.7" stopColor="#ff5fb0" /><stop offset="1" stopColor="#4b2bff" /></radialGradient></defs>
      <circle cx="32" cy="32" r="20" fill="url(#siri-g)" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
    </Squircle>
  ),
  launchpad: () => (
    <Squircle id="launchpad" fill={['#f2f2f7', '#d8d8de']}>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '' + c} x={14 + c * 13} y={14 + r * 13} width="10" height="10" rx="2.5" fill={['#5856d6', '#ff9500', '#34c759', '#ff2d55', '#007aff', '#ffcc00', '#5ac8fa', '#af52de', '#ff3b30'][r * 3 + c]} />))}
    </Squircle>
  ),
  music: () => (
    <Squircle id="music" fill={['#ff6482', '#fc3c5a']}>
      <path d="M26 44a6 6 0 1 1-6-6h2V20l22-5v22a6 6 0 1 1-6-6h2V23l-14 3z" fill="#fff" />
    </Squircle>
  ),
  games: () => (
    <Squircle id="games" fill={['#3b3b40', '#1c1c20']}>
      <rect x="12" y="22" width="40" height="24" rx="12" fill="#f2f2f7" />
      <rect x="20" y="30" width="3" height="8" rx="1" fill="#1c1c20" /><rect x="17.5" y="32.5" width="8" height="3" rx="1" fill="#1c1c20" />
      <circle cx="41" cy="31" r="2.2" fill="#ff453a" /><circle cx="46" cy="35" r="2.2" fill="#30d158" /><circle cx="36" cy="35" r="2.2" fill="#0a84ff" /><circle cx="41" cy="39" r="2.2" fill="#ffd60a" />
    </Squircle>
  ),
  quest: () => (
    <Squircle id="quest" fill={['#6ec1ff', '#2a6df4']}>
      {/* pixel hero */}
      {[[28,16],[32,16],[36,16],[28,20],[32,20],[36,20],[24,24],[28,24],[32,24],[36,24],[40,24],[32,28],[28,32],[36,32],[24,36],[40,36]].map(([x,y]) => <rect key={x+'-'+y} x={x} y={y} width="4" height="4" fill="#fff" />)}
      <rect x="30" y="20" width="2" height="2" fill="#1c1c20" /><rect x="36" y="20" width="2" height="2" fill="#1c1c20" />
      <rect x="10" y="44" width="44" height="8" fill="#2c8a3c" /><rect x="10" y="52" width="44" height="6" fill="#7a4a1f" />
      <rect x="44" y="36" width="8" height="8" fill="#ffd60a" />
    </Squircle>
  ),
  trash: () => (
    <svg className="appicon" viewBox="0 0 64 64">
      <defs><linearGradient id="tr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d9dbe0" stopOpacity="0.9" /><stop offset="1" stopColor="#9a9ca3" stopOpacity="0.9" /></linearGradient></defs>
      <path d="M18 18h28l-3 38H21z" fill="url(#tr)" /><rect x="15" y="12" width="34" height="6" rx="2" fill="#c7c9cf" />
      {[24, 32, 40].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="52" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />)}
    </svg>
  ),
  folder: () => (
    <svg className="appicon" viewBox="0 0 64 64">
      <path d="M6 16a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#4fb0ff" />
      <path d="M6 24h52v25a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#7cc7ff" />
    </svg>
  ),
  pdf: () => (
    <svg className="appicon" viewBox="0 0 64 64">
      <path d="M14 6h26l12 12v40a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="#fff" stroke="#cfcfd4" />
      <path d="M40 6v12h12z" fill="#e4e4e8" />
      <rect x="12" y="34" width="34" height="14" rx="2" fill="#ff3b30" /><text x="29" y="45" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">PDF</text>
    </svg>
  ),
};

export function AppIcon({ id, style }) {
  const C = ICONS[id] || ICONS.folder;
  return <span style={{ display: 'inline-block', width: '100%', height: '100%', ...style }}><C /></span>;
}

// Small UI glyphs (fill: currentColor)
// oxlint-disable-next-line react/only-export-components -- icon table shared with AppIcon; only costs a full reload in dev
export const G = {
  apple: <svg viewBox="0 0 24 24"><path d="M16.37 12.67c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.03 2.28-1.27 3.14-2.52.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.04-2.75-4.13zM13.8 5.05c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.29.69-3.03 1.56-.66.77-1.25 2-1.09 3.18 1.15.09 2.33-.58 3.05-1.45z" /></svg>,
  search: <svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" /></svg>,
  wifi: <svg viewBox="0 0 24 24"><path d="M12 20.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm-4.3-5.2l1.5 1.5a4 4 0 0 1 5.6 0l1.5-1.5a6.1 6.1 0 0 0-8.6 0zm-3-3l1.5 1.5a8.3 8.3 0 0 1 11.6 0l1.5-1.5a10.4 10.4 0 0 0-14.6 0zM1.7 9.3l1.5 1.5a12.6 12.6 0 0 1 17.6 0l1.5-1.5a14.7 14.7 0 0 0-20.6 0z" /></svg>,
  battery: <svg viewBox="0 0 28 14"><rect x="0.5" y="0.5" width="23" height="13" rx="3.5" fill="none" stroke="currentColor" strokeOpacity="0.5" /><rect x="2" y="2" width="19" height="10" rx="2" /><path d="M25 4.5v5a2.5 2.5 0 0 0 0-5z" fillOpacity="0.5" /></svg>,
  cc: <svg viewBox="0 0 24 24"><path d="M7 4a4 4 0 1 0 0 8h10a4 4 0 1 0 0-8H7zm10 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 13a4 4 0 1 0 0 8h10a4 4 0 1 0 0-8H7zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" /></svg>,
  bt: <svg viewBox="0 0 24 24"><path d="M11 2l6 5-4 4 4 4-6 5v-7l-3 3-1.4-1.4L11 11 6.6 6.4 8 5l3 3V2zm2 4.8V10l1.6-1.6L13 6.8zm0 7.2v3.2l1.6-1.6L13 14z" /></svg>,
  moon: <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 13.4 3.1 9 9 0 0 0 12 3z" /></svg>,
  sun: <svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h0a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zM2 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm18 0a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1zM4.9 4.9a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4L4.9 6.3a1 1 0 0 1 0-1.4zm11.4 11.4a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 0-1.4zM4.9 19.1a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 0 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0zM16.3 7.7a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 0 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0z" /></svg>,
  speaker: <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-2-3.2v6.3a3.5 3.5 0 0 0 2-3.1zM13.5 4.2v2.1a6 6 0 0 1 0 11.4v2.1a8 8 0 0 0 0-15.6z" /></svg>,
  back: <svg viewBox="0 0 24 24"><path d="M15.4 5.4L14 4l-8 8 8 8 1.4-1.4L8.8 12z" /></svg>,
  fwd: <svg viewBox="0 0 24 24"><path d="M8.6 5.4L10 4l8 8-8 8-1.4-1.4 6.6-6.6z" /></svg>,
  grid: <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" /></svg>,
  list: <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z" /></svg>,
  reload: <svg viewBox="0 0 24 24"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /></svg>,
  plus: <svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>,
  share: <svg viewBox="0 0 24 24"><path d="M12 2l4 4-1.4 1.4L13 5.8V15h-2V5.8L9.4 7.4 8 6zM5 10h4v2H7v8h10v-8h-2v-2h4v12H5z" /></svg>,
  send: <svg viewBox="0 0 24 24"><path d="M12 20V7.8l-4.6 4.6L6 11l6-6 6 6-1.4 1.4L12 7.8z" /></svg>,
  trashG: <svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z" /></svg>,
  pencil: <svg viewBox="0 0 24 24"><path d="M3 17.3V21h3.7L17.8 9.9l-3.7-3.7zm17.7-10.2a1 1 0 0 0 0-1.4l-2.4-2.4a1 1 0 0 0-1.4 0L15 5.2l3.7 3.7z" /></svg>,
  lock: <svg viewBox="0 0 24 24"><path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h8V8a4 4 0 0 0-8 0z" /></svg>,
  user: <svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z" /></svg>,
  power: <svg viewBox="0 0 24 24"><path d="M11 2h2v10h-2zM7.1 5.5l1.4 1.4A6 6 0 1 0 15.5 7l1.4-1.4A8 8 0 1 1 7.1 5.5z" /></svg>,
  mic: <svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3h2a7 7 0 0 1-6 6.9V21h-2v-3.1A7 7 0 0 1 5 11h2a5 5 0 0 0 10 0z" /></svg>,
  doc: <svg viewBox="0 0 24 24"><path d="M6 2h8l6 6v14H6zm7 1.5V9h5.5zM8 12h8v2H8zm0 4h8v2H8z" /></svg>,
  star: <svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .8-5.2 4.9 1.4 7L12 17.8 5.8 21.3l1.4-7L2 9.4l7-.8z" /></svg>,
  clock: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3h2v5.4l3.5 2-1 1.7L11 13z" /></svg>,
  globe: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11zM12 4c1 1.3 1.8 3.8 2 7h-4c.2-3.2 1-5.7 2-7zM5.1 11a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11zm0 2h3a15 15 0 0 0 1.3 5.4A8 8 0 0 1 5.1 13zM12 20c-1-1.3-1.8-3.8-2-7h4c-.2 3.2-1 5.7-2 7zm2.6-1.6A15 15 0 0 0 15.9 13h3a8 8 0 0 1-4.3 5.4z" /></svg>,
  mailG: <svg viewBox="0 0 24 24"><path d="M2 5h20v14H2zm2 2v.5l8 5 8-5V7zm0 3v7h16v-7l-8 5z" /></svg>,
  tag: <svg viewBox="0 0 24 24"><path d="M2 2h9l11 11-9 9L2 11zm5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /></svg>,
  paint: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0 0 20c1 0 1.5-.8 1.5-1.5 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a6 6 0 0 0 6-6c0-5-4.5-9-10-9zM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>,
  image: <svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v9l4-4 4 4 3-3 3 3V6zm11 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" /></svg>,
  info: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 8h2v7h-2zm0-3h2v2h-2z" /></svg>,
  dock: <svg viewBox="0 0 24 24"><path d="M3 4h18v13H3zm2 2v9h14V6zM3 19h18v2H3z" /></svg>,
  stop: <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>,
  key: <svg viewBox="0 0 24 24"><path d="M7 14a4 4 0 1 1 3.9-3h10.1v2h-2v3h-2v-3h-2v3h-2v-3h-2.1A4 4 0 0 1 7 14zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>,
  sparkle: <svg viewBox="0 0 24 24"><path d="M10 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zm8 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" /></svg>,
  chevD: <svg viewBox="0 0 24 24"><path d="M12 15.4L5.6 9 7 7.6l5 5 5-5L18.4 9z" /></svg>,
  check: <svg viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.1 9 19 20 8l-1.4-1.4z" /></svg>,
  play: <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>,
  next: <svg viewBox="0 0 24 24"><path d="M6 6l8 6-8 6zM16 6h2v12h-2z" /></svg>,
  prev: <svg viewBox="0 0 24 24"><path d="M18 6l-8 6 8 6zM6 6h2v12H6z" /></svg>,
};
