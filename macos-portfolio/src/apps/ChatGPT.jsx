import { useEffect, useRef, useState } from 'react';
import { G } from '../components/Icons';
import { chat, getKey, setKey, getModel, setModel } from '../os/ai';
import { PROFILE } from '../data/profile';

const load = () => { try { return JSON.parse(localStorage.getItem('mp:chats')) || []; } catch { return []; } };
const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];
const STARTERS = [`Tell me about ${PROFILE.name.split(' ')[0]}'s projects`, 'What tech stack does this portfolio use?', 'Write a short intro for a recruiter', 'Explain React Server Components simply'];

export default function ChatGPT() {
  const [chats, setChats] = useState(load);
  const [cur, setCur] = useState(chats[0]?.id || null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(!getKey());
  const [key, setK] = useState(getKey());
  const [model, setM] = useState(getModel());
  const abort = useRef(null);
  const bottom = useRef(null);
  const ta = useRef(null);

  useEffect(() => { localStorage.setItem('mp:chats', JSON.stringify(chats.slice(0, 30))); }, [chats]);
  const conv = chats.find((c) => c.id === cur);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv?.messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    if (!getKey()) { setShowKey(true); return; }
    setInput('');
    const existing = chats.find((c) => c.id === cur);
    const id = existing?.id ?? Date.now();
    const messages = [...(existing?.messages || []), { role: 'user', content }];
    const next = { id, title: existing?.title || content.slice(0, 40), messages: [...messages, { role: 'assistant', content: '' }] };
    setChats((cs) => [next, ...cs.filter((c) => c.id !== id)]);
    setCur(id);
    setBusy(true);
    abort.current = new AbortController();
    const put = (txt) => setChats((cs) => cs.map((c) => (c.id === id ? { ...c, messages: c.messages.map((m, i) => (i === c.messages.length - 1 ? { ...m, content: txt } : m)) } : c)));
    try {
      await chat(messages, { onToken: put, signal: abort.current.signal, model: getModel() });
    } catch (e) {
      if (e.name !== 'AbortError') put(`⚠️ ${e.message === 'NO_KEY' ? 'Add your OpenAI API key first.' : e.message}`);
    }
    setBusy(false);
  };

  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const grow = (el) => { el.style.height = 'auto'; el.style.height = Math.min(200, el.scrollHeight) + 'px'; };

  return (
    <div className="split gpt">
      <div className="sidebar gpt-side">
        <button className="si" onClick={() => setCur(null)}>{G.pencil} New chat</button>
        <h6>Chats</h6>
        {chats.map((c) => (
          <button key={c.id} className={'si' + (c.id === cur ? ' on' : '')} onClick={() => setCur(c.id)} title={c.title}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
            <span className="x" onClick={(e) => { e.stopPropagation(); setChats((cs) => cs.filter((x) => x.id !== c.id)); if (cur === c.id) setCur(null); }}>×</span>
          </button>
        ))}
        <button className="si" style={{ marginTop: 'auto' }} onClick={() => setShowKey((s) => !s)}>{G.key} API key & model</button>
      </div>
      <div className="main gpt-main">
        <div className="gpt-top">
          <select value={model} onChange={(e) => { setM(e.target.value); setModel(e.target.value); }}>{MODELS.map((m) => <option key={m}>{m}</option>)}</select>
          <span className="muted" style={{ fontSize: 12 }}>{getKey() ? 'Connected' : 'No API key'}</span>
        </div>

        {showKey && (
          <div className="gpt-key card">
            <b>OpenAI API key</b>
            <p className="muted" style={{ margin: '4px 0 10px', fontSize: 12 }}>Paste a key from platform.openai.com. It stays in this browser only and is sent straight to api.openai.com.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="field" type="password" placeholder="sk-…" value={key} onChange={(e) => setK(e.target.value)} />
              <button className="btn primary" onClick={() => { setKey(key); setShowKey(false); }}>Save</button>
            </div>
          </div>
        )}

        <div className="gpt-msgs">
          {!conv ? (
            <div className="gpt-empty">
              <div className="logo">{G.sparkle}</div>
              <h2>What can I help with?</h2>
              <div className="starters">{STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
            </div>
          ) : conv.messages.map((m, i) => (
            <div key={i} className={'msg ' + m.role}>
              {m.role === 'assistant' && <span className="av">{G.sparkle}</span>}
              <div className="bubble"><Markdown text={m.content || (busy && i === conv.messages.length - 1 ? '●' : '')} /></div>
            </div>
          ))}
          <div ref={bottom} />
        </div>

        <div className="gpt-compose">
          <div className="box">
            <textarea ref={ta} rows={1} placeholder="Message ChatGPT" value={input} onChange={(e) => { setInput(e.target.value); grow(e.target); }} onKeyDown={onKeyDown} />
            {busy ? <button className="send stop" onClick={() => abort.current?.abort()}>{G.stop}</button> : <button className="send" disabled={!input.trim()} onClick={() => send()}>{G.send}</button>}
          </div>
          <div className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>ChatGPT can make mistakes. Check important info.</div>
        </div>
      </div>
    </div>
  );
}

// Tiny markdown: fenced code, inline code, bold, bullet lines. Enough for chat replies.
export function Markdown({ text }) {
  const parts = text.split(/```(\w*)\n?([\s\S]*?)```/g);
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(<Para key={i} text={parts[i]} />);
    if (parts[i + 2] !== undefined) out.push(<pre key={i + 1}><code>{parts[i + 2].replace(/\n$/, '')}</code></pre>);
  }
  return <>{out}</>;
}
function Para({ text }) {
  return text.split('\n').map((line, i) => {
    const html = line
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/^(#{1,3}) (.*)$/, '<b>$2</b>')
      .replace(/^[-*] (.*)$/, '• $1');
    return <div key={i} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
  });
}
