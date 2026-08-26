// SPDX-License-Identifier: MIT
/**
 * The scoring half of L0179's Learnosity custom question type.
 *
 * A separate entry from question.ts because Learnosity also runs this bundle server-side.
 *
 * It is NOT currently free of the renderer, though it should be: @graffiticode/l0166 exposes
 * one entry module that exports Form and View alongside the scoring functions, and does not
 * declare `sideEffects: false`, so React and the spreadsheet come along no matter which path
 * the import takes. That is ~500 kB of dead weight here and the reason L0166's own deployed
 * scorer cannot be loaded in bare Node — it touches `document` at import time. Tracked in
 * l0166/docs/scoring-subpath.md; fixing it upstream slims both languages' scorers at once.
 *
 * Imported through @graffiticode/l0179-view rather than reaching past it into L0166. Going
 * direct saves 6 kB (577 vs 583) and buys nothing else, which is not worth the inconsistency
 * with question.ts.
 */
import { createScorer } from "@graffiticode/learnosity-cqt";
import { scoreCells } from "@graffiticode/l0179-view";

import { defaultData } from "./defaults.js";

const Scorer = createScorer({ scoreCells, defaultData });

declare const LearnosityAmd: { define: (deps: string[], fn: () => unknown) => void };

LearnosityAmd.define([], function () {
  return { Scorer };
});
