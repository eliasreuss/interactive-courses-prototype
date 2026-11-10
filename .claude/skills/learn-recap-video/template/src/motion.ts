import {interpolate, spring} from 'remotion';
import {FPS} from './timeline';

// Critically damped: eases in and settles without overshoot.
const SETTLE = {damping: 200, stiffness: 120, mass: 1};

/** 0 to 1 progress of a settle that starts at `start`. */
export const settle = (frame: number, start: number, durationInFrames = 24) =>
  spring({frame: frame - start, fps: FPS, config: SETTLE, durationInFrames});

/** Opacity and short upward offset for an element entering at `start`. */
export const enter = (frame: number, start: number, distance = 24, durationInFrames = 24) => {
  const p = settle(frame, start, durationInFrames);
  return {
    opacity: interpolate(p, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
    transform: `translateY(${(1 - p) * distance}px)`,
  };
};

/** Same as enter, then fades back out from `end`. */
export const enterExit = (frame: number, start: number, end: number, distance = 24) => {
  const inP = settle(frame, start);
  const outP = settle(frame, end, 18);
  return {
    opacity: interpolate(inP, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}) * (1 - outP),
    transform: `translateY(${(1 - inP) * distance - outP * 10}px)`,
  };
};

/** Interpolates a value between two states with the settle curve. */
export const tween = (frame: number, start: number, from: number, to: number, durationInFrames = 24) =>
  from + (to - from) * settle(frame, start, durationInFrames);

/** Counts a number from `from` to `to`, settling into place. */
export const count = (frame: number, start: number, from: number, to: number, durationInFrames = 20) =>
  Math.round(tween(frame, start, from, to, durationInFrames));
