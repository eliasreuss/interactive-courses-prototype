# React Handoff — Learning Path Hub

> Everything you need to rebuild the Learning Path hub page in React.

---

## 📁 Folder Structure

```
react-handoff/
│
├── README.md                ← You are here
│
├── styles/                  ← GLOBAL STYLES (import once at app root)
│   ├── theme.css            ← Design tokens (colors, radii, shadows, fonts, responsive margins)
│   └── glass.css            ← Reusable frosted-glass utility class
│
├── data/
│   └── courses.js           ← Course data array + helper functions
│
├── assets/
│   ├── svgs/                ← SVG icons used across components
│   │   ├── Learning-Path.svg
│   │   ├── Bookmark.svg
│   │   ├── Share.svg
│   │   ├── ButtonArrow.svg  ← Used via CSS mask-image (color tinting)
│   │   ├── Course-Icon.svg
│   │   └── Up-Arrow.svg
│   │
│   └── images/
│       ├── BottomRightGraphs.png     ← Hero decorative image
│       └── Course-thumbnails/              ← Course card thumbnails
│           ├── IIntro.png
│           ├── DABC.png
│           ├── SP.png
│           ├── SS.png
│           ├── RP.png
│           └── RQ.png
│
└── components/
    ├── TopNav/              ← Sticky top navigation bar
    │   ├── TopNav.jsx
    │   └── TopNav.css
    │
    ├── HeroHeader/          ← Dark hero card with tags, CTA, progress bar
    │   ├── HeroHeader.jsx
    │   └── HeroHeader.css
    │
    ├── CourseCard/           ← Individual course card
    │   ├── CourseCard.jsx
    │   └── CourseCard.css
    │
    ├── CourseGrid/           ← 3-column grid of CourseCards + scroll reveal
    │   ├── CourseGrid.jsx
    │   └── CourseGrid.css
    │
    └── HubPage/             ← Full page assembly (wires everything together)
        ├── HubPage.jsx
        └── HubPage.css
```

---

## 🚀 Quick Start

### 1. Copy the folder
Drop `react-handoff/` into your project.

### 2. Install the font
Add to your `<head>` (or use `@import` in CSS):

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 3. Import global styles
In your app entry point (e.g. `index.css` or `App.css`):

```css
@import './react-handoff/styles/theme.css';
@import './react-handoff/styles/glass.css';
```

### 4. Use the page component
```jsx
import HubPage from './react-handoff/components/HubPage/HubPage';

// In your router:
<Route path="/hub" element={<HubPage />} />
```

---

## 🧩 Component Reference

### `<TopNav />`
Sticky header with logo, nav links, and BETA badge. No props — currently static.

### `<HeroHeader />`
| Prop | Type | Description |
|------|------|-------------|
| `courses` | `Course[]` | Array from `data/courses.js` |
| `totalProgress` | `number` | 0–100 overall completion % |
| `nextCourseFile` | `string` | `.file` of the next course to open |
| `ctaLabel` | `string` | `"Start"` / `"Continue"` / `"Review"` |

### `<CourseCard />`
| Prop | Type | Description |
|------|------|-------------|
| `course` | `Course` | Single course object |
| `index` | `number` | Card position (0-based, for gradient direction) |
| `progress` | `number` | 0–100 |
| `completed` | `boolean` | Whether the course is done |
| `isNext` | `boolean` | Whether this is the next course to take (bolder CTA) |
| `onClick` | `() => void` | Click handler |

### `<CourseGrid />`
| Prop | Type | Description |
|------|------|-------------|
| `courses` | `Course[]` | All courses |
| `onOpenCourse` | `(course) => void` | Callback when a card is clicked |

### `<HubPage />`
Full page assembly. No props — reads course data from `data/courses.js` and progress from `localStorage`. Uses `react-router`'s `useNavigate`.

---

## 🎨 Design System Notes

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#304642` | Dark green — hero bg, text, progress fills |
| `--color-primary-light` | `#3d5a54` | Lighter green — hover text |
| `--color-accent` | `#FF5A00` | Orange — logo accent, focus rings |
| `--color-bg` | `#FAFAFA` | Page background |

### Glass Effect
Two variants in `glass.css`:
- **`.glass`** — Light frosted glass (white tint). Used on hero tags, on dark backgrounds.
- **`.glass.glass--dark`** — Dark frosted glass (green tint). Used on course card duration pills and icon circles, on light/image backgrounds.

Both include `::before` (top edge highlight) and `::after` (left edge highlight) pseudo-elements.

### Typography
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero title | 36px | 700 | 42px |
| Hero description | 20px | 300 | 27px |
| Hero tag | 14px | 400 (700 for primary) | 20px |
| Card title | 22px | 600 | 32px |
| Card description | 16px | 300 | 24px |
| Card CTA | 17px | 500 (700 for next) | 26px |

### Animations
- **Card enter**: `translateY(24px) → 0` with staggered delays via `nth-child`.
- **Card hover**: `translateY(-6px)` + stronger shadow.
- **CTA arrow hover**: slides right and up (`translate(2px, -2px)`).
- **Icon circle hover**: `scale(1.08)` + glow.
- **Hero graphs hover**: `translateY(-12px) rotate(-2deg)` with spring easing.
- **Progress bars**: `width` transition with `0.8s` cubic-bezier.

### Responsive Breakpoints

**Grid layout:**
| Width | Layout |
|-------|--------|
| < 700px | 1 column |
| ≥ 700px | 2 columns |
| ≥ 1200px | 3 columns |

**Page margins (`--page-margin`):**
| Width | Margin |
|-------|--------|
| Default | 40px |
| ≥1400px | 120px |
| ≥1600px | 180px |
| ≥1920px | 280px |
| ≥2200px | 380px |
| ≥2560px | 480px |

---

## ⚠️ Things to Adjust

1. **Asset paths**: The `import` paths in `.jsx` files assume the folder lives at the project root. Adjust for your actual file structure.

2. **CSS `mask-image` path**: In `HeroHeader.css`, the `.btn-start__arrow` uses a CSS `url()` path to `ButtonArrow.svg`. Depending on your bundler (Vite, CRA, Next.js), you may need to adjust this or import the SVG differently.

3. **`react-router`**: `HubPage.jsx` imports `useNavigate` from `react-router-dom`. If you use a different router or no router, replace the navigation call.

4. **`localStorage` keys**: Progress is stored as `course_progress_{courseId}`. Make sure the course page writes to the same keys.

5. **Course URLs**: Navigation goes to `/course?course={file}&from=hub`. Adjust to match your routing.

---

## 📏 Progress Logic

- Progress is stored per-course in `localStorage` as `{ completed: boolean, progress: number }`.
- Total progress = average of all courses (completed = 100, otherwise use `progress`).
- The "next" course = first course in the array that is not completed.
- The next course's CTA button gets **bolder** font weight.

