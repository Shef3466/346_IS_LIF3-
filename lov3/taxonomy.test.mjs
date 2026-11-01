import test from 'node:test';
import assert from 'node:assert/strict';
import { conceptIdentity, globeLabel } from './taxonomy.mjs';

test('subject, category and word precede optional number', () => {
  const item = conceptIdentity({ subject:'Creation', category:'Philosophy', word:'LOV3', number:'3' });
  assert.deepEqual(item.path, ['Creation','Philosophy','LOV3','3']);
});

test('no number is fabricated from a technical ID or a title', () => {
  const item = conceptIdentity({ id:'lov3:0013', title:'The 72 Angles', subject:'Geometry', category:'Angles', word:'Angles' });
  assert.equal(item.number, null);
  assert.deepEqual(item.path, ['Geometry','Angles','Angles']);
});

test('legacy entries have meaningful visible fallback labels', () => {
  assert.deepEqual(conceptIdentity({ id:'lov3:0001', title:'Observation' }).path,
    ['Unclassified subject','Unclassified category','Observation']);
});

test('globe labels use words instead of entry indices and truncate long text', () => {
  assert.equal(globeLabel({word:'Reciprocity'}), 'Reciprocity');
  assert.equal(globeLabel({word:'Nothing New Under the Sun'}, 12), 'Nothing New…');
  assert.throws(() => globeLabel({word:'LOV3'}, 1), RangeError);
});
