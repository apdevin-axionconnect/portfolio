import { useEffect } from 'react';
import { G } from './Icons';

export default function Boot({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2700); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="boot">
      <span className="apple" style={{ width: 84, height: 84 }}>{G.apple}</span>
      <div className="bar"><i /></div>
    </div>
  );
}
