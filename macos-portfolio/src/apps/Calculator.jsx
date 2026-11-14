import { useEffect, useState } from 'react';
import { useOS } from '../os/OS';

const KEYS = [['AC', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '.', '=']];
const OPS = { '÷': (a, b) => a / b, '×': (a, b) => a * b, '−': (a, b) => a - b, '+': (a, b) => a + b };
const fmt = (n) => { const s = String(+n.toPrecision(10)); return s.length > 11 ? n.toExponential(5) : s; };

export default function Calculator() {
  const { activeApp } = useOS();
  const [disp, setDisp] = useState('0');
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const press = (k) => {
    if (k === 'AC') { setDisp('0'); setAcc(null); setOp(null); setFresh(true); return; }
    if (k === '±') return setDisp((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? d : '-' + d));
    if (k === '%') return setDisp((d) => fmt(+d / 100));
    if (k in OPS || k === '=') {
      const cur = +disp;
      const result = op && acc !== null && !fresh ? OPS[op](acc, cur) : cur;
      setDisp(fmt(result)); setAcc(result); setOp(k === '=' ? null : k); setFresh(true);
      return;
    }
    if (k === '.') { if (fresh) { setDisp('0.'); setFresh(false); } else if (!disp.includes('.')) setDisp(disp + '.'); return; }
    if (fresh) { setDisp(k); setFresh(false); } else if (disp.replace(/[-.]/g, '').length < 10) setDisp(disp === '0' ? k : disp + k);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (activeApp !== 'calculator' || e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const map = { '/': '÷', '*': '×', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'AC', Backspace: 'AC', '%': '%' };
      if (/^[0-9.]$/.test(e.key)) press(e.key); else if (map[e.key]) { e.preventDefault(); press(map[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="calc">
      <div className="cdisp">{disp}</div>
      <div className="ckeys">
        {KEYS.flat().map((k) => (
          <button key={k} className={'ck' + (k in OPS || k === '=' ? ' op' : '') + (['AC', '±', '%'].includes(k) ? ' fn' : '') + (k === '0' ? ' zero' : '') + (op === k && fresh ? ' active' : '')} onClick={() => press(k)}>{k}</button>
        ))}
      </div>
    </div>
  );
}
