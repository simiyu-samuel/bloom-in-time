import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstLevel } from '../src/content/first-level.ts';
import { evaluate } from '../src/domain/evaluate.ts';
import { GardenSession } from '../src/application/session.ts';
import { readSave, writeSave, defaults } from '../src/application/storage.ts';

test('a delay synchronizes the two flowers without changing link travel', () => {
  assert.deepEqual(evaluate(firstLevel, firstLevel.initialPlacements).arrivals, { 'flower-a': [3], 'flower-b': [4] });
  const result = evaluate(firstLevel, firstLevel.solutionPlacements, 12);
  assert.equal(result.solved, true);
  assert.equal(result.layoutRevision, 12);
  assert.deepEqual(result.arrivals, { 'flower-a': [4], 'flower-b': [4] });
  assert.equal(result.events.filter(e => e.type === 'hold').length, 1);
});

test('empty sockets and backward pieces fail with useful diagnostics', () => {
  const missing = structuredClone(firstLevel.solutionPlacements);
  delete missing.hold;
  assert.ok(evaluate(firstLevel, missing).diagnostics.some(d => d.code === 'OPEN_PORT'));
  const reverse = structuredClone(firstLevel.solutionPlacements);
  reverse.hold.orientationId = 'reverse';
  assert.ok(evaluate(firstLevel, reverse).diagnostics.some(d => d.code === 'WRONG_INPUT'));
});

test('pulses expire at the exclusive cycle boundary', () => {
  const level = structuredClone(firstLevel);
  level.links.find(l => l.id === 'fork-b')!.travelBeats = 7;
  assert.ok(evaluate(level, level.solutionPlacements).diagnostics.some(d => d.code === 'EXPIRED_PULSE'));
});

test('active loops and duplicate arrivals fail finitely', () => {
  const loop = structuredClone(firstLevel);
  loop.nodes[1] = { id: 'fork', kind: 'socket', ports: ['in', 'a', 'b', 'loop'],
    orientations: { splitter: [{ id: 'forward', input: 'in', outputs: ['a','b'] }] } };
  loop.links.find(l => l.id === 'hold-a')!.to = { nodeId: 'fork', portId: 'loop' };
  assert.ok(evaluate(loop, loop.solutionPlacements).diagnostics.some(d => d.code === 'CYCLE'));
  const duplicate = structuredClone(firstLevel);
  duplicate.nodes.push({ id: 'unused-flower', kind: 'flower', inputs: ['in'] });
  const flower = duplicate.nodes.find(n => n.id === 'flower-a')!;
  if (flower.kind === 'flower') flower.inputs.push('other');
  duplicate.links.find(l => l.id === 'fork-b')!.to = { nodeId: 'flower-a', portId: 'other' };
  const result = evaluate(duplicate, duplicate.solutionPlacements);
  assert.equal(result.solved, false);
  assert.ok(result.diagnostics.some(d => d.code === 'DUPLICATE_ARRIVAL'));
});

test('malformed or oversized content and reused pieces are rejected', () => {
  const level = structuredClone(firstLevel);
  level.links[0].travelBeats = -1;
  assert.equal(evaluate(level, level.solutionPlacements).solved, false);
  const reused = structuredClone(firstLevel.solutionPlacements);
  reused.hold.pieceId = reused.fork.pieceId;
  assert.ok(evaluate(firstLevel, reused).diagnostics.some(d => d.code === 'INVALID_PLACEMENT'));
  const oversized = structuredClone(firstLevel);
  oversized.links = Array.from({ length: 49 }, () => structuredClone(firstLevel.links[0]));
  assert.ok(evaluate(oversized, {}).diagnostics.some(d => d.code === 'LIMIT_EXCEEDED'));
});

test('a piece cannot silently replace an occupied socket', () => {
  const session = new GardenSession(firstLevel);
  assert.equal(session.dispatch({ type:'place', socketId:'hold', pieceId:'delay-1', orientationId:'forward' }), false);
  assert.equal(session.placements.hold.pieceId, 'bend-1');
  assert.equal(session.revision, 0);
  session.dispatch({ type:'remove', socketId:'hold' });
  session.dispatch({ type:'place', socketId:'hold', pieceId:'delay-1', orientationId:'forward' });
  assert.equal(session.evaluation.solved, true);
  session.dispatch({ type:'undo' });
  assert.equal(session.placements.hold, undefined);
  session.dispatch({ type:'undo' });
  assert.equal(session.placements.hold.pieceId, 'bend-1');
  assert.equal(session.revision, 4);
});

test('completion is frame independent and never happens while paused or grabbing', () => {
  for (const fps of [30, 60, 90, 120]) {
    const session = new GardenSession(firstLevel, firstLevel.solutionPlacements);
    session.advance(1);
    assert.equal(session.complete, false);
    session.play();
    for (let frame = 0; frame < fps * 4 + 1; frame++) session.advance(1 / fps);
    assert.equal(session.complete, true, String(fps));
  }
  const session = new GardenSession(firstLevel, firstLevel.solutionPlacements);
  session.play();
  session.beginManipulation();
  for (let frame = 0; frame < 400; frame++) session.advance(0.02);
  assert.equal(session.complete, false);
});

test('edits invalidate an almost-complete cycle and long stalls pause', () => {
  const session = new GardenSession(firstLevel, firstLevel.solutionPlacements);
  session.play();
  for (let i = 0; i < 39; i++) session.advance(0.1);
  session.dispatch({ type:'remove', socketId:'hold' });
  session.advance(0.2);
  assert.equal(session.complete, false);
  session.advance(3);
  assert.equal(session.paused, true);
});


test('placing a piece back in the same socket does not invalidate progress', () => {
  const session = new GardenSession(firstLevel, firstLevel.solutionPlacements);
  session.play();
  for (let i = 0; i < 41; i++) session.advance(0.1);
  assert.equal(session.complete, true);
  assert.equal(session.dispatch({type:'place', socketId:'fork', pieceId:'fork-1', orientationId:'forward'}), false);
  assert.equal(session.revision, 0);
  assert.equal(session.complete, true);
  assert.equal(session.canUndo, false);
  session.dispatch({type:'reset'});
  assert.equal(session.complete, false);
  assert.equal(session.revision, 1);
});

test('save restore accepts partial play but rejects corrupt or obsolete layouts', () => {
  let raw: string | null = null;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable:true, value: {
    getItem: () => raw, setItem: (_key:string, value:string) => { raw = value; },
  }});
  try {
    assert.equal(writeSave(firstLevel, {}, {...defaults, muted:true}), true);
    assert.deepEqual(readSave(firstLevel), {placements:{}, preferences:{...defaults, muted:true}});
    const valid = JSON.parse(raw!);
    for (const placements of [{hold:{pieceId:'missing',orientationId:'forward'}}, {hold:null}, [], 'broken']) {
      raw = JSON.stringify({...valid, placements});
      assert.equal(readSave(firstLevel).placements, undefined);
    }
    raw = JSON.stringify({...valid, contentVersion:'outdated'});
    assert.equal(readSave(firstLevel).placements, undefined);
    assert.equal(readSave(firstLevel).preferences.muted, true);
    for (raw of ['{', 'null', 'x'.repeat(32_001)]) assert.deepEqual(readSave(firstLevel), {preferences:defaults});
    Object.defineProperty(globalThis, 'localStorage', { configurable:true, get: () => { throw Error('blocked'); }});
    assert.deepEqual(readSave(firstLevel), {preferences:defaults});
    assert.equal(writeSave(firstLevel, {}, defaults), false);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
