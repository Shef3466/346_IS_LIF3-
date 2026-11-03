import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRelationshipProposal,exportRelationshipProposal} from './contribution-draft.mjs';
const book=JSON.parse(readFileSync(new URL('./genesis.json',import.meta.url),'utf8'));
const input={from:'lov3:0009',to:'lov3:0010',type:'relates-to',classification:'hypothesis',
  explanation:'The two forms appear in a shared geometric tradition; this needs independent historical documentation.'};
test('local proposal preserves exact concepts, credit, uncertainty and editorial status',()=>{
  const proposal=createRelationshipProposal({...input,credit:'Researcher 346'},book);
  assert.equal(proposal.from,input.from);assert.equal(proposal.to,input.to);
  assert.equal(proposal.credit,'Researcher 346');
  assert.equal(proposal.classification,'hypothesis');
  assert.equal(proposal.publicationStatus,'local-draft');
  assert.equal(proposal.reviewStatus,'unreviewed');
  assert.equal(proposal.source,null);
  assert.deepEqual(JSON.parse(exportRelationshipProposal(proposal)),proposal);
});
test('source-submitted proposals require explicit HTTPS reference, never auto-verified',()=>{
  assert.throws(()=>createRelationshipProposal({...input,classification:'source-submitted'},book),/require a reference/);
  const proposal=createRelationshipProposal({...input,classification:'source-submitted',
    sourceTitle:'Public study',sourceUrl:'https://example.org/study'},book);
  assert.equal(proposal.source.url,'https://example.org/study');
  assert.equal(proposal.source.reviewStatus,'unreviewed');
  for(const sourceUrl of ['http://example.org','javascript:alert(1)','https://name:pass@example.org','not-a-url']){
    assert.throws(()=>createRelationshipProposal({...input,sourceTitle:'Unsafe',sourceUrl},book),/Source URL|Invalid source URL/);
  }
  assert.throws(()=>createRelationshipProposal({...input,sourceTitle:'Missing link'},book),/both a source title/);
});
test('invalid or unsupported relation proposals are rejected without mutating Genesis',()=>{
  const original=JSON.stringify(book);
  for(const overrides of [{to:'lov3:9999'},{to:input.from},{from:'https://evil.example'},
    {type:'proves'},{classification:'verified'},{explanation:'Too short'},
    {credit:'X'.repeat(81)}]){
    assert.throws(()=>createRelationshipProposal({...input,...overrides},book));
  }
  assert.equal(JSON.stringify(book),original);
});
test('contributor form is local-only, keyboard reachable, and linked from knowledge page',()=>{
  const html=readFileSync(new URL('./contribute.html',import.meta.url),'utf8');
  const knowledge=readFileSync(new URL('./knowledge.html',import.meta.url),'utf8');
  assert.match(html,/id="proposal-form"/);
  assert.match(html,/id="proposal-status" role="status" aria-live="polite"/);
  assert.match(html,/createRelationshipProposal\(/);
  assert.match(html,/exportRelationshipProposal\(/);
  assert.match(html,/URL\.revokeObjectURL/);
  assert.match(html,/Nothing is submitted to a server/);
  assert.match(knowledge,/id="propose-relationship"/);
  assert.match(knowledge,/\.\/contribute\.html\?/);
});

test('local preview displays proposal fields as text and clears stale preview on edits',()=>{
  const html=readFileSync(new URL('./contribute.html',import.meta.url),'utf8');
  assert.match(html,/id="preview-proposal" type="button"/);
  assert.match(html,/id="proposal-preview" aria-labelledby="preview-title" tabindex="-1" hidden/);
  assert.match(html,/fields\.replaceChildren\(\)/);
  assert.match(html,/dt\.textContent=label;dd\.textContent=value/);
  assert.match(html,/form\.addEventListener\('input',\(\)=>\{q\('#proposal-preview'\)\.hidden=true/);
  assert.match(html,/form\.addEventListener\('change',\(\)=>\{q\('#proposal-preview'\)\.hidden=true/);
  assert.match(html,/const proposal=prepare\(\)/);
  assert.doesNotMatch(html,/\.innerHTML\s*=/);
});

test('preview moves keyboard focus to the newly displayed review panel',()=>{
  const html=readFileSync(new URL('./contribute.html',import.meta.url),'utf8');
  assert.match(html,/id="proposal-preview"[^>]*tabindex="-1"/);
  assert.match(html,/q\('#proposal-preview'\)\.hidden=false;q\('#proposal-preview'\)\.focus\(\)/);
});


test('changing starting concept automatically avoids a self-relationship',()=>{
  const html=readFileSync(new URL('./contribute.html',import.meta.url),'utf8');
  assert.match(html,/q\('#from'\)\.addEventListener\('change',\(\)=>\{/);
  assert.match(html,/if\(q\('#to'\)\.value===q\('#from'\)\.value\)\{/);
  assert.match(html,/q\('#to'\)\.value=alternative\.id;status\.textContent='Related concept adjusted/);
  assert.match(html,/updateReturn\(\);/);
});

test('clear local draft control removes entered content and stale preview with keyboard focus',()=>{
  const html=readFileSync(new URL('./contribute.html',import.meta.url),'utf8');
  assert.match(html,/id="clear-proposal" type="button"/);
  assert.match(html,/q\('#clear-proposal'\)\.addEventListener\('click'/);
  for(const field of ['explanation','source-title','source-url','credit']){
    assert.ok(html.includes("q('#"+field+"').value='';"));
  }
  assert.match(html,/q\('#classification'\)\.value='hypothesis';q\('#proposal-preview'\)\.hidden=true/);
  assert.match(html,/q\('#explanation'\)\.focus\(\)/);
  assert.match(html,/No proposal was submitted/);
});


test('untouched reasoning template is rejected but answered prompts and freeform reasoning work',()=>{
  const labels=['What I am connecting:','Why this connection makes sense (evidence or mechanism):',
    'Alternative explanations or limitations:','What this connection establishes (and what remains uncertain):'];
  assert.throws(()=>createRelationshipProposal({...input,explanation:labels.join('\\n\\n')},book),/reasoning prompts alone/);
  const answered=labels.map((label,i)=>label+' '+[
    'Two geometric forms.','Their construction uses overlapping circles.',
    'Shared geometry does not prove shared origin.','A structural comparison worth investigating.'
  ][i]).join('\\n');
  assert.equal(createRelationshipProposal({...input,explanation:answered},book).reviewStatus,'unreviewed');
  assert.equal(createRelationshipProposal(input,book).reviewStatus,'unreviewed');
});

test('structured proposals require meaningful answers to every question',()=>{
  const labels=['What I am connecting:','Why this connection makes sense (evidence or mechanism):',
    'Alternative explanations or limitations:','What this connection establishes (and what remains uncertain):'];
  const responses=[
    'Two geometric forms in an archive.',
    'Their constructions both use overlapping circles.',
    'The resemblance does not establish a common historical origin.',
    'A testable structural comparison, not a historical conclusion.'
  ];
  const full=labels.map((label,index)=>label+' '+responses[index]).join('\n\n');
  assert.equal(createRelationshipProposal({...input,explanation:full},book).reviewStatus,'unreviewed');
  const blankMiddle=labels.map((label,index)=>label+' '+(index===1?'':responses[index])).join('\n\n');
  assert.throws(()=>createRelationshipProposal({...input,explanation:blankMiddle},book),/substantive answer/);
  assert.throws(()=>createRelationshipProposal({...input,explanation:labels.slice(0,2).join(' ')+' '+responses.join(' ')},book),/all four reasoning prompts/);
  assert.throws(()=>createRelationshipProposal({...input,explanation:labels.slice().reverse().map((label,index)=>label+' '+responses[index]).join('\n')},book),/original order/);
});
