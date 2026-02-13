/*
 * ============================================
 *  CourseCard — Individual course card
 * ============================================
 *
 *  Props:
 *    course       — object from data/courses.js
 *    index        — number (0-based position, used for gradient direction)
 *    progress     — number 0-100
 *    completed    — boolean
 *    isNext       — boolean, true if this is the next course the user should take
 *    onClick      — () => void (called when card is clicked)
 *
 *  Layout:
 *    ┌────────────────────────┐
 *    │   [thumbnail image]    │
 *    │    ⏱ 8 min    🎓      │
 *    ├────────────────────────┤  ← progress bar
 *    │  Title                 │
 *    │  Description...        │
 *    │              Start ↗   │
 *    └────────────────────────┘
 *
 *  Assets needed:
 *    - assets/svgs/Course-Icon.svg
 *    - assets/svgs/Up-Arrow.svg
 *    - Thumbnail images from assets/images/Course-thumbnails/
 */

import React from 'react';
import './CourseCard.css';

import CourseIcon from '../../assets/svgs/Course-Icon.svg';
import UpArrow from '../../assets/svgs/Up-Arrow.svg';

/* Gradient directions per card position */
const GRAD_DIRS = ['135deg', '200deg', '310deg', '60deg', '250deg', '170deg'];

export default function CourseCard({
  course,
  index = 0,
  progress = 0,
  completed = false,
  isNext = false,
  onClick,
}) {
  const gradDir = GRAD_DIRS[index % GRAD_DIRS.length];

  /* CTA label logic */
  const ctaText = completed
    ? 'Review course'
    : progress > 0
    ? 'Continue course'
    : 'Start course';

  /* Progress bar */
  const pct = completed ? 100 : progress;
  const barCompleted = completed;

  /* Build class list */
  const cardClasses = [
    'course-card',
    isNext && 'course-card--next',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* ── Thumbnail area ── */}
      <div
        className="course-card__top"
        style={{ '--grad-dir': gradDir }}
      >
        <img
          className="course-card__thumb"
          src={course.thumbnail}
          alt=""
          aria-hidden="true"
        />
        <div className="course-card__duration glass glass--dark">
          <span>{course.duration}</span>
        </div>
        <div className="course-card__icon glass glass--dark">
          <img src={CourseIcon} alt="" aria-hidden="true" />
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className={`course-card__progress ${barCompleted ? 'course-card__progress--completed' : ''}`}>
        <div
          className="course-card__progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Info area ── */}
      <div className="course-card__bottom">
        <h2 className="course-card__title">{course.title}</h2>
        <p className="course-card__description">{course.description}</p>
        <div className="course-card__cta-row">
          <span className={`course-card__cta ${isNext ? 'course-card__cta--bold' : ''}`}>
            <span>{ctaText}</span>
            <img
              className="course-card__cta-arrow"
              src={UpArrow}
              alt=""
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

