# Bloom in Time

**Guide the light. Find the rhythm. Wake the garden.**

A seated VR puzzle game in which the player rearranges miniature pathways of light so musical flowers bloom together.

## Project state

Documentation baseline, created November 3, 2026. No game code, installed dependencies, deployed application, or hardware test results exist yet. The product direction and constraints are agreed; detailed specifications below are proposed implementation decisions that the first prototype must validate.

| Item | Direction |
| --- | --- |
| Competition | Meta VR Start Developer Competition 2026 |
| Track / division | Gaming / New Experience |
| Developer | Solo |
| Stack | IWSDK, TypeScript, Three.js, Vite |
| Experience | Fully virtual, seated, usable end-to-end with hands |
| Hardware access | None; development and demo capture use XR emulation |
| Release target | Six authored puzzles around one evolving miniature tree |
| Deadline | November 18, 2026, 23:00 Africa/Nairobi / 20:00 UTC |
| Hosting | Static HTTPS deployment; GitHub Pages is the initial proposal |

## Start here

1. [Documentation map](docs/README.md)
2. [Vision and scope](docs/product/vision-and-scope.md)
3. [Game rules and six-level progression](docs/product/game-design.md)
4. [Architecture and diagrams](docs/architecture/overview.md)
5. [Development sequence](docs/planning/roadmap.md)
6. [Current backlog](docs/planning/backlog.md)
7. [Submission requirements](docs/competition/requirements.md)

## First implementation milestone

Prove a two-flower puzzle with grabbing, automatic alignment, a splitter, and one delay. The same authored solution must evaluate identically through desktop and emulated hand input. Do this before building the complete garden.

This repository is intentionally documentation-only at this checkpoint. Instructions in [development workflow](docs/engineering/development-workflow.md) describe future setup; they are not commands that have already been run.

## Verification and ownership

Emulation is accepted for this competition, but Quest performance, physical comfort, and real hand-tracking reliability remain unverified without hardware. See the [verification plan](docs/engineering/testing-and-performance.md).

No open-source license has been selected. Original material, dependency licenses, and external assets must be tracked separately; see [asset and privacy policy](docs/engineering/asset-and-privacy-policy.md).
