import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { APPS } from '../apps/registry';

const Ctx = createContext(null);
// oxlint-disable-next-line react/only-export-components -- hook lives with its provider; only costs a full reload in dev
export const useOS = () => useContext(Ctx);

const load = (k, d) => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch { return d; } };

// oxlint-disable-next-line react/only-export-components -- same as above
export const WALLPAPERS = {
  tahoe: { name: 'Tahoe', css: 'radial-gradient(120% 90% at 10% 10%, #2f6bff 0%, transparent 55%), radial-gradient(100% 80% at 90% 20%, #ff6ba9 0%, transparent 50%), radial-gradient(90% 90% at 50% 100%, #ffb55e 0%, transparent 55%), linear-gradient(160deg, #0b1b3d, #2a0f3f 60%, #4a1a3a)' },
  sequoia: { name: 'Sequoia', css: 'radial-gradient(90% 70% at 30% 20%, #6ec1ff 0%, transparent 60%), radial-gradient(80% 80% at 80% 80%, #ffd36e 0%, transparent 55%), linear-gradient(180deg, #0a2a4a, #0d5c7a 55%, #e0a95a)' },
  sonoma: { name: 'Sonoma', css: 'radial-gradient(70% 60% at 70% 30%, #ff9b6a 0%, transparent 60%), radial-gradient(60% 60% at 20% 80%, #5bb3ff 0%, transparent 60%), linear-gradient(180deg, #1a0f2e, #3c1f5a 50%, #0f2c4a)' },
  aurora: { name: 'Aurora', css: 'radial-gradient(70% 50% at 20% 30%, #00e5a0 0%, transparent 60%), radial-gradient(60% 60% at 80% 30%, #7a5cff 0%, transparent 60%), radial-gradient(90% 60% at 50% 100%, #003f6b 0%, transparent 70%), linear-gradient(180deg, #02101f, #041c33)' },
  graphite: { name: 'Graphite', css: 'radial-gradient(80% 60% at 50% 0%, #3a3a3f 0%, transparent 70%), linear-gradient(180deg, #121214, #1e1e22)' },
};

const DEFAULT_PREFS = { theme: 'dark', wallpaper: 'tahoe', accent: '#0a84ff', dockSize: 54, brightness: 1, volume: 65, wifi: true, bluetooth: true, dockMagnify: true };

export function OSProvider({ children }) {
  const [prefs, setPrefsRaw] = useState(() => load('mp:prefs', DEFAULT_PREFS));
  const setPrefs = useCallback((patch) => setPrefsRaw((p) => ({ ...p, ...patch })), []);
  useEffect(() => {
    localStorage.setItem('mp:prefs', JSON.stringify(prefs));
    const root = document.documentElement;
    root.dataset.theme = prefs.theme;
    root.style.setProperty('--accent', prefs.accent);
  }, [prefs]);

  // Standalone: full boot + login on the first visit of a browser session; later reloads wake straight to the desktop.
  // Embedded on the 3D room's monitor: always straight to the desktop. The visitor already clicked the monitor to get here,
  // a password prompt on top of that only loses people.
  const [power, setPowerRaw] = useState(() => (window.top !== window || sessionStorage.getItem('mp:booted') ? 'desktop' : 'boot')); // boot | login | desktop | sleep | off
  const setPower = useCallback((p) => { if (p === 'desktop') sessionStorage.setItem('mp:booted', '1'); if (p === 'off' || p === 'boot') sessionStorage.removeItem('mp:booted'); setPowerRaw(p); }, []);
  const [windows, setWindows] = useState([]);
  const [overlay, setOverlayRaw] = useState(null); // launchpad | spotlight | siri | cc | null
  const setOverlay = useCallback((o) => setOverlayRaw((cur) => (o && cur === o ? null : o)), []);
  const [notifications, setNotifications] = useState([]);
  const zRef = useRef(10);
  const idRef = useRef(1);

  const dismiss = useCallback((id) => setNotifications((ns) => ns.filter((x) => x.id !== id)), []);
  const notify = useCallback((n) => {
    const id = idRef.current++;
    setNotifications((ns) => [...ns, { id, ...n }]);
    setTimeout(() => setNotifications((ns) => ns.filter((x) => x.id !== id)), n.ms || 5000);
  }, []);

  const open = useCallback((app, props) => {
    if (!APPS[app]) return;
    setOverlayRaw(null);
    setWindows((ws) => {
      const ex = ws.find((w) => w.app === app);
      if (ex) return ws.map((w) => (w.id === ex.id ? { ...w, minimized: false, z: ++zRef.current, props: props ? { ...w.props, ...props } : w.props } : w));
      const def = APPS[app];
      const n = ws.length;
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = Math.min(def.w || 820, vw - 40), h = Math.min(def.h || 540, vh - 120);
      const small = vw < 760; // phones: every window opens full-screen
      return [...ws, { id: idRef.current++, app, x: Math.max(16, (vw - w) / 2 + (n % 5) * 26 - 60), y: Math.max(40, (vh - h) / 2 - 30 + (n % 5) * 22), w, h, z: ++zRef.current, minimized: false, maximized: small && !def.fixed, props }];
    });
  }, []);
  const close = useCallback((id) => setWindows((ws) => ws.filter((w) => w.id !== id)), []);
  const focus = useCallback((id) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zRef.current, minimized: false } : w))), []);
  const minimize = useCallback((id) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w))), []);
  const toggleMax = useCallback((id) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized, z: ++zRef.current } : w))), []);
  const update = useCallback((id, patch) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w))), []);
  const closeApp = useCallback((app) => setWindows((ws) => ws.filter((w) => w.app !== app)), []);
  const closeAll = useCallback(() => setWindows([]), []);

  const activeWindow = useMemo(() => windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0] || null, [windows]);
  const activeApp = activeWindow?.app || 'finder';

  const value = { prefs, setPrefs, power, setPower, windows, open, close, focus, minimize, toggleMax, update, closeApp, closeAll, activeApp, activeWindow, overlay, setOverlay, notifications, notify, dismiss };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
