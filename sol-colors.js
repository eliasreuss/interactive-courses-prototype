/* Path colours.
   Each learning path (solution) has ONE base colour. Every tint used on cards,
   tiles, pills and borders is derived from it here, at fixed OKLCH lightness
   steps, so all paths sit at the same visual weight. To add or change a path
   colour, change only its base colour in SOL_BASES.

   Scripted pages:  solColors(SOL_BASES[key]) → { bar, wash, tint, soft, line, edge, ink }
   Static pages:    solApply(key) in <head> sets --path-bar/-wash/-tint/-soft/
                    -line/-edge/-ink/-pill/-glow on <html> for the stylesheet to use. */
(function () {
  const SOL_BASES = {
    functionality: '#5888D0', // Software · Inact Now
    inventory:     '#B8964E', // What to stock?
    suppliers:     '#7B68AA', // How to source?
    products:      '#B69E16', // What to offer?
    customers:     '#8A9672', // Who to serve?
  };

  // l = OKLCH lightness, c = share of the base colour's chroma
  const ROLES = {
    wash: { l: 0.988, c: 0.14 }, // large surfaces: path card, thumbnails
    tint: { l: 0.972, c: 0.24 }, // icon circles on tiles, card tops, badges
    soft: { l: 0.925, c: 0.42 }, // buttons, icon circles, pills
    line: { l: 0.885, c: 0.36 }, // borders
    edge: { l: 0.620, c: 1.00 }, // selected-state stroke, ≥3:1 on wash and page bg
  };
  const INK = '#304642';

  const toLin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const toSrgb = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

  function hexToOklch(hex) {
    const [r, g, b] = [1, 3, 5].map(i => toLin(parseInt(hex.slice(i, i + 2), 16)));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    return [L, Math.hypot(A, B), Math.atan2(B, A)];
  }

  function oklchToRgb(L, C, h) {
    const A = C * Math.cos(h), B = C * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
  }

  function oklchToHex(L, C, h) {
    let rgb = oklchToRgb(L, C, h);
    while (rgb.some(v => v < 0 || v > 1) && C > 0) { C -= 0.002; rgb = oklchToRgb(L, C, h); }
    return '#' + rgb.map(v => Math.round(Math.min(1, Math.max(0, toSrgb(v))) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  window.solColors = function (base) {
    const [, c, h] = hexToOklch(base);
    const out = { bar: base, ink: INK };
    for (const [role, r] of Object.entries(ROLES)) out[role] = oklchToHex(r.l, c * r.c, h);
    return out;
  };

  const rgba = (hex, a) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

  window.SOL_BASES = SOL_BASES;
  window.solApply = function (key) {
    const c = window.solColors(SOL_BASES[key]);
    const s = document.documentElement.style;
    for (const role of ['bar', 'wash', 'tint', 'soft', 'line', 'edge', 'ink']) s.setProperty('--path-' + role, c[role]);
    s.setProperty('--path-pill', rgba(c.soft, 0.4));
    s.setProperty('--path-glow', rgba(c.bar, 0.22));
  };
})();
