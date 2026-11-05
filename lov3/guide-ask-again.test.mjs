import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');

test('guide answer has an explicit keyboard return control',()=>{
  assert.match(page,/<button id="guide-ask-again" type="button" hidden>Ask another question<\/button>/);
  assert.match(page,/q\('#guide-ask-again'\)\.hidden=false;/);
  assert.match(page,/q\('#guide-ask-again'\)\.addEventListener\('click',\(\)=>q\('#guide-question'\)\.focus\(\)\);/);
});
test('response receives focus after citations and questions are rendered',()=>{
  const start=page.indexOf('function askGuide(question)');
  const end=page.indexOf("q('#guide-form').addEventListener",start);
  const block=page.slice(start,end);
  assert.ok(block.indexOf('for(const source of result.sources)')<block.indexOf("q('#guide-answer').focus({preventScroll:true})"));
  assert.match(page,/id="guide-answer" role="status" aria-live="polite" tabindex="-1"/);
});
