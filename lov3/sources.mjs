// Editorial references are evidence pointers, not proof that a claim is true.
// This module is dependency-free so graph validation and the browser can share it.
export const sourceKinds = Object.freeze(['primary', 'secondary', 'project-note']);
export const reviewStates = Object.freeze(['unreviewed', 'reviewed']);

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateEntrySources(entry) {
  if (entry.sources !== undefined && !Array.isArray(entry.sources))
    throw new Error('Sources must be an array');
  const sources = entry.sources ?? [];
  const ids = new Set();
  for (const source of sources) {
    if (!source || typeof source !== 'object' || Array.isArray(source) ||
        !nonempty(source.id) || !nonempty(source.title) ||
        !sourceKinds.includes(source.kind) || !reviewStates.includes(source.reviewStatus))
      throw new Error('Invalid editorial source');
    if (ids.has(source.id)) throw new Error('Duplicate editorial source ID');
    ids.add(source.id);
    if (source.url !== undefined) {
      if (!nonempty(source.url)) throw new Error('Invalid editorial source URL');
      let url;
      try { url = new URL(source.url); } catch { throw new Error('Invalid editorial source URL'); }
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password)
        throw new Error('Editorial source URL must use HTTPS without credentials');
    }
  }
  for (const link of entry.links ?? []) {
    if (link.sourceIds === undefined) continue;
    if (!Array.isArray(link.sourceIds) || new Set(link.sourceIds).size !== link.sourceIds.length ||
        link.sourceIds.some(id => !nonempty(id) || !ids.has(id)))
      throw new Error('Invalid relation source references');
  }
  return true;
}

export function citationCoverage(entry) {
  const sources = entry.sources ?? [];
  const links = entry.links ?? [];
  return {
    sourceCount: sources.length,
    reviewedCount: sources.filter(source => source.reviewStatus === 'reviewed').length,
    relationCount: links.length,
    citedRelationCount: links.filter(link => Array.isArray(link.sourceIds) && link.sourceIds.length > 0).length,
  };
}
