import { createHash } from 'node:crypto';
import { validate } from './graph.mjs';

// Version 1 canonicalization: sort object keys recursively, preserve array order.
// This is an application-specific JSON convention, NOT RFC 8785/JCS.
export function canonicalJSON(value) {
  const seen = new Set();
  function normalize(item) {
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return item;
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (typeof item !== 'object') throw new TypeError('Only finite JSON values are supported');
    if (seen.has(item)) throw new TypeError('Circular object reference');
    seen.add(item);
    let result;
    if (Array.isArray(item)) result = item.map(normalize);
    else {
      if (Object.getPrototypeOf(item) !== Object.prototype && Object.getPrototypeOf(item) !== null)
        throw new TypeError('Only plain JSON objects are supported');
      result = Object.create(null);
      for (const key of Object.keys(item).sort()) result[key] = normalize(item[key]);
    }
    seen.delete(item);
    return result;
  }
  return JSON.stringify(normalize(value));
}

export function buildManifest(book) {
  validate(book);
  if (typeof book.edition !== 'string' || !book.edition.trim()) throw new Error('Missing edition');
  const content = canonicalJSON(book);
  return {
    schema: 'lov3.provenance.v1',
    contentSchema: book.schema,
    edition: book.edition,
    canonicalization: 'sorted-object-keys-json-v1',
    digest: 'sha256:' + createHash('sha256').update(content, 'utf8').digest('hex'),
    entryCount: book.entries.length,
    relationCount: book.entries.reduce((sum, entry) => sum + entry.links.length, 0),
    publicationStatus: book.publicationStatus ?? 'unspecified',
  };
}

export function verifyManifest(book, manifest) {
  if (!manifest || typeof manifest !== 'object') return false;
  try { return canonicalJSON(buildManifest(book)) === canonicalJSON(manifest); }
  catch { return false; }
}
