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
