// SPDX-License-Identifier: MIT
/**
 * The score the host's Check button reports, from the live /form model.
 *
 * It is the Learnosity scorer's sum, taken over the same inputs as that host has them: the
 * learner's responses (`data.cells`, flat and sheet-qualified — see ./sheets.ts and the `response`
 * case in ../components/form/reduce.ts), the answer key, and the grid an `expected` formula
 * resolves against. With several sheets that grid is qualified too, so sheet 2's formula reads
 * sheet 2's cells rather than falling back to sheet 1's flat ones.
 */
import { getCellsValidation, scoreCells } from "./score.js";
import { qualify } from "./sheets.js";

/** The authored grid, keyed the way the responses are. */
function gridOf(interaction: any): any {
  const sheets = interaction?.sheets;
  if (Array.isArray(sheets) && sheets.length > 1) {
    return Object.assign({}, ...sheets.map((s: any) => qualify(s.id, s.cells || {})));
  }
  return interaction?.cells;
}

/**
 * `{score, max}` for the model, or `undefined` when there is nothing to check — no answer key, or
 * no assessed cell. Never throws: the View calls it on every change.
 */
export const score = (data: any): { score: number; max: number } | undefined => {
  const validation = data?.validation;
  if (!validation || typeof validation !== "object") return undefined;
  try {
    const responses = data.cells && typeof data.cells === "object" ? data.cells : {};
    const key = getCellsValidation({ cells: responses, validation }) || {};
    if (Object.keys(key).length === 0) return undefined;
    const scored = scoreCells({
      cells: responses,
      validation,
      interactionCells: gridOf(data.interaction),
    }) || {};
    const total = Object.keys(scored).reduce(
      (sum, name) => sum + (scored[name]?.score?.points || 0),
      0,
    );
    return { score: total, max: validation.points || 0 };
  } catch {
    return undefined;
  }
};
