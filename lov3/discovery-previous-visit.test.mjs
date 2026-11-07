import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {knowledgeHref,readGlobeState} from './portal-state.mjs';
const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
test('previous discovery shortcut is hidden until at least two recorded visits',()=>{
  assert.match(html,/id="prior-visit"[^>]*hidden/);
  assert.match(html,/state\.trail\.length>1\?state\.trail\.at\(-2\):null/);
  assert.match(html,/priorLink\.hidden=!prior/);
});
test('previous discovery shortcut preserves incoming globe orientation',()=>{
  assert.match(html,/priorLink\.href=knowledgeHref\(prior,stateView\)/);
  const pose=readGlobeState('?angle=1.25&tilt=-0.3&edges=0');
  const url=knowledgeHref('lov3:0002',pose);
  assert.match(url,/lov3%3A0002/);
  assert.match(url,/angle=1.25/);
  assert.match(url,/tilt=-0.3/);
});
