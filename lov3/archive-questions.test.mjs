import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion,SUGGESTED_ARCHIVE_QUESTIONS} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('question suggestions route to four bounded archive topics',()=>{
  assert.equal(SUGGESTED_ARCHIVE_QUESTIONS.length,5);
  assert.deepEqual(SUGGESTED_ARCHIVE_QUESTIONS.map(q=>answerArchiveQuestion(book,'lov3:0002',null,q).kind),
    ['evidence','relationships','comparison','record','exploration']);
});
test('unreferenced Genesis draft cannot invent evidence or media',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'What evidence is attached?');
  assert.equal(result.kind,'evidence');
  assert.equal(result.sources.length,0);
  assert.match(result.answer,/no attached editorial sources/i);
});
test('existing editorial source metadata is returned with review status and exact URL',()=>{
  const copy=structuredClone(book);
  copy.entries[0].sources=[
    {id:'source:one',title:'Illustrative project note',kind:'project-note',reviewStatus:'unreviewed'},
    {id:'source:two',title:'Illustrative reviewed record',kind:'primary',reviewStatus:'reviewed',url:'https://example.org/record'}
  ];
  const result=answerArchiveQuestion(copy,'lov3:0001',null,'Are there citations?');
  assert.equal(result.sources.length,2);
  assert.equal(result.sources[1].url,'https://example.org/record');
  assert.equal(result.sources[1].reviewStatus,'reviewed');
  assert.match(result.answer,/review label is not proof/i);
});
test('relationship answer includes only actual directed graph neighbors',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'What is connected to this concept?');
  assert.equal(result.kind,'relationships');
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0010','lov3:0008']);
  assert.match(result.answer,/relation citation\(s\)/);
});
test('pinned comparison uses only recorded classifications and valid pins',()=>{
  const result=answerArchiveQuestion(book,'lov3:0002',
    {pins:['lov3:0003','lov3:0003','lov3:9999','lov3:0005']},'Compare my pinned discoveries');
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0003','lov3:0005']);
  assert.match(result.answer,/same recorded subject/);
  assert.match(result.answer,/no shared classification/);
});
test('record question gives recorded fields, not invented definition',()=>{
  const result=answerArchiveQuestion(book,'lov3:0011',null,'What does this draft record say?');
  assert.equal(result.kind,'record');
  assert.match(result.answer,/3–4–6–9/);
  assert.match(result.answer,/project interpretation/);
});
test('unsupported, empty and excessive questions fail conservatively',()=>{
  for(const q of ['Who invented this in 1800?', '', 'a'.repeat(241), null]){
    const result=answerArchiveQuestion(book,'lov3:0002',null,q);
    assert.equal(result.kind,'unsupported');
    assert.deepEqual(result.sources,[]);
    assert.deepEqual(result.links,[]);
  }
});
test('unknown archive record is never silently substituted',()=>{
  assert.throws(()=>answerArchiveQuestion(book,'lov3:9999',null,'sources'),/Unknown archive concept/);
});

test('exploration recommendations favor unvisited graph neighbors and qualify citation counts',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',{trail:['lov3:0009','lov3:0010']},'Where should I explore next?');
  assert.equal(result.kind,'exploration');
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0008','lov3:0010']);
  assert.match(result.answer,/recorded graph link/);
  assert.match(result.answer,/not proof/i);
  assert.deepEqual(result.sources,[]);
});
test('exploration falls back only to shared recorded classification without graph links',()=>{
  const copy=structuredClone(book);
  for(const entry of copy.entries)entry.links=[];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'Recommend another discovery');
  assert.equal(result.kind,'exploration');
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0010','lov3:0013']);
  assert.match(result.answer,/shared recorded subject/);
  assert.match(result.answer,/not verified historical relationships/);
});
test('exploration never invents a next record when no classification or edge matches',()=>{
  const copy=structuredClone(book);
  for(const entry of copy.entries)entry.links=[];
  const result=answerArchiveQuestion(copy,'lov3:0001',null,'Explore next');
  assert.equal(result.kind,'exploration');
  assert.deepEqual(result.links,[]);
  assert.match(result.answer,/will not invent a connection/);
});
test('exploration acknowledges when all available neighbors were already visited',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',{trail:['lov3:0010','lov3:0008']},'What next?');
  assert.match(result.answer,/already appeared in your visit trail/);
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0010','lov3:0008']);
});
test('knowledge page exposes keyboard form, local answer and source link rendering',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="guide-form"/);
  assert.match(html,/id="guide-question"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/answerArchiveQuestion\(book,id,history,question\)/);
  assert.match(html,/source\.url/);
  assert.match(html,/knowledgeHref\(link\.id,state\)/);
});


test('relationship answers resolve actual outgoing and incoming source pointers against the declaring entry',()=>{
  const copy=structuredClone(book);
  const outgoing=copy.entries.find(x=>x.id==='lov3:0009');
  const incoming=copy.entries.find(x=>x.id==='lov3:0008');
  outgoing.sources=[{id:'source:shared',title:'Outgoing archive note',kind:'project-note',reviewStatus:'unreviewed',url:'https://example.org/out'}];
  incoming.sources=[{id:'source:shared',title:'Incoming archive record',kind:'primary',reviewStatus:'reviewed',url:'https://example.org/in'}];
  outgoing.links[0].sourceIds=['source:shared'];
  incoming.links[0].sourceIds=['source:shared'];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'What relationships are recorded?');
  assert.equal(result.kind,'relationships');
  assert.deepEqual(result.sources.map(x=>x.title),['Outgoing archive note','Incoming archive record']);
  assert.deepEqual(result.sources.map(x=>x.url),['https://example.org/out','https://example.org/in']);
  assert.deepEqual(result.sources.map(x=>x.reviewStatus),['unreviewed','reviewed']);
  assert.match(result.sources[0].relation,/Egg of Life → The Flower of Life/);
  assert.match(result.sources[1].relation,/Creation Story → The Egg of Life/);
  assert.match(result.answer,/2 editorial relation source pointer/);
  assert.match(result.answer,/1 marked reviewed/);
  assert.match(result.answer,/do not independently verify/);
});

test('relationship answers never imply an uncited entry source supports a graph edge',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'source:uncited',title:'Uncited note',kind:'project-note',reviewStatus:'reviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'What is connected?');
  assert.deepEqual(result.sources,[]);
  assert.match(result.answer,/No editorial source records are cited/);
  assert.equal(result.links.length,2);
});

test('knowledge page labels the specific directed relation for each cited source',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/source\.relation\?' · cited for '/);
});

test('relationship evidence question retrieves only sources cited by directed edges',()=>{
  const copy=structuredClone(book);
  const current=copy.entries.find(x=>x.id==='lov3:0009');
  const incoming=copy.entries.find(x=>x.id==='lov3:0008');
  current.sources=[
    {id:'note:cited',title:'Edge citation',kind:'project-note',reviewStatus:'unreviewed',url:'https://example.org/edge'},
    {id:'note:uncited',title:'Unrelated entry note',kind:'project-note',reviewStatus:'reviewed'}
  ];
  incoming.sources=[{id:'note:incoming',title:'Incoming edge citation',kind:'secondary',reviewStatus:'unreviewed'}];
  current.links[0].sourceIds=['note:cited'];
  incoming.links[0].sourceIds=['note:incoming'];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'Which sources support the recorded relationships?');
  assert.equal(result.kind,'relationships');
  assert.deepEqual(result.sources.map(x=>x.title),['Edge citation','Incoming edge citation']);
  assert.deepEqual(result.sources.map(x=>x.relation),[
    'The Egg of Life → The Flower of Life (relates-to)',
    'The Creation Story → The Egg of Life (relates-to)'
  ]);
  assert.ok(!result.answer.includes('verified historical'));
  assert.match(result.answer,/do not independently verify/);
});

test('relationship evidence question does not mistake uncited entry sources for edge evidence',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'note:unrelated',title:'Uncited source',kind:'primary',reviewStatus:'reviewed'}];
  const edge=answerArchiveQuestion(copy,'lov3:0009',null,'Is there proof for the links?');
  assert.equal(edge.kind,'relationships');
  assert.deepEqual(edge.sources,[]);
  assert.match(edge.answer,/No editorial source records are cited/);
  const entry=answerArchiveQuestion(copy,'lov3:0009',null,'What sources are attached to this record?');
  assert.equal(entry.kind,'evidence');
  assert.equal(entry.sources.length,1);
});
