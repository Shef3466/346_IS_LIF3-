// Local, bounded question routing over reviewed/unreviewed Genesis metadata.
// No model calls, transcript storage, external requests, or invented citations.
import {archiveGuide} from './archive-guide.mjs';

export const SUGGESTED_ARCHIVE_QUESTIONS = Object.freeze([
  'What evidence is attached?',
  'What is connected to this concept?',
  'Compare my pinned discoveries',
  'What does this draft record say?',
  'Where should I explore next?'
]);

export function answerArchiveQuestion(book,id,workspace,question) {
  const guide=archiveGuide(book,id,workspace);
  const empty={kind:'unsupported',answer:'Ask about evidence, recorded connections, pinned comparisons, or the draft record. I cannot answer open-ended historical questions from this limited archive yet.',links:[],sources:[]};
  if(typeof question!=='string' || question.length>240 || !question.trim()) return empty;
  const q=question.toLowerCase().trim();
  if(/\b(evidence|sources?|citations?|references?|verified|proof)\b/.test(q)){
    const sources=guide.sources.map(source=>({
      title:source.title,kind:source.kind,reviewStatus:source.reviewStatus,
      ...(source.url?{url:source.url}:{})
    }));
    const count=guide.coverage;
    const answer=count.sourceCount===0
      ? 'This unpublished draft has no attached editorial sources. I cannot verify historical claims or provide attributed media for it.'
      : 'This unpublished draft has '+count.sourceCount+' attached editorial source(s), '+count.reviewedCount+' marked reviewed. A review label is not proof that a claim is true. Inspect the listed records directly.';
    return {kind:'evidence',answer,links:[],sources};
  }
  if(/\b(compare|pinned|pins?|workspace)\b/.test(q)){
    const links=guide.pinnedContext.map(x=>({id:x.id,title:x.title}));
    const answer=links.length
      ? 'Among your other pinned discoveries: '+guide.pinnedContext.map(x=>x.title+' — '+x.relationship).join('; ')+'. These are editorial comparisons, not independently verified correlations.'
      : 'No other valid discoveries are pinned for comparison in this tab. Pin a second concept in the Discovery Workspace to compare recorded classifications.';
    return {kind:'comparison',answer,links,sources:[]};
  }
  if(/\b(next|explore|recommend|suggest|journey)\b/.test(q)){
    // Explicit graph neighbors first; if none exist, only shared editorial classifications.
    // Rank unvisited records ahead of entries already in the tab-scoped visit trail.
    const seen=new Set(Array.isArray(workspace?.trail)?workspace.trail:[]);
    const neighbors=[...guide.outgoing.map(x=>({...x,basis:'recorded graph link'})),
      ...guide.incoming.map(x=>({...x,basis:'recorded graph link'}))];
    const unique=new Map();
    for(const item of neighbors) if(!unique.has(item.id)) unique.set(item.id,item);
    if(!unique.size){
      for(const other of book.entries){
        if(other.id===id)continue;
        const sameSubject=!!guide.entry.subject && other.subject===guide.entry.subject;
        const sameCategory=!!guide.entry.category && other.category===guide.entry.category;
        if(sameSubject||sameCategory) unique.set(other.id,{
          id:other.id,title:other.title,basis:sameSubject?'shared recorded subject':'shared recorded category',
          sourceIds:[]
        });
      }
    }
    const ranked=[...unique.values()].sort((a,b)=>Number(seen.has(a.id))-Number(seen.has(b.id)));
    const picks=ranked.slice(0,3);
    const links=picks.map(({id,title})=>({id,title}));
    if(!picks.length) return {kind:'exploration',answer:'No linked or same-classification archive records are available as a documented next step. The guide will not invent a connection.',links:[],sources:[]};
    const names=picks.map(x=>x.title+' ('+x.basis+(x.basis==='recorded graph link'?', '+x.sourceIds.length+' attached relation citation(s)':'')+')');
    const allVisited=picks.every(x=>seen.has(x.id));
    const answer=(allVisited?'These recorded options have already appeared in your visit trail. Revisit ':'For your next discovery, consider ')+
      names.join('; ')+'. Suggestions use draft graph links or shared editorial classifications, not verified historical relationships. A citation count is not proof.';
    return {kind:'exploration',answer,links,sources:[]};
  }
  if(/\b(connect|connected|connections?|links?|related|relationships?)\b/.test(q)){
    const linked=[...guide.outgoing.map(x=>({...x,direction:'outgoing'})),...guide.incoming.map(x=>({...x,direction:'incoming'}))];
    const links=linked.map(x=>({id:x.id,title:x.title}));
    const answer=linked.length
      ? 'The draft records '+linked.length+' directed relationship(s): '+linked.map(x=>x.title+' ('+x.direction+', '+x.type+', '+x.sourceIds.length+' relation citation(s))').join('; ')+'. A graph link is not independent historical evidence.'
      : 'No incoming or outgoing relationships are recorded for this concept. I cannot infer an undocumented connection.';
    return {kind:'relationships',answer,links,sources:[]};
  }
  if(/\b(meaning|define|definition|what is|explain|describe|record)\b/.test(q)){
    const identity=guide.identity;
    const number=identity.number?', with recorded number '+identity.number:'';
    return {kind:'record',answer:'The unpublished editorial record is "'+guide.entry.title+'": Subject '+identity.subject+', Category '+identity.category+', Word '+identity.word+number+'. This classification is a project interpretation, not an independently verified definition.',links:[],sources:[]};
  }
  return empty;
}
