// MVP navigation contract: globe pose survives knowledge and comparison routes.
// Pure Node regression; real-browser acceptance remains separately required.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {knowledgeHref,globeReturnHref,readGlobeState,selectedId,withoutWorkspacePin} from './portal-state.mjs';
import {emptyWorkspace,pinWorkspace,normalizeWorkspace,navigateKnowledgeTrail,previousDiscoveryId,comparePins} from './discovery-workspace.mjs';
import {archiveGuide} from './archive-guide.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const ids=new Set(book.entries.map(x=>x.id));

test('three discoveries retain globe pose through knowledge, workspace and guide',()=>{
  const pose={angle:7.125,tilt:-0.42,edges:false,running:false};
  let workspace=emptyWorkspace();
  for(const id of ['lov3:0002','lov3:0003','lov3:0011']){
    const href=knowledgeHref(id,pose);
    const search=new URL(href,'https://lov3.invalid/').search;
    assert.equal(selectedId(search),id);
    assert.deepEqual(readGlobeState(search),pose);
    workspace=pinWorkspace(workspace,id,ids).state;
    workspace=navigateKnowledgeTrail(workspace,id,ids);
    assert.equal(globeReturnHref(search),'./explorer.html?angle=7.125&tilt=-0.42&edges=0&spin=0&selected='+encodeURIComponent(id));
  }
  assert.equal(workspace.pins.length,3);
  assert.equal(comparePins(book,workspace).length,3);
  const before=structuredClone(workspace);
  const guide=archiveGuide(book,'lov3:0011',workspace);
  assert.deepEqual(guide.pinnedContext.map(x=>x.id),['lov3:0002','lov3:0003']);
  assert.deepEqual(workspace,before);
  assert.equal(previousDiscoveryId(workspace,'lov3:0011',ids),'lov3:0003');
  const previous=navigateKnowledgeTrail(workspace,'lov3:0003',ids,true);
  assert.deepEqual(previous.trail,['lov3:0002','lov3:0003']);
  const pinSearch=new URL(knowledgeHref('lov3:0011',pose),'https://lov3.invalid/').search+'&pin=lov3%3A0011';
  assert.equal(new URLSearchParams(withoutWorkspacePin(pinSearch)).has('pin'),false);
  assert.deepEqual(readGlobeState(withoutWorkspacePin(pinSearch)),pose);
});

test('legacy extra pins cannot enter integrated guide or comparison journey',()=>{
  const state=normalizeWorkspace({capacity:6,pins:['lov3:0002','lov3:0003','lov3:0011','lov3:0005','lov3:0006']},ids);
  assert.deepEqual(state.pins,['lov3:0002','lov3:0003','lov3:0011']);
  assert.equal(comparePins(book,state).length,3);
  assert.deepEqual(archiveGuide(book,'lov3:0002',state).pinnedContext.map(x=>x.id),['lov3:0003','lov3:0011']);
});
