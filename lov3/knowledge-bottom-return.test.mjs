import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {globeReturnHref} from './portal-state.mjs';

test('long knowledge pages expose an exact-position return at both ends',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html, /id="back" href="\.\/explorer\.html"/);
  assert.match(html, /id="back-bottom" href="\.\/explorer\.html"/);
  assert.match(html, /q\('#back-bottom'\)\.href=q\('#back'\)\.href/);
  assert.match(html, /q\('#back'\)\.href=globeReturnHref\(location\.search\)/);
  const query='?angle=8.123456789&tilt=-0.321987654&edges=0&spin=1&id=lov3%3A0003';
  const back=globeReturnHref(query);
  const p=new URL(back,'https://example.test/lov3/');
  assert.equal(p.searchParams.get('angle'),'8.123456789');
  assert.equal(p.searchParams.get('tilt'),'-0.321987654');
  assert.equal(p.searchParams.get('edges'),'0');
  assert.equal(p.searchParams.get('selected'),'lov3:0003');
  assert.equal(p.searchParams.get('spin'),'0');
});
