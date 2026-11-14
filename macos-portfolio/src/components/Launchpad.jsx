import { useState } from 'react';
import { useOS } from '../os/OS';
import { APPS, LAUNCHPAD } from '../apps/registry';
import { AppIcon } from './Icons';

export default function Launchpad() {
  const { open, setOverlay } = useOS();
  const [q, setQ] = useState('');
  const apps = LAUNCHPAD.filter((id) => APPS[id].name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="launchpad" onClick={(e) => { if (e.target.classList.contains('launchpad') || e.target.classList.contains('grid')) setOverlay(null); }}>
      <input className="search" autoFocus placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apps[0] && open(apps[0])} />
      <div className="grid">
        {apps.map((id) => (
          <div key={id} className="app" onClick={() => (id === 'siri' ? setOverlay('siri') : open(id))}>
            <span className="ic"><AppIcon id={id} /></span>{APPS[id].name}
          </div>
        ))}
      </div>
    </div>
  );
}
