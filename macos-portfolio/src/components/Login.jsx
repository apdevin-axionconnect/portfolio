import { useEffect, useState } from 'react';
import { useOS } from '../os/OS';
import { PROFILE } from '../data/profile';
import { G } from './Icons';

export function Avatar({ size = 72 }) {
  const initials = PROFILE.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{PROFILE.avatar ? <img src={PROFILE.avatar} alt="" /> : initials}</div>;
}

export default function Login({ wallpaper }) {
  const { setPower } = useOS();
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const submit = (e) => {
    e.preventDefault();
    // any password works; empty shakes like the real thing
    if (!pw) { setShake(true); setTimeout(() => setShake(false), 450); return; }
    setPower('desktop');
  };

  return (
    <div className="login">
      <div className="wallpaper" style={{ backgroundImage: wallpaper }} />
      <div className="clock">
        <div className="date">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <div className="time">{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
      </div>
      <form className="user" onSubmit={submit}>
        <Avatar />
        <div className="name">{PROFILE.name}</div>
        <div className={'pw' + (shake ? ' shake' : '')}>
          <input type="password" autoFocus placeholder="Enter Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="submit" aria-label="Log in"><span style={{ width: 12, height: 12, display: 'block' }}>{G.fwd}</span></button>
        </div>
        <div className="hint">Hint: anything works. Press Return.</div>
      </form>
      <div className="bottom">
        <button type="button" onClick={() => setPower('sleep')}><span>{G.moon}</span>Sleep</button>
        <button type="button" onClick={() => setPower('boot')}><span>{G.reload}</span>Restart</button>
        <button type="button" onClick={() => setPower('off')}><span>{G.power}</span>Shut Down</button>
      </div>
    </div>
  );
}
