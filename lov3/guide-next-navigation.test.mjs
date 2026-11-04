import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';
import {knowledgeHref,readGlobeState} from './portal-state.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('nextChoice is an existing record and preserves the globe pose',()=>{
  const state=readGlobeState('?id=lov3%3A0009&angle=1.25&tilt=0.3&edges=0');
  const next=archiveGuide(book,'lov3:0009').nextChoice;
  assert.ok(next);
  assert.ok(book.entries.some(entry=>entry.id===next.id));
  const href=knowledgeHref(next.id,state);
  assert.match(href,/knowledge\.html\?/);
  const params=new URL(href,'https://example.test/lov3/').searchParams;
  assert.equal(params.get('id'),next.id);
  assert.equal(Number(params.get('angle')),state.angle);
  assert.equal(Number(params.get('tilt')),state.tilt);
});

test('knowledge page renders nextChoice as an actual keyboard-focusable anchor',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/<a id="guide-next-link"[^>]+hidden>/);
  assert.match(html,/if\(guide\.nextChoice && ids\.has\(guide\.nextChoice\.id\)\)/);
  assert.match(html,/nextLink\.href=knowledgeHref\(guide\.nextChoice\.id,state\)/);
  assert.match(html,/nextLink\.hidden=false/);
  assert.doesNotMatch(html,/<button id="guide-next-link"/);
});


test('recommended navigation shows its editorial evidence boundary next to the link',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.ok(html.includes('<p id="guide-next-evidence" class="note" hidden></p>'));
  assert.ok(html.includes("evidenceNote.textContent='Recommended link evidence: '+guide.nextChoice.evidenceStatus"));
  assert.ok(html.includes('evidenceNote.hidden=false'));
  const next=archiveGuide(book,'lov3:0009').nextChoice;
  assert.ok(next);
  assert.match(next.evidenceStatus,/factual verification not established/);
});
