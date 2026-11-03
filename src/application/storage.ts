import { evaluate } from '../domain/evaluate.ts';
import type { Level, Placements } from '../domain/model.ts';

export type Preferences = { muted: boolean; reducedMotion: boolean; highContrast: boolean };
export const defaults: Preferences = { muted: false, reducedMotion: false, highContrast: false };
const KEY = 'bloom-in-time:save:v1';
export function readSave(level: Level): { placements?: Placements; preferences: Preferences } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > 32_000) return { preferences: { ...defaults } };
    const data = JSON.parse(raw);
    if (data.schemaVersion !== 1) return { preferences: { ...defaults } };
    const preferences = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof Preferences)[]) {
      if (typeof data.preferences?.[key] === 'boolean') preferences[key] = data.preferences[key];
    }
    if (data.contentVersion !== level.contentVersion || typeof data.placements !== 'object' ||
        !data.placements || Array.isArray(data.placements)) return { preferences };
    for (const placement of Object.values(data.placements)) {
      if (!placement || typeof placement !== 'object' ||
          typeof (placement as Record<string, unknown>).pieceId !== 'string' ||
          typeof (placement as Record<string, unknown>).orientationId !== 'string') return { preferences };
    }
    const check = evaluate(level, data.placements);
    if (check.diagnostics.some(d => d.code === 'INVALID_PLACEMENT' || d.code === 'INVALID_CONTENT')) return { preferences };
    return { placements: data.placements, preferences };
  } catch { return { preferences: { ...defaults } }; }
}
export function writeSave(level: Level, placements: Placements, preferences: Preferences): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 1, contentVersion: level.contentVersion, placements, preferences }));
    return true;
  } catch { return false; }
}
