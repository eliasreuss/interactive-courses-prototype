// Cost to serve: buy for 100, sell for 150, then the costs of serving take 50 down to 20.
// Labels on the chips use the course wording.
// Same idea as the Profit-Margin-Breakdown.mp4 clip, rebuilt so each cost lands on its word.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {beats} from '../beats';
import {Icon} from '../components/icons';
import {Card} from '../components/primitives';
import {enter, settle, tween} from '../motion';
import {color, font, labelStyle} from '../theme';

const MINUS = '−';

const COSTS = [
  {key: 'freight', amount: 10, label: 'Freight in', icon: 'truck'},
  {key: 'receiving', amount: 5, label: 'Receiving and shelving', icon: 'shelf'},
  {key: 'bonus', amount: 10, label: 'Salesperson bonus', icon: 'person'},
  {key: 'sending', amount: 5, label: 'Sending it out', icon: 'box'},
] as const;

const CHIP_W = 340;
const CHIP_GAP = 24;
const CHIPS_X = (1920 - (4 * CHIP_W + 3 * CHIP_GAP)) / 2;

export const CostToServe: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats.costToServe;
  const move = settle(frame, b.buy - 12, 28);
  const value = Math.round(COSTS.reduce((v, c) => v - tween(frame, b[c.key], 0, c.amount, 16), 50));
  const struck = settle(frame, b.thought + 6, 18);

  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          top: interpolate(move, [0, 1], [450, 160]),
          fontSize: interpolate(move, [0, 1], [104, 46]),
          fontWeight: 700,
          lineHeight: 1.2,
          ...enter(frame, b.title, 24),
        }}
      >
        Cost to Serve
      </div>

      {[
        {label: 'Buy', value: 100, at: b.buy, x: 640},
        {label: 'Sell', value: 150, at: b.sell, x: 980},
      ].map((c) => (
        <Card key={c.label} style={{left: c.x, top: 262, width: 300, height: 150, textAlign: 'center', ...enter(frame, c.at, 18)}}>
          <div style={{...labelStyle, marginTop: 26}}>{c.label}</div>
          <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 4}}>{c.value}</div>
        </Card>
      ))}

      <div style={{position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center', fontSize: 260, fontWeight: 700, lineHeight: 1, ...enter(frame, b.fifty, 30, 26)}}>
        {value}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 960 - 130,
          top: 728,
          width: 260,
          height: 10,
          borderRadius: 5,
          background: color.forestGreen,
          transform: `scaleX(${settle(frame, b.twenty, 22)})`,
        }}
      />

      <div style={{position: 'absolute', left: 470, top: 530, fontSize: 120, fontWeight: 600, color: color.mutedSage, lineHeight: 1, ...enter(frame, b.thought, 16)}}>
        50
        <div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 8, borderRadius: 4, background: color.mutedSage, transform: `scaleX(${struck})`, transformOrigin: 'left'}} />
      </div>

      {COSTS.map((c, i) => (
        <Card
          key={c.key}
          style={{
            left: CHIPS_X + i * (CHIP_W + CHIP_GAP),
            top: 800,
            width: CHIP_W,
            height: 140,
            borderRadius: 14,
            ...enter(frame, b[c.key], 20),
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20}}>
            <div style={{width: 52, height: 52, borderRadius: 26, background: color.tagGray, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name={c.icon} size={28} />
            </div>
            <span style={{fontSize: 44, fontWeight: 700}}>
              {MINUS}
              {c.amount}
            </span>
          </div>
          <div style={{textAlign: 'center', fontSize: 25, color: color.mutedSage, marginTop: 8}}>{c.label}</div>
        </Card>
      ))}
    </AbsoluteFill>
  );
};
