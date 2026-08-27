// SPDX-License-Identifier: MIT
/**
 * The formula engine had NO TESTS until it was lifted out of TableEditor.tsx — evaluation, the
 * dependency graph, cycle detection and every number and date format were pinned only by the
 * source. These are the first.
 *
 * Written by characterizing the real implementation rather than from the documentation — which is
 * how the dependency-extraction defect at the bottom of this file was found. Writing the first
 * tests for code by asserting what you assume it does would have reproduced the bug as a test.
 */
import { test, expect, describe } from "vitest";
import {
  evalCell,
  formatCellValue,
  getSingleCellDependencies,
  detectCycles,
  getCellDependencies,
  getCellRange,
  getColumnRange,
  getRowRange,
  columnToNumber,
  numberToColumn,
  getCellColor,
  mergeBorders,
  getResponses,
  getChangedCells,
} from "./index.js";

/** A leaf cell, as it looks after evaluation: it carries a `val`, which is what refs read. */
const leaf = (v: string) => ({ text: v, formula: v, val: v, type: "number" });
/** An unevaluated formula cell. */
const f = (t: string) => ({ text: t, formula: t });
const sheet = (cells: any) => ({ cells });

const base = () => sheet({ A1: leaf("10"), A2: leaf("20"), A3: leaf("30") });
const evalIn = (cells: any, text: string) =>
  evalCell({ env: sheet({ ...cells.cells, X: f(text) }), name: "X" });

describe("evalCell", () => {
  test.each([
    ["=SUM(A1:A3)", "60"],
    ["=AVERAGE(A1:A3)", "20"],
    ["=ROUND(A1/3,2)", "3.33"],
    ["=A1+A2", "30"],
    ["=A2-A1", "10"],
    ["=A1*A2", "200"],
    ["=SUM(A1:A3)+A1", "70"],
  ])("%s evaluates to %s", (formula, expected) => {
    expect(evalIn(base(), formula).val).toBe(expected);
  });

  test("a plain value is not a formula and is passed through", () => {
    const r = evalCell({ env: sheet({ A1: { text: "hello", formula: "hello" } }), name: "A1" });
    expect(r.val).toBe("hello");
  });

  test("an unknown function is #NAME! and says which name", () => {
    const r = evalIn(base(), "=NOPE(1)");
    expect(r.val).toBe("#NAME!");
    expect(r.type).toBe("error");
    expect(r.error).toContain("NOPE");
  });

  test("a circular reference is #CYCLE! and reports the path", () => {
    const env = sheet({ A1: f("=B1"), B1: f("=A1") });
    const r = evalCell({ env, name: "A1" });
    expect(r.val).toBe("#CYCLE!");
    expect(r.type).toBe("error");
    expect(r.error).toContain("A1 → B1 → A1");
  });
});

describe("detectCycles", () => {
  test("finds a two-cell cycle and returns the path", () => {
    const env = sheet({ A1: f("=B1"), B1: f("=A1") });
    const r = detectCycles({ env, startCell: "A1" });
    expect(r.hasCycle).toBe(true);
    expect(r.cyclePath).toEqual(["A1", "B1", "A1"]);
  });

  test("a plain dependency chain is not a cycle", () => {
    const env = sheet({ A1: leaf("1"), B1: f("=A1"), C1: f("=B1") });
    expect(detectCycles({ env, startCell: "C1" }).hasCycle).toBe(false);
  });

  test("getCellDependencies unions the dependencies of several cells", () => {
    const env = sheet({ ...base().cells, B1: f("=A1+A2"), C1: f("=A2+A3") });
    const deps = getCellDependencies({ env, names: ["B1", "C1"] });
    expect([...deps].sort()).toEqual(["A1", "A2", "A3"]);
  });
});

describe("formatCellValue", () => {
  test("applies a number format", () => {
    const env = sheet({ A1: { text: "1234.5", val: "1234.5", type: "number", format: "#,##0.00" } });
    expect(formatCellValue({ env, name: "A1" })).toBe("1,234.50");
  });

  test("leaves unformatted text alone", () => {
    const env = sheet({ A1: { text: "plain", val: "plain", type: "text" } });
    expect(formatCellValue({ env, name: "A1" })).toBe("plain");
  });

  test("renders a date serial through its pattern, on the 1904 epoch", () => {
    // 1904 rather than 1900 — chosen to sidestep Excel's 1900 leap-year bug. See ../scoring.
    const env = sheet({ A1: { text: "", val: "44016", type: "date", format: "MM/DD/YYYY" } });
    expect(formatCellValue({ env, name: "A1" })).toBe("07/04/2024");
  });
});

describe("addresses and ranges", () => {
  test("column names convert both ways, past Z", () => {
    expect(columnToNumber("A")).toBe(1);
    expect(columnToNumber("Z")).toBe(26);
    expect(columnToNumber("AA")).toBe(27);
    expect(numberToColumn(27)).toBe("AA");
  });

  test("ranges are inclusive and order-insensitive", () => {
    expect(getColumnRange("A", "C")).toEqual(["A", "B", "C"]);
    expect(getColumnRange("C", "A")).toEqual(["A", "B", "C"]);
    expect(getRowRange("2", "4")).toEqual(["2", "3", "4"]);
  });

  test("a cell range walks row-major", () => {
    expect(getCellRange("A1", "B2")).toEqual(["A1", "B1", "A2", "B2"]);
  });

  test("a malformed name yields no range rather than throwing", () => {
    expect(getCellRange("nope", "B2")).toEqual([]);
  });
});

describe("presentation policy", () => {
  const cell = (o: any) => ({ row: 2, col: 2, name: "B2", ...o });

  test("assess feedback: green when valid, red when not", () => {
    expect(getCellColor(cell({ score: { isValid: true } }))).toBe("#efe");
    expect(getCellColor(cell({ score: { isValid: false } }))).toBe("#fee");
  });

  test("the cell being edited shows no verdict", () => {
    // Telling a learner they are wrong while they are still typing the answer.
    expect(getCellColor(cell({ score: { isValid: false }, lastFocusedCell: "B2" }))).toBeNull();
  });

  test("headers are never coloured", () => {
    expect(getCellColor(cell({ row: 1, score: { isValid: false } }))).toBeNull();
    expect(getCellColor(cell({ col: 1, score: { isValid: false } }))).toBeNull();
  });

  test("falls back to the authored background", () => {
    expect(getCellColor(cell({ "background-color": "#eee" }))).toBe("#eee");
  });

  test("side-list borders UNION but css borders OVERRIDE", () => {
    expect(mergeBorders("top", "left")).toBe("top,left");
    expect(mergeBorders("top,left", "bottom,right")).toBe("all");
    expect(mergeBorders("1px solid black", "2px solid red")).toBe("2px solid red");
  });
});

describe("outgoing payloads", () => {
  test("getResponses keeps only assessed cells, with the scorer's three fields", () => {
    const cells = {
      A1: { text: "10", val: "10", formula: "10" },
      B1: { text: "20", val: "20", formula: "20", assess: { expected: "20" } },
    };
    expect(getResponses(cells)).toEqual({ B1: { text: "20", val: "20", formula: "20" } });
  });

  test("getChangedCells reports text plus the formatted value, and skips unknown names", () => {
    const cells = { A1: { text: "1234.5", val: "1234.5", type: "number", format: "#,##0.00" } };
    expect(getChangedCells(cells, ["A1", "ZZ99"]))
      .toEqual({ A1: { text: "1234.5", formattedValue: "1,234.50" } });
  });
});

// ── Dependency extraction ─────────────────────────────────────────────────
//
// This suite began by documenting a defect and now pins its fix. `cellNameRules` rendered a
// function call through the generic `"??": "%1%2"` concatenation, gluing the function's name onto
// the first cell name — `=SUM(A1:A3)` reported `["SUMA1","A2","A3"]` and `=ROUND(A1,2)` reported
// `["ROUNDA1"]`, so nothing woke those cells when A1 changed. Verified in a browser: a learner
// edited an input and the total below it kept a stale value, which is the value an assessed sheet
// would grade. References are now parsed directly; see getSingleCellDependencies.
describe("getSingleCellDependencies", () => {
  const depsOf = (text: string) =>
    getSingleCellDependencies({ env: sheet({ ...base().cells, X: f(text) }), name: "X" });

  test.each([
    ["=A1+A2", ["A1", "A2"]],
    ["=SUM(A1:A3)", ["A1", "A2", "A3"]],
    ["=ROUND(A1,2)", ["A1"]],
    ["=AVERAGE(A1:A3)", ["A1", "A2", "A3"]],
    ["=IF(A1,B1,C1)", ["A1", "B1", "C1"]],
    ["=SUM(A1:A3)+B1", ["A1", "A2", "A3", "B1"]],
    ["=ROUND(A1/3,2)", ["A1"]],
  ])("%s depends on %j", (formula, expected) => {
    expect(depsOf(formula)).toEqual(expected);
  });

  test("a lower-case formula resolves like an upper-case one", () => {
    expect(depsOf("=sum(a1:a3)")).toEqual(["A1", "A2", "A3"]);
  });

  test("a repeated reference is listed once", () => {
    expect(depsOf("=A1+A1+A2")).toEqual(["A1", "A2"]);
  });

  test("a cell name inside a string literal is text, not a reference", () => {
    expect(depsOf('=IF(A1,"B1","C1")')).toEqual(["A1"]);
  });

  test("a non-formula depends on nothing", () => {
    expect(depsOf("42")).toEqual([]);
    expect(getSingleCellDependencies({ env: sheet({}), name: "nope" })).toEqual([]);
  });

  test("always an array, so callers can iterate it safely", () => {
    // The old implementation returned the raw formula STRING when the translator threw, which
    // callers then walked character by character.
    for (const t of ["=SUM(", "=)))", "=", "=@@@"]) {
      expect(Array.isArray(depsOf(t))).toBe(true);
    }
  });

  test("a function call now takes part in cycle detection", () => {
    // Previously invisible: the self-reference hid behind the mangled name.
    const env = sheet({ A1: f("=ROUND(A1,2)") });
    expect(detectCycles({ env, startCell: "A1" }).hasCycle).toBe(true);
  });
});
