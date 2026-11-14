import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Object3D, WebGLRenderTarget } from 'three'
import { OrbitControls, Environment, SoftShadows, ContactShadows, AdaptiveDpr } from '@react-three/drei'
import Room from './components/Room.jsx'
import Monitor from './components/Monitor.jsx'
import Whiteboard from './components/Whiteboard.jsx'
import Phone from './components/Phone.jsx'
import Decor from './components/Decor.jsx'
import CameraRig from './components/CameraRig.jsx'

const Effects = lazy(() => import('./components/Effects.jsx'))

// A spotlight only aims at its target if that target lives in the scene graph.
function Spot({ to, ...p }) {
  const target = useMemo(() => new Object3D(), [])
  return <><primitive object={target} position={to} /><spotLight target={target} {...p} /></>
}

// Full quality (soft shadows, ambient occlusion, MSAA) only on GPUs known to handle it. Deciding from the GPU name up front
// means only one set of shaders is ever compiled: on integrated graphics the heavy set alone blocks the page for many seconds.
function fastGpu() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /NVIDIA|GeForce|RTX|GTX|Quadro|Radeon (\(TM\) )?(RX|Pro)|Apple M\d|Intel\(R\) Arc/i.test(name)
  } catch { return false }
}

// Compiles every shader in the scene without blocking the page. three.js normally waits on each program synchronously;
// on Windows (Direct3D) that is ~0.5 s per program and froze start-up for ~15 s. compileAsync links them all at once,
// lets the driver work in parallel, and polls for completion.
function Precompile({ offscreen, onDone }) {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera)
  useEffect(() => {
    let live = true
    // The scene is drawn into the post-processing buffer, and three.js builds different shader variants for an off-screen
    // target (linear output, no tone mapping) than for the screen. Compile with a target bound, or none of this work is reused.
    const target = new WebGLRenderTarget(1, 1)
    if (offscreen) gl.setRenderTarget(target)
    const ready = gl.compileAsync(scene, camera)
    gl.setRenderTarget(null)
    ready.catch(() => {}).then(() => { target.dispose(); if (live) onDone() })
    return () => { live = false }
  }, [gl, scene, camera, offscreen, onDone])
  return null
}

// Calls onShown once the first real frame is on screen (post-processing and shadow shaders compile during frame one),
// so the loader is only lifted when the room can actually be seen and used.
function Reveal({ active, onShown }) {
  const invalidate = useThree((s) => s.invalidate)
  const n = useRef(0)
  useFrame(() => { if (!active || n.current > 1) return; if (++n.current > 1) onShown(); else invalidate() })
  return null
}

// Nothing that casts a shadow ever moves (room and lights are fixed), so render the shadow maps once instead of every
// frame. That removes roughly two thirds of the draw calls from every camera move.
const staticShadows = ({ gl }) => { gl.shadowMap.autoUpdate = false; gl.shadowMap.needsUpdate = true }

export default function App() {
  const [view, setView] = useState('room') // room | desk | board | phone (see views.js)
  const [low, setLow] = useState(() => !fastGpu()) // CameraRig also drops to low if camera moves render below ~22 fps
  // Shadow filtering is fixed at start-up (changing it later would recompile every shader). The light tier uses plain PCF and
  // no shadow from the ceiling lamp: point-light soft shadows are the bulkiest part of each shader, and shader size is what
  // makes first-visit compilation slow on integrated GPUs.
  const [lite] = useState(low)
  // No frame is drawn until every shader is compiled (see Precompile), so start-up never blocks the page. Meanwhile the
  // static loader from index.html stays up and the OS inside the monitor boots in the background.
  const [compiled, setCompiled] = useState(false)
  const done = useCallback(() => setCompiled(true), [])
  const shown = useCallback(() => document.getElementById('loader')?.classList.add('done'), [])
  // Stable portal for drei <Html>: its default target changes after mount, which remounts the root and React 19 rejects that.
  const portal = useRef(null)
  return (
    <>
      <div ref={portal} className="portal" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }} />
      {/* frameloop="demand": nothing in the room animates, so only draw when the camera moves. Keeps the GPU and main thread free for the OS on the monitor. */}
      <Canvas shadows={lite ? 'percentage' : 'soft'} flat onCreated={staticShadows} frameloop={compiled ? 'demand' : 'never'} dpr={low ? 1 : [1, 1.5]} performance={{ min: 0.6, debounce: 250 }} camera={{ position: [2.4, 2.0, 2.8], fov: 50 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#05060a']} />
        {/* Light tier is fill-rate bound: draw at 60% resolution while the camera moves, snap back to full when it stops. */}
        {lite && <AdaptiveDpr />}
        {!low && <SoftShadows size={25} samples={12} />}
        <Suspense fallback={null}>
          {/* self-hosted 512px copy of drei's "night" preset (Poly Haven dikhololo_night, CC0): no third-party CDN at runtime */}
          <Environment files={import.meta.env.BASE_URL + 'env/night.hdr'} environmentIntensity={0.4} />
          <Room />
          {/* soft grounding under furniture, rendered once (frames={1}) so it costs nothing afterwards */}
          <ContactShadows frames={1} position={[0, 0.013, 0.5]} scale={7} far={1.1} blur={2.4} opacity={0.5} resolution={512} />
          <Precompile offscreen={!lite} onDone={done} />
        </Suspense>
        {/* ceiling lamp, desk lamp, moonlight through the window */}
        <pointLight position={[0, 2.85, 0]} intensity={6} color="#ffe8cf" castShadow={!lite} shadow-bias={-0.001} shadow-normalBias={0.04} />
        <Spot position={[-0.9, 1.25, -1.8]} to={[-0.6, 0.75, -1.5]} angle={0.9} penumbra={0.8} intensity={10} color="#ffb86b" castShadow shadow-bias={-0.0005} />
        {/* moon fill: starts at the window pane, because the wall would block a light placed outside. The pane-shaped patch on the floor is in Decor. */}
        <Spot position={[-2.86, 1.75, -0.6]} to={[0.2, 0, 0.3]} angle={0.75} penumbra={1} intensity={45} color="#a9c1ff" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
        <Decor />
        <Monitor portal={portal} lite={lite} focused={view === 'desk'} onClick={() => setView('desk')} />
        <Whiteboard portal={portal} active={view === 'board'} onClick={() => setView('board')} />
        <Phone portal={portal} focused={view === 'phone'} onClick={() => setView('phone')} />
        <CameraRig view={view} kick={compiled} regress={lite} onSlow={() => setLow(true)} />
        <Reveal active={compiled} onShown={shown} />
        {/* light tier: no damping, so the camera stops when you let go and the full-resolution frame follows 250 ms later */}
        <OrbitControls makeDefault regress={lite} enableDamping={!lite} enabled={view === 'room'} target={[0, 1, -0.8]} maxPolarAngle={Math.PI / 2.05} minPolarAngle={0.3}
          minAzimuthAngle={-Math.PI / 2.3} maxAzimuthAngle={Math.PI / 2.3} minDistance={1.5} maxDistance={4.5} />
        {/* Light tier draws straight to the screen: the post-processing chain (bloom's blur passes above all) costs more than
            the scene itself on integrated GPUs. Its vignette is the .vignette div below. */}
        {!lite && <Suspense fallback={null}><Effects low={low} /></Suspense>}
      </Canvas>
      {lite && <div className="vignette" aria-hidden="true" />}
      {view !== 'room'
        ? <button className="back" onClick={() => setView('room')}>← Back to room</button>
        : (
          <nav className="hint" aria-label="Things to use in the room">
            <span>Drag to look around, or go to</span>
            {/* buttons, not only 3D clicks: keyboard and screen-reader users can reach everything */}
            <button onClick={() => setView('desk')}>Monitor</button>
            <button onClick={() => setView('board')}>Whiteboard</button>
            <button onClick={() => setView('phone')}>Phone</button>
          </nav>
        )}
    </>
  )
}
