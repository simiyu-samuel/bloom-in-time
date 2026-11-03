# Game design

Status: proposed rules. Timing details are authoritative in [puzzle engine](../architecture/puzzle-engine.md).

## Core loop

Inspect the dormant branch, choose a piece, place it in a socket, turn it to connect pathways, and observe repeated light pulses. Adjust the layout until every required flower receives exactly one pulse on the same beat. A successful cycle restores the branch and adds its musical phrase.

Pulses repeat automatically; experimenting has no penalty. There is no score based on speed.

## Vocabulary and pieces

A socket is an authored attachment point. A link is a visible stem connecting named ports. A placement selects a piece and one of a socket's allowed orientations.

| Piece | Input / outputs | Effect |
| --- | --- | --- |
| Bend | One / one | Redirects a pulse; no processing delay. |
| Splitter | One / two | Copies a pulse into two routes at the same beat. |
| Delay pod | One / one | Holds a pulse for one additional beat. |

Fixed stems can include straight segments, so a separate straight piece is unnecessary initially. Every link has an authored integer travel duration. A small repeated mark on the stem indicates that duration.

The source emits on beat 0 of an eight-beat cycle. The starting tempo is 120 beats per minute: one beat is 0.5 seconds, one cycle is four seconds. Tempo is a presentation setting; integer arrival beats determine the solution.

All required flowers must receive once on a common beat from 1 through 7. Color identifies routes decoratively; shape marks and pulse trails carry the same information.

## Controls and consequences

Use one hand to grab a piece, release near a valid socket to attach, or select a placed piece and use visible turn buttons. Two simultaneous hands are unnecessary. Removing a piece returns it to its tray slot.

Wrong orientation leaves a visible interrupted route. A missing route, duplicate arrival, loop, or expired pulse cannot complete a puzzle. Explain the issue with a local visual cue instead of a punishment.

Undo reverses one committed placement, turn, or removal. Reset restores the authored starting layout after confirmation. Hints reveal the next useful action from a known solution and never claim to solve arbitrary layouts.

## Proposed progression

Travel totals below are logical witness targets, including links and delay pods, not completed level files. Each level still needs an authored topology and machine-checked solution during implementation.

| ID / title | Lesson | Solution timing witness | Intended play |
| --- | --- | --- | --- |
| L01 First Light | Grab, snap, turn; one flower | 2 link beats = 2 | 30–60 seconds |
| L02 Two Voices | Split into two valid routes | 3 and 3 link beats = 3, 3 | 1–2 minutes |
| L03 A Moment Longer | Hold the shorter route | 3 + 1 delay versus 4 = 4, 4 | 2–3 minutes |
| L04 Above and Below | Inspect a crossing at different heights | 4 + 1 delay versus 5 = 5, 5 | 2–4 minutes |
| L05 Three-Part Harmony | Coordinate two splits and three flowers | 4 + 1 delay, 5, 5 = 5, 5, 5 | 3–5 minutes |
| L06 Full Bloom | Combine depth, routing, and delay | 6 + 1 delay, 5 + 2 delays, 7 = 7, 7, 7 | 3–5 minutes |

Each puzzle is a complete moment under ten minutes. The entire campaign is not intended to fit inside ten minutes. Level timing estimates require playtesting.

## Completion and replay

A bloom is latched only after a full eligible cycle with an unchanged layout. The restoration animation can be skipped. Next puzzle and replay controls remain within the seated interface.

The tree retains completed branches across sessions. Revisiting a puzzle restores its saved layout, with an explicit reset option. Final completion reveals the combined composition; a short free-view mode allows listening and inspecting the tree.
