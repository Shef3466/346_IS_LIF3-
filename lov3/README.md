# Book of LOV3 — Genesis foundation

Draft development workspace for the 346 IS LIF3 living knowledge graph.

Initial targets: entries, relationships, provenance, validation, and eventual IPFS/Base Sepolia attestations.

Existing website remains unchanged. No blockchain deployment is claimed.

## Genesis globe accessibility

Open `lov3/explorer.html` through a static HTTP server (not by double-clicking the file, because it loads `genesis.json` and an ES module). The prototype has a concept list that works without canvas interaction. Use **Previous concept** / **Next concept**, or focus a concept button and press **Arrow Up/Down**. The selected button exposes `aria-pressed`, and selection changes are announced in a status region.

Automatic rotation starts disabled when the browser requests reduced motion. The user can explicitly toggle it on or off; switching the system to reduced motion pauses it again. This is a 2D canvas prototype, not WebXR/VR.

From the repository root, run `node --test lov3/*.test.mjs lov3/memory/*.test.mjs` (Node.js 20+). Browser interaction still needs manual verification in a real hosted preview.

## Editorial source references (draft)

Entries may have an optional `sources` array. Each source has a unique entry-local `id`, nonempty `title`, `kind` (`primary`, `secondary`, or `project-note`), and `reviewStatus` (`unreviewed` or `reviewed`). An optional `url` must be an HTTPS link without embedded credentials. Links may have `sourceIds`, an array of IDs referring to sources on the **same entry**.

Example (illustrative only; **not** a verified source or publication claim):

```json
{
  "id": "lov3:example",
  "title": "Example concept",
  "status": "draft",
  "sources": [
    { "id": "note:1", "title": "Editorial note placeholder", "kind": "project-note", "reviewStatus": "unreviewed" }
  ],
  "links": [{ "to": "lov3:0002", "type": "questions", "sourceIds": ["note:1"] }]
}
```

`validate(book)` rejects duplicate or missing source references and unsafe source URLs. The explorer displays how many references and relations have citations, without treating citations as proof. Existing Genesis entries remain uncited drafts; no sources have been fabricated or marked reviewed. Adding source data changes the canonical provenance hash and requires a new manifest. Run `node --test lov3/*.test.mjs lov3/memory/*.test.mjs`.
