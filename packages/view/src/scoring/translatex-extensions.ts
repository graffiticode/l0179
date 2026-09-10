// SPDX-License-Identifier: MIT
/**
 * L0179's own additions to translatex's spreadsheet vocabulary — the expander set every
 * `buildTranslator` call in this package is handed, and the text pass every formula goes through
 * before it is parsed.
 *
 * Both exist because `@graffiticode/translatex` is consumed as a published package: its
 * `reducerBuilders` table is module-private, so a function it does not implement cannot be added
 * from outside except by replacing the `$fn` expander that dispatches to it. `translatex-rules.js`
 * already keeps the rule set here rather than upstream, so the vocabulary and the code behind it
 * stay in the same place.
 *
 * No DOM, no React, no ProseMirror — this is imported by ../scoring/score.ts, which Learnosity
 * runs server-side. See that file for why that constraint is a correctness requirement.
 */
import Decimal from "decimal.js";
import { spreadsheetExpanders } from "@graffiticode/translatex";

import { evalRules } from "./translatex-rules.js";
import { toUpperCase } from "./normalize.js";

/** The function names the rule sets know about, upper-cased as a formula is by the time we scan it. */
const FN_NAMES = new Set<string>(evalRules.types.fn.map((n: string) => n.toUpperCase()));

const isQuoteChar = (c: string) => c === "\"" || c === "'" || c === "`";

/**
 * `$fn` hands the reducer the arguments already translated and joined with commas, and a bare cell
 * name resolves against `env` rather than having been substituted — exactly what translatex's own
 * `getCellValue` does, and the reason a value can arrive here as either `"A1"` or `"1.05"`.
 */
const cellValue = (env: any, str: string) => {
  const cell = env && env[String(str).trim().toUpperCase()];
  return cell !== undefined ? cell.val : str;
};

/**
 * POWER(base, exponent), Excel's spelling of `base ^ exponent`.
 *
 * Decimal rather than `Math.pow` for the same reason every other reducer upstream uses it: an
 * integer exponent has to come out EXACT. `POWER(1.05,4)` is 1.21550625, not
 * 1.2155062500000004 — and the difference is not cosmetic, because a scored cell compares the
 * learner's value against this string.
 *
 * `#NUM!` covers both of Excel's rejections here — an argument that is not a number, and a result
 * that is not real (a negative base under a fractional exponent) — because the engine's error
 * surface is a marker string, not a code.
 */
const power = (env: any, joined: string) => {
  const args = String(joined).split(",").map((s) => cellValue(env, s));
  if (args.length !== 2) return "#NUM!";
  try {
    const result = new Decimal(args[0]).pow(new Decimal(args[1]));
    return result.isFinite() ? `${result}` : "#NUM!";
  } catch {
    return "#NUM!";
  }
};

const baseFn = (spreadsheetExpanders as any).$fn.fn;

/**
 * translatex's expanders, with `$fn` widened to the functions it does not implement. Everything it
 * does implement is delegated untouched, so this stays a strict extension rather than a fork.
 */
export const expanders = {
  ...(spreadsheetExpanders as any),
  $fn: {
    type: "fn",
    fn: ({ config, env }: any) => (args: any[]) => (
      String(args[0]).toLowerCase() === "power"
        ? power(env, args[1])
        : baseFn({ config, env })(args)
    ),
  },
};

/** The index of the `)` closing the `(` at `open`, or -1. Parens inside a string literal don't count. */
const matchParen = (text: string, open: number): number => {
  let depth = 0;
  let inString = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (isQuoteChar(c)) { inString = !inString; continue; }
    if (inString) continue;
    if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return i;
  }
  return -1;
};

/**
 * Upper-case a formula and bracket any function call that is an operand of `*` or `/`.
 *
 * The bracketing works around a parse defect BELOW us, in parselatex, which drops or mis-groups a
 * function application next to either of those two operators. Both sides are wrong, in different
 * ways:
 *
 *     =A1/SUM(A1,A2)     parses as   (A1 x SUM) applied to (A1,A2)   and evaluates to "2A1,A2"
 *     =SUM(A1,A2)/A1     throws, and the cell comes back empty
 *     =SUM(A1,A2)*A1     parses correctly
 *     =A1+SUM(A1,A2)     parses correctly
 *
 * A redundant pair of brackets is the whole fix — `=A1/(SUM(A1,A2))` and `=(SUM(A1,A2))/A1` both
 * evaluate correctly — so this inserts one and changes nothing else.
 *
 * None of it is specific to POWER and all of it predates POWER; `=A1/SUM(...)`, `=A1*ROUND(...)`
 * and `=AVERAGE(...)/A1` are all wrong today. But POWER is the function people write next to a
 * division — `=H28/POWER(1+B10,A28-B2)` is a discount factor, and every present-value sheet is
 * shaped that way — so adding POWER without this would fix nothing.
 *
 * Every call that is an operand of `*` or `/` is bracketed, rather than only the three of those
 * four positions that are broken — `=SUM(A1,A2)*A1` already parses, and brackets leave it alone.
 * A rule stated as "an operand of `*` or `/`" stays true; one stated as a table of which
 * combinations happen to break today would not survive the next parselatex release. The scan is
 * left to right and bracketing does not skip the bracketed region, so a call nested inside another
 * call is reached on the same pass.
 */
export const prepareFormula = (text: any): string => {
  const upper = toUpperCase(text);
  if (!upper || upper.indexOf("=") !== 0 || !/[*/]/.test(upper)) return upper;

  /** The next character that is not a space, from `i` on. */
  const significantAt = (i: number) => {
    while (i < upper.length && upper[i] === " ") i++;
    return upper[i] || "";
  };
  const isMulDiv = (c: string) => c === "*" || c === "/";

  // index of a `)` -> how many extra `)` to emit after it.
  const extraClose = new Map<number, number>();
  let out = "";
  let inString = false;
  let prev = "";  // last significant character outside a string

  for (let i = 0; i < upper.length; i++) {
    const c = upper[i];
    if (isQuoteChar(c)) { inString = !inString; out += c; prev = c; continue; }
    if (inString) { out += c; continue; }

    if (/[A-Z]/.test(c) && (prev === "" || !/[A-Z0-9_]/.test(prev))) {
      let j = i;
      while (j < upper.length && /[A-Z0-9_]/.test(upper[j])) j++;
      let open = j;
      while (open < upper.length && upper[open] === " ") open++;
      if (upper[open] === "(" && FN_NAMES.has(upper.slice(i, j))) {
        const end = matchParen(upper, open);
        if (end >= 0 && (isMulDiv(prev) || isMulDiv(significantAt(end + 1)))) {
          out += "(";
          extraClose.set(end, (extraClose.get(end) || 0) + 1);
        }
      }
    }

    out += c;
    if (c === ")") out += ")".repeat(extraClose.get(i) || 0);
    if (c !== " ") prev = c;
  }
  return out;
};
