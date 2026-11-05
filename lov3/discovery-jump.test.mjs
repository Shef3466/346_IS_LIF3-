import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
test('workspace offers keyboard-accessible section jump links',()=>{
 for(const id of ['cards','comparison-heading','history-heading']){
  assert.match(html,new RegExp('href="#'+id+'"'));
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/<nav aria-label="Discovery navigation">/);
});
test('pinned cards destination has a stable accessible region',()=>{
 assert.match(html,/<div id="cards"[^>]*role="region"[^>]*aria-label="Pinned discoveries"[^>]*tabindex="-1"/);
});
