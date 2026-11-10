// Lists the frames worth checking and lints the timeline. Bundled and run by
// qa/stills.mjs; prints JSON {frames, warnings, lines, total, runtime}.
//
// Frames: every beat once it has settled, the last settled frame of each
// scene, and each section card with its title in place.
import video from '../video.json';
import {sfx} from '../src/mix';
import {registry} from '../src/scenes';
import {CARD_FRAMES, CROSSFADE, FPS, lines, scenes, TOTAL_FRAMES} from '../src/timeline';

const SETTLE = 28;
const MIN_APART = 8;

const flatten = (b: unknown): number[] =>
  typeof b === 'number' ? [b] : Array.isArray(b) ? b.flatMap(flatten) : b && typeof b === 'object' ? Object.values(b).flatMap(flatten) : [];

const frames: {scene: string; frame: number}[] = [];
const warnings: string[] = [];

for (const s of scenes) {
  const lo = s.from + (s.fadeIn ? CROSSFADE : 0);
  const hi = s.to - (s.fadeOut ? CROSSFADE : 0) - 1;
  let picks: number[];
  if (s.name.startsWith('card-')) {
    picks = [s.from + 4 + Math.round(CARD_FRAMES * 0.6)];
  } else {
    const beats = flatten(registry[s.name]?.beats ?? {});
    for (const b of beats) {
      if (b < s.from - CROSSFADE || b > s.to) warnings.push(`${s.name}: beat at frame ${b} is outside the scene (${s.from} to ${s.to})`);
    }
    picks = [...beats.map((b) => b + SETTLE), hi];
  }
  const sorted = [...new Set(picks.map((f) => Math.min(hi, Math.max(lo, f))))].sort((a, b) => a - b);
  const kept = sorted.filter((f, i) => i === sorted.length - 1 || sorted[i + 1] - f >= MIN_APART);
  frames.push(...kept.map((frame) => ({scene: s.name, frame})));
}

// Ticks that bunch up read as one loud rattle.
const ticks = sfx.filter((x) => x.file.includes('tick')).map((x) => x.at);
for (let i = 0; i + 2 < ticks.length; i++) {
  if (ticks[i + 2] - ticks[i] < 18) warnings.push(`three ticks within ${ticks[i + 2] - ticks[i]} frames at ${ticks[i]} (${(ticks[i] / FPS).toFixed(1)}s). Keep at most two`);
}
for (let i = 0; i + 1 < ticks.length; i++) {
  if (ticks[i + 1] - ticks[i] < 6) warnings.push(`ticks ${ticks[i + 1] - ticks[i]} frames apart at ${ticks[i]}. Space them 12 frames or more`);
}

const runtime = TOTAL_FRAMES / FPS;
const [min, max] = video.runtime;
if (lines.length && (runtime < min || runtime > max)) warnings.push(`runtime ${runtime.toFixed(1)}s is outside the target ${min} to ${max}s`);

const spoken = lines.map((l) => ({id: l.id, scene: l.scene, from: l.from, to: l.to}));
console.log(JSON.stringify({frames, warnings, lines: spoken, total: TOTAL_FRAMES, runtime: Number(runtime.toFixed(2))}));
