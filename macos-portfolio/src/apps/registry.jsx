/* oxlint-disable react/only-export-components -- this is the app table (data), not a component module */
import { lazy } from 'react';
import Finder, { FinderToolbar } from './Finder';
import Safari, { SafariToolbar } from './Safari';
import Preview, { PreviewToolbar } from './Preview';

// Apps load on first open, so the desktop itself boots with a small bundle. Finder/Safari/Preview stay eager: their toolbars render in the title bar.
const Notes = lazy(() => import('./Notes'));
const Terminal = lazy(() => import('./Terminal'));
const Mail = lazy(() => import('./Mail'));
const Calculator = lazy(() => import('./Calculator'));
const Photos = lazy(() => import('./Photos'));
const Settings = lazy(() => import('./Settings'));
const ChatGPT = lazy(() => import('./ChatGPT'));
const Music = lazy(() => import('./Music'));
const About = lazy(() => import('./About'));
const Games = lazy(() => import('./Games'));
const Quest = lazy(() => import('./Quest'));

export const APPS = {
  finder: { name: 'Finder', component: Finder, toolbar: FinderToolbar, tallBar: true, w: 900, h: 560 },
  safari: { name: 'Safari', component: Safari, toolbar: SafariToolbar, tallBar: true, w: 1000, h: 640 },
  notes: { name: 'Notes', component: Notes, w: 820, h: 540 },
  terminal: { name: 'Terminal', component: Terminal, w: 720, h: 440, titlebarStyle: { background: '#2b2b2e', color: '#bbb' } },
  mail: { name: 'Mail', component: Mail, w: 900, h: 560 },
  calculator: { name: 'Calculator', component: Calculator, fixed: true, w: 232, h: 360, titlebarStyle: { background: 'transparent', position: 'absolute', zIndex: 2, width: '100%' } },
  photos: { name: 'Photos', component: Photos, w: 900, h: 580 },
  settings: { name: 'System Settings', component: Settings, w: 760, h: 540 },
  preview: { name: 'Preview', component: Preview, toolbar: PreviewToolbar, tallBar: true, w: 820, h: 680, titleIcon: true },
  chatgpt: { name: 'ChatGPT', component: ChatGPT, w: 960, h: 640 },
  music: { name: 'Music', component: Music, w: 420, h: 520 },
  games: { name: 'Arcade', component: Games, w: 460, h: 520 },
  quest: { name: 'Dev Quest', component: Quest, w: 1000, h: 640 },
  about: { name: 'About This Mac', component: About, fixed: true, w: 320, h: 460 },
  siri: { name: 'Siri', component: () => null },
};

export const DOCK = ['safari', 'notes', 'terminal', 'mail', 'photos', 'preview', 'calculator', 'music', 'games', 'quest', 'chatgpt', 'settings'];
export const LAUNCHPAD = ['finder', 'safari', 'notes', 'terminal', 'mail', 'photos', 'preview', 'calculator', 'music', 'games', 'quest', 'chatgpt', 'siri', 'settings'];
