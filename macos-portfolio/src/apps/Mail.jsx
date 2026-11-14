import { useState } from 'react';
import { useOS } from '../os/OS';
import { G } from '../components/Icons';
import { PROFILE, PROJECTS } from '../data/profile';
import { Avatar } from '../components/Login';

const first = PROFILE.name.split(' ')[0];
const INBOX = [
  { id: 1, from: PROFILE.name, subject: `Hi, I'm ${first} 👋`, time: '9:41 AM', body: `Thanks for stopping by.\n\nI'm a ${PROFILE.role.toLowerCase()} based in ${PROFILE.location}. ${PROFILE.tagline}\n\nIf you're hiring or want to collaborate, hit Reply (or the compose button) and it will open your mail client with my address filled in.\n\n— ${first}` },
  { id: 2, from: 'Projects', subject: 'What I shipped recently', time: 'Yesterday', body: PROJECTS.map((p) => `• ${p.name} (${p.year})\n  ${p.tagline}`).join('\n\n') },
  { id: 3, from: 'Links', subject: 'Where to find me', time: 'Monday', body: `GitHub: ${PROFILE.links.github}\nLinkedIn: ${PROFILE.links.linkedin}\nX: ${PROFILE.links.twitter}\nWebsite: ${PROFILE.links.website}` },
];

export default function Mail() {
  const { notify } = useOS();
  const [box, setBox] = useState('inbox');
  const [sel, setSel] = useState(INBOX[0]);
  const [compose, setCompose] = useState(null);
  const [sent, setSent] = useState([]);

  const send = (e) => {
    e.preventDefault();
    const m = { id: Date.now(), from: 'You', subject: compose.subject || '(no subject)', time: 'Now', body: compose.body };
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(compose.subject)}&body=${encodeURIComponent(compose.body)}`;
    setSent((s) => [m, ...s]); setCompose(null);
    notify({ app: 'mail', title: 'Message handed to your mail app', body: `To ${PROFILE.email}` });
  };

  const list = box === 'inbox' ? INBOX : sent;
  return (
    <div className="split">
      <div className="sidebar">
        <button className="btn primary" style={{ width: '100%', marginBottom: 8 }} onClick={() => setCompose({ subject: '', body: '' })}>{G.pencil} New Message</button>
        <h6>Favorites</h6>
        <button className={'si' + (box === 'inbox' ? ' on' : '')} onClick={() => setBox('inbox')}>{G.mailG}Inbox<span className="badge">{INBOX.length}</span></button>
        <button className={'si' + (box === 'sent' ? ' on' : '')} onClick={() => setBox('sent')}>{G.send}Sent</button>
        <button className="si">{G.doc}Drafts</button>
        <h6>Smart Mailboxes</h6>
        <button className="si">{G.star}Flagged</button>
      </div>
      <div className="mail-list">
        {list.length === 0 && <div className="muted pad">No messages</div>}
        {list.map((m) => (
          <div key={m.id} className={'mrow' + (sel?.id === m.id ? ' on' : '')} onClick={() => setSel(m)}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{m.from}</b><span className="muted" style={{ fontSize: 11 }}>{m.time}</span></div>
            <div style={{ fontWeight: 500 }}>{m.subject}</div>
            <div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.body.split('\n')[0]}</div>
          </div>
        ))}
      </div>
      <div className="main mail-read">
        {compose ? (
          <form className="compose" onSubmit={send}>
            <label>To: <input className="field" value={PROFILE.email} readOnly /></label>
            <label>Subject: <input className="field" autoFocus value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} /></label>
            <textarea className="field" rows={12} placeholder="Write something…" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setCompose(null)}>Cancel</button>
              <button type="submit" className="btn primary">{G.send} Send</button>
            </div>
          </form>
        ) : sel ? (
          <div className="pad">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <Avatar size={40} />
              <div><b>{sel.from}</b><div className="muted" style={{ fontSize: 12 }}>To: you · {sel.time}</div></div>
              <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setCompose({ subject: 'Re: ' + sel.subject, body: '' })}>Reply</button>
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>{sel.subject}</h2>
            <div className="prose" style={{ whiteSpace: 'pre-wrap' }}>{sel.body}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
