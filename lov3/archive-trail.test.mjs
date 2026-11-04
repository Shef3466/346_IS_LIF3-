import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion,SUGGESTED_ARCHIVE_QUESTIONS} from './archive-questions.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
test('guide retraces only actual tab visits and labels nonedges',()=>{
 const workspace={trail:['lov3:0008','lov3:0009','lov3:0013','lov3:9999']};
 const result=answerArchiveQuestion(book,'lov3:0013',workspace,'How did I get here?');
 assert.equal(result.kind,'trail');
 assert.deepEqual(result.links.map(x=>x.id),['lov3:0008','lov3:0009','lov3:0013']);
 assert.match(result.answer,/recorded graph neighbors/);
 assert.match(result.answer,/no direct graph link established/);
 assert.deepEqual(result.sources,[]);
});
test('missing trail does not fabricate navigation',()=>{
 const result=answerArchiveQuestion(book,'lov3:0009',null,'Retrace my steps');
 assert.equal(result.kind,'trail');
 assert.deepEqual(result.links,[]);
 assert.match(result.answer,/cannot reconstruct/);
});
test('trail is discoverable in suggested guide questions',()=>{
 assert.ok(SUGGESTED_ARCHIVE_QUESTIONS.includes('How did I get here?'));
});

test('missing or stale visits never create an invented adjacent graph transition',()=>{
 const result=answerArchiveQuestion(book,'lov3:0009',{trail:['lov3:0008','lov3:9999','lov3:0009']},'How did I get here?');
 assert.deepEqual(result.links.map(link=>link.id),['lov3:0008','lov3:0009']);
 assert.match(result.answer,/unavailable visit\(s\) between these records; relationship not inferred/);
 assert.doesNotMatch(result.answer,/recorded graph neighbors/);
});
