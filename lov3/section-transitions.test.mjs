import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { initSectionTransitions, shouldAnimate } from './section-transitions.mjs';

function classes() {
  const values = new Set();
  return { add: x => values.add(x), remove: x => values.delete(x), contains: x => values.has(x) };
}
function fixture({ reduced = false, observerAvailable = true, count = 2 } = {}) {
  const elements = Array.from({ length: count }, () => ({ classList: classes() }));
  const root = { classList: classes() };
  let callback;
  const observed = [], unobserved = [];
  let disconnected = false, listener, removed = false;
  class Observer {
    constructor(fn, options) { callback = fn; this.options = options; }
    observe(el) { observed.push(el); }
    unobserve(el) { unobserved.push(el); }
    disconnect() { disconnected = true; }
  }
  const preference = {
    matches: reduced,
    addEventListener(_type, fn) { listener = fn; },
    removeEventListener(_type, fn) { removed = fn === listener; }
  };
  const doc = { documentElement: root, querySelectorAll: () => elements };
  const win = { matchMedia: () => preference };
  if (observerAvailable) win.IntersectionObserver = Observer;
  return { doc, win, elements, root, observed, unobserved,
    trigger: records => callback(records),
    change: matches => listener?.({ matches }),
    state: () => ({ disconnected, removed }) };
}

test('motion is enabled only with an observer and no reduced-motion preference', () => {
  assert.equal(shouldAnimate(false, true), true);
  assert.equal(shouldAnimate(true, true), false);
  assert.equal(shouldAnimate(false, false), false);
});

test('unsupported browser leaves every section visible without changing classes', () => {
  const f = fixture({ observerAvailable: false });
  assert.equal(initSectionTransitions(f.doc, f.win).enabled, false);
  assert.equal(f.root.classList.contains('motion-ready'), false);
});

test('reduced-motion preference avoids reveal animation entirely', () => {
  const f = fixture({ reduced: true });
  assert.equal(initSectionTransitions(f.doc, f.win).enabled, false);
  assert.equal(f.observed.length, 0);
});

test('visible sections reveal once and stop being observed', () => {
  const f = fixture();
  const controller = initSectionTransitions(f.doc, f.win);
  assert.equal(controller.enabled, true);
  assert.equal(f.root.classList.contains('motion-ready'), true);
  assert.equal(f.observed.length, 2);
  f.trigger([{ target: f.elements[0], isIntersecting: true },
    { target: f.elements[1], isIntersecting: false }]);
  assert.equal(f.elements[0].classList.contains('is-visible'), true);
  assert.equal(f.elements[1].classList.contains('is-visible'), false);
  assert.deepEqual(f.unobserved, [f.elements[0]]);
});

test('changing to reduced motion reveals all and disconnects observer', () => {
  const f = fixture();
  initSectionTransitions(f.doc, f.win);
  f.change(true);
  assert.equal(f.root.classList.contains('motion-ready'), false);
  assert.equal(f.elements.every(e => e.classList.contains('is-visible')), true);
  assert.deepEqual(f.state(), { disconnected: true, removed: true });
});

test('cleanup restores content and no-target pages do not animate', () => {
  const f = fixture();
  const controller = initSectionTransitions(f.doc, f.win);
  controller.disconnect();
  controller.disconnect();
  assert.equal(f.elements.every(e => e.classList.contains('is-visible')), true);
  assert.equal(f.root.classList.contains('motion-ready'), false);
  assert.equal(initSectionTransitions(fixture({ count: 0 }).doc, fixture({ count: 0 }).win).enabled, false);
});

test('actual homepage wires four sections and four cards to progressive reveals', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<section id="(?:philosophy|universe|worlds|about)" data-reveal>/g) || []).length, 4);
  assert.equal((html.match(/<div class="card" data-reveal>/g) || []).length, 4);
  assert.match(html, /initSectionTransitions\(\)/);
  assert.match(html, /prefers-reduced-motion:reduce/);
});
