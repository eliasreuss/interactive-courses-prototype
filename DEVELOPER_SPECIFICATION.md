## Overview
This document provides complete technical specifications for the Interactive Learning Flow prototype, including dimensions, typography, colors, spacing, responsive breakpoints, and component details.

---

## 1. Color Palette

### Primary Colors
- **Background**: `#FAFAFA`
- **Card Background**: `#FFFFFF`
- **Primary Text** (card content): `#111111` (black)
- **UI Dark** (UI elements): `#304642` (dark green)
- **Accent**: `#FF5A00` (orange)
- **Muted Text**: `#6E6E6E`
- **Unvisited/Inactive**: `#D7D7D7`
- **Dropdown Background**: `#F6F6F6`
- **Quote Author**: `#8a8f87`
- **Button Outline**: `#8A8A8A`

### Shadow Values
- **Card Shadow**: `0px 2px 8px rgba(0, 0, 0, 0.04), 0px 4px 16px rgba(0, 0, 0, 0.06)`
- **Header Shadow**: `0 4px 12px rgba(0,0,0,0.06)`
- **Image Container Shadow**: `0 10px 25px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.08)`
- **Image Container Hover Shadow**: `0 14px 34px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.08)`
- **Content Card Shadow**: `0 4px 32px 0 rgba(60,60,60,0.07)`
- **Button Primary Shadow**: `0 2px 8px rgba(255,90,0,0.18)`
- **Button Primary Hover Shadow**: `0 4px 12px rgba(255,90,0,0.28)`
- **Button Secondary Shadow**: `0 2px 8px rgba(48,70,66,0.18)`
- **Button Secondary Hover Shadow**: `0 4px 12px rgba(48,70,66,0.28)`
- **Button Outline Shadow**: `0 2px 8px rgba(0,0,0,0.06)`
- **Button Outline Hover Shadow**: `0 4px 12px rgba(0,0,0,0.10)`

---

## 2. Typography

### Font Family
- **Primary Font**: `'Poppins', sans-serif`
- **Weights Used**: 400 (regular), 600 (semi-bold), 700 (bold)

### Fluid Typography (Scales from 768px to 1920px viewport)

#### Base Sizes (Desktop)
- **Title Font Size**: `clamp(1.5rem, 1.2rem + 0.8vw, 2.5rem)`
  - Minimum: 24px (1.5rem)
  - Maximum: 40px (2.5rem)
  - Scales between 768px and 1920px viewport
  
- **Body Font Size**: `clamp(0.95rem, 0.9rem + 0.3vw, 1.35rem)`
  - Minimum: 15.2px (0.95rem)
  - Maximum: 21.6px (1.35rem)
  
- **Small Font Size**: `clamp(0.85rem, 0.8rem + 0.15vw, 1.05rem)`
  - Minimum: 13.6px (0.85rem)
  - Maximum: 16.8px (1.05rem)

#### Medium Screens (901px - 1440px)
- **Title**: `clamp(1.4rem, 1.1rem + 0.6vw, 2rem)` (22.4px - 32px)
- **Body**: `clamp(0.9rem, 0.85rem + 0.25vw, 1.15rem)` (14.4px - 18.4px)
- **Small**: Same as base

#### Line Heights
- **Card Title**: Default (inherited)
- **Card Content**: `1.55`
- **Hero Subtitle**: Default
- **Hero Title**: `1.2`
- **Hero Body**: `1.6`
- **Quote Mark**: `1`
- **Quote Text**: Default (inherited)
- **Quote Author**: Default (inherited)

#### TOC Typography
- **Section Title**: `clamp(13px, 0.8rem + 0.2vw, 15px)` (13px - 15px)
- **Child Title**: `clamp(11px, 0.7rem + 0.15vw, 13px)` (11px - 13px)
- **Large Screens (>1440px)**: Section 16px, Child 14px

---

## 3. Spacing & Layout

### Fluid Spacing
- **Content Padding**: `clamp(20px, 2.5vw, 48px)`
  - Minimum: 20px
  - Maximum: 48px
  - Scales with viewport width

- **Medium Screens (901px - 1440px)**: `clamp(18px, 2vw, 36px)`

### Component Spacing

#### Header
- **Padding**: `16px 32px`
- **Border Radius**: `0 0 25px 25px`
- **Progress Container Gap**: `20px`
- **Progress Container Margin**: `0 24px`
- **Progress Bar Gap**: `16px`
- **Header Elements Gap**: `16px`
- **Back Button Gap**: `8px`
- **Back Button Padding**: `8px 0`
- **Divider**: `1px × 24px`

#### Sidebar (TOC)
- **Base Width**: `320px`
- **Medium Screens (901px - 1440px)**: `280px`
- **Large Screens (>1440px)**: `380px`
- **Narrow Desktop (769px - 980px)**: `280px`
- **Mobile (<900px)**: `280px`
- **Padding**: `24px 12px 24px 24px`
- **Large Screens Padding**: `28px 16px 28px 28px`
- **Gap Between Sections**: `16px`

#### TOC Section
- **Border Radius**: `15px`
- **Section Header Padding**: `12px 16px`
- **Section Header Gap**: `10px`
- **Child Item Padding**: `12px 16px`
- **Child Item Gap**: `16px`
- **Indicator Size**: `12px × 12px`
- **Step Dot Size**: `5px × 5px`
- **Step Dot Gap**: `6px`
- **Step Dots Margin Left**: `6px`

#### Content Area
- **Base Padding**: `24px 24px 24px 12px`
- **Medium Screens**: `20px 20px 20px 10px`
- **Large Screens (>1440px)**: `28px 28px 28px 16px`
- **Gap**: `24px` (base), `20px` (medium), `28px` (large)

#### Content Card
- **Border Radius**: `18px`
- **Max Width**: `1200px` (base)
- **Large Screens**: `1400px`
- **Width**: `100%`
- **Padding**: Uses `--spacing-content` variable
- **Hero Mode Padding**: `clamp(14px, 1.6vw, 24px)`
- **Large Screens (1441px - 1920px) Padding**: `clamp(20px, 2.5vw, 48px) clamp(100px, 12vw, 180px)`

#### Card Title
- **Margin Bottom**: `clamp(20px, 2.5vw, 36px)` (increased spacing from content)
- **Margin Top**: `0`

#### Card Content
- **Paragraph Margin**: `0` (default)
- **Paragraph + Paragraph Margin**: `0.8em`
- **List Padding Left**: `1em` (unordered), `1.2em` (ordered)
- **List Margin**: `1em 0` (unordered), `0.5em` bottom (ordered)
- **Empty Line Spacing**: `1em` height

#### Hero Layout
- **Gap**: `clamp(44px, 5vw, 88px)`
- **Max Width**: `1520px` (base), `1600px` (large screens)
- **Min Height**: `clamp(420px, 58vh, 720px)`
- **Medium Screens**: 
  - Gap: `clamp(32px, 3.5vw, 64px)`
  - Min Height: `clamp(360px, 50vh, 600px)`
  - Max Width: `1200px`
- **Image Side Flex**: `1.25`
- **Text Side Flex**: `0.95`
- **Text Side Gap**: `clamp(12px, 1.5vw, 20px)`

#### Hero Image
- **Max Width**: `100%`
- **Max Height**: `64vh` (base), `55vh` (medium screens)
- **Object Fit**: `contain`

#### Hero Typography
- **Subtitle Font Size**: `var(--font-size-body)`
- **Title Font Size**: `clamp(1.75rem, 1.5rem + 2vw, 2.75rem)` (28px - 44px)
- **Medium Screens Title**: `clamp(1.5rem, 1.3rem + 1.5vw, 2.2rem)` (24px - 35.2px)
- **Body Font Size**: `var(--font-size-body)`
- **Body Margin Top**: `8px`

#### Images Container
- **Gap**: `clamp(16px, 2vw, 32px)`
- **Margin**: `clamp(20px, 3vw, 40px) 0`
- **Medium Screens Gap**: `clamp(12px, 1.5vw, 24px)`
- **Medium Screens Margin**: `clamp(16px, 2.5vw, 32px) 0`
- **Image Container Border Radius**: `15px`
- **Image Container Gap** (third images): `32px` (calc: `(100% - 64px) / 3`)

#### Image Sizes
- **X-Small**: `15%` width
- **Small**: `25%` width
- **Medium**: `50%` width
- **Large**: `100%` width (base)
  - **Above 1500px**: `90%` width
  - **1200px - 1500px**: `95%` width
  - **Below 1200px**: `100%` width
  - **Medium Screens (901px - 1440px)**: `80%` width
- **Third**: `calc((100% - 64px) / 3)` (always 3 columns, no wrap)
  - **Above 1500px**: `calc((80% - 64px) / 3)`
  - **Below 1500px**: `calc((100% - 64px) / 3)`
  - **Medium Screens**: Container `80%` width, margin auto
- **Fourth**: `calc((100% - 96px) / 4)`
- **Custom Pixel Sizes**: Images can use pixel-based sizes (e.g., `size:400px`, `size:625px`) for precise control

#### Stacked Images (align:right, align:stack-right)
- **Gap**: `clamp(32px, 4vw, 56px)` (between text and image)
- **Max Width**: `clamp(320px, 45%, 800px)`
- **Medium Screens Max Width**: `clamp(280px, 40%, 700px)`
- **Border Radius**: `15px`
- **Stacked Mode Padding**: When `align:right` or `align:stack-right` is used, card padding is reduced:
  - Base: `clamp(32px, 4vw, 64px)` vertical, `clamp(32px, 4vw, 64px)` horizontal
  - Large (>1440px): `clamp(48px, 5.5vw, 88px)` vertical, `clamp(48px, 5.5vw, 88px)` horizontal
  - Medium (1441-1920px): `clamp(40px, 4.5vw, 72px)` vertical, `clamp(40px, 4.5vw, 72px)` horizontal
  - Medium (901-1440px): `clamp(24px, 3vw, 48px)` vertical, `clamp(24px, 3vw, 48px)` horizontal
  - Small (<900px): `clamp(20px, 2.5vw, 36px)` vertical, `clamp(20px, 2.5vw, 36px)` horizontal
- **Responsive**: On screens <900px, switches to `flex-direction: column` (stacked vertically)

#### Quote Block
- **Grid Columns**: `clamp(24px, 2.5vw, 40px) 1fr`
- **Gap**: `clamp(8px, 1vw, 16px)`
- **Margin**: `clamp(16px, 2vw, 32px) 0`
- **Quote Mark Font Size**: `clamp(24px, 2vw, 36px)`
- **Quote Author Margin Top**: `6px`

#### Card Footer
- **Padding**: `20px 32px` (base)
- **Medium Screens**: `14px 20px`
- **Narrow Desktop**: `14px 18px`
- **Border Top**: `1px solid #eee`
- **Footer Logo Height**: `28px` (base), `24px` (medium screens)
- **Footer Elements Gap**: `16px` (base), `10px` (medium/narrow)
- **Footer Divider**: `1px × 24px`
- **Footer Right Gap**: `12px` (base), `10px` (narrow)

#### Buttons
- **Padding**: `clamp(8px, 1vw, 12px) clamp(16px, 2vw, 28px)`
- **Medium Screens**: `8px 18px`
- **Narrow Desktop**: `10px 16px`
- **Border Radius**: `500px` (fully rounded)
- **Gap**: `8px`
- **Icon Size**: `10px × 16px`
- **Max Width** (small screens): `clamp(96px, 28vw, 180px)`
- **Narrow Desktop Max Width**: `clamp(92px, 20vw, 180px)`

#### Progress Bar
- **Segment Height**: `10px`
- **Segment Border Radius**: `5px`
- **Segment Gap**: `16px`
- **Segment Sizing**: Segments are proportional to the number of slides in each section (uses `flex-grow` with CSS custom property `--segment-flex-grow`)
- **Percent Font Size**: `14px`
- **Percent Font Weight**: `600`
- **Progress Calculation**: Starts at 0% on first slide, ends at 100% on last slide
- **Segment Fill**: Each segment fills from 0% to 100% as user progresses through that section
- **Fill Transition**: `0.6s cubic-bezier(0.4, 0, 0.2, 1)`
- **Fill Color**: `#304642` (dark green)

---

## 4. Responsive Breakpoints

### Breakpoint Structure
1. **Mobile**: `≤ 680px`
2. **Tablet**: `681px - 768px`
3. **Narrow Desktop**: `769px - 900px`
4. **Medium Desktop**: `901px - 980px`
5. **Standard Desktop**: `981px - 1440px`
6. **Large Desktop**: `1441px - 1920px`
7. **Extra Large**: `> 1920px`

### Key Breakpoints

#### ≤ 680px (Mobile)
- Footer buttons truncate with ellipsis
- Button max-width: `clamp(96px, 28vw, 180px)`
- Footer right: no wrap, overflow hidden

#### ≤ 768px (Mobile/Tablet)
- Content area padding: `16px`
- Sidebar width: `280px`

#### 769px - 980px (Narrow Desktop)
- Sidebar: `280px`
- Content area padding: `16px 16px 16px 8px`
- Card text content padding: `28px 28px`
- Card footer padding: `14px 18px`
- Footer left: hidden
- Footer right gap: `10px`
- Button padding: `10px 16px`
- Button max-width: `clamp(92px, 20vw, 180px)`

#### ≤ 900px (Tablet/Mobile)
- Sidebar: `280px`
- Hero layout: min-height auto

#### 901px - 1440px (Medium Screens - MacBook Air 13")
- Reduced typography sizes
- Sidebar: `280px`
- Header padding: `12px 24px`
- Sidebar padding: `20px 10px 20px 20px`
- Hero layout:
  - Gap: `clamp(32px, 3.5vw, 64px)`
  - Min height: `clamp(360px, 50vh, 600px)`
  - Max width: `1200px`
- Hero image max-height: `55vh`
- Hero title: `clamp(1.5rem, 1.3rem + 1.5vw, 2.2rem)`
- Content area max-width: `1000px`
- Content area padding: `20px 20px 20px 10px`
- Content area gap: `20px`
- Card footer padding: `14px 20px`
- Footer logo height: `24px`
- Footer right gap: `10px`
- Button padding: `8px 18px`
- Button font size: `clamp(0.8rem, 0.75rem + 0.15vw, 0.95rem)`
- Progress container margin: `0 16px`
- Image container gap: `clamp(12px, 1.5vw, 24px)`
- Image container margin: `clamp(16px, 2.5vw, 32px) 0`
- Large images: `80%` width
- Third images container: `80%` width, margin auto
- Stacked images max-width: `clamp(280px, 40%, 700px)`

#### 1441px - 1920px (Large Desktop - 1920×1080 monitors)
- Sidebar: `380px`
- Sidebar padding: `28px 16px 28px 28px`
- TOC section title: `16px`
- TOC child title: `14px`
- Card text content max-width: `1400px`
- Card text content padding: `clamp(20px, 2.5vw, 48px) clamp(100px, 12vw, 180px)`
- Hero layout max-width: `1600px`
- Content area padding: `28px 28px 28px 16px`
- Content area gap: `28px`
- Large images: `90%` width
- Third images container: `90%` width, margin auto

#### > 1440px (Large Screens)
- Sidebar: `380px`
- Card text content max-width: `1400px`
- Hero layout max-width: `1600px`

---

## 5. Component Specifications

### Header
- **Height**: Auto (content-based)
- **Background**: `#FFFFFF`
- **Border Radius**: `0 0 25px 25px`
- **Box Shadow**: `0 4px 12px rgba(0,0,0,0.06)`
- **Z-Index**: `10`
- **Flex Shrink**: `0`

### Progress Bar
- **Segment Count**: Dynamic (based on course structure)
- **Segment Sizing**: Segments are proportional to the number of slides in each section (uses `flex-grow` with CSS custom property `--segment-flex-grow`)
- **Progress Calculation**: Starts at 0% on first slide, ends at 100% on last slide
- **Segment Fill**: Each segment fills from 0% to 100% as user progresses through that section
- **Fill Transition**: `0.6s cubic-bezier(0.4, 0, 0.2, 1)`
- **Fill Color**: `#304642` (dark green)

### Sidebar (TOC)
- **Background**: Transparent (sections have white background)
- **Overflow**: `auto` (scrollable)
- **Display**: `flex`, `column`
- **Z-Index**: `5`

### TOC Section
- **Background**: `#FFFFFF`
- **Border Radius**: `15px`
- **Box Shadow**: Card shadow variable
- **Overflow**: `hidden`

### TOC Indicators
- **Size**: `12px × 12px`
- **Border Radius**: `100px` (fully rounded)
- **States**:
  - Unvisited: `#D7D7D7` background
  - Active: `#304642` background with checkmark SVG
  - Completed: `#304642` background with checkmark SVG
  - Current: `#FF5A00` background

### TOC Step Dots
- **Size**: `5px × 5px`
- **Border Radius**: `9999px`
- **Gap**: `6px`
- **Margin Left**: `6px`
- **States**:
  - Unvisited: `#D7D7D7` background
  - Visited: `#304642` background
  - Active: `#FF5A00` background

### Content Card
- **Background**: `#FFFFFF`
- **Border Radius**: `18px`
- **Box Shadow**: `0 4px 32px 0 rgba(60,60,60,0.07)`
- **Display**: `flex`, `column`
- **Min Width**: `0` (allows flex shrinking)
- **Transition**: `box-shadow 220ms ease, transform 220ms ease`

### Card Scroll Wrapper
- **Overflow Y**: `auto` (scrollable)
- **Position**: Relative (contains scrollbar at card edge)

### Image Container
- **Border Radius**: `15px` (with frame)
- **Border Radius**: `0` (no-frame class)
- **Overflow**: `hidden`
- **Background**: `#FFFFFF` (with frame)
- **Background**: `transparent` (no-frame class)
- **Box Shadow**: `0 10px 25px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.08)`
- **Transition**: `transform 220ms ease, box-shadow 220ms ease`
- **Hover Transform**: `translateY(-2px)`
- **Hover Box Shadow**: `0 14px 34px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.08)`

### Buttons

#### Primary Button (.btn-primary)
- **Background**: `#FF5A00`
- **Color**: `#FFFFFF`
- **Hover Background**: `#e04e00`
- **Hover Transform**: `translateY(-1px)`
- **Box Shadow**: `0 2px 8px rgba(255,90,0,0.18)`
- **Hover Box Shadow**: `0 4px 12px rgba(255,90,0,0.28)`

#### Secondary Button (.btn-secondary)
- **Background**: `#304642` (dark green)
- **Color**: `#FFFFFF`
- **Hover Background**: `#2a3c39`
- **Hover Transform**: `translateY(-1px)`
- **Box Shadow**: `0 2px 8px rgba(48,70,66,0.18)`
- **Hover Box Shadow**: `0 4px 12px rgba(48,70,66,0.28)`
- **Used For**: Sidequest buttons, link buttons (flow links)

#### Outline Button (.btn-outline)
- **Background**: `#FFFFFF`
- **Color**: `#8A8A8A`
- **Border**: `1px solid #8A8A8A`
- **Hover Border Color**: `#6f6f6f`
- **Hover Transform**: `translateY(-1px)`
- **Box Shadow**: `0 2px 8px rgba(0,0,0,0.06)`
- **Hover Box Shadow**: `0 4px 12px rgba(0,0,0,0.10)`

#### Link Button (Flow Links)
- **Style**: Uses `.btn-secondary` class (dark green background, white text)
- **Content**: Text only (no arrow SVG icon)
- **Behavior**: Opens link in new tab/window (`window.open(url, '_blank')`)
- **Placement**: Appears in action buttons area (alongside sidequest buttons)

### Hero Slide
- **Layout**: Flexbox, row
- **Image Side Flex**: `1.25`
- **Text Side Flex**: `0.95`
- **Align Items**: `center`
- **Justify Content**: `center` (image side)

### Flip Cards (if used)
- **Grid Columns**: `repeat(3, 1fr)`
- **Gap**: `clamp(12px, 1.5vw, 24px)`
- **Padding**: `clamp(12px, 1.5vw, 24px) 0`
- **Card Padding**: `clamp(16px, 1.5vw, 24px)`
- **Card Min Height**: `clamp(120px, 12vw, 180px)`
- **Border Radius**: `12px`
- **Box Shadow**: `0 4px 15px rgba(0,0,0,0.08)`
- **Transition**: `opacity 0.4s ease`

---

## 6. Animations

### Hero Image Float Animation
- **Duration**: `4s`
- **Easing**: `cubic-bezier(0.45, 0, 0.55, 1)`
- **Delay**: `800ms`
- **Iteration**: `infinite`
- **Transform**: `translateY(0)` to `translateY(-8px)` (50% keyframe)
- **Respects**: `prefers-reduced-motion`

### Hero Image Entry Animation
- **Duration**: `720ms`
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- **Fill Mode**: `both`
- **Respects**: `prefers-reduced-motion`

### Hero Text Entry Animation
- **Duration**: `600ms`
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- **Fill Mode**: `both`
- **Respects**: `prefers-reduced-motion`

### Card Entry Animation
- **Duration**: `400ms`
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- **Fill Mode**: `both`
- **Respects**: `prefers-reduced-motion`

### Button Hover
- **Transform**: `translateY(-1px)`
- **Transition**: `all 0.2s`

### Image Container Hover
- **Transform**: `translateY(-2px)`
- **Transition**: `transform 220ms ease, box-shadow 220ms ease`

### Progress Fill
- **Transition**: `width 0.6s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 7. Image Specifications

### Recommended Image Dimensions

#### Large Images
- **Width**: `1600px` (recommended export width)
- **Aspect Ratio**: Variable (maintains aspect ratio)
- **Rendering**: Optimized with `image-rendering: -webkit-optimize-contrast`, `image-rendering: high-quality`, `-ms-interpolation-mode: bicubic`
- **Note**: Hero images do NOT use image optimization CSS

#### Third Images
- **Width**: `1200px` (recommended export width)
- **Aspect Ratio**: Variable (maintains aspect ratio)
- **Rendering**: Optimized (same as large images)

#### Other Sizes
- **Small**: `25%` of container width
- **Medium**: `50%` of container width
- **X-Small**: `15%` of container width
- **Fourth**: `25%` of container width (4 columns)

### Image Optimization
- Applied to: `.content-images-container img`, `.content-with-stacked-images .stacked-images img`
- NOT applied to: `.hero-image-side img`
- Properties:
  - `image-rendering: -webkit-optimize-contrast`
  - `image-rendering: high-quality`
  - `-ms-interpolation-mode: bicubic`

---

## 8. Media Queries Summary

### Mobile First Approach
- Base styles target mobile
- Media queries add styles for larger screens

### Key Media Queries
1. `@media (max-width: 680px)` - Mobile button truncation
2. `@media (max-width: 768px)` - Mobile/tablet layout
3. `@media (max-width: 900px)` - Tablet adjustments
4. `@media (max-width: 980px) and (min-width: 769px)` - Narrow desktop
5. `@media (min-width: 901px) and (max-width: 1440px)` - Medium screens (MacBook Air)
6. `@media (min-width: 1441px)` - Large screens
7. `@media (min-width: 1441px) and (max-width: 1920px)` - Large desktop (1920×1080)
8. `@media (prefers-reduced-motion: reduce)` - Accessibility

---

## 9. Accessibility

### Reduced Motion
- All animations respect `prefers-reduced-motion: reduce`
- When reduced motion is preferred, animations are disabled or simplified

### Focus States
- Buttons and interactive elements should have visible focus states
- Use browser default focus styles or custom focus rings

### Color Contrast
- Primary text (`#111111`) on white background: WCAG AAA compliant
- UI dark (`#304642`) on white: WCAG AA compliant
- Accent (`#FF5A00`) on white: WCAG AA compliant

---

## 10. Technical Notes

### Clamp Function
Extensively used for fluid typography and spacing that scales smoothly between breakpoints.

### Object Fit
- Hero images use `object-fit: contain` to maintain aspect ratio
- Videos use `object-fit: contain`

### Overflow Handling
- Sidebar: `overflow-y: auto` (scrollable)
- Card content: Wrapped in scroll wrapper with `overflow-y: auto`
- Footer buttons: `overflow: hidden` with `text-overflow: ellipsis` on small screens

### Z-Index Layers
- Header: `10`
- Sidebar: `5`
- Content: `1` (default)

### Markdown Format
- **New Format**: Uses `[id:X/topic: Name]` for sections, `slide_id:`, `index_title:`, `title:`, `type:` for slides
- **Navigation Types**: 
  - `> [next] Label -> Target` for main path navigation
  - `> [sidequest] Label -> Target` for sidequest buttons
  - `> [next:flow] Label -> URL` for external link buttons (flow links)
- **Image Sizes**: Supports predefined sizes (`x-small`, `small`, `medium`, `large`, `third`, `fourth`) and custom pixel sizes (e.g., `size:400px`, `size:625px`)
- **Image Alignment**: Supports `left`, `center`, `right`, `stack-right`, `stack-right-top`
- **Hero Slides**: Type `hero` with `hero_image:`, `hero_subtitle:`, `hero_title:`, `hero_body:` fields
- **Sidequests**: Defined in `[flow-specific-side-quests]` section with `[id:sX/topic: Name]` format
- **Assets Folder**: Creator supports assets folder prefix (e.g., `stock-policy/`) that automatically prefixes image paths

### Creator Features
- **Assets Folder Input**: Allows setting a folder prefix (e.g., `stock-policy/`) that automatically prefixes image paths when inserting media
- **Hero Toggle**: Toggle on first slide to make it a hero intro slide
- **Index Title**: Separate field for TOC display title (different from slide title)
- **Link Buttons**: Can add external link buttons that open in new tabs
- **Sidequest Navigation**: Custom labels for "Next" and "Return to main path" buttons in sidequests
- **Markdown Generation**: Automatically updates image paths to use current assets folder setting when generating markdown

---
