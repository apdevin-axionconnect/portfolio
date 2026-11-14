import { useCallback, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { BOARD } from '../views.js'

const W = 1440, H = Math.round((W * BOARD.h) / BOARD.w) // drawing surface in px, same aspect as the board
const MARKERS = ['#16181d', '#d92d20', '#1570ef', '#079455']
const SIZES = { S: 4, M: 9, L: 18 }
const KEY = 'room:whiteboard'
const PAPER = '#fbfbf8'

// The drawing surface lives outside React: it is one long-lived, mutable canvas + texture, not render state.
let surface
function getSurface() {
  if (surface) return surface
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  canvas.className = 'board-canvas'
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H)
  ctx.lineCap = ctx.lineJoin = 'round'
  const tex = new CanvasTexture(canvas); tex.colorSpace = SRGBColorSpace
  tex.generateMipmaps = false; tex.minFilter = LinearFilter
  return (surface = { canvas, ctx, tex })
}

// A real drawing surface, saved to localStorage.
// In the room it is a texture on the board. At the board, the same <canvas> is laid over it as DOM (like the monitor
// screen), so ink appears at native speed with no 3D redraw and no texture upload per stroke; the texture is synced
// once when the pen lifts.
export default function Whiteboard({ portal, active, onClick }) {
  const invalidate = useThree((s) => s.invalidate)
  const [color, setColor] = useState(MARKERS[0])
  const [erasing, setErasing] = useState(false)
  const [size, setSize] = useState('M')
  const last = useRef(null)
  const lastMid = useRef(null)

  const tex = getSurface().tex // render only reads it; all drawing goes through getSurface() inside handlers
  const sync = useCallback(() => { getSurface().tex.needsUpdate = true; invalidate() }, [invalidate])

  useEffect(() => { // restore the last drawing
    let saved = null
    try { saved = localStorage.getItem(KEY) } catch { /* private mode */ }
    if (!saved) return
    const img = new Image()
    img.onload = () => { getSurface().ctx.drawImage(img, 0, 0, W, H); sync() }
    img.src = saved
  }, [sync])
  const save = () => { try { localStorage.setItem(KEY, getSurface().canvas.toDataURL('image/png')) } catch { /* quota or private mode: drawing stays for this visit */ } }

  const stroke = (from, to) => {
    const { ctx } = getSurface()
    ctx.strokeStyle = erasing ? PAPER : color
    ctx.lineWidth = erasing ? 70 : SIZES[size]
    // quadratic curve from the previous midpoint to the new one, through the last raw point: no visible corners
    const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], start = lastMid.current || from
    ctx.beginPath(); ctx.moveTo(...start); ctx.quadraticCurveTo(from[0], from[1], mid[0], mid[1]); ctx.stroke()
    lastMid.current = mid
  }
  // DOM pointer events on the overlaid canvas; offsetX/Y are already in canvas pixels, 3D transform included
  const at = (e) => [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
  const down = (e) => { if (e.target.tagName !== 'CANVAS') return; e.target.setPointerCapture(e.pointerId); last.current = at(e); lastMid.current = null; stroke(last.current, last.current) }
  const move = (e) => { if (!last.current || e.target.tagName !== 'CANVAS') return; const p = at(e); stroke(last.current, p); last.current = p }
  const up = () => { if (!last.current) return; last.current = null; sync(); save() }
  const clear = () => { const { ctx } = getSurface(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); sync(); save() }
  const download = () => { const a = document.createElement('a'); a.href = getSurface().canvas.toDataURL('image/png'); a.download = 'whiteboard.png'; a.click() }

  // mount the shared canvas element into the overlay while at the board
  const host = useCallback((el) => { if (el) el.appendChild(getSurface().canvas) }, [])

  // onClick + delta check everywhere: a drag that starts or ends on the board is an orbit, not a click
  const tap = (fn) => (e) => { e.stopPropagation(); if (e.delta > 6) return; if (!active) return onClick(); fn?.() }
  const hover = (on) => () => (document.body.style.cursor = on ? 'pointer' : 'auto')
  const trayY = -BOARD.h / 2 - 0.035

  return (
    <group position={BOARD.position} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[BOARD.w + 0.06, BOARD.h + 0.06, 0.03]} radius={0.008} position={[0, 0, -0.016]} castShadow receiveShadow>
        <meshStandardMaterial color="#b9bcc2" metalness={0.8} roughness={0.35} />
      </RoundedBox>
      <mesh onClick={tap()} onPointerOver={hover(!active)} onPointerOut={hover(false)}>
        <planeGeometry args={[BOARD.w, BOARD.h]} />
        {/* Unlit on purpose: it is a bright white surface, and unlit pixels are cheap. The grey tint stands in for the dim room light. */}
        <meshBasicMaterial map={tex} color="#c9cac8" toneMapped={false} />
      </mesh>
      {active && (
        <Html portal={portal} transform position={[0, 0, 0.002]} distanceFactor={(BOARD.w / W) * 400} pointerEvents="auto" zIndexRange={[20, 10]}>
          <div ref={host} className={'board-surface' + (erasing ? ' erasing' : '')} style={{ width: W, height: H }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        </Html>
      )}
      {/* tray with markers and an eraser: click one to pick it */}
      <RoundedBox args={[BOARD.w * 0.5, 0.018, 0.07]} radius={0.004} position={[0, trayY, 0.035]} castShadow receiveShadow>
        <meshStandardMaterial color="#9a9da3" metalness={0.8} roughness={0.4} />
      </RoundedBox>
      {MARKERS.map((c, i) => {
        const on = !erasing && color === c
        return (
          <group key={c} position={[-0.3 + i * 0.14, trayY + 0.022 + (on && active ? 0.012 : 0), 0.04]} rotation={[0, 0, Math.PI / 2]} onClick={tap(() => { setErasing(false); setColor(c) })} onPointerOver={hover(true)} onPointerOut={hover(false)}>
            <mesh castShadow><capsuleGeometry args={[0.011, 0.085, 4, 12]} /><meshStandardMaterial color="#f2f2f0" roughness={0.5} /></mesh>
            <mesh position={[0, 0.045, 0]}><cylinderGeometry args={[0.0118, 0.0118, 0.035, 12]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
            <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.0115, 0.0115, 0.02, 12]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
          </group>
        )
      })}
      <RoundedBox args={[0.11, 0.03, 0.045]} radius={0.006} position={[0.33, trayY + 0.024 + (erasing && active ? 0.012 : 0), 0.04]} castShadow
        onClick={tap(() => setErasing(true))} onPointerOver={hover(true)} onPointerOut={hover(false)}>
        <meshStandardMaterial color="#2b2d33" roughness={0.9} />
      </RoundedBox>

      {active && (
        <Html portal={portal} position={[0, trayY - 0.13, 0.05]} center zIndexRange={[60, 50]}>
          <div className="board-tools" role="toolbar" aria-label="Whiteboard tools">
            {MARKERS.map((c) => <button key={c} className={'swatch' + (!erasing && color === c ? ' on' : '')} style={{ background: c }} aria-label={`Marker ${c}`} onClick={() => { setErasing(false); setColor(c) }} />)}
            <span className="sep" />
            {Object.keys(SIZES).map((s) => <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)} aria-label={`Thickness ${s}`}>{s}</button>)}
            <span className="sep" />
            <button className={erasing ? 'on' : ''} onClick={() => setErasing((x) => !x)}>Eraser</button>
            <button onClick={clear}>Clear</button>
            <button onClick={download}>Save PNG</button>
          </div>
        </Html>
      )}
    </group>
  )
}
