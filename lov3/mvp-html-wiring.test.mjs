// Browser-page wiring smoke checks; not a substitute for real-browser acceptance.
// Guard the integrated MVP's public HTML entry points against missing handlers.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=name=>readFileSync(new URL(name,import.meta.url),'utf8');

test('globe is a discovery portal and opens a separate knowledge page',()=>{
  const page=html('./explorer.html');
  assert.match(page,/knowledgeHref\(e\.id,/);
  assert.match(page,/window\.location\.assign\(knowledgeHref/);
  assert.match(page,/prefers-reduced-motion/);
  assert.match(page,/canvas\.addEventListener\('keydown'/);
});
test('knowledge page provides archive guide, relationship links and exact globe return',()=>{
  const page=html('./knowledge.html');
  assert.match(page,/globeReturnHref\(location\.search\)/);
  assert.match(page,/knowledgeHref\(link\.id,state\)/);
  assert.match(page,/archiveGuide\(book,id,history\)/);
  assert.match(page,/answerArchiveQuestion\(book,id,history,question\)/);
  assert.match(page,/navigateKnowledgeTrail\(/);
});
test('workspace exposes only three routes and persists pin, compare and history UI',()=>{
  const page=html('./discovery.html');
  assert.match(page,/pinWorkspace\(state,requested,ids\)/);
  assert.match(page,/comparePins\(book,state\)/);
  assert.match(page,/saveWorkspace\(storage,state\)/);
  assert.match(page,/state\.trail/);
  assert.match(page,/withoutWorkspacePin\(location\.search\)/);
  assert.match(page,/three-route limit/);
});
