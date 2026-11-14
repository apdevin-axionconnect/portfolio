import { useState } from 'react';
import { useOS, WALLPAPERS } from '../os/OS';
import { G } from '../components/Icons';
import { PROFILE, PROJECTS, SKILLS } from '../data/profile';
import { Avatar } from '../components/Login';
import { getKey, setKey, getModel, setModel } from '../os/ai';

const ACCENTS = ['#0a84ff', '#5e5ce6', '#bf5af2', '#ff375f', '#ff9f0a', '#30d158', '#8e8e93'];
const PANES = [
  { id: 'appearance', name: 'Appearance', icon: G.paint },
  { id: 'wallpaper', name: 'Wallpaper', icon: G.image },
  { id: 'dock', name: 'Desktop & Dock', icon: G.dock },
  { id: 'ai', name: 'Siri & ChatGPT', icon: G.sparkle },
  { id: 'about', name: 'About', icon: G.info },
];

export default function Settings({ win }) {
  const { prefs, setPrefs } = useOS();
  const [pane, setPane] = useState(win.props?.pane || 'appearance');
  const [seenPane, setSeenPane] = useState(win.props?.pane);
  if (win.props?.pane !== seenPane) { setSeenPane(win.props?.pane); if (win.props?.pane) setPane(win.props.pane); } // another app asked for a specific pane
  const [key, setK] = useState(getKey());
  const [model, setM] = useState(getModel());

  return (
    <div className="split">
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 12px' }}>
          <Avatar size={40} /><div><b>{PROFILE.name}</b><div className="muted" style={{ fontSize: 11 }}>{PROFILE.email}</div></div>
        </div>
        {PANES.map((p) => <button key={p.id} className={'si' + (pane === p.id ? ' on' : '')} onClick={() => setPane(p.id)}>{p.icon}{p.name}</button>)}
      </div>
      <div className="main pad settings">
        <h2>{PANES.find((p) => p.id === pane).name}</h2>

        {pane === 'appearance' && (
          <>
            <div className="card row"><span>Appearance</span>
              <div className="seg">{['light', 'dark'].map((t) => <button key={t} className={prefs.theme === t ? 'on' : ''} onClick={() => setPrefs({ theme: t })}>{t === 'light' ? 'Light' : 'Dark'}</button>)}</div>
            </div>
            <div className="card row"><span>Accent color</span>
              <div className="dots">{ACCENTS.map((c) => <button key={c} style={{ background: c, outline: prefs.accent === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} onClick={() => setPrefs({ accent: c })} />)}</div>
            </div>
          </>
        )}

        {pane === 'wallpaper' && (
          <div className="wpgrid">
            {Object.entries(WALLPAPERS).map(([id, w]) => (
              <button key={id} className={'wp' + (prefs.wallpaper === id ? ' on' : '')} onClick={() => setPrefs({ wallpaper: id })}>
                <span style={{ backgroundImage: w.css }} /><b>{w.name}</b>
              </button>
            ))}
          </div>
        )}

        {pane === 'dock' && (
          <>
            <div className="card row"><span>Dock size</span><input className="slider accent" style={{ width: 200 }} type="range" min="36" max="80" value={prefs.dockSize} onChange={(e) => setPrefs({ dockSize: +e.target.value })} /></div>
            <div className="card row"><span>Magnification</span><button className={'toggle' + (prefs.dockMagnify ? ' on' : '')} onClick={() => setPrefs({ dockMagnify: !prefs.dockMagnify })} /></div>
          </>
        )}

        {pane === 'ai' && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>ChatGPT and Siri call the OpenAI API directly from your browser. The key is stored only in this browser's localStorage.</p>
            <div className="card">
              <label style={{ display: 'block', marginBottom: 6 }}>OpenAI API key</label>
              <input className="field" type="password" placeholder="sk-…" value={key} onChange={(e) => setK(e.target.value)} onBlur={() => setKey(key)} />
              <label style={{ display: 'block', margin: '12px 0 6px' }}>Model</label>
              <select className="field" value={model} onChange={(e) => { setM(e.target.value); setModel(e.target.value); }}>
                {['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'].map((m) => <option key={m}>{m}</option>)}
              </select>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn primary" onClick={() => setKey(key)}>Save</button>
                <button className="btn" onClick={() => { setK(''); setKey(''); }}>Remove key</button>
              </div>
            </div>
          </>
        )}

        {pane === 'about' && (
          <div className="card">
            {[['Name', PROFILE.name], ['Role', PROFILE.role], ['Location', PROFILE.location], ['Projects', PROJECTS.length], ['Skills', SKILLS.reduce((n, g) => n + g.items.length, 0)], ['Email', PROFILE.email], ['OS', 'macOS Tahoe (web edition)']].map(([k, v]) => (
              <div key={k} className="kv"><span className="muted">{k}</span><span>{v}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
