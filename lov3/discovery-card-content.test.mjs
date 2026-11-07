import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const html=readFileSync(fileURLToPath(new URL('./discovery.html',import.meta.url)),'utf8');
const genesis=JSON.parse(readFileSync(fileURLToPath(new URL('./genesis.json',import.meta.url)),'utf8'));
test('Pinned cards distinguish unauthored definitions from verified content',()=>{
  assert.ok(html.includes('Definition not yet authored for this draft concept.'));
  assert.ok(html.includes("typeof e.definition==='string'&&e.definition.trim()"));
  assert.ok(genesis.entries.some(e=>!e.definition));
});
test('Pinned cards link only to existing recorded Genesis destinations',()=>{
  assert.ok(html.includes('(e.links??[]).filter(link=>byId.has(link.to))'));
  assert.ok(html.includes('knowledgeHref(relation.to,stateView)'));
  assert.ok(html.includes('editorial link'));
});
