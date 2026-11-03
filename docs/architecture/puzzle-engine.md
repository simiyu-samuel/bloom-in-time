# Puzzle engine contract

Status: proposed, version 1. This document is the authoritative game-rule specification.

## Time

One logical beat is an integer. The source emits once at beat 0. A cycle contains eight beats numbered 0 through 7; pending pulses expire at the exclusive boundary 8. At the initial tempo of 120 BPM, a beat lasts 0.5 seconds.

Every directed link has a positive integer travel duration. Bend and splitter processing add zero beats; a delay pod adds exactly one beat. A flower's arrival is the sum of link durations and delays from the source. Presentation tempo may change seconds, never these integer results.

A pulse reaching a slot at beat b exits its selected outputs at b plus the piece delay. A link then adds its duration. A flower at beat 8 or later is an expired arrival and cannot solve the level. There is no wraparound to a new cycle.

## Topology

The level defines a finite catalog of sockets, named ports, visible links, source, flowers, permitted orientations, and available pieces. Each link connects an output port reference to an input port reference.

A placement chooses a unique piece instance and a permitted orientation at one socket. The socket's orientation table defines its active input and one or two outputs for that kind. A piece cannot occupy two sockets.

Potential authoring links may form alternate routes. The oriented active layout must be acyclic. No pulse merging is supported. A splitter copies the input pulse to both outputs; both branches must terminate in flowers.

Unfilled sockets, inactive input ports, unconnected active outputs, cycles, unsupported orientations, reused pieces, or duplicate arrivals produce diagnostics. Treat an unreachable spare decorative link as inert; unused inventory is allowed.

## Success

A layout solves if:

1. Its placement and active topology are valid.
2. Every pulse branch terminates in a required flower, with no expired or dead-end branch.
3. Every required flower receives exactly one pulse.
4. All those arrivals occur on the same beat from 1 through 7.

Duplicate pulses at the same flower fail even if their beats match. Missing flowers fail. Evaluation is deterministic for the same content version and placements.

## Evaluation algorithm

1. Validate IDs, port references, durations, inventory, and orientation choices.
2. Resolve the active traversal from the source.
3. Reject cycles on reachable active nodes using a traversal stack or equivalent algorithm.
4. Propagate path identity and arrival beat; copy at splits and add delay at pods.
5. Bound traversal by content limits; stop invalid branches with diagnostics.
6. Collect per-flower arrival lists and compare them.
7. Return ordered events, diagnostics, a solve result, and the evaluated layout revision.

Sort simultaneous events stably by beat, event type, node ID, and path ID. Maintain path identity for duplicate detection.

Initial authoring limits: at most 24 sockets, 48 links, three flowers, two splitters, and 128 propagated branch events. Validate these caps rather than silently truncating. Revisit only if an authored level needs more.

## Layout revisions and visible completion

Every accepted placement, rotation, removal, undo, or reset increments the revision and invalidates the current presentation cycle. Ignore completion events from older revisions.

Evaluate immediately to provide diagnostics, but award completion only after an eligible unchanged cycle visibly delivers all required arrivals. Completion must not fire while paused, manipulating a piece, or rendering a stale timeline. Mark it once, save, then present restoration.

## Worked witness

The [two-flower fixture](fixtures/two-flower-level.json) emits to a splitter after one beat. Flower A's route passes a socket and takes two more link beats. Flower B's direct branch takes three more link beats.

With a bend in the socket, A arrives at 1 + 1 + 1 = 3; B at 1 + 3 = 4, so the puzzle is unsolved. Replacing that bend with a delay pod makes A arrive at 1 + 1 + 1 + 1 = 4. Both now arrive once at beat 4 and the layout solves.

## Required meaningful tests

Equal arrivals solve; unequal arrivals fail; delay adds exactly one; splitter copies without delay; duplicate arrivals fail; a cycle terminates with a diagnostic; beat 8 expires; active dead ends fail; unused pieces do not fail; pause never advances gameplay; stale revisions cannot complete. Run the same fixture under multiple presentation frame sequences.
