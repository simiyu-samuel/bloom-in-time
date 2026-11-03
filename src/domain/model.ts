export type PieceKind = 'bend' | 'splitter' | 'delay';
export type Orientation = { id: string; input: string; outputs: string[] };
export type SourceNode = { id: string; kind: 'source'; outputs: string[] };
export type FlowerNode = { id: string; kind: 'flower'; inputs: string[] };
export type SocketNode = {
  id: string; kind: 'socket'; ports: string[];
  orientations: Partial<Record<PieceKind, Orientation[]>>;
};
export type PuzzleNode = SourceNode | FlowerNode | SocketNode;
export type Port = { nodeId: string; portId: string };
export type Link = { id: string; from: Port; to: Port; travelBeats: number };
export type Placement = { pieceId: string; orientationId: string };
export type Placements = Record<string, Placement>;
export type Level = {
  schemaVersion: number; contentVersion: string; id: string; title: string;
  cycleBeats: number; bpm: number; nodes: PuzzleNode[]; links: Link[];
  pieces: { id: string; kind: PieceKind }[];
  initialPlacements: Placements; solutionPlacements: Placements;
};
export type Diagnostic = { code: string; nodeId?: string; message: string };
export type PulseEvent = {
  cycleBeat: number; type: 'depart' | 'arrive' | 'hold' | 'flower';
  nodeId: string; pathId: string; linkId?: string;
};
export type Evaluation = {
  layoutRevision: number; solved: boolean; arrivals: Record<string, number[]>;
  events: PulseEvent[]; diagnostics: Diagnostic[];
};
export type Command =
  | { type: 'place'; pieceId: string; socketId: string; orientationId: string }
  | { type: 'rotate'; socketId: string; orientationId: string }
  | { type: 'remove'; socketId: string }
  | { type: 'undo' } | { type: 'reset' } | { type: 'requestHint' };
