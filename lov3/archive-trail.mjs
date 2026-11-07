// Explain actual tab-scoped navigation, without claiming a graph edge exists.
export function explainDiscoveryTrail(book,currentId,workspace) {
  const byId=new Map(book.entries.map(entry=>[entry.id,entry]));
  const raw=Array.isArray(workspace?.trail)?workspace.trail:[];
  const recent=raw.slice(-24);
  const trail=recent.map((id,index)=>({id,index})).filter(step=>typeof step.id==='string'&&byId.has(step.id));
  if(!trail.length) return {kind:'trail',answer:'No recorded exploration trail is available in this browser tab. I cannot reconstruct earlier navigation.',links:[],sources:[]};
  const steps=trail.map(({id,index},i)=>{
    const entry=byId.get(id);
    const previous=i?byId.get(trail[i-1].id):null;
    const gap=i>0 && index!==trail[i-1].index+1;
    const direct=previous?.links.some(link=>link.to===id)||entry.links.some(link=>link.to===previous?.id);
    return {id,title:entry.title,transition:i===0?'first recorded visit':gap?'unavailable visit(s) between these records; relationship not inferred':direct?'recorded graph neighbors':'navigation recorded; no direct graph link established'};
  });
  const current=byId.get(currentId);
  return {kind:'trail',answer:'Your tab records '+steps.length+' visit(s) in order: '+steps.map((step,i)=>(i+1)+'. '+step.title+' ['+step.transition+']').join('; ')+'. This is a navigation history, not evidence of causation, historical relationships or private reasoning.'+(current&&trail.at(-1).id!==currentId?' The current concept is not the final recorded visit.':''),links:steps.map(({id,title})=>({id,title})),sources:[]};
}
