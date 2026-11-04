import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('guide suggests an actual outgoing graph destination with explicit evidence boundary',()=>{
  const r=archiveGuide(book,'lov3:0002');
  assert.equal(r.nextChoice.id,'lov3:0003');
  assert.equal(r.nextChoice.direction,'outgoing');
  assert.match(r.nextChoice.evidenceStatus,/factual verification not established/);
  assert.match(r.next,/Explore The Continuous Cycle/);
});
test('guide prefers an editorially cited outgoing route but never calls it verified',()=>{
  const copy=structuredClone(book);
  const current=copy.entries.find(e=>e.id==='lov3:0002');
  current.sources=[{id:'note:one',title:'Test note',kind:'project-note',reviewStatus:'unreviewed'}];
  current.links.find(l=>l.to==='lov3:0004').sourceIds=['note:one'];
  const r=archiveGuide(copy,current.id);
  assert.equal(r.nextChoice.id,'lov3:0004');
  assert.match(r.nextChoice.evidenceStatus,/editorial source pointers attached/);
  assert.match(r.nextChoice.evidenceStatus,/factual verification not established/);
});
test('guide offers incoming route when no outgoing route exists',()=>{
  const r=archiveGuide(book,'lov3:0003');
  assert.equal(r.nextChoice.id,'lov3:0002');
  assert.equal(r.nextChoice.direction,'incoming');
});
test('guide makes no fabricated destination for isolated concept',()=>{
  const copy=structuredClone(book);
  copy.entries.forEach(e=>e.links=[]);
  const r=archiveGuide(copy,'lov3:0003');
  assert.equal(r.nextChoice,null);
  assert.match(r.next,/propose a connection/);
});
