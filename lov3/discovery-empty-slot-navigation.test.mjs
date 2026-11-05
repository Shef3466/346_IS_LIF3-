import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');

test('each empty comparison slot offers a subject discovery link',()=>{
  assert.match(page,/for\(let i=state\.pins\.length;i<state\.capacity;i\+\+\)/);
  assert.match(page,/el\('a','Explore subjects for slot '\+\(i\+1\)\)/);
  assert.match(page,/card\.append\(browse\);cards\.append\(card\)/);
});

test('empty-slot discovery reuses orientation-preserving globe return link',()=>{
  assert.match(page,/q\('#back'\)\.href=globeReturnHref\(location\.search\)/);
  assert.match(page,/browse\.href=q\('#back'\)\.href/);
});
