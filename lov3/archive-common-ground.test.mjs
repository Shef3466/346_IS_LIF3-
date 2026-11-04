import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('conversational common-ground questions compare only real pinned discoveries',()=>{
  const workspace={pins:['lov3:0003','lov3:0005']};
  for(const question of [
    'What do these have in common?',
    'What do my discoveries have in common?',
    'What do they share?',
    'How are these related?'
  ]){
    const result=answerArchiveQuestion(book,'lov3:0002',workspace,question);
    assert.equal(result.kind,'comparison',question);
    assert.deepEqual(result.links.map(link=>link.id),['lov3:0003','lov3:0005']);
    assert.match(result.answer,/editorial comparisons, not independently verified correlations/i);
  }
});

test('conversational comparison does not invent pins or citations',()=>{
  const result=answerArchiveQuestion(book,'lov3:0002',{pins:[]},'What do these have in common?');
  assert.equal(result.kind,'comparison');
  assert.deepEqual(result.links,[]);
  assert.deepEqual(result.sources,[]);
  assert.match(result.answer,/Pin a second concept/);
});

test('ordinary relation questions keep graph relationship routing',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'What relationships are recorded?');
  assert.equal(result.kind,'relationships');
});
