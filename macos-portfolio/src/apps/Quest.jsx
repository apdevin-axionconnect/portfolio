import { useEffect, useRef } from 'react';

// The pixel-quest-portfolio game, built unchanged into public/game by `npm run build:game`.
// It runs in its own iframe so its canvas, keyboard handling, saves and service worker stay exactly as standalone.
export default function Quest() {
  const frame = useRef(null);
  useEffect(() => { frame.current?.focus(); }, []);
  return <iframe ref={frame} className="quest" title="Dev Quest" src={import.meta.env.BASE_URL + 'game/index.html'} allow="autoplay" />;
}
