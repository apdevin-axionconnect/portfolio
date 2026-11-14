import { useState } from 'react';
import { PROJECTS, PROFILE } from '../data/profile';
import { G } from '../components/Icons';

// Each project becomes a "photo". Add `image` to a project for a real screenshot.
const ALBUMS = [
  { id: 'all', name: 'Library', icon: G.image },
  { id: 'projects', name: 'Projects', icon: G.star },
  { id: 'fav', name: 'Favorites', icon: G.star },
];

export default function Photos() {
  const [album, setAlbum] = useState('all');
  const [view, setView] = useState(null);
  const [favs, setFavs] = useState(() => new Set());
  const photos = PROJECTS.map((p, i) => ({ id: p.slug, title: p.name, caption: p.tagline, color: p.color, image: p.image, year: p.year, i }));
  const list = album === 'fav' ? photos.filter((p) => favs.has(p.id)) : photos;
  const toggleFav = (id) => setFavs((s) => { const n = new Set(s); if (!n.delete(id)) n.add(id); return n; });

  return (
    <div className="split">
      <div className="sidebar">
        <h6>Photos</h6>
        {ALBUMS.map((a) => <button key={a.id} className={'si' + (album === a.id ? ' on' : '')} onClick={() => { setAlbum(a.id); setView(null); }}>{a.icon}{a.name}</button>)}
        <h6>People</h6>
        <button className="si">{G.user}{PROFILE.name}</button>
      </div>
      <div className="main">
        {view ? (
          <div className="lightbox">
            <div className="lb-bar">
              <button className="btn" onClick={() => setView(null)}>{G.back} Back</button>
              <b>{view.title}</b>
              <button className="btn" onClick={() => toggleFav(view.id)} style={{ color: favs.has(view.id) ? '#ff375f' : undefined }}>{G.star} {favs.has(view.id) ? 'Favorited' : 'Favorite'}</button>
            </div>
            <Tile p={view} big />
            <div className="pad" style={{ textAlign: 'center' }}><b>{view.title}</b><div className="muted">{view.caption} · {view.year}</div></div>
          </div>
        ) : (
          <>
            <div className="pad" style={{ paddingBottom: 0 }}><h2 style={{ margin: 0, fontSize: 22 }}>{ALBUMS.find((a) => a.id === album).name}</h2><div className="muted">{list.length} items</div></div>
            <div className="pgrid">
              {list.map((p) => (
                <div key={p.id} className="pcell" onClick={() => setView(p)}>
                  <Tile p={p} />
                  {favs.has(p.id) && <span className="heart">♥</span>}
                </div>
              ))}
              {list.length === 0 && <div className="muted" style={{ padding: 20 }}>Nothing here. Open a photo and tap Favorite.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ p, big }) {
  if (p.image) return <img className={'tile' + (big ? ' big' : '')} src={p.image} alt={p.title} />;
  const hue = p.color;
  return (
    <div className={'tile' + (big ? ' big' : '')} style={{ background: `radial-gradient(80% 80% at ${20 + p.i * 20}% 20%, ${hue}, transparent 70%), radial-gradient(60% 70% at 80% 90%, ${hue}99, transparent 70%), linear-gradient(160deg, #1b1b22, #2b2b36)` }}>
      <span>{p.title}</span>
    </div>
  );
}
