import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS } from '../apps/registry';
import { G } from './Icons';
import { PROFILE } from '../data/profile';
import { MOD } from '../os/platform';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 10000); return () => clearInterval(t); }, []);
  return now;
}

export default function MenuBar() {
  const os = useOS();
  const { activeApp, activeWindow, open, close, minimize, toggleMax, closeApp, closeAll, setOverlay, overlay, setPower, prefs, setPrefs } = os;
  const now = useClock();
  const [openMenu, setOpenMenu] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;
    const off = (e) => { if (!barRef.current?.contains(e.target)) setOpenMenu(null); };
    window.addEventListener('pointerdown', off);
    return () => window.removeEventListener('pointerdown', off);
  }, [openMenu]);

  const app = APPS[activeApp];
  const run = (fn) => () => { setOpenMenu(null); fn?.(); };
  const win = activeWindow;

  const menus = {
    apple: [
      { l: 'About This Mac', fn: () => open('about') },
      '-',
      { l: 'System Settings…', fn: () => open('settings') },
      { l: 'App Store…', disabled: true },
      '-',
      { l: 'Recent Items', disabled: true },
      '-',
      { l: 'Force Quit All', fn: closeAll },
      '-',
      { l: 'Sleep', fn: () => setPower('sleep') },
      { l: 'Restart…', fn: () => setPower('boot') },
      { l: 'Shut Down…', fn: () => setPower('off') },
      '-',
      { l: 'Lock Screen', fn: () => { setPower('login'); } },
      { l: `Log Out ${PROFILE.name.split(' ')[0]}…`, fn: () => { closeAll(); setPower('login'); } },
    ],
    app: [
      { l: `About ${app.name}`, fn: () => open('about') },
      '-',
      { l: 'Settings…', k: `${MOD},`, fn: () => open('settings') },
      '-',
      { l: `Hide ${app.name}`, k: `${MOD}M`, fn: () => win && minimize(win.id), disabled: !win },
      '-',
      { l: `Quit ${app.name}`, fn: () => closeApp(activeApp), disabled: !win },
    ],
    File: [
      { l: 'New Window', fn: () => open(activeApp) },
      { l: 'Open Resume', fn: () => open('preview') },
      '-',
      { l: 'Close Window', k: `${MOD}W`, fn: () => win && close(win.id), disabled: !win },
    ],
    Edit: [{ l: 'Undo', k: '⌘Z', disabled: true }, { l: 'Redo', k: '⇧⌘Z', disabled: true }, '-', { l: 'Cut', k: '⌘X', disabled: true }, { l: 'Copy', k: '⌘C', disabled: true }, { l: 'Paste', k: '⌘V', disabled: true }, { l: 'Select All', k: '⌘A', disabled: true }],
    View: [
      { l: prefs.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', fn: () => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }) },
      { l: 'Change Wallpaper…', fn: () => open('settings', { pane: 'wallpaper' }) },
      '-',
      { l: 'Zoom', fn: () => win && toggleMax(win.id), disabled: !win },
    ],
    Window: [
      { l: 'Minimize', k: `${MOD}M`, fn: () => win && minimize(win.id), disabled: !win },
      { l: 'Zoom', fn: () => win && toggleMax(win.id), disabled: !win },
      '-',
      ...os.windows.map((w) => ({ l: APPS[w.app].name, fn: () => os.focus(w.id), check: w.id === win?.id })),
    ],
    Help: [{ l: 'Keyboard Shortcuts', fn: () => os.notify({ app: 'finder', title: 'Shortcuts', body: `Ctrl/⌘ Space Spotlight · ${MOD}W close · ${MOD}M minimize · F4 Launchpad` }) }, { l: 'Send Feedback…', fn: () => open('mail') }],
  };

  const names = ['apple', 'app', 'File', 'Edit', 'View', 'Window', 'Help'];
  const label = (n) => (n === 'apple' ? <span style={{ width: 15, height: 15, display: 'block' }}>{G.apple}</span> : n === 'app' ? app.name : n);

  return (
    <div className="menubar" ref={barRef}>
      {names.map((n) => (
        <div key={n} style={{ position: 'relative' }}>
          <div
            className={'item' + (n === 'app' ? ' bold' : '') + (n === 'apple' ? ' apple' : '') + (openMenu === n ? ' open' : '') + (['File', 'Edit', 'View', 'Window', 'Help'].includes(n) ? ' menu-extra' : '')}
            onPointerDown={() => setOpenMenu(openMenu === n ? null : n)}
            onPointerEnter={() => openMenu && setOpenMenu(n)}
          >
            {label(n)}
          </div>
          {openMenu === n && (
            <div className="menu-popover" style={{ left: 0, position: 'absolute', top: 27 }}>
              {menus[n].map((m, i) =>
                m === '-' ? <hr key={i} /> : (
                  <button key={i} className={'mi' + (m.disabled ? ' disabled' : '')} onClick={m.disabled ? undefined : run(m.fn)}>
                    <span style={{ position: 'absolute', left: 7, width: 12, height: 12 }}>{m.check ? G.check : null}</span>
                    {m.l}{m.k && <span className="k">{m.k}</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
      <div className="right">
        <div className="item" title="Siri" onClick={() => setOverlay('siri')}><span style={{ width: 16, height: 16, borderRadius: '50%', background: 'conic-gradient(#ff2d55,#5ac8fa,#5856d6,#ff2d55)', display: 'block' }} /></div>
        <div className="item" title="Battery">{G.battery}<span style={{ fontSize: 12 }}>100%</span></div>
        <div className="item" title="Wi-Fi" style={{ opacity: prefs.wifi ? 1 : 0.4 }}>{G.wifi}</div>
        <div className="item" title="Spotlight" onClick={() => setOverlay('spotlight')}>{G.search}</div>
        <div className={'item' + (overlay === 'cc' ? ' open' : '')} title="Control Center" onClick={() => setOverlay('cc')}>{G.cc}</div>
        <div className="item clock">
          <span className="date">{now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}&nbsp;&nbsp;</span>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
