import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('falsification requests yield bounded research questions, not proof claims',()=>{
  for(const question of ['What would disprove this?','How could we falsify this?','What evidence would contradict this?']){
    const result=answerArchiveQuestion(book,'lov3:0009',null,question);
    assert.equal(result.kind,'inquiry',question);
    assert.ok(result.questions.some(item=>/contradict/.test(item)),question);
    assert.deepEqual(result.sources,[]);
    assert.match(result.answer,/unpublished record/);
  }
});

test('research inquiry still includes a potential disconfirming observation when links exist',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'Investigate');
  assert.equal(result.kind,'inquiry');
  assert.ok(result.questions.some(item=>/contradict/.test(item)));
  assert.ok(result.links.every(link=>book.entries.some(entry=>entry.id===link.id)));
});
