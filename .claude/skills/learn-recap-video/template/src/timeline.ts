// The whole timeline is derived from timing.json, which tts/generate.py writes
// from the real length of every voice file. Regenerate a line and everything
// after it moves on its own. Section titles, holds and hard cuts live in video.json.
import script from '../script.json';
import video from '../video.json';
import timing from './timing.json';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const LEAD_IN = 6;
const GAP_SAME_SCENE = 12;
const GAP_NEW_SCENE = 16;
const OUTRO = 50;
const SCENE_PRE_ROLL = 10;
export const CROSSFADE = 14;
/** Silent frames for each section title card. */
export const CARD_FRAMES = 52;
/** Frames from the end of a title card to the first line of its section. */
const CARD_GAP = 6;
/** Visuals start a touch before their word so they have settled when it is heard. */
export const LEAD = 3;

export type VideoConfig = {
  slug: string;
  compositionId: string;
  kind: 'course' | 'path';
  /** What a section is called on the title cards: "Section" for a course, "Course" for a path. */
  unit: string;
  title: string;
  /** Small label above the opening title, such as the learning path name. */
  label?: string;
  /** Hero artwork under public/, shown on the opening. Null for a text only opening. */
  hero: string | null;
  runtime: [number, number];
  /** Spoken word budget, checked by qa/lint.py. */
  words: [number, number];
  /** Every section in order, one per course section marker. `topic` is the marker's name, `title` what the card shows. A `recap` section is optional and comes last. */
  sections: {key: string; title: string; topic?: string}[];
  /** Extra silent frames after a line id so its key visual can be read. */
  holdAfter: Record<string, number>;
  /** Scenes that hard cut in because they share their layout with the scene before. */
  continuous: string[];
};

export const config = video as unknown as VideoConfig;

export type Section = string;
export type SectionKey = 'intro' | Section;
export type SceneName = string;

export const sectionOrder: Section[] = config.sections.map((s) => s.key);
/** The teaching sections, without the final recap. */
export const contentSections: Section[] = sectionOrder.filter((s) => s !== 'recap');
/** Keeps an acronym on the line of the word before it, so balanced wraps never split "Double ABC". */
export const keepAcronyms = (text: string) => text.replace(/ (?=[A-Z]{2,}\b)/g, '\u00A0');

export const sections: Record<Section, {number: number; title: string}> = Object.fromEntries(
  config.sections.map((s, i) => [s.key, {number: i + 1, title: s.title}]),
);

type Word = {w: string; start: number; end: number};
type TimingEntry = {id: number; scene: string; file: string; seconds: number; frames: number; words: Word[]};
type ScriptEntry = {id: number; section: SectionKey; scene: string; text: string; cut?: boolean};

export type Line = TimingEntry & {scene: SceneName; section: SectionKey; from: number; to: number};

export const scriptLines = (script as ScriptEntry[]).filter((s) => !s.cut);
const sectionOf = new Map(scriptLines.map((s) => [s.id, s.section]));
const entries = timing as TimingEntry[];

export const cards: {section: Section; from: number; to: number}[] = [];

export const lines: Line[] = (() => {
  let cursor = LEAD_IN;
  const out: Line[] = [];
  entries.forEach((entry, i) => {
    const section = sectionOf.get(entry.id);
    if (section === undefined) throw new Error(`timing.json line ${entry.id} is not in script.json. Run tts/generate.py timing`);
    const prev = out[out.length - 1];
    if (prev && section !== prev.section && section !== 'intro') {
      cards.push({section, from: cursor, to: cursor + CARD_FRAMES});
      cursor += CARD_FRAMES + CARD_GAP;
    }
    const from = cursor;
    const to = from + entry.frames;
    const next = entries[i + 1];
    const gap = next && next.scene === entry.scene ? GAP_SAME_SCENE : GAP_NEW_SCENE;
    cursor = to + (config.holdAfter[String(entry.id)] ?? 0) + gap;
    out.push({...entry, scene: entry.scene, section, from, to});
  });
  return out;
})();

export const TOTAL_FRAMES = lines.length ? lines[lines.length - 1].to + OUTRO : 300;

export type SceneRange = {name: SceneName; from: number; to: number; fadeIn: boolean; fadeOut: boolean};

export const scenes: SceneRange[] = (() => {
  const starts: {name: SceneName; from: number}[] = [];
  for (const l of lines) {
    const c = cards.find((x) => x.to + CARD_GAP === l.from);
    if (c) starts.push({name: `card-${c.section}`, from: c.from - 4});
    if (!starts.some((s) => s.name === l.scene)) starts.push({name: l.scene, from: starts.length === 0 ? 0 : l.from - SCENE_PRE_ROLL});
  }
  return starts.map((s, i) => {
    const next = starts[i + 1];
    const continuousIn = config.continuous.includes(s.name);
    const continuousOut = next !== undefined && config.continuous.includes(next.name);
    const to = next === undefined ? TOTAL_FRAMES : next.from + (continuousOut ? 0 : CROSSFADE);
    return {name: s.name, from: s.from, to, fadeIn: i > 0 && !continuousIn, fadeOut: next !== undefined && !continuousOut};
  });
})();

export const scene = (name: SceneName) => {
  const found = scenes.find((s) => s.name === name);
  if (!found) throw new Error(`Scene ${name} is not in the timeline`);
  return found;
};

export const card = (section: Section) => {
  const found = cards.find((c) => c.section === section);
  if (!found) throw new Error(`Section ${section} has no title card. Check the section keys in script.json`);
  return found;
};

export const line = (id: number) => {
  const found = lines.find((l) => l.id === id);
  if (!found) throw new Error(`Line ${id} is not in the timeline`);
  return found;
};

/** Every line a scene shows, in order. */
export const linesOf = (name: SceneName) => lines.filter((l) => l.scene === name);

/** Absolute frame where the nth occurrence of a spoken word starts (or ends) in a line. */
export const at = (id: number, word: string, nth = 0, edge: 'start' | 'end' = 'start') => {
  const l = line(id);
  const hits = l.words.filter((w) => w.w === word.toLowerCase());
  const hit = hits[nth];
  if (!hit) throw new Error(`Word "${word}" #${nth} not found in line ${id}. Spoken words: ${l.words.map((w) => w.w).join(' ')}`);
  return l.from + Math.round(hit[edge] * FPS);
};

/** Frame for a visual tied to a word: a few frames early so it has settled when the word is heard. */
export const cue = (id: number, word: string, nth = 0) => at(id, word, nth) - LEAD;

export const lineStart = (id: number) => line(id).from;
export const lineEnd = (id: number) => line(id).to;
