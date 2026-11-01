import test from 'node:test';
import assert from 'node:assert/strict';
import { projectConcepts, hitTestConcept, advanceAngle, canvasPixelSize } from './globe-geometry.mjs';

test('projection spreads nodes within sphere and produces finite coordinates', () => {
  const points = projectConcepts(13, .2, .12, 180);
  assert.equal(points.length, 13);
  assert.ok(points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.depth)));
  assert.ok(points.every(p => Math.hypot(p.x, p.y) <= 180.000001));
  assert.equal(new Set(points.map(p => p.i)).size, 13);
});

test('nearest visible node is selected, not a hidden point or first array match', () => {
  const points = [
    { i: 0, x: 2, y: 0, depth: -0.9 },
    { i: 1, x: 8, y: 0, depth: 0.7 },
    { i: 2, x: 3, y: 0, depth: 0.8 }
  ];
  assert.equal(hitTestConcept(points, 0, 0, 12), 2);
  assert.equal(hitTestConcept(points, 50, 0, 12), null);
});

test('rotation is time-based, paused when requested, and clamps resume jumps', () => {
  assert.equal(advanceAngle(.5, 16, false), .5);
  assert.ok(Math.abs(advanceAngle(.5, 16, true) - .5024) < 1e-9);
  assert.ok(Math.abs(advanceAngle(.5, 2000, true) - .5075) < 1e-9);
  assert.equal(advanceAngle(.5, -10, true), .5);
});

test('invalid geometry and hit-test inputs are rejected', () => {
  assert.throws(() => projectConcepts(-1, 0, 0, 100), RangeError);
  assert.throws(() => hitTestConcept([], NaN, 0), RangeError);
});

test('canvas resolution is crisp on standard and high-density displays', () => {
  assert.deepEqual(canvasPixelSize(320, 240, 1), { width: 320, height: 240 });
  assert.deepEqual(canvasPixelSize(320, 240, 3), { width: 640, height: 480 });
});

test('canvas resolution caps the pixel budget on large screens', () => {
  const size = canvasPixelSize(1200, 900, 3);
  assert.ok(size.width * size.height <= 1_500_000);
  assert.ok(size.width > 1200 && size.height > 900);
  const huge = canvasPixelSize(3000, 2000, 1);
  assert.ok(huge.width * huge.height <= 1_500_000);
});

test('canvas resolution rejects invalid dimensions and budgets', () => {
  assert.throws(() => canvasPixelSize(0, 200, 2), RangeError);
  assert.throws(() => canvasPixelSize(200, 200, NaN), RangeError);
  assert.throws(() => canvasPixelSize(200, 200, 2, 0), RangeError);
});
