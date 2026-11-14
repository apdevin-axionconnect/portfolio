# ADR 0001: Canvas for the scene, DOM for the UI

**Status:** accepted · 2026-11

## Context
The first version drew the world with hundreds of absolutely positioned `div`s moved by `transform`. At four worlds, with
critters, coins and weather, layout and paint cost grew with element count, and anime.js and CSS fought over `transform`.
Meanwhile text, buttons and dialogs need selection, screen readers, focus and printing.

## Decision
Render the scene on a single `<canvas>` with our own draw loop and physics. Keep every piece of text and every control in the DOM.
The two communicate only through the game controller (`main.ts`): the world returns events, the controller updates the DOM.

## Consequences
- Draw cost is proportional to what is on screen, not to how many objects exist; culling is a one-line x check.
- Accessibility is free where it matters (cards, run log, modal), and the canvas is `aria-hidden`.
- We own physics and collision code, so they are unit-tested in `test/physics.test.ts`.
- Canvas text is not selectable; anything a user may want to copy lives in the DOM.
