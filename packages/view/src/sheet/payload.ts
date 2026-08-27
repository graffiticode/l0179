// SPDX-License-Identifier: MIT
/**
 * The two payloads the grid sends upward, built from the cell environment.
 *
 * Lifted out of TableEditor.tsx unchanged. They are pure projections of the model, so they belong
 * with the engine rather than with the editor — and having them here means the shapes the host and
 * the scorer depend on can be tested without a DOM.
 *
 * These two are deliberately NOT the same projection, and the difference is the contract:
 *
 *   - `getResponses` is the gradable answer set. It keeps only cells the author marked with
 *     `assess`, and reports `{text, val, formula}` — everything the scorer needs to decide
 *     equivalence, including the raw formula for `method "formula"`.
 *   - `getChangedCells` is what the MODEL keeps. It reports `{text, formattedValue}` for the cells
 *     that changed, and the reducer merges it per cell so each cell's `assess` rules and formatting
 *     survive the edit.
 */
import { formatCellValue } from "./formula.js";

/** Assessed cells only, projected for scoring. */
export const getResponses = (cells: any): any => (
  Object.keys(cells).reduce(
    (acc: any, name: string) => {
      const { text, val, formula, assess } = cells[name];
      return (assess && {
        ...acc,
        [name]: { text, val, formula },
      }) || acc;
    }, {},
  )
);

/** The named cells, projected for the `update` action. Unknown names are skipped, not nulled. */
export const getChangedCells = (cells: any, changedNames: string[]): any => (
  changedNames.reduce((acc: any, name: string) => {
    const cell = cells[name];
    if (!cell) return acc;
    const { text } = cell;
    const formattedValue = formatCellValue({ env: { cells }, name });
    return {
      ...acc,
      [name]: { text, formattedValue },
    };
  }, {})
);
