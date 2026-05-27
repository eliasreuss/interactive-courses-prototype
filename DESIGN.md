---
name: Inact Learn
description: Professional learning platform for Inact operations software
colors:
  forest-green: "#304642"
  forest-green-light: "#3d5a54"
  tangerine: "#FF5A00"
  off-white: "#FAFAFA"
  card-white: "#FFFFFF"
  muted-sage: "#8A9A97"
  tag-gray: "#F0F0F0"
  progress-gray: "#EBEBEB"
typography:
  display:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 0.8vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(1.1rem, 1rem + 0.4vw, 1.6rem)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(0.95rem, 0.9rem + 0.3vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  small:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "clamp(0.85rem, 0.8rem + 0.15vw, 1.05rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "1.1px"
rounded:
  lg: "20px"
  md: "14px"
  sm: "10px"
spacing:
  content: "clamp(20px, 2.5vw, 48px)"
  section: "clamp(32px, 4vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "#D94E00"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.forest-green}"
    rounded: "{rounded.md}"
    padding: "13px 27px"
  chip-default:
    backgroundColor: "{colors.tag-gray}"
    textColor: "{colors.muted-sage}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  chip-active:
    backgroundColor: "{colors.forest-green}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
---

# Design System: Inact Learn

## 1. Overview

**Creative North Star: "The Clear Path"**

Inact Learn is built for operations professionals — inventory managers, procurement leads, supplier coordinators — who already know their domain and turn to this platform to get better at Inact specifically. They are capable adults learning between real tasks. The interface must respect that context: no hand-holding, no noise, no hollow encouragement.

The visual system is structured around a restrained palette — one deep primary, one sharp accent — on clean light surfaces. Depth is tinted and ambient. Motion is minimal and purposeful. Gamification is present but understated: achievements earn their moment through restraint, not animation. The platform should feel like an extension of Inact itself, not a bolted-on third-party LMS.

This system explicitly rejects LinkedIn Learning's dense chrome (multiple nav layers, heavy borders, quantity-over-clarity layouts), Duolingo's looping reward mechanics (streaks, confetti, mid-task notifications), and the generic SaaS dashboard template (big number, small label, gradient accent). If any of those patterns appear, they are wrong.

**Key Characteristics:**
- Light surfaces, deep forest green anchoring, tangerine used with discipline
- Single font family (Poppins) — hierarchy through weight, not variety
- Tinted shadows in forest green, never neutral black
- Gamification that feels earned: hexagonal badges, completion certificates, nothing more
- Conservative motion: state transitions only, no choreography

## 2. Colors: The Clear Path Palette

One dominant primary, one sharp accent, warm-neutral surfaces. Every color earns its place by reducing friction or communicating something real.

### Primary
- **Deep Forest Green** (`#304642`): The structural color. Hero backgrounds, navigation, achievement panels, all primary text on light surfaces. Reads as authoritative and grounded without being cold. Where the brand lives.
- **Forest Green Light** (`#3d5a54`): Hover state for forest-green surfaces. A perceptible but not dramatic shift — confirms interaction without drama.

### Secondary
- **Tangerine Orange** (`#FF5A00`): Primary CTAs, focus rings, progress highlights, the Inact logotype accent. Never decorative. Its rarity is what gives it signal value — if it appears on something the user can't act on, it is misused.

### Neutral
- **Off-White Canvas** (`#FAFAFA`): The page background. Never pure white — the slight warmth prevents harshness at scale.
- **Card White** (`#FFFFFF`): Raised card surfaces, sidebar panels. One visible step above the canvas.
- **Muted Sage** (`#8A9A97`): Secondary text, placeholder labels, supporting UI copy. Has the green undertone of the primary — the neutrals are never mechanical.
- **Tag Gray** (`#F0F0F0`): Chip and tag backgrounds on light surfaces.
- **Progress Gray** (`#EBEBEB`): Progress bar tracks, dividers, inactive step fills.

### Named Rules

**The One Voice Rule.** Tangerine Orange occupies ≤10% of any screen. It marks the one thing the user should do next, or the thing that just succeeded. If it appears on more than one element simultaneously, one of those is wrong.

**The No-Pure-Extreme Rule.** `#000` and `#fff` are prohibited. Text is forest green or its alpha variants on light surfaces. Backgrounds are off-white or warmer. Grays carry the sage undertone — never neutral RGB.

**The Tinted Shadow Rule.** All shadows use rgba(48, 70, 66, ...) — forest green, not black. If a shadow looks gray, it's using the wrong base color.

## 3. Typography

**Font:** Poppins (300–700), sans-serif. A single family across the full hierarchy.

**Character:** Geometric-humanist, unusually readable across weights. The single-family approach gives the interface visual cohesion — hierarchy is expressed through weight contrast (300 vs 600 vs 700), not by switching families. Professional and clean without feeling clinical.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 1.2rem + 0.8vw, 2.5rem)`, line-height 1.2): Hub page titles, hero headings. Used at most once per view.
- **Title** (600, `clamp(1.1rem, 1rem + 0.4vw, 1.6rem)`, line-height 1.35): Section headings, card titles, course names.
- **Body** (400, `clamp(0.95rem, 0.9rem + 0.3vw, 1.35rem)`, line-height 1.6): Course descriptions, instructional copy. Maximum line length 65–75ch.
- **Small** (400–500, `clamp(0.85rem, 0.8rem + 0.15vw, 1.05rem)`, line-height 1.5): Supporting metadata, timestamps, secondary labels.
- **Label** (600, 11px, letter-spacing 1.1px, uppercase): Section tags, category markers, status labels. Introduces content; never replaces a heading.

### Named Rules

**The Weight-Over-Size Rule.** Hierarchy is first expressed through weight (300 → 700), then size. Reaching for a larger size before exhausting weight contrast produces visual inflation. A 600-weight element reads more important than a 400-weight element at the same size — use that deliberately.

**The Label Ceiling Rule.** Label style (11px uppercase) appears for introduction and categorization only. It is never used for body copy or interactive labels on buttons. Below 11px is forbidden.

## 4. Elevation

Ambient and tinted. Shadows use the primary forest green as their base color (rgba(48, 70, 66, ...)), giving depth a brand character rather than the generic look of neutral-black drop shadows. At rest, surfaces are flat or minimally lifted. Shadow grows only on hover or as a structural separator. There are no decorative shadows.

### Shadow Vocabulary
- **Ambient Card** (`0 2px 8px rgba(48, 70, 66, 0.06), 0 8px 24px rgba(48, 70, 66, 0.08)`): Default card state. Present enough to define the edge, invisible enough to not distract.
- **Lifted Card** (`0 8px 16px rgba(48, 70, 66, 0.08), 0 24px 48px rgba(48, 70, 66, 0.12)`): Hover state on interactive cards. The surface rises to meet the cursor.
- **Header Rule** (`0 1px 0 rgba(48, 70, 66, 0.06)`): Hairline beneath the navigation header. Separates without dividing.
- **Achievement Depth** (`drop-shadow(0 10px 24px rgba(0,0,0,0.28))`): Badge panels only. Deeper and uncolored to support the weight these moments carry. The one exception to the tinted shadow rule.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow is a response to interaction (hover) or structural necessity (navigation separation). A static surface with a visible shadow is almost always wrong.

## 5. Components

Refined and restrained. Every component commits to its role with no decorative elaboration.

### Buttons
- **Shape:** Gently curved (14px radius — present but not pill-shaped)
- **Primary:** Tangerine (#FF5A00) background, white text, 14px 28px padding, 500 weight. One per view.
- **Hover:** Lifts 2px, shadow intensifies to `0 4px 12px rgba(255, 90, 0, 0.3)`. Color darkens to #D94E00.
- **Focus:** 2px solid tangerine ring, 2px offset. Visible at all times. Never suppressed.
- **Ghost:** 1px forest green border, forest green text, transparent background. For secondary actions alongside a primary.

### Cards / Course Cards
- **Corner Style:** Rounded (20px)
- **Background:** Card White (#FFFFFF)
- **Shadow:** Ambient Card at rest; Lifted Card on hover
- **Border:** None — shadow defines the edge
- **Internal Padding:** clamp(20px, 2.5vw, 48px)
- **Hover:** `translateY(-4px)` + Lifted Card shadow. No color or border changes.

### Progress Bar
- **Track:** Progress Gray (#EBEBEB), fully rounded
- **Fill:** Deep Forest Green (#304642) for completed segments; Tangerine for the active step
- **Shape:** Segmented to map to course structure — not a continuous fill. Progress is granular and readable.

### Chips / Tags
- **Default:** Tag Gray (#F0F0F0) background, Muted Sage text, 10px radius, 500 weight, Small font
- **Active / Selected:** Forest Green (#304642) background, white text. Weight stays at 500.
- **No hover state on static tags.** Interactive filter chips show active state only.

### Navigation / Header
- **Background:** Card White with header rule hairline
- **Links:** Muted Sage at rest → Forest Green on active. 500 weight. Tangerine underline on active state — not bold.
- **Mobile:** Nav hidden below 680px. Hamburger or simplified controls.

### Achievement Badges
The signature component. Hexagonal SVG badges on an inverted forest-green panel — the only surface in the product that inverts. This inversion gives the section its gravity.
- **Earned:** Full-color badge, Achievement Depth shadow, lifts and scales on hover (`translateY(-7px) scale(1.04)`)
- **Locked:** 50% opacity, minimal shadow, no hover. Present but passive — the contrast with earned badges is the point.
- **Sizing:** Fluid — fills available column width up to 240px, with `aspect-ratio: 1`

## 6. Do's and Don'ts

### Do:
- **Do** reserve Tangerine (#FF5A00) for exactly one primary action per view. One element per screen. Its scarcity is what makes it work.
- **Do** tint every shadow with forest green — `rgba(48, 70, 66, ...)`. If it looks gray, it's wrong.
- **Do** express hierarchy through Poppins weight contrast (300/400 → 600/700) before increasing font size.
- **Do** let the achievement panel invert to forest green — it earns the visual separation.
- **Do** use `translateY` lifts on interactive cards. The surface moves; nothing else changes.
- **Do** use Label style (11px, 600, uppercase, 1.1px tracking) to introduce sections, never as body or button text.
- **Do** keep line length at 65–75ch for body copy.

### Don't:
- **Don't** replicate LinkedIn Learning's dense chrome: stacked navigation layers, heavy borders, breadcrumbs + sidebar + topbar all visible simultaneously.
- **Don't** add Duolingo-style gamification: streaks, confetti, progress notifications mid-task, looping reward sounds or animations. Achievements appear once, at the right moment, with gravity.
- **Don't** use generic SaaS dashboard templates: big number, small label, gradient accent card, hero-metric grid.
- **Don't** use pure black (`#000`) or pure white (`#fff`) anywhere.
- **Don't** put Tangerine on decorative elements, secondary hover states, backgrounds, or icons.
- **Don't** introduce a second accent color. For more range, use opacity variants of forest green.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, callouts, or list items.
- **Don't** use gradient text (`background-clip: text` with a gradient). Emphasis is weight and size.
- **Don't** animate layout properties (width, height, padding, margin). Animate transform and opacity only.
