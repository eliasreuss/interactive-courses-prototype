/*
 * ============================================
 *  TopNav — Sticky top navigation bar
 * ============================================
 *
 *  Props: none (static for now)
 *
 *  Contains:
 *    - Logo ("Inact learn")
 *    - Navigation links (Home, Learning Paths, Catalog, Dictionary)
 *    - BETA badge
 *
 *  Notes:
 *    - "Home", "Catalog", "Dictionary" are locked (grayed + lock icon).
 *    - "Learning Paths" is active.
 *    - Sticky at top with frosted backdrop blur.
 */

import React from 'react';
import './TopNav.css';

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <div className="top-nav__logo">
          Inact <span>learn</span>
        </div>

        <nav className="top-nav__links">
          <a href="#" className="top-nav__link top-nav__link--locked">
            Home
            <LockIcon />
          </a>
          <a href="#" className="top-nav__link top-nav__link--active">
            Learning Paths
          </a>
          <a href="#" className="top-nav__link top-nav__link--locked">
            Catalog
            <LockIcon />
          </a>
          <a href="#" className="top-nav__link top-nav__link--locked">
            Dictionary
            <LockIcon />
          </a>
        </nav>
      </div>

      <div className="top-nav__right">
        <span className="top-nav__beta">BETA</span>
      </div>
    </header>
  );
}

/* Inline lock icon (small SVG) */
function LockIcon() {
  return (
    <svg
      className="top-nav__lock-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

