// SPDX-License-Identifier: MIT
/**
 * Argument-type and shape rules.
 *
 * These exist because L0179 was briefly MORE PERMISSIVE than L0166: `font-size 14` compiled to
 * `font-size: ""`, silently dropping the value, where L0166 errors with E_ARG_TYPE. The
 * differential test cannot catch that class — it compares programs that compile in BOTH
 * languages, so it is blind to L0179 accepting what L0166 rejects. Only these can.
 */
import { test, expect } from "vitest";
import { parser } from "@graffiticode/parser";
import { compiler, lexicon } from "./index.js";

async function compileSrc(src: string) {
  const code = await parser.parse(179, src, lexicon);
  return await new Promise<any>((res, rej) =>
    compiler.compile(code, {}, {}, (e: any, v: any) => {
      const errs = Array.isArray(e) ? e.filter(Boolean) : e ? [e] : [];
      if (errs.length) rej(errs); else res(v);
    }));
}

const cell = (attrs: string) =>
  `sheets [ sheet "s" [ cells [ cell A1 [text "x" ${attrs}] ] {} ] ] {}..`;

/**
 * Assert that compiling fails with a message containing `needle`.
 *
 * Checks that SOME error matches rather than pinning the array shape: one mistake can raise
 * several errors (a rejected cell leaves the sheet with no cells, which trips that rule too),
 * and a test that breaks when a second, correct error appears is testing the wrong thing.
 */
async function expectError(src: string, needle: string) {
  let errors: any[] | null = null;
  try {
    await compileSrc(src);
  } catch (e: any) {
    errors = Array.isArray(e) ? e : [e];
  }
  expect(errors, `expected a compile error containing "${needle}", but it compiled`).toBeTruthy();
  const messages = errors!.map((x) => String(x?.message ?? x));
  expect(
    messages.some((m) => m.includes(needle)),
    `no error contained "${needle}":\n  ${messages.join("\n  ")}`,
  ).toBe(true);
}

test.each([
  ["font-size 14", "font-size expects a string"],
  ["font-family 12", "font-family expects a string"],
  ['width "wide"', "width expects a number"],
  ["background-color 0", "background-color expects a string"],
])("%s is rejected", async (attrs, needle) => {
  await expectError(cell(attrs), needle);
});

test.each([
  'font-size "14px"',
  "width 100",
  'background-color "#eee"',
  'align "center"',
])("%s is accepted", async (attrs) => {
  await expect(compileSrc(cell(attrs))).resolves.toBeTruthy();
});

// The trap this placement exists for: the base Checker.LIST visits only elts[0], so a rule
// written as a Checker method fires for the first attribute and skips every one after it.
test("a bad argument is caught in the LAST position of an attribute list", async () => {
  await expectError(
    cell('color "red" font-weight "bold" font-size 14'),
    "font-size expects a string",
  );
});

test("points rejects a negative and preserves zero", async () => {
  const withPoints = (p: string) =>
    `sheets [ sheet "s" [ cells [ cell A1 [assess [method "value" expected "1" points ${p}]] ] {} ] ] {}..`;
  await expectError(withPoints("-1"), "must be >= 0");
  // `points 0` is meaningful — checked but unscored — so it must survive, not read as unset.
  const out = await compileSrc(withPoints("0"));
  expect(out.interaction.cells.A1.assess.points).toBe(0);
});

test("hide-formulabar wants a boolean", async () => {
  await expectError(
    `sheets [ sheet "s" [ hide-formulabar 1 cells [ cell A1 [text "x"] ] {} ] ] {}..`,
    "expects true or false",
  );
});

// A sheet with no cells renders nothing. The generator produced exactly this for "create a
// header row with bold white text": row 1 styled, with nothing in it.
test("a sheet with no cells is an error, not an empty grid", async () => {
  await expectError(
    `sheets [ sheet "s" [ rows [ row 1 [font-weight "bold"] ] {} ] ] {}..`,
    "no cells",
  );
});

test("an attribute on the wrong container names where it belongs", async () => {
  await expectError(cell('method "value"'), "belongs to assess");
});
