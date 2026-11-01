import test from 'node:test';
import assert from 'node:assert/strict';
import { projectConcepts, hitTestConcept, advanceAngle } from './globe-geometry.mjs';

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
