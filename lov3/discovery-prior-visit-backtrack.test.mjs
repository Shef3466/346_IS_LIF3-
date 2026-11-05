import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {navigateKnowledgeTrail} from './discovery-workspace.mjs';

const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
const ids=new Set(['lov3:0001','lov3:0002','lov3:0003']);

test('workspace previous-discovery link requests a genuine trail backtrack',()=>{
  assert.match(html,/if\(prior\)priorLink\.href=knowledgeHref\(prior,stateView\)\+'\&trail=back'/);
});

test('previous-discovery backtracking removes the last visit instead of looping',()=>{
  const original={capacity:3,pins:[],trail:['lov3:0001','lov3:0002','lov3:0003']};
  const result=navigateKnowledgeTrail(original,'lov3:0002',ids,true);
  assert.deepEqual(result.trail,['lov3:0001','lov3:0002']);
  assert.deepEqual(original.trail,['lov3:0001','lov3:0002','lov3:0003']);
});
