import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('./explorer.html',import.meta.url),'utf8');
test('globe drag owns exactly one pointer until released',()=>{
 assert.match(html,/pointerdown",e=>\{if\(drag\)return;/);
 assert.match(html,/drag=\{pointerId:e\.pointerId,/);
 assert.match(html,/pointermove",e=>\{if\(!drag\|\|e\.pointerId!==drag\.pointerId\)return;/);
 assert.match(html,/pointerup",e=>\{if\(!drag\|\|e\.pointerId!==drag\.pointerId\)return;/);
});
