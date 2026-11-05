# LOV3 decision register — implementation authority

This register captures approved project decisions, not full conversation transcripts. It must be read before modifying the application, alongside `lov3/memory/mustard-seed.json` and `lov3/memory/project-memory.json`.

## Authority and change procedure
- Latest explicit user-approved decision supersedes older proposals, task prompts, notes and earlier code assumptions. A developer suggestion is not approval.
- Do not reverse a recorded decision based on an older instruction. If a real technical blocker makes a change necessary, document the blocker and request approval before changing the requirement.
- Distinguish **proposed**, **approved**, **implemented**, **tested**, and **released**. A commit is not a passing test or a deployment.
- For each substantive new user-approved decision, add an entry here (without private transcript content), identify affected modules, implement it, add regression coverage, and link the resulting commit/PR and CI outcome. Unresolved questions remain explicitly pending.
- Read this register at the start of each autonomous build run. Do not assume all prior conversations are automatically visible to the build environment; transfer approved decisions here deliberately.
- Never put private transcripts, credentials, or sensitive personal information in this public repository.

## Approved decisions

### LOV3-DEC-001 — Three active comparison routes
- Status: **Approved; implementation restored; final CI verification pending**
- Current requirement: **At most three simultaneously active comparison routes/pins.** Empty routes are optional.
- Rationale: avoid system and interaction overload; prioritize working end-to-end MVP over adding slots.
- Supersedes: older four-to-six active-slot proposals and earlier assistant implementation.
- Affected: `lov3/discovery-workspace.mjs`, `lov3/discovery.html`, `lov3/discovery-workspace.test.mjs`, `lov3/workspace-transfer.test.mjs`.
- Regression rule: default capacity is three; attempts to expand to four or more must fail; importing legacy four-to-six-slot sessions must safely retain at most three valid pins.
- Evidence: incorrect six-slot commits `9cd888f`, `31fcfd8`, `85341ea`, `765438c`; restored in `1f50315`, `d285056`, `13f5aed`, `f24379a`. Verify latest CI before marking tested.

### LOV3-DEC-002 — MVP first, extensions later
- Status: **Approved; integration in progress**
- Current requirement: finish an operational, integrated journey: globe portal → knowledge page → pin/compare workspace → archive guide → contribution draft → navigation back with saved orientation and history.
- Use existing Genesis relationship records and distinguish verified facts, editorial interpretations and hypotheses. Do not fabricate sources.
- Keep the approved globe as the discovery portal, not the definition reading screen. Preserve contributor attribution and the original LOV3 guide identity.
- Defer optional archive expansion, richer AI features, VR and other add-ons until a functional browser-tested MVP exists.
- Affected: homepage, explorer, knowledge, discovery, guide, contribution, navigation and tests.
- Evidence: homepage links integrated in commit `24340ba`. Full browser verification and release approval outstanding.

## Required build-run checklist
1. Read Mustard Seed, project memory and this register; use approved decisions rather than stale prompts.
2. Select one MVP integration blocker, not an optional enhancement.
3. Change code and test the user-visible journey; avoid design reversals.
4. Record exact files, commit, CI result, browser-test status and remaining blocker in the PR/build log.
5. If a new conversation changes a decision, update this register **before** implementing the change.
