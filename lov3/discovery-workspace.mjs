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
