import { useEffect, useMemo, useState } from 'react'
import { RoundedBox } from '@react-three/drei'
import { AdditiveBlending, PlaneGeometry } from 'three'
import { nightSky, moonPatch, posterArt, rugWeave, clockFace, photo } from '../textures.js'

// Everything here is set dressing: procedural textures and small props that make the room read as lived-in.
// Textures come from ../textures.js (drawn to canvases, nothing extra is downloaded).

const Mat = ({ color, rough = 0.6, metal = 0 }) => <meshStandardMaterial color={color} roughness={rough} metalness={metal} />

function WallClock() {
  // state is "minutes since midnight", so React only re-renders (one frame) when the minute actually changes
  const mins = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
  const [t, setT] = useState(mins)
  useEffect(() => { const id = setInterval(() => setT(mins()), 15000); return () => clearInterval(id) }, [])
  const m = t % 60, h = (t / 60) % 12
  return (
    <group position={[0, 2.44, -2.47]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.2, 0.2, 0.035, 48]} /><Mat color="#1c1c20" rough={0.4} metal={0.6} /></mesh>
      <mesh position={[0, 0, 0.019]}><circleGeometry args={[0.185, 48]} /><meshStandardMaterial map={clockFace()} roughness={0.6} /></mesh>
      <group position={[0, 0, 0.022]} rotation={[0, 0, -(h / 12) * Math.PI * 2]}><mesh position={[0, 0.045, 0]}><boxGeometry args={[0.012, 0.1, 0.003]} /><Mat color="#16161a" /></mesh></group>
      <group position={[0, 0, 0.025]} rotation={[0, 0, -(m / 60) * Math.PI * 2]}><mesh position={[0, 0.07, 0]}><boxGeometry args={[0.008, 0.15, 0.003]} /><Mat color="#16161a" /></mesh></group>
      <mesh position={[0, 0, 0.028]}><circleGeometry args={[0.012, 16]} /><Mat color="#c0392b" /></mesh>
    </group>
  )
}

function Curtain({ z }) {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(0.46, 2.15, 28, 6), p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 44) * 0.028 * (0.6 + (1.075 - p.getY(i)) * 0.25)) // folds, slightly fuller at the hem
    g.computeVertexNormals()
    return g
  }, [])
  return <mesh geometry={geo} position={[-2.84, 1.56, z]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow><meshStandardMaterial color="#6d6a78" roughness={0.95} side={2} /></mesh>
}

export default function Decor() {
  const D = 0.775 // desk top
  return (
    <group>
      {/* the view outside: night sky, moon and a lit skyline, slightly emissive so it glows into the room */}
      <mesh position={[-2.9035, 1.7, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.6, 1.3]} />
        <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={nightSky()} emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {/* window-shaped moonlight on the floor: an additive decal, the cheap and reliable way to get this look */}
      <mesh position={[-1.1, 0.0125, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.75, 1.9]} />
        <meshBasicMaterial map={moonPatch()} transparent blending={AdditiveBlending} opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <Curtain z={-1.66} /><Curtain z={0.46} />
      <mesh position={[-2.84, 2.66, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.012, 0.012, 2.7, 12]} /><Mat color="#2a2a2e" rough={0.4} metal={0.8} /></mesh>

      {/* art on the existing poster frame, and a woven pattern on the rug */}
      <mesh position={[1.4, 1.9, -2.4635]}><planeGeometry args={[0.72, 1.02]} /><meshStandardMaterial map={posterArt()} roughness={0.85} /></mesh>
      <mesh position={[0.2, 0.0112, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.2, 64]} /><meshStandardMaterial map={rugWeave()} roughness={1} /></mesh>

      <WallClock />

      {/* desk clutter */}
      <RoundedBox args={[0.2, 0.03, 0.27]} radius={0.004} position={[-0.5, D + 0.015, -1.9]} rotation={[0, 0.15, 0]} castShadow><Mat color="#2f4a7a" rough={0.8} /></RoundedBox>
      <RoundedBox args={[0.18, 0.026, 0.25]} radius={0.004} position={[-0.49, D + 0.043, -1.9]} rotation={[0, -0.12, 0]} castShadow><Mat color="#b5533c" rough={0.8} /></RoundedBox>
      <group position={[0.5, D, -1.94]}>
        <mesh position={[0, 0.045, 0]} castShadow><cylinderGeometry args={[0.036, 0.032, 0.09, 24, 1, true]} /><meshStandardMaterial color="#25262b" roughness={0.5} side={2} /></mesh>
        {[['#f2c14e', 0.12, 0.3], ['#e4572e', -0.14, 1.8], ['#4c9f70', 0.1, 3.6], ['#ececec', -0.08, 5]].map(([c, lean, a]) => (
          <mesh key={c} position={[Math.cos(a) * 0.012, 0.075, Math.sin(a) * 0.012]} rotation={[lean, 0, -lean]} castShadow><cylinderGeometry args={[0.004, 0.004, 0.15, 8]} /><Mat color={c} rough={0.5} /></mesh>
        ))}
      </group>
      <group position={[-0.38, D, -1.25]} rotation={[0, 0.25, 0]}>
        <RoundedBox args={[0.15, 0.012, 0.21]} radius={0.003} position={[0, 0.006, 0]} castShadow><Mat color="#17181c" rough={0.7} /></RoundedBox>
        <mesh position={[0.002, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.14, 0.2]} /><Mat color="#efe9dc" rough={0.9} /></mesh>
        <mesh position={[0.03, 0.019, 0.01]} rotation={[0, 0.5, Math.PI / 2]} castShadow><cylinderGeometry args={[0.004, 0.004, 0.14, 8]} /><Mat color="#1570ef" rough={0.4} /></mesh>
      </group>
      {/* headphones on a stand */}
      <group position={[-1.04, D, -1.5]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.006, 0]} castShadow><cylinderGeometry args={[0.055, 0.06, 0.012, 32]} /><Mat color="#1d1d21" rough={0.4} metal={0.7} /></mesh>
        <mesh position={[0, 0.13, 0]} castShadow><cylinderGeometry args={[0.007, 0.007, 0.25, 12]} /><Mat color="#1d1d21" rough={0.4} metal={0.7} /></mesh>
        <mesh position={[0, 0.2, 0]} castShadow><torusGeometry args={[0.085, 0.009, 10, 32, Math.PI]} /><Mat color="#121215" rough={0.6} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.085, 0.185, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.032, 24]} /><Mat color="#18181c" rough={0.7} /></mesh>)}
      </group>

      {/* framed photo on the shelf, and a wall socket by the desk */}
      <group position={[-1.14, 2.015, -2.38]} rotation={[-0.12, 0.2, 0]}>
        <RoundedBox args={[0.16, 0.2, 0.014]} radius={0.004} castShadow><Mat color="#e9e4da" rough={0.6} /></RoundedBox>
        <mesh position={[0, 0, 0.0075]}><planeGeometry args={[0.128, 0.16]} /><meshStandardMaterial map={photo()} roughness={0.5} /></mesh>
      </group>
      <RoundedBox args={[0.085, 0.12, 0.01]} radius={0.004} position={[1.55, 0.32, -2.494]}><Mat color="#ecebe7" rough={0.5} /></RoundedBox>
    </group>
  )
}
