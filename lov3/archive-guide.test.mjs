import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
test('archive guide retrieves a real draft record without inventing a definition',()=>{
  const r=archiveGuide(book,'lov3:0010');
  assert.equal(r.identity.word,'Flower of Life');
  assert.match(r.introduction,/unpublished editorial draft/);
  assert.match(r.evidence,/No editorial sources/);
  assert.equal(r.coverage.sourceCount,0);
  assert.equal(r.sources.length,0);
});
test('outgoing and incoming relationships are distinguished',()=>{
  const a=archiveGuide(book,'lov3:0009');
  assert.deepEqual(a.outgoing.map(x=>x.id),['lov3:0010']);
  assert.deepEqual(a.incoming.map(x=>x.id),['lov3:0008']);
  assert.equal(a.outgoing[0].type,'relates-to');
});
test('guide reports actual editorial review status without overstating it',()=>{
  const copy=structuredClone(book);
  copy.entries[0].sources=[
    {id:'source:1',title:'Test note',kind:'project-note',reviewStatus:'unreviewed'},
    {id:'source:2',title:'Reviewed record',kind:'primary',reviewStatus:'reviewed',url:'https://example.org/record'}
  ];
  const r=archiveGuide(copy,'lov3:0001');
  assert.equal(r.coverage.reviewedCount,1);
  assert.match(r.evidence,/1 of 2/);
});
test('unknown record fails clearly rather than fabricating an answer',()=>{
  assert.throws(()=>archiveGuide(book,'lov3:9999'),/Unknown archive concept/);
});
test('all 13 current Genesis entries can be retrieved',()=>{
  for(const entry of book.entries) assert.equal(archiveGuide(book,entry.id).entry.id,entry.id);
});

test('guide compares only existing pinned editorial relationships',()=>{
  const r=archiveGuide(book,'lov3:0002',{pins:['lov3:0003','lov3:0011','lov3:0005']});
  assert.deepEqual(r.pinnedContext.map(x=>x.id),['lov3:0003','lov3:0011','lov3:0005']);
  assert.match(r.pinnedContext[0].relationship,/same recorded subject/);
  assert.match(r.pinnedContext[0].relationship,/direct editorial graph link/);
  assert.match(r.pinnedContext[1].relationship,/same recorded subject/);
  assert.match(r.pinnedContext[2].relationship,/no shared classification or direct graph link recorded/);
});
test('guide ignores stale, duplicated, current, and malformed pin IDs',()=>{
  const r=archiveGuide(book,'lov3:0009',{pins:['lov3:0009','lov3:9999',null,'lov3:0010','lov3:0010']});
  assert.deepEqual(r.pinnedContext.map(x=>x.id),['lov3:0010']);
  assert.equal(archiveGuide(book,'lov3:0009').pinnedContext.length,0);
});
test('knowledge page wires current tab pins to contextual guide and safe links',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/archiveGuide\(book,id,history\)/);
  assert.match(html,/id="guide-context"/);
  assert.match(html,/knowledgeHref\(other.id,state\)/);
});

test('archive guide accepts at most three unique valid comparison contexts without inventing relationships',()=>{
  const r=archiveGuide(book,'lov3:0002',{pins:['lov3:0002','lov3:0003','lov3:0003','lov3:0011','lov3:0005','lov3:0006','lov3:0007']});
  assert.deepEqual(r.pinnedContext.map(x=>x.id),['lov3:0003','lov3:0011','lov3:0005']);
  assert.equal(r.pinnedContext.length,3);
});


test('pinned guide comparisons disclose missing provenance and actual source pointers',()=>{
  const plain=archiveGuide(book,'lov3:0002',{pins:['lov3:0003','lov3:0005']});
  assert.deepEqual(plain.pinnedContext[0].directLinkSourceIds,[]);
  assert.match(plain.pinnedContext[0].provenance,/no attached source pointers/);
  assert.match(plain.pinnedContext[1].provenance,/no direct editorial link/);
  const copy=structuredClone(book);
  copy.entries[1].sources=[{id:'test:note',title:'Editorial draft note',kind:'project-note',reviewStatus:'unreviewed'}];
  copy.entries[1].links[0].sourceIds=['test:note'];
  const sourced=archiveGuide(copy,'lov3:0002',{pins:['lov3:0003']});
  assert.deepEqual(sourced.pinnedContext[0].directLinkSourceIds,['test:note']);
  assert.match(sourced.pinnedContext[0].provenance,/review status not established here/);
});


test('knowledge page renders comparison provenance without treating source IDs as verified evidence',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/Evidence status: /);
  assert.match(html,/other\.provenance/);
  assert.match(html,/other\.directLinkSourceIds\.join/);
  assert.match(html,/not independently verified/);
  assert.match(html,/document\.createElement\('p'\)/);
});

test('comparison source attribution respects owning entry on incoming links',()=>{
 const copy=structuredClone(book);
 const current=copy.entries.find(e=>e.id==='lov3:0002');
 const other=copy.entries.find(e=>e.id==='lov3:0003');
 current.sources=[{id:'shared:note',title:'Current note',kind:'project-note',reviewStatus:'unreviewed'}];
 other.sources=[{id:'shared:note',title:'Other note',kind:'primary',reviewStatus:'reviewed',url:'https://example.org/source'}];
 current.links.find(link=>link.to==='lov3:0003').sourceIds=['shared:note'];
 const forward=archiveGuide(copy,'lov3:0002',{pins:['lov3:0003']}).pinnedContext[0];
 const reverse=archiveGuide(copy,'lov3:0003',{pins:['lov3:0002']}).pinnedContext[0];
 assert.equal(forward.directLinkSources[0].title,'Current note');
 assert.equal(reverse.directLinkSources[0].title,'Current note');
 assert.equal(reverse.directLinkSources[0].ownerId,'lov3:0002');
 assert.equal(reverse.directLinkSources[0].reviewStatus,'unreviewed');
});
test('knowledge page renders attributed source details',()=>{
 const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
 assert.match(html,/other\.directLinkSources/);
 assert.match(html,/Source records for this comparison/);
 assert.match(html,/source\.reviewStatus/);
});


test('public workspace guidance matches the current three-route UI',()=>{
 const readme=readFileSync(new URL('./README.md',import.meta.url),'utf8');
 const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
 assert.match(readme,/three active comparison routes maximum/i);
 assert.match(html,/Three routes maximum/);
 assert.doesNotMatch(readme,/Four slots appear by default; expand to five or six/);
});

test('guide bounds three comparison contexts even with oversized imported pin arrays',()=>{
  const pins=book.entries.filter(e=>e.id!=='lov3:0002').map(e=>e.id);
  const result=archiveGuide(book,'lov3:0002',{pins});
  assert.equal(result.pinnedContext.length,3);
  assert.deepEqual(result.pinnedContext.map(x=>x.id),pins.slice(0,3));
  assert.ok(result.pinnedContext.every(x=>typeof x.provenance==='string'));
});

test('archive guide caps seven legacy pins at three distinct valid comparison concepts',()=>{
  const pins=['lov3:0003','lov3:0011','lov3:0005','lov3:0006','lov3:0007','lov3:0008','lov3:0009'];
  const result=archiveGuide(book,'lov3:0002',{pins});
  assert.deepEqual(result.pinnedContext.map(item=>item.id),pins.slice(0,3));
  assert.equal(result.pinnedContext.length,3);
  assert.ok(result.pinnedContext.every(item=>typeof item.provenance==='string'));
});
