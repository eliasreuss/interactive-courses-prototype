# Graph Report - flows-prototype_2  (2026-09-15)

## Corpus Check
- 86 files · ~5,316,623 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1279 nodes · 1961 edges · 87 communities (86 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07334f53`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- live-server.mjs
- modern-screenshot.umd.js
- live-browser.js
- live-accept.mjs
- live.md
- live-inject.mjs
- resumeSession
- design-parser.mjs
- handleClick
- layout.md
- document.md
- 5. Components
- onboard.md
- React Handoff — Learning Path Hub
- The Toolkit
- Polish Systematically
- el
- Delight Techniques
- animate.md
- colorize.md
- Interaction Design
- Component Spacing
- 5. Component Specifications
- HubPage.jsx
- Phase 1: Discovery Interview
- UX Writing
- renderAllPins
- OWASP Top 10 Checklist (2025)
- Implement Adaptations
- Improve Copy Systematically
- refreshParamsPanel
- Tone of Voice: Inact Now Insight Walkthroughs
- Color & Contrast
- Craft Flow
- critique.md
- Simplify the Design
- Hardening Dimensions
- cleanup-deprecated.mjs
- Clean Code
- Code You Need
- Nielsen's 10 Heuristics
- quieter.md
- Typography
- detect-csp.mjs
- pin.mjs
- Responsive Design
- captureElementToBlob
- Design Critique
- DEVELOPER_SPECIFICATION.md
- Key Breakpoints
- Common Cognitive Load Violations
- Generate Combined Critique Report
- Product register
- Shared design laws
- SEO Audit
- Product
- profile-overlay.js
- Interactive courses prototype
- Diagnostic Scan
- typeset.md
- Brand register
- Cognitive Load Assessment
- Extract Flow
- Motion Design
- optimize.md
- Persona-Based Design Testing
- SKILL.md
- 6. Animations
- Extract Design Language
- Generate Report
- Amplify the Design
- Teach Flow
- Step 3: Ask strategic questions (for PRODUCT.md)
- Fluid Typography (Scales from 768px to 1920px viewport)
- Typography
- Optimization Strategy
- Improve Typography Systematically
- Token Saver
- 10. Technical Notes
- Recommended Image Dimensions
- bolder.md
- Step 3: Land the Visual Direction (Capability-Gated)
- Building Functional Palettes
- Font Selection & Pairing
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `handleClick()` - 18 edges
2. `handleKeyDown()` - 18 edges
3. `resumeSession()` - 18 edges
4. `Component Spacing` - 18 edges
5. `updateBarContent()` - 15 edges
6. `renderDesignVisual()` - 15 edges
7. `handleGo()` - 14 edges
8. `wrapCli()` - 14 edges
9. `Polish Systematically` - 14 edges
10. `el()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `collectColorValues()` --indirect_call--> `v()`  [INFERRED]
  .agents/skills/impeccable/scripts/design-parser.mjs → .agents/skills/impeccable/scripts/modern-screenshot.umd.js
- `buildParamsPanel()` --indirect_call--> `v()`  [INFERRED]
  .agents/skills/impeccable/scripts/live-browser.js → .agents/skills/impeccable/scripts/modern-screenshot.umd.js
- `renderColorTiles()` --indirect_call--> `v()`  [INFERRED]
  .agents/skills/impeccable/scripts/live-browser.js → .agents/skills/impeccable/scripts/modern-screenshot.umd.js
- `renderOverviewCollapsible()` --indirect_call--> `k()`  [INFERRED]
  .agents/skills/impeccable/scripts/live-browser.js → .agents/skills/impeccable/scripts/modern-screenshot.umd.js
- `wrapCli()` --indirect_call--> `q()`  [INFERRED]
  .agents/skills/impeccable/scripts/live-wrap.mjs → .agents/skills/impeccable/scripts/modern-screenshot.umd.js

## Import Cycles
- None detected.

## Communities (87 total, 1 thin omitted)

### Community 0 - "live-server.mjs"
Cohesion: 0.05
Nodes (68): firstExisting(), getDesignSidecarCandidates(), getDesignSidecarPath(), getImpeccableDir(), getLegacyLiveConfigPath(), getLegacyLiveServerPath(), getLegacyLiveSessionsDir(), getLiveAnnotationsDir() (+60 more)

### Community 1 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (53): ae(), be(), bt(), Ce(), Ct(), de(), dt(), _e() (+45 more)

### Community 2 - "live-browser.js"
Cohesion: 0.11
Nodes (40): buildCollapsible(), buildColorModels(), buildDesignHeader(), buildListHtml(), buildRadiiModels(), buildTypographyModels(), copyToClipboard(), cssSafe() (+32 more)

### Community 3 - "live-accept.mjs"
Cohesion: 0.11
Nodes (38): hasGeneratedHeader(), HEADER_MARKERS, isGeneratedFile(), isGitIgnored(), acceptCli(), argVal(), deindentContent(), detectCommentSyntax() (+30 more)

### Community 4 - "live.md"
Cohesion: 0.05
Nodes (37): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Write all variants in a single edit, 7. Parameters (composition-sized, 0–4 per variant), 8. Signal done (+29 more)

### Community 5 - "live-inject.mjs"
Cohesion: 0.10
Nodes (33): __dirname, ensureServerRunning(), globToRegex(), appendOriginToDirective(), buildTagBlock(), commentClose(), commentOpen(), CONFIG_PATH (+25 more)

### Community 6 - "resumeSession"
Cohesion: 0.11
Nodes (33): actionLabel(), buildConfigureRow(), buildConfirmedRow(), buildDots(), buildGeneratingRow(), buildSavingRow(), checkpointPayload(), clearHandled() (+25 more)

### Community 7 - "design-parser.mjs"
Cohesion: 0.16
Nodes (31): buildColor(), CANONICAL_SECTIONS, collectBullets(), collectColorValues(), collectParagraphs(), detectFormat(), extractColors(), extractComponents() (+23 more)

### Community 8 - "handleClick"
Cohesion: 0.14
Nodes (30): cleanup(), closeTunePopover(), connectSSE(), desc(), handleAccept(), handleClick(), handleDiscard(), handleKeyDown() (+22 more)

### Community 9 - "layout.md"
Cohesion: 0.07
Nodes (27): Assess Current Layout, Break Card Grid Monotony, Choose the Right Layout Tool, Create Visual Rhythm, Establish a Spacing System, Improve Layout Systematically, Live-mode signature params, Manage Depth & Elevation (+19 more)

### Community 10 - "document.md"
Cohesion: 0.08
Nodes (24): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Confirm seed mode, Step 1: Find the design assets (+16 more)

### Community 11 - "5. Components"
Cohesion: 0.08
Nodes (23): 1. Overview, 2. Colors: The Clear Path Palette, 3. Typography, 4. Elevation, 5. Components, 6. Do's and Don'ts, Achievement Badges, Buttons (+15 more)

### Community 12 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 13 - "React Handoff — Learning Path Hub"
Cohesion: 0.09
Nodes (21): 1. Copy the folder, 2. Install the font, 3. Import global styles, 4. Use the page component, Animations, Colors, 🧩 Component Reference, `<CourseCard />` (+13 more)

### Community 14 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 15 - "Polish Systematically"
Cohesion: 0.10
Nodes (19): Clean Up, Code Quality, Color & Contrast, Content & Copy, Design System Discovery, Edge Cases & Error States, Final Verification, Forms & Inputs (+11 more)

### Community 16 - "el"
Cohesion: 0.20
Nodes (20): barPaletteForTheme(), buildParamsPanel(), defangOutsideHandlers(), designPanelCss(), detectPageTheme(), el(), formatRangeValue(), init() (+12 more)

### Community 17 - "Delight Techniques"
Cohesion: 0.11
Nodes (18): Appropriate to Context, Assess Delight Opportunities, Celebration Moments, Compound Over Time, Delight Amplifies, Never Blocks, Delight Principles, Delight Techniques, Easter Eggs & Hidden Delights (+10 more)

### Community 18 - "animate.md"
Cohesion: 0.11
Nodes (17): Accessibility, Assess Animation Opportunities, CSS Animations, Delight Moments, Entrance Animations, Feedback & Guidance, Implement Animations, JavaScript Animation (+9 more)

### Community 19 - "colorize.md"
Cohesion: 0.11
Nodes (17): Accent Color Application, Accessibility, Assess Color Opportunity, Background & Surfaces, Balance & Refinement, Borders & Accents, Cohesion, Data Visualization (+9 more)

### Community 20 - "Interaction Design"
Cohesion: 0.11
Nodes (18): Anti-Patterns, CSS Anchor Positioning, Destructive Actions: Undo > Confirm, Dropdown & Overlay Positioning, Fixed Positioning Fallback, Focus Rings: Do Them Right, Form Design: The Non-Obvious, Gesture Discoverability (+10 more)

### Community 21 - "Component Spacing"
Cohesion: 0.11
Nodes (18): Buttons, Card Content, Card Footer, Card Title, Component Spacing, Content Area, Content Card, Header (+10 more)

### Community 22 - "5. Component Specifications"
Cohesion: 0.12
Nodes (17): 5. Component Specifications, Buttons, Card Scroll Wrapper, Content Card, Flip Cards (if used), Header, Hero Slide, Image Container (+9 more)

### Community 23 - "HubPage.jsx"
Cohesion: 0.15
Nodes (7): CourseCard(), GRAD_DIRS, CourseGrid(), HeroHeader(), NOTE: If you're NOT using react-router, replace, TopNav(), courses

### Community 24 - "Phase 1: Discovery Interview"
Cohesion: 0.12
Nodes (15): Anti-Goals, Brief Structure, Constraints, Content & Data, Design Direction, How to use the probes, Important limits, Interview cadence (+7 more)

### Community 25 - "UX Writing"
Cohesion: 0.12
Nodes (16): Avoid Redundant Copy, Confirmation Dialogs: Use Sparingly, Consistency: The Terminology Problem, Don't Blame the User, Empty States Are Opportunities, Error Message Templates, Error Messages: The Formula, Form Instructions (+8 more)

### Community 26 - "renderAllPins"
Cohesion: 0.23
Nodes (16): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clearAnnotations(), finalizeEditingPin(), initAnnotOverlay(), localCoords() (+8 more)

### Community 27 - "OWASP Top 10 Checklist (2025)"
Cohesion: 0.12
Nodes (15): A01 — Broken Access Control, A02 — Cryptographic Failures, A03 — Injection, A04 — Insecure Design, A05 — Security Misconfiguration, A06 — Vulnerable Components, A07 — Authentication Failures, A08 — Software & Data Integrity (+7 more)

### Community 28 - "Implement Adaptations"
Cohesion: 0.13
Nodes (14): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+6 more)

### Community 29 - "Improve Copy Systematically"
Cohesion: 0.13
Nodes (14): Apply Clarity Principles, Assess Current Copy, Button & CTA Text, Confirmation Dialogs, Empty States, Error Messages, Form Labels & Instructions, Help Text & Tooltips (+6 more)

### Community 30 - "refreshParamsPanel"
Cohesion: 0.22
Nodes (15): applyParamDefaults(), applyParamValue(), buildCyclingRow(), closedClipPath(), getVisibleVariantEl(), hideParamsPanel(), navBtn(), openTunePopover() (+7 more)

### Community 31 - "Tone of Voice: Inact Now Insight Walkthroughs"
Cohesion: 0.15
Nodes (12): Connective vocabulary, Emphasis, How to handle numbers in the copy, Naming things, Opening and closing language, Pronouns, Sentence patterns to reuse, The test (+4 more)

### Community 32 - "Color & Contrast"
Cohesion: 0.17
Nodes (11): Alpha Is A Design Smell, Color & Contrast, Color Spaces: Use OKLCH, Contrast & Accessibility, Dangerous Color Combinations, Dark Mode Is Not Inverted Light Mode, Never Use Pure Gray or Pure Black, Testing (+3 more)

### Community 33 - "Craft Flow"
Cohesion: 0.17
Nodes (12): Build Gate, Craft Contract, Craft Flow, Critique and fix loop, Production bar, Required viewport pass, Step 1: Shape the Design, Step 2: Load References (+4 more)

### Community 34 - "critique.md"
Cohesion: 0.17
Nodes (9): Action Summary, Ask the User, Assessment A: LLM Design Review, Assessment B: Automated Detection, Gather Assessments, Recommended Actions, Heuristics Scoring Guide, Issue Severity (P0–P3) (+1 more)

### Community 35 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 36 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 37 - "cleanup-deprecated.mjs"
Cohesion: 0.30
Nodes (11): buildTargetNames(), cleanSkillsLock(), cleanup(), DEPRECATED_NAMES, findProjectRoot(), findSkillsDirs(), HARNESS_DIRS, isImpeccableSkill() (+3 more)

### Community 38 - "Clean Code"
Cohesion: 0.17
Nodes (11): 1. Naming, 2. Function Quality, 3. Conditionals, 4. DRY (Don't Repeat Yourself), 5. Error Handling, 6. Dead Code, 7. Complexity Metrics, 8. SOLID Principles (object-oriented code) (+3 more)

### Community 39 - "Code You Need"
Cohesion: 0.17
Nodes (11): 1. Storage utilities, 2. Hook for the learning path hub (course cards), 3. Example: Course card component, 4. Course player — save/restore logic, 5. Full course player example (minimal), Code You Need, Course Progress & Resume — Developer Guide, How You'll Do It in React (+3 more)

### Community 40 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 41 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Register, Simplification (+2 more)

### Community 42 - "Typography"
Cohesion: 0.18
Nodes (11): Accessibility Considerations, Classic Typography Principles, Fluid Type, Modern Web Typography, Modular Scale & Hierarchy, OpenType Features, Readability & Measure, Rendering polish (+3 more)

### Community 43 - "detect-csp.mjs"
Cohesion: 0.36
Nodes (10): detectCsp(), INLINE_HEADER_SIGNALS, LAYOUT_EXTS, MONOREPO_HELPER_SIGNALS, NUXT_ROUTE_RULES_SIGNALS, NUXT_SECURITY_SIGNALS, SCAN_EXTS, SKIP_DIRS (+2 more)

### Community 44 - "pin.mjs"
Cohesion: 0.25
Nodes (9): __dirname, findHarnessDirs(), generatePinnedSkill(), HARNESS_DIRS, loadCommandMetadata(), pin(), root, unpin() (+1 more)

### Community 45 - "Responsive Design"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 46 - "captureElementToBlob"
Cohesion: 0.20
Nodes (10): bufferToBase64(), captureAndEmit(), captureElementToBlob(), collectFontCssText(), compileShader(), inlineFontUrls(), isTransparentColor(), loadModernScreenshot() (+2 more)

### Community 47 - "Design Critique"
Cohesion: 0.20
Nodes (9): 1. Visual Hierarchy, 2. Typography, 3. Color & Contrast, 4. Spacing & Layout, 5. Interaction & Feedback, 6. Accessibility (WCAG 2.2), 7. UX Laws to Apply, Design Critique (+1 more)

### Community 48 - "DEVELOPER_SPECIFICATION.md"
Cohesion: 0.20
Nodes (9): 1. Color Palette, 3. Spacing & Layout, 8. Media Queries Summary, Fluid Spacing, Key Media Queries, Mobile First Approach, Overview, Primary Colors (+1 more)

### Community 49 - "Key Breakpoints"
Cohesion: 0.20
Nodes (10): > 1440px (Large Screens), 1441px - 1920px (Large Desktop - 1920×1080 monitors), 4. Responsive Breakpoints, ≤ 680px (Mobile), ≤ 768px (Mobile/Tablet), 769px - 980px (Narrow Desktop), ≤ 900px (Tablet/Mobile), 901px - 1440px (Medium Screens - MacBook Air 13") (+2 more)

### Community 50 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 51 - "Generate Combined Critique Report"
Cohesion: 0.22
Nodes (9): Anti-Patterns Verdict, Design Health Score, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+1 more)

### Community 52 - "Product register"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Product bans (on top of the shared absolute bans), Product permissions, Product register, The product slop test (+1 more)

### Community 53 - "Shared design laws"
Cohesion: 0.22
Nodes (9): Absolute bans, Color, Copy, Layout, Motion, Shared design laws, The AI slop test, Theme (+1 more)

### Community 54 - "SEO Audit"
Cohesion: 0.22
Nodes (8): 1. Meta Tags, 2. Heading Structure, 3. Structured Data (JSON-LD), 4. Technical SEO, 5. On-Page Content, 6. URL Structure, Output Format, SEO Audit

### Community 55 - "Product"
Cohesion: 0.22
Nodes (8): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product, Product Purpose, Register, Users

### Community 56 - "profile-overlay.js"
Cohesion: 0.39
Nodes (7): buildHTML(), getUser(), init(), initials(), learnStats(), pathPct(), saveUser()

### Community 57 - "Interactive courses prototype"
Cohesion: 0.22
Nodes (8): Course content, Developer docs, Interactive courses prototype, License, Main pages, Quick start, Repository layout (high level), Video and media

### Community 58 - "Diagnostic Scan"
Cohesion: 0.25
Nodes (7): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Anti-Patterns (CRITICAL), Diagnostic Scan, Recommended Actions

### Community 59 - "typeset.md"
Cohesion: 0.29
Nodes (5): Assess Current Typography, Live-mode signature params, Plan Typography Improvements, Register, Verify Typography Improvements

### Community 60 - "Brand register"
Cohesion: 0.25
Nodes (8): Brand bans (on top of the shared absolute bans), Brand permissions, Brand register, Color, Imagery, Layout, Motion, The brand slop test

### Community 61 - "Cognitive Load Assessment"
Cohesion: 0.25
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 62 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 63 - "Motion Design"
Cohesion: 0.25
Nodes (8): Duration: The 100/300/500 Rule, Easing: Pick the Right Curve, Motion Design, Perceived Performance, Performance, Premium Motion Materials, Reduced Motion, Staggered Animations

### Community 64 - "optimize.md"
Cohesion: 0.25
Nodes (7): Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), First Input Delay (FID < 100ms) / INP (< 200ms), Largest Contentful Paint (LCP < 2.5s), Performance Monitoring, Verify Improvements

### Community 65 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 66 - "SKILL.md"
Cohesion: 0.25
Nodes (6): 1. Context gathering, 2. Register, Commands, Pin / Unpin, Routing rules, Setup (non-optional)

### Community 67 - "6. Animations"
Cohesion: 0.25
Nodes (8): 6. Animations, Button Hover, Card Entry Animation, Hero Image Entry Animation, Hero Image Float Animation, Hero Text Entry Animation, Image Container Hover, Progress Fill

### Community 68 - "Extract Design Language"
Cohesion: 0.29
Nodes (6): Additional Commands, Extract Design Language, Options, Output Files (8), Prerequisites, Process

### Community 69 - "Generate Report"
Cohesion: 0.29
Nodes (7): Anti-Patterns Verdict, Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Positive Findings

### Community 70 - "Amplify the Design"
Cohesion: 0.29
Nodes (7): Amplify the Design, Color Intensification, Composition Boldness, Motion & Animation, Spatial Drama, Typography Amplification, Visual Effects

### Community 71 - "Teach Flow"
Cohesion: 0.29
Nodes (6): Step 1: Load current state, Step 2: Explore the codebase, Step 4: Write PRODUCT.md, Step 5: Decide on DESIGN.md, Step 6: Confirm and wrap up, Teach Flow

### Community 72 - "Step 3: Ask strategic questions (for PRODUCT.md)"
Cohesion: 0.29
Nodes (7): Accessibility & Inclusion, Brand & Personality, Interview mode, not confirmation mode, Minimum viable interview, Register (ask first; it shapes everything below), Step 3: Ask strategic questions (for PRODUCT.md), Users & Purpose

### Community 73 - "Fluid Typography (Scales from 768px to 1920px viewport)"
Cohesion: 0.29
Nodes (7): 2. Typography, Base Sizes (Desktop), Fluid Typography (Scales from 768px to 1920px viewport), Font Family, Line Heights, Medium Screens (901px - 1440px), TOC Typography

### Community 74 - "Typography"
Cohesion: 0.33
Nodes (6): Font selection procedure, Pairing and voice, Reflex-reject aesthetic lanes, Reflex-reject list, Scale, Typography

### Community 75 - "Optimization Strategy"
Cohesion: 0.33
Nodes (6): Animation Performance, Loading Performance, Network Optimization, Optimization Strategy, React/Framework Optimization, Rendering Performance

### Community 76 - "Improve Typography Systematically"
Cohesion: 0.33
Nodes (6): Establish Hierarchy, Fix Readability, Font Selection, Improve Typography Systematically, Refine Details, Weight Consistency

### Community 77 - "Token Saver"
Cohesion: 0.33
Nodes (5): Context Hygiene, Output Rules (apply to every response), Reading Rules, Response Length Targets, Token Saver

### Community 78 - "10. Technical Notes"
Cohesion: 0.33
Nodes (6): 10. Technical Notes, Clamp Function, Markdown Format, Object Fit, Overflow Handling, Z-Index Layers

### Community 79 - "Recommended Image Dimensions"
Cohesion: 0.33
Nodes (6): 7. Image Specifications, Image Optimization, Large Images, Other Sizes, Recommended Image Dimensions, Third Images

### Community 80 - "bolder.md"
Cohesion: 0.40
Nodes (4): Assess Current State, Plan Amplification, Register, Verify Quality

### Community 82 - "Step 3: Land the Visual Direction (Capability-Gated)"
Cohesion: 0.40
Nodes (5): Approval loop, Mock fidelity inventory, Purpose, Step 3: Land the Visual Direction (Capability-Gated), What to generate

### Community 83 - "Building Functional Palettes"
Cohesion: 0.50
Nodes (4): Building Functional Palettes, Palette Structure, The 60-30-10 Rule (Applied Correctly), Tinted Neutrals

### Community 84 - "Font Selection & Pairing"
Cohesion: 0.50
Nodes (4): Anti-reflexes worth defending against, Font Selection & Pairing, Pairing Principles, Web Font Loading

## Knowledge Gaps
- **664 isolated node(s):** `DEPRECATED_NAMES`, `HARNESS_DIRS`, `SKILL_FINGERPRINTS`, `CANONICAL_SECTIONS`, `NUXT_ROUTE_RULES_SIGNALS` (+659 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `v()` connect `modern-screenshot.umd.js` to `el`, `live-browser.js`, `design-parser.mjs`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `collectColorValues()` connect `design-parser.mjs` to `modern-screenshot.umd.js`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `buildParamsPanel()` connect `el` to `modern-screenshot.umd.js`, `live-browser.js`, `refreshParamsPanel`, `resumeSession`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `handleClick()` (e.g. with `init()` and `teardown()`) actually correct?**
  _`handleClick()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `handleKeyDown()` (e.g. with `init()` and `teardown()`) actually correct?**
  _`handleKeyDown()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DEPRECATED_NAMES`, `HARNESS_DIRS`, `SKILL_FINGERPRINTS` to the rest of the system?**
  _667 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `live-server.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05123456790123457 - nodes in this community are weakly interconnected._