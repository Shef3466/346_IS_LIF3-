import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('knowledge-page source list does not equate editorial review with factual verification',()=>{
  assert.match(page,/li\(sources,source\.title\+' — '\+source\.kind\+'; '\+source\.reviewStatus\+'; factual verification not established',source\.url\)/);
});
test('source labels are text nodes and links are assigned without HTML interpolation',()=>{
  assert.match(page,/else item\.textContent=label;/);
  assert.match(page,/a\.href=href;a\.textContent=label;/);
});
