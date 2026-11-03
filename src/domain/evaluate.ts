import type { Diagnostic, Evaluation, Level, Placements, PuzzleNode } from './model.ts';

const key = (nodeId: string, portId: string) => JSON.stringify([nodeId, portId]);
const ports = (node: PuzzleNode) => node.kind === 'socket'
  ? node.ports : node.kind === 'source' ? node.outputs : node.inputs;

/** No renderer, clock, SDK, or browser state participates in puzzle evaluation. */
export function evaluate(level: Level, placements: Placements, layoutRevision = 0): Evaluation {
  const diagnostics: Diagnostic[] = [];
  const result: Evaluation = { layoutRevision, solved: false, arrivals: {}, events: [], diagnostics };
  const problem = (code: string, message: string, nodeId?: string) =>
    diagnostics.push({ code, message, nodeId });
  if (level.schemaVersion !== 1 || level.cycleBeats !== 8 || !Number.isFinite(level.bpm) || level.bpm <= 0) {
    problem('INVALID_CONTENT', 'This puzzle has unsupported timing settings.');
    return result;
  }
  const sockets = level.nodes.filter(n => n.kind === 'socket');
  const flowers = level.nodes.filter(n => n.kind === 'flower');
  if (sockets.length > 24 || level.links.length > 48 || flowers.length > 3 ||
      level.pieces.filter(p => p.kind === 'splitter').length > 2) {
    problem('LIMIT_EXCEEDED', 'This puzzle exceeds its safe evaluation limits.');
    return result;
  }
  const nodes = new Map(level.nodes.map(n => [n.id, n]));
  const pieces = new Map(level.pieces.map(p => [p.id, p]));
  if (nodes.size !== level.nodes.length || pieces.size !== level.pieces.length ||
      new Set(level.links.map(l => l.id)).size !== level.links.length ||
      level.nodes.filter(n => n.kind === 'source').length !== 1 || flowers.length < 1) {
    problem('INVALID_CONTENT', 'Puzzle identifiers or endpoints are invalid.');
    return result;
  }
  const outgoing = new Map<string, Level['links'][number]>();
  const incoming = new Set<string>();
  for (const link of level.links) {
    const a = nodes.get(link.from.nodeId), b = nodes.get(link.to.nodeId);
    const from = key(link.from.nodeId, link.from.portId), to = key(link.to.nodeId, link.to.portId);
    if (!a || !b || !ports(a).includes(link.from.portId) || !ports(b).includes(link.to.portId) ||
        a.kind === 'flower' || b.kind === 'source' || outgoing.has(from) || incoming.has(to) ||
        !Number.isInteger(link.travelBeats) || link.travelBeats < 1) {
      problem('INVALID_CONTENT', 'A pathway has invalid ports or timing.', link.id);
      continue;
    }
    outgoing.set(from, link);
    incoming.add(to);
  }
  const used = new Set<string>();
  for (const [id, placement] of Object.entries(placements)) {
    const node = nodes.get(id), piece = pieces.get(placement.pieceId);
    const orientation = node?.kind === 'socket' && piece
      ? node.orientations[piece.kind]?.find(o => o.id === placement.orientationId) : undefined;
    if (!orientation || !node || !piece || used.has(placement.pieceId) ||
        !ports(node).includes(orientation.input) ||
        orientation.outputs.length !== (piece.kind === 'splitter' ? 2 : 1) ||
        new Set(orientation.outputs).size !== orientation.outputs.length ||
        orientation.outputs.includes(orientation.input) ||
        orientation.outputs.some(p => !ports(node).includes(p))) {
      problem('INVALID_PLACEMENT', 'A piece does not fit this socket.', id);
    }
    used.add(placement.pieceId);
  }
  if (diagnostics.length) return result;
  for (const flower of flowers) result.arrivals[flower.id] = [];
  let traversals = 0;
  const follow = (nodeId: string, portId: string, beat: number, pathId: string, stack: Set<string>) => {
    if (++traversals > 128) {
      problem('LIMIT_EXCEEDED', 'The light has too many branches.');
      return;
    }
    const link = outgoing.get(key(nodeId, portId));
    if (!link) {
      problem('OPEN_PORT', 'A light pathway is not connected.', nodeId);
      return;
    }
    result.events.push({ cycleBeat: beat, type: 'depart', nodeId, pathId, linkId: link.id });
    const at = beat + link.travelBeats;
    if (at >= level.cycleBeats) {
      problem('EXPIRED_PULSE', 'This route takes more than one cycle.', link.to.nodeId);
      return;
    }
    const node = nodes.get(link.to.nodeId)!;
    result.events.push({ cycleBeat: at, type: 'arrive', nodeId: node.id, pathId, linkId: link.id });
    if (node.kind === 'flower') {
      result.arrivals[node.id].push(at);
      result.events.push({ cycleBeat: at, type: 'flower', nodeId: node.id, pathId });
      return;
    }
    if (stack.has(node.id)) {
      problem('CYCLE', 'The light is travelling in a loop.', node.id);
      return;
    }
    if (node.kind !== 'socket') return;
    const placement = placements[node.id];
    if (!placement) {
      problem('OPEN_PORT', 'Add a piece to the empty socket.', node.id);
      return;
    }
    const piece = pieces.get(placement.pieceId)!;
    const orientation = node.orientations[piece.kind]!.find(o => o.id === placement.orientationId)!;
    if (orientation.input !== link.to.portId) {
      problem('WRONG_INPUT', 'Turn this piece to meet the incoming light.', node.id);
      return;
    }
    const exit = at + (piece.kind === 'delay' ? 1 : 0);
    if (piece.kind === 'delay') {
      result.events.push({ cycleBeat: at, type: 'hold', nodeId: node.id, pathId });
    }
    if (exit >= level.cycleBeats) {
      problem('EXPIRED_PULSE', 'The light waits beyond this cycle.', node.id);
      return;
    }
    const next = new Set(stack).add(node.id);
    orientation.outputs.forEach((port, index) => follow(node.id, port, exit, pathId + '.' + index, next));
  };
  const source = level.nodes.find(n => n.kind === 'source')!;
  if (source.kind === 'source') {
    source.outputs.forEach((port, index) => follow(source.id, port, 0, String(index), new Set([source.id])));
  }
  const beats: number[] = [];
  for (const flower of flowers) {
    const arrivals = result.arrivals[flower.id];
    if (!arrivals.length) problem('MISSING_FLOWER', 'A flower is still waiting for light.', flower.id);
    else if (arrivals.length > 1) problem('DUPLICATE_ARRIVAL', 'This flower receives more than one pulse.', flower.id);
    else beats.push(arrivals[0]);
  }
  if (!diagnostics.length && beats.some(beat => beat !== beats[0])) {
    problem('OUT_OF_SYNC', 'Give the shorter route a moment so both flowers bloom together.');
  }
  result.events.sort((a, b) => a.cycleBeat - b.cycleBeat ||
    a.type.localeCompare(b.type) || a.nodeId.localeCompare(b.nodeId) || a.pathId.localeCompare(b.pathId));
  result.solved = !diagnostics.length && beats.length === flowers.length && beats[0] > 0;
  return result;
}
