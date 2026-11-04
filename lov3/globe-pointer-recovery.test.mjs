import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./explorer.html', import.meta.url), 'utf8');

test('globe recovers after pointer capture is unexpectedly lost', () => {
  assert.match(html, /addEventListener\('lostpointercapture',\s*\(\)\s*=>\s*\{drag=null;inertiaVelocity=0;scheduleDraw\(\);\}\)/);
  assert.match(html, /addEventListener\('pointercancel',\s*\(\)\s*=>\s*\{drag=null;inertiaVelocity=0;scheduleDraw\(\);\}\)/);
});
