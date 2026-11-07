import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,pinWorkspace,recordVisit,comparePins,normalizeWorkspace} from './discovery-workspace.mjs';
import {archiveGuide} from './archive-guide.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const validIds=new Set(book.entries.map(entry=>entry.id));

test('real pinned visitor journey supplies guide context without changing session',()=>{
  let state=emptyWorkspace();
  for(const id of ['lov3:0002','lov3:0003','lov3:0011']){
    const pin=pinWorkspace(state,id,validIds);
    assert.equal(pin.reason,'pinned');
    state=recordVisit(pin.state,id,validIds);
  }
  assert.equal(comparePins(book,state).length,3);
  const snapshot=structuredClone(state);
  const guide=archiveGuide(book,'lov3:0002',state);
  assert.deepEqual(guide.pinnedContext.map(item=>item.id),['lov3:0003','lov3:0011']);
  assert.equal(guide.questions.length,2);
  assert.deepEqual(state,snapshot);
  assert.match(guide.label,/not a live AI conversation/);
  assert.ok(guide.pinnedContext.every(item=>typeof item.provenance==='string'));
});

test('oversized legacy pins normalize to three before guide retrieval',()=>{
  const state=normalizeWorkspace({capacity:6,pins:['lov3:0002','lov3:0003','lov3:0011','lov3:0005','lov3:0006','lov3:0007']},validIds);
  assert.equal(state.capacity,3);
  assert.equal(state.pins.length,3);
  const guide=archiveGuide(book,'lov3:0002',state);
  assert.deepEqual(guide.pinnedContext.map(item=>item.id),['lov3:0003','lov3:0011']);
  assert.equal(comparePins(book,state).length,3);
});
