// Same-origin navigation state for the LOV3 globe and its separate knowledge pages.
// A knowledge page never accepts a caller-supplied return URL.
const DEFAULT = Object.freeze({angle:0.2,tilt:0.12,edges:true,running:true});
const conceptId = value => typeof value === 'string' && /^lov3:[0-9]{4,}$/.test(value);
function boundedNumber(value, fallback, min, max) {
  if (value === null || value.trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}
export function readGlobeState(search='') {
  const p = new URLSearchParams(search);
  return {
    angle: boundedNumber(p.get('angle'),DEFAULT.angle,-100000,100000),
    tilt: boundedNumber(p.get('tilt'),DEFAULT.tilt,-1.3,1.3),
    edges: p.get('edges') === null ? DEFAULT.edges : p.get('edges') !== '0',
    running: p.get('spin') === null ? DEFAULT.running : p.get('spin') === '1'
  };
}
export function globeStateParams(state) {
  if (!Number.isFinite(state.angle) || !Number.isFinite(state.tilt) ||
      Math.abs(state.angle)>100000 || Math.abs(state.tilt)>1.3)
    throw new RangeError('Invalid globe orientation');
  const p = new URLSearchParams();
  p.set('angle',String(state.angle));
  p.set('tilt',String(state.tilt));
  p.set('edges',state.edges ? '1':'0');
  p.set('spin',state.running ? '1':'0');
  return p;
}
export function knowledgeHref(id,state) {
  if (!conceptId(id)) throw new TypeError('Invalid concept ID');
  const p = globeStateParams(state);
  p.set('id',id);
  return './knowledge.html?'+p.toString();
}
export function globeReturnHref(search) {
  const p = globeStateParams({...readGlobeState(search),running:false});
  const id = new URLSearchParams(search).get('id');
  if (conceptId(id)) p.set('selected',id);
  return './explorer.html?'+p.toString();
}
export function selectedId(search,key='id') {
  const id = new URLSearchParams(search).get(key);
  return conceptId(id) ? id : null;
}

// Pin requests are one-shot navigation actions. Remove them from the address
// after the workspace consumes the request, without losing the saved globe pose.
export function withoutWorkspacePin(search='') {
  const params=new URLSearchParams(search);
  params.delete('pin');
  const rest=params.toString();
  return rest?'?'+rest:'';
}
