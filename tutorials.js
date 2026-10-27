// Tutorials: standalone Supademo walkthroughs. The catalog lists them as their
// own resource type, and course.html?tutorial=<id> plays one full-bleed
// without the course TOC or progress bar. A tutorial with a pathId also counts
// towards that learning path's contents on its catalog card.
window.TUTORIALS = [
  {
    id: 'navigating-actions',
    title: 'Navigating Actions',
    description: 'Click through the Actions list in Inact Now: open an Action, filter it, and sort it.',
    duration: '3 min',
    embed: 'https://app.supademo.com/embed/cmsmyqc0t1l4wqmijssv5ryyx?embed_v=2&utm_source=embed',
    category: 'functionality',
    added: '2026-10-26',
  },
  {
    id: 'safety-stock-simulation',
    title: 'Safety Stock Simulation',
    description: 'Click through the Safety Stock / Simulation Insight and see how the service level changes the safety stock you need.',
    duration: '3 min',
    embed: 'https://app.supademo.com/embed/cmlb0od6v3p73vhwzylb5iood?embed_v=2&utm_source=embed',
    category: 'inventory',
    pathId: 'inventory-management',
    added: '2026-10-28',
  },
];
