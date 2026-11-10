// Tokens from DESIGN.md and course.html (Inact Learn). Course specific colours
// sampled from the course artwork go in `artwork` below, never inline in scenes.

export const color = {
  forestGreen: '#304642',
  forestGreenLight: '#3d5a54',
  tangerine: '#FF5A00',
  offWhite: '#F9F7F5',
  cardWhite: '#FFFFFF',
  mutedSage: '#8A9A97',
  tagGray: '#F0F0F0',
  progressGray: '#EBEBEB',
  artworkPanel: '#F9F9F4',
  rowDivider: '#E7E7E7',
};

/** Colours sampled from this course's artwork, with the image each came from. */
export const artwork: Record<string, string> = {};

export const radius = {lg: 20, md: 14, sm: 10};

export const shadow = {
  ambient: '0 2px 8px rgba(48, 70, 66, 0.06), 0 8px 24px rgba(48, 70, 66, 0.08)',
  lifted: '0 8px 16px rgba(48, 70, 66, 0.08), 0 24px 48px rgba(48, 70, 66, 0.12)',
};

export const font = "'Poppins', sans-serif";

// DESIGN.md label style (600, uppercase, 0.1em tracking) scaled for 1080p.
export const labelStyle = {
  fontFamily: font,
  fontWeight: 600,
  fontSize: 22,
  letterSpacing: 2.2,
  textTransform: 'uppercase' as const,
  color: color.mutedSage,
};

/** Type scale at 1080p. Nothing on screen is smaller than `small`. */
export const type = {
  hero: 104,
  title: 64,
  heading: 52,
  subheading: 40,
  body: 30,
  small: 24,
};

/** Safe area. Content stays inside these lines; the header owns the top band. */
export const safe = {left: 120, right: 1800, top: 120, bottom: 980};
