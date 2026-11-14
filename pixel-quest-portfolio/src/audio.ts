// Original chiptune generated live with Tone.js: no audio files, nothing to license.
import * as Tone from 'tone';

const lead = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }, volume: -16 }).toDestination();
const bass = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.1 }, volume: -10 }).toDestination();
const kick = new Tone.MembraneSynth({ volume: -8 }).toDestination();
const hat = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.04, sustain: 0 }, volume: -24 }).toDestination();
// PolySynth: SFX can overlap (a jump while a jingle is still scheduled) without Tone's "time must be >= last scheduled" error
const fx = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 }, volume: -12 }).toDestination();
fx.maxPolyphony = 16;

// 8th-note patterns, null = rest. Bouncy C major melody over I-V-vi-IV.
const LEAD = ['E5', 'E5', null, 'E5', null, 'C5', 'E5', null, 'G5', null, null, null, 'G4', null, null, null,
              'C5', null, null, 'G4', null, null, 'E4', null, 'A4', null, 'B4', null, 'A#4', 'A4', null, null];
const BASS = ['C2', null, 'C2', 'C3', 'G1', null, 'G1', 'G2', 'A1', null, 'A1', 'A2', 'F1', null, 'F1', 'F2'];

let step = 0, started = false;
const loop = new Tone.Loop(time => {
  const l = LEAD[step % LEAD.length], b = BASS[step % BASS.length];
  if (l) lead.triggerAttackRelease(l, '16n', time);
  if (b) bass.triggerAttackRelease(b, '8n', time);
  if (step % 4 === 0) kick.triggerAttackRelease('C1', '8n', time);
  if (step % 2 === 1) hat.triggerAttackRelease('16n', time);
  step++;
}, '8n');

export async function startMusic() {
  await Tone.start();
  Tone.getTransport().bpm.value = 120;
  loop.start(0); Tone.getTransport().start(); started = true;
}
export function stopMusic() { Tone.getTransport().stop(); loop.stop(); }
export function setMuted(m: boolean) { Tone.getDestination().mute = m; }
// each world plays a little faster: the run speeds up as the developer levels up
export function setTempo(bpm: number) { if (started) Tone.getTransport().bpm.rampTo(bpm, 1); }

const seq = (notes: string[], gap: number, dur = '8n') => { try { notes.forEach((n, i) => fx.triggerAttackRelease(n, dur, `+${i * gap}`)); } catch { /* audio not started yet */ } };
export const sfx = {
  jump:    () => seq(['E5'], 0, '16n'),
  collect: () => seq(['B5', 'E6'], 0.08, '16n'),
  coin:    () => seq(['B5', 'E6'], 0.05, '32n'),
  squash:  () => seq(['G3', 'C3'], 0.06, '16n'),
  hurt:    () => seq(['E3', 'C3', 'G2'], 0.1),
  secret:  () => seq(['C6', 'E6', 'G6', 'C7'], 0.07, '16n'),
  gate:    () => seq(['C5', 'E5', 'G5', 'C6', 'G5', 'C6'], 0.11),
  finale:  () => seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.14),
};
