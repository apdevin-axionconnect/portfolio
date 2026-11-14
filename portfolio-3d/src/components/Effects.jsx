import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing'

// Split out so the post-processing library loads after the room is already on screen (see lazy() in App.jsx).
// low: skip ambient occlusion and multisampling, the two passes that dominate frame time on weak GPUs.
export default function Effects({ low }) {
  return (
    <EffectComposer multisampling={low ? 0 : 4}>
      {!low && <N8AO aoRadius={0.5} intensity={2} distanceFalloff={1} />}
      <Bloom luminanceThreshold={1} mipmapBlur intensity={0.6} />
      <Vignette eskil={false} offset={0.2} darkness={0.7} />
    </EffectComposer>
  )
}
