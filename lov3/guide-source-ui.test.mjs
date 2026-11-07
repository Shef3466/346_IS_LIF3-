import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('guide question source results explicitly distinguish review from verification',()=>{
  assert.match(page,/for\(const source of result\.sources\)/);
  assert.match(page,/source\.reviewStatus\+'; factual verification not established'/);
  assert.match(page,/source\.relation\?' · cited for '/);
});

test('guide question source links remain optional and text-only',()=>{
  assert.match(page,/li\(cited,source\.title[\s\S]*?,source\.url\);/);
  assert.match(page,/a\.textContent=label/);
});
