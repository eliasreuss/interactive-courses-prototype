// Each tile gets its position on the axes, the four categories assemble, then
// each one is called out with its goal.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beats} from '../beats';
import {Axes, CategoryTile, descriptor, goal, TileText} from '../components/CategoryGrid';
import {enter, settle} from '../motion';
import {categoryOrder} from '../theme';

export const FourCategories: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame() + offset;
  const b = beats.fourCategories;
  const focusStarts = categoryOrder.map((k) => b.focus[k]);
  const anyFocus = settle(frame, focusStarts[0], 16) - settle(frame, b.release, 20);
  return (
    <AbsoluteFill>
      <Axes revenue={1} margin={1} />
      {categoryOrder.map((k, i) => {
        const end = i < 3 ? focusStarts[i + 1] : b.release;
        const active = settle(frame, focusStarts[i], 16) - settle(frame, end, 16);
        const dim = 1 - 0.6 * Math.max(0, anyFocus - active);
        return (
          <CategoryTile key={k} k={k} appear={1} heading={settle(frame, b.assemble + i * 5, 26)} lift={active} dim={dim}>
            <div style={enter(frame, b.descriptors + i * 4, 14)}>
              <TileText text={descriptor[k]} size={32} weight={600} />
            </div>
            <div style={enter(frame, b.goal[k], 14)}>
              <TileText text={goal[k]} size={32} weight={400} style={{marginTop: 10}} />
            </div>
          </CategoryTile>
        );
      })}
    </AbsoluteFill>
  );
};
