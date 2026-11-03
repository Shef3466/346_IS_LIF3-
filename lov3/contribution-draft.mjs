// Local-only, unreviewed relationship proposals. No publication or network writes.
// Contributor credit is user supplied and not an authenticated identity.
import {relationTypes} from './graph.mjs';
export const PROPOSAL_SCHEMA='lov3.relationship.proposal.v1';
export const proposalClassifications=Object.freeze(['hypothesis','interpretation','source-submitted']);
function field(value,name,max,min=1){
  if(typeof value!=='string'||value.trim().length<min||value.trim().length>max||
     /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))
    throw new TypeError('Invalid '+name);
  return value.trim();
}
export function createRelationshipProposal(input,book){
  if(!input||typeof input!=='object'||!book||!Array.isArray(book.entries))
    throw new TypeError('Missing proposal or archive');
  const ids=new Set(book.entries.map(entry=>entry.id));
  if(!ids.has(input.from)||!ids.has(input.to)||input.from===input.to)
    throw new TypeError('Choose two distinct existing concepts');
  if(!relationTypes.includes(input.type))throw new TypeError('Invalid relation type');
  if(!proposalClassifications.includes(input.classification))
    throw new TypeError('Invalid classification');
  const explanation=field(input.explanation,'relationship explanation',2000,25);
  // A pasted or untouched prompt scaffold is not a demonstrated connection.
  // Keep free-form reasoning valid; only reject scaffolds without substantive answers.
  const scaffoldLabels=[
    'What I am connecting:',
    'Why this connection makes sense (evidence or mechanism):',
    'Alternative explanations or limitations:',
    'What this connection establishes (and what remains uncertain):'
  ];
  let substantive=explanation;
  for(const label of scaffoldLabels)substantive=substantive.replaceAll(label,'');
  if(substantive.trim().length<25)
    throw new TypeError('Explain the connection in your own words; reasoning prompts alone are not a proposal');

  const credit=input.credit?.trim()?field(input.credit,'contributor credit',80,2):null;
  const sourceTitle=input.sourceTitle?.trim()||'';
  const sourceUrl=input.sourceUrl?.trim()||'';
  if(Boolean(sourceTitle)!==Boolean(sourceUrl))
    throw new TypeError('Provide both a source title and its HTTPS URL');
  if(input.classification==='source-submitted'&&!sourceTitle)
    throw new TypeError('Source-submitted proposals require a reference');
  let source=null;
  if(sourceTitle){
    const title=field(sourceTitle,'source title',200);
    const raw=field(sourceUrl,'source URL',2048);
    let url;
    try{url=new URL(raw);}catch{throw new TypeError('Invalid source URL');}
    if(url.protocol!=='https:'||!url.hostname||url.username||url.password)
      throw new TypeError('Source URL must use HTTPS without credentials');
    source={title,url:url.href,reviewStatus:'unreviewed'};
  }
  return {
    schema:PROPOSAL_SCHEMA,genesisEdition:field(book.edition,'Genesis edition',120),
    publicationStatus:'local-draft',reviewStatus:'unreviewed',
    from:input.from,to:input.to,type:input.type,classification:input.classification,
    explanation,credit,source
  };
}
export function exportRelationshipProposal(proposal){
  if(!proposal||proposal.schema!==PROPOSAL_SCHEMA)
    throw new TypeError('Invalid LOV3 proposal');
  return JSON.stringify(proposal,null,2)+'\n';
}
