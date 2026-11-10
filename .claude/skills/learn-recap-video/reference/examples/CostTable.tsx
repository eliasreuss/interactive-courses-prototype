// Rebuild of Direct-Costs.png and Indirect-Costs.png, row by row.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beats} from '../beats';
import {enter, enterExit, settle} from '../motion';
import {color, font, labelStyle, radius, shadow} from '../theme';

const M = '−';
const ROW_H = 52;
const GROUP_GAP = 14;
const TABLE_X = 150;
const TABLE_W = 900;
const TABLE_Y = 150;

type Row = {label: string; value: string; at: number; total?: boolean; highlight?: number};

export const CostTable: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats.costTable;

  const groups: Row[][] = [
    [
      {label: 'Revenue', value: '111.131', at: b.base},
      {label: 'Cost of Goods Sold', value: `${M}33.084`, at: b.base + 3, highlight: b.goods},
    ],
    [{label: 'Gross Profit I', value: '78.047', at: b.base + 6, total: true, highlight: b.looked}],
    [
      {label: 'Shipping Cost', value: `${M}6.650`, at: b.freight},
      {label: 'Discounts', value: `${M}4.450`, at: b.discounts},
      {label: 'Total direct costs', value: `${M}11.100`, at: b.discounts + 4},
    ],
    [{label: 'Gross Profit II', value: '66.947', at: b.discounts + 8, total: true}],
    [
      {label: 'Customer Service', value: `${M}17.750`, at: b.service},
      {label: 'Order Handling', value: `${M}8.400`, at: b.handling},
      {label: 'Logistics', value: `${M}2.300`, at: b.logistics},
      {label: 'Total cost to serve', value: `${M}28.450`, at: b.total},
    ],
    [{label: 'Net Profit', value: '38.497', at: b.total + 5, total: true, highlight: b.different}],
  ];

  let y = TABLE_Y;
  const blocks = groups.map((rows, gi) => {
    const top = y;
    const height = rows.length * ROW_H;
    y += height + GROUP_GAP;
    const isTotal = rows[0].total;
    const appear = enter(frame, rows[0].at, 14, 20);
    return (
      <div key={gi} style={{position: 'absolute', left: TABLE_X, top, width: TABLE_W, height, ...appear}}>
        {isTotal ? (
          <div style={{position: 'absolute', left: 6, right: 6, top: -GROUP_GAP / 2 - 1, height: 3, background: color.forestGreen, borderRadius: 2}} />
        ) : (
          <div style={{position: 'absolute', inset: 0, background: color.cardWhite, borderRadius: radius.md, boxShadow: shadow.ambient}} />
        )}
        {rows.map((r, ri) => {
          const rowStyle = enter(frame, r.at, 10, 18);
          const hl = r.highlight === undefined ? 0 : settle(frame, r.highlight, 14);
          return (
            <div
              key={r.label}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: ri * ROW_H,
                height: ROW_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                fontSize: 26,
                fontWeight: isTotal ? 700 : 400,
                borderTop: ri > 0 ? `2px solid ${color.rowDivider}` : 'none',
                ...rowStyle,
              }}
            >
              <div style={{position: 'absolute', inset: 4, borderRadius: radius.sm, background: 'rgba(48, 70, 66, 0.08)', opacity: hl}} />
              <span style={{position: 'relative'}}>{r.label}</span>
              <span style={{position: 'relative', fontVariantNumeric: 'tabular-nums'}}>{r.value}</span>
            </div>
          );
        })}
      </div>
    );
  });

  const side = (title: string, sub: string, start: number, end: number) => (
    <div style={{position: 'absolute', left: 1180, top: 330, width: 620, ...enterExit(frame, start, end)}}>
      <div style={labelStyle}>Product Profitability</div>
      <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.15, marginTop: 12}}>{title}</div>
      <div style={{fontSize: 34, color: color.mutedSage, marginTop: 14}}>{sub}</div>
    </div>
  );

  const struck = settle(frame, b.looked + 14, 18);

  return (
    <AbsoluteFill style={{fontFamily: font, color: color.forestGreen}}>
      {blocks}
      {side('Direct costs', 'Already in your data', b.direct, b.indirect - 6)}
      {side('Indirect costs', 'Harder to get hold of', b.indirect, b.looked - 8)}
      <div style={{position: 'absolute', left: 1180, top: 300, width: 620}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 96, fontWeight: 600, color: color.mutedSage, lineHeight: 1.1, ...enter(frame, b.looked, 20)}}>
          78.000
          <div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 7, borderRadius: 4, background: color.mutedSage, transform: `scaleX(${struck})`, transformOrigin: 'left'}} />
        </div>
        <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1.1, marginTop: 20, ...enter(frame, b.different, 24)}}>38.500</div>
      </div>
    </AbsoluteFill>
  );
};
