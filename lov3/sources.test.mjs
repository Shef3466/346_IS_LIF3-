import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEntrySources, citationCoverage } from './sources.mjs';
import { validate } from './graph.mjs';
import { buildManifest } from './provenance.mjs';

const book = {
  schema: 'lov3.v1',
  entries: [
    { id: 'lov3:1', title: 'Draft A', links: [{ to: 'lov3:2', type: 'relates-to' }] },
    { id: 'lov3:2', title: 'Draft B', links: [] },
  ],
};
const cited = () => ({
  ...structuredClone(book),
  entries: [
    {
      id: 'lov3:1', title: 'Draft A',
      sources: [{ id: 'ref:1', title: 'Source pending editorial review', kind: 'project-note', reviewStatus: 'unreviewed' }],
      links: [{ to: 'lov3:2', type: 'relates-to', sourceIds: ['ref:1'] }],
    },
    structuredClone(book.entries[1]),
  ],
});

test('legacy draft without sources remains valid and clearly uncited', () => {
  assert.equal(validate(book), true);
  assert.deepEqual(citationCoverage(book.entries[0]), {
    sourceCount: 0, reviewedCount: 0, relationCount: 1, citedRelationCount: 0,
  });
});
test('explicit source references validate and count without claiming verification', () => {
  const next = cited();
  assert.equal(validate(next), true);
  assert.deepEqual(citationCoverage(next.entries[0]), {
    sourceCount: 1, reviewedCount: 0, relationCount: 1, citedRelationCount: 1,
  });
});
test('a relation cannot cite a missing source', () => {
  const next = cited();
  next.entries[0].links[0].sourceIds = ['ref:missing'];
  assert.throws(() => validate(next), /Invalid relation source references/);
});
test('duplicate source IDs and duplicate relation citations are rejected', () => {
  const next = cited();
  next.entries[0].sources.push({ ...next.entries[0].sources[0] });
  assert.throws(() => validate(next), /Duplicate editorial source ID/);
  const other = cited();
  other.entries[0].links[0].sourceIds = ['ref:1', 'ref:1'];
  assert.throws(() => validate(other), /Invalid relation source references/);
});
test('unsupported review status and source type are rejected', () => {
  const next = cited();
  next.entries[0].sources[0].reviewStatus = 'verified';
  assert.throws(() => validate(next), /Invalid editorial source/);
  const other = cited();
  other.entries[0].sources[0].kind = 'imaginary';
  assert.throws(() => validate(other), /Invalid editorial source/);
});
test('source URLs require HTTPS and no embedded credentials', () => {
  for (const url of ['http://example.com/a', 'javascript:alert(1)', 'https://user:pass@example.com/a', '/relative']) {
    const next = cited();
    next.entries[0].sources[0].url = url;
    assert.throws(() => validate(next), /URL/);
  }
  const good = cited();
  good.entries[0].sources[0].url = 'https://example.com/research';
  assert.equal(validate(good), true);
});
test('sources property and relation sourceIds must be arrays', () => {
  const next = cited();
  next.entries[0].sources = 'not an array';
  assert.throws(() => validate(next), /Sources must be an array/);
  const other = cited();
  other.entries[0].links[0].sourceIds = 'ref:1';
  assert.throws(() => validate(other), /Invalid relation source references/);
});

test('editorial citation changes alter the deterministic provenance fingerprint', () => {
  const next = cited();
  next.edition = 'test-draft';
  const first = buildManifest(next).digest;
  next.entries[0].sources[0].title = 'Revised editorial note';
  assert.notEqual(buildManifest(next).digest, first);
});
