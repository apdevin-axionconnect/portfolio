import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLayout, inPit, START_X, LEVEL_W, T } from '../src/layout.ts';
import { LEVELS } from '../src/data.ts';

test('layout keeps gates and items strictly increasing and past the start', () => {
  const { gates, items, endX } = buildLayout(LEVELS);
  assert.equal(gates.length, LEVELS.length);
  assert.equal(items.length, LEVELS.flatMap(l => l.items).length);
  assert.equal(gates[0].x, START_X);
  const xs = [...gates.map(g => g.x), ...items.map(i => i.x)].sort((a, b) => a - b);
  xs.forEach((x, i) => i && assert.ok(x > xs[i - 1], `x ${x} not after ${xs[i - 1]}`));
  assert.ok(endX > START_X + LEVEL_W * LEVELS.length);
});

test('pits never sit under a block, a gate or a platform', () => {
  const { gates, items, pits, platforms } = buildLayout(LEVELS);
  for (const b of items) assert.ok(!inPit(pits, b.x) && !inPit(pits, b.x + T - 1), `block at ${b.x} over a pit`);
  for (const g of gates) assert.ok(!inPit(pits, g.x), `gate at ${g.x} over a pit`);
  for (const p of platforms) for (const q of pits) assert.ok(p.x + p.w <= q.x || p.x >= q.x + q.w, 'platform overlaps a pit');
});

test('a level with many items widens instead of overlapping the next gate', () => {
  const many = [{ year: '', title: '', items: Array(12).fill({ type: 'skill', title: '', text: '' }) }, { year: '', title: '', items: [{ type: 'skill', title: '', text: '' }] }];
  const { gates, items } = buildLayout(many as any);
  assert.ok(items.filter(i => i.level === 0).at(-1)!.x < gates[1].x);
});
