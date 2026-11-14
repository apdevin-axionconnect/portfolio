// Pure physics constants and helpers shared by the renderer and the unit tests. No DOM.
export const GRAVITY = 0.85, JUMP_V = -15, HERO_W = 66, HERO_H = 92, BLOCK_ROWS_UP = 3, T = 70;

/** vertical apex height (px) of a jump with the given impulse under the given gravity, in 60Hz frames */
export const apexHeight = (v = JUMP_V, g = GRAVITY) => (v * v) / (2 * g);
/** can a hero standing on the ground head-bump a block whose bottom is `rowsUp` tiles above the ground? */
export const canReachBlock = (rowsUp = BLOCK_ROWS_UP) => apexHeight() + HERO_H >= rowsUp * T;
/** how far the hero travels horizontally during a full jump at a given speed (px/frame) */
export const jumpDistance = (speed: number, v = JUMP_V, g = GRAVITY) => speed * (2 * Math.abs(v) / g);

/** one Euler integration step; returns new {y, vy} with ground clamp, y is offset above ground (negative = up) */
export function stepVertical(y: number, vy: number, dt: number, g = GRAVITY, floor: number | null = 0) {
  vy += g * dt; y += vy * dt;
  if (floor !== null && y >= floor) return { y: floor, vy: 0, grounded: true };
  return { y, vy, grounded: false };
}
