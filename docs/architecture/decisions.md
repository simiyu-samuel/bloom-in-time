# Architecture decision record

Decisions dated November 3, 2026. These are implementation proposals within the agreed product direction; revisit when evidence warrants.

## ADR-001: Static browser application

Use a static IWSDK application, proposed TypeScript and Vite, with browser-local progress. No backend is needed for the puzzle loop.

Reason: solo scope, simple hosted link, no credentials or remote service needed to play. Consequence: saves are device/browser/origin-local and cannot sync. Changing the hosting origin will not carry progress automatically.

## ADR-002: Deterministic graph and integer beats

Evaluate a finite directed graph with positive travel durations and one-beat delays. Rendering and Web Audio consume derived events.

Reason: timing is a game rule and must not depend on frame rate. Consequence: cycles, merging, and arbitrary physics are excluded; authored content needs validated witnesses.

## ADR-003: Discrete placements and orientations

Use authored sockets, a small orientation catalog, and generous automatic placement. Preserve hand-accessible turn buttons.

Reason: a player should solve a logic puzzle without precise hand alignment. Consequence: less free-form construction; more authoring control and more repeatable emulation.

## ADR-004: Fully virtual seated presentation

Use one miniature tree in a controlled virtual environment, with board recenter and discrete turns. Avoid requiring passthrough, room scans, anchors, or physical locomotion.

Reason: no hardware access and limited time make room-dependent behavior a poor baseline fit. Consequence: our spatial value must come from paths at different depths, tactile manipulation, and the sculpture itself.

## ADR-005: One input-independent command path

Desktop and XR adapters use the same domain commands and validation.

Reason: keyboard/mouse development must exercise real game logic, while the final application still needs a complete hand path. Consequence: adapter tests and hand-flow checks remain necessary; desktop success alone does not prove XR usability.

## ADR-006: Pin SDK versions after scaffolding

Use the current official generator when implementation starts, inspect its output, and commit compatible dependencies and lockfile.

Reason: package details may change. Consequence: documentation does not pretend an exact SDK version is already selected. The observed local Node 22.22.0 is recorded in .nvmrc and satisfies the current setup guide.

## ADR-007: Original minimal assets and local state

Prefer original geometry and synthesized music, no analytics, and no external runtime calls beyond static assets.

Reason: clear ownership, small downloads, and no service dependency. Consequence: our art direction must succeed through coherence and feedback rather than asset quantity. The repository's source license remains a user decision.

## ADR-008: Immutable competition release

Deploy a pinned final commit to a dedicated stable URL and freeze that submitted build after the deadline. Disable automatic deployment to that URL during judging.

Reason: the rules prohibit post-deadline changes. Consequence: further development uses another branch and preview URL; preserve the judged artifact through winner announcement.

## Changes

For a meaningful revision, record the date, decision changed, evidence, and consequences here. A failed prototype can change these decisions; do not quietly keep conflicting specifications.
