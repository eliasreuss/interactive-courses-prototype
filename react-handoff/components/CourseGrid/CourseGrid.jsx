/*
 * ============================================
 *  CourseGrid — 3-column grid of CourseCards
 * ============================================
 *
 *  Props:
 *    courses    — array of course objects
 *    onOpenCourse(course) — callback when a card is clicked
 *
 *  Behavior:
 *    - Reads progress from localStorage (same keys as the prototype).
 *    - Determines which course is "next" (earliest unfinished).
 *    - Cards animate in on scroll (IntersectionObserver).
 *    - 3-column grid on ≥1200px, single column below.
 */

import React, { useEffect, useRef } from 'react';
import CourseCard from '../CourseCard/CourseCard';
import './CourseGrid.css';

export default function CourseGrid({ courses = [], onOpenCourse }) {
  const gridRef = useRef(null);

  /* ── Determine progress for each course ── */
  const progressMap = {};
  courses.forEach((c) => {
    const key = `course_progress_${c.id}`;
    try {
      const saved = localStorage.getItem(key);
      progressMap[c.id] = saved
        ? JSON.parse(saved)
        : { completed: false, progress: 0 };
    } catch {
      progressMap[c.id] = { completed: false, progress: 0 };
    }
  });

  /* Find the next course to take */
  const nextCourseId =
    courses.find((c) => !progressMap[c.id]?.completed)?.id ?? null;

  /* ── Scroll-reveal via IntersectionObserver ── */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const cards = el.querySelectorAll('.course-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [courses]);

  return (
    <main className="course-grid-wrapper">
      <div className="course-grid" ref={gridRef}>
        {courses.map((course, i) => {
          const { completed, progress } = progressMap[course.id] || {};
          return (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              progress={progress}
              completed={completed}
              isNext={course.id === nextCourseId}
              onClick={() => onOpenCourse?.(course)}
            />
          );
        })}
      </div>
    </main>
  );
}

