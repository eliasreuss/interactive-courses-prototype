// Burned in captions. Each line is split into short phrases at sentence and
// comma breaks, and every phrase is timed from the spoken word timestamps.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import script from '../../script.json';
import {color, font, radius} from '../theme';
import {FPS, lines} from '../timeline';

const MAX_WORDS = 9;
const TAIL = 8;

type Phrase = {text: string; from: number; to: number};

const textOf = new Map((script as {id: number; text: string}[]).map((s) => [s.id, s.text]));

const split = (words: string[]): string[][] => {
  const out: string[][] = [];
  let current: string[] = [];
  words.forEach((w, i) => {
    current.push(w);
    const rest = words.length - i - 1;
    const hardBreak = /[.?!]$/.test(w);
    const softBreak = /,$/.test(w) && current.length >= 3 && rest >= 3;
    const tooLong = current.length >= MAX_WORDS && rest >= 3;
    if (hardBreak || softBreak || tooLong) {
      out.push(current);
      current = [];
    }
  });
  if (current.length) out.push(current);
  return out;
};

const phrases: Phrase[] = lines.flatMap((l) => {
  const words = textOf.get(l.id)!.split(/\s+/);
  const groups = split(words);
  const spoken = l.words.length === words.length;
  let index = 0;
  const starts = groups.map((g) => {
    const t = spoken ? l.words[index].start : (index / words.length) * (l.frames / FPS);
    index += g.length;
    return l.from + Math.round(t * FPS);
  });
  return groups.map((g, i) => ({
    text: g.join(' '),
    from: i === 0 ? l.from : starts[i],
    to: i < groups.length - 1 ? starts[i + 1] : l.to + TAIL,
  }));
});

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const phrase = phrases.find((p) => frame >= p.from && frame < p.to);
  if (!phrase) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 48, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: font,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.3,
          color: color.cardWhite,
          background: 'rgba(48, 70, 66, 0.88)',
          borderRadius: radius.md,
          padding: '12px 28px',
          maxWidth: 1500,
          textAlign: 'center',
        }}
      >
        {phrase.text}
      </div>
    </div>
  );
};
