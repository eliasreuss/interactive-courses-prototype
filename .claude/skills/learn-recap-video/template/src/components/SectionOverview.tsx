// The teaching sections as cards, used as the agenda up front and again as the
// process in the final recap. Each card carries a small sketch of its section,
// drawn in src/minis.tsx.
import React from 'react';
import {interpolate} from 'remotion';
import {minis} from '../minis';
import {enter, settle} from '../motion';
import {color, font, radius, shadow} from '../theme';
import {contentSections, keepAcronyms, sections} from '../timeline';
import {Badge} from './SectionHeader';

const N = contentSections.length;
const GAP = N > 3 ? 60 : 70;
/** Half width of the chevron between cards, smaller when the gaps are narrow. */
const CHEVRON = N > 3 ? 6 : 9;
const CARD_W = N > 3 ? Math.floor((1680 - (N - 1) * GAP) / N) : 500;
const CARD_H = 430;
const X0 = (1920 - (N * CARD_W + (N - 1) * GAP)) / 2;
const TITLE_SIZE = N > 3 ? 30 : 36;
/** Sketches are drawn for a 420px wide area and scaled to fit narrower cards. */
const MINI_SCALE = Math.min(1, (CARD_W - 80) / 420);

export const SectionOverview: React.FC<{frame: number; appearAt: number; focusAt?: number[]; y?: number; stagger?: number}> = ({frame, appearAt, focusAt, y = 330, stagger = 9}) => (
  <>
    {contentSections.map((s, i) => {
      const x = X0 + i * (CARD_W + GAP);
      let lift = 0;
      let dim = 1;
      if (focusAt) {
        // Sections without a step line of their own stay dimmed.
        const end = focusAt[i + 1];
        const reached = focusAt[i] === undefined ? 0 : settle(frame, focusAt[i], 16);
        const any = settle(frame, focusAt[0], 16);
        lift = reached - (end === undefined ? 0 : settle(frame, end, 16));
        dim = 1 - 0.55 * any * (1 - reached);
      }
      return (
        <React.Fragment key={s}>
          <div
            style={{
              position: 'absolute',
              left: x,
              top: y - lift * 10,
              width: CARD_W,
              height: CARD_H,
              ...enter(frame, appearAt + i * stagger, 28),
            }}
          >
            <div style={{position: 'absolute', inset: 0, borderRadius: radius.lg, background: color.cardWhite, boxShadow: shadow.ambient}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: radius.lg, boxShadow: shadow.lifted, opacity: lift}} />
            <div style={{position: 'absolute', inset: 0, padding: 40, opacity: dim, fontFamily: font, color: color.forestGreen}}>
              <Badge section={s} size={56} />
              <div style={{fontSize: TITLE_SIZE, fontWeight: 700, lineHeight: 1.25, marginTop: 24, height: 90, textWrap: 'balance'}}>{keepAcronyms(sections[s].title)}</div>
              <div style={{position: 'absolute', left: 40, right: 40, bottom: 40, height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                <div style={{transform: `scale(${MINI_SCALE})`, transformOrigin: 'center bottom'}}>{minis[s] ?? null}</div>
              </div>
            </div>
          </div>
          {i < N - 1 ? (
            <svg
              width={GAP}
              height={60}
              viewBox={`0 0 ${GAP} 60`}
              style={{position: 'absolute', left: x + CARD_W, top: y + CARD_H / 2 - 30, opacity: interpolate(settle(frame, appearAt + i * stagger + 8, 20), [0, 1], [0, 1])}}
            >
              <path d={`M${GAP / 2 - CHEVRON} 18 L${GAP / 2 + CHEVRON} 30 L${GAP / 2 - CHEVRON} 42`} fill="none" stroke={color.mutedSage} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </React.Fragment>
      );
    })}
  </>
);
