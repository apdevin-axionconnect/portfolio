import { useEffect, useState } from 'react';
import { useOS } from '../os/OS';
import Window from './Window';
import { AppIcon } from './Icons';
import { PROFILE } from '../data/profile';

const DESKTOP_ITEMS = [
  { id: 'resume', label: 'Resume.pdf', icon: 'pdf', open: (os) => os.open('preview') },
  { id: 'projects', label: 'Projects', icon: 'folder', open: (os) => os.open('finder', { path: 'projects' }) },
  { id: 'about', label: 'About Me', icon: 'folder', open: (os) => os.open('finder', { path: 'about' }) },
];

export default function Desktop() {
  const os = useOS();
  const { windows, activeWindow, open, setPrefs, prefs, setOverlay } = os;
  const [sel, setSel] = useState(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    if (!ctx) return;
    const off = () => setCtx(null);
    window.addEventListener('pointerdown', off);
    return () => window.removeEventListener('pointerdown', off);
  }, [ctx]);

  return (
    <div
      className="desktop"
      onPointerDown={(e) => { if (e.target.classList.contains('desktop')) { setSel(null); setOverlay(null); } }}
      onContextMenu={(e) => { if (e.target.classList.contains('desktop') || e.target.closest('.desktop-icons')) { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }); } }}
    >
      <div className="desktop-icons">
        {DESKTOP_ITEMS.map((it) => (
          <div key={it.id} className={'dicon' + (sel === it.id ? ' sel' : '')} onPointerDown={(e) => { e.stopPropagation(); setSel(it.id); }} onDoubleClick={() => it.open(os)} onClick={(e) => e.nativeEvent.pointerType === 'touch' && it.open(os)}>
            <span className="ic"><AppIcon id={it.icon} /></span><span>{it.label}</span>
          </div>
        ))}
      </div>

      {windows.map((w) => <Window key={w.id} win={w} active={activeWindow?.id === w.id} />)}

      {ctx && (
        <div className="ctx-menu" style={{ left: ctx.x, top: ctx.y }} onPointerDown={(e) => e.stopPropagation()}>
          <button className="mi" onClick={() => { setCtx(null); open('finder'); }}>New Finder Window</button>
          <button className="mi" onClick={() => { setCtx(null); open('about'); }}>Get Info</button>
          <hr />
          <button className="mi" onClick={() => { setCtx(null); open('settings', { pane: 'wallpaper' }); }}>Change Wallpaper…</button>
          <button className="mi" onClick={() => { setCtx(null); setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }); }}>Toggle Dark Mode</button>
          <hr />
          <button className="mi" onClick={() => { setCtx(null); window.open(PROFILE.links.github, '_blank'); }}>Open GitHub Profile</button>
        </div>
      )}
    </div>
  );
}
