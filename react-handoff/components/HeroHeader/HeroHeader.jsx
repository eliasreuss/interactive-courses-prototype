/*
 * ============================================
 *  HeroHeader — Dark hero card at top of the hub
 * ============================================
 *
 *  Props:
 *    courses          — array of course objects (from data/courses.js)
 *    totalProgress    — number 0-100  (overall learning-path completion %)
 *    nextCourseFile   — string, the `file` field of the next course to take
 *    ctaLabel         — "Start" | "Continue" | "Review"
 *
 *  Structure:
 *    ┌──────────────────────────────────────────────┐
 *    │  [Learning Path] [6 resources] [1.1 hours]   │
 *    │                                              │
 *    │  Inact for Inventory Management              │
 *    │  Learn the core principles...                │
 *    │                                              │
 *    │  [Start ▸]  [🔖]  [📤]                      │
 *    │                             (graphs image)   │
 *    │  ╔══════ progress bar ═══════╗               │
 *    └──────────────────────────────────────────────┘
 *
 *  Assets needed:
 *    - assets/svgs/Learning-Path.svg
 *    - assets/svgs/Bookmark.svg
 *    - assets/svgs/Share.svg
 *    - assets/svgs/ButtonArrow.svg
 *    - assets/images/BottomRightGraphs.png
 */

import React, { useEffect, useRef } from 'react';
import './HeroHeader.css';

/* ── Asset imports (adjust paths to match your project) ── */
import LearningPathIcon from '../../assets/svgs/Learning-Path.svg';
import BookmarkIcon from '../../assets/svgs/Bookmark.svg';
import ShareIcon from '../../assets/svgs/Share.svg';
// ButtonArrow is used via CSS mask-image (see HeroHeader.css)
import BottomRightGraphs from '../../assets/images/BottomRightGraphs.png';

export default function HeroHeader({
  courses = [],
  totalProgress = 0,
  nextCourseFile = '',
  ctaLabel = 'Start',
}) {
  const progressLabelRef = useRef(null);
  const pct = Math.max(0, Math.min(100, Math.round(totalProgress)));

  /* Animate progress label position */
  useEffect(() => {
    if (progressLabelRef.current) {
      progressLabelRef.current.style.left = `${pct}%`;
      progressLabelRef.current.style.opacity = '1';
    }
  }, [pct]);

  /* Derived data */
  const resourceCount = courses.length;
  const totalMinutes = courses.reduce((sum, c) => {
    const m = String(c.duration || '').match(/(\d+)\s*min/i);
    return sum + (m ? parseInt(m[1], 10) : 0);
  }, 0);
  const totalTimeLabel =
    totalMinutes < 60
      ? `${totalMinutes} min`
      : `${(totalMinutes / 60).toFixed(1)} hours`;

  const courseUrl = nextCourseFile
    ? `/course?course=${nextCourseFile}&from=hub`
    : '#';

  return (
    <section className="hero-header">
      {/* ── Content column ── */}
      <div className="hero-content">
        {/* Tags */}
        <div className="hero-tags">
          <div className="hero-tag glass hero-tag--primary">
            <img
              className="hero-tag__icon"
              src={LearningPathIcon}
              alt=""
              aria-hidden="true"
            />
            <span>Learning Path</span>
          </div>
          <div className="hero-tag glass">{resourceCount} resources</div>
          <div className="hero-tag glass">{totalTimeLabel}</div>
        </div>

        {/* Title & description */}
        <div className="hero-text">
          <h1 className="hero-title">Inact for Inventory Management</h1>
          <p className="hero-description">
            Learn the core principles and practical tools of effective inventory
            management with Inact Now, and apply them in your daily operations.
          </p>
        </div>

        {/* Action buttons */}
        <div className="hero-actions">
          <a href={courseUrl} className="btn-start">
            <span className="btn-start__label">{ctaLabel}</span>
            {/* Arrow is rendered via CSS mask-image for color tinting */}
            <span className="btn-start__arrow" aria-hidden="true" />
          </a>
          <button className="btn-icon" aria-label="Bookmark">
            <img
              className="btn-icon__img"
              src={BookmarkIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
          <button className="btn-icon" aria-label="Share">
            <img
              className="btn-icon__img"
              src={ShareIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* ── Bottom-right decorative image ── */}
      <img
        className="hero-graphs"
        src={BottomRightGraphs}
        alt=""
        aria-hidden="true"
      />

      {/* ── Progress bar at bottom edge ── */}
      <div className="hero-progress">
        <div className="hero-progress__track">
          <div
            className="hero-progress__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className="hero-progress__label"
          ref={progressLabelRef}
          style={{
            left: `${pct}%`,
            opacity: 1,
          }}
        >
          {pct}%
        </span>
      </div>
    </section>
  );
}

