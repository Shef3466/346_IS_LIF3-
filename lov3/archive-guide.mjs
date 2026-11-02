// Original, source-conscious archive guide prototype.
// This is deterministic retrieval, not a deployed conversational AI model.
import {validate} from './graph.mjs';
import {conceptIdentity} from './taxonomy.mjs';
import {citationCoverage} from './sources.mjs';
export function archiveGuide(book,id) {
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
  return {entry,identity,outgoing,incoming,sources,coverage,introduction,evidence,next,
    label:'LOV3 Archive Guide — retrieval preview (not a live AI conversation)'};
}
