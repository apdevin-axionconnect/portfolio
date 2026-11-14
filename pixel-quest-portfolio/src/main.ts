import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/800.css';
import './tokens.css';
import './style.css';
import anime from 'animejs/lib/anime.es.js';
import { PROFILE, LEVELS, FINALE } from './data';
import { buildLayout, T } from './layout';
import { createWorld } from './world';
import { ready as spritesReady, url, REWARD, HERO, SKINS, type Skin } from './sprites';
import { $, LABEL, showBanner, showCard, openModal, closeModal, buildOverview, toggleOverview, showTab, toast, shareCard } from './ui';
import { loadSave, writeSave, clearSave, bestTime, recordTime, fmtTime } from './save';
import { FLAGS } from './flags';
import { githubStats } from './github';

/* ---------- audio is loaded lazily after Press Start so first paint stays small ---------- */
type Audio = typeof import('./audio');
let audio: Audio | null = null;
const sfx = new Proxy({} as Audio['sfx'], { get: (_, k: string) => () => (audio?.sfx as Record<string, () => void> | undefined)?.[k]?.() });

/* ---------- state machine ---------- */
type State = 'title' | 'playing' | 'paused' | 'finished';
let state: State = 'title';
const setState = (s: State) => { state = s; document.body.dataset.state = s; };

const layout = buildLayout(LEVELS);
const { gates, items, secrets, coins } = layout;
const world = createWorld($<HTMLCanvasElement>('game'), layout);
const total = items.length;
let vel = 0, currentLevel = 0, score = 0, hearts = 3, elapsed = 0, lastT = 0, autoRun = false, muted = !FLAGS.music;
let lastGateX = 0, saveTimer = 0;

/* ---------- boot ---------- */
const saved = loadSave();
if (saved?.skin && (SKINS as readonly string[]).includes(saved.skin)) HERO.color = saved.skin as Skin;
$('hudTotal').textContent = String(total);
$('tagline').textContent = PROFILE.tagline;
$('playerName').textContent = PROFILE.name;
$<HTMLImageElement>('hudCoinIcon').src = url('boxItem');
$<HTMLImageElement>('hudCoinGold').src = url('coinGold');
$('continueBtn').hidden = !saved || saved.done.length === 0;
if (bestTime() !== null) $('best').textContent = `Best run: ${fmtTime(bestTime()!)}`;
if (PROFILE.repo) $<HTMLAnchorElement>('repoLink').href = PROFILE.repo; else $('repoLink').hidden = true;
buildOverview(); showTab('story');
$('skins').innerHTML = SKINS.map(s => `<button class="skin ${s === HERO.color ? 'on' : ''}" data-skin="${s}" aria-label="${s} hero" aria-pressed="${s === HERO.color}"><img src="${url(`alien${s}_stand`)}" alt=""></button>`).join('');
$('skins').onclick = e => { const b = (e.target as HTMLElement).closest<HTMLElement>('.skin'); if (!b) return; HERO.color = b.dataset.skin as Skin; refreshSkin(); };
function refreshSkin() {
  document.querySelectorAll('.skin').forEach(b => { const on = (b as HTMLElement).dataset.skin === HERO.color; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $<HTMLImageElement>('hudAvatar').src = $<HTMLImageElement>('heroPreview').src = url(`alien${HERO.color}_stand`);
}
refreshSkin();
$('progress').insertAdjacentHTML('beforeend', gates.map(g => `<button class="mark" style="left:${(g.x / world.maxCam) * 100}%" data-x="${g.x}" aria-label="Jump to world ${g.index + 1}"></button>`).join(''));
$('progress').onclick = e => { const m = (e.target as HTMLElement).closest<HTMLElement>('.mark'); if (m && state !== 'title') { world.setCam(Number(m.dataset.x) - T * 3); vel = 0; } };
if ('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load', () => navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {}));
if (FLAGS.analytics && FLAGS.analyticsDomain) { const s = document.createElement('script'); s.defer = true; s.dataset.domain = FLAGS.analyticsDomain; s.src = 'https://plausible.io/js/script.js'; document.head.appendChild(s); }
const track = (name: string, props?: Record<string, string | number>) => (window as unknown as { plausible?: (n: string, o?: object) => void }).plausible?.(name, { props });
if (FLAGS.debug) $('debug').hidden = false;
addEventListener('error', () => { $('crash').hidden = false; });

/* ---------- input ---------- */
const keys: Record<string, boolean> = {};
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!$('modal').hidden) return closeModal(); if (toggleOverview()) setState(state === 'finished' ? 'finished' : 'paused'); else if (state === 'paused') setState('playing'); return; }
  if (e.key === 'Enter' && state !== 'title' && $('modal').hidden && $('overview').hidden) { openModal(); return; }
  keys[e.key] = true;
  if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && $('overview').hidden) { e.preventDefault(); jump(); }
});
addEventListener('keyup', e => keys[e.key] = false);
addEventListener('wheel', e => { if (state === 'playing') vel += Math.sign(e.deltaY) * 12; }, { passive: true });
let touchX: number | null = null;
addEventListener('touchstart', e => { if (!(e.target as HTMLElement).closest('button,a,#card,#modal,#overview')) touchX = e.touches[0].clientX; }, { passive: true });
addEventListener('touchmove', e => { if (touchX !== null) { vel += (touchX - e.touches[0].clientX) * 0.6; touchX = e.touches[0].clientX; } }, { passive: true });
addEventListener('touchend', () => { if (touchX !== null && Math.abs(vel) < 2) jump(); touchX = null; });
$('pad').querySelectorAll<HTMLButtonElement>('button').forEach(b => {
  const k = b.dataset.k!, down = (e: Event) => { e.preventDefault(); k === ' ' ? jump() : keys[k] = true; }, up = () => keys[k] = false;
  b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
});
function jump() { if (state === 'playing' && world.jump()) sfx.jump(); }
let padJumpHeld = false;
function pollGamepad() {
  const gp = navigator.getGamepads?.()[0]; if (!gp) return;
  const ax = gp.axes[0] ?? 0, left = gp.buttons[14]?.pressed, right = gp.buttons[15]?.pressed;
  keys.gpLeft = ax < -0.3 || !!left; keys.gpRight = ax > 0.3 || !!right;
  const j = gp.buttons[0]?.pressed; if (j && !padJumpHeld) jump(); padJumpHeld = !!j;
}

/* ---------- game loop ---------- */
let fpsAcc = 0, fpsN = 0;
function tick(now: number) {
  const dt = Math.min(3, (now - (lastT || now)) / 16.667); lastT = now;
  if (state === 'playing') {
    pollGamepad();
    elapsed += dt * 16.667;
    const right = keys.ArrowRight || keys.d || keys.D || keys.gpRight || autoRun, left = keys.ArrowLeft || keys.a || keys.A || keys.gpLeft;
    if (right) vel += 1.1 * dt;
    if (left) vel -= 1.1 * dt;
    if (autoRun && world.hazardAhead(T * 2.6)) jump();
    vel = Math.max(-8.5, Math.min(8.5, vel)) * Math.pow(0.86, dt);
    const hit = world.step(vel, dt, now);
    if (hit) handle(hit, now);
    const heroX = world.heroX;
    gates.forEach(g => { if (!g.shown && heroX > g.x) { g.shown = true; lastGateX = g.x; enterWorld(g.index, now); } });
    items.forEach(it => { if (!it.done && heroX > it.x + T * 1.3 && heroX < it.x + T * 2.2) { world.jump(); collect(it, now); } });
    if (world.camX >= world.maxCam - 1) finale();
    if ((saveTimer += dt) > 120) { saveTimer = 0; persist(); }
    $('hudTime').textContent = fmtTime(elapsed);
  }
  world.draw(now, currentLevel, state === 'finished');
  if (FLAGS.debug && (fpsAcc += dt, ++fpsN >= 30)) { $('debug').textContent = `${(60 * fpsN / fpsAcc).toFixed(0)} fps · draw ${world.drawMs.toFixed(1)} ms · ${world.particleCount} particles · cam ${world.camX | 0}`; fpsAcc = fpsN = 0; }
  requestAnimationFrame(tick);
}
function handle(hit: NonNullable<ReturnType<typeof world.step>>, now: number) {
  if (hit.kind === 'block') collect(hit.block, now);
  else if (hit.kind === 'secret') { hit.secret.done = true; hit.secret.bump = now; score += 500; sfx.secret(); showCard('Hidden block · honest failure', 'What went wrong', hit.secret.text, 'star'); toast('+500 secret found!'); track('secret'); }
  else if (hit.kind === 'sign') { showCard('Signpost', hit.sign.data.by, hit.sign.data.quote, 'star', null, hit.sign.data.href ? `<a class="btn" href="${hit.sign.data.href}" target="_blank" rel="noopener">Profile</a>` : ''); setTimeout(() => anime({ targets: '#card', opacity: 0, duration: 300 }), 6000); }
  else if (hit.kind === 'coin') { score += 100; sfx.coin(); }
  else if (hit.kind === 'squash') { score += 200; sfx.squash(); toast('+200'); }
  else if (hit.kind === 'hurt') { if (!autoRun) loseHeart('Ouch! Jump on them instead.'); }
  else if (hit.kind === 'fall') { if (!autoRun) loseHeart('Mind the gap!'); world.setCam(Math.max(0, lastGateX - T * 2)); vel = 0; }
  $('hudScore').textContent = String(score);
}
function loseHeart(msg: string) {
  hearts = Math.max(0, hearts - 1); sfx.hurt(); renderHearts(); toast(msg);
  if (hearts === 0) { hearts = 3; renderHearts(); world.setCam(Math.max(0, lastGateX - T * 2)); vel = 0; showBanner(`Try again<small>Back to World ${currentLevel + 1}</small>`); }
}
function renderHearts() { $('hearts').innerHTML = [0, 1, 2].map(i => `<img src="${url(i < hearts ? 'hud_heartFull' : 'hud_heartEmpty')}" alt="">`).join(''); }

/* ---------- events ---------- */
function enterWorld(i: number, now = performance.now()) {
  if (i > 0) { world.levelUp(now); toast(`Level up: ${LEVELS[i - 1].theme} ✓`); }
  currentLevel = i; const lvl = LEVELS[i];
  $('hudLevel').textContent = `World ${i + 1}`; $('hudYear').textContent = `${lvl.theme} · ${lvl.year}`;
  $('progressFill').style.width = `${(gates[i].x / world.maxCam) * 100}%`;
  audio?.setTempo(120 + i * 8); sfx.gate(); world.startIris(); track('world', { n: i + 1 });
  showBanner(`World ${i + 1}<small>${lvl.theme} · ${lvl.title} · ${lvl.year}</small>`);
}
function collect(it: (typeof items)[number], now: number) {
  it.done = true; it.bump = now; score += 300;
  $('hudCoins').textContent = String(items.filter(i => i.done).length);
  sfx.collect(); persist(); track('card', { title: it.data.title });
  showCard(LABEL[it.data.type], it.data.title, it.data.text, REWARD[it.data.type], it.data);
}
async function finale() {
  if (state === 'finished') return;
  setState('finished'); audio?.stopMusic(); sfx.finale(); clearSave(); track('finale');
  $('progressFill').style.width = '100%';
  const best = recordTime(elapsed);
  showBanner(FINALE.title);
  $('card').classList.add('final');
  const links = FINALE.links.map(l => `<a class="btn" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join('');
  const stats = `⏱ ${fmtTime(elapsed)}${best ? ' · new best!' : ''} · ${items.filter(i => i.done).length}/${total} blocks · ${coins.filter(c => c.taken).length}/${coins.length} coins · ${secrets.filter(s => s.done).length}/${secrets.length} secrets · score ${score}`;
  showCard('Graduation', FINALE.title, FINALE.text, 'star', null,
    `<p class="next"><b>What's next:</b> ${FINALE.next}</p><p class="stats">${stats}</p><div class="links">${links}<button class="btn" id="shareBtn">Share run</button><button class="btn" id="printBtn">Resume PDF</button></div><div id="gh"></div>`);
  $('shareBtn').onclick = () => { track('share'); shareCard(elapsed, items.filter(i => i.done).length, total, coins.filter(c => c.taken).length); };
  $('printBtn').onclick = () => { track('resume'); toggleOverview(true); showTab('story'); setTimeout(() => print(), 300); };
  if (!PROFILE.github || !FLAGS.githubStats) return;
  const gh = await githubStats(PROFILE.github);
  $('gh').innerHTML = gh
    ? `GitHub: ${gh.repos} public repos · ${gh.followers} followers<div class="repos">${gh.top.map(r => `<a href="${r.url}" target="_blank" rel="noopener">★ ${r.stars} ${r.name}</a>`).join('')}</div>`
    : `<span class="muted">GitHub stats unavailable right now (offline or rate-limited).</span>`;
}
function persist() {
  writeSave({ camX: world.camX, done: items.map((it, i) => it.done ? i : -1).filter(i => i >= 0), coins: coins.map((c, i) => c.taken ? i : -1).filter(i => i >= 0),
    secrets: secrets.map((s, i) => s.done ? i : -1).filter(i => i >= 0), score, time: elapsed, skin: HERO.color });
}

/* ---------- controls ---------- */
$('logBtn').onclick = () => { if (toggleOverview()) setState(state === 'finished' ? 'finished' : 'paused'); else if (state === 'paused') setState('playing'); };
$('closeOverview').onclick = () => { toggleOverview(false); if (state === 'paused') setState('playing'); };
$('printLog').onclick = () => { showTab('story'); print(); };
$('skipBtn').onclick = () => { toggleOverview(true); track('text-mode'); };
$('autoBtn').onclick = e => { autoRun = !autoRun; (e.currentTarget as HTMLElement).classList.toggle('on', autoRun); (e.currentTarget as HTMLElement).setAttribute('aria-pressed', String(autoRun)); };
$('muteBtn').onclick = e => { muted = !muted; audio?.setMuted(muted); (e.currentTarget as HTMLElement).classList.toggle('off', muted); (e.currentTarget as HTMLElement).setAttribute('aria-pressed', String(muted)); };
$('cardMore').onclick = e => { e.stopPropagation(); openModal(); };

async function begin(resume: boolean) {
  const [, , mod] = await Promise.all([spritesReady, document.fonts.load('700 20px Fredoka'), FLAGS.music ? import('./audio') : Promise.resolve(null)]);
  if (mod) { audio = mod; await audio.startMusic(); audio.setMuted(muted); }
  if (resume && saved) {
    saved.done.forEach(i => items[i] && (items[i].done = true)); saved.coins.forEach(i => coins[i] && (coins[i].taken = true)); saved.secrets.forEach(i => secrets[i] && (secrets[i].done = true));
    score = saved.score; elapsed = saved.time; world.setCam(saved.camX);
    gates.forEach(g => { if (world.heroX > g.x) { g.shown = true; lastGateX = g.x; currentLevel = g.index; } });
    $('hudCoins').textContent = String(items.filter(i => i.done).length); $('hudScore').textContent = String(score);
    enterWorld(currentLevel);
  } else clearSave();
  renderHearts();
  anime({ targets: '#start', opacity: 0, duration: 500, easing: 'linear', complete: () => $('start').remove() });
  setState('playing'); lastT = 0; track('start', { resume: String(resume) }); requestAnimationFrame(tick);
}
$('startBtn').onclick = () => begin(false);
$('continueBtn').onclick = () => begin(true);
spritesReady.then(() => world.draw(0, 0, false));
setState('title');
