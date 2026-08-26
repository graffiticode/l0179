// SPDX-License-Identifier: MIT
/**
 * Scoring, transcribed VERBATIM from L0166's TableEditor.tsx (lines 419-548, 627-692, 829-848).
 *
 * WHY THIS IS ITS OWN MODULE, with no React and no ProseMirror anywhere in its import graph:
 * L0166 exports `scoreCells` from the same entry as its Form, and does not declare
 * `sideEffects: false`. So importing the scorer drags in React and the whole spreadsheet — about
 * 500 kB of dead weight in L0179's Learnosity scorer bundle, and the reason L0166's own deployed
 * scorer cannot be loaded in bare Node: it touches `document` at import time. Learnosity runs the
 * scorer SERVER-side as well as in the browser, so that is not a size complaint, it is a
 * correctness one. Keep this file free of the DOM.
 *
 * Transcribed rather than rewritten, the same rule that governs core's validation.ts and
 * params.ts. Two quirks are carried over deliberately and are NOT to be tidied without a
 * behaviour change of their own:
 *   - `getRegionValidations` returns only the FIRST region (its own TODO says so), so a program
 *     with several row regions scores only one of them today;
 *   - `equivValue` compares stringified values, so `val` and `expected` must already have been
 *     normalized by the caller — which is what the `method === "value"` branch of `scoreCell`
 *     spends most of its length doing.
 *
 * `scoreCells` takes the learner's RESPONSE map, not `interaction.cells`. `interactionCells` is
 * the authored grid, passed through so an `expected` written as a formula can be evaluated
 * against it.
 */
import { TransLaTeX, spreadsheetExpanders } from "@graffiticode/translatex";

import { evalRules, normalizeRules } from "./translatex-rules.js";
import {
  toUpperCase,
  wrapPlainTextInLatex,
  normalizeNumberInput,
  normalizeDateInput,
} from "./normalize.js";
import { qualify, splitBySheet } from "./sheets.js";

/**
 * Run a value through the LaTeX translator so two spellings of the same thing compare equal.
 * A formula comes back as its comma-separated normal form; anything else as a single-element
 * array. Errors are logged and the original text is kept — scoring never throws.
 */
const normalizeValue = (value: any): any[] => {
  // Handle non-string values (numbers, dates as serial numbers)
  if (typeof value === "number") {
    return [value];
  }

  // Handle null/undefined
  if (value == null) {
    return [value];
  }

  // Convert to string for processing
  const text = String(value);
  let result: any[] = [text];

  try {
    const options = {
      // allowThousandsSeparator: true,
      keepTextWhitespace: true,
      ...normalizeRules,
    };
    if (text && text.length > 0) {
      const processedText = text.indexOf("=") === 0 ? toUpperCase(text) : wrapPlainTextInLatex(text);
      const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
      translate(processedText, (err: any, val: any) => {
        if (err && err.length) {
          console.error(err);
        }
        result = text.indexOf("=") === 0 ? val.split(",") : [val];
      });
    }
  } catch (x: any) {
    console.log("parse error: " + x.stack);
  }
  return result;
};

const equivFormula = (actual: any, expected: any): boolean => {
  const normalizedActual = normalizeValue(actual);
  const normalizedExpected = normalizeValue(expected);

  // Check if arrays have same length
  if (normalizedActual.length !== normalizedExpected.length) {
    return false;
  }

  // Simple string comparison for formula text
  return normalizedActual.every((val, index) => {
    const expectedVal = normalizedExpected[index];
    // Just compare as strings since we're comparing formula text
    return val === expectedVal;
  });
};

const equivValue = (actual: any, expected: any, actualType: any, expectedType: any): boolean => {
  // First check type compatibility
  if (actualType && expectedType && actualType !== expectedType) {
    return false;
  }

  // Both values should be strings now, so direct comparison works
  return actual !== undefined && actual === expected;
};

/**
 * Evaluate an `expected` that was authored as a formula against the authored grid, so
 * `expected "=A1*2"` grades against whatever A1 actually holds this render.
 */
export const evaluateExpectedFormula = (formula: any, interactionCells: any): any => {
  if (!formula || !formula.startsWith("=") || !interactionCells) {
    return formula;
  }
  // Build env with val property from text, since TransLaTeX looks up env[name].val
  const env: any = {};
  for (const [name, cell] of Object.entries(interactionCells)) {
    env[name] = { ...(cell as any), val: (cell as any).val || (cell as any).text };
  }
  const options = {
    keepTextWhitespace: true,
    env,
    ...evalRules,
  };
  const processedText = toUpperCase(formula);
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  let result = formula;
  translate(processedText, (err: any, val: any) => {
    if (!err || !err.length) {
      result = String(val);
    }
  });
  return result;
};

/** Score one cell against one `assess` record. Returns `{points, isValid}`, never throws. */
export const scoreCell = (
  { method, expected, points = 1 }: any,
  { val, formula, type }: any = { val: undefined, formula: undefined, type: undefined },
  interactionCells: any = undefined,
): any => {
  // For assessment by value, also consider the type
  if (method === "value") {
    // If expected is a formula, evaluate it against the interaction cells
    let resolvedExpected = expected;
    if (typeof expected === "string" && expected.startsWith("=")) {
      resolvedExpected = evaluateExpectedFormula(expected, interactionCells);
    }

    // Parse expected value to determine its type if not provided
    let expectedType = "text";
    let expectedVal = resolvedExpected;

    if (resolvedExpected != null) {
      const expectedStr = String(resolvedExpected);
      // Check if it's a date
      const normalizedDate = normalizeDateInput(expectedStr);
      if (normalizedDate) {
        expectedType = "date";
        // Store as string to match how we store val
        expectedVal = String(normalizedDate);
      } else {
        // Check if it's a number
        const normalizedNumber = normalizeNumberInput(expectedStr);
        if (normalizedNumber !== null) {
          expectedType = "number";
          // Store as string to match how we store val
          expectedVal = String(normalizedNumber);
        }
      }
    }

    // Compare values and types (both are strings now)
    if (equivValue(val, expectedVal, type, expectedType)) {
      return { points, isValid: true };
    }
  } else if (method === "formula" && equivFormula(formula, expected)) {
    // For formula assessment, just compare the formula text
    return { points, isValid: true };
  }

  return { points: 0, isValid: false };
};

const getCellValue = (cell: any) => (
  cell.text || cell.val
);

const getExpectedCellValue = (cell: any) => (
  cell?.text || cell?.attrs?.assess?.expected
);

/**
 * The order the learner's rows are actually in, read down the primary column, de-duplicated.
 * Used when a row region is authored `order "actual"` — the answer key is re-sorted to match
 * what the learner typed rather than the other way round.
 */
const getActualOrder = ({ cells, primaryColumn }: any) => {
  const primaryColumnCellNames = (
    Object.keys(cells).sort((a, b) => +a.slice(1) - +b.slice(1)).map((name) => (
      (name.slice(0, 1) === primaryColumn && name) || null
    )).filter((x) => x !== null)
  );
  const order = primaryColumnCellNames.map(
    (name: any) => getCellValue(cells[name]) || null,
  );
  const seen = new Set();
  return order.map((item: any) => {
    // Remove dups.
    if (seen.has(item)) {
      return null;
    }
    seen.add(item);
    return item;
  }).filter((x: any) => x !== null);
};

const sortAssessRowsToMatchActual = ({ cells, region }: any) => {
  const { primaryColumn, rows } = region;
  const order = getActualOrder({ cells, primaryColumn });
  const dataMap = new Map<any, any>(
    rows.map((row: any): [any, any] => [getExpectedCellValue(row[primaryColumn]), row]),
  );
  const sortedRows = order.map((id: any) => (id !== null ? dataMap.get(id) || null : null));
  return sortedRows;
};

const getCellsValidationFromRegionValidation = ({ cells, region }: any) => {
  const rows = (
    (region?.order === "actual" &&
      sortAssessRowsToMatchActual({ cells, region })) ||
      region?.rows || []
  );
  // L0166 used `assert()` from the `assert` npm package here. That package pulls in `util`,
  // which reads `process` at module scope and throws `ReferenceError: process is not defined`
  // the moment it reaches a browser. A plain throw is equivalent -- nothing catches this -- and
  // keeps a Node polyfill out of both bundles.
  if (!region) {
    throw new Error("getCellsValidationFromRegionValidation() missing region value");
  }
  const cellsValidation = rows.reduce((acc: any, row: any, index: number) => (
    // TODO mark holes as errors.
    index = row?.id || index + 1,
    row && Object.keys(row).forEach((key) => (
      row[key]?.assess && (acc[key + index] = row[key])
    )),
    acc
  ), {}) || {};
  return cellsValidation;
};

const getRegionValidations = ({ cells, validation }: any) => {
  const regions = validation.regions || validation.ranges; // ranges for backward compat
  const regionName = Object.keys(regions).find((key) => (
    key    // return the first region name for now.
  ));
  // TODO Handle multiple regions. Split cells by region.
  return [{
    region: regions[regionName as string] || {},
    cells,
  }];
};

/** One sheet's answer key, flattened to a cell-name-keyed map: `{A2: {assess: {...}}, ...}`. */
const cellsValidationFor = ({ cells, validation }: any): any => {
  const regionValidations = getRegionValidations({ cells, validation });
  const cellsValidations = regionValidations.map((regionValidation) => (
    getCellsValidationFromRegionValidation(regionValidation)
  ));
  return cellsValidations[0];
};

/**
 * The per-sheet ids a multi-sheet `validation` carries, or null for the single-sheet shape.
 *
 * The compiler emits `validation.sheets` only when a program actually has several sheets, so the
 * absence of this key IS the single-sheet path — no flag to keep in step, and an item compiled
 * before sheets existed takes exactly the code path it always did.
 */
const sheetIdsOf = (validation: any): string[] | null => {
  const ids = validation?.sheets ? Object.keys(validation.sheets) : null;
  return ids && ids.length ? ids : null;
};

/** Per sheet, the authored grid to evaluate an `expected` formula against. */
const interactionFor = (interactionCells: any, id: string, ids: string[]) => {
  if (!interactionCells) return undefined;
  const split = splitBySheet(interactionCells, ids);
  // A caller that passed one flat grid means it for whichever sheet is being scored.
  return Object.keys(split[id] || {}).length ? split[id] : interactionCells;
};

/**
 * The answer key, keyed the way the response is: bare `A2` for one sheet, `s2!A2` once there are
 * several. Callers (including Learnosity's suggested-answers list) index the response with these
 * keys, so the two must agree.
 */
export const getCellsValidation = ({ cells, validation }: any): any => {
  const ids = sheetIdsOf(validation);
  if (!ids) return cellsValidationFor({ cells, validation });
  const bySheet = splitBySheet(cells || {}, ids);
  return ids.reduce((acc: any, id: string) => Object.assign(
    acc,
    qualify(id, cellsValidationFor({ cells: bySheet[id], validation: validation.sheets[id] })),
  ), {});
};

/**
 * Score a response map. Returns the same map with a `score` added to each assessed cell; the
 * caller sums `score.points` and compares against `validation.points`.
 *
 * With several sheets each is scored against its OWN validation rather than a merged one. That
 * is the same separation the compiler makes, and for the same reason: the region record is keyed
 * by row and column with no sheet dimension, so one merged pass has sheet 2's `A1` overwrite
 * sheet 1's answer key — leaving a maximum that no correct response can reach.
 */
export const scoreCells = ({ cells, validation, interactionCells = undefined }: any): any => {
  const ids = sheetIdsOf(validation);
  if (!ids) {
    const cellsValidation = cellsValidationFor({ cells, validation });
    return scoreAgainst(cells, cellsValidation, interactionCells);
  }
  const bySheet = splitBySheet(cells || {}, ids);
  return ids.reduce((acc: any, id: string) => {
    const key = cellsValidationFor({ cells: bySheet[id], validation: validation.sheets[id] });
    const scored = scoreAgainst(bySheet[id], key, interactionFor(interactionCells, id, ids));
    return Object.assign(acc, qualify(id, scored));
  }, {});
};

/** The single-sheet scoring pass, unchanged from L0166. */
function scoreAgainst(cells: any, cellsValidation: any, interactionCells: any): any {
  return Object.keys(cellsValidation).reduce((acc: any, cellName: string) => (
    {
      ...acc,
      [cellName]: (acc[cellName] && {
        ...acc[cellName],
        score: scoreCell(cellsValidation[cellName].assess, acc[cellName], interactionCells),
      }) || undefined,
    }
  ), cells);
}
