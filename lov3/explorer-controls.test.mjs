import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextEntryIndex, initialAutoRotate, focusRestoredKnowledgeControl } from './explorer-controls.mjs';

const html = readFileSync(new URL('./explorer.html', import.meta.url), 'utf8');

test('navigation starts at first or last concept', () => {
  assert.equal(nextEntryIndex(null, 13, 1), 0);
  assert.equal(nextEntryIndex(null, 13, -1), 12);
});
test('navigation wraps in both directions', () => {
  assert.equal(nextEntryIndex(12, 13, 1), 0);
  assert.equal(nextEntryIndex(0, 13, -1), 12);
  assert.equal(nextEntryIndex(4, 13, 1), 5);
});
test('empty lists and invalid inputs are handled', () => {
  assert.equal(nextEntryIndex(null, 0, 1), null);
  assert.throws(() => nextEntryIndex(13, 13, 1), RangeError);
  assert.throws(() => nextEntryIndex(null, 13, 0), RangeError);
  assert.throws(() => nextEntryIndex(null, -1, 1), RangeError);
});
test('reduced-motion preference disables initial automatic rotation', () => {
  assert.equal(initialAutoRotate(true), false);
  assert.equal(initialAutoRotate(false), true);
});
test('explorer exposes keyboard-friendly navigation and selected state', () => {
  assert.match(html, /id="previous"/);
  assert.match(html, /id="next"/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /ArrowDown/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /nextEntryIndex/);
});

test('returning to a selected globe concept restores keyboard focus without scrolling', () => {
  let options;
  const control={focus(value){options=value;}};
  assert.equal(focusRestoredKnowledgeControl(control,3),true);
  assert.deepEqual(options,{preventScroll:true});
  assert.equal(focusRestoredKnowledgeControl(control,-1),false);
  assert.equal(focusRestoredKnowledgeControl(null,3),false);
});
test('explorer focuses its open-knowledge control only after a valid restored selection', () => {
  assert.match(html,/if\(restoredIndex>=0\)\{select\(restoredIndex\);focusRestoredKnowledgeControl\(open,restoredIndex\);\}/);
  assert.match(html,/selectionStatus\.textContent='Selected '/);
});
