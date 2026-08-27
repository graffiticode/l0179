// SPDX-License-Identifier: MIT
/**
 * The spreadsheet engine — everything the grid does that is not drawing.
 *
 * Renderer-agnostic by construction: nothing here imports React, ProseMirror, or the DOM. That is
 * the point. It was extracted from TableEditor.tsx, where roughly half the surrounding code exists
 * only to make a rich-text editor behave like a grid; keeping the engine out of that makes a future
 * renderer a re-skin rather than a rewrite, and makes the engine testable, which it was not before.
 *
 * Not to be confused with ../scoring, which decides whether an answer is RIGHT. This decides what a
 * cell IS. Scoring stays separate because Learnosity loads it server-side in bare Node.
 */
export {
  evalCell,
  formatCellValue,
  fixText,
  isDateFormat,
  getSingleCellDependencies,
  getCellDependencies,
  detectCycles,
} from "./formula.js";
export type { CycleDetectionResult, CellValue } from "./formula.js";

export { getResponses, getChangedCells } from "./payload.js";

export {
  columnToNumber,
  numberToColumn,
  getColumnRange,
  getRowRange,
  getCellRange,
} from "./address.js";

export { getCellColor, mergeBorders, ASSESS_VALID, ASSESS_INVALID } from "./presentation.js";
