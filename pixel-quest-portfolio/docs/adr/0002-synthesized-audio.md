# ADR 0002: Synthesize audio at run time instead of shipping files

**Status:** accepted · 2026-11

## Context
A platformer wants a music loop and a dozen sound effects. Shipping MP3/OGG files means licensing questions, 1–3 MB of
downloads, codec fallbacks and a loading step. The portfolio must be safe to publish and fork.

## Decision
Generate everything with Tone.js: a 32-step chiptune loop (square lead, triangle bass, membrane kick, noise hat) and
short note sequences for effects. Tempo rises per world. The module is imported dynamically after the user presses Start,
which also satisfies browser autoplay policy.

## Consequences
- Zero audio assets, zero licensing, nothing to cache.
- First paint excludes the ~150 kB audio library.
- Music is deliberately simple; a composer could replace `audio.ts` without touching anything else.
- Effects use a `PolySynth` so overlapping triggers never throw Tone's scheduling error.
