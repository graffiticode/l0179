// SPDX-License-Identifier: MIT
/**
 * L0179's Form.
 *
 * L0179 compiles to the SAME shape as L0166 — `{title, instructions, validation, interaction:
 * {type: "table", rows, columns, cells}}` — which is the whole point of the port and is enforced
 * by packages/core/tools/differential-test.mjs. So the spreadsheet renderer is not rewritten
 * here: this delegates to the published @graffiticode/l0166 Form, which already reads that shape
 * and carries the editing, formula, and scoring behaviour.
 *
 * If the two data models ever diverge, this file is where that shows up first — and the
 * differential test should fail before it gets here.
 */
import { Form as SpreadsheetForm } from "@graffiticode/l0166";

export const Form = SpreadsheetForm;
