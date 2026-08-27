// SPDX-License-Identifier: MIT
/**
 * The spreadsheet engine: evaluate a cell, work out what it depends on, catch cycles, and format
 * the result for display.
 *
 * Lifted VERBATIM out of TableEditor.tsx, where it sat among 1,400 lines of ProseMirror plumbing
 * while importing none of it. It operates on a plain environment —
 * `{ cells: { [name]: { text, val, formula, type, format, deps } } }` — and returns plain values.
 *
 * Two reasons it lives here now. First, it is the half of the grid that survives any renderer, and
 * keeping it separate is what makes replacing the renderer a re-skin rather than a rewrite; this is
 * the same split already made for scoring (see ../scoring/score.ts). Second, and more immediately:
 * while it was tangled in the editor it had NO TESTS AT ALL. Formula evaluation, the dependency
 * graph, cycle detection and every date and number format were pinned only by the source.
 *
 * `#NAME!` and `#CYCLE!` are produced here, before evaluation, and carry a human-readable `error`.
 */
import { TransLaTeX, spreadsheetExpanders } from "@graffiticode/translatex";

import { evalRules, formatRules } from "../scoring/translatex-rules.js";
import {
  toUpperCase,
  isNumeric,
  wrapPlainTextInLatex,
  normalizeNumberInput,
  normalizeDateInput,
} from "../scoring/index.js";
import { getCellRange } from "./address.js";

/**
 * What a cell evaluates to. `error` is present only on the error path, where `val` carries the
 * spreadsheet-visible marker (`#NAME!`, `#CYCLE!`) and `error` the human-readable reason.
 */
export interface CellValue {
  formula: any;
  val: any;
  format: any;
  type: string;
  error?: string;
}

export const evalCell = ({ env, name }): CellValue => {
  const cell = env.cells[name];
  const text = cell?.text || "";
  const format = cell?.format || "";
  let result = {
    formula: text,
    val: text,
    format: format,
    type: 'text', // Default type is text
  };

  // Check for undefined function references and cycles before evaluation for formulas
  if (text && text.length > 0 && text.indexOf("=") === 0) {
    // Check for undefined name references (functions or variables)
    const supportedFunctions = evalRules.types.fn;
    const namePattern = /([A-Za-z][A-Za-z0-9_]*)/g;
    const cellNamePattern = /^[A-Za-z]+[0-9]+$/; // Pattern for valid cell names like A1, B2, AA10
    let match;
    const undefinedNames = [];
    while ((match = namePattern.exec(text)) !== null) {
      const name = match[1];
      const nameLower = name.toLowerCase();
      // Skip if it's a valid cell reference (letters followed by numbers)
      if (cellNamePattern.test(name)) {
        continue;
      }
      // Skip if it's a supported function
      if (supportedFunctions.includes(nameLower)) {
        continue;
      }
      // It's an undefined name
      undefinedNames.push(name);
    }
    if (undefinedNames.length > 0) {
      const uniqueNames = [...new Set(undefinedNames)]; // Remove duplicates
      return {
        formula: text,
        val: "#NAME!",
        format: format,
        type: 'error',
        error: `Undefined name${uniqueNames.length > 1 ? 's' : ''}: ${uniqueNames.join(', ')}`
      };
    }

    const cycleCheck = detectCycles({ env, startCell: name });
    if (cycleCheck.hasCycle) {
      return {
        formula: text,
        val: "#CYCLE!",
        format: format,
        type: 'error',
        error: `Circular dependency: ${cycleCheck.cyclePath?.join(' → ')}`
      };
    }
  }

  // Apply normalization for non-formula input
  if (text && !text.startsWith('=')) {
    // Try to normalize as date first
    const normalizedDate = normalizeDateInput(text);
    if (normalizedDate) {
      result.val = String(normalizedDate);
      result.type = 'date';
    } else {
      // Try to normalize as number
      const normalizedNumber = normalizeNumberInput(text);
      if (normalizedNumber !== null) {
        result.val = String(normalizedNumber);
        result.type = 'number';
      }
    }
  }
  try {
    // Only process formulas through TransLaTeX
    if (text && text.length > 0 && text.indexOf("=") === 0) {
      const options = {
        // allowThousandsSeparator: true,
        keepTextWhitespace: true,
        env: env.cells,
        ...evalRules,
      };
      const processedText = toUpperCase(text);
      const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
      translate(processedText, (err, val) => {
        if (err && err.length) {
          console.error(err);
        }
        // Store val as string but set appropriate type
        // Check if it's a date format first
        if (isDateFormat(format) && isNumeric(String(val))) {
          result = {
            ...result,
            val: String(val),
            type: 'date',
          };
        }
        // Check if it's a number
        else if (isNumeric(String(val))) {
          result = {
            ...result,
            val: String(val),
            type: 'number',
          };
        }
        // Otherwise it's text
        else {
          result = {
            ...result,
            val: String(val),
            type: 'text',
          };
        }
      });
    }
  } catch (x: any) {
    console.log("parse error: " + x.stack);
  }
  return result;
}

export const fixText = text => {
  // Convert to string if not already
  const str = typeof text === 'string' ? text : String(text || '');
  return str
    .replace(new RegExp("\\{\\{", "g"), "[[")
    .replace(new RegExp("\\}\\}", "g"), "]]");
};

export const isDateFormat = (format) => {
  const dateFormatPatterns = [
    'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD',
    'MM-DD-YYYY', 'DD-MM-YYYY', 'M/D/YY', 'D/M/YY',
    'MMM DD, YYYY', 'DD MMM YYYY', 'date'
  ];
  return format && dateFormatPatterns.some(pattern =>
    format.toLowerCase().includes(pattern.toLowerCase())
  );
};

export const formatCellValue = ({ env, name }) => {
  const cell = env.cells[name] || {};
  const val = cell.val;
  const type = cell.type || 'text';
  const format = cell.format || "";
  let result = val;

  // Handle date serial numbers based on type and format
  const isDateFormatted = isDateFormat(format);
  // Convert string val to number if it's a date type
  if ((type === 'date' || isDateFormatted) && val) {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    if (!isNaN(numVal)) {
      const excelEpoch = new Date(1904, 0, 1);
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + (numVal - 1) * msPerDay);
    // Apply specific date format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const yearShort = year.toString().slice(-2);
    if (format.includes('DD/MM/YYYY')) {
      result = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    } else if (format.includes('DD-MM-YYYY')) {
      result = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    } else if (format.includes('YYYY-MM-DD')) {
      result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else if (format.includes('MM-DD-YYYY')) {
      result = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`;
    } else if (format.includes('M/D/YY')) {
      result = `${month}/${day}/${yearShort}`;
    } else if (format.includes('D/M/YY')) {
      result = `${day}/${month}/${yearShort}`;
    } else if (format.includes('MMM DD, YYYY')) {
      result = `${monthNames[date.getMonth()]} ${day.toString().padStart(2, '0')}, ${year}`;
    } else if (format.includes('DD MMM YYYY')) {
      result = `${day.toString().padStart(2, '0')} ${monthNames[date.getMonth()]} ${year}`;
    } else {
      // Default to MM/DD/YYYY
      result = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    }
    }
  }
  try {
    // Convert numbers to strings for TransLaTeX formatting
    if (typeof result === 'number' && format && !isDateFormatted) {
      result = result.toString();
    }
    // FIXME date formatting in translatex assumes input is a formatted string,
    // not a date serial number. For now, only process string values with format
    // rules (skip if we already formatted a date)
    if (format && result && typeof result === 'string' && result.length > 0 && !isDateFormatted) {
      const options = {
        allowInterval: true,
        keepTextWhitespace: true,
        RHS: false,
        env: {format},
        ...formatRules,
      };
      const processedVal = wrapPlainTextInLatex(result);
      const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
      translate(processedVal, (err, val) => {
        if (err && err.length) {
          console.error(err);
        }
        result = val;
      });
    }
  } catch (x: any) {
    console.log("parse error: " + x.stack);
  }
  return result;
}


/**
 * A cell reference, optionally the start of a range. A function name can never match: it has no
 * trailing digits.
 */
const CELL_REF = /\b([A-Z]+[0-9]+)(?::([A-Z]+[0-9]+))?\b/g;

/**
 * The cells a formula reads, in the order it reads them, ranges expanded and duplicates dropped.
 * A non-formula depends on nothing.
 *
 * WHY THIS IS PARSED DIRECTLY rather than rendered through TransLaTeX, which is what it used to do:
 * the `cellNameRules` rule set is meant to re-emit a formula as nothing but its cell names, and for
 * bare arithmetic it does. For a FUNCTION CALL it has a `fn(cellRange)` case inside its `"=?"`
 * dispatch but no top-level rule for function application, so the expression fell through to the
 * generic `"??": "%1%2"` concatenation and the function's name was glued onto the first cell name:
 *
 *     =SUM(A1:A3)    ->  ["SUMA1", "A2", "A3"]     A1 lost
 *     =ROUND(A1,2)   ->  ["ROUNDA1"]               nothing tracked
 *     =IF(A1,B1,C1)  ->  ["IFA1"]                  B1 and C1 lost
 *
 * That was not cosmetic. This list is the reverse edge that drives recalculation, so a cell reading
 * A1 through a function call was never woken when A1 changed: a learner edited an input and the
 * total below it silently kept a stale value, which in an assessed sheet is the value that gets
 * graded. Confirmed in the browser before the fix — `=ROUND(B1,2)` never updated at all, and
 * `=SUM(B1:B3)` updated only when some OTHER cell in the range was touched.
 *
 * Parsing the references directly is both correct and simpler than teaching the rule set about
 * every call shape. The old code also returned the raw formula STRING when the translator threw,
 * which callers then iterated character by character; this always returns an array.
 */
export const getSingleCellDependencies = ({ env, name }): string[] => {
  const text = env.cells[name]?.text || "";
  if (!text || text.indexOf("=") !== 0) return [];

  // Upper-case outside quoted strings, so `=sum(a1:a3)` resolves like `=SUM(A1:A3)`; then blank the
  // quoted segments, because a cell name inside a string literal is text, not a reference.
  const formula = toUpperCase(text)
    .replace(/"[^"]*"/g, '""')
    .replace(/'[^']*'/g, "''");

  const deps: string[] = [];
  const seen = new Set<string>();
  CELL_REF.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CELL_REF.exec(formula)) !== null) {
    // `A1:A3` contributes every cell between its corners; a lone `A1` contributes itself.
    for (const cell of (match[2] ? getCellRange(match[1], match[2]) : [match[1]])) {
      if (!seen.has(cell)) {
        seen.add(cell);
        deps.push(cell);
      }
    }
  }
  return deps;
};

// Cycle detection using DFS with three-color approach
export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath?: string[];
  dependencies: string[];
}

export const detectCycles = ({ env, startCell }: { env: any; startCell: string }): CycleDetectionResult => {
  const GRAY = 1, BLACK = 2;
  const colors = new Map<string, number>();
  const dependencies = new Set<string>();
  let cyclePath: string[] = [];
  let hasCycle = false;

  const dfs = (cell: string, path: string[]): boolean => {
    if (colors.get(cell) === GRAY) {
      // Found a back edge - cycle detected
      const cycleStart = path.indexOf(cell);
      cyclePath = path.slice(cycleStart).concat([cell]);
      return true;
    }

    if (colors.get(cell) === BLACK) {
      // Already processed, no cycle in this path
      return false;
    }

    // Mark as currently being processed
    colors.set(cell, GRAY);
    // Get direct dependencies of this cell
    const cellDeps = getSingleCellDependencies({ env, name: cell });
    for (const dep of cellDeps) {
      dependencies.add(dep);
      if (dfs(dep, [...path, cell])) {
        return true; // Cycle found
      }
    }

    // Mark as completely processed
    colors.set(cell, BLACK);
    return false;
  };

  hasCycle = dfs(startCell, []);

  return {
    hasCycle,
    cyclePath: hasCycle ? cyclePath : undefined,
    dependencies: Array.from(dependencies)
  };
};

export const getCellDependencies = ({ env, names }) => {
  // Get the cells that `names` depend on with cycle detection
  const allDeps = new Set<string>();
  for (const name of names) {
    const result = detectCycles({ env, startCell: name });
    if (result.hasCycle) {
      console.error(`Circular dependency detected in cell ${name}: ${result.cyclePath?.join(' → ')}`);
      // Continue processing other cells but don't add dependencies for cyclic cells
      continue;
    }
    result.dependencies.forEach(dep => allDeps.add(dep));
  }
  return Array.from(allDeps);
};

