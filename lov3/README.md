# Book of LOV3 — Genesis foundation

Draft development workspace for the 346 IS LIF3 living knowledge graph.

Initial targets: entries, relationships, provenance, validation, and eventual IPFS/Base Sepolia attestations.

Existing website remains unchanged. No blockchain deployment is claimed.

## Genesis globe accessibility

Open `lov3/explorer.html` through a static HTTP server (not by double-clicking the file, because it loads `genesis.json` and an ES module). The prototype has a concept list that works without canvas interaction. Use **Previous concept** / **Next concept**, or focus a concept button and press **Arrow Up/Down**. The selected button exposes `aria-pressed`, and selection changes are announced in a status region.

Automatic rotation starts disabled when the browser requests reduced motion. The user can explicitly toggle it on or off; switching the system to reduced motion pauses it again. This is a 2D canvas prototype, not WebXR/VR.

From the repository root, run `node --test lov3/*.test.mjs lov3/memory/*.test.mjs` (Node.js 20+). Browser interaction still needs manual verification in a real hosted preview.
