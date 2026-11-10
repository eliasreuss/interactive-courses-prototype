// Screenshots from the course's Supademo, "Insight walkthrough - Stock Policy,
// Non Stock Items" (cmhyo4vfn4q9r17y04epcgbrp), in an app window. A camera
// eases between framings and tangerine boxes mark what the narration names, the
// way the walkthrough's hotspots do. Rects are in the screenshots' 2000 px wide
// display coordinates.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {settle} from '../motion';
import {tick} from '../sfx';
import {color, font, radius, shadow} from '../theme';
import {cue, lineStart} from '../timeline';

type Rect = [x: number, y: number, w: number, h: number];

const SRC_W = 2000;
const SRC_H = 973;
const FRAME = {x: 200, y: 160, w: 1520, h: 740};
const FULL: Rect = [0, 0, SRC_W, SRC_H];

export const beats = {
  window: lineStart(19),
  title: cue(19, 'stock'),
  matrix: cue(19, 'pinpoints') - 4,
  columns: cue(19, 'opportunities'),
  list: lineStart(20) - 4,
  total: cue(20, 'million'),
  sorted: cue(20, 'some') - 4,
  once: cue(20, 'once'),
};

export const sfx = [tick(beats.title), tick(beats.columns), tick(beats.total), tick(beats.once)];

const SHOTS = [
  {src: 'images/demo/step04.jpg', at: beats.window},
  {src: 'images/demo/step05.jpg', at: beats.list},
  {src: 'images/demo/step13.jpg', at: beats.sorted},
];

const CAMERA: {at: number; rect: Rect}[] = [
  {at: beats.window, rect: FULL},
  {at: beats.matrix, rect: [330, 330, 1340, 652]},
  {at: beats.list, rect: [460, 140, 1060, 516]},
  {at: beats.sorted, rect: [1000, 40, 1000, 486]},
];

/** label: a short tag in screen space under the box, or docked to the bottom of the window with `dock`, for numbers too small to read in the screenshot. */
const MARKS: {rect: Rect; from: number; to?: number; label?: string; dock?: boolean}[] = [
  {rect: [10, 74, 530, 50], from: beats.title, to: beats.matrix},
  {rect: [998, 404, 314, 336], from: beats.columns, to: beats.list, label: 'AC, BC and CC products'},
  {rect: [654, 210, 676, 118], from: beats.total, to: beats.sorted},
  {rect: [1732, 46, 240, 924], from: beats.once, label: 'Sold once in 12 months', dock: true},
];

const view = (rect: Rect) => {
  const [x, y, w, h] = rect;
  const scale = Math.min(FRAME.w / w, FRAME.h / h);
  return {scale, x: FRAME.w / 2 - (x + w / 2) * scale, y: FRAME.h / 2 - (y + h / 2) * scale};
};

const camera = (frame: number) => {
  let cam = view(CAMERA[0].rect);
  for (const c of CAMERA.slice(1)) {
    const p = settle(frame, c.at, 30);
    if (p <= 0) break;
    const next = view(c.rect);
    cam = {scale: cam.scale + (next.scale - cam.scale) * p, x: cam.x + (next.x - cam.x) * p, y: cam.y + (next.y - cam.y) * p};
  }
  return cam;
};

export const Scene: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const cam = camera(frame);
  const appear = settle(frame, beats.window, 26);
  return (
    <AbsoluteFill style={{fontFamily: font}}>
      <div
        style={{
          position: 'absolute',
          left: FRAME.x,
          top: FRAME.y,
          width: FRAME.w,
          height: FRAME.h,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: color.cardWhite,
          boxShadow: shadow.lifted,
          opacity: interpolate(appear, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `translateY(${(1 - appear) * 26}px)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: SRC_W, height: SRC_H, transformOrigin: '0 0', transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`}}>
          {SHOTS.map((s, i) => {
            const next = SHOTS[i + 1];
            const shown = settle(frame, s.at, 14) * (next ? 1 - settle(frame, next.at, 14) : 1);
            return <Img key={s.src} src={staticFile(s.src)} style={{position: 'absolute', inset: 0, width: SRC_W, height: SRC_H, opacity: i === 0 ? (next ? 1 - settle(frame, next.at, 14) : 1) : shown}} />;
          })}
          {MARKS.map((m, i) => {
            const on = settle(frame, m.from, 14) * (m.to === undefined ? 1 : 1 - settle(frame, m.to, 12));
            if (on <= 0.001) return null;
            const [x, y, w, h] = m.rect;
            const pad = 6 / cam.scale;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - pad,
                  top: y - pad,
                  width: w + 2 * pad,
                  height: h + 2 * pad,
                  borderRadius: 10 / cam.scale,
                  border: `${4 / cam.scale}px solid ${color.tangerine}`,
                  background: 'rgba(255, 90, 0, 0.07)',
                  opacity: on,
                  transform: `scale(${1.04 - 0.04 * on})`,
                }}
              />
            );
          })}
        </div>
        {MARKS.map((m, i) => {
          if (!m.label) return null;
          const on = settle(frame, m.from + 4, 16) * (m.to === undefined ? 1 : 1 - settle(frame, m.to, 12));
          if (on <= 0.001) return null;
          const [x, y, w, h] = m.rect;
          const cx = Math.min(FRAME.w - 280, Math.max(280, (x + w / 2) * cam.scale + cam.x));
          const bottom = (y + h) * cam.scale + cam.y;
          const top = Math.min(FRAME.h - 90, bottom + 18);
          return (
            <div key={`label-${i}`} style={{position: 'absolute', left: cx, top: m.dock ? FRAME.h - 100 : top, transform: `translate(-50%, ${(1 - on) * 10}px)`, opacity: on, padding: '12px 26px', borderRadius: radius.md, background: color.tangerine, color: color.cardWhite, fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: shadow.ambient}}>
              {m.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
