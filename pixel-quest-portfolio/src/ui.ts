// DOM side: cards, project modal, run log (text play, skill tree, about), share card, printable resume.
import anime from 'animejs/lib/anime.es.js';
import Typed from 'typed.js';
import { LEVELS, FINALE, PROFILE } from './data';
import { url, REWARD } from './sprites';
import { fmtTime } from './save';
import { ABOUT_HTML } from './about';
import { FLAGS } from './flags';
import type { Item } from './types';

export const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
export const LABEL: Record<string, string> = { skill: 'Skill', contest: 'Competition', cert: 'Certification', project: 'Project' };
const card = $('card'), banner = $('banner'), modal = $('modal');
let typed: Typed | undefined, cardTimer: number | undefined, lastItem: Item | null = null;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export function showBanner(html: string) {
  banner.innerHTML = html;
  anime.timeline({ targets: banner }).add({ opacity: 1, scale: [0.7, 1], duration: 450, easing: 'easeOutBack' }).add({ opacity: 0, delay: 1500, duration: 350 });
}
export function toast(text: string) {
  const el = $('toast'); el.textContent = text;
  anime.timeline({ targets: el }).add({ opacity: 1, translateY: [10, 0], duration: 250 }).add({ opacity: 0, delay: 1400, duration: 300 });
}
export function showCard(kind: string, title: string, text: string, icon: string, item: Item | null = null, extraHTML = '') {
  lastItem = item;
  card.querySelector('.kind')!.textContent = kind;
  card.querySelector('h3')!.textContent = title;
  (card.querySelector('.icon') as HTMLImageElement).src = url(icon);
  $('cardExtra').innerHTML = extraHTML;
  $('cardMore').hidden = !(item?.details || item?.why || item?.lesson);
  typed?.destroy();
  typed = new Typed('#typed', { strings: [esc(text)], typeSpeed: FLAGS.reduceMotion ? 0 : 10, showCursor: false });
  clearTimeout(cardTimer);
  anime({ targets: card, opacity: 1, translateY: [-16, 0], duration: 350, easing: 'easeOutQuad' });
  if (!extraHTML) cardTimer = window.setTimeout(() => anime({ targets: card, opacity: 0, duration: 300 }), 5000);
}
export function openModal(item: Item | null = lastItem) {
  if (!item) return false;
  const d = item.details ?? {};
  $('modalKind').textContent = LABEL[item.type]; $('modalTitle').textContent = item.title; $('modalText').textContent = item.text;
  $('modalStory').innerHTML = [item.why && `<div><span>Why it mattered</span>${esc(item.why)}</div>`, item.lesson && `<div><span>What I'd do differently</span>${esc(item.lesson)}</div>`].filter(Boolean).join('');
  ($('modalIcon') as HTMLImageElement).src = url(REWARD[item.type]);
  const im = $('modalImage') as HTMLImageElement; im.hidden = !d.image; if (d.image) im.src = d.image;
  $('modalTech').innerHTML = (d.tech ?? []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  $('modalLinks').innerHTML = (d.links ?? []).map(l => `<a class="btn" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
  $('modalLevel').innerHTML = d.level ? `<div class="bar"><span style="width:${d.level * 20}%"></span></div><small>Proficiency ${d.level}/5</small>` : '';
  modal.hidden = false;
  // focus the dialog itself, not the close button: the Enter that opened it would otherwise activate the button on keyup
  (modal.querySelector('.modal-box') as HTMLElement).focus();
  return true;
}
export function closeModal() { modal.hidden = true; }
$('modalClose').onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
// focus trap inside the modal
modal.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = [...modal.querySelectorAll<HTMLElement>('button,a[href]')], first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
card.addEventListener('click', () => openModal());
card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(); });

/* ---------- run log: tabs (story / skills / about), text play with arrow keys ---------- */
export function buildOverview() {
  const skills = LEVELS.flatMap(l => l.items.filter(i => i.type === 'skill' && i.details?.level));
  $('skillTree').innerHTML = skills.map(s => `<li><span>${esc(s.title)}</span><div class="bar"><span style="width:${s.details!.level! * 20}%"></span></div></li>`).join('');
  $('overviewBody').innerHTML = LEVELS.map((l, i) => `<h4>World ${i + 1} · ${esc(l.theme)} · ${esc(l.title)} · ${l.year}</h4>${
    l.signpost ? `<blockquote>${esc(l.signpost.quote)}<cite>${l.signpost.href ? `<a href="${esc(l.signpost.href)}" target="_blank" rel="noopener">${esc(l.signpost.by)}</a>` : esc(l.signpost.by)}</cite></blockquote>` : ''}<ul>${
    l.items.map(it => `<li tabindex="0" data-level="${i}" data-item="${l.items.indexOf(it)}"><img src="${url(REWARD[it.type])}" alt=""><div><b>${LABEL[it.type]} · ${esc(it.title)}</b><span>${esc(it.text)}</span>${
      it.why ? `<span class="why">${esc(it.why)}</span>` : ''}${it.details?.tech ? `<em>${it.details.tech.map(esc).join(' · ')}</em>` : ''}</div></li>`).join('')}</ul>${
    l.secret ? `<p class="secret">Hidden block: ${esc(l.secret)}</p>` : ''}`).join('')
    + `<h4>${esc(FINALE.title)}</h4><p>${esc(FINALE.text)}</p><p class="next"><b>What's next:</b> ${esc(FINALE.next)}</p><p class="links">${FINALE.links.map(l => `<a class="btn" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</p>`;
  $('aboutBody').innerHTML = ABOUT_HTML;
  // arrow keys move between cards, Enter opens the modal: "text play" for keyboard and screen-reader users
  $('overviewBody').addEventListener('keydown', e => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-item]'); if (!li) return;
    const all = [...$('overviewBody').querySelectorAll<HTMLElement>('li[data-item]')], i = all.indexOf(li);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); all[Math.min(all.length - 1, i + 1)].focus(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); all[Math.max(0, i - 1)].focus(); }
    if (e.key === 'Enter') openModal(LEVELS[Number(li.dataset.level)].items[Number(li.dataset.item)]);
  });
  $('overviewBody').addEventListener('click', e => { const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-item]'); if (li) openModal(LEVELS[Number(li.dataset.level)].items[Number(li.dataset.item)]); });
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach(b => b.onclick = () => showTab(b.dataset.tab!));
}
export function showTab(name: string) {
  document.querySelectorAll<HTMLElement>('.tab').forEach(b => { const on = b.dataset.tab === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  document.querySelectorAll<HTMLElement>('.tabpanel').forEach(p => p.hidden = p.dataset.tab !== name);
}
export function toggleOverview(force?: boolean) {
  const ov = $('overview'); ov.hidden = force === undefined ? !ov.hidden : !force;
  if (!ov.hidden) ov.focus();
  return !ov.hidden;
}

/** renders a 1200x630 share image and downloads it */
export function shareCard(timeMs: number, blocks: number, total: number, coins: number) {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 630;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, 630); g.addColorStop(0, '#7ec8f2'); g.addColorStop(1, '#d0f4f7');
  x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
  x.fillStyle = '#6a9f1e'; x.fillRect(0, 520, 1200, 110); x.fillStyle = '#8bc34a'; x.fillRect(0, 520, 1200, 18);
  x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath(); x.roundRect(80, 90, 1040, 380, 36); x.fill();
  x.textAlign = 'center'; x.fillStyle = '#ff9800'; x.font = '700 72px Fredoka, Nunito, sans-serif'; x.fillText('Dev Quest', 600, 190);
  x.fillStyle = '#1d2b3a'; x.font = '800 34px Nunito, sans-serif'; x.fillText(`${PROFILE.name} · run complete`, 600, 250);
  x.font = '700 28px Nunito, sans-serif'; x.fillStyle = '#5d6f82';
  x.fillText(`⏱ ${fmtTime(timeMs)}   ·   ? blocks ${blocks}/${total}   ·   🪙 ${coins}`, 600, 320);
  x.fillText(PROFILE.tagline, 600, 400);
  const hero = new Image(); hero.src = url('alienBlue_jump');
  const finish = () => { x.drawImage(hero, 560, 420, 80, 112); const a = document.createElement('a'); a.download = 'dev-quest-run.png'; a.href = c.toDataURL('image/png'); a.click(); };
  hero.complete ? finish() : (hero.onload = finish);
}
