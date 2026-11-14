// Kenney "Platformer Art Complete Pack" (CC0): vector-style HD sprites, 70px tiles.
// Every PNG in assets/hd is importable by its file name: img('grassMid').
const urls = import.meta.glob('./assets/hd/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const cache: Record<string, HTMLImageElement> = {};
export function img(name: string): HTMLImageElement {
  if (!cache[name]) { const i = new Image(); i.src = urls[`./assets/hd/${name}.png`]; cache[name] = i; }
  return cache[name];
}
export const url = (name: string) => urls[`./assets/hd/${name}.png`];
export const T = 70;

export const SKINS = ['Blue', 'Green', 'Pink'] as const;
export type Skin = typeof SKINS[number];
export const HERO: { color: Skin } = { color: 'Blue' };

export interface Theme {
  name: string; bg: string; sky: [string, string]; night: [string, string]; tiles: string; flag: string;
  decor: string[]; enemy: [string, string]; dead: string; fly: boolean; weather: 'leaf' | 'sand' | 'ember' | 'snow';
}
export const THEMES: Theme[] = [
  { name: 'grass',  bg: 'bg_grasslands', sky: ['#7ec8f2', '#d0f4f7'], night: ['#1a2550', '#4a5b8a'], tiles: 'grass', flag: 'flagGreen',
    decor: ['bush', 'mushroomRed', 'plant', 'fence', 'mushroomBrown', 'bush'], enemy: ['slimeWalk1', 'slimeWalk2'], dead: 'slimeDead', fly: false, weather: 'leaf' },
  { name: 'desert', bg: 'bg_desert', sky: ['#f6c270', '#fde9c4'], night: ['#3a2a4a', '#8a5a6a'], tiles: 'sand', flag: 'flagYellow',
    decor: ['cactus', 'rock', 'plantPurple', 'cactus'], enemy: ['snailWalk1', 'snailWalk2'], dead: 'snailShell', fly: false, weather: 'sand' },
  { name: 'castle', bg: 'bg_castle', sky: ['#3c4a5c', '#869595'], night: ['#151a25', '#3a4452'], tiles: 'stone', flag: 'flagRed',
    decor: ['tochLit', 'castleHalfMid', 'window', 'tochLit2', 'rock'], enemy: ['flyFly1', 'flyFly2'], dead: 'flyDead', fly: true, weather: 'ember' },
  { name: 'snow',   bg: 'bg_grasslands', sky: ['#9fd3ee', '#eef9fd'], night: ['#0d1535', '#2d3f6e'], tiles: 'snow', flag: 'flagBlue',
    decor: ['ice_tree', 'ice_pineSapling', 'ice_snowBall', 'ice_igloo', 'ice_deadTree', 'snowhill'], enemy: ['flyFly1', 'flyFly2'], dead: 'flyDead', fly: true, weather: 'snow' },
];
export const REWARD: Record<string, string> = { skill: 'gemBlue', contest: 'star', cert: 'keyYellow', project: 'coinGold' };

export const ready = Promise.all(Object.keys(urls).map(k => img(k.slice(12, -4)).decode().catch(() => {})));
