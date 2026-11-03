# Art and audio direction

## Mood

A small bioluminescent sculpture in a quiet night environment. Rounded pieces and clear geometric stems communicate function; restrained foliage supplies warmth. Keep the board readable before adding detail.

| Role | Proposed color | Redundant signal |
| --- | --- | --- |
| Background | #101827, deep blue | Flat, low-detail backdrop |
| Dormant stems | #687386, slate | Thin inactive pathway |
| Active light | #F4CF78, warm gold | Moving pulse and solid trail |
| Restored growth | #85C7A3, soft green | Open leaves and petals |
| Selection | #9DDCF2, pale cyan | Ring, label, and brighter outline |
| Problem | #E7A78D, muted coral | Gap icon or arrival-count label |

This palette is a starting direction, not a verified contrast result. Measure readable UI contrast and test muted/color-limited views during implementation.

## Assets

Build the first slice with simple geometry: stems as tubes, sockets as rings, petals as a few repeated meshes, and pieces with clearly different silhouettes. Use shared materials and geometry where practical. Decorative grass, high-resolution models, real-time shadows, and postprocessing are optional after performance evidence.

Bend: curved stem; splitter: forked branch; delay: seed-shaped capsule with a visible beat ring. Model function visibly; do not communicate piece types only through text.

## Animation

Use a short snap acknowledgment, travelling light markers, a one-beat hold inside delay pods, and a flower opening on arrival. Distinguish temporary arrival feedback from latched completion. Reduce decorative motion when requested.

Board transforms move the miniature and its interactions together. No camera bob, forced orbit, or sudden scene-scale change.

## Audio

Each flower has a predetermined compatible note or short motif. Solving a branch adds a quiet persistent layer. The final tree combines layers into a restrained composition. Use an original small note palette; the player solves logic, not music theory.

Schedule audio from the presentation transport, aligned to authoritative integer events. Use gentle attack/release envelopes and bounded polyphony. Start silent until the browser receives the needed user interaction. Muting, denied audio, or a suspended audio context must not block a puzzle.

Prefer original synthesized notes for the prototype. Any recording, font, model, or external texture needs an entry in the [asset register](../assets/asset-register.csv). Do not describe planned assets as already created.

## Presentation acceptance

The first bloom must be legible in a small demo-video frame. Avoid flashing and excessive bloom effects. Provide labelled screenshots of unsolved, timing adjustment, and completed states when those states exist.
