import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace} from './discovery-workspace.mjs';
import {exportDiscoverySession,importDiscoverySession,MAX_TRANSFER_BYTES} from './workspace-transfer.mjs';

const ids=new Set(['lov3:0001','lov3:0002','lov3:0003']);
const edition='genesis-draft-001';
test('local export and import preserve valid pins, capacity and trail',()=>{
  const state={capacity:3,pins:['lov3:0002','lov3:0001'],trail:['lov3:0001','lov3:0002']};
  const exported=exportDiscoverySession(state,ids,edition);
  assert.deepEqual(importDiscoverySession(exported,ids,edition),{workspace:state,editionMatches:true});
  assert.ok(!exported.includes('credentials'));
});
test('import sanitizes stale IDs, duplicate pins, overflow and long history',()=>{
  const raw=JSON.stringify({schema:'lov3.discovery.session.v1',genesisEdition:'older-draft',workspace:{
    capacity:6,pins:['lov3:0001','lov3:9999','lov3:0001','lov3:0002'],
    trail:[...Array(30).fill('lov3:0003'),'https://evil.example','lov3:0002']
  }});
  const result=importDiscoverySession(raw,ids,edition);
  assert.equal(result.editionMatches,false);
  assert.deepEqual(result.workspace.pins,['lov3:0001','lov3:0002']);
  assert.equal(result.workspace.trail.length,24);
  assert.equal(result.workspace.trail.at(-1),'lov3:0002');
});
test('invalid, oversized and non-session files are rejected without fallback to empty state',()=>{
  assert.throws(()=>importDiscoverySession('{broken',ids,edition),/Invalid JSON/);
  assert.throws(()=>importDiscoverySession(JSON.stringify({schema:'wrong',workspace:emptyWorkspace()}),ids,edition),/Not a LOV3/);
  assert.throws(()=>importDiscoverySession(JSON.stringify({schema:'lov3.discovery.session.v1',genesisEdition:edition,workspace:[]}),ids,edition),/Not a LOV3/);
  assert.throws(()=>importDiscoverySession(JSON.stringify({schema:'lov3.discovery.session.v1',genesisEdition:edition,workspace:{}}),ids,edition),/Malformed LOV3/);
  assert.throws(()=>importDiscoverySession('x'.repeat(MAX_TRANSFER_BYTES+1),ids,edition),RangeError);
  assert.throws(()=>exportDiscoverySession(emptyWorkspace(),ids,''),/Missing Genesis/);
});
test('workspace provides keyboard-accessible local export and import controls',()=>{
  const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
  assert.match(html,/id="export-session"/);
  assert.match(html,/id="import-session"/);
  assert.match(html,/type="file"/);
  assert.match(html,/exportDiscoverySession\(state,ids,book\.edition\)/);
  assert.match(html,/importDiscoverySession\(text,ids,book\.edition\)/);
  assert.match(html,/MAX_TRANSFER_BYTES/);
  assert.match(html,/URL\.revokeObjectURL/);
});
