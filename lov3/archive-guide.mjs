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
    const directLinks=[...entry.links.filter(link=>link.to===pin),...other.links.filter(link=>link.to===id)];
    const sourceIds=[...new Set(directLinks.flatMap(link=>link.sourceIds??[]))];
    // Relation citations are scoped to the entry that owns each link.
    // Never resolve an incoming link's source ID against the current entry.
    const directLinkSources=[...entry.links.filter(link=>link.to===pin).map(link=>({owner:entry,link})),
      ...other.links.filter(link=>link.to===id).map(link=>({owner:other,link}))]
      .flatMap(({owner,link})=>(link.sourceIds??[]).map(sourceId=>{
        const source=(owner.sources??[]).find(item=>item.id===sourceId);
        return {ownerId:owner.id,id:sourceId,title:source?.title??'Source record unavailable',
          kind:source?.kind??null,reviewStatus:source?.reviewStatus??'unreviewed',
          url:source?.url??null,
          evidenceStatus:source?.reviewStatus==='reviewed'?'editorially reviewed; factual verification not established':'unreviewed; factual verification not established'};
      }));
    // Source IDs are entry-local editorial pointers, not independently verified evidence.
    return {id:pin,title:other.title,
      relationship:matches.join('; ')||'no shared classification or direct graph link recorded',
      directLinkSourceIds:sourceIds,
      directLinkSources,
      provenance:directLinks.length===0?'no direct editorial link recorded':
        sourceIds.length===0?'direct editorial link has no attached source pointers':
          'direct editorial link has attached source pointers (review status not established here)'};
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
  // Offer a real graph destination; source pointers are editorial, never proof.
  // Prefer a cited outgoing relationship when one exists, otherwise retain graph order.
  const suggested=outgoing.find(link=>link.sourceIds.length>0)??outgoing[0]??incoming[0]??null;
  const nextChoice=suggested?{
    id:suggested.id,title:suggested.title,type:suggested.type,
    direction:outgoing.includes(suggested)?'outgoing':'incoming',
    evidenceStatus:suggested.sourceIds.length>0
      ? 'editorial source pointers attached; factual verification not established'
      : 'no source pointers attached; factual verification not established'
  }:null;
  const next=nextChoice
    ? 'Explore '+nextChoice.title+' via a recorded '+nextChoice.direction+' '+nextChoice.type+
      ' relationship. '+nextChoice.evidenceStatus+'.'
    : 'A useful next step is to propose a connection, then look for independent supporting or conflicting evidence.';
  // Questions are grounded in recorded classifications and links, not inferred histories.
  // A missing direct link is an invitation to investigate, never proof of no relationship.
  const questions=pinnedContext.length
    ? pinnedContext.map(pin=>pin.directLinkSourceIds.length
      ? 'What does the attached source material actually establish about '+identity.word+' and '+pin.title+'?'
      : 'What evidence could support or challenge a proposed relationship between '+identity.word+' and '+pin.title+'?')
    : [nextChoice
      ? 'What evidence supports or challenges the recorded connection to '+nextChoice.title+'?'
      : 'Which other concept would you compare with '+identity.word+', and what evidence would you seek?'];
  return {entry,identity,outgoing,incoming,sources,coverage,introduction,evidence,next,nextChoice,pinnedContext,questions,
    label:'LOV3 Archive Guide — retrieval preview (not a live AI conversation)'};
}
