# Runtime and input integration

Status: proposed integration. Confirm installed IWSDK behavior before implementing an adapter.

## IWSDK responsibilities

Use the generated starter for world initialization, supported WebXR options, input setup, scenes, asset registration, and development emulation. Planned configuration is fully virtual VR with hand tracking and grabbing enabled; locomotion, room features, and physics are unnecessary initially.

IWSDK documents RayInteractable, PokeInteractable, OneHandGrabbable, and related systems. Verify component names, events, and release/cancel behavior against the generated version. Do not infer its lifecycle solely from these design documents.

Map interaction entities to stable domain piece/socket IDs. SDK component data handles view interaction; domain state owns the puzzle.

## Input adapters

Both desktop and hand adapters emit the commands in [data contracts](data-contracts.md). Desktop selection followed by socket selection is the simplest parity path. Hand input additionally supports a moving visual preview while grabbing.

A selected piece, pending grab, hovered socket, and committed placement are different states. A preview cannot consume inventory or mark a level solved. Hand selection of visible turn controls is the required alternative to physically rotating a grabbed object.

~~~mermaid
sequenceDiagram
    participant User
    participant Input as Input adapter
    participant App as Session
    participant Core as Puzzle domain
    participant View as Scene/audio
    User->>Input: release at a valid socket
    Input->>App: place command
    App->>Core: validate and reduce
    Core-->>App: new layout revision
    App->>Core: evaluate new layout
    Core-->>App: timeline and diagnostics
    App->>View: cancel old revision, schedule clean cycle
    App->>App: persist committed layout
~~~

## Presentation transport

Represent logical elapsed time separately from render frames. A single transport maps cycle and beat events to monotonic seconds. It advances only while playing, visible, and in an active supported session.

For audio, use AudioContext time and a short bounded look-ahead scheduler. Visuals sample the same transport. Audio is an output sink; an unavailable or suspended audio context must not stop simulation or determine success.

If audio is enabled later, align it to a new cycle boundary rather than replaying missed notes. Cancel old scheduled voices on revision change or pause. Store the revision on every scheduled event.

## Lifecycle rules

| Event | Action |
| --- | --- |
| Page hides or browser loses the active XR session | Cancel grab, pause transport, cancel future audio, save committed state. |
| Tracking/input source disappears | Cancel the associated manipulation; pause if interaction cannot continue. |
| Explicit pause | Freeze playback; settings remain operable. |
| Resume | Require a user action, then begin a fresh eligible cycle. |
| XR entry rejected | Keep browser entry and desktop play available; preserve progress. |
| XR exits | Save and return to a usable browser screen. |
| Slow frame / long stall | Skip decorative interpolation; pause/restart on large discontinuity rather than granting stale completion. |

Session end and visibility handling must not emit completion. Application behavior after system prompts is an integration test item.

## Scheduling order

Process lifecycle/input; reduce accepted commands; resolve content/evaluation changes; update transport; issue current-revision events; render. Publish completion only if the evaluated revision is unchanged and an eligible full cycle finishes while no manipulation is active.

The renderer uses board-local transforms. Repositioning or rotating the board transforms the entire scene subtree, including highlights and hit targets, without mutating the authored graph.
