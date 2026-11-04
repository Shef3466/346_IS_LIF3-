import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('guide asks an evidence question for an actual suggested route',()=>{
  const result=archiveGuide(book,'lov3:0002');
  assert.equal(result.questions.length,1);
  assert.match(result.questions[0],/evidence supports or challenges/);
  assert.ok(result.questions[0].includes(result.nextChoice.title));
});

test('guide asks bounded questions about user-pinned concepts, not invented history',()=>{
  const result=archiveGuide(book,'lov3:0002',{pins:['lov3:0003','lov3:0003','unknown']});
  assert.equal(result.questions.length,1);
  assert.match(result.questions[0],/evidence could support or challenge/);
  assert.ok(result.questions[0].includes(result.pinnedContext[0].title));
});

test('guide handles isolated entries without inventing a destination',()=>{
  const isolated=structuredClone(book);
  isolated.entries.forEach(entry=>entry.links=[]);
  const result=archiveGuide(isolated,'lov3:0003');
  assert.equal(result.nextChoice,null);
  assert.match(result.questions[0],/Which other concept would you compare/);
});
