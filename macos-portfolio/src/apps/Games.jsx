import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/OS';

// Ported from portfolio-3d's old desktop: Snake, 2048 and an unbeatable Tic-Tac-Toe.
const ARROWS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
// Arrow keys go to the game only while Games is the front window.
function useArrows(active, handler) {
  const ref = useRef(handler);
  useEffect(() => { ref.current = handler; });
  useEffect(() => {
    if (!active) return;
    const on = (e) => { if (ARROWS[e.key] && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); ref.current(ARROWS[e.key], e.key); } };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [active]);
}

const N = 16;
function Snake({ active }) {
  const [snake, setSnake] = useState([[8, 8], [7, 8], [6, 8]]);
  const [food, setFood] = useState([12, 8]);
  const [dead, setDead] = useState(false);
  const dir = useRef([1, 0]); const next = useRef([1, 0]);
  useArrows(active, ([dx, dy]) => { if (dx !== -dir.current[0] || dy !== -dir.current[1]) next.current = [dx, dy]; });
  useEffect(() => {
    if (dead) return;
    const t = setInterval(() => setSnake((s) => {
      dir.current = next.current;
      const head = [s[0][0] + dir.current[0], s[0][1] + dir.current[1]];
      if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || s.some(([x, y]) => x === head[0] && y === head[1])) { setDead(true); return s; }
      const grew = head[0] === food[0] && head[1] === food[1];
      if (grew) setFood([Math.floor(Math.random() * N), Math.floor(Math.random() * N)]);
      return [head, ...(grew ? s : s.slice(0, -1))];
    }), 140);
    return () => clearInterval(t);
  }, [dead, food]);
  const reset = () => { setSnake([[8, 8], [7, 8], [6, 8]]); dir.current = next.current = [1, 0]; setDead(false); };
  return (
    <div className="game">
      <div className="hud">Score {snake.length - 3} {dead && <button className="btn primary" onClick={reset}>Game over · restart</button>}</div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {Array.from({ length: N * N }, (_, i) => {
          const x = i % N, y = Math.floor(i / N);
          const cls = snake.some(([sx, sy]) => sx === x && sy === y) ? 'snake' : food[0] === x && food[1] === y ? 'food' : '';
          return <div key={i} className={`cell ${cls}`} />;
        })}
      </div>
      <small className="muted">Arrow keys to steer</small>
    </div>
  );
}

const empty = () => Array(16).fill(0);
const spawn = (b) => { const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); if (free.length) b[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4; return b; };
function slide(row) {
  const r = row.filter(Boolean); let gain = 0;
  for (let i = 0; i < r.length - 1; i++) if (r[i] === r[i + 1]) { r[i] *= 2; gain += r[i]; r.splice(i + 1, 1); }
  while (r.length < 4) r.push(0);
  return [r, gain];
}
function move(b, [dx, dy]) {
  const nb = [...b]; let gain = 0;
  for (let k = 0; k < 4; k++) {
    const idx = Array.from({ length: 4 }, (_, j) => (dx ? k * 4 + j : j * 4 + k));
    if (dx > 0 || dy > 0) idx.reverse();
    const [r, g] = slide(idx.map((i) => nb[i])); gain += g;
    idx.forEach((i, j) => (nb[i] = r[j]));
  }
  return [nb, gain, nb.some((v, i) => v !== b[i])];
}
function Game2048({ active }) {
  const [board, setBoard] = useState(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);
  useArrows(active, (d) => setBoard((b) => { const [nb, gain, changed] = move(b, d); if (!changed) return b; setScore((s) => s + gain); return spawn(nb); }));
  const reset = () => { setBoard(spawn(spawn(empty()))); setScore(0); };
  return (
    <div className="game">
      <div className="hud">Score {score} <button className="btn" onClick={reset}>New game</button></div>
      <div className="grid g2048">{board.map((v, i) => <div key={i} className="tile" data-v={v}>{v || ''}</div>)}</div>
      <small className="muted">Arrow keys to slide</small>
    </div>
  );
}

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b) => LINES.map(([a, c, d]) => (b[a] && b[a] === b[c] && b[a] === b[d] ? b[a] : null)).find(Boolean) || (b.every(Boolean) ? 'draw' : null);
function best(b, me, turn) {
  const w = winner(b); if (w) return [w === me ? 1 : w === 'draw' ? 0 : -1, null];
  let top = [turn === me ? -2 : 2, null];
  b.forEach((v, i) => {
    if (v) return;
    const nb = [...b]; nb[i] = turn;
    const [s] = best(nb, me, turn === 'X' ? 'O' : 'X');
    if (turn === me ? s > top[0] : s < top[0]) top = [s, i];
  });
  return top;
}
function TicTacToe() {
  const [b, setB] = useState(Array(9).fill(null));
  const w = winner(b);
  const play = (i) => {
    if (b[i] || w) return;
    const nb = [...b]; nb[i] = 'X';
    if (!winner(nb)) nb[best(nb, 'O', 'O')[1]] = 'O';
    setB(nb);
  };
  return (
    <div className="game">
      <div className="hud">{w ? (w === 'draw' ? 'Draw' : `${w} wins`) : 'You are X'} <button className="btn" onClick={() => setB(Array(9).fill(null))}>Reset</button></div>
      <div className="grid ttt">{b.map((v, i) => <button key={i} className="sq" onClick={() => play(i)}>{v}</button>)}</div>
    </div>
  );
}

const GAMES = { snake: ['Snake', Snake], g2048: ['2048', Game2048], ttt: ['Tic-Tac-Toe', TicTacToe] };

export default function Games() {
  const { activeApp } = useOS();
  const [cur, setCur] = useState('snake');
  const [, Game] = GAMES[cur];
  return (
    <div className="games">
      <div className="seg" style={{ alignSelf: 'center', marginBottom: 14 }}>
        {Object.entries(GAMES).map(([id, [name]]) => <button key={id} className={cur === id ? 'on' : ''} onClick={() => setCur(id)}>{name}</button>)}
      </div>
      <Game key={cur} active={activeApp === 'games'} />
    </div>
  );
}
