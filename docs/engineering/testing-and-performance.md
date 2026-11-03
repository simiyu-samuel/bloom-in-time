# Testing and performance plan

No application tests or performance measurements exist at the documentation checkpoint.

## Evidence categories

| Category | What it can support | What it cannot establish |
| --- | --- | --- |
| Domain tests | Rules, content witnesses, bounded evaluation, persistence validation | Hand usability, headset frame rate |
| Desktop browser checks | Application flow, controls, storage, loading, audio state | Native WebXR behavior |
| XR emulation | Simulated hand flow, input lifecycle, spatial scene behavior | Real tracking, physical comfort, Quest GPU performance |
| Physical Quest | Device behavior and measured performance under recorded conditions | Not available to this solo developer |

Record date, commit, browser/runtime, input mode, scenario, result, and evidence location. Never fill the final category with simulated results.

## Domain verification

Verify the contract cases listed in [puzzle engine](../architecture/puzzle-engine.md). Add content validation for all six level definitions and solve witnesses. Test that undo/move is atomic, invalid commands leave state unchanged, and content upgrades revalidate saves.

Run equivalent logical inputs with 30, 60, 90, and 120 FPS presentation sequences and irregular frame gaps. The logical result must be identical. Long stalls should pause/restart playback according to the lifecycle contract.

## Integration checks

- A level cannot complete after its layout revision changes.
- Pause or session loss cancels pending audio and grabs.
- Resume starts a clean cycle; no notes or wins are replayed from the background.
- Pointer and emulated hand commands produce equivalent placements.
- Corrupt/oversized saves and failed writes produce usable recovery.
- Audio denial or suspension does not block the puzzle.

## Full-flow scenarios

Fresh browser entry; XR unavailable; XR entry denied; simulated hands only from start to exit; each hand alone; all six puzzles; hints/undo/reset; save and reload; sound muted; reduced motion and contrast; browser hidden mid-grab; XR session exit/re-entry; final screen replay.

Measure actual cold load and first-bloom timing separately from scripted ideal timings. Inspect spatial menus for overlap and occlusion from multiple emulated viewpoints.

## Performance targets

The competition's technical judging specifies at least 60 FPS on Quest hardware. This remains unverified without a device. Desktop/emulator numbers are diagnostic evidence only.

Initial project budgets, subject to profiling: under 10 MB compressed initial transfer, under 100 visible draw calls, under 100,000 visible triangles, textures no larger than 1024 square unless justified, at most 32 visual pulses and 12 simultaneous audio voices. Keep the logical event cap in the engine separate from pooled visual/audio limits.

Prefer shared geometry/materials, pooled pulses, restrained effects, and no real-time shadows in the first slice. Check CPU, allocation, long tasks, and memory growth during a 15-minute desktop/emulator session. A budget is a target; record actual results before claiming compliance.

## Release result

Create an evidence report during implementation. List tested flows, unresolved failures, and the hardware limitation explicitly. Submission readiness requires all critical application flows checked through emulated hands and a valid deployable build, even though physical device validation remains unavailable.
