// Feature flags for every optional system. URL overrides: ?debug ?nomusic ?noweather ?analytics=off
const q = new URLSearchParams(location.search);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FLAGS = {
  debug: q.has('debug'),                       // FPS / particle / draw-time overlay
  music: !q.has('nomusic'),
  weather: !q.has('noweather') && !reduceMotion,
  shake: !reduceMotion,
  iris: !reduceMotion,
  githubStats: true,
  analytics: q.get('analytics') !== 'off' && import.meta.env.PROD,
  analyticsDomain: '',                         // e.g. 'yourname.dev' for Plausible; empty disables the script
  reduceMotion,
};
