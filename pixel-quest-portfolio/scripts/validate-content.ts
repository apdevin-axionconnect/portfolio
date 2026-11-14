// Build-time content check: a typo in the resume data fails `npm run build`, not production.
import { LEVELS, FINALE, PROFILE } from '../src/data.ts';
const errors: string[] = [];
const err = (m: string) => errors.push(m);
const isUrl = (s: string) => /^(https?:\/\/|mailto:|#|[\w./-]+\.pdf$)/.test(s);

if (!PROFILE.name.trim()) err('PROFILE.name is empty');
if (!PROFILE.tagline.trim()) err('PROFILE.tagline is empty');
if (PROFILE.repo && !isUrl(PROFILE.repo)) err(`PROFILE.repo is not a URL: ${PROFILE.repo}`);
if (LEVELS.length < 2) err('Need at least two worlds');
LEVELS.forEach((l, i) => {
  const w = `World ${i + 1}`;
  if (!/^\d{4}$/.test(l.year)) err(`${w}: year "${l.year}" must be four digits`);
  if (!l.title.trim() || !l.theme.trim()) err(`${w}: title and theme are required`);
  if (l.items.length === 0) err(`${w}: has no items`);
  if (l.items.length > 8) err(`${w}: ${l.items.length} items is too many for one world (max 8)`);
  l.items.forEach((it, j) => {
    const c = `${w} item ${j + 1}`;
    if (!['skill', 'contest', 'cert', 'project'].includes(it.type)) err(`${c}: unknown type ${it.type}`);
    if (!it.title.trim() || !it.text.trim()) err(`${c}: title and text are required`);
    if (it.text.length > 160) err(`${c}: text is ${it.text.length} chars; keep cards under 160`);
    if (it.details?.level !== undefined && (it.details.level < 1 || it.details.level > 5)) err(`${c}: level must be 1-5`);
    it.details?.links?.forEach(k => { if (!isUrl(k.href)) err(`${c}: bad link ${k.href}`); });
  });
  if (l.signpost?.href && !isUrl(l.signpost.href)) err(`${w}: signpost link is not a URL`);
});
if (!FINALE.next.trim()) err('FINALE.next is empty: say what you want to build next');
FINALE.links.forEach(k => { if (!isUrl(k.href)) err(`FINALE link is not a URL: ${k.href}`); });
const todos = JSON.stringify({ LEVELS, FINALE, PROFILE }).match(/\[TODO/g)?.length ?? 0;

if (errors.length) { console.error('Content validation failed:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`Content OK: ${LEVELS.length} worlds, ${LEVELS.reduce((n, l) => n + l.items.length, 0)} cards${todos ? `, ${todos} [TODO] placeholders still to write` : ''}`);
