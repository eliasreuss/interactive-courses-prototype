# Course Progress & Resume — Developer Guide

This document explains how the prototype saves and restores user progress, and how to implement the same behavior in the React app **before login exists**. All progress is stored in the browser's `localStorage` and survives page reloads and hard refreshes.

---

## What It Does (Simple Terms)

1. **Progress percentage** — As the user moves through a course, we save how far they've gotten (0–100%). The hub uses this to show progress bars and labels like "Start", "Continue", or "Review".
2. **Exact position** — We also save which slide they're on. When they return, we jump straight back to that slide instead of the first one.
3. **When completed** — Once they reach 100%, we clear the saved position so "Review" starts from the beginning.

Everything is stored in `localStorage` under keys like `course_progress_intro` and `course_position_intro`. No server or login is required.

---

## How You'll Do It in React

1. **Storage utilities** — Small functions to read/write progress and position from `localStorage`.
2. **Hub / course list** — Use `loadCourseProgress(courseId)` to decide label and progress bar width for each card.
3. **Course player** — On mount, call `loadCoursePosition(courseId)` and start from that slide if it exists. On every slide change, compute the percentage, call `saveCourseProgress`, and either `saveCoursePosition` or `clearCoursePosition` (when 100%).

---

## Code You Need

### 1. Storage utilities

Create `src/utils/courseProgressStorage.ts` (or `.js`):

```ts
/**
 * Course progress storage — localStorage helpers for progress % and resume position.
 * Keys match the prototype so data stays compatible.
 */

const PROGRESS_PREFIX = 'course_progress_';
const POSITION_PREFIX = 'course_position_';

export type CourseProgress = {
  completed: boolean;
  progress: number;
};

export type CoursePosition = {
  activeSlideId: string;
  visitedSlideIds?: string[];
  mainPathHistory?: string[];
  lastMainNodeId?: string;
};

/**
 * Load saved progress for a course (0–100%, completed flag).
 * Used by the hub to show progress bars and "Start / Continue / Review".
 */
export function loadCourseProgress(courseId: string): CourseProgress {
  if (typeof window === 'undefined') {
    return { completed: false, progress: 0 };
  }
  const raw = window.localStorage.getItem(PROGRESS_PREFIX + courseId);
  if (!raw) return { completed: false, progress: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      completed: Boolean(parsed?.completed),
      progress: Math.max(0, Math.min(100, Number(parsed?.progress) || 0)),
    };
  } catch {
    return { completed: false, progress: 0 };
  }
}

/**
 * Save progress for a course. Call this whenever the user moves to a new slide.
 */
export function saveCourseProgress(
  courseId: string,
  progress: number,
  completed: boolean = false
): void {
  if (typeof window === 'undefined') return;
  const key = PROGRESS_PREFIX + courseId;
  window.localStorage.setItem(
    key,
    JSON.stringify({ completed, progress: Math.round(progress) })
  );
}

/**
 * Load saved position (which slide to resume on).
 * Returns null if nothing saved or course is completed.
 */
export function loadCoursePosition(courseId: string): CoursePosition | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(POSITION_PREFIX + courseId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.activeSlideId) return null;
    return {
      activeSlideId: String(parsed.activeSlideId),
      visitedSlideIds: Array.isArray(parsed.visitedSlideIds)
        ? parsed.visitedSlideIds
        : undefined,
      mainPathHistory: Array.isArray(parsed.mainPathHistory)
        ? parsed.mainPathHistory
        : undefined,
      lastMainNodeId: parsed.lastMainNodeId
        ? String(parsed.lastMainNodeId)
        : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Save current position so the user can resume later.
 * Call on every slide change when progress < 100%.
 */
export function saveCoursePosition(
  courseId: string,
  data: CoursePosition
): void {
  if (typeof window === 'undefined') return;
  const key = POSITION_PREFIX + courseId;
  window.localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Clear saved position. Call when the user reaches 100% so "Review" starts from the beginning.
 */
export function clearCoursePosition(courseId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(POSITION_PREFIX + courseId);
}
```

---

### 2. Hook for the hub (course cards)

Create `src/hooks/useCourseProgress.ts`:

```ts
import { useSyncExternalStore } from 'react';
import {
  loadCourseProgress,
  type CourseProgress,
} from '../utils/courseProgressStorage';

// Re-run when storage changes (e.g. user returns from course page in another tab)
function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getSnapshot() {
  return Date.now();
}

function getServerSnapshot() {
  return 0;
}

/**
 * Read progress for a single course. Use on each course card in the hub.
 */
export function useCourseProgress(courseId: string): CourseProgress {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return loadCourseProgress(courseId);
}

/**
 * Read progress for all courses. Use for the hero "total progress" bar.
 */
export function useAllCourseProgress(courseIds: string[]): {
  percentage: number;
  completedCount: number;
  total: number;
} {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let totalProgress = 0;
  let completedCount = 0;

  for (const id of courseIds) {
    const { completed, progress } = loadCourseProgress(id);
    if (completed) {
      totalProgress += 100;
      completedCount += 1;
    } else {
      totalProgress += progress;
    }
  }

  const total = courseIds.length;
  const percentage = total > 0 ? totalProgress / total : 0;

  return { percentage, completedCount, total };
}
```

---

### 3. Example: Course card component

```tsx
// src/components/CourseCard.tsx
import { Link } from 'react-router-dom'; // or your router
import { useCourseProgress } from '../hooks/useCourseProgress';

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  path: string; // e.g. 'inventory' or 'supplier'
};

type Props = {
  course: Course;
  isNextCourse?: boolean;
};

export function CourseCard({ course, isNextCourse = false }: Props) {
  const { completed, progress } = useCourseProgress(course.id);

  const ctaText = completed
    ? 'Review course'
    : progress > 0
    ? 'Continue course'
    : 'Start course';

  const progressPercent = completed ? 100 : progress;

  return (
    <Link
      to={`/course/${course.path}/${course.id}`}
      className={`course-card ${isNextCourse ? 'next-course' : ''}`}
    >
      <div className="course-card-top">
        <img src={course.thumbnail} alt="" className="course-card-thumb" />
        <span className="course-duration-pill">{course.duration}</span>
      </div>

      {/* Progress bar */}
      <div className={`card-progress ${completed ? 'completed' : ''}`}>
        <div
          className="card-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="course-card-bottom">
        <h2 className="course-title">{course.title}</h2>
        <p className="course-description">{course.description}</p>
        <span className="course-cta">
          {ctaText}
          <span className="course-cta-arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
```

---

### 4. Course player — save/restore logic

Use this inside your course player component. You need:

- `courseId` — e.g. `'intro'`, `'supplier-performance'`
- `slideIds` — ordered array of slide IDs (e.g. `['1', '2', '3', '4']`)
- `activeSlideId` — current slide (state)
- `setActiveSlideId` — to jump to a slide
- `visitedSlideIds` — optional, if you track visited slides like the prototype

```tsx
// Inside your CoursePlayer component — initialization and persistence
import { useEffect, useRef } from 'react';
import {
  loadCoursePosition,
  saveCoursePosition,
  saveCourseProgress,
  clearCoursePosition,
} from '../utils/courseProgressStorage';

// ... inside CoursePlayer:

const courseId = 'intro'; // from route or props
const slideIds = ['1', '2', '3', '4']; // your ordered slide IDs
const [activeSlideId, setActiveSlideId] = useState<string>(slideIds[0]);
const [visitedSlideIds, setVisitedSlideIds] = useState<Set<string>>(new Set());
const isInitialized = useRef(false);

// 1. On mount: restore position if we have one
useEffect(() => {
  if (isInitialized.current) return;
  isInitialized.current = true;

  const saved = loadCoursePosition(courseId);
  if (saved?.activeSlideId && slideIds.includes(saved.activeSlideId)) {
    setActiveSlideId(saved.activeSlideId);
    if (saved.visitedSlideIds?.length) {
      setVisitedSlideIds(new Set(saved.visitedSlideIds));
    }
  } else {
    setActiveSlideId(slideIds[0]);
    setVisitedSlideIds((prev) => new Set(prev).add(slideIds[0]));
  }
}, [courseId, slideIds]);

// 2. On slide change: compute percentage, save progress and position
useEffect(() => {
  if (!activeSlideId || slideIds.length === 0) return;

  const idx = slideIds.indexOf(activeSlideId);
  const currentIdx = idx < 0 ? 0 : idx;

  // Same formula as prototype: first slide = 0%, last = 100%
  let percent = 0;
  if (slideIds.length === 1) {
    percent = 100;
  } else if (currentIdx === 0) {
    percent = 0;
  } else if (currentIdx === slideIds.length - 1) {
    percent = 100;
  } else {
    percent = Math.round((currentIdx / (slideIds.length - 1)) * 100);
  }

  // Save progress for hub cards
  saveCourseProgress(courseId, percent, percent === 100);

  if (percent === 100) {
    clearCoursePosition(courseId);
  } else {
    saveCoursePosition(courseId, {
      activeSlideId,
      visitedSlideIds: Array.from(visitedSlideIds),
      mainPathHistory: slideIds.slice(0, currentIdx + 1),
      lastMainNodeId: activeSlideId,
    });
  }
}, [courseId, activeSlideId, visitedSlideIds, slideIds]);
```

---

### 5. Full course player example (minimal)

```tsx
// src/components/CoursePlayer.tsx
import { useEffect, useRef, useState } from 'react';
import {
  loadCoursePosition,
  saveCoursePosition,
  saveCourseProgress,
  clearCoursePosition,
} from '../utils/courseProgressStorage';

type Props = {
  courseId: string;
  slideIds: string[];
  renderSlide: (slideId: string) => React.ReactNode;
  onComplete?: () => void;
};

export function CoursePlayer({
  courseId,
  slideIds,
  renderSlide,
  onComplete,
}: Props) {
  const [activeSlideId, setActiveSlideId] = useState(slideIds[0] ?? '');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  // Restore position on mount
  useEffect(() => {
    if (initialized.current || slideIds.length === 0) return;
    initialized.current = true;

    const saved = loadCoursePosition(courseId);
    if (saved?.activeSlideId && slideIds.includes(saved.activeSlideId)) {
      setActiveSlideId(saved.activeSlideId);
      setVisitedIds(
        saved.visitedSlideIds
          ? new Set(saved.visitedSlideIds)
          : new Set([saved.activeSlideId])
      );
    } else {
      setActiveSlideId(slideIds[0]);
      setVisitedIds(new Set([slideIds[0]]));
    }
  }, [courseId, slideIds]);

  // Persist progress on slide change
  useEffect(() => {
    if (!activeSlideId || slideIds.length === 0) return;

    const idx = slideIds.indexOf(activeSlideId);
    const i = idx < 0 ? 0 : idx;

    let percent = 0;
    if (slideIds.length === 1) percent = 100;
    else if (i === 0) percent = 0;
    else if (i === slideIds.length - 1) percent = 100;
    else percent = Math.round((i / (slideIds.length - 1)) * 100);

    saveCourseProgress(courseId, percent, percent === 100);

    if (percent === 100) {
      clearCoursePosition(courseId);
      onComplete?.();
    } else {
      saveCoursePosition(courseId, {
        activeSlideId,
        visitedSlideIds: Array.from(visitedIds),
        mainPathHistory: slideIds.slice(0, i + 1),
        lastMainNodeId: activeSlideId,
      });
    }
  }, [courseId, activeSlideId, visitedIds, slideIds, onComplete]);

  const goNext = () => {
    const i = slideIds.indexOf(activeSlideId);
    if (i >= 0 && i < slideIds.length - 1) {
      const next = slideIds[i + 1];
      setActiveSlideId(next);
      setVisitedIds((prev) => new Set(prev).add(next));
    }
  };

  const goPrev = () => {
    const i = slideIds.indexOf(activeSlideId);
    if (i > 0) {
      setActiveSlideId(slideIds[i - 1]);
    }
  };

  const currentIdx = slideIds.indexOf(activeSlideId);
  const isLast = currentIdx === slideIds.length - 1;

  return (
    <div className="course-player">
      <div className="course-content">{renderSlide(activeSlideId)}</div>

      <div className="course-nav">
        <button onClick={goPrev} disabled={currentIdx <= 0}>
          Previous
        </button>
        {isLast ? (
          <button onClick={onComplete}>Finish</button>
        ) : (
          <button onClick={goNext}>Next</button>
        )}
      </div>
    </div>
  );
}
```

---

## localStorage keys (for reference)

| Key                     | Example value                                                                 |
|-------------------------|-------------------------------------------------------------------------------|
| `course_progress_intro` | `{"completed":false,"progress":42}`                                           |
| `course_position_intro` | `{"activeSlideId":"3","visitedSlideIds":["1","2","3"],"mainPathHistory":...}` |

These match the prototype so behavior stays consistent.

---

## Limitations (until login)

- Progress is **per browser, per device**. Switching devices or browsers starts from scratch.
- Clearing site data removes all progress.
- No cross-device sync until you add a backend and login.
