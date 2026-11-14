import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { VIEWS } from '../views.js'

// Keep the orbit camera inside the walls (room spans x ±3, y 0..3, z -2.5..3.5) with some margin.
const ROOM_MIN = new Vector3(-2.7, 0.4, -2.2), ROOM_MAX = new Vector3(2.7, 2.8, 3.2)
const PREV = new Vector3(), PREV_T = new Vector3(), GOAL = new Vector3()
const HALF_FOV_TAN = Math.tan((50 * Math.PI) / 360) // camera fov is 50 (App.jsx)

// The canvas runs frameloop="demand": this rig requests frames only while a glide is in progress.
// view: 'room' (free orbit) or another key of VIEWS to sit in front of (desk, board, phone).
export default function CameraRig({ view, kick, regress, onSlow }) {
  const controls = useThree((s) => s.controls)
  const invalidate = useThree((s) => s.invalidate)
  const lowerRes = useThree((s) => s.performance.regress) // AdaptiveDpr (App.jsx) renders at reduced resolution while this keeps being called
  const focused = view !== 'room'
  const gliding = useRef(false) // moving to a view, or back to the room
  const fresh = useRef(true) // first frame of a glide: the clock delta covers the idle time before it, so ignore it
  const dragging = useRef(false)
  const perf = useRef({ t: 0, n: 0, done: false }) // frame-time sample taken only while frames are continuous (glide or drag)
  // kick flips when the room's shaders are ready and drawing is allowed again: request the first real frame
  useEffect(() => { gliding.current = fresh.current = true; invalidate() }, [view, kick, invalidate])
  useEffect(() => {
    if (!controls) return
    const stop = () => { if (!focused) gliding.current = false; dragging.current = fresh.current = true } // user grabbed the camera: stop fighting them
    const end = () => (dragging.current = false)
    controls.addEventListener('start', stop); controls.addEventListener('end', end)
    return () => { controls.removeEventListener('start', stop); controls.removeEventListener('end', end) }
  }, [controls, focused])

  useFrame(({ camera, size }, dt) => {
    if (!controls) return
    const p = perf.current
    // Sample glides to a view (assets are loaded by then, frames are back to back) and drags (dt capped: a held-still mouse is not a slow GPU).
    if (!p.done && !fresh.current && ((gliding.current && focused) || dragging.current)) {
      p.t += dragging.current ? Math.min(dt, 0.25) : dt; p.n++
      if (p.t > 1) { if (p.n < 22) { p.done = true; onSlow?.() } else p.t = p.n = 0 }
    }
    if (dragging.current) fresh.current = false
    if (!gliding.current) { if (!focused) camera.position.clamp(ROOM_MIN, ROOM_MAX); return }
    const k = 1 - Math.exp(-4 * (fresh.current ? 1 / 60 : Math.min(dt, 0.25)))
    fresh.current = false
    const v = VIEWS[view]
    // back off on narrow windows so `fit` world units stay visible horizontally
    const dist = v.fit ? Math.max(v.dist, v.fit / (2 * HALF_FOV_TAN * (size.width / size.height))) : v.dist
    GOAL.copy(v.dir).multiplyScalar(dist).add(v.target)
    PREV.copy(camera.position); PREV_T.copy(controls.target)
    camera.position.lerp(GOAL, k)
    controls.target.lerp(v.target, k)
    camera.lookAt(controls.target) // not controls.update(): its min/max distance limits would fight the close-up views
    // Stop when nothing moves any more; OrbitControls picks the camera up from here on the next drag.
    if (PREV.distanceTo(camera.position) + PREV_T.distanceTo(controls.target) > 1e-4) { invalidate(); if (regress) lowerRes() }
    else gliding.current = false
  })
  return null
}
