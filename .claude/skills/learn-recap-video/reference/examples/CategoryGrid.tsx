// The four category tiles and the revenue / margin axes. Several scenes share
// this so the tiles stay in the same place across cuts.
import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {category, CategoryKey, color, font, radius, shadow} from '../theme';
import {DashedArrow, FullSvg} from './primitives';

type Rect = {x: number; y: number; w: number; h: number};

const WIDE = {cols: [480, 1148], rows: [240, 590], w: 620, h: 310};
const NARROW = {cols: [480, 1220], rows: [240, 620], w: 420, h: 280};

const cell: Record<CategoryKey, [number, number]> = {
  protect: [0, 0],
  develop: [1, 0],
  grow: [0, 1],
  turnaround: [1, 1],
};

/** Tile rectangle. `narrow` morphs from the 2x2 grid to the spread layout used for the move arrows. */
export const tileRect = (k: CategoryKey, narrow = 0): Rect => {
  const [c, r] = cell[k];
  const lerp = (a: number, b: number) => a + (b - a) * narrow;
  return {
    x: lerp(WIDE.cols[c], NARROW.cols[c]),
    y: lerp(WIDE.rows[r], NARROW.rows[r]),
    w: lerp(WIDE.w, NARROW.w),
    h: lerp(WIDE.h, NARROW.h),
  };
};

export const descriptor: Record<CategoryKey, string> = {
  protect: 'High revenue, high margin',
  develop: 'High revenue, lower margin',
  grow: 'Lower revenue, high margin',
  turnaround: 'Lower revenue, lower margin',
};

export const goal: Record<CategoryKey, string> = {
  protect: 'Keep strong products strong.',
  develop: 'Improve the margin.',
  grow: 'Increase revenue.',
  turnaround: 'Improve it or reconsider it.',
};

export const actions: Record<CategoryKey, string[]> = {
  protect: ['Maintain high availability', 'Strengthen supplier relationships', 'Protect strong margins'],
  develop: ['Negotiate better terms', 'Adjust pricing', 'Reduce costs'],
  grow: ['Increase commercial focus', 'Create more demand', 'Work with suppliers for growth'],
  turnaround: ['Raise prices where possible', 'Reduce costs', 'Phase out weak products'],
};

export type TileProps = {
  k: CategoryKey;
  narrow?: number;
  /** 0 to 1, card surface visible */
  appear: number;
  /** 0 to 1, title, inline icon and colour bar */
  heading: number;
  /** show the small icon next to the title */
  inlineIcon?: number;
  /** 0 to 1, raised with the lifted shadow */
  lift?: number;
  /** multiplies the opacity of the tile contents, used to dim tiles out of focus */
  dim?: number;
  /** 0 to 1, shrinks the tile down to its title and bar, like a label */
  collapse?: number;
  children?: React.ReactNode;
};

export const CategoryTile: React.FC<TileProps> = ({k, narrow = 0, appear, heading, inlineIcon = 1, lift = 0, dim = 1, collapse = 0, children}) => {
  const r = tileRect(k, narrow);
  const c = category[k];
  const titleSize = interpolate(narrow, [0, 1], [50, 40]);
  const barTop = interpolate(narrow, [0, 1], [118, 96]);
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y - lift * 8,
        width: r.w,
        height: r.h - (r.h - 160) * collapse,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 20}px)`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, borderRadius: radius.lg, background: color.cardWhite, boxShadow: shadow.ambient}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: radius.lg, boxShadow: shadow.lifted, opacity: lift}} />
      <div style={{position: 'absolute', inset: 0, opacity: dim, fontFamily: font, color: color.forestGreen}}>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16 * inlineIcon,
            opacity: heading,
            transform: `translateY(${(1 - heading) * 12}px)`,
          }}
        >
          <span style={{fontSize: titleSize, fontWeight: 700, lineHeight: 1.2}}>{c.name}</span>
          {inlineIcon > 0 ? (
            <Img src={staticFile(c.icon)} style={{width: 54 * inlineIcon, height: 54, opacity: inlineIcon, objectFit: 'contain'}} />
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: barTop,
            left: '15%',
            width: '70%',
            height: 8,
            borderRadius: 4,
            background: c.bar,
            transform: `scaleX(${heading})`,
          }}
        />
        <div style={{position: 'absolute', top: barTop + 26, left: 24, right: 24, bottom: 20, opacity: 1 - collapse}}>{children}</div>
      </div>
    </div>
  );
};

export const TileText: React.FC<{text: string; size: number; weight: number; style?: React.CSSProperties}> = ({text, size, weight, style}) => (
  <div style={{fontSize: size, fontWeight: weight, lineHeight: 1.35, textAlign: 'center', ...style}}>{text}</div>
);

const axisLabel: React.CSSProperties = {
  position: 'absolute',
  fontFamily: font,
  fontSize: 30,
  fontWeight: 400,
  color: color.forestGreen,
  whiteSpace: 'nowrap',
};

/** Revenue runs down the left side, margin across the top, as in the course artwork. */
export const Axes: React.FC<{revenue: number; margin: number}> = ({revenue, margin}) => (
  <>
    <FullSvg>
      <DashedArrow x1={430} y1={244} x2={430} y2={900} progress={revenue} stroke="rgba(48, 70, 66, 0.3)" width={2.5} />
      <DashedArrow x1={480} y1={196} x2={1768} y2={196} progress={margin} stroke="rgba(48, 70, 66, 0.3)" width={2.5} />
    </FullSvg>
    <div style={{...axisLabel, right: 1920 - 400, top: 236, opacity: revenue}}>High revenue</div>
    <div style={{...axisLabel, right: 1920 - 400, top: 858, opacity: interpolate(revenue, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'})}}>
      Low revenue
    </div>
    <div style={{...axisLabel, left: 480, top: 132, opacity: margin}}>High margin</div>
    <div style={{...axisLabel, right: 1920 - 1768, top: 132, opacity: interpolate(margin, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'})}}>
      Low margin
    </div>
  </>
);
