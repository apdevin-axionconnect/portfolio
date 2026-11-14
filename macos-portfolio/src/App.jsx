import { useEffect } from 'react';
import { OSProvider, useOS, WALLPAPERS } from './os/OS';
import Boot from './components/Boot';
import Login from './components/Login';
import MenuBar from './components/MenuBar';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import Launchpad from './components/Launchpad';
import Spotlight from './components/Spotlight';
import Siri from './components/Siri';
import Notifications from './components/Notifications';
import ControlCenter from './components/ControlCenter';
import { PROFILE } from './data/profile';
import { IS_MAC } from './os/platform';


function Shell() {
  const { power, setPower, prefs, overlay, setOverlay, activeWindow, close, minimize, open } = useOS();

  useEffect(() => { document.title = `${PROFILE.name} — ${PROFILE.role}`; }, []);

  // global shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (power !== 'desktop') return;
      const mod = IS_MAC ? e.metaKey : e.altKey;
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') { e.preventDefault(); setOverlay('spotlight'); }
      else if (e.key === 'Escape') setOverlay(null);
      else if (mod && e.key.toLowerCase() === 'w' && activeWindow) { e.preventDefault(); close(activeWindow.id); }
      else if (mod && e.key.toLowerCase() === 'm' && activeWindow) { e.preventDefault(); minimize(activeWindow.id); }
      else if (mod && e.key === ',') { e.preventDefault(); open('settings'); }
      else if (e.key === 'F4') { e.preventDefault(); setOverlay('launchpad'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [power, activeWindow, setOverlay, close, minimize, open]);

  const wp = WALLPAPERS[prefs.wallpaper]?.css || WALLPAPERS.tahoe.css;

  if (power === 'boot') return <Boot onDone={() => setPower('login')} />;
  if (power === 'off') return <div className="off" onClick={() => setPower('boot')}>Click anywhere to turn on</div>;
  return (
    <div className="screen" style={{ '--dock-reserve': prefs.dockSize + 22 + 'px' }}>
      <div className="wallpaper" style={{ backgroundImage: wp }} />
      {power === 'login' && <Login wallpaper={wp} />}
      {(power === 'desktop' || power === 'sleep') && (
        <>
          <Desktop />
          <MenuBar />
          <Dock />
          {overlay === 'launchpad' && <Launchpad />}
          {overlay === 'spotlight' && <Spotlight />}
          {overlay === 'siri' && <Siri />}
          {overlay === 'cc' && <ControlCenter />}
          <Notifications />
        </>
      )}
      {power === 'sleep' && <div className="off" style={{ background: '#000' }} onClick={() => setPower('desktop')} />}
      <div className="brightness" style={{ opacity: 1 - prefs.brightness }} />
    </div>
  );
}

export default function App() {
  return <OSProvider><Shell /></OSProvider>;
}
