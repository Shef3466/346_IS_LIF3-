import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');

test('history displays original visit indices in reverse chronological order',()=>{
  assert.match(page,/for\(let i=state\.trail\.length-1;i>=0;i--\)/);
  assert.match(page,/const id=state\.trail\[i\]/);
  assert.match(page,/item\(trail,'Visit '\+\(i\+1\)\+': '\+byId\.get\(id\)\.title,knowledgeHref\(id,stateView\)\)/);
});
test('history remains separate from comparison pin capacity',()=>{
  assert.match(page,/for\(let i=state\.trail\.length-1;i>=0;i--\)/);
  assert.match(page,/if\(!state\.trail\.length\)item\(trail,'No exploration history in this tab yet\.'\)/);
});
