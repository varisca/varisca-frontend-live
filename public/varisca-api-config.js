/**
 * Loaded before the app bundle. Forces the correct API origin on the live site
 * even if an old/cached JS bundle still points at *.railway.app or localhost.
 * Safe for local dev: only sets when hostname is varisca.in / www.
 */
(function () {
  try {
    var h = location.hostname;
    if (h === 'varisca.in' || h === 'www.varisca.in') {
      // window.__VARISCA_API_BASE__ = 'https://api.varisca.in/api';
      window.__VARISCA_API_BASE__ = 'https://varisca-backend-live.vercel.app/api';
    }
  } catch (e) { /* ignore */ }
})();
