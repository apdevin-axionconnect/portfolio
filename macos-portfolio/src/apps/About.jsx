import { useOS } from '../os/OS';
import { PROFILE, PROJECTS, SKILLS, EXPERIENCE } from '../data/profile';
import { Avatar } from '../components/Login';

export default function About() {
  const { open } = useOS();
  const rows = [
    ['Role', PROFILE.role],
    ['Based in', PROFILE.location],
    ['Projects', `${PROJECTS.length} shipped`],
    ['Skills', `${SKILLS.reduce((n, g) => n + g.items.length, 0)} and counting`],
    ['Experience', EXPERIENCE[0]?.company || '—'],
    ['Contact', PROFILE.email],
  ];
  return (
    <div className="about">
      <Avatar size={96} />
      <h2>{PROFILE.name}</h2>
      <div className="muted" style={{ marginBottom: 18 }}>{PROFILE.tagline}</div>
      {rows.map(([k, v]) => <div key={k} className="kv"><span className="muted">{k}</span><span>{v}</span></div>)}
      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <button className="btn" onClick={() => open('preview')}>Resume…</button>
        <button className="btn" onClick={() => open('settings', { pane: 'about' })}>More Info…</button>
      </div>
    </div>
  );
}
