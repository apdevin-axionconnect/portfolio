// Shared OpenAI client for ChatGPT + Siri. Key comes from the ChatGPT app settings (localStorage) or VITE_OPENAI_API_KEY.
import { PROFILE, PROJECTS, SKILLS, EXPERIENCE, EDUCATION } from '../data/profile';

export const getKey = () => localStorage.getItem('mp:openai_key') || import.meta.env.VITE_OPENAI_API_KEY || '';
export const setKey = (k) => localStorage.setItem('mp:openai_key', k.trim());
export const getModel = () => localStorage.getItem('mp:openai_model') || 'gpt-4o-mini';
export const setModel = (m) => localStorage.setItem('mp:openai_model', m);

export const PORTFOLIO_CONTEXT = `You are an assistant embedded in ${PROFILE.name}'s portfolio website, which is styled like macOS.
Owner: ${PROFILE.name}, ${PROFILE.role}, ${PROFILE.location}. Email ${PROFILE.email}. GitHub ${PROFILE.links.github}.
About: ${PROFILE.about}
Skills: ${SKILLS.map((s) => `${s.group}: ${s.items.join(', ')}`).join('; ')}
Projects: ${PROJECTS.map((p) => `${p.name} (${p.year}) - ${p.tagline} Tech: ${p.tech.join(', ')}`).join(' | ')}
Experience: ${EXPERIENCE.map((e) => `${e.role} at ${e.company} (${e.period})`).join(' | ')}
Education: ${EDUCATION.map((e) => `${e.degree}, ${e.school} (${e.period})`).join(' | ')}
Answer questions about the owner accurately from this context; for anything else, answer normally and concisely.`;

/** Streams a chat completion. onToken(text) is called with accumulated text. Returns the final text. */
export async function chat(messages, { onToken, signal, system = PORTFOLIO_CONTEXT, model = getModel() } = {}) {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, stream: true, messages: [{ role: 'system', content: system }, ...messages] }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) { text += delta; onToken?.(text); }
      } catch { /* partial frame */ }
    }
  }
  return text;
}
