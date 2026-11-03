# LOV3 discovery experience — approved decisions

Status: approved design direction; implementation status must be verified separately.
Scope: public project decisions and rationale, not conversation transcripts.

## Central experience
- The Book of LOV3 is an immersive universe organized around love, creation and relationships. LOV3 is the original AI archive host/guide. The glowing chain-link globe represents LOV3's central knowledge core and is a subject/category **portal**, not a definition-reading screen.
- Selecting a globe subject opens a stable, separate knowledge page. Preserve exact globe position for return. Use Subject → Category → Word → Number only when the number has a meaningful correlation. Show relevant links, sources and related-page choices.
- The environment, guide, navigation, visual language and information should feel like one coherent world. Metaphors of brain/heart are intentional creative storytelling; do not interrupt the design discussion with irrelevant literalism.

## Focus versus history
- **Maximum THREE active comparison routes/pins**, not four to six. One or two are valid and complete; never pressure visitors to fill unused slots. No capacity selector that offers more than three.
- Give each active route richer information: definitions, images with attribution, concepts, numbers where relevant, citations, historical context and relationship evidence. Fewer choices, deeper information.
- Discovery history is independent of the three active routes. Visitors may traverse many pages and connections without filling comparison slots.
- Preserve ordered navigation trail and meaningful relationship transitions, so a visitor can backtrack the precise sequence of pages and see how they arrived at a discovery. Support exact return to the globe view. A saved discovery should preserve both the result and the path that led there.
- Separate documented connections from interpretations, hypotheses and user/AI-inferred links. Do not claim the system knows a visitor's private reasoning merely from their click trail.

## Portable discoveries and AI assistance
- Offer a readable comparison screenshot/snapshot for sharing, and a portable structured research-session export with up to three pins, navigation trail, relationship identifiers and source pointers. Screenshots alone may omit context; exports must not invent it.
- Visitors can take saved records to external AI systems for independent comparison and questions about overlooked relationships; LOV3's own archive guide should likewise retrieve cited context and ask thoughtful questions without forcing conclusions.
- Maintain user control of session state; do not expose private transcripts or secrets in public repository records.

## Why these decisions matter
- Three routes embody the Trinity and reduce cognitive pressure and clutter. The limit is on simultaneously held comparisons, **not** on knowledge depth or the number of visited pages.
- Retraceable discovery answers “How did I get here?” and lets someone revisit the transitions that produced an idea rather than reconstructing them from scattered notes.
- Design success is measured by meaningful new perspectives and understandable provenance, not number of visible controls.

## Engineering acceptance criteria
1. Workspace state, UI, imports/exports and tests enforce at most three active pins; zero, one and two remain valid.
2. Navigation trail survives ordinary within-session exploration and records actual visits without fabricated transitions; return/back behavior is testable.
3. Comparison and export include source pointers and distinctions between verified records and interpretations; no fabricated citations.
4. Keyboard, mobile and reduced-motion behavior remain usable; globe stays portal-only.
5. Tests and preview must be verified before describing features as completed.
