// User-controlled, tab-scoped Discovery Workspace. Only public Genesis IDs are stored.
export const WORKSPACE_KEY = 'lov3.discovery.workspace.v1';
export const emptyWorkspace = () => ({capacity:4,pins:[],trail:[]});
const isId = id => typeof id === 'string' && /^lov3:[0-9]{4,}$/.test(id);
const allow = (id, validIds) => isId(id) && validIds.has(id);
export function normalizeWorkspace(value, validIds) {
  const ids = validIds instanceof Set ? validIds : new Set(validIds);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyWorkspace();
  const capacity = Number.isInteger(value.capacity) && value.capacity>=4 && value.capacity<=6 ? value.capacity : 4;
  const pins = [...new Set((Array.isArray(value.pins) ? value.pins : []).filter(id=>allow(id,ids)))].slice(0,capacity);
  const trail = (Array.isArray(value.trail) ? value.trail : []).filter(id=>allow(id,ids)).slice(-24);
  return {capacity,pins,trail};
}
export function readWorkspace(storage, validIds) {
  try { return normalizeWorkspace(JSON.parse(storage?.getItem(WORKSPACE_KEY)??'null'),validIds); }
  catch { return emptyWorkspace(); }
}
export function saveWorkspace(storage, state) {
  try { storage?.setItem(WORKSPACE_KEY,JSON.stringify(state)); return !!storage; }
  catch { return false; }
}
export function pinWorkspace(state,id,validIds) {
  if (!allow(id,validIds)) return {state,reason:'invalid'};
  if (state.pins.includes(id)) return {state,reason:'already-pinned'};
  if (state.pins.length>=state.capacity) return {state,reason:'full'};
  return {state:{...state,pins:[...state.pins,id]},reason:'pinned'};
}
export function unpinWorkspace(state,id) {
  return {...state,pins:state.pins.filter(x=>x!==id)};
}
// After an Unpin action, keep keyboard focus on a surviving neighbor.
// If the final pin is removed, the UI focuses the capacity control instead.
export function nextPinFocus(state,id) {
  const index=state.pins.indexOf(id);
  if(index<0) return null;
  const remaining=state.pins.filter(pin=>pin!==id);
  return remaining[Math.min(index,remaining.length-1)]??null;
}
export function setWorkspaceCapacity(state,capacity) {
  if (!Number.isInteger(capacity)||capacity<4||capacity>6) throw new RangeError('Capacity must be 4–6');
  if (capacity<state.pins.length) throw new RangeError('Unpin discoveries before reducing slots');
  return {...state,capacity};
}
export function recordVisit(state,id,validIds) {
  if (!allow(id,validIds)) return state;
  const trail = state.trail.at(-1)===id ? state.trail : [...state.trail,id].slice(-24);
  return {...state,trail};
}
// Return only a real prior visit; never manufacture a browser-history destination.
// Works with tab-scoped trail data and preserves the caller's globe orientation.
export function previousDiscoveryId(state,currentId,validIds) {
  const ids=validIds instanceof Set ? validIds : new Set(validIds);
  if (!allow(currentId,ids)) return null;
  const trail=Array.isArray(state?.trail) ? state.trail : [];
  if (trail.at(-1)!==currentId) return null;
  for(let i=trail.length-2;i>=0;i--){
    if(trail[i]!==currentId && allow(trail[i],ids)) return trail[i];
  }
  return null;
}
// A deliberate Previous discovery action walks backward instead of appending a
// new visit that would create an A → B → A → B loop. Ignore forged/stale back
// requests unless the target is the actual immediately preceding valid visit.
export function navigateKnowledgeTrail(state,id,validIds,back=false) {
  if (back && Array.isArray(state?.trail)) {
    const current=state.trail.at(-1);
    if (current!==id && previousDiscoveryId(state,current,validIds)===id)
      return {...state,trail:state.trail.slice(0,-1)};
  }
  return recordVisit(state,id,validIds);
}

export function comparePins(book,state) {
  const byId=new Map(book.entries.map(entry=>[entry.id,entry]));
  const pins=state.pins.map(id=>byId.get(id)).filter(Boolean);
  const pairs=[];
  for(let i=0;i<pins.length;i++) for(let j=i+1;j<pins.length;j++){
    const a=pins[i],b=pins[j];
    // Preserve direction, relation type, and source-pointer count. A pointer is not proof.
    const recordedRelations=[
      ...a.links.filter(link=>link.to===b.id).map(link=>({
        from:a.id,to:b.id,type:link.type,citationCount:(link.sourceIds??[]).length
      })),
      ...b.links.filter(link=>link.to===a.id).map(link=>({
        from:b.id,to:a.id,type:link.type,citationCount:(link.sourceIds??[]).length
      }))
    ];
    pairs.push({a:a.id,b:b.id,
      sameSubject:!!a.subject&&a.subject===b.subject,
      sameCategory:!!a.category&&a.category===b.category,
      recordedLink:recordedRelations.length>0,
      recordedRelations});
  }
  return pairs;
}

// Resolve comparison citations against the entry that DECLARES the directed
// relationship. A source on the target entry is not evidence for this edge.
// Only return actual editorial records; review status never implies proof.
export function relationCitationDetails(book,relation) {
  const owner=book.entries.find(entry=>entry.id===relation?.from);
  const edge=owner?.links.find(link=>link.to===relation?.to && link.type===relation?.type);
  if(!edge) return [];
  const byId=new Map((owner.sources??[]).map(source=>[source.id,source]));
  return (edge.sourceIds??[]).map(id=>byId.get(id)).filter(Boolean).map(source=>({
    title:source.title,kind:source.kind,reviewStatus:source.reviewStatus,
    ...(source.url?{url:source.url}:{})
  }));
}
