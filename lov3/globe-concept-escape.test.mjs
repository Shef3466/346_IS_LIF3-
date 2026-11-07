import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('./explorer.html',import.meta.url),'utf8');

test('Escape from concept list clears selection and restores keyboard focus to globe',()=>{
  assert.match(html,/list\.addEventListener\('keydown',e=>\{\s*if\(e\.key==='Escape'&&selected!==null\)\{\s*e\.preventDefault\(\);clearSelection\(\);canvas\.focus\(\);return;/);
  assert.match(html,/Arrow Up\/Down also moves between focused concept buttons; Escape from a concept button clears selection/);
});

test('arrow-key concept navigation remains available',()=>{
  assert.match(html,/if\(e\.key!=='ArrowDown'&&e\.key!=='ArrowUp'\)return;/);
  assert.match(html,/buttons\[i\]\.focus\(\)/);
});
