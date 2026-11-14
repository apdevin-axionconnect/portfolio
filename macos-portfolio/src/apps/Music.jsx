import { useEffect, useRef, useState } from 'react';
import { G } from '../components/Icons';
import { PROFILE } from '../data/profile';

// Three generative loops played with the Web Audio API, so the player is real without shipping audio files.
const TRACKS = [
  { title: 'Focus Mode', artist: PROFILE.name, bpm: 84, notes: [0, 7, 12, 7, 3, 7, 10, 7], root: 220, color: ['#5e5ce6', '#bf5af2'] },
  { title: 'Ship It', artist: PROFILE.name, bpm: 120, notes: [0, 4, 7, 11, 12, 11, 7, 4], root: 261.6, color: ['#ff9f0a', '#ff375f'] },
  { title: 'Late Night Build', artist: PROFILE.name, bpm: 70, notes: [0, 3, 7, 10, 12, 10, 7, 3], root: 164.8, color: ['#30d158', '#64d2ff'] },
];
const LEN = 64; // beats per track

export default function Music() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const ctx = useRef(null);
  const timer = useRef(null);
  const t = TRACKS[i];

  const stop = () => { clearInterval(timer.current); timer.current = null; };
  useEffect(() => () => { stop(); ctx.current?.close(); }, []);

  useEffect(() => {
    stop();
    if (!playing) return;
    ctx.current ||= new (window.AudioContext || window.webkitAudioContext)();
    const ac = ctx.current;
    ac.resume();
    let b = beat;
    const tick = () => {
      const n = t.notes[b % t.notes.length];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = b % 2 ? 'triangle' : 'sine';
      o.frequency.value = t.root * Math.pow(2, n / 12) * (b % 16 === 0 ? 0.5 : 1);
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.4);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.45);
      b += 1;
      if (b >= LEN) { b = 0; setI((x) => (x + 1) % TRACKS.length); }
      setBeat(b);
    };
    tick();
    timer.current = setInterval(tick, 60000 / t.bpm / 2);
    return stop;
  }, [playing, i]); // eslint-disable-line

  const skip = (d) => { setBeat(0); setI((x) => (x + d + TRACKS.length) % TRACKS.length); };
  const mm = (b) => `${Math.floor(b * 30 / t.bpm / 60)}:${String(Math.floor(b * 30 / t.bpm) % 60).padStart(2, '0')}`;

  return (
    <div className="music">
      <div className={'art' + (playing ? ' spin' : '')} style={{ background: `linear-gradient(135deg, ${t.color[0]}, ${t.color[1]})` }}><span>{G.play}</span></div>
      <b className="mt">{t.title}</b>
      <div className="muted">{t.artist}</div>
      <div className="prog"><i style={{ width: `${(beat / LEN) * 100}%` }} /></div>
      <div className="times muted"><span>{mm(beat)}</span><span>-{mm(LEN - beat)}</span></div>
      <div className="ctrls">
        <button onClick={() => skip(-1)}>{G.prev}</button>
        <button className="pp" onClick={() => setPlaying((p) => !p)}>{playing ? G.pause : G.play}</button>
        <button onClick={() => skip(1)}>{G.next}</button>
      </div>
      <div className="plist">
        {TRACKS.map((tr, k) => (
          <button key={tr.title} className={k === i ? 'on' : ''} onClick={() => { setBeat(0); setI(k); setPlaying(true); }}>
            <span className="sw" style={{ background: `linear-gradient(135deg, ${tr.color[0]}, ${tr.color[1]})` }} />{tr.title}<span className="muted" style={{ marginLeft: 'auto' }}>{tr.bpm} bpm</span>
          </button>
        ))}
      </div>
    </div>
  );
}
