import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('answer, distinctions, related links, sources and return control share a response region',()=>{
  const start=page.indexOf('<div id="guide-response-region"');
  const end=page.indexOf('</div>',start);
  assert.ok(start>=0 && end>start);
  const region=page.slice(start,end);
  for(const id of ['guide-answer','guide-answer-boundaries','guide-answer-questions','guide-answer-links','guide-answer-sources','guide-ask-again'])
    assert.match(region,new RegExp('id="'+id+'"'));
});

test('Escape is scoped to response and returns focus to question input',()=>{
  assert.match(page,/q\('#guide-response-region'\)\.addEventListener\('keydown',event=>\{/);
  assert.match(page,/if\(event\.key==='Escape' && !event\.defaultPrevented\)/);
  assert.match(page,/event\.preventDefault\(\);\s*q\('#guide-question'\)\.focus\(\);/);
  assert.doesNotMatch(page,/document\.addEventListener\('keydown',event=>\{/);
});
