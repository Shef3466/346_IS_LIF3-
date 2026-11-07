// User-controlled, local-only transfer of public Genesis discovery IDs.
// No transcripts, prompts, credentials, or external requests are included.
import {normalizeWorkspace} from './discovery-workspace.mjs';

export const TRANSFER_SCHEMA='lov3.discovery.session.v1';
export const MAX_TRANSFER_BYTES=32768;
export function exportDiscoverySession(state,validIds,genesisEdition) {
  if(typeof genesisEdition!=='string'||!genesisEdition.trim()) throw new TypeError('Missing Genesis edition');
  return JSON.stringify({
    schema:TRANSFER_SCHEMA,
    genesisEdition,
    workspace:normalizeWorkspace(state,validIds)
  },null,2)+'\n';
}
export function importDiscoverySession(text,validIds,currentEdition) {
  if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_TRANSFER_BYTES)
    throw new RangeError('Session file must be a text JSON file no larger than 32 KiB');
  let data;
  try{data=JSON.parse(text);}catch{throw new TypeError('Invalid JSON session file');}
  if(!data||Array.isArray(data)||data.schema!==TRANSFER_SCHEMA||
     typeof data.genesisEdition!=='string'||!data.genesisEdition.trim()||
     !data.workspace||typeof data.workspace!=='object'||Array.isArray(data.workspace))
    throw new TypeError('Not a LOV3 discovery session');
  if(!Number.isInteger(data.workspace.capacity)||data.workspace.capacity<3||data.workspace.capacity>6||
     !Array.isArray(data.workspace.pins)||!Array.isArray(data.workspace.trail))
    throw new TypeError('Malformed LOV3 workspace');
  const workspace=normalizeWorkspace(data.workspace,validIds);
  return {workspace,editionMatches:data.genesisEdition===currentEdition};
}
