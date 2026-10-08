/*
  Detect the saved theme preference BEFORE the stylesheet is parsed so the
  splash background never flickers.  Mirrors the logic in ThemeContext.tsx:
    1. localStorage  →  2. OS prefers-color-scheme  →  3. default (light)

  Kept as an external file (not inline in index.html) so the
  Content-Security-Policy in web.config can use script-src 'self' without
  'unsafe-inline'.
*/
(function () {
  var stored;
  try { stored = localStorage.getItem('theme-mode'); } catch (_) { /* ignore */ }
  var prefersDark =
    !stored &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
