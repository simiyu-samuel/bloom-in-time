# Architecture overview

Status: proposed architecture; no modules are implemented.

## System context

~~~mermaid
flowchart LR
    Player["Player: desktop or emulated / physical hands"] --> App["Browser application"]
    Host["Static HTTPS host"] --> App
    App --> Save["Browser-local progress"]
    App --> Render["IWSDK / Three.js / WebXR"]
    App --> Audio["Web Audio"]
~~~

There is no application server, remote account, or runtime AI service. Static hosting serves code and assets. Browser-local storage persists a small save on the same origin.

## Internal boundaries

~~~mermaid
flowchart TD
    Content["Authored level data"] --> Validate["Content validation"]
    Validate --> Domain["Pure puzzle domain"]
    Desktop["Desktop input adapter"] --> Commands["Validated game commands"]
    XR["IWSDK hand input adapter"] --> Commands
    Commands --> State["Session state and undo history"]
    State --> Domain
    Domain --> Events["Logical timeline and diagnostics"]
    State --> Persist["Save adapter"]
    Events --> Transport["Presentation transport"]
    Transport --> Visual["Scene and animation adapter"]
    Transport --> Music["Audio adapter"]
    State --> UI["Spatial and browser UI"]
~~~

Only the domain decides whether a layout solves a level. Scene entities, hand poses, animation completion, frame rate, and audio callbacks cannot independently award completion.

## Proposed module layout

~~~text
src/
  index.ts                 generated IWSDK entry adapted at bootstrap
  assets.ts                asset catalog
  components.ts            exported scene components
  domain/
    commands.ts            validated intent and reducer
    level.ts               authored level model and validation
    evaluate.ts            timing and topology evaluation
    progress.ts            save model and migration
  application/
    session.ts             application state machine
    history.ts             undo transactions
    transport.ts           presentation clock and lifecycle
  adapters/
    input/                 desktop and IWSDK intent mapping
    scene/                 board, pieces, pulses, flowers
    audio/                 bounded synthesis and scheduling
    storage/               browser persistence boundary
    ui/                    browser entry and spatial controls
  content/
    levels/                six authored puzzle definitions
public/
  scenes/                  generated scene assets
  ui/                      spatial UI assets if used by installed SDK
tests/
  domain/
  integration/
  e2e/
~~~

The generator's actual file structure and exports must be inspected first; adapt this layout to its requirements rather than replacing SDK conventions blindly.

## Ownership and update flow

Input adapters create game commands. The application validates them, commits a new layout revision, records undo, cancels stale playback, evaluates the layout, and schedules a fresh cycle. Derived events drive visuals and sound. Save only committed state.

Object3D positions are a view of domain placements plus a board transform. They are not the saved puzzle definition. World-space movement of the board never changes the solution.

## Runtime dependencies

Plan TypeScript, IWSDK, its supported Three.js dependency, Vite, and minimal test tooling. Determine compatible versions from the current generator at development start and commit the exact lockfile. Avoid a second Three.js runtime.

[Data contracts](data-contracts.md), [puzzle rules](puzzle-engine.md), and [runtime lifecycle](runtime-and-input.md) define the interfaces between these boundaries.
