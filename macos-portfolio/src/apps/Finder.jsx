import { useOS } from '../os/OS';
import { useWinProps } from './useWinProps';
import { AppIcon, G } from '../components/Icons';
import { PROFILE, PROJECTS, SKILLS, EXPERIENCE, EDUCATION, CERTS } from '../data/profile';

const md = (title, body) => ({ kind: 'md', name: title + '.md', icon: 'doc', body });

const FS = {
  home: { title: PROFILE.handle, items: [
    { kind: 'dir', name: 'About Me', path: 'about', icon: 'folder' },
    { kind: 'dir', name: 'Projects', path: 'projects', icon: 'folder' },
    { kind: 'pdf', name: 'Resume.pdf', icon: 'pdf' },
    md('Skills', SKILLS.map((g) => `${g.group}\n${g.items.map((i) => '  • ' + i).join('\n')}`).join('\n\n')),
    md('Experience', EXPERIENCE.map((e) => `${e.role} — ${e.company}\n${e.period} · ${e.location}\n${e.bullets.map((b) => '  • ' + b).join('\n')}`).join('\n\n')),
    md('Contact', `Email: ${PROFILE.email}\nPhone: ${PROFILE.phone}\n\nGitHub: ${PROFILE.links.github}\nLinkedIn: ${PROFILE.links.linkedin}\nWebsite: ${PROFILE.links.website}`),
  ] },
  about: { title: 'About Me', items: [
    md('About', PROFILE.about),
    md('Now', PROFILE.now.map((n) => '• ' + n).join('\n')),
    md('Education', EDUCATION.map((e) => `${e.degree}\n${e.school} · ${e.period}\n${e.note}`).join('\n\n')),
    md('Certifications', CERTS.map((c) => `• ${c.name} — ${c.issuer}, ${c.year}`).join('\n')),
  ] },
  projects: { title: 'Projects', items: PROJECTS.map((p) => ({ kind: 'project', name: p.name, icon: 'folder', project: p })) },
  trash: { title: 'Trash', items: [md('old-portfolio-v1', 'A neon CSS experiment that looked generated. Deleted on purpose.'), md('todo-2022', '• Center a div\n• Learn what a stack frame is')] },
};
const SIDEBAR = [
  { h: 'Favorites' }, { path: 'home', label: PROFILE.handle, icon: G.user }, { path: 'about', label: 'About Me', icon: G.doc }, { path: 'projects', label: 'Projects', icon: G.star },
  { h: 'Locations' }, { path: 'trash', label: 'Trash', icon: G.trashG },
];

export function FinderToolbar({ win }) {
  const [p, set] = useWinProps(win, { path: 'home', view: 'grid', q: '' });
  return (
    <div className="toolbar">
      <button className="tb" disabled={p.path === 'home'} onClick={() => set({ path: 'home', sel: null })}>{G.back}</button>
      <button className="tb" disabled>{G.fwd}</button>
      <b style={{ fontSize: 14, marginLeft: 4 }}>{FS[p.path]?.title}</b>
      <span style={{ marginLeft: 12, display: 'flex', background: 'var(--input-bg)', borderRadius: 6, padding: 2 }}>
        <button className="tb" style={{ background: p.view === 'grid' ? 'var(--selected)' : 'none', height: 22 }} onClick={() => set({ view: 'grid' })}>{G.grid}</button>
        <button className="tb" style={{ background: p.view === 'list' ? 'var(--selected)' : 'none', height: 22 }} onClick={() => set({ view: 'list' })}>{G.list}</button>
      </span>
      <div className="search-wrap">{G.search}<input className="search" placeholder="Search" value={p.q} onChange={(e) => set({ q: e.target.value })} /></div>
    </div>
  );
}

export default function Finder({ win }) {
  const { open } = useOS();
  const [p, set] = useWinProps(win, { path: 'home', view: 'grid', q: '' });
  const dir = FS[p.path] || FS.home;
  const items = dir.items.filter((it) => it.name.toLowerCase().includes((p.q || '').toLowerCase()));
  const sel = items.find((it) => it.name === p.sel);

  const openItem = (it) => {
    if (it.kind === 'dir') return set({ path: it.path, sel: null });
    if (it.kind === 'pdf') return open('preview');
    if (it.kind === 'project') return open('safari', { url: `portfolio://projects/${it.project.slug}` });
    if (it.kind === 'md') return open('notes', { note: it.name.replace('.md', '') });
  };

  return (
    <div className="split">
      <div className="sidebar">
        {SIDEBAR.map((s, i) => s.h ? <h6 key={i}>{s.h}</h6> : (
          <button key={s.path} className={'si' + (p.path === s.path ? ' on' : '')} onClick={() => set({ path: s.path, sel: null })}>{s.icon}{s.label}</button>
        ))}
      </div>
      <div className="main finder-main" onClick={(e) => e.target.classList.contains('finder-main') && set({ sel: null })}>
        {p.view === 'grid' ? (
          <div className="fgrid">
            {items.map((it) => (
              <div key={it.name} className={'fi' + (p.sel === it.name ? ' sel' : '')} onClick={() => (window.matchMedia('(pointer: coarse)').matches ? openItem(it) : set({ sel: it.name }))} onDoubleClick={() => openItem(it)}>
                <span className="ic">{it.kind === 'project' ? <ProjectIcon p={it.project} /> : <AppIcon id={it.icon} />}</span><span>{it.name}</span>
              </div>
            ))}
            {items.length === 0 && <div className="muted" style={{ padding: 20 }}>No items</div>}
          </div>
        ) : (
          <table className="flist">
            <thead><tr><th>Name</th><th>Kind</th><th>Date Modified</th></tr></thead>
            <tbody>{items.map((it) => (
              <tr key={it.name} className={p.sel === it.name ? 'sel' : ''} onClick={() => set({ sel: it.name })} onDoubleClick={() => openItem(it)}>
                <td><span className="ic">{it.kind === 'project' ? <ProjectIcon p={it.project} /> : <AppIcon id={it.icon} />}</span>{it.name}</td>
                <td>{{ dir: 'Folder', pdf: 'PDF Document', md: 'Markdown', project: 'Project' }[it.kind]}</td>
                <td>{it.project?.year ? `Jan 1, ${it.project.year}` : 'Today'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {sel && (
        <div className="fpreview">
          <div className="big">{sel.kind === 'project' ? <ProjectIcon p={sel.project} /> : <AppIcon id={sel.icon} />}</div>
          <b>{sel.name}</b>
          <div className="muted" style={{ fontSize: 11, marginBottom: 10 }}>{{ dir: 'Folder', pdf: 'PDF Document', md: 'Markdown document', project: `Project · ${sel.project?.year}` }[sel.kind]}</div>
          {sel.kind === 'md' && <pre className="fprev-text">{sel.body}</pre>}
          {sel.kind === 'project' && <p className="fprev-text">{sel.project.tagline}<br /><br /><span className="muted">{sel.project.tech.join(' · ')}</span></p>}
          {sel.kind === 'dir' && <p className="fprev-text muted">{FS[sel.path].items.length} items</p>}
          <button className="btn primary" style={{ marginTop: 'auto' }} onClick={() => openItem(sel)}>Open</button>
        </div>
      )}
    </div>
  );
}

export function ProjectIcon({ p }) {
  return (
    <svg className="appicon" viewBox="0 0 64 64">
      <path d="M6 16a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={p.color} />
      <path d="M6 24h52v25a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={p.color} style={{ filter: 'brightness(1.25)' }} />
      <text x="32" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="rgba(255,255,255,0.9)" fontFamily="Inter, sans-serif">{p.name.slice(0, 2).toUpperCase()}</text>
    </svg>
  );
}
