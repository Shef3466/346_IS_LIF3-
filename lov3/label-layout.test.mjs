import test from 'node:test';
import assert from 'node:assert/strict';
import { placeGlobeLabels } from './label-layout.mjs';

test('selected meaning-first label wins when two labels collide', () => {
  const points = [{ i: 0, x: 0, y: 0, depth: .8 }, { i: 1, x: 2, y: 0, depth: .9 }];
  const labels = placeGlobeLabels(points, 0, () => 70, 300, 200);
  assert.deepEqual([...labels.keys()], [0]);
});

test('narrow screens omit colliding labels without hiding nodes', () => {
  const points = [{ i: 0, x: -5, y: 0, depth: .5 }, { i: 1, x: 5, y: 0, depth: .6 }];
  assert.equal(placeGlobeLabels(points, null, () => 65, 180, 140).size, 1);
  assert.equal(points.length, 2);
});

test('back-side labels are hidden except a selected concept', () => {
  const points = [{ i: 0, x: 0, y: 0, depth: -.5 }];
  assert.equal(placeGlobeLabels(points, null, () => 40, 300, 200).size, 0);
  assert.equal(placeGlobeLabels(points, 0, () => 40, 300, 200).size, 1);
});

test('selected label stays within the available canvas width', () => {
  const points = [{ i: 3, x: 95, y: 0, depth: .7 }];
  const labels = placeGlobeLabels(points, 3, () => 70, 220, 140);
  assert.ok(labels.get(3).x >= -102);
  assert.ok(labels.get(3).x + 70 <= 102);
});
