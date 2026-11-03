# Implementation backlog

The first playable slice is implemented. Complete remaining work in dependency order; the statuses below apply to the current prototype, not the entire planned campaign. See the [verification report](../engineering/prototype-verification.md).

| ID | Priority / dependency | Work | Acceptance |
| --- | --- | --- | --- |
| B01 | P0 / documentation checkpoint | Generate and inspect current IWSDK starter | Supported Node, pinned packages/lockfile, development and production build verified |
| B02 | P0 / B01 | Pure level model and evaluator | Planning fixture changes from unequal 3/4 arrivals to equal 4/4; invalid graph cases terminate correctly |
| B03 | P0 / B02 | Minimal board and shared command reducer | Place/turn/remove/undo are validated, atomic, and increment revisions correctly |
| B04 | P0 / B03 | Desktop and emulated hand adapters | Both produce the same layout; invalid drop and lost input recover; visible turn controls work |
| B05 | P0 / B02–B04 | Transport, visible pulses, first bloom | A stable eligible cycle completes once; stale edits and pauses cannot complete |
| B06 | P0 / B05 | Entry, comfort, pause, reset, next/replay | Complete two-flower loop through emulated hands without keyboard |
| B07 | P0 / B06 | Six authored puzzles | Every topology validates, witness solves, hints are meaningful, progression is playable |
| B08 | P0 / B06 | Local progress/settings | Reload restores valid committed state; invalid data and failed storage do not break play |
| B09 | P1 / B05 | Tree growth, notes, completed composition | Progress is clear, sound is bounded, muted play works |
| B10 | P0 / B06 | Accessibility and recovery pass | Either hand, contrast, reduced motion, recenter, and silent play checked |
| B11 | P0 / B07–B10 | Full-flow verification and profiling | Critical scenarios recorded; budgets measured in stated environment; no hardware claims |
| B12 | P0 / B11 | Production host and release evidence | Public HTTPS URL loads assets correctly and points to recorded commit |
| B13 | P0 / B12 | Demo and submission | Under-three-minute real/emulated gameplay video; form reflects actual build; final access checked |
| B14 | P0 / B13 | Competition freeze | Deployed commit tagged, mutable automation disabled, availability retained |

## Priority interpretation

P0 means needed for a credible submitted experience. P1 is a polish priority within the planned concept, not an invitation to add unrelated features. The basic bloom/music reward belongs in the mechanic proof; B09 improves its quality.

Do not start generation/editor/multiplayer/AI features from this backlog. They require a separate scope decision after the competition baseline.

## Milestone status after the first prototype

| Items | State | Remaining work |
| --- | --- | --- |
| B01–B03 | Complete for first slice | Extend validation with new content |
| B04 | Shared adapters work; touch reliability remains open | Occasional emulated presses need retry; simplify the panel and repeat the lifecycle matrix |
| B05 | Verified for first slice | Repeat transport and bloom checks with new levels |
| B06 | Partial | Campaign entry, next level, final replay, and complete onboarding |
| B07 | Not started | Five more puzzles, solution witnesses, progression |
| B08 | First-level saves implemented and checked | Campaign completion/progress migration |
| B09 | Basic notes and flower bloom implemented | Full tree growth and final composition |
| B10 | Controls implemented; partial checks | Full accessibility, either-hand, and recovery matrix |
| B11 | Prototype report exists | Sustained profiling and full campaign flow |
| B12–B14 | Not started | Public host, video/submission, and release freeze |
