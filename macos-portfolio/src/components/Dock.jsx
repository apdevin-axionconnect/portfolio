import { useRef, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS, DOCK } from '../apps/registry';
import { AppIcon } from './Icons';

export default function Dock() {
  const { windows, open, prefs, setOverlay, focus } = useOS();
  const ref = useRef(null);
  const [scales, setScales] = useState({});
  const [bounce, setBounce] = useState(null);
  const size = prefs.dockSize;

  const onMove = (e) => {
    if (!prefs.dockMagnify || window.matchMedia('(pointer: coarse)').matches) return;
    const next = {};
    ref.current.querySelectorAll('.di').forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      next[el.dataset.id] = Math.max(1, 1.55 - d / 140);
    });
    setScales(next);
  };

  const launch = (id) => {
    if (id === 'launchpad') return setOverlay('launchpad');
    if (id === 'siri') return setOverlay('siri');
    const ws = windows.filter((w) => w.app === id);
    if (ws.length) return focus(ws[ws.length - 1].id);
    setBounce(id); setTimeout(() => setBounce(null), 1100);
    open(id);
  };

  const minimized = windows.filter((w) => w.minimized);
  const item = (id, extra) => (
    <div key={id} data-id={id} className={'di' + (windows.some((w) => w.app === id) ? ' running' : '') + (bounce === id ? ' bounce' : '')} style={{ transform: `scale(${scales[id] || 1})`, marginBottom: ((scales[id] || 1) - 1) * 4 }} onClick={() => (extra?.onClick ? extra.onClick() : launch(id))}>
      <span className="tip">{extra?.label || APPS[id]?.name}</span>
      <span className="ic"><AppIcon id={extra?.icon || id} /></span>
      <span className="dot" />
    </div>
  );

  return (
    <div className="dock-wrap" style={{ '--dock-size': size + 'px' }}>
      <div className="dock" ref={ref} onPointerMove={onMove} onPointerLeave={() => setScales({})}>
        {item('finder')}
        {item('launchpad', { label: 'Launchpad' })}
        {DOCK.map((id) => item(id))}
        {minimized.length > 0 && <div className="sep" />}
        {minimized.map((w) => item('min-' + w.id, { label: APPS[w.app].name, icon: w.app, onClick: () => focus(w.id) }))}
        <div className="sep" />
        {item('trash', { label: 'Trash', onClick: () => open('finder', { path: 'trash' }) })}
      </div>
    </div>
  );
}
