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


## First hands-on preview feedback — responsive layout and conversational guide
- User opened the mobile development preview and found the full-screen navigation/selection experience useful. This is user feedback, not independently verified browser testing.
- Desktop layout is an open design choice: split-screen globe plus separate knowledge reading pane is a candidate, versus a floating detail window. Do not treat either as approved or implemented yet.
- LOV3 should support a back-and-forth conversational exchange after reading an archive record, allowing questions, comparisons and reasoned exploration. The guide should retain user-controlled navigation context.
- **Priority order:** make the program and end-to-end globe → knowledge → guide → discovery trail → three-pin comparison flow actually work first; polish responsive dimensions and scaling afterward. Do not confuse screen-size responsiveness with infrastructure scalability.
- Preserve the portal-only globe and stable separate knowledge reading context on mobile. Desktop may adapt layout without mixing definition text into globe geometry.
- Design iteration follows Think → Talk → See → Think: a usable preview is necessary to reveal further user insights; do not replace hands-on validation with repeated planning conversations.


## Heartstrings — globe route visualization concept
- New user concept: the chain-link globe is LOV3's heart; its connections are **heartstrings**. Following a knowledge relationship visually pulls/illuminates the corresponding string, expressing the route through the heart.
- When a visitor selects a point and follows actual relationships, highlight the traversed route on the globe so they can visually retrace how they reached a discovery. Preserve exact orientation when returning from a knowledge page.
- Highlight only relevant links and the user's real trail to avoid visual clutter; do not invent graph edges or claim a path where no relationship is recorded.
- This is a proposed experience direction, **not yet implemented or browser-tested**. Keep the globe a subject/category discovery portal; definition reading remains on a separate page.


## LOV3 Connection — discovery celebration concept
- When a visitor identifies and saves a meaningful new discovery, celebrate it as **“You made a LOV3 Connection!”**. This is a user-acknowledged discovery, not an automatic award for filling three comparison slots or a claim that an unverified relationship is factual.
- Presentation direction: playful, warm, nostalgic television game-show reveal energy, loosely recalling the emotional payoff of the classic Love Connection show. Create **original** animation, graphic identity, spoken wording and musical sting; do not copy the show's theme song, protected audiovisual expression, logos or trade dress.
- A heartstring/path illumination and subtle globe pulse can accompany the reveal. Respect reduced-motion settings, muted audio by default unless explicitly enabled, and accessible text announcements. Keep it brief and optional, not an interruption to reading.
- The celebration can link to a saved discovery and its traceable route and sources. This is approved concept direction; not yet implemented or tested.
