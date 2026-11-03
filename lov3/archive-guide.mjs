// Original, source-conscious archive guide prototype.
// This is deterministic retrieval, not a deployed conversational AI model.
import {validate} from './graph.mjs';
import {conceptIdentity} from './taxonomy.mjs';
import {citationCoverage} from './sources.mjs';
export function archiveGuide(book,id,workspace=null) {
  validate(book);
  const entry=book.entries.find(e=>e.id===id);
  if (!entry) throw new RangeError('Unknown archive concept');
  const identity=conceptIdentity(entry);
  const outgoing=entry.links.map(link=>({
    id:link.to, type:link.type,
    title:book.entries.find(e=>e.id===link.to).title,
    sourceIds:link.sourceIds??[]
  }));
  const incoming=book.entries.flatMap(other=>other.links
    .filter(link=>link.to===id)
    .map(link=>({id:other.id,title:other.title,type:link.type,sourceIds:link.sourceIds??[]})));
  // Only current user-controlled tab pins are considered; never infer undocumented facts.
  const byId=new Map(book.entries.map(item=>[item.id,item]));
  const pinnedIds=Array.isArray(workspace?.pins)
    ? [...new Set(workspace.pins)].filter(pin=>typeof pin==='string' && pin!==id && byId.has(pin)).slice(0,3)
    : [];
  const pinnedContext=pinnedIds.map(pin=>{
    const other=byId.get(pin),matches=[];
    if(entry.subject && entry.subject===other.subject) matches.push('same recorded subject');
    if(entry.category && entry.category===other.category) matches.push('same recorded category');
    if(entry.links.some(link=>link.to===pin)||other.links.some(link=>link.to===id))
      matches.push('direct editorial graph link');
    return {id:pin,title:other.title,
      relationship:matches.join('; ')||'no shared classification or direct graph link recorded'};
  });
  const sources=entry.sources??[];
  const coverage=citationCoverage(entry);
  const introduction='You are exploring '+identity.word+' under '+identity.subject+' / '+identity.category+
    '. This is an unpublished editorial draft, not a verified historical account.';
  const evidence=coverage.sourceCount===0
    ? 'No editorial sources are attached yet; historical explanations and images must wait for verified references.'
    : coverage.reviewedCount===0
      ? 'Sources are attached but none have been marked reviewed; treat the record as unverified.'
      : coverage.reviewedCount+' of '+coverage.sourceCount+' attached sources have been marked reviewed. Review the underlying material before drawing conclusions.';
  const next=outgoing.length
    ? 'A useful next step is to inspect the recorded '+outgoing[0].type+' connection to '+outgoing[0].title+' and ask what evidence supports it.'
    : incoming.length
      ? 'A useful next step is to examine how '+incoming[0].title+' connects to this concept.'
      : 'A useful next step is to propose a connection, then look for independent supporting or conflicting evidence.';
  return {entry,identity,outgoing,incoming,sources,coverage,introduction,evidence,next,pinnedContext,
    label:'LOV3 Archive Guide — retrieval preview (not a live AI conversation)'};
}
