# First playable prototype verification

Date: November 3, 2026. Scope: the code in the commit containing this report, with one two-flower puzzle. This is a development milestone, not submission readiness.

## Environment

Linux; Node 22.22.0; npm 11 for installation; TypeScript 5.9.3; Vite 7.3.7; IWSDK Core/CLI/Vite plugin 1.1.0-rc.2. Runtime checks used the SDK-managed HeadlessChrome 156, IWER Meta Quest 3 emulation, and an active `immersive-vr` session with hand tracking. The renderer reported Intel HD Graphics 4000 through Mesa/ANGLE. Production desktop smoke testing used the Codex in-app browser against the static `dist/` directory on localhost.

No physical Quest was used. No hardware frame rate, real tracking, physical reach, or comfort result is claimed.

## Checks and observed results

| Check | Result / observation |
| --- | --- |
| TypeScript | `npm run typecheck` passes |
| Domain/application/storage tests | `npm test` passes 10 tests |
| Production bundle | `npm run build` passes; upstream Zod annotation and large-chunk warnings remain |
| Initial and solved witness | Initial arrivals A=3/B=4; replacing the bend with the delay gives A=4/B=4 |
| Invalid topology | Missing/backward pieces, exclusive beat-8 expiry, active loops, duplicate arrivals, malformed content, reused pieces, and size caps fail finitely |
| Session correctness | Occupancy guard, undo, revision invalidation, no-op placement, 30/60/90/120 FPS completion, paused/manipulated playback, and long stalls checked |
| Save boundary | Partial layouts accepted; corrupt, oversized, obsolete, and unknown-piece saves rejected; unavailable storage does not break play |
| Desktop development flow | Occupied placement rejected; return/place solves; undo removes the solution; confirmed reset restores A=3/B=4 |
| Emulated direct manipulation | Proximity pinch adds the SDK-owned Grabbed component; returning the bend empties its socket; grabbing and dropping the delay near it snaps to A=4/B=4; a full cycle completes |
| Emulated spatial controls | Play, select, return, place, reset, and confirmation exercise the same session commands; left hand can solve the puzzle |
| Recovery | Removing a held hand input source releases the piece, pauses playback, and preserves the committed revision; session exit is hand-accessible and pauses |
| Comfort controls | Emulated left-hand sound, reduced-motion, contrast, and recenter controls activate; physical usability remains unverified |
| Production desktop flow | Static HTML, JS, font, UIKitML, and scene load successfully; the puzzle completes with A=4/B=4; reloading restores the layout and restarts paused |
| Visual review | Desktop, active emulated XR, isolated native panel, native hero scene, and five-view procedural garden renders inspected |

The ten automated tests are in `tests/puzzle.test.ts`. Runtime checks used actual SDK hand gestures and queried the application-owned GardenState component. Merely receiving a successful gesture-command response was not treated as a passed interaction.

## Corrections found through runtime checks

Native Horizon Button defaults produced an oversized panel. Explicit centimeter dimensions restored the intended scale. The tilted small panel missed touch activation in the emulator; the final panel faces forward. The reset row now reserves explicit widths so its confirmation stays within the panel. Some emulated touch presses still miss and need another deliberate press; touch reliability is an open UX issue, even though both hands have completed the puzzle. Exiting XR clears an open reset prompt. A no-op piece placement no longer increments the revision because object-property order changed.

## Performance context

The initial production build was approximately 3.67 MB uncompressed across 18 files, or 1.25 MB when each file was locally gzip-compressed. This is a build-size estimate, not a measured network transfer or cold-load benchmark. The main bundle was about 665 KB gzip. The native hero scene preview recorded 37 draw calls and 11,634 triangles. Preview frame samples include compilation/startup stalls and are not a sustained gameplay FPS result.

The 10 MB compressed-transfer target appears feasible at this size, but public-host transfer, sustained draw calls/triangles, a 15-minute session, and memory/CPU profiling remain release work. The competition's 60 FPS Quest requirement remains unverified.

## Local evidence and reproduction

Run the checks and SDK commands in [development workflow](development-workflow.md). SDK interaction names are `Bend`, `Delay pod`, `Empty socket`, and `Btn_*` IDs in `public/ui/garden.uikitml`. Find the runtime entity with GardenState rather than hard-coding its numeric index.

Generated screenshots and preview metadata are local ignored artifacts under `artifacts/`: `desktop-final.png`, `xr-final.png`, `panel-preview.png`, `scene-hero.png`, `garden-model.png`, `scene-report.json`, and `ui-runtime-review.jpg`. They are not a submitted demo video. No screen recording or public deployment was created.

## Remaining release work

Five further puzzles, campaign progression/replay, polished growth rewards, onboarding comprehension checks, a full accessibility/recovery pass, a 15-minute performance run, production subpath/public HTTPS verification, demo capture, and the submission checklist remain incomplete. The spatial menu still exposes many controls at once and should be simplified during the next UX pass. Retest touch reliability and repeated entry/exit before treating it as release-ready. Licensing of original source and Start acceptance remain owner decisions.
