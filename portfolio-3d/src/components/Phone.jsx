import { Html, RoundedBox } from '@react-three/drei'
import Android from './phone/Android.jsx'
import { PHONE } from '../views.js'

// The Android UI is 360x780 CSS px; drei transform maps px -> world at distanceFactor/400.
const SCREEN_W = PHONE.w - 0.006
const FACTOR = (SCREEN_W / 360) * 400

// A phone propped on a small stand. Same trick as the monitor: real DOM projected onto the screen.
export default function Phone({ portal, focused, onClick }) {
  const hover = (on) => () => (document.body.style.cursor = on && !focused ? 'pointer' : 'auto')
  return (
    <group position={PHONE.position} rotation={[0, PHONE.yaw, 0]}>
      {/* stand: a wedge behind the phone */}
      <mesh position={[0, 0.03, -0.045]} rotation={[0.5, 0, 0]} castShadow><boxGeometry args={[0.05, 0.075, 0.006]} /><meshStandardMaterial color="#1a1b1f" roughness={0.5} metalness={0.6} /></mesh>
      <mesh position={[0, 0.003, -0.034]} castShadow><boxGeometry args={[0.06, 0.006, 0.07]} /><meshStandardMaterial color="#1a1b1f" roughness={0.5} metalness={0.6} /></mesh>
      <group rotation={[-PHONE.tilt, 0, 0]}>
        <RoundedBox args={[PHONE.w, PHONE.h, 0.008]} radius={0.0038} position={[0, PHONE.h / 2, 0]} castShadow
          onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onClick() }} onPointerOver={hover(true)} onPointerOut={hover(false)}>
          <meshStandardMaterial color="#0b0c0f" roughness={0.3} metalness={0.5} />
        </RoundedBox>
        <mesh position={[PHONE.w / 2 + 0.0006, PHONE.h * 0.66, 0]}><boxGeometry args={[0.0014, 0.014, 0.003]} /><meshStandardMaterial color="#1c1d22" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[PHONE.w / 2 + 0.0006, PHONE.h * 0.52, 0]}><boxGeometry args={[0.0014, 0.026, 0.003]} /><meshStandardMaterial color="#1c1d22" metalness={0.8} roughness={0.3} /></mesh>
        {/* faint glow under the DOM screen so the phone lights the desk a little */}
        <mesh position={[0, PHONE.h / 2, 0.0042]}><planeGeometry args={[SCREEN_W, PHONE.h - 0.006]} /><meshStandardMaterial color="#000" emissive="#7c6cf0" emissiveIntensity={focused ? 0.1 : 0.5} toneMapped={false} /></mesh>
        <Html portal={portal} transform occlude position={[0, PHONE.h / 2, 0.0046]} distanceFactor={FACTOR} pointerEvents={focused ? 'auto' : 'none'} zIndexRange={[40, 30]}>
          <Android />
        </Html>
      </group>
    </group>
  )
}
