import { useEffect, useState } from 'react';
import { G } from '../components/Icons';
import { PROFILE, SKILLS, EXPERIENCE, EDUCATION, CERTS } from '../data/profile';

const DEFAULT_NOTES = [
  { id: 'About', body: PROFILE.about },
  { id: 'Now', body: 'What I am doing now\n\n' + PROFILE.now.map((n) => '• ' + n).join('\n') },
  { id: 'Skills', body: SKILLS.map((g) => `${g.group}\n${g.items.map((i) => '• ' + i).join('\n')}`).join('\n\n') },
  { id: 'Experience', body: EXPERIENCE.map((e) => `${e.role} — ${e.company}\n${e.period} · ${e.location}\n${e.bullets.map((b) => '• ' + b).join('\n')}`).join('\n\n') },
  { id: 'Education', body: EDUCATION.map((e) => `${e.degree}\n${e.school} · ${e.period}\n${e.note}`).join('\n\n') },
  { id: 'Certifications', body: CERTS.map((c) => `• ${c.name} — ${c.issuer}, ${c.year}`).join('\n') },
  { id: 'Contact', body: `Email: ${PROFILE.email}\nPhone: ${PROFILE.phone}\nGitHub: ${PROFILE.links.github}\nLinkedIn: ${PROFILE.links.linkedin}` },
];
const load = () => { try { return JSON.parse(localStorage.getItem('mp:notes')) || DEFAULT_NOTES; } catch { return DEFAULT_NOTES; } };

export default function Notes({ win }) {
  const [notes, setNotes] = useState(load);
  const [cur, setCur] = useState(win.props?.note || notes[0].id);
  const [q, setQ] = useState('');
  const [today] = useState(() => new Date());
  const [seenNote, setSeenNote] = useState(win.props?.note);
  if (win.props?.note !== seenNote) { setSeenNote(win.props?.note); if (win.props?.note) setCur(win.props.note); } // Finder opened a specific note
  useEffect(() => { localStorage.setItem('mp:notes', JSON.stringify(notes)); }, [notes]);

  const note = notes.find((n) => n.id === cur) || notes[0];
  const edit = (body) => setNotes((ns) => ns.map((n) => (n.id === note.id ? { ...n, body } : n)));
  const add = () => { const id = 'New Note ' + (notes.length + 1); setNotes((ns) => [{ id, body: '' }, ...ns]); setCur(id); };
  const del = () => { if (notes.length < 2) return; setNotes((ns) => ns.filter((n) => n.id !== note.id)); setCur(notes.find((n) => n.id !== note.id).id); };
  const reset = () => { setNotes(DEFAULT_NOTES); setCur(DEFAULT_NOTES[0].id); };
  const list = notes.filter((n) => (n.id + n.body).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="split">
      <div className="sidebar notes-side">
        <input className="field" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} style={{ height: 26, marginBottom: 6 }} />
        <h6>iCloud · Notes</h6>
        {list.map((n) => (
          <button key={n.id} className={'si nrow' + (n.id === note.id ? ' on' : '')} onClick={() => setCur(n.id)}>
            <b>{n.id}</b><span className="muted">{n.body.split('\n')[0].slice(0, 36) || 'No additional text'}</span>
          </button>
        ))}
      </div>
      <div className="main notes-main">
        <div className="notes-bar">
          <button className="tb" onClick={add} title="New note">{G.pencil}</button>
          <button className="tb" onClick={del} title="Delete note">{G.trashG}</button>
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={reset}>Reset notes</button>
        </div>
        <div className="muted" style={{ textAlign: 'center', fontSize: 11, padding: '6px 0' }}>{today.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h2 className="ntitle">{note.id}</h2>
        <textarea className="nbody" value={note.body} onChange={(e) => edit(e.target.value)} spellCheck={false} />
      </div>
    </div>
  );
}
