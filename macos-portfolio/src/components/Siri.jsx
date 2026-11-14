import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS, LAUNCHPAD } from '../apps/registry';
import { PROFILE, PROJECTS, SKILLS } from '../data/profile';
import { chat, getKey } from '../os/ai';
import { G } from './Icons';

const SUGGESTIONS = ['Who is this?', 'Open Projects', 'What are your skills?', 'Toggle dark mode', 'What time is it?'];

export default function Siri() {
  const os = useOS();
  const { setOverlay, open, setPrefs, prefs } = os;
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState('');
  const [a, setA] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const ref = useRef(null);
  const abort = useRef(null);

  useEffect(() => {
    const off = (e) => { if (!ref.current?.contains(e.target) && !e.target.closest?.('.menubar')) setOverlay(null); };
    window.addEventListener('pointerdown', off);
    return () => { window.removeEventListener('pointerdown', off); abort.current?.abort(); };
  }, [setOverlay]);

  // Local intents first (work offline); everything else goes to the model if a key is set.
  const local = (s) => {
    const t = s.toLowerCase();
    const appId = LAUNCHPAD.find((id) => t.includes(APPS[id].name.toLowerCase()));
    if (/^(open|launch|show)\b/.test(t) && appId) { if (appId === 'siri') return 'I am already here.'; setTimeout(() => open(appId), 400); return `Opening ${APPS[appId].name}.`; }
    if (/projects?/.test(t) && /open|show/.test(t)) { setTimeout(() => open('finder', { path: 'projects' }), 400); return 'Here are the projects.'; }
    if (/resume|cv/.test(t)) { setTimeout(() => open('preview'), 400); return `Opening ${PROFILE.name.split(' ')[0]}'s resume.`; }
    if (/dark mode|light mode|theme/.test(t)) { setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }); return `Switched to ${prefs.theme === 'dark' ? 'light' : 'dark'} mode.`; }
    if (/time/.test(t)) return `It's ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`;
    if (/date|day/.test(t) && !/update/.test(t)) return `Today is ${new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}.`;
    if (/who (is|are) (this|you)|about/.test(t)) return `This is ${PROFILE.name}, ${PROFILE.role} based in ${PROFILE.location}. ${PROFILE.tagline}`;
    if (/skills?|stack|tech/.test(t)) return SKILLS.map((g) => `${g.group}: ${g.items.join(', ')}`).join('\n');
    if (/project/.test(t)) return PROJECTS.map((p) => `• ${p.name} (${p.year}) – ${p.tagline}`).join('\n');
    if (/contact|email|hire|reach/.test(t)) { setTimeout(() => open('mail'), 400); return `You can reach ${PROFILE.name.split(' ')[0]} at ${PROFILE.email}. Opening Mail.`; }
    if (/hello|hi\b|hey/.test(t)) return `Hi! Ask me about ${PROFILE.name.split(' ')[0]}, or say "open" followed by an app name.`;
    return null;
  };

  const ask = async (text) => {
    const s = (text ?? q).trim();
    if (!s) return;
    setAsked(s); setQ(''); setA('');
    const l = local(s);
    if (l) return setA(l);
    if (!getKey()) return setA('I can open apps and answer questions about this portfolio. Add an OpenAI key in the ChatGPT app to let me answer anything else.');
    setBusy(true);
    abort.current = new AbortController();
    try {
      await chat([{ role: 'user', content: s }], { onToken: setA, signal: abort.current.signal, system: undefined });
    } catch (e) { setA(e.name === 'AbortError' ? '' : `Sorry, something went wrong: ${e.message}`); }
    setBusy(false);
  };

  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setA('Voice input is not supported in this browser. Type instead.');
    const r = new SR(); r.lang = 'en-US';
    setListening(true);
    r.onresult = (e) => { const t = e.results[0][0].transcript; setListening(false); ask(t); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
  };

  return (
    <>
      {(busy || listening) && <div className="siri-edge" />}
      <div className={'siri' + (busy || listening ? ' thinking' : '')} ref={ref}>
        <div className="head">
          <div className="orb" />
          <div className="q">{listening ? 'Listening…' : asked || `Hi, I'm Siri. Ask about ${PROFILE.name.split(' ')[0]}.`}</div>
        </div>
        {a && <div className="a">{a}</div>}
        <form onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <input className="field" autoFocus placeholder="Type or tap the mic…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="btn" onClick={listen} aria-label="Speak">{G.mic}</button>
          <button type="submit" className="btn primary">{G.send}</button>
        </form>
        {!asked && <div className="suggest">{SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
      </div>
    </>
  );
}
