# Architecture

One-way data flow, four layers, each with a hard boundary.

```
 src/data.ts ──► src/layout.ts ──► src/world.ts ──► src/main.ts ◄──► src/ui.ts
 (content,      (pure geometry:    (canvas render    (game controller:   (DOM: cards, modal,
  typed)         blocks, pits,      + physics,        state machine,      run log, share card)
                 platforms, coins,  no DOM except     input, scoring,
                 signs; no DOM)     its own canvas)   save, audio glue)
                        ▲
                 test/*.test.ts (node:test)        e2e/*.spec.ts (Playwright + axe)
```

| Module | Owns | Must not |
|---|---|---|
| `data.ts`, `types.ts` | every word on the site, typed | contain positions or styling |
| `layout.ts`, `physics.ts` | world geometry and physics constants, pure functions | touch `document`, `window`, images |
| `sprites.ts` | asset URLs, themes, image cache | know about game state |
| `world.ts` | the canvas: drawing, hero physics, collisions, particles, camera | update the HUD, cards or storage |
| `particles.ts` | a fixed pool of particles (no per-frame allocation) | know about game rules |
| `ui.ts` | DOM widgets: card, modal, run log, tabs, share image | read physics or the canvas |
| `main.ts` | the state machine (`title → playing ⇄ paused → finished`), input, scoring, save/resume, audio loading | draw anything |
| `audio.ts` | Tone.js synths and sequencer; loaded lazily after Press Start | be imported statically |
| `save.ts`, `github.ts`, `flags.ts` | localStorage persistence, cached API access, feature flags | — |

## Frame loop

`requestAnimationFrame` → `dt = elapsed / 16.667` (clamped to 3) → `world.step(vel, dt, now)` returns at most one event
(`block`, `secret`, `sign`, `coin`, `squash`, `hurt`, `fall`) → `main.handle()` applies rules → `world.draw()`.
All velocities are multiplied by `dt`, so a 144 Hz screen and a throttled phone play identically (`test/physics.test.ts` asserts this).

## Rendering

Low cost, high fidelity: one 2D canvas at device pixel ratio (capped at 2), scaled to a 720 px design height.
Layers back to front: gradient sky (blends to night by progress) → stars → painted backdrop (parallax 0.25) → clouds (0.4) → hills (0.6)
→ ground tiles and liquids → platforms → decor and signs → flags → coins → blocks → critters → castle → hero → particles → night tint → iris wipe.
Everything off-screen is culled by x before drawing.

## Content pipeline

`data.ts` is validated by `scripts/validate-content.ts` as a `prebuild` step: empty titles, bad links, over-long cards or a missing
"what's next" fail the build. `layout.ts` derives every position from the data, and `test/layout.test.ts` proves pits never sit under
blocks or gates and that worlds never overlap.

## Verification

- `npm run typecheck` — strict TypeScript, no `any` in source.
- `npm test` — layout geometry and physics invariants (reachability, pit clearance, frame-rate independence).
- `npm run e2e` — Playwright in the installed Chrome: full auto-run to the castle, text mode, axe accessibility scan, screenshot regression.
- `.github/workflows/deploy.yml` — typecheck, tests, build, Lighthouse CI budgets, deploy to Pages.

## Decisions

See `docs/adr/` — canvas over DOM for the scene, synthesized audio over files, CC0 art over custom art.
