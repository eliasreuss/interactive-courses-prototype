// What the course covered, as its teaching sections. Tie `cards` to the word
// in the agenda line where the sections are introduced.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SectionOverview} from '../components/SectionOverview';
import {enter} from '../motion';
import {tick} from '../sfx';
import {color, font, labelStyle} from '../theme';
import {config, contentSections, linesOf} from '../timeline';

const NUMBER = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const HEADING = `In ${NUMBER[contentSections.length]} parts`;

const first = linesOf('agenda')[0];

export const beats = {
  heading: first ? first.from : 0,
  cards: first ? first.from + 24 : 0,
};

export const sfx = [tick(beats.cards), tick(beats.cards + 18)];

export const Scene: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', ...enter(frame, beats.heading, 16)}}>
        <div style={labelStyle}>{config.title}</div>
        <div style={{fontSize: 52, fontWeight: 700, marginTop: 10}}>{HEADING}</div>
      </div>
      <SectionOverview frame={frame} appearAt={beats.cards} y={350} />
    </AbsoluteFill>
  );
};
