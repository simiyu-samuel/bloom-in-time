# Interaction and accessibility

All distances and sizes are provisional design values until hardware testing exists. Physical comfort and real tracking behavior cannot be established by emulation.

## Interaction contract

| Intent | Hand path | Desktop equivalent | Failure recovery |
| --- | --- | --- | --- |
| Start, continue, pause, settings | Select a large spatial control with a hand ray or supported touch | Pointer selection; keyboard focus for browser UI | Selection occurs on deliberate activation, not hover. |
| Move a piece | One-hand grab; valid release attaches to socket | Select piece, then select socket | Invalid release restores the previous placement. |
| Turn a piece | Select piece, then activate left/right turn buttons | The same buttons; optional Q/E shortcuts | Show the resulting orientation before another turn. |
| Remove | Select piece, then Return to tray | Same visible action | One undo restores it. |
| Inspect another side | Select board turn-left/turn-right controls | Same controls | Move the board, never the camera. |
| Undo / hint / reset | Visible controls; confirm destructive reset | Same controls | No essential action depends on a shortcut. |

Use IWSDK's documented interaction components as the adapter; verify their exact lifecycle with the generated version. Hand rays permit interaction while the arm stays close to the body. Direct grabbing is optional convenience when comfortably reachable.

Do not require custom hand-sign recognition, accurate finger drawing, two hands at once, palm-facing menus, or tiny targets.

## Placement behavior

The domain changes on a valid release or explicit selected-piece placement, not during movement. Highlight the nearest legal socket with hysteresis. Start with a 6–8 cm candidate radius in board space, then tune in emulation; this is not a hardware-validated value.

A selected socket has a bright ring, distinct shape, and short label. Occupied sockets reject a placement unless the player explicitly removes the old piece; no silent swaps in the first version. A failed drop returns the piece rather than losing it behind the board.

Maintain only one active manipulation transaction. On cancellation or lost input, restore its original pose and clear the preview.

## Comfort and presentation

Keep the board in front of the player and provide recenter, height, and distance controls. Initial content width is approximately 0.55 m, depth 0.35 m, height 0.28 m, at around 0.65 m viewing distance. These are authored content coordinates, not required physical reach.

Concentrate essential controls within a provisional central horizontal angle of about 44 degrees. Avoid mandatory head turns, leaning, walking, and raised-arm holds. Use discrete board turns and an option for instant transitions. Expose adjustments before the first puzzle.

## Accessibility baseline

- Route identity uses glyphs and line patterns in addition to color.
- Timing uses visible pulse positions, beat markers, and clear arrival feedback.
- Music, effects, and master volume have separate controls; mute preserves playability.
- Reduced motion removes floating camera-like effects and shortens decorative animation.
- High contrast increases socket and control separation from the background.
- Either hand can complete all actions; avoid dominant-hand assumptions.
- Buttons have persistent names and generous target regions.
- No audio-only instruction, flashing reward, forced timeout, or penalty for hints.

Target spatial control dimensions of at least 3 cm at the default board scale; exact legibility remains a test item. Desktop entry and settings should support semantic HTML, visible focus, and keyboard operation. Spatial 3D controls still require separate accessibility review; do not claim screen-reader accessibility for the XR scene.

## Verification

Complete the entire flow through emulated hands, then repeat with sound off, reduced motion, contrast enabled, and each hand alone. Record results as emulation evidence only.
