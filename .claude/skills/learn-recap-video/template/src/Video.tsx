import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from './components/Captions';
import {SectionHeader} from './components/SectionHeader';
import {sfx, VOICE_GAIN} from './mix';
import {registry, SceneProps} from './scenes';
import {SectionCard} from './scenes/SectionCard';
import {color} from './theme';
import {CROSSFADE, lines, SceneRange, scenes, TOTAL_FRAMES} from './timeline';

const sceneComponent = (name: string): React.FC<SceneProps> => {
  if (name.startsWith('card-')) {
    const section = name.slice('card-'.length);
    const Card: React.FC<SceneProps> = (p) => <SectionCard {...p} section={section} />;
    return Card;
  }
  const mod = registry[name];
  if (!mod) throw new Error(`Scene "${name}" is used in script.json but is missing from src/scenes/index.ts`);
  return mod.Scene;
};

// Built once, so components keep their identity from frame to frame.
const components = Object.fromEntries(scenes.map((s) => [s.name, sceneComponent(s.name)]));

const SceneFrame: React.FC<{range: SceneRange; children: React.ReactNode}> = ({range, children}) => {
  const frame = useCurrentFrame();
  const duration = range.to - range.from;
  const fadeIn = range.fadeIn ? interpolate(frame, [0, CROSSFADE], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const fadeOut = range.fadeOut ? interpolate(frame, [duration - CROSSFADE, duration], [1, 0], {extrapolateLeft: 'clamp'}) : 1;
  const eased = (x: number) => x * x * (3 - 2 * x);
  return (
    <AbsoluteFill style={{opacity: eased(fadeIn) * eased(fadeOut), transform: `translateY(${(1 - eased(fadeIn)) * 14}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

export type Stem = 'all' | 'voice' | 'sfx';

const Soundtrack: React.FC<{stem: Stem}> = ({stem}) => (
  <>
    {stem === 'all' || stem === 'voice'
      ? lines.map((l) => (
          <Sequence key={`vo-${l.id}`} from={l.from} durationInFrames={l.frames + 2} layout="none">
            <Html5Audio src={staticFile(`audio/${l.file}`)} volume={VOICE_GAIN} />
          </Sequence>
        ))
      : null}
    {stem === 'all' || stem === 'sfx'
      ? sfx.map((s, i) => (
          <Sequence key={`sfx-${i}`} from={Math.max(0, s.at)} layout="none">
            <Html5Audio src={staticFile(`audio/${s.file}`)} volume={s.gain} />
          </Sequence>
        ))
      : null}
  </>
);

export const Video: React.FC<{stem?: Stem; captions?: boolean}> = ({stem = 'all', captions = true}) => (
  <AbsoluteFill style={{background: color.offWhite}}>
    {scenes.map((s) => {
      const Scene = components[s.name];
      return (
        <Sequence key={s.name} from={s.from} durationInFrames={s.to - s.from} name={s.name}>
          <SceneFrame range={s}>
            <Scene offset={s.from} />
          </SceneFrame>
        </Sequence>
      );
    })}
    <SectionHeader />
    {captions ? <Captions /> : null}
    <Soundtrack stem={stem} />
  </AbsoluteFill>
);

export const DURATION = TOTAL_FRAMES;
