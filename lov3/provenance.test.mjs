import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalJSON, buildManifest, verifyManifest } from './provenance.mjs';

const book = JSON.parse(readFileSync(new URL('./genesis.json', import.meta.url), 'utf8'));
test('canonicalization ignores object insertion order', () => {
  assert.equal(canonicalJSON({ z: 2, a: { y: 3, b: 1 } }), canonicalJSON({ a: { b: 1, y: 3 }, z: 2 }));
});
test('canonicalization preserves array order', () => {
  assert.notEqual(canonicalJSON([1, 2]), canonicalJSON([2, 1]));
});
test('canonicalization rejects unsupported values and cycles', () => {
  assert.throws(() => canonicalJSON({ bad: undefined }), TypeError);
  const circular = {}; circular.self = circular;
  assert.throws(() => canonicalJSON(circular), TypeError);
});
test('Genesis manifest is deterministic and counts graph entries', () => {
  const first = buildManifest(book), second = buildManifest(structuredClone(book));
  assert.deepEqual(first, second);
  assert.equal(first.entryCount, 13);
  assert.match(first.digest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(first.publicationStatus, 'unpublished');
});
test('verified manifest rejects modified content', () => {
  const manifest = buildManifest(book);
  assert.equal(verifyManifest(book, manifest), true);
  const changed = structuredClone(book);
  changed.entries[0].title += ' changed';
  assert.equal(verifyManifest(changed, manifest), false);
  assert.equal(verifyManifest(book, { ...manifest, entryCount: 999 }), false);
});
test('manifest rejects invalid graph or missing edition', () => {
  const changed = structuredClone(book); changed.entries[0].links[0].to = 'missing';
  assert.throws(() => buildManifest(changed));
  const noEdition = structuredClone(book); delete noEdition.edition;
  assert.throws(() => buildManifest(noEdition));
});
