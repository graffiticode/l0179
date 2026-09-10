// SPDX-License-Identifier: MIT
/**
 * A memo for cell evaluation.
 *
 * WHY THIS EXISTS. One formula evaluation costs 3-17 ms, all of it inside TransLaTeX's
 * `translate()`; a literal costs ~0 ms and every other engine operation is under 0.05 ms. So the
 * cost of the whole system is the number of times a formula is parsed. `buildTranslator` is free —
 * it returns a closure — so caching the TRANSLATOR, which the shape of the code invites, is worth
 * nothing. Caching the RESULT is worth everything.
 *
 * THE KEY IS CONTENT-ADDRESSED, which is what makes this safe: a cell's value is a function of its
 * own text, its format, and the values of the cells it reads. Nothing else. There is therefore no
 * invalidation protocol to get wrong and no way for an entry to go stale — a changed input is a
 * different key. That is also why one cache can serve several sheets at once.
 *
 * Deliberately NOT keyed on a generation counter or on object identity. The renderer replaces the
 * cells object on essentially every transaction, so identity keying would miss on every edit, and
 * a generation counter would be wrong the moment some path forgot to bump it.
 *
 * THE INVARIANT THIS DEPENDS ON: no TransLaTeX expander reads any field of a cell except `.val`.
 * `getCellValue` and `$cell` in `spreadsheetExpanders.js` both read `env[NAME]?.val`, and `$range`
 * expands `A1:A3` by string arithmetic without touching the env at all. If a rule set ever starts
 * reading `.type` or `.text` off the env, this key becomes incomplete and must grow to match.
 * `../perf.test.ts` documents that assumption with a test rather than leaving it implicit.
 *
 * OWNERSHIP IS THE CALLER'S, and this matters more than the mechanism. There is no module-level
 * instance and there must never be one: a shared `Map` here would be correct (content-addressed
 * keys cannot go stale) and fast, and it would grow without bound inside a warm Learnosity scorer
 * process, holding every tenant's cell values live. The engine knows HOW to cache; the caller owns
 * WHEN IT DIES. `scoreCells` creates one as a local and drops it on return; the renderer keeps one
 * per editor, which dies with the editor.
 */

// Written as escapes, not literal control characters, so they are visible in the source. They
// cannot occur in a formula, a format string or a cell value, and ABSENT is deliberately distinct
// from a cell whose `val` is the empty string — see `evalKey`.
const UNIT = "\u0000";
const JOIN = "\u0001";
const ABSENT = "\u0002";

export interface SheetCache {
  values: Map<string, any>;
  max: number;
}

export const createSheetCache = (max = 4096): SheetCache => ({ values: new Map(), max });

/**
 * The cache key for evaluating `name`.
 *
 * The ABSENT sentinel for a dependency that is not in the map is load-bearing, and not an edge
 * case: `Object.keys(env)` becomes the parser's identifier table, so whether a referenced name
 * EXISTS changes how the formula parses, not merely what it looks up. `=A1+Q7` evaluates to "11"
 * when Q7 is in the map and "10" when it is not. A key that could not tell those apart would
 * return the wrong one.
 */
export const evalKey = (cells: any, name: string, deps: string[]): string => {
  const cell = cells[name] || {};
  let key = (cell.text ?? "") + UNIT + (cell.format ?? "") + UNIT;
  for (const dep of deps) {
    const d = cells[dep];
    key += (d === undefined ? ABSENT : String(d.val ?? "")) + JOIN;
  }
  return key;
};

export const cacheGet = (cache: SheetCache | undefined, key: string): any =>
  cache && cache.values.get(key);

export const cacheSet = (cache: SheetCache | undefined, key: string, value: any): any => {
  if (cache) {
    // Bounded, oldest-first. A sheet is small, but a long editing session walks through many
    // distinct values of the same cell, and this is what stops that growing forever.
    if (cache.values.size >= cache.max) {
      const oldest = cache.values.keys().next();
      if (!oldest.done) cache.values.delete(oldest.value);
    }
    cache.values.set(key, value);
  }
  return value;
};
