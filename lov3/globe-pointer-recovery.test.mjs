import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./explorer.html', import.meta.url), 'utf8');

test('globe recovers after interrupted pointer capture', () => {
  assert.match(html, /addEventListener\('lostpointercapture',\s*\(\)\s*=>\s*\{if\(drag\)\{drag=null;inertiaVelocity=0;scheduleDraw\(\);\}\}\)/);
  assert.match(html, /addEventListener\('pointercancel',\s*\(\)\s*=>\s*\{drag=null;inertiaVelocity=0;scheduleDraw\(\);\}\)/);
});

test('normal pointer release keeps drag momentum until the animation decays it', () => {
  assert.match(html, /drag=null;scheduleDraw\(\);\}\);/);
  assert.doesNotMatch(html, /addEventListener\('lostpointercapture',\s*\(\)\s*=>\s*\{drag=null;inertiaVelocity=0/);
});
