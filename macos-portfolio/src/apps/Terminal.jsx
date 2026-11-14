import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/OS';
import { APPS, LAUNCHPAD } from './registry';
import { PROFILE, PROJECTS, SKILLS, EXPERIENCE } from '../data/profile';

const HELP = `Available commands:
  help          this list              about        who am I
  skills        tech stack             projects     list projects
  experience    work history           contact      how to reach me
  resume        open the resume        open <app>   launch an app
  ls / cat      browse the files       neofetch     system info
  theme         toggle dark mode       clear        clear the screen`;

export default function Terminal() {
  const { open, setPrefs, prefs } = useOS();
  const user = PROFILE.handle;
  const [lines, setLines] = useState(() => [`Last login: ${new Date().toDateString()} on ttys000`, `Type "help" to get started.`, '']);
  const [cmd, setCmd] = useState('');
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const inp = useRef(null);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView(); }, [lines]);

  const files = { 'about.md': PROFILE.about, 'skills.md': SKILLS.map((g) => `${g.group}: ${g.items.join(', ')}`).join('\n'), 'contact.md': `${PROFILE.email}\n${PROFILE.links.github}`, 'resume.pdf': '[binary] use: resume' };

  const run = (raw) => {
    const [c, ...args] = raw.trim().split(/\s+/);
    const a = args.join(' ').toLowerCase();
    switch (c) {
      case '': return [];
      case 'help': return HELP.split('\n');
      case 'about': case 'whoami': return [`${PROFILE.name} — ${PROFILE.role}`, PROFILE.tagline, PROFILE.location];
      case 'skills': return SKILLS.map((g) => `${g.group.padEnd(10)} ${g.items.join(', ')}`);
      case 'projects': return PROJECTS.map((p) => `${String(p.year).padEnd(6)} ${p.name.padEnd(20)} ${p.tagline}`);
      case 'experience': return EXPERIENCE.flatMap((e) => [`${e.role} @ ${e.company} (${e.period})`, ...e.bullets.map((b) => '  - ' + b)]);
      case 'contact': return [`email   ${PROFILE.email}`, `github  ${PROFILE.links.github}`, `linkedin ${PROFILE.links.linkedin}`];
      case 'resume': open('preview'); return ['Opening resume…'];
      case 'ls': return [Object.keys(files).join('   ')];
      case 'cat': return files[a] ? files[a].split('\n') : [`cat: ${a || ''}: No such file or directory`];
      case 'open': { const id = LAUNCHPAD.find((k) => APPS[k].name.toLowerCase() === a || k === a); if (id) { open(id); return [`Opening ${APPS[id].name}…`]; } return [`open: app not found: ${a}`]; }
      case 'theme': setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }); return ['Theme toggled.'];
      case 'clear': setLines([]); return null;
      case 'date': return [new Date().toString()];
      case 'echo': return [args.join(' ')];
      case 'pwd': return [`/Users/${user}`];
      case 'sudo': return ['Nice try.'];
      case 'exit': return ['Use the red button, this is a portfolio.'];
      case 'neofetch': return [
        `        .:'       ${user}@portfolio`,
        `    __ :'__       ----------------`,
        ` .'\`  \`-'  \`\`.    OS: macOS Tahoe (web edition)`,
        `:          .-'    Host: ${PROFILE.name}`,
        `:         :       Role: ${PROFILE.role}`,
        ` :         \`-;    Shell: zsh 5.9`,
        `  \`.__.-.__.'     Apps: ${LAUNCHPAD.length}  Projects: ${PROJECTS.length}`,
        `                  Theme: ${prefs.theme}`,
      ];
      default: return [`zsh: command not found: ${c}`];
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const out = run(cmd);
    if (out !== null) setLines((l) => [...l, `${user}@mac ~ % ${cmd}`, ...out]);
    if (cmd.trim()) setHist((h) => [cmd, ...h]);
    setHi(-1); setCmd('');
  };
  const onKey = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hist.length - 1, hi + 1); setHi(n); setCmd(hist[n] || ''); }
    if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.max(-1, hi - 1); setHi(n); setCmd(n < 0 ? '' : hist[n]); }
    if (e.key === 'Tab') { e.preventDefault(); const m = ['help', 'about', 'skills', 'projects', 'experience', 'contact', 'resume', 'open', 'neofetch', 'theme', 'clear'].find((k) => k.startsWith(cmd)); if (m) setCmd(m + ' '); }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
  };

  return (
    <div className="term" onClick={() => inp.current?.focus()}>
      {lines.map((l, i) => <div key={i} className="tl">{l || ' '}</div>)}
      <form onSubmit={submit} className="tl">
        <span className="prompt">{user}@mac ~ % </span>
        <input ref={inp} autoFocus value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" />
      </form>
      <div ref={end} />
    </div>
  );
}
