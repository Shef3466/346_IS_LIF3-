# LOV3 — collaborator handoff and MVP demo

**Project:** 346 IS LIF3 / Book of LOV3. **Status:** development preview, not production. **Target:** usable MVP preview by November 8, 2026, subject to verification. This document describes what exists and what still needs work; it does not grant permission to deploy or publish private data.

## What to demonstrate

1. Start at `index.html`, enter the glowing relationship globe at `lov3/explorer.html`. It is a **discovery portal**, not a definition page.
2. Choose a concept and open `lov3/knowledge.html`. Explore its recorded Subject → Category → Word → Number (number only if meaningfully recorded), relationships, evidence status and the bounded Archive Guide.
3. Pin zero to **at most THREE** concepts in `lov3/discovery.html`; inspect pairwise comparisons and retrace the actual discovery trail. Four-to-six active slots are explicitly rejected.
4. Use `lov3/contribute.html` to draft a relationship proposal. This is not yet a live multiuser publishing/review backend.
5. Return to the globe with saved orientation. Check keyboard navigation, narrow-screen layout and reduced motion.

## Run locally

From the repository root, use any local static HTTP server (for example `python3 -m http.server 8000`), then open `http://localhost:8000/`. Do **not** open HTML via `file://`; the pages load JSON and ES modules. Run tests with Node 20+: `node --test lov3/*.test.mjs lov3/memory/*.test.mjs`. CI lives in `.github/workflows/lov3-ci.yml`. A passing Node test suite is not a substitute for real-browser interaction tests.

## Source map

- `lov3/genesis.json` — initial knowledge records and relationships; editorial drafts, not universally verified claims
- `lov3/explorer.html` / `lov3/explorer-controls.mjs` — globe and navigation
- `lov3/knowledge.html` / `lov3/portal-state.mjs` — concept reading and exact globe return
- `lov3/discovery.html` / `lov3/discovery-workspace.mjs` — three-route comparison and session trail
- `lov3/archive-guide.mjs` / `lov3/archive-questions.mjs` — deterministic source-aware assistance; **not** a general generative AI
- `lov3/contribute.html` / `lov3/contribution-draft.mjs` — local contribution drafting
- `lov3/memory/mustard-seed.json`, `lov3/memory/decision-register.md`, `lov3/memory/discovery-experience-decisions.md` — continuity and approved design requirements

## What help is useful now

**First:** test the complete visitor journey in real browsers on desktop and mobile; report exact reproducible failures with browser, page, steps, expected and observed behavior. Fix broken links, rendering, keyboard traps, state restoration and responsive layout before adding features.

**Second:** improve the coherence and visual polish of the existing experience without changing its design decisions. Keep the glowing globe, separate knowledge page, original LOV3 guide, provenance boundaries and maximum of three active comparison routes.

**Third:** make contribution review and future source verification practical. Do not claim a draft submission has been published or a citation has been verified unless that is actually true.

**Later, with explicit approval:** richer AI, collaborative backend, immersive/VR features, blockchain attestations and production deployment.

## Contribution contract

Read the decision register **before coding**. State which approved decision or reproducible defect your PR addresses. Keep changes focused; include tests and actual browser evidence. Do not expand the three-route capacity, invent historical sources, publish private conversations, or deploy to production without owner approval. Use a draft PR for review; passing CI alone does not mean released.

## Honest demo boundary

The baseline is intended to demonstrate **relationships between knowledge, discoveries and contributors**. The initial guide is bounded and local, many Genesis records are editorial drafts, and full browser acceptance is still outstanding. Show working behavior rather than promising unavailable functionality.
