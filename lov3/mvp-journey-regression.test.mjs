import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,pinWorkspace,recordVisit,navigateKnowledgeTrail,previousDiscoveryId,comparePins,normalizeWorkspace} from './discovery-workspace.mjs';
import {knowledgeHref,readGlobeState,globeReturnHref,selectedId} from './portal-state.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const ids=new Set(book.entries.map(entry=>entry.id));

test('three-route visitor journey: compare, backtrack, return to exact globe pose',()=>{
  const pose={angle:4.87654321098765,tilt:-0.456789123,edges:false,running:false};
  let state=emptyWorkspace();
  for(const id of ['lov3:0002','lov3:0003','lov3:0011']){
    const result=pinWorkspace(state,id,ids);
    assert.equal(result.reason,'pinned');
    state=recordVisit(result.state,id,ids);
  }
  assert.equal(pinWorkspace(state,'lov3:0004',ids).reason,'full');
  assert.equal(comparePins(book,state).length,3);
  assert.equal(previousDiscoveryId(state,'lov3:0011',ids),'lov3:0003');

  state=navigateKnowledgeTrail(state,'lov3:0003',ids,true);
  assert.deepEqual(state.trail,['lov3:0002','lov3:0003']);
  assert.equal(previousDiscoveryId(state,'lov3:0003',ids),'lov3:0002');
  state=navigateKnowledgeTrail(state,'lov3:0002',ids,true);
  assert.deepEqual(state.trail,['lov3:0002']);
  assert.equal(previousDiscoveryId(state,'lov3:0002',ids),null);

  const href=knowledgeHref('lov3:0002',pose);
  const search=new URL(href,'https://example.test/lov3/').search;
  assert.deepEqual(readGlobeState(search),pose);
  const globe=new URL(globeReturnHref(search),'https://example.test/lov3/');
  assert.deepEqual(readGlobeState(globe.search),pose);
  assert.equal(selectedId(globe.search,'selected'),'lov3:0002');
  assert.deepEqual(state.pins,['lov3:0002','lov3:0003','lov3:0011']);
});

test('legacy six-route session never expands comparison journey',()=>{
  const state=normalizeWorkspace({capacity:6,pins:[
    'lov3:0002','lov3:0003','lov3:0011','lov3:0004','lov3:0005','lov3:0006'
  ],trail:['lov3:0002','lov3:0003','lov3:0011']},ids);
  assert.equal(state.capacity,3);
  assert.equal(state.pins.length,3);
  assert.equal(comparePins(book,state).length,3);
});
