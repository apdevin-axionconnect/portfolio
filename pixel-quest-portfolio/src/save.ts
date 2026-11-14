import type { SaveData } from './types';
const KEY = 'devquest-save', BEST = 'devquest-best';
const safe = <T>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

export const loadSave = (): SaveData | null => safe(() => JSON.parse(localStorage.getItem(KEY) ?? 'null'), null);
export const writeSave = (d: SaveData) => safe(() => localStorage.setItem(KEY, JSON.stringify(d)), undefined);
export const clearSave = () => safe(() => localStorage.removeItem(KEY), undefined);
export const bestTime = (): number | null => safe(() => { const v = localStorage.getItem(BEST); return v ? Number(v) : null; }, null);
export const recordTime = (ms: number) => { const b = bestTime(); if (b === null || ms < b) safe(() => localStorage.setItem(BEST, String(ms)), undefined); return b === null || ms < b; };
export const fmtTime = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
