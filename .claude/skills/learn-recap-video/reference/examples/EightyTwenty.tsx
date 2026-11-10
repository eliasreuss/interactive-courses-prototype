// Rebuild of 80:20.png. Ten products start in one line, then split: two land
// in the green row that earns 80% of the profit, eight in the red row that earns 20%.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beats} from '../beats';
import {Cube} from '../components/primitives';
import {count, enter, settle} from '../motion';
import {color, font, radius} from '../theme';

const ROW_X = 300;
const ROW_W = 960;
const GREEN = {y: 230, h: 230};
const RED = {y: 520, h: 410};
const CUBE = 124;
const LINE_GAP = 30;
const LINE_X = (1920 - (10 * CUBE + 9 * LINE_GAP)) / 2;
const LINE_Y = 470;
// Slots in the starting line that hold the two products that end up in the green row.
const GREEN_SLOTS = [2, 6];

const Percent: React.FC<{value: number; y: number; appear: React.CSSProperties}> = ({value, y, appear}) => (
  <div style={{position: 'absolute', left: 1330, top: y, width: 320, textAlign: 'center', fontFamily: font, color: color.forestGreen, ...appear}}>
    <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1}}>{value}%</div>
    <div style={{fontSize: 46, fontWeight: 400, marginTop: 6}}>Of profit</div>
  </div>
);

const targets = (() => {
  const green = [0, 1].map((i) => ({x: ROW_X + ROW_W / 2 - CUBE - 20 + i * (CUBE + 40), y: GREEN.y + (GREEN.h - CUBE) / 2}));
  const gap = 46;
  const startX = ROW_X + (ROW_W - (4 * CUBE + 3 * gap)) / 2;
  const red = Array.from({length: 8}, (_, i) => ({x: startX + (i % 4) * (CUBE + gap), y: RED.y + 60 + Math.floor(i / 4) * (CUBE + 42)}));
  let g = 0;
  let r = 0;
  return Array.from({length: 10}, (_, slot) => (GREEN_SLOTS.includes(slot) ? {...green[g++], green: true} : {...red[r++], green: false}));
})();

export const EightyTwenty: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats.eightyTwenty;
  const split = settle(frame, b.split, 34);
  const highlight = settle(frame, b.highlightFew, 20);

  const row = (y: number, h: number, bg: string, start: number) => (
    <div style={{position: 'absolute', left: ROW_X, top: y, width: ROW_W, height: h, borderRadius: radius.lg + 4, background: bg, ...enter(frame, start, 20)}} />
  );

  return (
    <AbsoluteFill>
      {row(GREEN.y, GREEN.h, color.eightyGreen, b.split + 4)}
      {row(RED.y, RED.h, color.twentyRed, b.split + 10)}
      {targets.map((t, slot) => {
        const x = LINE_X + slot * (CUBE + LINE_GAP) + (t.x - (LINE_X + slot * (CUBE + LINE_GAP))) * split;
        const y = LINE_Y + (t.y - LINE_Y) * split;
        return (
          <div key={slot} style={{position: 'absolute', left: x, top: y, ...enter(frame, b.cubes + slot * 2, 18, 20)}}>
            <div style={{transform: `translateY(${t.green ? -highlight * 10 : 0}px)`}}>
              <Cube size={CUBE} fill={color.cardWhite} />
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: ROW_X - 8,
          top: GREEN.y - 8,
          width: ROW_W + 16,
          height: GREEN.h + 16,
          borderRadius: radius.lg + 10,
          border: `3px solid ${color.forestGreen}`,
          opacity: highlight * 0.85,
        }}
      />
      <Percent value={count(frame, b.eighty, 0, 80, 22)} y={GREEN.y + 6} appear={enter(frame, b.eighty, 20)} />
      <Percent value={count(frame, b.twenty, 0, 20, 18)} y={RED.y + 96} appear={enter(frame, b.twenty, 20)} />
    </AbsoluteFill>
  );
};
