// The KPI Benchmark Insight as a drill down: portfolio, then categories, then
// individual products. The bars are sketches of the view, not data.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beats} from '../beats';
import {Card, Cube} from '../components/primitives';
import {enter, settle} from '../motion';
import {color, font, labelStyle} from '../theme';

const CARD_W = 470;
const CARD_H = 420;
const GAP = 90;
const ROW_Y = 400;
const X0 = (1920 - (3 * CARD_W + 2 * GAP)) / 2;

const Bar: React.FC<{w: number; grow: number; tone?: string}> = ({w, grow, tone = color.forestGreen}) => (
  <div style={{height: 22, borderRadius: 6, background: color.progressGray, overflow: 'hidden'}}>
    <div style={{width: `${w * grow}%`, height: '100%', borderRadius: 6, background: tone}} />
  </div>
);

export const KpiBenchmark: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats.kpiBenchmark;
  const cards = [
    {label: 'Portfolio', at: b.portfolio},
    {label: 'Categories', at: b.categories},
    {label: 'Products', at: b.products},
  ];
  const growPortfolio = settle(frame, b.portfolioBars, 30);
  const growCategories = (i: number) => settle(frame, b.categories + 6 + i * 3, 26);
  const growProducts = (i: number) => settle(frame, b.products + 6 + i * 3, 26);

  const bodies = [
    <div key="p" style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 190}}>
      {[0.55, 0.7, 0.62, 0.8, 0.74, 0.9, 1].map((h, i) => (
        <div key={i} style={{flex: 1, height: 190 * h * growPortfolio, borderRadius: 6, background: color.forestGreen}} />
      ))}
    </div>,
    <div key="c" style={{display: 'flex', flexDirection: 'column', gap: 26}}>
      {[92, 70, 54, 36].map((w, i) => (
        <Bar key={i} w={w} grow={growCategories(i)} tone={i === 1 ? color.forestGreen : color.mutedSage} />
      ))}
    </div>,
    <div key="pr" style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      {[80, 62, 48, 30].map((w, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Cube size={34} fill={color.cardWhite} />
          <div style={{flex: 1}}>
            <Bar w={w} grow={growProducts(i)} tone={color.mutedSage} />
          </div>
        </div>
      ))}
    </div>,
  ];

  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', ...enter(frame, b.title, 20)}}>
        <div style={labelStyle}>Insight</div>
        <div style={{fontSize: 64, fontWeight: 700, marginTop: 10}}>KPI Benchmark</div>
      </div>
      {cards.map((c, i) => {
        const x = X0 + i * (CARD_W + GAP);
        return (
          <React.Fragment key={c.label}>
            <Card style={{left: x, top: ROW_Y, width: CARD_W, height: CARD_H, padding: 44, boxSizing: 'border-box', ...enter(frame, c.at, 26)}}>
              <div style={{fontSize: 40, fontWeight: 600, marginBottom: 36}}>{c.label}</div>
              {bodies[i]}
            </Card>
            {i > 0 ? (
              <svg width={GAP} height={60} viewBox={`0 0 ${GAP} 60`} style={{position: 'absolute', left: x - GAP, top: ROW_Y + CARD_H / 2 - 30, ...enter(frame, c.at - 4, 0, 18)}}>
                <path d={`M${GAP / 2 - 9} 18 L${GAP / 2 + 9} 30 L${GAP / 2 - 9} 42`} fill="none" stroke={color.mutedSage} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
