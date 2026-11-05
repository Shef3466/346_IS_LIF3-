import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const html=readFileSync(fileURLToPath(new URL('./knowledge.html',import.meta.url)),'utf8');
test('unavailable archive records expose a recovery path and alert',()=>{
  assert.match(html,/id="back" href="\.\/explorer\.html"/);
  assert.match(html,/setAttribute\('role','alert'\)/);
  assert.match(html,/Return to the globe and select an available concept/);
});
test('unavailable archive records hide nonfunctional actions even in flex layouts',()=>{
  assert.match(html,/\[hidden\]\{display:none!important\}/);
  for(const selector of ['#pin-workspace','#open-workspace','#propose-relationship','#guide-form','#guide-prompts','#guide-ask-again']){
    assert.ok(html.includes("'"+selector+"'"),selector+' must be handled');
  }
});
