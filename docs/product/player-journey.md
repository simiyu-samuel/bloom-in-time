# Player journey

## First five minutes

| Time target | Player action | Experience response |
| --- | --- | --- |
| 0–15 seconds | Open the link and choose Play / Enter VR | Explain browser capability and offer desktop access if XR is unavailable. |
| 15–30 seconds | Select a comfortable board position | Present a single flower and one highlighted piece; audio starts after a user action. |
| 30–60 seconds | Place and turn the piece | Show its pathway, carry a pulse to the flower, and reward the first bloom. |
| 1–3 minutes | Solve Two Voices | Teach splitting through a small diagram and immediate pulse feedback. |
| 3–5 minutes | Try a delay pod | Show one pulse waiting while the longer route catches up. |

These are product targets. Capture real timings during usability sessions.

## Application states

~~~mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Entry
    Entry --> Playing: start or continue
    Playing --> Paused: pause, hidden tab, or lost session
    Paused --> Playing: explicit resume
    Playing --> Blooming: verified successful cycle
    Blooming --> Playing: next or replay
    Blooming --> Finale: last puzzle completed
    Finale --> Playing: replay
    Playing --> Entry: exit experience
~~~

XR entry can be refused or unavailable without losing the desktop entry screen. A system permission prompt belongs to the browser; instructions should explain the next step without impersonating it.

## Returning player

Offer Continue and Puzzle Select, show the restored branches, and recover the last committed layout. Do not simulate missed cycles while the page was closed.

## Recovery

A grab interrupted by lost tracking, page hiding, or XR exit restores the piece to its last committed position. Pause and save only authoritative placements. On resume, restart pulse playback at the next clean cycle.

If saving is blocked, keep the current session usable and display a concise notice. Corrupt data or a content-version mismatch loads a safe fresh layout; allow clearing progress without breaking entry.

## Help

Show a one-line objective, a visible timing legend, and contextual prompts. Progressive hints are optional. Every instructional audio cue has a visual equivalent.
