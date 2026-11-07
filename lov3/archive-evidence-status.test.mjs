import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';

const genesis=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('comparison provenance labels editorial review without claiming factual verification',()=>{
  const book=structuredClone(genesis);
  const current=book.entries.find(e=>e.id==='lov3:0002');
  const linked=book.entries.find(e=>e.id==='lov3:0011');
  assert.ok(current && linked);
  linked.sources=[{id:'review-note',title:'Editorial review note',kind:'project-note',reviewStatus:'reviewed'}];
  linked.links.find(link=>link.to===current.id).sourceIds=['review-note'];
  const comparison=archiveGuide(book,current.id,{pins:[linked.id]}).pinnedContext[0];
  const source=comparison.directLinkSources[0];
  assert.equal(source.ownerId,linked.id);
  assert.equal(source.kind,'project-note');
  assert.equal(source.reviewStatus,'reviewed');
  assert.match(source.evidenceStatus,/factual verification not established/);
  assert.doesNotMatch(source.evidenceStatus,/independently verified/);
});

test('unreviewed citation remains explicitly unverified',()=>{
  const book=structuredClone(genesis);
  const current=book.entries.find(e=>e.id==='lov3:0002');
  const linked=book.entries.find(e=>e.id==='lov3:0011');
  linked.sources=[{id:'note',title:'Pending note',kind:'secondary',reviewStatus:'unreviewed'}];
  linked.links.find(link=>link.to===current.id).sourceIds=['note'];
  const source=archiveGuide(book,current.id,{pins:[linked.id]}).pinnedContext[0].directLinkSources[0];
  assert.equal(source.kind,'secondary');
  assert.match(source.evidenceStatus,/unreviewed; factual verification not established/);
});
