export type ItemType = 'skill' | 'contest' | 'cert' | 'project';

export interface ItemDetails {
  tech?: string[];
  links?: { label: string; href: string }[];
  image?: string;      // URL or /public path to a screenshot
  level?: number;      // 1-5 proficiency, shown as a bar in the skill tree
}
/** One card. Write it as a turning point: what happened, why it mattered, what you would do differently. */
export interface Item {
  type: ItemType;
  title: string;
  text: string;        // what happened, one sentence
  why?: string;        // why it mattered, one sentence
  lesson?: string;     // what you would do differently, one sentence
  details?: ItemDetails;
}
export interface Signpost { quote: string; by: string; href?: string }
export interface Level {
  year: string;
  title: string;       // e.g. FIRST YEAR
  theme: string;       // the turning point of this year, e.g. Curiosity
  items: Item[];
  secret?: string;     // an honest failure, revealed by the hidden block
  signpost?: Signpost; // a quote from a mentor, teammate or manager
}
export interface Profile { name: string; tagline: string; github: string; repo: string }
export interface Finale { title: string; text: string; next: string; links: { label: string; href: string }[] }

export interface Gate { x: number; index: number; level: Level; shown?: boolean }
export interface Block { x: number; data: Item; level: number; done: boolean; bump?: number }
export interface Secret { x: number; level: number; text: string; done: boolean; bump?: number }
export interface Pit { x: number; w: number }
export interface Platform { x: number; w: number; y: number } // y = tiles above ground
export interface Coin { x: number; y: number; taken: boolean }
export interface Sign { x: number; level: number; data: Signpost; shown: boolean }
export interface Layout { gates: Gate[]; items: Block[]; secrets: Secret[]; pits: Pit[]; platforms: Platform[]; coins: Coin[]; signs: Sign[]; endX: number }

export interface SaveData { camX: number; done: number[]; coins: number[]; secrets: number[]; score: number; time: number; skin: string }
