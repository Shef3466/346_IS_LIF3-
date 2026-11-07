import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveGuide} from './archive-guide.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('guide attributes both directions of a comparison to their actual source owners',()=>{
  const copy=structuredClone(book);
  const a=copy.entries.find(e=>e.id==='lov3:0002');
  const b=copy.entries.find(e=>e.id==='lov3:0003');
  // Source identifiers are entry-local. The same ID must never cause the
  // guide to substitute one entry's record for the other's.
  a.sources=[{id:'note:shared',title:'A editorial note',kind:'project-note',reviewStatus:'unreviewed'}];
  b.sources=[{id:'note:shared',title:'B editorial note',kind:'project-note',reviewStatus:'unreviewed'}];
  a.links.find(link=>link.to===b.id).sourceIds=['note:shared'];
  b.links.push({to:a.id,type:'relates-to',sourceIds:['note:shared']});
  const result=archiveGuide(copy,a.id,{pins:[b.id]}).pinnedContext[0];
  assert.equal(result.directLinkSources.length,2);
  assert.deepEqual(result.directLinkSources.map(s=>[s.ownerId,s.title]),[
    [a.id,'A editorial note'],[b.id,'B editorial note']
  ]);
  assert.ok(result.directLinkSources.every(s=>s.evidenceStatus.includes('not established')));
});
