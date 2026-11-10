// Section system. Each section title starts large on its title card, then
// shrinks into the header where it stays until the next section begins.
// The segmented bar on the right is the course player progress bar, one
// segment per section: done is forest green, current is tangerine.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {settle} from '../motion';
import {color, font} from '../theme';
import {card, cards, Section, sectionOrder, sections, TOTAL_FRAMES} from '../timeline';

export const CARD_TITLE = {x: 160, y: 468, badge: 104, size: 64, gap: 32};
const HEADER = {x: 120, y: 44, scale: 0.36};

export const Badge: React.FC<{section: Section; size: number; fill?: string}> = ({section, size, fill = color.forestGreen}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: fill,
      color: color.cardWhite,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: font,
      fontWeight: 700,
      fontSize: size * 0.5,
      flexShrink: 0,
    }}
  >
    {section === 'recap' ? (
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={color.cardWhite} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    ) : (
      sections[section].number
    )}
  </div>
);

const SectionTitle: React.FC<{section: Section; frame: number}> = ({section, frame}) => {
  const c = card(section);
  const idx = sectionOrder.indexOf(section);
  const next = sectionOrder[idx + 1];
  const appear = settle(frame, c.from + 2, 20);
  const move = settle(frame, c.to - 12, 28);
  const leave = next ? settle(frame, card(next).from - 2, 12) : 0;
  if (frame < c.from) return null;
  const x = interpolate(move, [0, 1], [CARD_TITLE.x, HEADER.x]);
  const y = interpolate(move, [0, 1], [CARD_TITLE.y, HEADER.y]) + (1 - appear) * 30;
  const scale = interpolate(move, [0, 1], [1, HEADER.scale]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: 'left top',
        opacity: appear * (1 - leave),
        display: 'flex',
        alignItems: 'center',
        gap: CARD_TITLE.gap,
        whiteSpace: 'nowrap',
      }}
    >
      <Badge section={section} size={CARD_TITLE.badge} />
      <span style={{fontFamily: font, fontWeight: 700, fontSize: CARD_TITLE.size, color: color.forestGreen, lineHeight: 1}}>{sections[section].title}</span>
    </div>
  );
};

export const SectionHeader: React.FC = () => {
  const frame = useCurrentFrame();
  if (cards.length === 0) return null;
  const end = interpolate(frame, [TOTAL_FRAMES - 20, TOTAL_FRAMES - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const barsIn = settle(frame, cards[0].to - 6, 24);
  const current = [...cards].reverse().find((c) => frame >= c.from)?.section ?? null;
  const active = current ? sectionOrder.indexOf(current) : -1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: end}}>
      {cards.map((c) => (
        <SectionTitle key={c.section} section={c.section} frame={frame} />
      ))}
      <div style={{position: 'absolute', right: 120, top: 61, display: 'flex', gap: 8, opacity: barsIn}}>
        {sectionOrder.map((s, i) => {
          const fill = i < active ? color.forestGreen : i === active ? color.tangerine : color.progressGray;
          return <div key={s} style={{width: 88, height: 6, borderRadius: 3, background: fill}} />;
        })}
      </div>
    </div>
  );
};
