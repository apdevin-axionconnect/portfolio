# 3D Portfolio

Developer-room portfolio built with React Three Fiber. Orbit the room, click the monitor to sit at the desk and use the in-screen desktop.

```
npm install
npm run dev
```

- `src/components/Room.jsx` – loads `public/room.glb`, built by `blender/build_room.py` (run: `"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P blender/build_room.py`). Source textures in `blender/tex` are CC0 from Poly Haven; the script embeds them as 1024px WebP.
- `src/components/Monitor.jsx` – monitor mesh + the macOS portfolio (`../macos-portfolio`) projected onto the screen in an iframe
- `npm run build:os` builds the macOS site into `public/os/` (runs automatically before `dev` and `build`); edit content in `../macos-portfolio/src/data/profile.js`
- `src/views.js` – positions of the whiteboard and phone, and the camera view for each usable object (desk, board, phone)
- `src/components/Whiteboard.jsx` – drawable whiteboard on the right wall: strokes go to a canvas texture, saved in localStorage; pick markers on the tray or the toolbar
- `src/components/Phone.jsx` + `src/components/phone/Android.jsx` – phone on the desk running an Android-style UI (lock screen, home, quick settings, nine apps). Content comes from `../macos-portfolio/src/data/profile.js`
- `src/components/Decor.jsx` + `src/textures.js` – set dressing: night skyline in the window, curtains, moonlight patch, wall clock (real time), poster art, rug weave, desk clutter. Textures are drawn to canvases, nothing is downloaded
- `src/components/CameraRig.jsx` – room <-> desk camera transitions
- `src/App.jsx` – lights, HDRI environment, soft shadows, post-processing (N8AO, Bloom, Vignette)

Note: React is pinned to 19.2.9 and `<Html>` uses a fixed `portal` div; drei's Html remounts its root when the default target changes and React 19 refuses that, leaving the screen blank.

## Performance

```
npm run build
npm run perf -- final                  # load metrics, software GL (runs anywhere, e.g. CI) -> perf/final.json
GL=hw npm run perf -- render_final     # same run on the real GPU: idle draw calls, frame rate, start-up
npm run perf:compare -- baseline final
npm run preview -- --port 5200  &&  node perf/timeline.mjs   # start-up timeline on the real GPU
```

`perf/baseline.json` and `perf/render_before.json` are the numbers from before any optimisation.
`node perf/interact.mjs <label>` measures frame rate while orbiting, gliding, drawing on the whiteboard and dragging a macOS window
(`perf/interact_before.json` is the reference).

What keeps it fast:

- **Start-up never freezes the page.** `index.html` paints a static loader before any JavaScript runs. No frame is drawn until
  every shader is compiled with `compileAsync` (see `Precompile` in `App.jsx`), with an off-screen target bound so the variants
  match what the post-processing pipeline uses. three.js otherwise waits on each program synchronously, which on Windows
  (Direct3D) froze the page for 10 to 15 seconds on a first visit.
- **Quality tier is chosen from the GPU name** (`fastGpu` in `App.jsx`), so only one set of shaders is compiled. Dedicated GPUs
  get soft shadows, ambient occlusion and MSAA. Everything else gets plain PCF shadows and no ceiling-lamp shadow. `CameraRig`
  still drops to the light tier if camera moves render below ~22 fps.
- **Shadow maps are rendered once.** Nothing that casts a shadow moves, so `shadowMap.autoUpdate` is off (two thirds fewer draw calls per frame).
- **Light tier draws straight to the screen** (no post-processing chain, CSS vignette), at 60% resolution while the camera
  moves, snapping back to full 0.2 s after it stops.
- **Whiteboard ink is DOM.** At the board the real `<canvas>` is laid over it, so strokes cost no 3D redraw or texture upload.
- **The embedded macOS has no backdrop blurs** (`.embedded` rules in its `global.css`): each one was a GPU pass per camera frame.
- **Render on demand.** `frameloop="demand"`: frames are drawn only while the camera moves or something changes.
- **Small downloads.** `room.glb` embeds 1024px WebP textures, the environment HDR is self-hosted at 512px, post-processing is
  a lazy chunk, and every texture in `textures.js` is drawn in the browser.

## Deploy

`npm run build` produces a fully static `dist/` with relative URLs, so it works at a domain root or in any subfolder.
Upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, nginx). `public/_headers` sets long-lived
caching for hashed assets on Netlify/Cloudflare; on nginx use `location ~ /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }` and enable gzip or brotli.
On Windows, run builds from a path with an upper-case drive letter (`C:\...`): Vite's HTML handling in the game build fails on mixed `c:`/`C:` paths.
