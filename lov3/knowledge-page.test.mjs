import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const explorer=readFileSync(new URL('./explorer.html',import.meta.url),'utf8');
const knowledge=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('globe remains a portal with separate knowledge page navigation',()=>{
  assert.match(explorer,/knowledgeHref\(e\.id/);
  assert.match(explorer,/if\(hit!==null\)openKnowledge\(hit\)/);
  assert.match(explorer,/Open selected knowledge page/);
  assert.match(knowledge,/import \{archiveGuide\}/);
});
test('knowledge page offers safe return and accessible related records',()=>{
  assert.match(knowledge,/globeReturnHref\(location\.search\)/);
  assert.match(knowledge,/id="related"/);
  assert.match(knowledge,/aria-labelledby="guide-heading"/);
  assert.match(knowledge,/q\('#title'\)\.textContent/);
});
test('prototype states source and AI limitations',()=>{
  assert.match(knowledge,/Not a live conversational AI/);
  assert.match(knowledge,/No source-attributed images/);
  assert.match(knowledge,/not independently verified claims/);
});
