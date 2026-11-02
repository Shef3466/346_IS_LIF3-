import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,recordVisit,navigateKnowledgeTrail,previousDiscoveryId} from './discovery-workspace.mjs';
import {knowledgeHref,readGlobeState,selectedId} from './portal-state.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const ids=new Set(book.entries.map(entry=>entry.id));
const A='lov3:0001',B='lov3:0002',C='lov3:0003';
const pose={angle:2.314159265358979,tilt:-0.31,edges:false,running:false};
function visits(...values){return values.reduce((s,id)=>recordVisit(s,id,ids),emptyWorkspace());}

test('Previous discovery walks A → B → C backward without a ping-pong loop',()=>{
  let state=visits(A,B,C);
  assert.equal(previousDiscoveryId(state,C,ids),B);
  const href=knowledgeHref(B,pose)+'&trail=back';
  const url=new URL(href,'https://archive.example/lov3/');
  assert.equal(selectedId(url.search),B);
  assert.deepEqual(readGlobeState(url.search),pose);
  state=navigateKnowledgeTrail(state,B,ids,url.searchParams.get('trail')==='back');
  assert.deepEqual(state.trail,[A,B]);
  assert.equal(previousDiscoveryId(state,B,ids),A);
  state=navigateKnowledgeTrail(state,A,ids,true);
  assert.deepEqual(state.trail,[A]);
  assert.equal(previousDiscoveryId(state,A,ids),null);
});

test('refreshing a previous page is idempotent and preserves pins',()=>{
  const state={...visits(A,B),pins:[A,C]};
  const returned=navigateKnowledgeTrail(state,A,ids,true);
  assert.deepEqual(returned.trail,[A]);
  assert.deepEqual(navigateKnowledgeTrail(returned,A,ids,true),returned);
  assert.deepEqual(returned.pins,[A,C]);
});

test('stale, unrelated, or invalid back requests never discard the trail',()=>{
  const state=visits(A,B,C);
  assert.deepEqual(navigateKnowledgeTrail(state,A,ids,true).trail,[A,B,C,A]);
  assert.deepEqual(navigateKnowledgeTrail(state,'lov3:9999',ids,true),state);
  assert.deepEqual(navigateKnowledgeTrail(state,B,ids,false).trail,[A,B,C,B]);
  assert.deepEqual(navigateKnowledgeTrail(emptyWorkspace(),B,ids,true).trail,[B]);
});

test('knowledge page wires explicit back intent and keeps the original globe pose',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/navigateKnowledgeTrail\\(readWorkspace\\(storage,ids\\),id,ids,/);
  assert.match(html,/knowledgeHref\\(previous,state\\)\\+'\\&trail=back'/);
  assert.match(html,/globeReturnHref\\(location\\.search\\)/);
});
