import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {config, FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => (
  <Composition
    id={config.compositionId}
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{stem: 'all' as const}}
  />
);
