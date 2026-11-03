import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('pinned comparison sources distinguish review status from factual verification',()=>{
  assert.match(page,/for\(const source of other\.directLinkSources\)/);
  assert.match(page,/source\.kind\+'; '\+source\.reviewStatus\+'; factual verification not established \(record '\+source\.ownerId/);
  assert.match(page,/li\(sourceList,source\.title[\s\S]*?,source\.url\);/);
});

test('source rendering uses textContent rather than HTML injection',()=>{
  assert.match(page,/a\.textContent=label/);
});
