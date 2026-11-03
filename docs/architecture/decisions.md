# Architecture decision record

Decisions dated November 3, 2026. ADR-001 through ADR-007 are implemented in the first slice; ADR-008 remains a release requirement. Revisit when evidence warrants.

## ADR-001: Static browser application

Use a static IWSDK application with TypeScript and Vite, with browser-local progress. No backend is needed for the puzzle loop.

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

Reason: package details may change. Implementation: Core, CLI, and Vite plugin are pinned to 1.1.0-rc.2 with package-lock.json. The observed local Node 22.22.0 is recorded in .nvmrc and satisfies the current setup guide.

## ADR-007: Original minimal assets and local state

Prefer original geometry and synthesized music, no analytics, and no external runtime calls beyond static assets.

Reason: clear ownership, small downloads, and no service dependency. Consequence: our art direction must succeed through coherence and feedback rather than asset quantity. The repository's source license remains a user decision.

## ADR-008: Immutable competition release

Deploy a pinned final commit to a dedicated stable URL and freeze that submitted build after the deadline. Disable automatic deployment to that URL during judging.

Reason: the rules prohibit post-deadline changes. Consequence: further development uses another branch and preview URL; preserve the judged artifact through winner announcement.

## Changes

For a meaningful revision, record the date, decision changed, evidence, and consequences here. A failed prototype can change these decisions; do not quietly keep conflicting specifications.

## ADR-009: Native scene and UIKitML with a small desktop adapter

Implemented November 3, 2026. Keep the garden and spatial panel in an IWSDK native scene, with parentless deterministic procedural prototypes in the asset manifest. Use Horizon Button/ButtonLabel components with explicit centimeter dimensions rather than inheriting their large default pixel-style sizes. Desktop HTML and UIKit events route to the same GardenSession commands.

Reason: editor-visible composition, reusable original assets, and one rules boundary. Consequence: native interaction must be checked in an active XR session; a desktop DOM click does not verify a spatial button. Disable locomotion and physics; proximity grabbing and discrete snap placement provide the required manipulation.

## ADR-010: Install with npm 11 and retain the Three.js alias

Implemented November 3, 2026. Require npm 11+, preserve the generator's super-three alias, and use the `$three` override reference. Omit optional MetaVR and semantic-reference tooling from the application dependencies. Use tsx to load TypeScript for Node tests.

Evidence: the host's npm 9 rejected the alias override and optional semantic tooling attempted an unnecessary ONNX download. The reduced installation, typecheck, domain tests, and production build succeed. Consequence: contributors need npm 11; the README includes a parent-directory invocation for older hosts. No runtime AI or native headset dependency is introduced.

## ADR-011: A spatial grove with a separate presentation layer

Implemented November 3, 2026. Replace the empty backdrop with a native procedural grove around the seated player. Keep the central interaction volume clear. The living island, connected foliage, flowers, and grove are deterministic parentless assets; geometry and material authorship stays outside scene JSON.

GardenPresentation consumes authoritative session events to animate light, petals, restored growth, and fireflies. It cannot change a placement or award success. DesktopView owns only nonimmersive inspection and yields to the tracked XR camera. Board-turn and comfort controls remain available to hands.

Keep the default spatial dock compact. Tools reveals piece controls; Settings reveals comfort and reset controls. Explicit dimensions keep labels and touch targets within the owning panel. Retain validated select/place as an alternative to direct pinching. Use small procedural additive halos instead of framebuffer postprocessing, real-time shadows, or new asset dependencies. Honor reduced motion for decorative movement and light travel.

Fresh native scene rendering, desktop solving, emulated hand-menu solving, direct grabbing, input-loss recovery, and hand-accessible exit passed. Decorative Sprite raycasts are disabled on placed clones because the XR pointer raycaster has no camera; the sprites remain visible. Spatial buttons activate on pointer contact rather than waiting for the library's 800 ms click window. Physical Quest tracking, reach, and frame rate remain unverified.
