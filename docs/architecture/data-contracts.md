# Data contracts

Proposed domain contracts, version 1. They describe future implementation, not exported SDK APIs.

## Level definition

| Field | Meaning and validation |
| --- | --- |
| schemaVersion | Integer 1; reject unknown incompatible versions. |
| contentVersion | Authored content revision; used to invalidate incompatible saves. |
| id / title | Stable unique level ID and player-facing title. |
| cycleBeats / bpm | Eight logical beats; initial tempo 120. |
| nodes | Source, sockets, and required flowers with globally unique IDs. |
| links | Directed from/to port references and positive integer travelBeats. |
| pieces | Unique piece instances with kind bend, splitter, or delay. |
| initialPlacements | Valid initial socket-to-piece/orientation mapping. |
| solutionPlacements | One checked witness for hints and content validation. |

A port reference has nodeId and portId. Sources expose outputs, flowers expose inputs, and sockets list named ports. Socket orientations are catalogued per piece kind, each with an ID, one input, and the expected number of outputs.

The orientation table constrains discrete connectivity. The scene adapter associates those orientation IDs with authored transforms. Pixel positions and world-space quaternions never decide domain connectivity.

Validate IDs, source count of one, at least one required flower, limits, existing ports, positive durations, orientation arity, and piece uniqueness. An output port can have at most one outgoing authored link. An input port can have at most one incoming authored link. Validate direction against the active orientation during evaluation.

The [two-flower fixture](fixtures/two-flower-level.json) is a logical planning example, not a complete renderable scene. Its witness arrives at beat 4 for both flowers: A travels three beats plus one delay; B travels four beats.

## Placements and commands

~~~typescript
type Placement = { pieceId: string; orientationId: string };
type Placements = Record<string, Placement>; // keyed by socket ID

type GameCommand =
  | { type: "place"; pieceId: string; socketId: string; orientationId: string }
  | { type: "rotate"; socketId: string; orientationId: string }
  | { type: "remove"; socketId: string }
  | { type: "undo" }
  | { type: "reset" }
  | { type: "requestHint" };
~~~

A place command can move an already placed piece as one atomic transaction. Reject occupied targets. A successful mutation increments layoutRevision; invalid or no-op commands do not change history. Undo restores the previous layout as a new revision, never reuses an old revision number.

## Evaluation

~~~typescript
type PulseEvent = {
  cycleBeat: number;
  type: "depart" | "arrive" | "hold" | "flower";
  nodeId: string;
  pathId: string;
  linkId?: string;
};

type Evaluation = {
  levelId: string;
  layoutRevision: number;
  solved: boolean;
  arrivals: Record<string, number[]>;
  events: PulseEvent[];
  diagnostics: { code: string; nodeId?: string; message: string }[];
};
~~~

Diagnostic codes include INVALID_PLACEMENT, OPEN_PORT, WRONG_INPUT, CYCLE, DUPLICATE_ARRIVAL, MISSING_FLOWER, EXPIRED_PULSE, and LIMIT_EXCEEDED. Player-facing wording is mapped separately from these internal codes.

## Browser save

~~~typescript
type SaveV1 = {
  schemaVersion: 1;
  contentVersion: string;
  currentLevelId: string;
  completedLevelIds: string[];
  layouts: Record<string, Placements>;
  settings: {
    masterVolume: number;
    musicVolume: number;
    effectsVolume: number;
    reducedMotion: boolean;
    highContrast: boolean;
    boardHeight: number;
    boardDistance: number;
  };
};
~~~

Use the namespaced key bloom-in-time:save:v1. Validate and bound parsed data; do not trust storage as executable content. On content mismatch, preserve compatible settings but revalidate layouts and completion against the current content. On incompatible schema, discard safely with a notice.

Never save active hand poses, in-progress grabs, wall-clock playback position, undo history, private identity data, or browser permission state.

## Events and persistence

Persist after committed edits, level completion, level choice, and setting changes; debounce ordinary writes and flush on pause when possible. Write errors cannot crash or block a puzzle. Completion IDs are deduplicated.
