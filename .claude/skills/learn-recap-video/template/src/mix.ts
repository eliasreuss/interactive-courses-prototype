// Mix levels. Voice and every sound file are normalised to the same RMS
// (-20 dBFS). Gains are then set from loudness measured on the rendered stems
// (render.sh --stems) so effects sit 12 to 15 dB under the voice.
// Whoosh and resolve sit lower than their RMS suggests because their quiet
// tails pull the file RMS down. There is no music bed.
import {registry} from './scenes';
import {Cue, CueKind} from './sfx';
import {scenes} from './timeline';

const db = (value: number) => 10 ** (value / 20);

export const VOICE_GAIN = db(0);

const GAIN: Record<CueKind, number> = {
  tick: db(-16),
  whoosh: db(-26),
  rise: db(-20),
  resolve: db(-22.5),
};

type Sfx = {at: number; file: string; gain: number};

const cues: Cue[] = [
  // Soft whoosh into every scene that crossfades in, including each section card.
  ...scenes.filter((s) => s.fadeIn).map((s): Cue => ({at: s.from - 8, kind: 'whoosh'})),
  ...Object.values(registry).flatMap((m) => m.sfx ?? []),
].sort((a, b) => a.at - b.at);

let tickCount = 0;

export const sfx: Sfx[] = cues.map((c) => ({
  at: c.at,
  file: c.kind === 'tick' ? (tickCount++ % 2 ? 'sfx/tick-b.wav' : 'sfx/tick-a.wav') : `sfx/${c.kind}.wav`,
  gain: GAIN[c.kind],
}));
