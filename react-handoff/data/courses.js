/*
 * ============================================
 *  COURSE DATA
 * ============================================
 *
 *  Each course has:
 *    id          — unique identifier (used for localStorage progress keys)
 *    title       — display title
 *    description — 1-2 line subtitle (kept short to avoid truncation)
 *    duration    — human-readable duration string
 *    file        — course content filename (used to build navigation URL)
 *    thumbnail   — path to the card thumbnail image
 */

export const courses = [
  {
    id: 'intro',
    title: 'Intro to Inact - Inventory',
    description: 'The big picture of inventory: what to stock, how much, and why balance matters.',
    duration: '8 min',
    file: 'Intro.txt',
    thumbnail: '/assets/images/Course-thumbnails/IIntro.png',
  },
  {
    id: 'double-abc',
    title: 'Double ABC Analysis',
    description: 'Turn messy inventory into clear priorities with the Double ABC model.',
    duration: '15 min',
    file: 'Double-ABC-Analysis-4.txt',
    thumbnail: '/assets/images/Course-thumbnails/DABC.png',
  },
  {
    id: 'stock-policy',
    title: 'Stock Policy',
    description: 'Decide what belongs on the shelf vs. buy-to-order and apply it in Inact.',
    duration: '10 min',
    file: 'Stock-Policy.txt',
    thumbnail: '/assets/images/Course-thumbnails/SP.png',
  },
  {
    id: 'safety-stock',
    title: 'Safety Stock',
    description: 'Set the right buffer using variance, lead time, and service level.',
    duration: '12 min',
    file: 'Safety-Stock.txt',
    thumbnail: '/assets/images/Course-thumbnails/SS.png',
  },
  {
    id: 'reorder-point',
    title: 'Reorder Point',
    description: 'Learn the reorder point formula and automate it in Inact Now.',
    duration: '10 min',
    file: 'Reorder-Point.txt',
    thumbnail: '/assets/images/Course-thumbnails/RP.png',
  },
  {
    id: 'reorder-quantity',
    title: 'Reorder Quantity',
    description: 'Find the right order size by balancing price, demand, and turnover.',
    duration: '12 min',
    file: 'Reorder-Quantity.txt',
    thumbnail: '/assets/images/Course-thumbnails/RQ.png',
  },
];

/*
 * Helper: parse "8 min" → 8
 */
export function parseMinutes(durationText) {
  const m = String(durationText || '').match(/(\d+)\s*min/i);
  return m ? parseInt(m[1], 10) : 0;
}

/*
 * Helper: 67 → "1.1 hours", 8 → "8 min"
 */
export function formatTotalTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = totalMinutes / 60;
  return `${hours.toFixed(1)} hours`;
}

