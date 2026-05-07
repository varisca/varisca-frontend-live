import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll all common roots — some mobile browsers use `documentElement` or `body` instead of `window`. */
function scrollViewportToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
}

/**
 * Reset scroll to the top on route changes. Runs in `useLayoutEffect` so it happens before paint
 * (avoids a flash of the previous page’s scroll position on mobile).
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    scrollViewportToTop();
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollViewportToTop);
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname, search]);

  return null;
};
