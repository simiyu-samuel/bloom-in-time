# Interface layouts

The implemented two-flower slice uses the layout below. Later wireframes describe the planned campaign. Panel labels must remain consistent across input modes.

## Implemented presentation

The desktop canvas fills the viewport with the living island and surrounding grove. A small title/objective sits at upper left, arrivals at upper right, and a compact action dock at the bottom. Selected-piece actions reserve a stable row. Dragging orbits the nonimmersive camera; wheel input zooms. Settings and confirmed reset use separate overlays.

In XR, the default 62 cm spatial dock contains Play, Undo, Hint, Tools, and Exit VR. Tools reveals piece selection/place/return/turn, board rotation, and Settings. Settings reveals sound, motion, contrast, recenter, distance, height, and confirmed reset. Close returns to the compact dock. Buttons activate once on pointer contact. Direct pinching and discrete commands both use GardenSession. The tracked XR camera never receives desktop orbit updates.

## Planned campaign wireframes

## Desktop entry

~~~text
+-----------------------------------------------------------+
| BLOOM IN TIME                                             |
| Guide the light. Find the rhythm. Wake the garden.          |
|                                                           |
|                  [miniature tree preview]                 |
|                                                           |
|       [ Enter VR ]       [ Play on desktop ]               |
|       [ Continue ]       [ Settings ]                     |
|                                                           |
| Status: ready / loading / XR unavailable                   |
| Help: how to enter VR, interact, or retry                  |
+-----------------------------------------------------------+
~~~

Disable unavailable actions with a clear reason. Desktop access remains usable if immersive entry fails. Continue appears only when a valid save exists.

## Seated puzzle space

~~~text
                 [level name] [objective]
                    [beat indicator]

                flowers / miniature tree
             fixed stems and empty sockets
          [turn board left] [turn board right]

                  [selected piece label]
                   [turn left] [turn right]
                       [return to tray]

          [bend]       [splitter]       [delay pod]

              [undo] [hint] [pause] [recenter]
~~~

Show piece orientation controls only for the selected piece, but keep their location stable. Decorative foliage must not conceal sockets or pulse travel.

## Pause/settings panel

~~~text
[Resume]                         [Puzzle select]
Master     [quieter] [louder]     [Mute]
Music      [quieter] [louder]
Effects    [quieter] [louder]
[Reduced motion]  [High contrast]
Board height [lower] [higher]
Board distance [nearer] [farther]
[Reset puzzle]                   [Exit experience]
~~~

Reset puzzle opens a small Confirm / Cancel panel. Exit saves the last committed layout, cancels any grab, and returns to entry or ends the XR session. The page keeps a clear re-entry option.

## Visual hierarchy

1. Current path and the next observable pulse.
2. Active socket and selected piece.
3. Objective and arrival timing.
4. Undo, hint, pause, and comfort controls.
5. Decorative background.

A completed level shows a short restoration, then Next / Replay. The final level shows the restored tree with Listen / Puzzle select / Exit. No inaccessible celebration screen may block navigation.
