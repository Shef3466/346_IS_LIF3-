import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('claims-verification wording routes to evidence boundaries rather than source count',()=>{
  for(const question of ['Are these claims verified?', 'Are the claims verified?', 'What is established?', 'What has been actually established?']){
    const result=answerArchiveQuestion(book,'lov3:0011',null,question);
    assert.equal(result.kind,'boundaries',question);
    assert.equal(result.sources.length,0);
    assert.equal(result.distinctions.length,4);
    assert.match(result.answer,/cannot certify historical facts/);
  }
});

test('ordinary source inventory question remains an evidence lookup',()=>{
  assert.equal(answerArchiveQuestion(book,'lov3:0011',null,'What evidence is attached?').kind,'evidence');
});
