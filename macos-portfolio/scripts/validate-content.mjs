// Launch gate: fails while src/data/profile.js still holds template content or the resume PDF is missing.
//   npm run validate        (exit 1 and a list of what to fix)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLACEHOLDERS = [/your name/i, /yourname/i, /example\.com/i, /\[TODO\]/i, /Your University/i, /Startup Co\./i, /00000 00000/];
const REQUIRED = {
  PROFILE: ['name', 'handle', 'role', 'tagline', 'location', 'email', 'about', 'links.github', 'links.linkedin'],
  PROJECTS: ['slug', 'name', 'year', 'tagline', 'description', 'tech', 'url', 'highlights'],
  EXPERIENCE: ['company', 'role', 'period', 'bullets'],
  EDUCATION: ['school', 'degree', 'period'],
  SKILLS: ['group', 'items'],
};
const blank = (v) => v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
const get = (o, dotted) => dotted.split('.').reduce((x, k) => x?.[k], o);

/** Returns a list of human-readable problems; empty means the content is ready to launch. */
export function findProblems(data, { resumeExists }) {
  const problems = [];
  // every string anywhere in the content, with its path, checked against the template leftovers
  const walk = (v, where) => {
    if (typeof v === 'string') { for (const p of PLACEHOLDERS) { const m = v.match(p); if (m) { problems.push(`${where} still contains placeholder text "${m[0]}"`); break; } } }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  };
  for (const [name, fields] of Object.entries(REQUIRED)) {
    const value = data[name];
    if (blank(value)) { problems.push(`${name} is empty`); continue; }
    const rows = Array.isArray(value) ? value.map((r, i) => [r, `${name}[${i}]`]) : [[value, name]];
    for (const [row, where] of rows) for (const f of fields) if (blank(get(row, f))) problems.push(`${where}.${f} is empty`);
    walk(value, name);
  }
  if (!resumeExists) problems.push('public/resume.pdf is missing (Preview and the resume links point to it)');
  return problems;
}

// CLI
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const data = await import(pathToFileURL(path.join(root, 'src', 'data', 'profile.js')).href);
  const problems = findProblems(data, { resumeExists: fs.existsSync(path.join(root, 'public', 'resume.pdf')) });
  if (problems.length) { console.error(`Content is not ready to launch (${problems.length} problems):`); for (const p of problems) console.error('  - ' + p); process.exit(1); }
  console.log('Content OK: no placeholders, resume present.');
}
