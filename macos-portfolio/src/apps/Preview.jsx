import { useEffect, useState } from 'react';
import { useWinProps } from './useWinProps';
import { G } from '../components/Icons';
import { PROFILE, SKILLS, PROJECTS, EXPERIENCE, EDUCATION, CERTS } from '../data/profile';

export function PreviewToolbar({ win }) {
  const [p, set] = useWinProps(win, { zoom: 1 });
  const [hasPdf, setHasPdf] = useState(null);
  useEffect(() => { fetch(PROFILE.resumePdf, { method: 'HEAD' }).then((r) => setHasPdf(r.ok && /pdf/i.test(r.headers.get('content-type') || ''))).catch(() => setHasPdf(false)); }, []);
  return (
    <div className="toolbar">
      <div className="title" style={{ position: 'static', transform: 'none' }}>Resume.pdf</div>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <button className="tb" onClick={() => set({ zoom: Math.max(0.6, p.zoom - 0.1) })}>−</button>
        <span className="tb" style={{ minWidth: 48 }}>{Math.round(p.zoom * 100)}%</span>
        <button className="tb" onClick={() => set({ zoom: Math.min(1.6, p.zoom + 0.1) })}>+</button>
        {hasPdf ? <a className="btn primary" href={PROFILE.resumePdf} download style={{ marginLeft: 8 }}>{G.share} Download PDF</a>
          : <span className="btn" style={{ marginLeft: 8, opacity: 0.6 }} title="Add public/resume.pdf to enable">{G.share} PDF not added yet</span>}
      </span>
    </div>
  );
}

export default function Preview({ win }) {
  const [p] = useWinProps(win, { zoom: 1 });
  return (
    <div className="preview-bg">
      <div className="page" style={{ transform: `scale(${p.zoom})` }}>
        <header>
          <div><h1>{PROFILE.name}</h1><div className="sub">{PROFILE.role} · {PROFILE.location}</div></div>
          <div className="contact">{PROFILE.email}<br />{PROFILE.phone}<br />{PROFILE.links.github.replace('https://', '')}<br />{PROFILE.links.linkedin.replace('https://', '')}</div>
        </header>
        <section><h2>Summary</h2><p>{PROFILE.about.split('\n')[0]}</p></section>
        <section><h2>Experience</h2>
          {EXPERIENCE.map((e) => (
            <div key={e.company} className="entry">
              <div className="eh"><b>{e.role}</b><span>{e.period}</span></div>
              <div className="es">{e.company} · {e.location}</div>
              <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          ))}
        </section>
        <section><h2>Projects</h2>
          {PROJECTS.map((pr) => (
            <div key={pr.slug} className="entry">
              <div className="eh"><b>{pr.name}</b><span>{pr.year}</span></div>
              <div className="es">{pr.tech.join(', ')}</div>
              <p>{pr.tagline} {pr.highlights[0]}.</p>
            </div>
          ))}
        </section>
        <section><h2>Skills</h2>
          {SKILLS.map((g) => <div key={g.group} className="skill"><b>{g.group}:</b> {g.items.join(', ')}</div>)}
        </section>
        <section><h2>Education</h2>
          {EDUCATION.map((e) => <div key={e.school} className="entry"><div className="eh"><b>{e.degree}</b><span>{e.period}</span></div><div className="es">{e.school} · {e.note}</div></div>)}
        </section>
        <section><h2>Certifications</h2><p>{CERTS.map((c) => `${c.name} (${c.issuer}, ${c.year})`).join(' · ')}</p></section>
      </div>
    </div>
  );
}
