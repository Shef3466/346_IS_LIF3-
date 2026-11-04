import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('keyboard users can skip directly to the Archive Guide heading',()=>{
  assert.match(html,/<a class="skip-link" href="#guide-heading">Skip to LOV3 Archive Guide<\/a>/);
  assert.match(html,/<h2 id="guide-heading" tabindex="-1">LOV3 Archive Guide<\/h2>/);
  assert.match(html,/\.skip-link:focus\{top:12px\}/);
  assert.match(html,/a:focus-visible[^}]*outline:3px solid/);
});

test('skip control stays outside the main content and guide remains separate from globe',()=>{
  assert.ok(html.indexOf('class="skip-link"')<html.indexOf('<main>'));
  assert.match(html,/href="\.\/explorer\.html"/);
  assert.match(html,/import \{readGlobeState,knowledgeHref,globeReturnHref,selectedId\}/);
});
