# LOV3 provenance draft

This module creates a reproducible SHA-256 fingerprint for the **unpublished** Genesis graph. It is an offline building block for later IPFS content-addressing and Base/EAS attestations, **not** a claim that anything was uploaded, pinned, signed, or recorded on-chain.

Run from the repository root with Node.js 20+:

```sh
node --test lov3/graph.test.mjs lov3/provenance.test.mjs
node lov3/build-manifest.mjs
```

The manifest includes the edition, schema, number of entries and links, and a SHA-256 digest of the complete `genesis.json` document. `verifyManifest(book, manifest)` checks whether the manifest still matches the book. Changing any field or array order changes the digest. Object property insertion order does not change it.

Canonicalization version `sorted-object-keys-json-v1` recursively sorts object keys and preserves array order. It is **not** RFC 8785/JCS. A future publisher must use the same canonicalization and verify the digest before recording a CID or attestation. Do not confuse this SHA-256 digest with an IPFS CID or an EAS UID. Keep source citations and editorial review separate; a matching hash proves content integrity, not historical truth or authorship.

No keys, wallets, private conversations, network requests, paid operations, or deployments are involved.
