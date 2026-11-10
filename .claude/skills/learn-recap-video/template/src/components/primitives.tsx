import React from 'react';
import {Img, staticFile} from 'remotion';
import {color, font, radius, shadow} from '../theme';

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      position: 'absolute',
      background: color.cardWhite,
      borderRadius: radius.lg,
      boxShadow: shadow.ambient,
      fontFamily: font,
      color: color.forestGreen,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Isometric product cube, the same shape as the 80:20 course artwork. */
export const Cube: React.FC<{size: number; stroke?: string; fill?: string; style?: React.CSSProperties}> = ({
  size,
  stroke = color.forestGreen,
  fill = color.artworkPanel,
  style,
}) => {
  const r = 46;
  const c = 0.866 * r;
  const h = r / 2;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={style}>
      <path
        d={`M0 ${-r} L${c} ${-h} L${c} ${h} L0 ${r} L${-c} ${h} L${-c} ${-h} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M${-c} ${-h} L0 0 L${c} ${-h} M0 0 L0 ${r}`} fill="none" stroke={stroke} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** Dashed line that draws from (x1, y1) towards (x2, y2) as progress goes 0 to 1. */
export const DashedArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  stroke?: string;
  width?: number;
  head?: boolean;
}> = ({x1, y1, x2, y2, progress, stroke = 'rgba(48, 70, 66, 0.55)', width = 3, head = true}) => {
  if (progress <= 0) return null;
  const x = x1 + (x2 - x1) * progress;
  const y = y1 + (y2 - y1) * progress;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 14;
  const wing = (offset: number) =>
    `${x - size * Math.cos(angle + offset)} ${y - size * Math.sin(angle + offset)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={stroke} strokeWidth={width} strokeDasharray="9 8" strokeLinecap="round" />
      {head ? (
        <path
          d={`M${wing(0.6)} L${x} ${y} L${wing(-0.6)}`}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={Math.min(1, Math.max(0, (progress - 0.85) / 0.15))}
        />
      ) : null}
    </g>
  );
};

export const Bubble: React.FC<{x: number; y: number; text: string; anchor?: 'left' | 'center' | 'right'; style?: React.CSSProperties}> = ({
  x,
  y,
  text,
  anchor = 'center',
  style,
}) => {
  const shift = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${shift}, -50%)`,
      }}
    >
      <div
        style={{
          ...style,
          background: color.cardWhite,
          borderRadius: radius.md,
          boxShadow: shadow.ambient,
          padding: '12px 22px',
          fontFamily: font,
          fontSize: 28,
          color: color.forestGreen,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const FullSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

/**
 * Course illustration cropped into public/images. Its ground is the course
 * panel colour, so it sits on an artworkPanel card without a visible edge.
 */
export const Art: React.FC<{src: string; width: number; height: number; style?: React.CSSProperties}> = ({src, width, height, style}) => (
  <div style={{width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}}>
    <Img src={staticFile(src)} style={{maxWidth: width, maxHeight: height, objectFit: 'contain', display: 'block'}} />
  </div>
);
