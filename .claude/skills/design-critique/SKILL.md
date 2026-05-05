---
name: design-critique
description: Critique UI/UX design and suggest improvements. Use when asked to "review my design", "critique the UI", "improve the UX", "design review", "make this look better", "accessibility audit", "design feedback", or "polish the interface".
---

# Design Critique

Perform a structured, expert-level UI/UX critique. Cover all applicable layers below, then output prioritized, actionable fixes.

## 1. Visual Hierarchy

Check:
- Is there a clear focal point on every screen?
- Does font weight/size/color guide the eye to the right call-to-action?
- Is whitespace used intentionally (not just as leftover space)?
- Are related elements visually grouped (Gestalt proximity)?

Flag: anything that competes for attention equally with the primary action.

## 2. Typography

Standards:
- Body text: 16px minimum, 1.5 line-height, max 75 chars per line
- Heading scale: use a consistent type scale (1.25× or 1.333× ratio)
- Never use more than 2 typefaces; 1 is often enough
- Avoid all-caps for body text; use sparingly for labels only

Flag: inconsistent sizing, thin weights on low-contrast backgrounds, orphaned words.

## 3. Color & Contrast

WCAG 2.2 AA minimums:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): 3:1
- UI components and icons: 3:1 against adjacent color
- Never rely on color alone to convey meaning (always pair with shape/label)

Flag: contrast failures, color-only error states, harsh pure-black (#000) on pure-white.

## 4. Spacing & Layout

Check:
- Is there a consistent spacing scale (e.g., 4px or 8px base grid)?
- Are tap targets minimum 44×44px on mobile?
- Is content aligned to a grid? Are breakpoints handled?
- Do forms have enough breathing room between fields?

Flag: misaligned elements, cramped inputs, inconsistent padding, broken mobile layouts.

## 5. Interaction & Feedback

Every interactive element needs:
- Visible hover state
- Visible focus state (keyboard-navigable, not just mouse)
- Active/pressed state
- Disabled state (if applicable)
- Loading state for async actions

Flag: buttons with no hover state, inputs with no focus ring, actions with no loading indicator.

## 6. Accessibility (WCAG 2.2)

- All images have descriptive `alt` text (or `alt=""` for decorative)
- Forms have associated `<label>` elements (not just placeholder text)
- Error messages are specific ("Enter a valid email" not "Invalid input")
- Modals trap focus and close on Escape
- Skip-to-main link exists on pages with nav
- No content flashes more than 3 times per second

## 7. UX Laws to Apply

- **Fitts's Law**: Make frequent/important targets larger and closer
- **Hick's Law**: Reduce choices; more options = slower decisions
- **Miller's Law**: Group items in chunks of 7±2
- **Jakob's Law**: Match conventions users already know (don't reinvent navigation)
- **Aesthetic–Usability Effect**: Good-looking interfaces are perceived as easier to use

## Output Format

```
## Critical (fix before shipping)
- [Issue] → [Specific fix]

## High (fix in next iteration)
- [Issue] → [Specific fix]

## Polish (nice to have)
- [Issue] → [Specific fix]

## What's working well
- [Element] — [why it works]
```

Always give the specific fix, not just the problem. Include code snippets for CSS/Tailwind changes where applicable.

$ARGUMENTS
