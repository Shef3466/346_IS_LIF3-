// Public project memory retrieval, deliberately no private chat or external API access.
export function flattenMemory(memory) {
  if (memory?.schema !== "lov3.project-memory.v1") throw Error("Unsupported memory schema");
  const records=[];
  for (const [index,value] of (memory.principles || []).entries())
    records.push({id:"principle-"+(index+1),kind:"principle",title:"Principle "+(index+1),text:value});
  for (const [index,value] of (memory.decisions || []).entries())
    records.push({id:"decision-"+(index+1),kind:"decision",title:value.date || "Decision",text:value.decision || ""});
  for (const [index,value] of (memory.project?.roadmap || []).entries())
    records.push({id:"roadmap-"+(index+1),kind:"roadmap",title:"Roadmap "+(index+1),text:value});
  if (memory.next) records.push({id:"next",kind:"next",title:"Next step",text:memory.next});
  return records;
}
export function searchMemory(memory, query, {limit=8,kind}={}) {
  const terms=String(query||"").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  if (!terms.length) return [];
  const records=flattenMemory(memory);
  return records.filter(x=>!kind||x.kind===kind).map(record=>{
    const title=record.title.toLocaleLowerCase(),text=record.text.toLocaleLowerCase();
    const score=terms.reduce((sum,t)=>sum+(title.includes(t)?3:0)+(text.includes(t)?1:0),0);
    return {...record,score};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(0,limit));
}
export function inspectMemory(memory) {
  const records=flattenMemory(memory),ids=new Set(records.map(r=>r.id));
  if(ids.size!==records.length)throw Error("Duplicate memory records");
  return {total:records.length,kinds:[...new Set(records.map(r=>r.kind))]};
}
