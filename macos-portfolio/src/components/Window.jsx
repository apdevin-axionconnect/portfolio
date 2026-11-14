import { Component, Suspense, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS } from '../apps/registry';
import { AppIcon } from './Icons';

const MIN_W = 360, MIN_H = 240;

function Window({ win, active }) {
  const { close, minimize, toggleMax, focus, update } = useOS();
  const def = APPS[win.app];
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [opening, setOpening] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOpening(false), 250); return () => clearTimeout(t); }, []);

  // Drag by title bar. Writes transform directly during drag; commits once on release.
  const onDragStart = useCallback((e) => {
    if (win.maximized || e.button !== 0 || e.target.closest('button, input, select, textarea, a')) return;
    focus(win.id);
    const sx = e.clientX, sy = e.clientY, ox = win.x, oy = win.y;
    let nx = ox, ny = oy;
    setDragging(true);
    const move = (ev) => {
      nx = ox + ev.clientX - sx;
      ny = Math.max(25, oy + ev.clientY - sy);
      ref.current.style.setProperty('--x', nx + 'px'); ref.current.style.setProperty('--y', ny + 'px');
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragging(false);
      update(win.id, { x: nx, y: ny });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [win, focus, update]);

  const onResizeStart = (dir) => (e) => {
    if (win.maximized) return;
    e.stopPropagation(); e.preventDefault();
    focus(win.id);
    const sx = e.clientX, sy = e.clientY;
    const { x, y, w, h } = win;
    let next = { x, y, w, h };
    setDragging(true);
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let nx = x, ny = y, nw = w, nh = h;
      if (dir.includes('e')) nw = Math.max(MIN_W, w + dx);
      if (dir.includes('s')) nh = Math.max(MIN_H, h + dy);
      if (dir.includes('w')) { nw = Math.max(MIN_W, w - dx); nx = x + (w - nw); }
      if (dir.includes('n')) { nh = Math.max(MIN_H, h - dy); ny = Math.max(25, y + (h - nh)); }
      next = { x: nx, y: ny, w: nw, h: nh };
      const el = ref.current;
      el.style.setProperty('--x', nx + 'px'); el.style.setProperty('--y', ny + 'px'); el.style.width = nw + 'px'; el.style.height = nh + 'px';
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragging(false);
      update(win.id, next);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const style = win.maximized
    ? { '--x': '0px', '--y': '25px', width: '100vw', height: 'calc(100vh - 25px - var(--dock-reserve, 0px))', zIndex: win.z }
    : { '--x': win.x + 'px', '--y': win.y + 'px', width: win.w, height: win.h, zIndex: win.z };

  const Comp = def.component;
  const cls = ['window', active ? '' : 'inactive', win.maximized ? 'maximized' : '', dragging ? 'dragging' : '', win.minimized ? 'minimized' : '', opening ? 'opening' : ''].join(' ');

  return (
    <div ref={ref} className={cls} style={style} onPointerDown={() => !active && focus(win.id)}>
      <div className={'titlebar' + (def.tallBar ? ' tall' : '')} onPointerDown={onDragStart} onDoubleClick={() => !def.fixed && toggleMax(win.id)} style={def.titlebarStyle}>
        <div className="lights">
          <button className="close" onClick={() => close(win.id)} aria-label="Close"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" /></svg></button>
          <button className="min" onClick={() => minimize(win.id)} aria-label="Minimize"><svg viewBox="0 0 10 10"><path d="M2 5h6" /></svg></button>
          <button className="max" disabled={def.fixed} onClick={() => toggleMax(win.id)} aria-label="Zoom"><svg viewBox="0 0 10 10"><path d="M2 6.5V8h1.5zM8 3.5V2H6.5z" /><path d="M2 8l2.6-2.6M8 2L5.4 4.6" stroke="rgba(0,0,0,0.6)" /></svg></button>
        </div>
        {def.toolbar ? <def.toolbar win={win} /> : <div className="title">{def.titleIcon && <AppIcon id={win.app} style={{ width: 16, height: 16 }} />}{win.props?.title || def.name}</div>}
      </div>
      <div className="window-body"><AppBoundary><Suspense fallback={null}><Comp win={win} {...(win.props || {})} /></Suspense></AppBoundary></div>
      {!win.maximized && !def.fixed && ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => <div key={d} className={'resize ' + d} onPointerDown={onResizeStart(d)} />)}
    </div>
  );
}

export default memo(Window);

// One app crashing must not take the whole desktop down.
export class AppBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? <div className="pad muted" style={{ userSelect: 'text' }}>This app crashed: {String(this.state.err.message)}</div> : this.props.children; }
}
