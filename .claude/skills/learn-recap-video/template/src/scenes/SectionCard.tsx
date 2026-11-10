// Title card at the start of each section. The title itself is drawn by
// SectionHeader so it can travel into the header. This card adds the label,
// a large ghost numeral and the track of all sections.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CARD_TITLE} from '../components/SectionHeader';
import {enter, settle} from '../motion';
import {color, font, labelStyle} from '../theme';
import {card, config, contentSections, keepAcronyms, Section, sectionOrder, sections} from '../timeline';

const TRACK_X = 160;
const TRACK_Y = 742;
const STEP_GAP = 24;
// The track runs from x 160 to 1800, lining up with the ghost numeral and the progress bar.
const STEP_W = Math.min(380, Math.floor((1640 - (sectionOrder.length - 1) * STEP_GAP) / sectionOrder.length));

export const SectionCard: React.FC<{offset: number; section: Section}> = ({offset, section}) => {
  const frame = useCurrentFrame() + offset;
  const c = card(section);
  const idx = sectionOrder.indexOf(section);
  const ghost = settle(frame, c.from, 32);
  const label = section === 'recap' ? config.title : `${config.unit} ${sections[section].number} of ${contentSections.length}`;
  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      <div
        style={{
          position: 'absolute',
          right: 110,
          top: 80,
          fontSize: 480,
          fontWeight: 700,
          lineHeight: 1,
          color: color.forestGreen,
          opacity: 0.05 * ghost,
          transform: `translateY(${(1 - ghost) * 40}px)`,
        }}
      >
        {section === 'recap' ? (
          <svg width={380} height={420} viewBox="0 0 24 24" fill="none" stroke={color.forestGreen} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        ) : (
          sections[section].number
        )}
      </div>
      <div style={{...labelStyle, fontSize: 26, letterSpacing: 2.6, position: 'absolute', left: CARD_TITLE.x, top: CARD_TITLE.y - 70, ...enter(frame, c.from + 12, 16)}}>
        {label}
      </div>
      {sectionOrder.map((s, i) => {
        const state = i < idx ? 'done' : i === idx ? 'current' : 'next';
        const bar = state === 'done' ? color.forestGreen : state === 'current' ? color.tangerine : color.progressGray;
        return (
          <div
            key={s}
            style={{
              position: 'absolute',
              left: TRACK_X + i * (STEP_W + STEP_GAP),
              top: TRACK_Y,
              width: STEP_W,
              ...enter(frame, c.from + 6 + i * 3, 14, 18),
            }}
          >
            <div style={{height: 6, borderRadius: 3, background: bar}} />
            <div
              style={{
                marginTop: 18,
                fontSize: 24,
                lineHeight: 1.35,
                textWrap: 'balance',
                fontWeight: state === 'current' ? 600 : 400,
                color: state === 'current' ? color.forestGreen : color.mutedSage,
              }}
            >
              {keepAcronyms(sections[s].title)}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
