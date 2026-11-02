import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace,normalizeWorkspace,readWorkspace,saveWorkspace,pinWorkspace,unpinWorkspace,setWorkspaceCapacity,recordVisit,comparePins,WORKSPACE_KEY} from './discovery-workspace.mjs';
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
});
test('workspace and knowledge page expose pinning and accessible navigation',()=>{
  const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
  const knowledge=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/id="capacity"/);
  assert.match(html,/comparePins\(book,state\)/);
  assert.match(html,/No source-attributed images/);
  assert.match(knowledge,/id="pin-workspace"/);
  assert.match(knowledge,/recordVisit\(/);
});
