---
name: seo-audit
description: Audit and fix SEO issues in web pages or components. Use when asked to "audit SEO", "fix meta tags", "improve search ranking", "add structured data", "schema markup", "SEO review", "optimize for search", "add OG tags", or "improve crawlability".
---

# SEO Audit

Perform a structured technical and on-page SEO audit. Check each layer, output findings, then implement fixes.

## 1. Meta Tags

Required on every page:
```html
<title>Primary Keyword — Brand Name</title>           <!-- 50–60 chars -->
<meta name="description" content="...">               <!-- 150–160 chars, includes CTA -->
<link rel="canonical" href="https://...">             <!-- always present -->
```

Open Graph (social sharing):
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">             <!-- 1200×630px minimum -->
<meta property="og:url" content="...">
<meta property="og:type" content="website|article">
```

Twitter Card:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

Flag: missing canonical, duplicate titles, descriptions over 160 chars, missing OG image.

## 2. Heading Structure

Rules:
- One `<h1>` per page, contains primary keyword
- Headings are hierarchical (h1 → h2 → h3), never skip levels
- H1 is unique across the site
- Keywords appear naturally in h1 and at least one h2

Flag: multiple h1s, h1 inside components that renders on every page, missing h1.

## 3. Structured Data (JSON-LD)

Article pages:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Person", "name": "..." },
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "image": "https://..."
}
```

Course/learning content:
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "...",
  "description": "...",
  "provider": { "@type": "Organization", "name": "..." }
}
```

BreadcrumbList for nested pages. FAQ schema for FAQ sections. Add via `<script type="application/ld+json">` in `<head>`.

## 4. Technical SEO

Crawlability:
- `robots.txt` exists and doesn't block important paths
- XML sitemap exists at `/sitemap.xml`, submitted to Search Console
- No `noindex` on pages that should rank
- Internal links use `<a href>`, not JS-only navigation

Performance (Core Web Vitals targets):
- LCP < 2.5s — largest image/text block loads fast
- INP < 200ms — interactions respond quickly  
- CLS < 0.1 — no layout shifts from async-loaded content

Image optimization:
- All images have descriptive `alt` text with keywords where natural
- Images use `loading="lazy"` except above-the-fold LCP image
- LCP image uses `fetchpriority="high"`
- Modern formats (WebP/AVIF) with fallbacks

## 5. On-Page Content

- Primary keyword in first 100 words of body content
- Keyword density: 1–2% (natural usage, not stuffing)
- Internal links to related pages with descriptive anchor text (not "click here")
- External links to authoritative sources (where relevant) with `rel="noopener"`
- Content length: match or exceed top-ranking competitor pages for the target keyword

## 6. URL Structure

- Short, descriptive, lowercase, hyphens not underscores
- Include primary keyword: `/courses/now-dashboards` not `/courses/item?id=42`
- No trailing slashes inconsistency (pick one, enforce via redirect)

## Output Format

```
## Critical (blocks indexing)
- [Issue] → [Fix with code]

## High (hurts ranking)
- [Issue] → [Fix with code]

## Medium (optimization)
- [Issue] → [Fix with code]

## Quick wins (implement now)
- [Specific meta tag / structured data snippet ready to paste]
```

Always output ready-to-use code for meta tags and JSON-LD, not just descriptions.

$ARGUMENTS
