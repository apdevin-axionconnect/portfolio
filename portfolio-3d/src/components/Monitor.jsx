import { useEffect, useRef } from 'react'
import { Html, RoundedBox } from '@react-three/drei'

// The screen is the macOS portfolio (../macos-portfolio) built into public/os by `npm run build:os`.
// It runs in an iframe so its fixed-position UI, keyboard shortcuts and localStorage behave exactly as standalone.
// Screen is 1280x800 CSS px; drei transform maps px -> world at distanceFactor/400, so 0.5 gives 1.6 x 1.0 units.
export default function Monitor({ portal, lite, focused, onClick }) {
  const frame = useRef(null)
  useEffect(() => { if (focused) frame.current?.focus() }, [focused])
  return (
    <group position={[0, 1.35, -1.5]}>
      <RoundedBox position={[0, -0.52, -0.05]} args={[0.5, 0.03, 0.26]} radius={0.01} castShadow><meshStandardMaterial color="#111" metalness={0.5} roughness={0.4} /></RoundedBox>
      <mesh position={[0, -0.35, -0.04]} castShadow><boxGeometry args={[0.08, 0.35, 0.04]} /><meshStandardMaterial color="#111" metalness={0.5} roughness={0.4} /></mesh>
      <RoundedBox args={[1.68, 1.08, 0.04]} radius={0.015} castShadow onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onClick() }} // delta: a drag that ends here is an orbit, not a click
        onPointerOver={() => (document.body.style.cursor = focused ? 'auto' : 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.35} metalness={0.3} />
      </RoundedBox>
      {/* glowing panel under the DOM screen so the monitor lights the room and blooms */}
      <mesh position={[0, 0, 0.021]}><planeGeometry args={[1.6, 1]} /><meshStandardMaterial color="#000" emissive="#5b6ee1" emissiveIntensity={focused ? 0.2 : 0.6} toneMapped={false} /></mesh>
      {/* screen spill. The area light is evaluated for every lit pixel in the room, so the light tier uses a point light instead. */}
      {lite
        ? <pointLight position={[0, -0.1, 0.5]} intensity={focused ? 0.5 : 1.3} distance={3.5} color="#8fa3ff" />
        : <rectAreaLight position={[0, 0, 0.1]} width={1.6} height={1} intensity={focused ? 1 : 3} color="#8fa3ff" />}
      <Html portal={portal} transform occlude position={[0, 0, 0.04]} distanceFactor={0.5} pointerEvents={focused ? 'auto' : 'none'}>
        <iframe ref={frame} className="screen" title="macOS portfolio" src={import.meta.env.BASE_URL + 'os/index.html'} width={1280} height={800} tabIndex={-1}
          allow="microphone" onClick={() => focused || onClick()} />
      </Html>
    </group>
  )
}
