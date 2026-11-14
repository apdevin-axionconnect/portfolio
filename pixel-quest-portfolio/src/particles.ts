// Fixed-size particle pool: dust, sparkles and per-world weather. Dead slots are reused, nothing is allocated per frame.
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; shape: 'dot' | 'rect' | 'star'; rot: number; world: boolean }
const POOL = 220;
export const particles: Particle[] = Array.from({ length: POOL }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 2, color: '#fff', shape: 'dot', rot: 0, world: true }));

export function emit(p: Partial<Particle> & { x: number; y: number }) {
  const slot = particles.find(q => q.life <= 0) ?? particles[0];
  Object.assign(slot, { vx: 0, vy: 0, life: 1, max: 1, size: 3, color: '#fff', shape: 'dot', rot: 0, world: true }, p, { life: p.max ?? 1 });
}
export function dust(x: number, y: number) {
  for (let i = 0; i < 8; i++) emit({ x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 1.5, max: 0.5, size: 3 + Math.random() * 3, color: 'rgba(120,90,60,.5)' });
}
export function sparkle(x: number, y: number, color = '#ffd54f') {
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; emit({ x, y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 1, max: 0.7, size: 4, color, shape: 'star' }); }
}
export function weather(kind: 'leaf' | 'sand' | 'ember' | 'snow', W: number, H: number, camX: number) {
  if (Math.random() > (kind === 'sand' ? 0.5 : 0.3)) return;
  const x = camX + Math.random() * (W + 200) - 100;
  if (kind === 'leaf') emit({ x, y: -10, vx: -1 - Math.random(), vy: 1 + Math.random(), max: 6, size: 6, color: Math.random() < 0.5 ? '#8bc34a' : '#c0a060', shape: 'rect', rot: Math.random() * 6 });
  if (kind === 'sand') emit({ x: camX + W + 20, y: Math.random() * H, vx: -4 - Math.random() * 3, vy: 0.3, max: 3, size: 2, color: 'rgba(230,200,150,.6)' });
  if (kind === 'ember') emit({ x, y: H, vx: (Math.random() - 0.5) * 0.6, vy: -1 - Math.random(), max: 4, size: 2 + Math.random() * 2, color: Math.random() < 0.5 ? '#ff9800' : '#ff5722' });
  if (kind === 'snow') emit({ x, y: -10, vx: -0.3 + Math.random() * 0.6, vy: 0.8 + Math.random(), max: 8, size: 2 + Math.random() * 3, color: 'rgba(255,255,255,.9)' });
}
export function stepParticles(dt: number, camX: number, W: number) {
  for (const p of particles) {
    if (p.life <= 0) continue;
    p.life -= dt / 60; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += 0.05 * dt;
    if (p.shape === 'rect') p.vx += Math.sin(p.rot) * 0.05;
    if (p.world && (p.x < camX - 300 || p.x > camX + W + 300)) p.life = 0;
  }
}
export function drawParticles(ctx: CanvasRenderingContext2D, camX: number) {
  for (const p of particles) {
    if (p.life <= 0) continue;
    const sx = p.world ? p.x - camX : p.x;
    ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5); ctx.fillStyle = p.color;
    if (p.shape === 'dot') { ctx.beginPath(); ctx.arc(sx, p.y, p.size, 0, 7); ctx.fill(); }
    else if (p.shape === 'rect') { ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
    else { ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -1, p.size, 2); ctx.fillRect(-1, -p.size / 2, 2, p.size); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}
