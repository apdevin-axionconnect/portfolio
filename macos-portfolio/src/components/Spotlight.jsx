import { useMemo, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS, LAUNCHPAD } from '../apps/registry';
import { AppIcon, G } from './Icons';
import { PROJECTS, PROFILE } from '../data/profile';

export default function Spotlight() {
  const { open, setOverlay, setPrefs, prefs } = useOS();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);

  const items = useMemo(() => {
    const all = [
      ...LAUNCHPAD.map((id) => ({ k: 'app', icon: id, title: APPS[id].name, sub: 'Application', run: () => (id === 'siri' ? setOverlay('siri') : open(id)) })),
      ...PROJECTS.map((p) => ({ k: 'proj', icon: 'folder', title: p.name, sub: `Project · ${p.year}`, run: () => open('safari', { url: `portfolio://projects/${p.slug}` }) })),
      { k: 'doc', icon: 'pdf', title: 'Resume.pdf', sub: 'Document', run: () => open('preview') },
      { k: 'cmd', icon: 'settings', title: 'Toggle Dark Mode', sub: 'Command', run: () => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }) },
      { k: 'cmd', icon: 'mail', title: `Email ${PROFILE.name}`, sub: PROFILE.email, run: () => open('mail') },
      { k: 'cmd', icon: 'safari', title: 'GitHub', sub: PROFILE.links.github, run: () => window.open(PROFILE.links.github, '_blank') },
    ];
    const s = q.trim().toLowerCase();
    if (!s) return all.slice(0, 7);
    return all.filter((x) => (x.title + ' ' + x.sub).toLowerCase().includes(s)).slice(0, 9);
  }, [q, open, setOverlay, setPrefs, prefs.theme]);

  const go = (it) => { setOverlay(null); it?.run(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter') go(items[i]);
  };

  return (
    <div className="spotlight-wrap" onPointerDown={(e) => e.target.classList.contains('spotlight-wrap') && setOverlay(null)}>
      <div className="spotlight">
        <div className="in">{G.search}<input autoFocus placeholder="Spotlight Search" value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey} /></div>
        {items.length > 0 && (
          <div className="results">
            {items.map((it, idx) => (
              <button key={it.title} className={'r' + (idx === i ? ' on' : '')} onMouseEnter={() => setI(idx)} onClick={() => go(it)}>
                <span className="ic"><AppIcon id={it.icon} /></span>
                <span><b>{it.title}</b><span>{it.sub}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
