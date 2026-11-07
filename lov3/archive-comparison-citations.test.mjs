import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('pinned guide comparison cites only direct relationship sources with originating record',()=>{
  const copy=structuredClone(book);
  const a=copy.entries.find(e=>e.id==='lov3:0002');
  const b=copy.entries.find(e=>e.id==='lov3:0011');
  a.sources=[{id:'same',title:'Uncited entry note',kind:'project-note',reviewStatus:'reviewed'}];
  b.sources=[{id:'same',title:'Actual relation note',kind:'project-note',reviewStatus:'unreviewed',url:'https://example.org/relation'}];
  b.links.find(link=>link.to===a.id).sourceIds=['same'];
  const result=answerArchiveQuestion(copy,a.id,{pins:[b.id]},'Compare my pinned discoveries');
  assert.equal(result.kind,'comparison');
  assert.deepEqual(result.sources.map(s=>s.title),['Actual relation note']);
  assert.equal(result.sources[0].url,'https://example.org/relation');
  assert.match(result.sources[0].relation,/lov3:0011/);
  assert.match(result.answer,/does not establish factual verification/);
  const reverse=answerArchiveQuestion(copy,b.id,{pins:[a.id]},'Compare my pinned discoveries');
  assert.deepEqual(reverse.sources.map(s=>s.title),['Actual relation note']);
});

test('uncited entry sources are not shown as evidence for pinned comparisons',()=>{
  const copy=structuredClone(book);
  copy.entries.find(e=>e.id==='lov3:0002').sources=[{id:'note',title:'Not a link citation',kind:'primary',reviewStatus:'reviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0002',{pins:['lov3:0003']},'Compare pins');
  assert.deepEqual(result.sources,[]);
  assert.match(result.answer,/No direct-link source pointers/);
});
