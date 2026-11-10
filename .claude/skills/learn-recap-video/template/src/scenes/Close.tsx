// Closing frame: what the viewer can now decide or do, one card per takeaway,
// each lit on its word in the last line. Replace TAKEAWAYS with this course's
// own closing words (course wording, short anchors) and give each a cue word.
// The resolve lands just before the last line ends, then everything fades out.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {enter} from '../motion';
import {resolve, tick} from '../sfx';
import {color, font, labelStyle, radius, shadow} from '../theme';
import {config, cue, lineEnd, linesOf, scenes, TOTAL_FRAMES} from '../timeline';

/** text: the anchor shown on the card. word: the spoken word in the last line that lights it; nth picks a later occurrence of a repeated word. */
const TAKEAWAYS: {text: string; word: string; nth?: number}[] = [];

const last = linesOf('close').at(-1);

export const beats = {
  title: (scenes.find((s) => s.name === 'close')?.from ?? 0) + 4,
  takeaways: last ? TAKEAWAYS.map((t) => cue(last.id, t.word, t.nth ?? 0)) : [],
  resolve: last ? lineEnd(last.id) - 6 : 0,
};

export const sfx = [...beats.takeaways.map((t) => tick(t)), resolve(beats.resolve)];

const W = 380;
const GAP = 40;

export const Scene: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats;
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 20, TOTAL_FRAMES - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x0 = (1920 - (TAKEAWAYS.length * W + (TAKEAWAYS.length - 1) * GAP)) / 2;
  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen, opacity: fadeOut}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: TAKEAWAYS.length ? 190 : 430, textAlign: 'center', ...enter(frame, b.title, 18)}}>
        <div style={labelStyle}>Takeaways</div>
        <div style={{fontSize: 64, fontWeight: 700, marginTop: 10}}>{config.title}</div>
      </div>
      {TAKEAWAYS.map((t, i) => (
        <div
          key={t.text}
          style={{
            position: 'absolute',
            left: x0 + i * (W + GAP),
            top: 420,
            width: W,
            height: 300,
            borderRadius: radius.lg,
            background: color.cardWhite,
            boxShadow: shadow.ambient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 36,
            boxSizing: 'border-box',
            textAlign: 'center',
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.3,
            ...enter(frame, b.takeaways[i], 24),
          }}
        >
          {t.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};
