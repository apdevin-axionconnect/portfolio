import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

const ROOM = import.meta.env.BASE_URL + 'room.glb' // base-relative so the site works from any folder on a host

// Room model is authored in Blender by blender/build_room.py and exported to public/room.glb.
export default function Room() {
  const { scene } = useGLTF(ROOM)
  useEffect(() => { scene.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true }) }, [scene])
  return <primitive object={scene} />
}

useGLTF.preload(ROOM)
