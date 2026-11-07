import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('two source pointers with identical local IDs retain distinct owning records',()=>{
  const copy=structuredClone(book);
  const forward=copy.entries.find(e=>e.id==='lov3:0002');
  const reverse=copy.entries.find(e=>e.id==='lov3:0011');
  forward.sources=[{id:'local:note',title:'Framework note',kind:'project-note',reviewStatus:'unreviewed'}];
  reverse.sources=[{id:'local:note',title:'Integration note',kind:'project-note',reviewStatus:'reviewed'}];
  forward.links.find(l=>l.to==='lov3:0004').sourceIds=['local:note'];
  reverse.links.find(l=>l.to==='lov3:0002').sourceIds=['local:note'];
  const comparison=archiveGuide(copy,'lov3:0002',{pins:['lov3:0011']}).pinnedContext[0];
  assert.equal(comparison.directLinkSources.length,1);
  assert.deepEqual(comparison.directLinkSources.map(s=>[s.ownerId,s.title,s.reviewStatus]),
    [['lov3:0011','Integration note','reviewed']]);
  const opposite=archiveGuide(copy,'lov3:0011',{pins:['lov3:0002']}).pinnedContext[0];
  assert.deepEqual(opposite.directLinkSources.map(s=>[s.ownerId,s.title]),
    [['lov3:0011','Integration note']]);
  assert.match(comparison.provenance,/source pointers/);
});
