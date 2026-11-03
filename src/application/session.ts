import { evaluate } from '../domain/evaluate.ts';
import type { Command, Level, Placements } from '../domain/model.ts';

const clone = (value: Placements): Placements => structuredClone(value);
const sameLayout = (a: Placements, b: Placements): boolean =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([id, piece]) =>
    b[id]?.pieceId === piece.pieceId && b[id]?.orientationId === piece.orientationId);

export class GardenSession {
  placements: Placements;
  revision = 0;
  elapsed = 0;
  paused = true;
  complete = false;
  manipulating = false;
  selected: string | null = null;
  message = 'Let a little light in.';
  evaluation;
  private history: Placements[] = [];
  private listeners = new Set<() => void>();

  constructor(readonly level: Level, initial?: Placements) {
    this.placements = clone(initial ?? level.initialPlacements);
    this.evaluation = evaluate(level, this.placements, this.revision);
  }

  get beat(): number { return (this.elapsed * this.level.bpm / 60) % this.level.cycleBeats; }
  get cycleSeconds(): number { return this.level.cycleBeats * 60 / this.level.bpm; }
  get canUndo(): boolean { return this.history.length > 0; }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void { for (const listener of this.listeners) listener(); }

  select(pieceId: string | null): void {
    this.selected = pieceId;
    const label=this.level.pieces.find(piece=>piece.id===pieceId)?.kind==='delay'?'Delay pod':'Bend';
    this.message = pieceId ? label+' selected. Choose a socket, or turn the piece.' : 'Follow the light.';
    this.notify();
  }

  dispatch(command: Command): boolean {
    if (command.type === 'requestHint') {
      const target = Object.entries(this.level.solutionPlacements).find(([socketId, piece]) =>
        this.placements[socketId]?.pieceId !== piece.pieceId || this.placements[socketId]?.orientationId !== piece.orientationId);
      this.message = target ? (this.placements[target[0]]
        ? 'Return the bend to the tray, then place the delay pod in its socket.'
        : 'The golden delay pod gives the shorter path one extra beat.')
        : 'The paths are in harmony. Let a full cycle play.';
      this.notify();
      return false;
    }
    let next = clone(this.placements);
    if (command.type === 'undo') {
      const previous = this.history.pop();
      if (!previous) return false;
      next = previous;
    } else if (command.type === 'reset') {
      next = clone(this.level.initialPlacements);
      if (sameLayout(next, this.placements) && !this.complete) return false;
    } else if (command.type === 'remove') {
      if (!next[command.socketId]) return false;
      delete next[command.socketId];
    } else {
      const node = this.level.nodes.find(n => n.id === command.socketId);
      const pieceId = command.type === 'place' ? command.pieceId : next[command.socketId]?.pieceId;
      const piece = this.level.pieces.find(p => p.id === pieceId);
      if (!piece || node?.kind !== 'socket' ||
          !node.orientations[piece.kind]?.some(o => o.id === command.orientationId)) return false;
      if (command.type === 'place') {
        const occupant = next[command.socketId];
        if (occupant && occupant.pieceId !== pieceId) {
          this.message = 'This socket is occupied. Return its piece to the tray first.';
          this.notify();
          return false;
        }
        for (const id of Object.keys(next)) if (next[id].pieceId === pieceId) delete next[id];
      }
      next[command.socketId] = { pieceId: pieceId!, orientationId: command.orientationId };
    }
    if (sameLayout(next, this.placements) && (command.type !== 'reset' || !this.complete)) return false;
    if (command.type !== 'undo') {
      this.history.push(clone(this.placements));
      if (this.history.length > 50) this.history.shift();
    }
    this.placements = next;
    this.revision++;
    this.elapsed = 0;
    this.complete = false;
    this.evaluation = evaluate(this.level, next, this.revision);
    this.message = this.evaluation.solved ? 'A little patience. The next cycle will bring them together.'
      : this.evaluation.diagnostics[0]?.message ?? 'Follow the light.';
    this.notify();
    return true;
  }

  play(): void { this.paused = false; this.elapsed = 0; this.message = 'Make both flowers bloom on the same beat.'; this.notify(); }
  pause(): void { this.paused = true; this.manipulating = false; this.elapsed = 0; this.message = 'The garden can wait. Resume whenever you are ready.'; this.notify(); }
  beginManipulation(): void { this.manipulating = true; this.elapsed = 0; this.notify(); }
  endManipulation(): void { this.manipulating = false; this.elapsed = 0; this.notify(); }

  advance(seconds: number): void {
    if (this.paused || this.manipulating || !Number.isFinite(seconds) || seconds <= 0) return;
    if (seconds > 2) { this.pause(); return; }
    const previousCycle = Math.floor(this.elapsed / this.cycleSeconds);
    this.elapsed += seconds;
    if (!this.complete && this.evaluation.solved && this.evaluation.layoutRevision === this.revision &&
        Math.floor((this.elapsed + 1e-9) / this.cycleSeconds) > previousCycle) {
      this.complete = true;
      this.message = 'Together, at last. You woke a little piece of the garden.';
      this.notify();
    }
  }
}
