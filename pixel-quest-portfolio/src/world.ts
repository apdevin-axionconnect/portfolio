// HD canvas renderer + hero physics. World units are pixels at a 720px-tall design; the view scales to fit.
// Physics runs on a delta-time factor (1 = one 60Hz frame) so speed is identical on 60Hz and 144Hz screens.
import { T, img, HERO, THEMES, REWARD, type Theme } from './sprites';
import type { Layout, Block, Secret, Platform, Sign } from './types';
import { inPit } from './layout';
import { GRAVITY, JUMP_V, HERO_W, HERO_H, BLOCK_ROWS_UP } from './physics';
import { FLAGS } from './flags';
import { particles, dust, sparkle, weather, stepParticles, drawParticles } from './particles';

export const GROUND_ROWS = 2, DESIGN_H = 720;
const HERO_SCREEN = 0.3;

export interface Enemy { x0: number; x: number; range: number; speed: number; theme: Theme; phase: number; dead: number; w: number; h: number; dir: number }
export type HitResult = { kind: 'block'; block: Block } | { kind: 'secret'; secret: Secret } | { kind: 'sign'; sign: Sign } | { kind: 'coin' } | { kind: 'squash'; enemy: Enemy } | { kind: 'hurt' } | { kind: 'fall' } | null;

export function createWorld(canvas: HTMLCanvasElement, layout: Layout) {
  const { gates, items, secrets, pits, platforms, coins, signs, endX } = layout;
  const ctx = canvas.getContext('2d')!;
  let W = 0, H = 0, zoom = 1, groundY = 0;
  const rand = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  // decorations, clouds, hills and critters are generated once, deterministically
  const decor: { x: number; name: string }[] = [], clouds: { x: number; y: number; name: string }[] = [], hills: { x: number; name: string }[] = [];
  const enemies: Enemy[] = [];
  gates.forEach((g, i) => {
    const theme = THEMES[i % THEMES.length], r = rand(i + 7);
    const next = gates[i + 1]?.x ?? endX, blockXs = items.filter(it => it.level === i).map(it => it.x);
    for (let x = g.x + T * 2; x < next - T; x += T * (2 + Math.floor(r() * 3))) {
      if (blockXs.some(bx => Math.abs(bx - x) < T * 1.2) || Math.abs(x - g.x) < T * 1.5 || inPit(pits, x) || inPit(pits, x + T - 1)) continue;
      if (platforms.some(p => x + T > p.x && x < p.x + p.w) || signs.some(s => Math.abs(s.x - x) < T * 1.5)) continue;
      decor.push({ x, name: theme.decor[Math.floor(r() * theme.decor.length)] });
    }
    for (let k = 0; k < 3; k++) {
      const x0 = g.x + T * 6 + k * (next - g.x - T * 9) / 3;
      enemies.push({ x0, x: x0, range: T * 2, speed: 0.6 + r() * 0.4, theme, phase: r() * 10, dead: 0, w: 52, h: theme.fly ? 34 : 30, dir: 1 });
    }
  });
  const r2 = rand(99);
  for (let x = 0; x < endX + 2000; x += 300 + Math.floor(r2() * 300)) clouds.push({ x, y: 40 + r2() * 160, name: `cloud${1 + Math.floor(r2() * 3)}` });
  for (let x = -200; x < endX + 2000; x += 180 + Math.floor(r2() * 220)) hills.push({ x, name: r2() < 0.5 ? 'hill_large' : 'hill_small' });
  const stars = Array.from({ length: 80 }, () => ({ x: r2(), y: r2() * 0.6, s: 1 + r2() * 2 }));

  const hero = { x: 0, y: 0, vy: 0, onGround: true, facing: 1, moving: false, walkT: 0, invincible: 0, platform: null as Platform | null, badgeUntil: 0 };
  let camX = 0, camTarget = 0, shake = 0, iris: number | null = null, drawMs = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    zoom = Math.min(1, innerHeight / DESIGN_H, innerWidth / 900);
    W = Math.ceil(innerWidth / zoom); H = Math.ceil(innerHeight / zoom);
    canvas.width = Math.ceil(innerWidth * dpr); canvas.height = Math.ceil(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    groundY = H - GROUND_ROWS * T;
  }
  resize(); addEventListener('resize', resize);

  const heroScreenX = () => Math.floor(W * HERO_SCREEN);
  const maxCam = () => endX + T * 2.5 - heroScreenX();
  const blockY = () => groundY - BLOCK_ROWS_UP * T;
  const platTop = (p: Platform) => groundY - p.y * T;
  const draw1 = (name: string, x: number, y: number, w?: number, h?: number) => { const i = img(name); if (i.complete && i.naturalWidth) ctx.drawImage(i, x, y, w ?? i.naturalWidth, h ?? i.naturalHeight); };
  const levelAt = (x: number) => { let i = 0; gates.forEach(g => { if (x >= g.x) i = g.index; }); return i; };
  const themeAt = (x: number) => THEMES[levelAt(x) % THEMES.length];

  function jump() { if (hero.onGround) { hero.vy = JUMP_V; hero.onGround = false; hero.platform = null; return true; } return false; }
  function setCam(x: number) { camTarget = camX = Math.max(0, Math.min(maxCam(), x)); hero.y = 0; hero.vy = 0; hero.onGround = true; }
  function startIris() { if (FLAGS.iris) iris = performance.now(); }
  /** level-up moment: the hero shows the badge pose for a while */
  function levelUp(time: number) { hero.badgeUntil = time + 1800; sparkle(hero.x + HERO_W / 2, groundY - HERO_H, '#ffd54f'); }

  /** advance physics by dt frames; returns the most important event this step */
  function step(vel: number, dt: number, time: number): HitResult {
    camTarget = Math.max(0, Math.min(maxCam(), camTarget + vel * dt));
    camX += (camTarget - camX) * Math.min(1, 0.35 * dt); // camera lookahead/lag
    if (Math.abs(camTarget - camX) < 0.05) camX = camTarget;
    hero.x = camX + heroScreenX();
    hero.moving = Math.abs(vel) > 0.6;
    if (hero.moving) { hero.facing = vel < 0 ? -1 : 1; hero.walkT += Math.abs(vel) * 0.045 * dt; }
    if (hero.invincible > 0) hero.invincible -= dt;
    shake *= Math.pow(0.85, dt);
    let result: HitResult = null;

    const wasGround = hero.onGround, prevY = hero.y;
    hero.vy += GRAVITY * dt; hero.y += hero.vy * dt;
    const feetX = hero.x + HERO_W / 2;
    hero.platform = null;
    for (const p of platforms) {
      const top = platTop(p) - groundY;
      if (feetX > p.x && feetX < p.x + p.w && hero.vy >= 0 && prevY <= top + 1 && hero.y >= top) { hero.y = top; hero.vy = 0; hero.platform = p; }
    }
    const overPit = inPit(pits, feetX);
    if (hero.platform) hero.onGround = true;
    else if (!overPit && hero.y >= 0) { hero.y = 0; hero.vy = 0; hero.onGround = true; }
    else hero.onGround = false;
    if (!wasGround && hero.onGround) dust(hero.x + HERO_W / 2, groundY + hero.y);
    if (hero.y > H) return { kind: 'fall' };

    const top = groundY - HERO_H + hero.y, bottom = blockY() + T;
    if (hero.vy < 0 && top <= bottom && top > bottom - 24) {
      const hit = items.find(it => !it.done && Math.abs(it.x + T / 2 - feetX) < T * 0.75);
      if (hit) { hero.vy = 4; if (FLAGS.shake) shake = 6; result = { kind: 'block', block: hit }; }
      const sec = secrets.find(s => !s.done && Math.abs(s.x + T / 2 - feetX) < T * 0.75);
      if (sec) { hero.vy = 4; if (FLAGS.shake) shake = 6; result = { kind: 'secret', secret: sec }; }
    }
    for (const c of coins) {
      if (c.taken) continue;
      const cy = groundY - c.y * T + T / 2, cx = c.x + T / 2;
      if (Math.abs(cx - feetX) < 40 && cy > top && cy < groundY + hero.y) { c.taken = true; sparkle(cx, cy); result ??= { kind: 'coin' }; }
    }
    const sign = signs.find(s => !s.shown && Math.abs(s.x + T / 2 - feetX) < T * 0.6);
    if (sign) { sign.shown = true; result ??= { kind: 'sign', sign }; }
    for (const e of enemies) {
      if (e.dead) continue;
      const t = time / 1000 * e.speed + e.phase;
      e.x = e.x0 + Math.sin(t) * e.range; e.dir = Math.cos(t) > 0 ? 1 : -1;
      const ey = e.theme.fly ? groundY - T * 3.6 + Math.sin(t * 3) * 14 : groundY - e.h;
      const overlapX = Math.abs(e.x + e.w / 2 - feetX) < (e.w + HERO_W) / 2 - 14;
      const heroBottom = groundY + hero.y, overlapY = heroBottom > ey + 4 && top < ey + e.h;
      if (!overlapX || !overlapY) continue;
      if (hero.vy > 0 && heroBottom < ey + e.h * 0.8) { e.dead = time; hero.vy = -9; hero.onGround = false; sparkle(e.x + e.w / 2, ey, '#fff'); result = { kind: 'squash', enemy: e }; }
      else if (hero.invincible <= 0) { hero.invincible = 90; hero.vy = -6; result = { kind: 'hurt' }; }
    }
    stepParticles(dt, camX, W);
    if (FLAGS.weather) weather(themeAt(hero.x).weather, W, H, camX);
    return result;
  }

  function draw(time: number, currentLevel: number, finished: boolean) {
    const t0 = performance.now();
    const theme = THEMES[currentLevel % THEMES.length];
    const night = Math.max(0, Math.min(1, (camX / maxCam() - 0.62) / 0.3)); // dusk begins in the last stretch
    document.documentElement.dataset.theme = night > 0.5 ? 'dark' : 'light';
    const mix = (a: string, b: string, t: number) => {
      const p = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
      const [a1, a2, a3] = p(a), [b1, b2, b3] = p(b);
      return `rgb(${a1 + (b1 - a1) * t | 0},${a2 + (b2 - a2) * t | 0},${a3 + (b3 - a3) * t | 0})`;
    };
    ctx.save();
    if (shake > 0.5) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    const bgW = 1024, bgY = groundY - 400, off = -((camX * 0.25) % bgW);
    const skyTop = mix(theme.sky[0], theme.night[0], night), skyBottom = mix(theme.sky[1], theme.night[1], night);
    const sky = ctx.createLinearGradient(0, 0, 0, bgY); sky.addColorStop(0, skyTop); sky.addColorStop(1, skyBottom);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (night > 0) { stars.forEach(s => { ctx.globalAlpha = night * (0.6 + 0.4 * Math.sin(time / 400 + s.x * 50)); ctx.fillStyle = '#fff'; ctx.fillRect(s.x * W, s.y * H, s.s, s.s); }); ctx.globalAlpha = 1; }
    ctx.globalAlpha = 0.9 - night * 0.5;
    for (let x = off - bgW; x < W + bgW; x += bgW) draw1(theme.bg, x, bgY, bgW, 512);
    ctx.globalAlpha = 1;
    const fade = ctx.createLinearGradient(0, bgY, 0, bgY + 160); fade.addColorStop(0, skyBottom); fade.addColorStop(1, skyBottom.replace('rgb', 'rgba').replace(')', ',0)'));
    ctx.fillStyle = fade; ctx.fillRect(0, bgY, W, 160);
    clouds.forEach(c => { const sx = c.x - camX * 0.4; if (sx > -140 && sx < W) draw1(c.name, sx, c.y); });
    hills.forEach(h => { const sx = h.x - camX * 0.6, i = img(h.name); if (sx > -60 && sx < W && themeAt(h.x).name === 'grass') draw1(h.name, sx, groundY - i.naturalHeight + 4); });

    const toScreen = (x: number) => x - camX;
    for (let x = Math.floor(camX / T) * T; x < camX + W + T; x += T) {
      const sx = toScreen(x), th = themeAt(x), set = th.tiles;
      if (inPit(pits, x)) {
        const lava = th.name === 'castle';
        draw1(lava ? 'liquidLavaTop' : 'liquidWaterTop', sx, groundY + T * 0.6, T, T);
        draw1(lava ? 'liquidLava' : 'liquidWater', sx, groundY + T * 1.6, T, T);
        continue;
      }
      const left = inPit(pits, x - 1), right = inPit(pits, x + T);
      draw1(`${set}${left ? 'Left' : right ? 'Right' : 'Mid'}`, sx, groundY, T, T);
      for (let r = 1; r < GROUND_ROWS + 1; r++) draw1(`${set}Center`, sx, groundY + r * T, T, T);
    }
    platforms.forEach(p => {
      const sx = toScreen(p.x); if (sx < -p.w || sx > W) return;
      const set = themeAt(p.x).tiles, n = p.w / T;
      for (let i = 0; i < n; i++) draw1(`${set}Half${i === 0 ? 'Left' : i === n - 1 ? 'Right' : 'Mid'}`, sx + i * T, platTop(p), T, T);
    });
    decor.forEach(d => { const sx = toScreen(d.x); if (sx > -T && sx < W) draw1(d.name, sx, groundY - T, T, T); });
    signs.forEach(s => { const sx = toScreen(s.x); if (sx > -T && sx < W) draw1('sign', sx, groundY - T, T, T); });
    gates.forEach(g => {
      const sx = toScreen(g.x); if (sx < -T * 4 || sx > W + T) return;
      ctx.fillStyle = '#9aa5ad'; ctx.fillRect(sx + 6, groundY - T * 4, 10, T * 4);
      ctx.fillStyle = '#e8edf0'; ctx.beginPath(); ctx.arc(sx + 11, groundY - T * 4, 9, 0, 7); ctx.fill();
      draw1(THEMES[g.index % THEMES.length].flag + (Math.floor(time / 300) % 2 ? '2' : ''), sx + 10, groundY - T * 4 + 4, T, T);
      label(`WORLD ${g.index + 1} · ${g.level.theme.toUpperCase()}`, sx + 11, groundY - T * 4 - 44, 18);
      label(`${g.level.title} · ${g.level.year}`, sx + 11, groundY - T * 4 - 20, 13);
    });
    coins.forEach(c => {
      if (c.taken) return; const sx = toScreen(c.x); if (sx < -T || sx > W) return;
      const bob = Math.sin(time / 300 + c.x) * 4, squash = Math.abs(Math.cos(time / 350 + c.x * 0.3));
      draw1('coinGold', sx + T / 2 - 22 * squash - 2, groundY - c.y * T + 12 + bob, 44 * squash + 4, 44);
    });
    const drawBlock = (x: number, done: boolean, bump: number | undefined, hidden: boolean, reward?: string) => {
      const sx = toScreen(x); if (sx < -T || sx > W) return;
      const b = bump ? -Math.sin(Math.min(1, (time - bump) / 250) * Math.PI) * 18 : 0;
      if (!hidden || done) {
        ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(sx + T / 2, groundY + 6, 26, 6, 0, 0, 7); ctx.fill();
        draw1(done ? (hidden ? 'boxCoin_disabled' : 'boxItem_disabled') : 'boxItem', sx, blockY() + b + (done ? 0 : Math.sin(time / 400 + x) * 3), T, T);
      }
      if (bump && time - bump < 800 && reward) { const p = (time - bump) / 800; ctx.globalAlpha = 1 - p; draw1(reward, sx, blockY() - T - p * 90, T, T); ctx.globalAlpha = 1; }
    };
    items.forEach(it => drawBlock(it.x, it.done, it.bump, false, REWARD[it.data.type] ?? 'coinGold'));
    secrets.forEach(s => drawBlock(s.x, s.done, s.bump, true, 'star'));
    enemies.forEach(e => {
      const sx = toScreen(e.x); if (sx < -T || sx > W) return;
      const t = time / 1000 * e.speed + e.phase;
      if (e.dead) { if (time - e.dead < 600) { ctx.globalAlpha = 1 - (time - e.dead) / 600; draw1(e.theme.dead, sx, groundY - 24); ctx.globalAlpha = 1; } return; }
      const name = e.theme.enemy[Math.floor(time / 220) % 2], i = img(name), flip = e.dir > 0;
      const y = e.theme.fly ? groundY - T * 3.6 + Math.sin(t * 3) * 14 : groundY - i.naturalHeight;
      ctx.save(); if (flip) { ctx.translate(sx + i.naturalWidth, 0); ctx.scale(-1, 1); draw1(name, 0, y); } else draw1(name, sx, y); ctx.restore();
    });
    const cx = toScreen(endX);
    if (cx < W + T * 5) {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) draw1(r === 0 ? 'castle' : 'castleCenter', cx + c * T, groundY - (4 - r) * T, T, T);
      draw1('window', cx + T, groundY - 3 * T, T, T); draw1('window', cx + 3 * T, groundY - 3 * T, T, T);
      draw1('door_closedTop', cx + 2 * T, groundY - 2 * T, T, T); draw1('door_closedMid', cx + 2 * T, groundY - T, T, T);
      const f = Math.floor(time / 200) % 2; draw1(f ? 'tochLit' : 'tochLit2', cx + T, groundY - T, T, T); draw1(f ? 'tochLit2' : 'tochLit', cx + 3 * T, groundY - T, T, T);
      draw1('signExit', cx - T, groundY - T, T, T);
      label(finished ? 'YOU MADE IT!' : 'GRADUATION', cx + 2.5 * T, groundY - 4 * T - 24, 22);
    }
    const hx = heroScreenX(), hy = groundY - HERO_H + hero.y;
    if (!(hero.invincible > 0 && Math.floor(time / 80) % 2)) {
      if (hero.y <= 0 || hero.platform) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(hx + HERO_W / 2, (hero.platform ? platTop(hero.platform) : groundY) + 4, 28 + hero.y * 0.08, 7, 0, 0, 7); ctx.fill(); }
      const badge = time < hero.badgeUntil && hero.onGround && !hero.moving;
      const frame = badge ? (Math.floor(time / 300) % 2 ? 'badge1' : 'badge2') : !hero.onGround ? 'jump' : hero.moving ? (Math.floor(hero.walkT) % 2 ? 'walk2' : 'walk1') : 'stand';
      ctx.save();
      if (hero.facing < 0) { ctx.translate(hx + HERO_W, 0); ctx.scale(-1, 1); draw1(`alien${HERO.color}_${frame}`, 0, hy); }
      else draw1(`alien${HERO.color}_${frame}`, hx, hy);
      ctx.restore();
    }
    drawParticles(ctx, camX);
    if (night > 0) { ctx.fillStyle = `rgba(10,20,60,${night * 0.35})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    if (iris !== null) {
      const p = Math.min(1, (time - iris) / 700);
      if (p >= 1) iris = null;
      else { const r = Math.max(W, H) * 1.1 * p * p; ctx.fillStyle = '#10141c'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(hx + HERO_W / 2, hy + HERO_H / 2, r, 0, Math.PI * 2, true); ctx.fill(); }
    }
    drawMs = performance.now() - t0;
  }
  function label(text: string, x: number, y: number, size: number) {
    ctx.font = `700 ${size}px Fredoka, Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(20,30,50,.75)'; ctx.strokeText(text, x, y);
    ctx.fillStyle = '#fff'; ctx.fillText(text, x, y);
  }

  return {
    step, draw, jump, resize, setCam, startIris, levelUp, levelAt, enemies,
    get camX() { return camX; }, get heroX() { return hero.x + HERO_W / 2; }, get maxCam() { return maxCam(); },
    get W() { return W; }, get drawMs() { return drawMs; }, get particleCount() { return particles.filter(p => p.life > 0).length; },
    /** nearest hazard ahead within `dist` px: pit edge, live enemy or unsolved block (used by auto-run) */
    hazardAhead(dist: number) {
      const fx = hero.x + HERO_W / 2;
      return pits.some(p => p.x > fx && p.x - fx < dist) || enemies.some(e => !e.dead && !e.theme.fly && e.x > fx && e.x - fx < dist)
        || items.some(it => !it.done && it.x > fx && it.x - fx < dist * 0.6) || secrets.some(s => !s.done && s.x > fx && s.x - fx < dist * 0.6);
    },
  };
}
