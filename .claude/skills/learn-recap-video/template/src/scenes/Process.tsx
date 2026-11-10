// The final recap mirrors the agenda: the teaching sections as one process,
// lit up step by step. By default the first process line introduces it and
// each following line lights the next card. Set HEADING from that first line.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SectionOverview} from '../components/SectionOverview';
import {enter} from '../motion';
import {tick} from '../sfx';
import {color, font} from '../theme';
import {contentSections, linesOf} from '../timeline';

const HEADING = 'What you learned';

const own = linesOf('process');

export const beats = {
  heading: own[0]?.from ?? 0,
  cards: (own[0]?.from ?? 0) + 20,
  steps: own.slice(1, 1 + contentSections.length).map((l) => l.from),
};

export const sfx = beats.steps.map((s) => tick(s));

export const Scene: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontSize: 52, fontWeight: 700, ...enter(frame, beats.heading, 16)}}>
        {HEADING}
      </div>
      <SectionOverview frame={frame} appearAt={beats.cards} focusAt={beats.steps.length ? beats.steps : undefined} y={350} />
    </AbsoluteFill>
  );
};
