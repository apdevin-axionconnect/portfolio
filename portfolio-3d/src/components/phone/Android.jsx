import { useEffect, useRef, useState } from 'react'
// One source of truth for the content: the same file the macOS desktop reads.
import { PROFILE, PROJECTS, SKILLS, EXPERIENCE, EDUCATION } from '../../../../macos-portfolio/src/data/profile.js'
import './android.css'

const first = PROFILE.name.split(' ')[0]
const initials = PROFILE.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

// 24px glyphs, drawn for this UI (single path each, fill: currentColor)
const I = {
  phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z',
  chat: 'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 1-2z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11zM12 4c1 1.3 1.8 3.8 2 7h-4c.2-3.2 1-5.7 2-7zM5.1 13h3a15 15 0 0 0 1.3 5.4A8 8 0 0 1 5.1 13zm0-2a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11zM12 20c-1-1.3-1.8-3.8-2-7h4c-.2 3.2-1 5.7-2 7zm2.6-1.6a15 15 0 0 0 1.3-5.4h3a8 8 0 0 1-4.3 5.4z',
  photo: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 13l4.5-5.5 3.5 4 2.5-3L20 17zM16 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  calc: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 3v4h10V5zm0 6v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v4.6l3.2 1.9-1 1.7L11 12.7V7z',
  note: 'M5 3h14a2 2 0 0 1 2 2v9l-7 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm9 16.5L19.5 14H14zM7 7v2h10V7zm0 4v2h7v-2z',
  person: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z',
  gear: 'M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.5 7.5 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
  back: 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z',
  wifi: 'M12 21l-3.5-4.7a4.4 4.4 0 0 1 7 0zM4.2 10.6L2.4 8.2a12 12 0 0 1 19.2 0l-1.8 2.4a9 9 0 0 0-15.6 0zm3 4L5.4 12.2a9 9 0 0 1 13.2 0L16.8 14.6a6 6 0 0 0-9.6 0z',
  signal: 'M2 22h20V2z',
  bt: 'M11 2l6 5-4 4 4 4-6 5v-7l-3 3-1.4-1.4L11 11 6.6 6.4 8 5l3 3zm2 4.8V10l1.6-1.6zm0 7.2v3.2l1.6-1.6z',
  moon: 'M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 13.4 3.1 9 9 0 0 0 12 3z',
  dnd: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 11H7v-2h10z',
  send: 'M3 20l19-8L3 4v6l13 2-13 2z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
  trash: 'M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7z',
  finger: 'M12 3a7 7 0 0 0-7 7v3h2v-3a5 5 0 0 1 10 0v6h2v-6a7 7 0 0 0-7-7zm0 4a3 3 0 0 0-3 3v7h2v-7a1 1 0 0 1 2 0v9h2v-9a3 3 0 0 0-3-3z',
  search: 'M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z',
}
const Icon = ({ d, size = 24 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d={I[d]} /></svg>

const APPS = [
  { id: 'portfolio', name: 'About', icon: 'person' },
  { id: 'chrome', name: 'Projects', icon: 'globe' },
  { id: 'photos', name: 'Photos', icon: 'photo' },
  { id: 'keep', name: 'Notes', icon: 'note' },
  { id: 'clock', name: 'Clock', icon: 'clock' },
  { id: 'calc', name: 'Calculator', icon: 'calc' },
  { id: 'settings', name: 'Settings', icon: 'gear' },
]
const DOCK = [{ id: 'phone', name: 'Contact', icon: 'phone' }, { id: 'messages', name: 'Messages', icon: 'chat' }, { id: 'chrome', name: 'Projects', icon: 'globe' }, { id: 'photos', name: 'Photos', icon: 'photo' }]
const HUES = [265, 210, 150, 25, 340]

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), ms); return () => clearInterval(t) }, [ms])
  return now
}
const hm = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')

export default function Android() {
  const [prefs, setPrefsRaw] = useState(() => load('phone:prefs', { dark: true, hue: 265 }))
  const setPrefs = (p) => setPrefsRaw((cur) => { const n = { ...cur, ...p }; store('phone:prefs', n); return n })
  const [locked, setLocked] = useState(true)
  const [app, setApp] = useState(null)
  const [shade, setShade] = useState(false)
  const [tiles, setTiles] = useState({ wifi: true, bt: true, dnd: false })
  const now = useNow()
  const open = (id) => { setShade(false); setApp(id) }
  const home = () => { setShade(false); setApp(null) }

  const App = { phone: Contact, messages: Messages, chrome: Projects, photos: Photos, calc: Calculator, clock: Clock, keep: Keep, portfolio: About, settings: Settings }[app]
  const title = [...APPS, ...DOCK].find((a) => a.id === app)?.name

  return (
    <div className={'android' + (prefs.dark ? ' dark' : '')} style={{ '--h': prefs.hue }}>
      <div className="a-status" onClick={() => !locked && setShade((s) => !s)} role="button" aria-label="Notifications and quick settings">
        <span>{hm(now)}</span>
        <span className="a-status-r">{tiles.dnd && <Icon d="dnd" size={13} />}{tiles.wifi && <Icon d="wifi" size={14} />}<Icon d="signal" size={12} /><i className="a-batt"><b /></i></span>
      </div>

      {locked ? (
        <button className="a-lock" onClick={() => setLocked(false)} aria-label="Unlock phone">
          <div className="a-lock-date">{now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          <div className="a-lock-time"><span>{String(now.getHours() % 12 || 12).padStart(2, '0')}</span><span>{String(now.getMinutes()).padStart(2, '0')}</span></div>
          <div className="a-lock-foot"><span className="a-finger"><Icon d="finger" size={26} /></span>Tap to unlock</div>
        </button>
      ) : (
        <>
          <div className="a-home" aria-hidden={!!app}>
            <div className="a-glance"><b>{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</b><span>{first} is open to work</span></div>
            <div className="a-grid">{APPS.map((a) => <AppIcon key={a.id} a={a} open={open} />)}</div>
            <div className="a-dock">{DOCK.map((a) => <AppIcon key={a.id} a={a} open={open} bare />)}</div>
            <button className="a-search" onClick={() => open('chrome')}><Icon d="search" size={18} />Search projects</button>
          </div>
          {App && (
            <div className="a-app" key={app}>
              <div className="a-appbar"><button onClick={home} aria-label="Back"><Icon d="back" size={22} /></button><h1>{title}</h1></div>
              <div className="a-body"><App open={open} prefs={prefs} setPrefs={setPrefs} /></div>
            </div>
          )}
          {shade && (
            <div className="a-shade" onClick={(e) => e.target === e.currentTarget && setShade(false)}>
              <div className="a-qs">
                {[['wifi', 'Internet', 'wifi'], ['bt', 'Bluetooth', 'bt'], ['dnd', 'Do Not Disturb', 'dnd']].map(([k, label, ic]) => (
                  <button key={k} className={'a-tile' + (tiles[k] ? ' on' : '')} onClick={() => setTiles((t) => ({ ...t, [k]: !t[k] }))}><Icon d={ic} size={20} /><span>{label}<small>{tiles[k] ? 'On' : 'Off'}</small></span></button>
                ))}
                <button className={'a-tile' + (prefs.dark ? ' on' : '')} onClick={() => setPrefs({ dark: !prefs.dark })}><Icon d="moon" size={20} /><span>Dark theme<small>{prefs.dark ? 'On' : 'Off'}</small></span></button>
              </div>
              <button className="a-notif" onClick={() => open('portfolio')}><span className="a-av sm">{initials}</span><span><b>{PROFILE.name}</b><small>Thanks for picking up my phone. Tap to read about me.</small></span></button>
              <button className="a-notif" onClick={() => open('messages')}><span className="a-av sm"><Icon d="chat" size={16} /></span><span><b>Messages</b><small>Say hello. I usually reply fast.</small></span></button>
            </div>
          )}
        </>
      )}
      <button className="a-nav" onClick={locked ? () => setLocked(false) : home} aria-label="Home"><i /></button>
    </div>
  )
}

function AppIcon({ a, open, bare }) {
  return <button className="a-icon" onClick={() => open(a.id)}><span><Icon d={a.icon} size={26} /></span>{!bare && <small>{a.name}</small>}</button>
}

// ── apps ──
function Contact({ open }) {
  const rows = [['Phone', PROFILE.phone, 'tel:' + PROFILE.phone.replace(/\s/g, '')], ['Email', PROFILE.email, 'mailto:' + PROFILE.email], ['GitHub', PROFILE.links.github.replace('https://', ''), PROFILE.links.github], ['LinkedIn', PROFILE.links.linkedin.replace('https://', ''), PROFILE.links.linkedin]]
  return (
    <>
      <div className="a-hero"><span className="a-av">{initials}</span><h2>{PROFILE.name}</h2><p>{PROFILE.role} · {PROFILE.location}</p></div>
      <div className="a-actions">
        <a href={rows[0][2]}><span><Icon d="phone" size={20} /></span>Call</a>
        <button onClick={() => open('messages')}><span><Icon d="chat" size={20} /></span>Text</button>
        <a href={rows[1][2]}><span><Icon d="send" size={20} /></span>Email</a>
      </div>
      <div className="a-card">{rows.map(([k, v, href]) => <a key={k} className="a-row" href={href} target="_blank" rel="noreferrer"><small>{k}</small>{v}</a>)}</div>
    </>
  )
}

function Messages() {
  const [msgs, setMsgs] = useState(() => [{ text: `Hey, it's ${first}. Thanks for stopping by my room.` }, { text: 'Ask me anything, or leave a note and I will get back to you.' }])
  const [text, setText] = useState('')
  const end = useRef(null)
  const timer = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs])
  useEffect(() => () => clearTimeout(timer.current), [])
  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setMsgs((m) => [...m, { me: true, text: text.trim() }]); setText('')
    timer.current = setTimeout(() => setMsgs((m) => [...m, { text: `Got it. For a real reply, email me at ${PROFILE.email}.` }]), 900)
  }
  return (
    <div className="a-chat">
      <div className="a-msgs">{msgs.map((m, i) => <div key={i} className={'a-msg' + (m.me ? ' me' : '')}>{m.text}</div>)}<div ref={end} /></div>
      <form onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Text message" aria-label="Text message" /><button aria-label="Send"><Icon d="send" size={20} /></button></form>
    </div>
  )
}

function Projects() {
  const [cur, setCur] = useState(null)
  if (cur) return (
    <>
      <button className="a-chip" onClick={() => setCur(null)}>← All projects</button>
      <div className="a-banner" style={{ background: `linear-gradient(135deg, ${cur.color}, ${cur.color}99)` }}>{cur.name}</div>
      <p className="a-muted">{cur.year} · {cur.tech.join(' · ')}</p>
      <p>{cur.description}</p>
      <ul>{cur.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
      <div className="a-btns"><a className="a-btn" href={cur.url} target="_blank" rel="noreferrer">Open live site</a><a className="a-btn tonal" href={cur.repo} target="_blank" rel="noreferrer">Source</a></div>
    </>
  )
  return (
    <>
      <div className="a-omni"><Icon d="search" size={16} />{PROFILE.links.website.replace('https://', '')}/projects</div>
      {PROJECTS.map((p) => (
        <button key={p.slug} className="a-card a-proj" onClick={() => setCur(p)}>
          <span className="a-swatch" style={{ background: p.color }}>{p.name.slice(0, 2).toUpperCase()}</span>
          <span><b>{p.name}</b><small>{p.tagline}</small></span>
        </button>
      ))}
    </>
  )
}

function Photos() {
  const [cur, setCur] = useState(null)
  const tile = (p, i) => ({ background: p.image ? `center/cover url(${p.image})` : `radial-gradient(80% 80% at ${20 + i * 20}% 20%, ${p.color}, transparent 70%), linear-gradient(160deg, #1b1b22, #2b2b36)` })
  if (cur !== null) { const p = PROJECTS[cur]; return <button className="a-viewer" onClick={() => setCur(null)}><div style={tile(p, cur)}>{!p.image && p.name}</div><b>{p.name}</b><small>{p.tagline}</small></button> }
  return <div className="a-photos">{PROJECTS.map((p, i) => <button key={p.slug} style={tile(p, i)} onClick={() => setCur(i)} aria-label={p.name}>{!p.image && p.name}</button>)}</div>
}

const OPS = { '÷': (a, b) => a / b, '×': (a, b) => a * b, '−': (a, b) => a - b, '+': (a, b) => a + b }
function Calculator() {
  const [disp, setDisp] = useState('0'); const [acc, setAcc] = useState(null); const [op, setOp] = useState(null); const [fresh, setFresh] = useState(true)
  const fmt = (n) => { const s = String(+n.toPrecision(10)); return s.length > 11 ? n.toExponential(5) : s }
  const press = (k) => {
    if (k === 'AC') { setDisp('0'); setAcc(null); setOp(null); setFresh(true); return }
    if (k === '%') return setDisp((d) => fmt(+d / 100))
    if (k === '⌫') return setDisp((d) => (d.length > 1 ? d.slice(0, -1) : '0'))
    if (k in OPS || k === '=') { const cur = +disp; const r = op && acc !== null && !fresh ? OPS[op](acc, cur) : cur; setDisp(fmt(r)); setAcc(r); setOp(k === '=' ? null : k); setFresh(true); return }
    if (k === '.') { if (fresh) { setDisp('0.'); setFresh(false) } else if (!disp.includes('.')) setDisp(disp + '.'); return }
    if (fresh) { setDisp(k); setFresh(false) } else if (disp.length < 10) setDisp(disp === '0' ? k : disp + k)
  }
  return (
    <div className="a-calc">
      <output>{disp}</output>
      <div>{['AC', '%', '⌫', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((k) => <button key={k} className={(k in OPS ? 'op' : k === '=' ? 'eq' : /\d|\./.test(k) ? '' : 'fn') + (k === '0' ? ' wide' : '')} onClick={() => press(k)}>{k}</button>)}</div>
    </div>
  )
}

function Clock() {
  const now = useNow()
  const [run, setRun] = useState(false); const [ms, setMs] = useState(0)
  useEffect(() => { if (!run) return; const s = performance.now() - ms; const t = setInterval(() => setMs(performance.now() - s), 50); return () => clearInterval(t) }, [run]) // eslint-disable-line react-hooks/exhaustive-deps -- ms is only the resume offset
  const f = (n) => String(Math.floor(n)).padStart(2, '0')
  return (
    <>
      <div className="a-clock"><b>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</b><span>{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · {PROFILE.location}</span></div>
      <div className="a-card a-stop"><small>Stopwatch</small><b>{f(ms / 60000)}:{f((ms / 1000) % 60)}.{f((ms / 10) % 100)}</b>
        <div className="a-btns"><button className="a-btn" onClick={() => setRun((r) => !r)}>{run ? 'Pause' : ms ? 'Resume' : 'Start'}</button><button className="a-btn tonal" onClick={() => { setRun(false); setMs(0) }}>Reset</button></div>
      </div>
    </>
  )
}

function Keep() {
  const [notes, setNotes] = useState(() => load('phone:notes', [{ id: 1, text: 'Things to ask ' + first + ':\n• Favourite project?\n• Available from when?' }]))
  const update = (n) => { setNotes(n); store('phone:notes', n) }
  return (
    <>
      <button className="a-btn" onClick={() => update([{ id: Date.now(), text: '' }, ...notes])}><Icon d="plus" size={18} />New note</button>
      {notes.map((n) => (
        <div key={n.id} className="a-card a-note">
          <textarea value={n.text} rows={Math.max(2, n.text.split('\n').length)} placeholder="Take a note…" aria-label="Note" onChange={(e) => update(notes.map((x) => (x.id === n.id ? { ...x, text: e.target.value } : x)))} />
          <button onClick={() => update(notes.filter((x) => x.id !== n.id))} aria-label="Delete note"><Icon d="trash" size={16} /></button>
        </div>
      ))}
    </>
  )
}

function About() {
  return (
    <>
      <div className="a-hero"><span className="a-av">{initials}</span><h2>{PROFILE.name}</h2><p>{PROFILE.tagline}</p></div>
      <p className="a-pre">{PROFILE.about}</p>
      <h3>Skills</h3>
      {SKILLS.map((g) => <div key={g.group} className="a-skills"><small>{g.group}</small>{g.items.map((s) => <span key={s} className="a-pill">{s}</span>)}</div>)}
      <h3>Experience</h3>
      {EXPERIENCE.map((e) => <div key={e.company} className="a-card"><b>{e.role}</b><small>{e.company} · {e.period}</small><ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>)}
      <h3>Education</h3>
      {EDUCATION.map((e) => <div key={e.school} className="a-card"><b>{e.degree}</b><small>{e.school} · {e.period}</small></div>)}
    </>
  )
}

function Settings({ prefs, setPrefs }) {
  return (
    <>
      <div className="a-card a-set"><span><b>Dark theme</b><small>Easier on the eyes in this room</small></span><button className={'a-switch' + (prefs.dark ? ' on' : '')} onClick={() => setPrefs({ dark: !prefs.dark })} role="switch" aria-checked={prefs.dark} aria-label="Dark theme" /></div>
      <div className="a-card"><b>Wallpaper &amp; style</b><small>Colours across the phone follow this</small>
        <div className="a-hues">{HUES.map((h) => <button key={h} className={prefs.hue === h ? 'on' : ''} style={{ background: `hsl(${h} 70% 65%)` }} onClick={() => setPrefs({ hue: h })} aria-label={`Colour ${h}`} />)}</div>
      </div>
      <div className="a-card">{[['Device name', `${first}'s Pixel`], ['Owner', PROFILE.name], ['Android version', '16'], ['Projects installed', PROJECTS.length], ['Location', PROFILE.location]].map(([k, v]) => <div key={k} className="a-row"><small>{k}</small>{v}</div>)}</div>
    </>
  )
}
