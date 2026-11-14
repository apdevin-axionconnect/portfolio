import { CanvasTexture, SRGBColorSpace } from 'three'

// Procedural textures, drawn to canvases on first use and cached. Nothing is downloaded.
const cache = new Map()
function canvasTex(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8
  cache.set(key, t)
  return t
}
// small deterministic PRNG so the skyline and stars look the same on every visit
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

export const nightSky = () => canvasTex('sky', 768, 624, (g, w, h) => {
  const r = rng(7)
  const sky = g.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#040818'); sky.addColorStop(0.55, '#0e1c46'); sky.addColorStop(0.85, '#2b3568'); sky.addColorStop(1, '#4a3f6e')
  g.fillStyle = sky; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.75})`; const s = r() < 0.9 ? 1 : 2; g.fillRect(r() * w, r() * h * 0.62, s, s) }
  // moon with a soft halo
  const mx = w * 0.72, my = h * 0.2
  const halo = g.createRadialGradient(mx, my, 10, mx, my, 150)
  halo.addColorStop(0, 'rgba(190,210,255,0.55)'); halo.addColorStop(1, 'rgba(190,210,255,0)')
  g.fillStyle = halo; g.fillRect(mx - 150, my - 150, 300, 300)
  g.fillStyle = '#f4f6ff'; g.beginPath(); g.arc(mx, my, 30, 0, 7); g.fill()
  g.fillStyle = 'rgba(160,175,210,0.5)'; for (const [x, y, s] of [[-9, -6, 7], [8, 5, 5], [-3, 11, 4]]) { g.beginPath(); g.arc(mx + x, my + y, s, 0, 7); g.fill() }
  // two rows of city skyline with lit windows
  for (const [base, tone, lit] of [[0.6, '#101733', 0.25], [0.72, '#070b1c', 0.4]]) {
    for (let x = -10; x < w;) {
      const bw = 34 + r() * 60, bh = h * (0.1 + r() * (1 - base) * 0.75), top = h * base + (h * (1 - base) - bh) * 0.35
      g.fillStyle = tone; g.fillRect(x, top, bw, h - top)
      for (let wy = top + 8; wy < h - 6; wy += 11) for (let wx = x + 5; wx < x + bw - 6; wx += 9) if (r() < lit) { g.fillStyle = r() < 0.8 ? '#ffd58a' : '#bfe0ff'; g.fillRect(wx, wy, 4, 6) }
      x += bw + 2
    }
  }
})

// moonlight falling through the four window panes onto the floor (drawn sheared, as the light arrives at an angle)
export const moonPatch = () => canvasTex('moon', 256, 256, (g, w, h) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
  g.setTransform(1, 0.22, 0, 1, 0, -18)
  g.filter = 'blur(7px)'; g.fillStyle = 'rgb(150,176,255)'
  for (const [x, y] of [[30, 40], [128, 40], [30, 124], [128, 124]]) g.fillRect(x, y, 86, 72)
})

export const posterArt = () => canvasTex('poster', 512, 724, (g, w, h) => {
  const bg = g.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#1b1338'); bg.addColorStop(0.55, '#5a2a6e'); bg.addColorStop(1, '#f08a4b')
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  const sun = g.createLinearGradient(0, 200, 0, 470)
  sun.addColorStop(0, '#ffd27a'); sun.addColorStop(1, '#ff6a5c')
  g.fillStyle = sun; g.beginPath(); g.arc(w / 2, 340, 130, 0, 7); g.fill()
  g.fillStyle = '#5a2a6e'; for (let i = 0; i < 6; i++) g.fillRect(0, 372 + i * 20, w, 3 + i * 1.6) // scan lines through the sun
  const r = rng(3)
  for (const [y, c] of [[470, '#3a1d57'], [520, '#26133f'], [580, '#150b28']]) {
    g.fillStyle = c; g.beginPath(); g.moveTo(0, h)
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x / 70 + y) * 22 - r() * 26)
    g.lineTo(w, h); g.fill()
  }
  g.fillStyle = '#f7e9d7'; g.textAlign = 'center'
  g.font = '700 46px system-ui, sans-serif'; g.fillText('BUILD · SHIP · LEARN', w / 2, 118)
  g.font = '500 17px system-ui, sans-serif'; g.fillText('N O   S H O R T C U T S   T O   C R A F T', w / 2, 152)
  g.strokeStyle = 'rgba(247,233,215,0.85)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44)
})

export const rugWeave = () => canvasTex('rug', 512, 512, (g, w) => {
  const c = w / 2, r = rng(11)
  g.fillStyle = '#40304a'; g.fillRect(0, 0, w, w)
  for (const [rad, col, lw] of [[250, '#33263d', 12], [226, '#6b5470', 4], [196, '#4b3956', 26], [150, '#7a654e', 3], [120, '#463450', 30], [70, '#6b5470', 4], [40, '#33263d', 14]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(c, c, rad, 0, 7); g.stroke() }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.07})`; g.fillRect(r() * w, r() * w, 2, 1) } // woven noise
})

export const clockFace = () => canvasTex('clock', 256, 256, (g, w) => {
  const c = w / 2
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill()
  g.fillStyle = '#1c1c20'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '600 26px system-ui, sans-serif'
  for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillText(String(i), c + Math.sin(a) * 92, c - Math.cos(a) * 92) }
  for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 116 : 110; g.lineWidth = i % 5 ? 1.5 : 3; g.strokeStyle = '#1c1c20'; g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * 122, c - Math.cos(a) * 122); g.stroke() }
})

export const photo = () => canvasTex('photo', 128, 160, (g, w, h) => {
  const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#f9c97a'); s.addColorStop(0.6, '#e8845c'); s.addColorStop(1, '#2d4a6b')
  g.fillStyle = s; g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(w * 0.6, h * 0.42, 14, 0, 7); g.fill()
  g.fillStyle = '#1d3350'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.72); g.lineTo(w * 0.35, h * 0.55); g.lineTo(w * 0.6, h * 0.7); g.lineTo(w, h * 0.6); g.lineTo(w, h); g.fill()
})
