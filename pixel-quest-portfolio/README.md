# Dev Quest // Portfolio

A developer's journey from first year to graduation, played as an HD side-scrolling platformer.
Each college year is a **world** with its own terrain (grass, desert, castle, snow), weather and critters.
Every skill, contest, certification and project is a **? block**: jump and hit it (or walk past, the hero auto-hops)
to read the card, then press **Enter** for the full project modal. Coins, pits, floating platforms, stompable critters,
hidden secret blocks, a timer with best-run tracking, and a castle finale with live GitHub stats and a shareable result card.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (add ?debug for the FPS / draw-time overlay)
npm run build      # validates src/data.ts, then builds dist/ (index.html + styleguide.html)
npm run preview    # serve dist/
npm run typecheck  # tsc --strict
npm test           # node:test unit tests: layout geometry + physics invariants
npm run e2e        # Playwright in your installed Chrome: full run, text mode, axe scan, screenshot baseline
npm run validate   # content check on its own
```

## Writing the story

Each world is a turning point (`theme`), not a syllabus. Each card has three sentences: `text` (what happened),
`why` (why it mattered) and `lesson` (what you would do differently). `secret` is an honest failure revealed by a hidden block,
`signpost` is a real quote from a mentor or teammate, and `FINALE.next` is the one sentence a hiring manager remembers.
Every `[TODO]` in `src/data.ts` is placeholder copy; `npm run validate` counts the ones left.

Docs for reviewers: `ARCHITECTURE.md`, `docs/adr/`, `CONTRIBUTING.md`, `CHANGELOG.md`, the in-game **Why this portfolio** tab, and `styleguide.html`.

## Make it yours

Everything personal lives in `src/data.ts`:

- `PROFILE` — name, tagline, GitHub username (live repo/follower count and top repos on the final card; `''` disables it).
- `LEVELS` — one entry per year: `year`, `title`, an optional `secret` fun fact (hidden block), and `items` of type
  `skill | contest | cert | project`. Each item may carry `details: { tech, links, image, level }` for the modal and skill tree.
- `FINALE` — closing text and links. Drop a `resume.pdf` in `public/` for the Resume button; "Resume PDF" prints the run log.

Pick the hero on the title screen (blue, green, pink); the choice is remembered. Replace `public/og.png` with your own
link-preview image and the icons in `public/icons/`.

## Controls

| Input | Action |
|---|---|
| `→` / `D`, wheel, swipe, on-screen pad, gamepad stick or d-pad | run |
| `Space` / `↑` / `W` / tap / gamepad A | jump; hit ? blocks from below, stomp critters, cross pits and platforms |
| `Enter` or click the card | project details modal |
| `Esc` / ☰ | run log (plain-text portfolio with skill tree, also the printable resume); pauses the game |
| ⏩ | auto-run walkthrough: the hero runs and jumps by itself, damage-free |
| ♪ | mute |
| timeline dots | warp to any world |

Progress saves automatically; the title screen offers **Continue** on return. Best time is kept across runs.

## Stack

| Piece | Used for |
|---|---|
| TypeScript (strict) + Vite 7 | source, dev server, production bundle, `base: './'` for any static host |
| HTML5 Canvas | the whole scene at device resolution, delta-time physics (same speed at 60Hz and 144Hz), camera lag, screen shake, iris wipes, day-to-night sky with stars, pooled particles for dust, sparkles and per-world weather |
| [Kenney Platformer Art Complete Pack](https://opengameart.org/content/platformer-art-complete-pack-often-updated) (CC0) | 70px tiles, blocks, flags, castle, water and lava, alien heroes, critters, painted backdrops |
| [Tone.js](https://tonejs.github.io) | chiptune loop and SFX synthesized live (no audio files); tempo rises each world |
| [anime.js](https://animejs.com) | HUD banners, toasts and card transitions |
| [Typed.js](https://github.com/mattboldt/typed.js) | text-box typing effect |
| [@fontsource](https://fontsource.org) Fredoka + Nunito | self-hosted fonts, works offline |
| GitHub REST API | live stats and top-starred repos on the final card |
| Service worker + web manifest | installable PWA, offline after first visit |
| [Playwright](https://playwright.dev) + `node:test` | e2e full run and unit tests |
| GitHub Actions | typecheck, tests, build and deploy to GitHub Pages on push to `main` |

Accessibility: ARIA live HUD and cards, keyboard-only play, focus-visible outlines, `prefers-reduced-motion`,
a plain-text run log readable without playing, a landscape prompt on phones, and shape-coded reward icons.

## Deploy

Push to `main` with GitHub Pages set to "GitHub Actions" as the source. The workflow in `.github/workflows/deploy.yml`
runs typecheck, unit tests and the build, then publishes `dist/`. Any other static host works too.

## Credits

Art by Kenney (CC0). Everything else is original code and synthesized audio.
