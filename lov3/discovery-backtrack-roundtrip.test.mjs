import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,recordVisit,navigateKnowledgeTrail,previousDiscoveryId} from './discovery-workspace.mjs';
import {knowledgeHref,readGlobeState,selectedId} from './portal-state.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const ids=new Set(book.entries.map(entry=>entry.id));

test('previous-discovery navigation consumes history rather than creating an A/B loop',()=>{
  let state=emptyWorkspace();
  for(const id of ['lov3:0001','lov3:0002','lov3:0003'])
    state=recordVisit(state,id,ids);
  const previous=previousDiscoveryId(state,'lov3:0003',ids);
  assert.equal(previous,'lov3:0002');
  state=navigateKnowledgeTrail(state,previous,ids,true);
  assert.deepEqual(state.trail,['lov3:0001','lov3:0002']);
  assert.equal(previousDiscoveryId(state,'lov3:0002',ids),'lov3:0001');
  state=navigateKnowledgeTrail(state,'lov3:0001',ids,true);
  assert.deepEqual(state.trail,['lov3:0001']);
  assert.equal(previousDiscoveryId(state,'lov3:0001',ids),null);
});

test('forged back requests cannot delete legitimate discovery history',()=>{
  let state=emptyWorkspace();
  for(const id of ['lov3:0001','lov3:0002','lov3:0003'])
    state=recordVisit(state,id,ids);
  const forged=navigateKnowledgeTrail(state,'lov3:0001',ids,true);
  assert.deepEqual(forged.trail,['lov3:0001','lov3:0002','lov3:0003','lov3:0001']);
  assert.deepEqual(navigateKnowledgeTrail(state,'lov3:9999',ids,true),state);
});

test('backtrack knowledge link retains exact saved globe orientation',()=>{
  let state=emptyWorkspace();
  state=recordVisit(state,'lov3:0001',ids);
  state=recordVisit(state,'lov3:0002',ids);
  const pose={angle:4.012345678901,tilt:-0.23456789,edges:false,running:false};
  const href=knowledgeHref(previousDiscoveryId(state,'lov3:0002',ids),pose);
  const search=new URL(href,'https://archive.example/lov3/').search;
  assert.equal(selectedId(search),'lov3:0001');
  assert.deepEqual(readGlobeState(search),pose);
});
