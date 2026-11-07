// Progressive, dependency-free reveal motion. Content remains visible if JS or IntersectionObserver is unavailable.
export function shouldAnimate(reducedMotion, observerAvailable) {
  return !Boolean(reducedMotion) && Boolean(observerAvailable);
}

export function initSectionTransitions(doc = globalThis.document, win = globalThis.window) {
  const inactive = { enabled: false, disconnect() {} };
  if (!doc?.documentElement || !win) return inactive;
  const preference = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!shouldAnimate(preference?.matches, typeof win.IntersectionObserver === 'function')) return inactive;
  const elements = [...doc.querySelectorAll('[data-reveal]')];
  if (elements.length === 0) return inactive;

  let stopped = false;
  const observer = new win.IntersectionObserver(records => {
    for (const record of records) {
      if (!record.isIntersecting) continue;
      record.target.classList.add('is-visible');
      observer.unobserve(record.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  function finish() {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    doc.documentElement.classList.remove('motion-ready');
    for (const element of elements) element.classList.add('is-visible');
    preference?.removeEventListener?.('change', onPreferenceChange);
  }
  function onPreferenceChange(event) {
    if (event.matches) finish();
  }

  preference?.addEventListener?.('change', onPreferenceChange);
  for (const element of elements) observer.observe(element);
  doc.documentElement.classList.add('motion-ready');
  return { enabled: true, disconnect: finish };
}
