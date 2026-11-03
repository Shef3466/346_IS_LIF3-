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
