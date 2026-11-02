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

## Meaning-first Book of LOV3 navigation (draft)

The explorer displays **Subject → Category → Word → Number**, with the final number only when an editor explicitly records a relevant numerical relationship. Technical IDs such as `lov3:0011` remain stable graph identifiers, **not** visible knowledge labels or inferred numerical meaning. The rotating chain-link globe uses short word labels; the concept list and selected detail show the full hierarchy.

Genesis entries now include editorial `subject`, `category` and `word` strings and may include `number` as a string (for example `3–4–6–9`). These draft classifications are navigational interpretations, not verified historical or mathematical correspondences. The `lov3/taxonomy.mjs` helper keeps older entries readable with explicit unclassified fallbacks. This change alters the unpublished Genesis JSON and its future provenance digest; regenerate any manifest before publication.


## Knowledge portal and archive guide (2026-11-01 draft increment)

The globe is a discovery **portal**, not a full definition screen. Tapping a glowing concept, or activating a concept button, opens a **separate** `lov3/knowledge.html` page. Previous/Next previews a selection, then **Open selected knowledge page** enters it. The knowledge page displays Subject → Category → Word → Number only when the editorial record has a meaningful number, and offers links to incoming and outgoing relationships. It uses `lov3/archive-guide.mjs` to produce a contextual, deterministic **retrieval preview**, not a live generative AI or an imitation of a film character. Historical claims, citations, images and explanations are never invented: the existing Genesis entries remain unpublished drafts with no reviewed sources.

The same-origin link preserves the globe's angle, tilt, and relationship visibility through URL query parameters. **Return to globe** restores the selected concept and exact saved orientation, with automatic rotation paused so the returned pose is visible. The `lov3/portal-state.mjs` helper validates concept IDs and bounds numeric query values; it never follows an arbitrary return URL. The knowledge page uses DOM text nodes rather than untrusted HTML for record content, supports narrow/mobile layouts, keyboard links, and reduced-motion navigation.

Run `node --test lov3/*.test.mjs lov3/memory/*.test.mjs` to check the portal-state round trip, source-aware guide, and page wiring. **Not implemented in this initial portal increment:** interactive conversational model, source-attributed historical media, or VR. The later Discovery Workspace increment below provides tab-scoped pins and a bounded history trail. These remain future increments and must not be represented as deployed.

### Continuity experiment record

The MUSTARD SEED kernel is explicitly loaded at the start of each development run; the public seed and project-memory files are not private conversation transcripts or model-weight memory. During the November 1–14 evaluation window, record kernel recovery, tests, useful changes, observed drift, errors, and limitations. Begin an evidence-based interim assessment on November 11. Passing startup tests alone is not proof of flawless cross-session understanding.

## Discovery Workspace (2026-11-01 increment)

From any knowledge page choose **Pin to Discovery Workspace** to add that concept to a tab-scoped, user-controlled comparison view at `lov3/discovery.html`. Four slots appear by default; expand to five or six without losing pins. Each card shows the recorded subject/category/word/optional number, source review status, and a link back to the original knowledge page. Pairwise comparison only reports shared editorial classifications or explicit Genesis graph links; it does not invent definitions, numbers, images, or historical connections. The exploration trail keeps the 24 most recent knowledge-page visits. Remove individual pins or clear the tab's workspace; invalid or stale IDs are discarded. No network storage is used.

The browser uses `sessionStorage` for pins and trail. When storage is blocked, the page still renders, but continuity across navigation cannot be guaranteed. The workspace is a draft, not a multiuser collaboration system; actual browser/mobile/assistive-tech checks remain pending. Verify with `node --test lov3/*.test.mjs lov3/memory/*.test.mjs`.

## Pinned-context Archive Guide (2026-11-01 increment)

The Knowledge Archive now passes the tab-scoped Discovery Workspace pins into the original deterministic Archive Guide. A visitor inspecting one concept sees links to their other pinned discoveries with only **recorded** shared subject, category, or direct graph links. When no recorded relationship exists, the guide says so explicitly. Duplicate, invalid, and self-referential pins are ignored; the page uses safe same-origin knowledge links and text nodes. This is contextual navigation, **not** historical proof or generative conversation. No external request or user profile is created. Tests cover the comparison, sanitization, and page wiring.

## Archive Guide questions (2026-11-02 draft increment)

The knowledge page now offers an accessible **Ask guide** form and four suggested questions. The local deterministic router in `lov3/archive-questions.mjs` can summarize the current draft record, attached editorial sources with their actual review status, recorded incoming/outgoing links, and comparisons against the visitor's existing tab-scoped pins. Answers link to only real Genesis entries or attached HTTPS editorial sources; no citations, definitions, historical events, images, or inferred correlations are fabricated. Unsupported questions receive a clear scope limitation. Questions are processed locally and are not saved to session storage, transmitted to an AI provider, or treated as a chat transcript.

This is a bounded **question-and-answer prototype**, not a generative or fully conversational AI. Browser keyboard and screen-reader behavior still needs real-device testing. Run `node --test lov3/*.test.mjs lov3/memory/*.test.mjs` and review the PR checks before accepting the increment.

## Trail-aware Archive Guide recommendations (2026-11-02 draft increment)

The guide now offers **Where should I explore next?** as a fifth local question. It suggests up to three actual neighboring Genesis entries, prioritizing concepts not yet visited in this browser tab. If no direct graph neighbors exist, it may offer entries with a shared **recorded** subject or category, clearly labeled as an editorial classification rather than a verified relationship. If neither exists, it declines to invent a connection. Relation citation counts are shown as metadata, never as proof. The existing knowledge page renders suggestions as same-origin links using the saved globe orientation. No personal questions or trail contents are sent to a server. Automated tests cover visit-trail ranking, classification fallback, no-match behavior and revisits; real-device browser testing remains pending.

## Workspace return-and-resume navigation (2026-11-02 draft increment)

The Discovery Workspace now keeps both **Return to the globe** and **Explore more concepts** tied to the incoming knowledge-page globe orientation, rather than resetting the second link to the default pose. A **Resume last discovery** link points to the latest valid tab-scoped visit and is hidden when the trail is empty or cleared. The link uses only validated Genesis IDs and the existing same-origin `knowledgeHref` helper. A Node integration-style test simulates globe → knowledge → pin → workspace → resume and checks the original angle/tilt/edge visibility and paused return pose. This verifies URL/state helpers and page wiring, **not actual browser navigation, mobile touch, or screen-reader behavior**. No new media or AI model is implied.

## Direction-aware pinned comparisons (2026-11-02 draft increment)

The Discovery Workspace now identifies **which pinned concept points to which**, displaying the recorded relationship type and exact number of attached relation source pointers. A reciprocal link appears as a separate directed relationship; a shared subject/category alone never becomes an invented graph link. Zero pointers are displayed as zero, not disguised as verified evidence. The existing source review caveat remains: citation counts do not prove a historical claim. Added regression tests for forward, reverse, bidirectional and absent links, plus workspace rendering wiring. This is a source-conscious editorial comparison, not a new fact inference or generative AI. Real-browser/mobile/screen-reader checks are still required.

## Keyboard focus after unpinning (2026-11-02 draft increment)

Unpinning a discovery previously rebuilt its card list and removed the focused button, leaving keyboard focus without a stable target. The workspace now moves focus to the next surviving Unpin button (or the preceding one when removing the last card), and to the comparison-slot selector when no pins remain. An `aria-live` status announces which concept was removed and the updated slot count. When browser session storage is unavailable, the warning remains visible after unpinning. The selection and history trail remain user-controlled; no new data is sent to a server. Focus-target and HTML wiring tests cover the behavior, but real keyboard/screen-reader browser testing is still required.


## Previous-discovery navigation (2026-11-02 draft increment)

The separate knowledge page now offers **Previous discovery** when a prior valid concept exists in the current tab's visit trail. It links to the immediately preceding recorded discovery (not the browser's potentially unrelated Back destination), preserving the exact globe angle, tilt and relationship visibility through the existing same-origin link helper. The link stays hidden for the first discovery or when tab storage cannot recover a prior visit. A bounded history prevents infinite trails; no questions, personal data or external navigation destinations are stored. Node tests cover first visit, A → B → A, stale/invalid IDs, duplicate entries, and exact orientation round trips. Real-browser focus and screen-reader verification remains outstanding.

## Backward trail navigation (2026-11-02 draft increment)

**Previous discovery** now walks backward through the actual tab-scoped visit trail rather than appending a new visit. This fixes a loop where A → B → Previous A would make B appear as the next "previous" destination. The same-origin knowledge link carries a narrow `trail=back` intent; the trail is shortened **only** when the destination matches the immediately preceding valid record. Stale, forged, or invalid back intents cannot silently remove visits, and refreshing the returned page does not pop another entry. Pins and the saved globe angle/tilt/relationship visibility remain intact. Four Node tests cover backward walks, refresh, invalid requests and page wiring. Actual browser history, mobile touch and assistive-technology behavior still need hands-on testing.
