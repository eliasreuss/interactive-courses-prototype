// Opening title over the course hero artwork. Without a hero image the title
// sits centred on its own.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {enter} from '../motion';
import {color, font, labelStyle} from '../theme';
import {config} from '../timeline';

export const beats = {
  hero: 4,
  title: 10,
};

const LABEL = config.label ?? (config.kind === 'path' ? 'Learning path' : '');

export const Scene: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats;
  if (!config.hero) {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: font, color: color.forestGreen, textAlign: 'center'}}>
        <div style={{...labelStyle, ...enter(frame, b.title, 16)}}>{LABEL}</div>
        <div style={{fontSize: 104, fontWeight: 700, lineHeight: 1.1, marginTop: 20, maxWidth: 1400, ...enter(frame, b.title + 4, 28)}}>{config.title}</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 160, top: 380, width: 760, fontFamily: font, color: color.forestGreen}}>
        <div style={{...labelStyle, ...enter(frame, b.title, 16)}}>{LABEL}</div>
        <div style={{fontSize: 104, fontWeight: 700, lineHeight: 1.1, marginTop: 20, ...enter(frame, b.title + 4, 28)}}>{config.title}</div>
      </div>
      <Img src={staticFile(config.hero)} style={{position: 'absolute', left: 1000, top: 170, width: 800, ...enter(frame, b.hero, 36, 34)}} />
    </AbsoluteFill>
  );
};
