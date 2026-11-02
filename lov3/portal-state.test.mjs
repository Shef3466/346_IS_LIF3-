import test from 'node:test';
import assert from 'node:assert/strict';
import {globeStateParams,readGlobeState,knowledgeHref,globeReturnHref,selectedId} from './portal-state.mjs';

test('orientation survives a knowledge-page round trip with exact precision',()=>{
  const state={angle:6.283185307179586,tilt:-0.673123456789,edges:false,running:true};
  const href=knowledgeHref('lov3:0010',state);
  const back=globeReturnHref(new URL(href,'https://example.test/lov3/').search);
  const p=new URL(back,'https://example.test/lov3/');
  const restored=readGlobeState(p.search);
  assert.equal(restored.angle,state.angle);
  assert.equal(restored.tilt,state.tilt);
  assert.equal(restored.edges,false);
  assert.equal(restored.running,false); // pause on return to preserve the exact pose
  assert.equal(selectedId(p.search,'selected'),'lov3:0010');
});
test('no external return redirect or unsafe concept ID',()=>{
  assert.throws(()=>knowledgeHref('https://evil.example',readGlobeState()),TypeError);
  assert.equal(selectedId('?id=../../secret'),null);
  assert.equal(globeReturnHref('?id=../../secret&angle=1'), './explorer.html?angle=1&tilt=0.12&edges=1&spin=0');
});
test('invalid query values safely fall back without crashes',()=>{
  const s=readGlobeState('?angle=NaN&tilt=999&edges=0&spin=evil');
  assert.deepEqual(s,{angle:0.2,tilt:0.12,edges:false,running:false});
});
test('orientation rejects invalid programmatic input',()=>{
  assert.throws(()=>globeStateParams({angle:Infinity,tilt:0,edges:true,running:false}),RangeError);
  assert.throws(()=>globeStateParams({angle:0,tilt:-4,edges:true,running:false}),RangeError);
});
test('default view remains compatible with first visit',()=>{
  assert.deepEqual(readGlobeState(),{angle:0.2,tilt:0.12,edges:true,running:true});
});
