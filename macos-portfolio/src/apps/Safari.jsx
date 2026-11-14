import { useEffect, useState } from 'react';
import { useWinProps } from './useWinProps';
import { G } from '../components/Icons';
import { PROFILE, PROJECTS } from '../data/profile';
import { ProjectIcon } from './Finder';

const HOME = 'portfolio://home';
const defaults = { tabs: [{ url: HOME, hist: [HOME] }], active: 0 };

const pretty = (u) => u.replace(/^https?:\/\//, '').replace(/^portfolio:\/\//, '');
const titleOf = (u) => (u === HOME ? 'Start Page' : u.startsWith('portfolio://projects/') ? PROJECTS.find((p) => p.slug === u.split('/').pop())?.name || 'Project' : pretty(u).split('/')[0]);

export function SafariToolbar({ win }) {
  const [p, set] = useWinProps(win, defaults);
  const tab = p.tabs[p.active];
  const [edit, setEdit] = useState(null);
  const navigate = (raw) => {
    let url = raw.trim();
    if (!url) return;
    if (!/^(https?|portfolio):\/\//.test(url)) url = url.includes('.') && !url.includes(' ') ? 'https://' + url : `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    set({ tabs: p.tabs.map((t, i) => (i === p.active ? { url, hist: [...t.hist, url] } : t)) });
    setEdit(null);
  };
  const back = () => {
    if (tab.hist.length < 2) return;
    const hist = tab.hist.slice(0, -1);
    set({ tabs: p.tabs.map((t, i) => (i === p.active ? { url: hist[hist.length - 1], hist } : t)) });
  };
  return (
    <div className="toolbar">
      <button className="tb" disabled={tab.hist.length < 2} onClick={back}>{G.back}</button>
      <button className="tb" disabled>{G.fwd}</button>
      <div className="urlbar">
        <span className="lock">{tab.url.startsWith('https') || tab.url.startsWith('portfolio') ? G.lock : null}</span>
        <input value={edit ?? pretty(tab.url)} onFocus={(e) => { setEdit(tab.url === HOME ? '' : tab.url); e.target.select(); }} onBlur={() => setEdit(null)} onChange={(e) => setEdit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && navigate(e.target.value)} placeholder="Search or enter website name" />
        <button className="tb" onClick={() => set({ rev: (p.rev || 0) + 1 })}>{G.reload}</button>
      </div>
      <button className="tb" onClick={() => tab.url.startsWith('http') && window.open(tab.url, '_blank')}>{G.share}</button>
      <button className="tb" onClick={() => set({ tabs: [...p.tabs, { url: HOME, hist: [HOME] }], active: p.tabs.length })}>{G.plus}</button>
    </div>
  );
}

export default function Safari({ win }) {
  const [p, set] = useWinProps(win, defaults);
  // other apps open Safari with { url }: turn it into a new tab once
  useEffect(() => { if (p.url) set({ url: null, tabs: [...p.tabs, { url: p.url, hist: [p.url] }], active: p.tabs.length }); }, [p.url]); // eslint-disable-line
  const tab = p.tabs[p.active];
  const go = (url) => set({ tabs: p.tabs.map((t, i) => (i === p.active ? { url, hist: [...t.hist, url] } : t)) });
  const closeTab = (i) => {
    const tabs = p.tabs.filter((_, j) => j !== i);
    if (!tabs.length) return set({ tabs: [{ url: HOME, hist: [HOME] }], active: 0 });
    set({ tabs, active: Math.min(p.active, tabs.length - 1) });
  };

  let body;
  if (tab.url === HOME) body = <StartPage go={go} />;
  else if (tab.url.startsWith('portfolio://projects/')) body = <ProjectPage slug={tab.url.split('/').pop()} go={go} />;
  else body = (
    <div className="webview">
      <div className="webnote">Some sites refuse to load inside a frame. <a href={tab.url} target="_blank" rel="noreferrer">Open in a new tab ↗</a></div>
      <iframe key={p.rev || 0} title="web" src={tab.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </div>
  );

  return (
    <div className="safari">
      {p.tabs.length > 1 && (
        <div className="tabs">
          {p.tabs.map((t, i) => (
            <div key={i} className={'tab' + (i === p.active ? ' on' : '')} onClick={() => set({ active: i })}>
              <button className="x" onClick={(e) => { e.stopPropagation(); closeTab(i); }}>×</button>{titleOf(t.url)}
            </div>
          ))}
        </div>
      )}
      {body}
    </div>
  );
}

function StartPage({ go }) {
  const favs = [
    { label: 'GitHub', url: PROFILE.links.github, c: '#24292f' },
    { label: 'LinkedIn', url: PROFILE.links.linkedin, c: '#0a66c2' },
    { label: 'X', url: PROFILE.links.twitter, c: '#000' },
    { label: 'Website', url: PROFILE.links.website, c: '#5e5ce6' },
  ];
  return (
    <div className="start">
      <h3>Favorites</h3>
      <div className="favs">
        {favs.map((f) => (
          <a key={f.label} href={f.url} target="_blank" rel="noreferrer" className="fav"><span style={{ background: f.c }}>{f.label[0]}</span>{f.label}</a>
        ))}
      </div>
      <h3>Projects</h3>
      <div className="favs">
        {PROJECTS.map((pr) => (
          <button key={pr.slug} className="fav" onClick={() => go(`portfolio://projects/${pr.slug}`)}><span style={{ background: pr.color, padding: 6 }}><ProjectIcon p={pr} /></span>{pr.name}</button>
        ))}
      </div>
      <h3>Reading List</h3>
      <div className="muted" style={{ fontSize: 12 }}>Nothing here yet. Try typing a URL above.</div>
    </div>
  );
}

function ProjectPage({ slug, go }) {
  const pr = PROJECTS.find((p) => p.slug === slug);
  if (!pr) return <div className="pad">Not found.</div>;
  const idx = PROJECTS.indexOf(pr);
  return (
    <div className="ppage">
      <div className="hero" style={{ background: `linear-gradient(135deg, ${pr.color}, ${pr.color}88)` }}>
        {pr.image ? <img src={pr.image} alt="" /> : <div className="hero-text">{pr.name}</div>}
      </div>
      <div className="pad prose" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{pr.year} · {pr.tech.join(' · ')}</div>
        <h1>{pr.name}</h1>
        <p style={{ fontSize: 16 }} className="muted">{pr.tagline}</p>
        <p>{pr.description}</p>
        <h2>Highlights</h2>
        <ul>{pr.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <a className="btn primary" href={pr.url} target="_blank" rel="noreferrer">Live site</a>
          <a className="btn" href={pr.repo} target="_blank" rel="noreferrer">Source</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 12 }}>
          {PROJECTS[idx - 1] ? <button className="btn" onClick={() => go(`portfolio://projects/${PROJECTS[idx - 1].slug}`)}>← {PROJECTS[idx - 1].name}</button> : <span />}
          {PROJECTS[idx + 1] ? <button className="btn" onClick={() => go(`portfolio://projects/${PROJECTS[idx + 1].slug}`)}>{PROJECTS[idx + 1].name} →</button> : <span />}
        </div>
      </div>
    </div>
  );
}
