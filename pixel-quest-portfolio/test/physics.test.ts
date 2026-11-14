import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apexHeight, canReachBlock, jumpDistance, stepVertical, GRAVITY, JUMP_V, T } from '../src/physics.ts';
import { ITEM_GAP } from '../src/layout.ts';

test('a standing jump reaches the ? blocks', () => {
  assert.ok(canReachBlock(), `apex ${apexHeight().toFixed(1)}px too low for ${3 * T}px blocks`);
  assert.ok(!canReachBlock(6), 'blocks six tiles up should be unreachable, otherwise the level has no challenge');
});

test('a running jump clears a two-tile pit with margin', () => {
  const pit = T * 2, maxSpeed = 8.5;
  assert.ok(jumpDistance(maxSpeed) > pit * 1.5, `jump covers ${jumpDistance(maxSpeed).toFixed(0)}px, pit is ${pit}px`);
});

test('pits fit between blocks without touching them', () => {
  assert.ok(ITEM_GAP / 2 - T - T / 2 > T, 'pit must start at least one tile after a block');
});

test('vertical integration lands back on the ground and is frame-rate independent within 2%', () => {
  const run = (dt: number) => { let y = 0, vy = JUMP_V, apex = 0, frames = 0; for (;;) { ({ y, vy } = stepVertical(y, vy, dt)); apex = Math.min(apex, y); frames += dt; if (y >= 0 && vy === 0) return { apex, frames }; } };
  const a = run(1), b = run(0.5), c = run(2);
  assert.ok(Math.abs(a.apex - b.apex) / Math.abs(a.apex) < 0.06 && Math.abs(a.apex - c.apex) / Math.abs(a.apex) < 0.06, `apex 60Hz ${a.apex.toFixed(1)}, 120Hz ${b.apex.toFixed(1)}, 30Hz ${c.apex.toFixed(1)}`);
  assert.ok(Math.abs(a.frames - b.frames) < 3, 'air time should match across refresh rates');
  assert.equal(stepVertical(0, 0, 1).grounded, true);
  assert.ok(stepVertical(0, 1, 1, GRAVITY, null).y > 0, 'with no floor (over a pit) the hero keeps falling');
});
