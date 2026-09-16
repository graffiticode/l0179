// SPDX-License-Identifier: MIT
/**
 * L0179's spreadsheet vocabulary.
 *
 * This file used to REPLACE translatex's `$fn` expander wholesale, because that
 * was the only way to add a function: `reducerBuilders` was module-private, and
 * the name also had to be hand-added to `words` and to `types.fn` in three
 * separate rule sets. Four edits that had to agree, which is how L0166 and
 * L0179 ended up shipping rule sets whose entire difference was the word
 * `power`.
 *
 * translatex 0.25.0 derives all of that from one descriptor. What is left here
 * is POWER itself and `prepareFormula`, which works around a defect in
 * parselatex rather than in translatex and therefore still has to live in a
 * consumer.
 *
 * No DOM, no React, no ProseMirror — this is imported by ../scoring/score.ts,
 * which Learnosity runs server-side.
 */
import { createSpreadsheet } from "@graffiticode/translatex/src/spreadsheet.js";

import { toUpperCase, stripAbsoluteReferences } from "./normalize.js";

/**
 * POWER(base, exponent), Excel's spelling of `base ^ exponent`.
 *
 * Decimal rather than `Math.pow`, for the reason every reducer upstream uses
 * it: an integer exponent has to come out EXACT. `POWER(1.05,4)` is
 * 1.21550625, not 1.2155062500000004 — and the difference is not cosmetic,
 * because a scored cell compares the learner's typed value against this string.
 *
 * `#NUM!` covers both of Excel's rejections here — an argument that is not a
 * number, and a result that is not real — because the engine's error surface is
 * a marker string, not a code.
 */
const POWER = {
  name: "POWER",
  minArgs: 2,
  maxArgs: 2,
  apply: ({ args, helpers }: any) => {
    const [base, exponent] = args.map((a: string) => helpers.getCellValue(a));
    try {
      const result = helpers.toDecimal("POWER", 0, base)
        .pow(helpers.toDecimal("POWER", 1, exponent));
      return result.isFinite() ? `${result}` : "#NUM!";
    } catch {
      return "#NUM!";
    }
  },
};

const sheet = createSpreadsheet({ functions: [POWER] });

/** translatex's expanders plus L0179's functions. */
export const expanders = sheet.expanders;

/** The generated evaluation rule set. `words` and `types.fn` come from the registry. */
export const evalRules = sheet.rules.evalRules;

/** Detect a call that did not resolve. See prepareFormula for why one still can. */
export const checkResult = (value: any) => sheet.checkResult(value);

/**
 * A formula's string literals, rebound as cells the parser can read.
 *
 * parselatex rejects `"` outright (1004), so `=IF(A1>B1,A1,"")`, the ordinary way to leave a cell
 * blank, was #NAME!. Each literal becomes a synthetic reference (`Z900000000`, ...) bound in `env`
 * to the literal's text, which IF passes through and `=`/`<>` compare as text.
 *
 * The empty string is bound to a sentinel instead, and `decode` swaps it back: translatex resolves
 * a reference as `env[name].val || name`, so a reference whose value is "" evaluates to its own
 * NAME.
 *
 * A non-numeric literal used as an arithmetic operand (`=A1+"x"`) sets `error`. The reducers skip
 * a value that isn't a number, so it would otherwise evaluate silently to 10. Excel says #VALUE!.
 *
 * The row numbers are far past anything the compiler would author, so a synthetic name can't
 * collide with a real cell. Excel's doubled quote (`"say ""hi"""`) is unescaped.
 */
const LITERAL_ROW = 900000000;
const EMPTY = `${String.fromCharCode(3)}EMPTY${String.fromCharCode(3)}`;
const ARITHMETIC = /[-+*/^%&]/;

export const bindStringLiterals = (text: any) => {
  const env: any = {};
  let error: string | undefined;
  let index = 0;
  if (typeof text !== "string" || text.indexOf("\"") < 0) {
    return { text, env, error, decode: (val: any) => val };
  }
  const bound = text.replace(/"((?:[^"]|"")*)"/g, (match: string, body: string, at: number) => {
    const literal = body.replace(/""/g, "\"");
    const before = text.slice(0, at).trimEnd().slice(-1);
    const after = text.slice(at + match.length).trimStart().charAt(0);
    const isOperand = ARITHMETIC.test(before) || ARITHMETIC.test(after);
    if (isOperand && (literal.trim() === "" || isNaN(Number(literal)))) {
      error ??= `Text used as a number: ${match}`;
    }
    const name = `Z${LITERAL_ROW + index++}`;
    env[name] = { val: literal === "" ? EMPTY : literal, type: "text" };
    return name;
  });
  const decode = (val: any) => (
    typeof val === "string" && val.indexOf(EMPTY) >= 0 ? val.split(EMPTY).join("") : val
  );
  return { text: bound, env, error, decode };
};

/** The function names the rule set knows, upper-cased as a formula is when scanned. */
const FN_NAMES = new Set<string>(evalRules.types.fn.map((n: string) => n.toUpperCase()));

const isQuoteChar = (c: string) => c === "\"" || c === "'" || c === "`";

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
 * Upper-case a formula, drop `$` anchors (see stripAbsoluteReferences), spell `<>` as `!=`, and
 * bracket any function call that is an operand of `*` or `/`.
 *
 * THIS IS STILL NEEDED, and it is worth being clear why, because the rest of
 * this file just got much smaller and it would be easy to assume this went too.
 * The defect is in parselatex, not translatex: application by juxtaposition is
 * assembled at the LOWEST multiplicative precedence, so every explicit
 * multiplicative operator binds tighter and closes over the bare callee.
 *
 *     =A1/SUM(A1,A2)     the call is lost
 *     =SUM(A1,A2)/A1     the argument list becomes the numerator, and it throws
 *     =SUM(A1,A2)*A1     parses correctly
 *
 * parselatex 1.8.0 fixes this properly, with a real application production —
 * but only for a caller that declares its function names as `{type:'function'}`
 * in env, and translatex 0.25.0 does not. When it does, every case below
 * becomes a test of the parser fix and this function can go.
 *
 * A redundant pair of brackets is the whole workaround: `=A1/(SUM(A1,A2))`
 * evaluates correctly. Every call that is an operand of `*` or `/` is
 * bracketed, rather than only the three of those four positions that are
 * broken — `=SUM(A1,A2)*A1` already parses, and brackets leave it alone. The
 * scan is left to right and bracketing does not skip the bracketed region, so a
 * call nested inside another call is reached on the same pass.
 */
/**
 * Excel's not-equal, `<>`, spelled `!=` outside quoted text.
 *
 * The rule set has `?!=?` and nothing for `<>`, and parselatex has no `<>` token, so `A1<>A2` lexed
 * as `<` then `>` and every `IF(x<>y, …)` took its true branch, equal or not.
 */
const spellNotEqual = (text: string): string => {
  if (text.indexOf("<>") < 0) return text;
  let out = "";
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (isQuoteChar(c)) {
      quote = c;
    } else if (c === "<" && text[i + 1] === ">") {
      out += "!=";
      i++;
      continue;
    }
    out += c;
  }
  return out;
};

export const prepareFormula = (text: any): string => {
  const upper = spellNotEqual(toUpperCase(stripAbsoluteReferences(text)));
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
