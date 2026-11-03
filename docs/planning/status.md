# Current status

Last updated: November 3, 2026.

| Area | Actual state |
| --- | --- |
| Title / direction | Bloom in Time; seated hands-first light-and-timing puzzle |
| Developer | Solo; no physical headset access expected |
| Registration | Owner reports application/registration submitted; Start acceptance not independently verified |
| Documentation | Product, design, architecture, engineering, delivery, submission baseline, and first prototype report |
| Application | Two-flower puzzle in a moonwater grove, sculpted living island, opening petals/restored foliage, light pulses, synthesized notes, orbit/zoom, contextual spatial controls, undo/hint/reset, comfort controls, and local saves |
| SDK | IWSDK 1.1.0-rc.2 pinned in package-lock.json; Node 22.22.0; npm 11+ |
| Repository | Public GitHub remote: https://github.com/simiyu-samuel/bloom-in-time |
| Verification | Rebuild: 10 tests, typecheck/build, desktop solve/orbit, emulated hand menu/grabs/recovery/exit, native visual review, and 18 static assets checked. Fresh production-browser automation blocked by browser policy; see presentation report |
| Hosting | No public game deployment yet |
| Campaign | One prototype puzzle; the six-puzzle release remains planned |
| Submission / video | Draft plans only; not submitted or recorded |

## Presentation rebuild

The richer island and grove are implemented and saved in the repository. Desktop solving and orbit, the compact spatial menu, left-hand grabbing/snapping, held-input loss, and hand-accessible exit passed fresh runtime checks. Decorative glows are excluded from XR hit testing, and spatial controls activate on contact so slow pokes do not expire. The [presentation verification report](../engineering/presentation-verification.md) records the final build and visual evidence. Physical Quest tracking, reach, comfort, and frame rate remain unverified.

## Next development phase

Build the authored campaign around the verified mechanic: add level loading, witness validation, progression, and replay, then implement the remaining five puzzles. Verify the tutorial and each new level through emulated hands, retaining the compact Tools/Settings dock. Continue with [B06/B07 in the backlog](backlog.md); keep the existing two-flower loop passing.

## Evidence

The [prototype verification report](../engineering/prototype-verification.md) records actual scenarios, environment, corrections, and remaining limitations. Domain arrivals change from A=3/B=4 to A=4/B=4. Direct emulated grabs and spatial controls use the same validated session. Emulation establishes no physical Quest performance or tracking result.

The original documentation checkpoint remains in Git history. The owner subsequently authorized implementation and connecting the named GitHub remote. No public deployment or competition submission is implied by a successful local build.

## Remaining owner decisions

Choose the final host/URL and source license. Confirm Start membership acceptance and developer-account requirements before submission. These do not prevent continued local development.
