import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,normalizeWorkspace,readWorkspace,saveWorkspace,pinWorkspace,unpinWorkspace,setWorkspaceCapacity,nextPinFocus,recordVisit,previousDiscoveryId,comparePins,WORKSPACE_KEY} from './discovery-workspace.mjs';
import {knowledgeHref,readGlobeState,globeReturnHref,selectedId} from './portal-state.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const ids=new Set(book.entries.map(x=>x.id));
test('default four slots and opt-in six slots',()=>{
  let s=emptyWorkspace();assert.equal(s.capacity,4);
  s=setWorkspaceCapacity(s,6);assert.equal(s.capacity,6);
  assert.throws(()=>setWorkspaceCapacity(s,7),RangeError);
});
test('pin valid unique concepts; reject invalid and overflow',()=>{
  let s=emptyWorkspace();
  for(let i=1;i<=4;i++)s=pinWorkspace(s,'lov3:000'+i,ids).state;
  assert.equal(s.pins.length,4);
  assert.equal(pinWorkspace(s,'lov3:0001',ids).reason,'already-pinned');
  assert.equal(pinWorkspace(s,'lov3:0005',ids).reason,'full');
  assert.equal(pinWorkspace(s,'lov3:9999',ids).reason,'invalid');
  assert.equal(unpinWorkspace(s,'lov3:0002').pins.length,3);
});
test('unpin keeps keyboard focus on next or previous surviving discovery',()=>{
  const state={capacity:4,pins:['lov3:0001','lov3:0002','lov3:0003'],trail:[]};
  assert.equal(nextPinFocus(state,'lov3:0001'),'lov3:0002');
  assert.equal(nextPinFocus(state,'lov3:0002'),'lov3:0003');
  assert.equal(nextPinFocus(state,'lov3:0003'),'lov3:0002');
  assert.equal(nextPinFocus({...state,pins:['lov3:0001']},'lov3:0001'),null);
  assert.equal(nextPinFocus(state,'lov3:9999'),null);
  assert.deepEqual(state.pins,['lov3:0001','lov3:0002','lov3:0003']);
});
test('reducing capacity never silently discards pins',()=>{
  let s=setWorkspaceCapacity(emptyWorkspace(),6);
  for(let i=1;i<=5;i++)s=pinWorkspace(s,'lov3:000'+i,ids).state;
  assert.throws(()=>setWorkspaceCapacity(s,4),RangeError);
  assert.equal(s.pins.length,5);
});
test('session storage round trip and corrupted storage recovery',()=>{
  const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  let s=pinWorkspace(emptyWorkspace(),'lov3:0011',ids).state;
  s=recordVisit(s,'lov3:0011',ids);
  assert.equal(saveWorkspace(storage,s),true);
  assert.deepEqual(readWorkspace(storage,ids),s);
  mem.set(WORKSPACE_KEY,'{bad');
  assert.deepEqual(readWorkspace(storage,ids),emptyWorkspace());
  assert.deepEqual(readWorkspace({getItem(){throw Error('blocked');}},ids),emptyWorkspace());
  assert.equal(saveWorkspace({setItem(){throw Error('blocked');}},s),false);
});
test('sanitize stale, duplicated and unsafe IDs',()=>{
  const s=normalizeWorkspace({capacity:6,pins:['lov3:0001','lov3:0001','https://evil.test','lov3:9999','lov3:0012'],trail:['lov3:0001','x','lov3:0012']},ids);
  assert.deepEqual(s.pins,['lov3:0001','lov3:0012']);
  assert.deepEqual(s.trail,['lov3:0001','lov3:0012']);
});
test('history keeps at most 24 visits and avoids consecutive duplicates',()=>{
  let s=emptyWorkspace();
  for(let i=0;i<40;i++)s=recordVisit(s,i%2?'lov3:0001':'lov3:0002',ids);
  assert.equal(s.trail.length,24);
  assert.deepEqual(recordVisit(s,s.trail.at(-1),ids),s);
});
test('comparison uses only recorded classifications and explicit graph edges',()=>{
  const s={capacity:4,pins:['lov3:0002','lov3:0003','lov3:0011'],trail:[]};
  const pairs=comparePins(book,s);
  assert.equal(pairs.length,3);
  const p=pairs.find(x=>x.a==='lov3:0002'&&x.b==='lov3:0003');
  assert.equal(p.sameSubject,true);
  assert.equal(p.recordedLink,true);
  assert.equal(p.sameCategory,false);
  assert.deepEqual(p.recordedRelations,[{from:'lov3:0002',to:'lov3:0003',type:'relates-to',citationCount:0}]);
});
test('comparison preserves reverse direction and does not invent links',()=>{
  const state={capacity:4,pins:['lov3:0002','lov3:0011','lov3:0003'],trail:[]};
  const pairs=comparePins(book,state);
  const reverse=pairs.find(pair=>pair.a==='lov3:0002'&&pair.b==='lov3:0011');
  assert.deepEqual(reverse.recordedRelations,[{from:'lov3:0011',to:'lov3:0002',type:'relates-to',citationCount:0}]);
  const unrelated=pairs.find(pair=>pair.a==='lov3:0011'&&pair.b==='lov3:0003');
  assert.equal(unrelated.recordedLink,false);
  assert.deepEqual(unrelated.recordedRelations,[]);
});
test('comparison keeps both directions, relation types, and exact citation counts',()=>{
  const example={entries:[
    {id:'lov3:0001',subject:'Shared',category:'A',links:[{to:'lov3:0002',type:'supports',sourceIds:['a','b']}]},
    {id:'lov3:0002',subject:'Shared',category:'B',links:[{to:'lov3:0001',type:'questions'}]}
  ]};
  const [pair]=comparePins(example,{pins:['lov3:0001','lov3:0002']});
  assert.equal(pair.sameSubject,true);
  assert.equal(pair.sameCategory,false);
  assert.deepEqual(pair.recordedRelations,[
    {from:'lov3:0001',to:'lov3:0002',type:'supports',citationCount:2},
    {from:'lov3:0002',to:'lov3:0001',type:'questions',citationCount:0}
  ]);
});
test('previous discovery uses only valid tab visits and preserves navigation intent',()=>{
  let state=emptyWorkspace();
  state=recordVisit(state,'lov3:0001',ids);
  assert.equal(previousDiscoveryId(state,'lov3:0001',ids),null);
  state=recordVisit(state,'lov3:0002',ids);
  assert.equal(previousDiscoveryId(state,'lov3:0002',ids),'lov3:0001');
  state=recordVisit(state,'lov3:0001',ids);
  assert.equal(previousDiscoveryId(state,'lov3:0001',ids),'lov3:0002');
  assert.equal(previousDiscoveryId(state,'lov3:0002',ids),null);
  assert.equal(previousDiscoveryId(state,'lov3:9999',ids),null);
  assert.equal(previousDiscoveryId({trail:['lov3:0002','lov3:9999','lov3:0001']},'lov3:0001',ids),'lov3:0002');
  assert.equal(previousDiscoveryId({trail:['lov3:0001','lov3:0001']},'lov3:0001',ids),null);
  const pose={angle:2.314159265358979,tilt:-.31,edges:false,running:false};
  const href=knowledgeHref(previousDiscoveryId(state,'lov3:0001',ids),pose);
  const parsed=new URL(href,'https://archive.example/lov3/');
  assert.equal(selectedId(parsed.search),'lov3:0002');
  assert.deepEqual(readGlobeState(parsed.search),pose);
});
test('knowledge page exposes accessible previous-discovery navigation',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="previous-discovery"[^>]*hidden/);
  assert.match(html,/previousDiscoveryId\(history,id,ids\)/);
  assert.match(html,/knowledgeHref\(previous,state\)/);
});

test('workspace and knowledge page expose pinning and accessible navigation',()=>{
  const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
  const knowledge=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/id="capacity"/);
  assert.match(html,/comparePins\(book,state\)/);
  assert.match(html,/for\(const relation of pair\.recordedRelations\)/);
  assert.match(html,/relation\.citationCount/);
  assert.match(html,/No source-attributed images/);
  assert.match(knowledge,/id="pin-workspace"/);
  assert.match(knowledge,/recordVisit\(/);
});

test('workspace unpin handler restores keyboard focus and announces the result',()=>{
  const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
  assert.ok(html.includes('remove.dataset.unpinId=id'));
  assert.ok(html.includes('nextPinFocus(state,id)'));
  assert.ok(html.includes("querySelectorAll('button[data-unpin-id]')"));
  assert.ok(html.includes("(candidate??q('#capacity')).focus()"));
  assert.ok(html.includes("q('#status').textContent=identity.word+' unpinned"));
});
test('full globe → knowledge → pin → workspace → resume preserves the exact saved pose',()=>{
  const view={angle:5.12345678912345,tilt:-0.543210987654321,edges:false,running:true};
  const knowledge=knowledgeHref('lov3:0009',view);
  const search=new URL(knowledge,'https://archive.example/lov3/').search;
  const params=new URLSearchParams(search);
  params.set('pin','lov3:0009');
  const workspaceSearch='?'+params.toString();
  const storageMap=new Map();
  const storage={getItem:k=>storageMap.get(k)??null,setItem:(k,v)=>storageMap.set(k,v)};
  let state=recordVisit(readWorkspace(storage,ids),'lov3:0009',ids);
  state=pinWorkspace(state,params.get('pin'),ids).state;
  assert.equal(saveWorkspace(storage,state),true);
  const restored=readWorkspace(storage,ids);
  const resume=knowledgeHref(restored.trail.at(-1),readGlobeState(workspaceSearch));
  assert.equal(selectedId(new URL(resume,'https://archive.example/lov3/').search),'lov3:0009');
  const back=globeReturnHref(workspaceSearch);
  const returned=readGlobeState(new URL(back,'https://archive.example/lov3/').search);
  assert.equal(returned.angle,view.angle);
  assert.equal(returned.tilt,view.tilt);
  assert.equal(returned.edges,false);
  assert.equal(returned.running,false);
  assert.equal(selectedId(new URL(back,'https://archive.example/lov3/').search,'selected'),'lov3:0009');
});
test('workspace resume follows the latest valid history entry and vanishes after clearing',()=>{
  let state=recordVisit(emptyWorkspace(),'lov3:0001',ids);
  state=recordVisit(state,'lov3:0010',ids);
  assert.equal(state.trail.at(-1),'lov3:0010');
  const normalized=normalizeWorkspace({capacity:4,pins:[],trail:['lov3:0001','lov3:9999','lov3:0010']},ids);
  assert.equal(normalized.trail.at(-1),'lov3:0010');
  assert.equal(emptyWorkspace().trail.at(-1),undefined);
});
test('workspace page wires both globe links to saved orientation and resume to visit trail',()=>{
  const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
  assert.match(html,/id="explore-more"/);
  assert.match(html,/q\('#explore-more'\)\.href=q\('#back'\)\.href/);
  assert.match(html,/id="resume"[^>]*hidden/);
  assert.match(html,/const lastVisited=state\.trail\.at\(-1\)/);
  assert.match(html,/resume\.hidden=!lastVisited/);
  assert.match(html,/resume\.href=knowledgeHref\(lastVisited,stateView\)/);
});
