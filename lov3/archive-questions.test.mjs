import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerArchiveQuestion,SUGGESTED_ARCHIVE_QUESTIONS} from './archive-questions.mjs';

const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));

test('question suggestions route to bounded archive topics',()=>{
  assert.equal(SUGGESTED_ARCHIVE_QUESTIONS.length,8);
  assert.deepEqual(SUGGESTED_ARCHIVE_QUESTIONS.map(q=>answerArchiveQuestion(book,'lov3:0002',null,q).kind),
    ['evidence','relationships','comparison','record','exploration','inquiry','boundaries','trail']);
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

test('exploration recommendations show only citations for recommended outgoing and incoming edges',()=>{
  const copy=structuredClone(book);
  const current=copy.entries.find(x=>x.id==='lov3:0009');
  const incoming=copy.entries.find(x=>x.id==='lov3:0008');
  current.sources=[
    {id:'note:out',title:'Outgoing citation',kind:'primary',reviewStatus:'reviewed',url:'https://example.org/outgoing'},
    {id:'note:unrelated',title:'Unrelated entry note',kind:'project-note',reviewStatus:'reviewed'}
  ];
  incoming.sources=[
    {id:'note:in',title:'Incoming citation',kind:'secondary',reviewStatus:'unreviewed',url:'https://example.org/incoming'}
  ];
  current.links[0].sourceIds=['note:out'];
  incoming.links[0].sourceIds=['note:in'];
  const result=answerArchiveQuestion(copy,'lov3:0009',{trail:['lov3:0010']},'Where should I explore next?');
  assert.equal(result.kind,'exploration');
  assert.deepEqual(result.links.map(x=>x.id),['lov3:0008','lov3:0010']);
  assert.deepEqual(result.sources.map(x=>x.title),['Incoming citation','Outgoing citation']);
  assert.deepEqual(result.sources.map(x=>x.reviewStatus),['unreviewed','reviewed']);
  assert.match(result.sources[0].relation,/Creation Story → The Egg of Life/);
  assert.match(result.sources[1].relation,/Egg of Life → The Flower of Life/);
  assert.ok(!result.sources.some(x=>x.title==='Unrelated entry note'));
  assert.match(result.answer,/not proof/i);
});

test('exploration does not turn an uncited entry source into relationship evidence',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'note:uncited',title:'Concept-only source',kind:'primary',reviewStatus:'reviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'Recommend a next discovery');
  assert.deepEqual(result.sources,[]);
  assert.equal(result.links.length,2);
});

test('shared-classification exploration never borrows a source from the suggested concept',()=>{
  const copy=structuredClone(book);
  for(const entry of copy.entries) entry.links=[];
  copy.entries[9].sources=[{id:'note:classification',title:'Concept source',kind:'secondary',reviewStatus:'reviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'Where should I explore next?');
  assert.match(result.answer,/shared recorded subject/);
  assert.deepEqual(result.sources,[]);
});

test('investigation prompts identify evidence gaps without inventing sources or claims',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'What should I investigate?');
  assert.equal(result.kind,'inquiry');
  assert.deepEqual(result.sources,[]);
  assert.equal(result.links[0].id,'lov3:0010');
  assert.match(result.answer,/No editorial source records are attached/i);
  assert.match(result.questions[0],/independent evidence/i);
  assert.match(result.questions[1],/Egg of Life → The Flower of Life/);
  assert.ok(result.questions.every(q=>!q.includes('verified historical fact')));
});
test('investigation questions distinguish symbolic numbers from documented correlations',()=>{
  const result=answerArchiveQuestion(book,'lov3:0011',null,'Research questions');
  assert.equal(result.kind,'inquiry');
  assert.ok(result.questions.some(q=>q.includes('3–4–6–9')&&q.includes('symbolic editorial')));
  const withoutNumber=answerArchiveQuestion(book,'lov3:0009',null,'Investigate');
  assert.ok(withoutNumber.questions.every(q=>!q.includes('mathematical property')));
});
test('investigation uses only current tab pins and does not borrow unrelated sources',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'note:one',title:'Unreviewed entry note',kind:'project-note',reviewStatus:'unreviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',{pins:['lov3:0010','lov3:9999']},'Investigate this');
  assert.ok(result.questions.some(q=>q.includes('Flower of Life')&&q.includes('documented similarities')));
  assert.deepEqual(result.sources,[]);
  assert.match(result.answer,/1 editorial source record/);
});
test('knowledge page renders research prompts in an accessible list and clears old prompts',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="guide-answer-questions" aria-label="Suggested research questions"/);
  assert.match(html,/questions\.replaceChildren\(\)/);
  assert.match(html,/for\(const prompt of result\.questions\?\?\[\]\) li\(questions,prompt\)/);
});

test('singular relation and edge evidence questions return only cited directed-edge sources',()=>{
  const copy=structuredClone(book);
  const entry=copy.entries.find(x=>x.id==='lov3:0009');
  entry.sources=[
    {id:'note:edge',title:'Edge-specific editorial note',kind:'project-note',reviewStatus:'unreviewed'},
    {id:'note:general',title:'Unrelated source',kind:'secondary',reviewStatus:'reviewed'}
  ];
  entry.links[0].sourceIds=['note:edge'];
  for(const question of ['Which citations support this relation?','What proof exists for this edge?']){
    const result=answerArchiveQuestion(copy,'lov3:0009',null,question);
    assert.equal(result.kind,'relationships');
    assert.deepEqual(result.sources.map(x=>x.title),['Edge-specific editorial note']);
    assert.match(result.answer,/do not independently verify/);
  }
});

test('mixed evidence-and-investigation request produces questions, not an unrelated source listing',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'note:one',title:'Editorial placeholder',kind:'project-note',reviewStatus:'unreviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'What evidence should I investigate?');
  assert.equal(result.kind,'inquiry');
  assert.ok(result.questions.some(q=>q.includes('independent evidence')));
  assert.deepEqual(result.sources,[]);
  assert.match(result.answer,/review status/);
});

test('ordinary attached-source question still returns entry evidence, not graph-edge citations',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'note:general',title:'Entry-level note',kind:'project-note',reviewStatus:'unreviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'Which sources are attached to this record?');
  assert.equal(result.kind,'evidence');
  assert.deepEqual(result.sources.map(x=>x.title),['Entry-level note']);
});

test('evidence-boundary audit separates recorded metadata, editorial interpretations and unsupported claims',()=>{
  const result=answerArchiveQuestion(book,'lov3:0011',null,'What is verified versus interpreted?');
  assert.equal(result.kind,'boundaries');
  assert.deepEqual(result.distinctions.map(x=>x.label),[
    'Recorded metadata','Editorial interpretation','Source review status','Hypothesis and AI inference'
  ]);
  assert.match(result.distinctions[0].detail,/Number 3–4–6–9/);
  assert.match(result.distinctions[1].detail,/draft editorial choices/);
  assert.match(result.distinctions[3].detail,/symbolic editorial association/);
  assert.deepEqual(result.sources,[]);
  assert.deepEqual(result.links,[]);
  assert.match(result.answer,/cannot certify historical facts/);
});

test('reviewed source status is never converted into verified history in an audit',()=>{
  const copy=structuredClone(book);
  copy.entries[8].sources=[{id:'source:reviewed',title:'Illustrative record',kind:'primary',reviewStatus:'reviewed'}];
  const result=answerArchiveQuestion(copy,'lov3:0009',null,'How confident are we?');
  assert.equal(result.kind,'boundaries');
  assert.match(result.distinctions[2].detail,/1 marked reviewed/);
  assert.match(result.distinctions[2].detail,/not external fact-checking/);
  assert.match(result.distinctions[3].detail,/No number is recorded/);
  assert.deepEqual(result.sources,[]);
  assert.ok(!result.answer.includes('historically verified'));
});

test('knowledge page renders and clears evidence distinctions as safe text',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="guide-answer-boundaries" aria-label="Evidence and interpretation distinctions"/);
  assert.match(html,/boundaries\.replaceChildren\(\)/);
  assert.match(html,/for\(const item of result\.distinctions\?\?\[\]\) li\(boundaries,item\.label\+': '\+item\.detail\)/);
});

test('number inquiry explains the recorded 72 association without inventing evidence',()=>{
  const result=answerArchiveQuestion(book,'lov3:0013',null,'What does 72 mean?');
  assert.equal(result.kind,'number');
  assert.match(result.answer,/Number 72/);
  assert.match(result.answer,/editorial association, not independent proof/);
  assert.ok(result.questions.some(q=>q.includes('primary or secondary evidence')));
  assert.deepEqual(result.sources,[]);
  assert.deepEqual(result.links,[]);
});
test('number inquiry on an unnumbered entry refuses to infer a number',()=>{
  const result=answerArchiveQuestion(book,'lov3:0009',null,'What does this number represent?');
  assert.equal(result.kind,'number');
  assert.match(result.answer,/No number is recorded/);
  assert.deepEqual(result.sources,[]);
});
test('number inquiry does not silently attach an unrelated number to a record',()=>{
  const result=answerArchiveQuestion(book,'lov3:0013',null,'Why is 7 significant?');
  assert.equal(result.kind,'number');
  assert.match(result.answer,/only recorded number is 72/);
  assert.deepEqual(result.sources,[]);
});
test('knowledge page offers a number question only when the record contains a number',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/if\(guide\.identity\.number\)\{/);
  assert.match(html,/What does this number represent\?/);
  assert.match(html,/askGuide\(numberButton\.textContent\)/);
});

test('natural-language trust questions receive evidence boundaries, not a fabricated yes/no verdict',()=>{
  for(const question of ['Is this true?','Can I trust this?','How do you know?','Is this verified?','What supports this claim?']){
    const result=answerArchiveQuestion(book,'lov3:0009',null,question);
    assert.equal(result.kind,'boundaries',question);
    assert.match(result.answer,/cannot certify historical facts/i);
    assert.deepEqual(result.sources,[]);
    assert.deepEqual(result.links,[]);
  }
});

test('natural-language similarity and difference questions use only valid pinned context',()=>{
  const state={pins:['lov3:0003','lov3:0005','lov3:9999']};
  for(const question of ['How are my discoveries alike?','What are the differences?','What similarities exist?']){
    const result=answerArchiveQuestion(book,'lov3:0002',state,question);
    assert.equal(result.kind,'comparison',question);
    assert.deepEqual(result.links.map(link=>link.id),['lov3:0003','lov3:0005']);
    assert.deepEqual(result.sources,[]);
    assert.match(result.answer,/editorial comparisons, not independently verified correlations/);
  }
  const empty=answerArchiveQuestion(book,'lov3:0002',null,'How are these alike?');
  assert.equal(empty.kind,'comparison');
  assert.deepEqual(empty.links,[]);
  assert.match(empty.answer,/No other valid discoveries are pinned/);
});

test('conversational retrace requests use the actual tab trail rather than generic exploration',()=>{
  const state={trail:['lov3:0002','lov3:0004','lov3:0005']};
  for(const question of ['Walk me through my discoveries','Walk me back through my journey','Show me my discovery path','How did I reach this?']){
    const result=answerArchiveQuestion(book,'lov3:0005',state,question);
    assert.equal(result.kind,'trail',question);
    assert.deepEqual(result.sources,[],question);
  }
  const missing=answerArchiveQuestion(book,'lov3:0005',null,'Show my navigation journey');
  assert.equal(missing.kind,'trail');
  assert.deepEqual(missing.sources,[]);
});


test('Archive Guide response is keyboard-focusable after its links and sources render',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="guide-answer"[^>]*role="status"[^>]*tabindex="-1"/);
  const response=html.indexOf("q('#guide-answer').textContent=result.answer;");
  const sourceLoop=html.indexOf('for(const source of result.sources)',response);
  const focus=html.indexOf("q('#guide-answer').focus({preventScroll:true});",sourceLoop);
  const close=html.indexOf("q('#guide-form').addEventListener",sourceLoop);
  assert.ok(response>=0 && sourceLoop>response && focus>sourceLoop && close>focus,
    'Guide focuses the answer after updating the linked evidence, before registering submit');
});


test('Archive Guide response supports Escape back to question input without trapping other controls',()=>{
  const html=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/q\('#guide-answer'\)\.addEventListener\('keydown',event=>\{/);
  assert.match(html,/if\(event\.key==='Escape'\)\{/);
  assert.match(html,/event\.preventDefault\(\);\s*q\('#guide-question'\)\.focus\(\)/);
  assert.match(html,/q\('#guide-ask-again'\)\.addEventListener\('click'/);
});
