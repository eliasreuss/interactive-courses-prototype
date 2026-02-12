/*
 * ============================================
 *  HubPage — Full page assembly
 * ============================================
 *
 *  This component wires together TopNav, HeroHeader,
 *  and CourseGrid into the complete hub view.
 *
 *  It owns the progress-calculation logic and passes
 *  derived values down as props.
 *
 *  Usage:
 *    import HubPage from './components/HubPage/HubPage';
 *    // In your router:
 *    <Route path="/hub" element={<HubPage />} />
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Optional — see note below
import TopNav from '../TopNav/TopNav';
import HeroHeader from '../HeroHeader/HeroHeader';
import CourseGrid from '../CourseGrid/CourseGrid';
import { courses } from '../../data/courses';
import './HubPage.css';

export default function HubPage() {
  /*
   * NOTE: If you're NOT using react-router, replace
   * useNavigate() with your own navigation function
   * or window.location.href = url.
   */
  const navigate = useNavigate();

  /* ── Read progress from localStorage ── */
  const progressMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const key = `course_progress_${c.id}`;
      try {
        const saved = localStorage.getItem(key);
        map[c.id] = saved ? JSON.parse(saved) : { completed: false, progress: 0 };
      } catch {
        map[c.id] = { completed: false, progress: 0 };
      }
    });
    return map;
  }, []);

  /* ── Total progress (0-100) ── */
  const totalProgress = useMemo(() => {
    let sum = 0;
    courses.forEach((c) => {
      const p = progressMap[c.id];
      sum += p?.completed ? 100 : (p?.progress ?? 0);
    });
    return sum / courses.length;
  }, [progressMap]);

  /* ── Next course to take ── */
  const nextCourse = useMemo(() => {
    return courses.find((c) => !progressMap[c.id]?.completed) ?? courses[0];
  }, [progressMap]);

  /* ── CTA label ── */
  const ctaLabel = useMemo(() => {
    if (!nextCourse) return 'Start';
    const p = progressMap[nextCourse.id];
    if (p?.completed) return 'Review';
    if (p?.progress > 0) return 'Continue';
    return 'Start';
  }, [nextCourse, progressMap]);

  /* ── Open a course ── */
  const handleOpenCourse = (course) => {
    navigate(`/course?course=${course.file}&from=hub`);
  };

  return (
    <div className="hub-page">
      <TopNav />

      <div className="hub-page__body">
        <HeroHeader
          courses={courses}
          totalProgress={totalProgress}
          nextCourseFile={nextCourse?.file ?? ''}
          ctaLabel={ctaLabel}
        />

        <CourseGrid
          courses={courses}
          onOpenCourse={handleOpenCourse}
        />
      </div>
    </div>
  );
}

