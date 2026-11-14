import { useEffect, useRef } from 'react';
import { useOS } from '../os/OS';
import { G } from './Icons';

export default function ControlCenter() {
  const { prefs, setPrefs, setOverlay, open } = useOS();
  const ref = useRef(null);
  useEffect(() => {
    const off = (e) => { if (!ref.current?.contains(e.target) && !e.target.closest?.('.menubar')) setOverlay(null); };
    window.addEventListener('pointerdown', off);
    return () => window.removeEventListener('pointerdown', off);
  }, [setOverlay]);

  const dark = prefs.theme === 'dark';
  return (
    <div className="cc" ref={ref}>
      <div className="tile">
        <div className={'row' + (prefs.wifi ? ' on' : '')} onClick={() => setPrefs({ wifi: !prefs.wifi })}>
          <span className="ico">{G.wifi}</span><span className="lbl"><b>Wi-Fi</b><span>{prefs.wifi ? 'Home' : 'Off'}</span></span>
        </div>
        <div className={'row' + (prefs.bluetooth ? ' on' : '')} onClick={() => setPrefs({ bluetooth: !prefs.bluetooth })}>
          <span className="ico">{G.bt}</span><span className="lbl"><b>Bluetooth</b><span>{prefs.bluetooth ? 'On' : 'Off'}</span></span>
        </div>
        <div className="row on" onClick={() => open('mail')}>
          <span className="ico">{G.mailG}</span><span className="lbl"><b>Contact</b><span>Open Mail</span></span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
        <div className={'tile big'} onClick={() => setPrefs({ theme: dark ? 'light' : 'dark' })}>
          <span className={'ico'} style={{ background: dark ? 'var(--accent)' : 'var(--toggle-off)' }}>{dark ? G.moon : G.sun}</span><b>{dark ? 'Dark Mode' : 'Light Mode'}</b>
        </div>
        <div className="tile big" onClick={() => { setOverlay(null); open('settings'); }}>
          <span className="ico">{G.dock}</span><b>Settings</b>
        </div>
      </div>
      <div className="tile wide">
        <h5>Display</h5>
        <input className="slider" type="range" min="0.3" max="1" step="0.01" value={prefs.brightness} onChange={(e) => setPrefs({ brightness: +e.target.value })} />
      </div>
      <div className="tile wide">
        <h5>Sound</h5>
        <input className="slider" type="range" min="0" max="100" value={prefs.volume} onChange={(e) => setPrefs({ volume: +e.target.value })} />
      </div>
      <div className="tile wide" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => { setOverlay(null); open('music'); }}>
        <span style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#ff6482,#fc3c5a)', display: 'grid', placeItems: 'center' }}><span style={{ width: 18, height: 18, fill: '#fff' }}>{G.play}</span></span>
        <div><b style={{ fontSize: 12 }}>Music</b><div className="muted" style={{ fontSize: 11 }}>Open player</div></div>
      </div>
    </div>
  );
}
