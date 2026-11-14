// Pure geometry in world pixels (1 tile = 70px). No DOM, so it is unit-testable.
import type { Level, Layout, Gate, Block, Secret, Pit, Platform, Coin, Sign } from './types';
export const T = 70;
export const LEVEL_W = T * 30, ITEM_GAP = T * 6, START_X = T * 9, GATE_OFFSET = T * 4;

export function buildLayout(levels: Level[]): Layout {
  const gates: Gate[] = [], items: Block[] = [], secrets: Secret[] = [], pits: Pit[] = [], platforms: Platform[] = [], coins: Coin[] = [], signs: Sign[] = [];
  let x = START_X;
  levels.forEach((lvl, i) => {
    gates.push({ x, index: i, level: lvl });
    lvl.items.forEach((it, j) => {
      const bx = x + GATE_OFFSET + j * ITEM_GAP;
      items.push({ x: bx, data: it, level: i, done: false });
      // between two blocks: alternate a pit with a coin arc, and a floating platform with coins on top
      if (j < lvl.items.length - 1) {
        const mid = bx + ITEM_GAP / 2 - T;
        if (j % 2 === 0) {
          pits.push({ x: mid, w: T * 2 });
          for (let k = 0; k < 3; k++) coins.push({ x: mid - T / 2 + k * T, y: 2 + (k === 1 ? 1 : 0), taken: false });
        } else {
          platforms.push({ x: mid - T / 2, w: T * 3, y: 2 });
          for (let k = 0; k < 3; k++) coins.push({ x: mid - T / 2 + k * T, y: 3, taken: false });
        }
      }
    });
    if (lvl.secret) secrets.push({ x: x + GATE_OFFSET + (lvl.items.length - 0.5) * ITEM_GAP, level: i, text: lvl.secret, done: false });
    if (lvl.signpost) signs.push({ x: x + T * 2, level: i, data: lvl.signpost, shown: false }); // just past the flag
    x += Math.max(LEVEL_W, GATE_OFFSET + T * 2 + lvl.items.length * ITEM_GAP);
  });
  return { gates, items, secrets, pits, platforms, coins, signs, endX: x + T * 4 };
}

export const inPit = (pits: Pit[], x: number) => pits.some(p => x >= p.x && x < p.x + p.w);
