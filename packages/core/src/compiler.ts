// SPDX-License-Identifier: MIT
/**
 * L0179 — interactive spreadsheets in the attribute-list style.
 *
 * The output contract is L0166's, byte for byte: `{title, instructions, templateVariablesRecords,
 * validation, interaction: {type: "table", rows, columns, cells}, errors}`. Only the SOURCE
 * surface differs — attributes are arity-1 words merged from a bracket list instead of an arity-2
 * chain. That constraint is what makes tools/differential-test.ts possible, and it is why the
 * renderer (@graffiticode/l0166) and the deployed scorer work unchanged.
 *
 * Handlers for attributes are GENERATED from attributes.ts. Only containers are written by hand.
 */
import { Checker as BaseChecker, Transformer as BaseTransformer, Compiler } from "@graffiticode/l0000";
import {
  attributeFields,
  mergeAttributes,
  assertKnownAttributes,
  tagValue,
} from "./attributes.js";
import { resolveInheritedPoints, getValidation } from "./validation.js";
import { MAX_LIMIT, generateDataFromArgs, buildEnv } from "./params.js";

/** Unwrap L0000's internal Record representation to plain JS. Ported from L0176. */
function toPlainObject(val: any): any {
  if (val !== null && typeof val === "object" && val._type === "record" && val._entries instanceof Map) {
    const obj: any = {};
    for (const [k, v] of val._entries) {
      const name = (k as string).replace(/^(tag|str|num):/, "");
      obj[name] = toPlainObject(v);
    }
    return obj;
  }
  if (Array.isArray(val)) return val.map(toPlainObject);
  return val;
}

// ── Checker ────────────────────────────────────────────────────────────────
//
// Deliberately thin. Value validation lives in the Transformer, because the base
// `Checker.LIST` visits only its first element — so a rule written here would fire for the first
// attribute of a list and silently skip the rest. L0166 lost a `points` guard to exactly that.

export class Checker extends BaseChecker {
  [key: string]: any;
}

/** Walk one child and return the node — the shape every generated Checker method takes. */
function checkChild(node: any, options: any, resume: any, self: any) {
  self.visit(node.elts[0], options, (e0: any) => resume(([] as any[]).concat(e0 || []), node));
}

/** Walk both children, for the arity-2 containers. */
function checkBoth(node: any, options: any, resume: any, self: any) {
  self.visit(node.elts[0], options, (e0: any) => {
    self.visit(node.elts[1], options, (e1: any) =>
      resume(([] as any[]).concat(e0 || [], e1 || []), node));
  });
}

for (const name of Object.keys(attributeFields)) {
  Checker.prototype[name] = function (node: any, options: any, resume: any) {
    checkChild(node, options, resume, this);
  };
}
for (const name of ["SHEETS", "SHEET", "CELLS", "CELL", "COLUMNS", "COLUMN", "ROWS", "ROW", "PARAMS"]) {
  Checker.prototype[name] = function (node: any, options: any, resume: any) {
    checkBoth(node, options, resume, this);
  };
}

// ── Transformer ────────────────────────────────────────────────────────────

export class Transformer extends BaseTransformer {
  [key: string]: any;

  /**
   * `sheets [ sheet "id" [...] ] {config}` — a member list: children plus a configuration record.
   *
   * For now exactly one sheet is emitted, because the output contract has no envelope for more:
   * the renderer draws a single table and the scorer reads a single `validation.points`. More
   * than one is an explicit error rather than a silently-dropped sheet.
   */
  SHEETS(node: any, options: any, resume: any) {
    this.visit(node.elts[0], options, async (e0: any, v0: any) => {
      this.visit(node.elts[1], options, async (e1: any, v1: any) => {
        const err = ([] as any[]).concat(e0 || [], e1 || []);
        const sheets = (Array.isArray(v0) ? v0 : [v0]).filter((s) => s !== null && s !== undefined);
        if (sheets.length === 0) {
          resume(err.concat("sheets: expected at least one `sheet`."), {});
          return;
        }
        if (sheets.length > 1) {
          resume(
            err.concat(
              `sheets: ${sheets.length} sheets given, but only one is supported — the compiled ` +
              `form renders a single table. Author them as separate items.`),
            {});
          return;
        }
        const config = toPlainObject(v1) || {};
        resume(err, { ...config, ...toPlainObject(sheets[0]) });
      });
    });
  }

  /** `sheet "id" [...]` — a keyed entry: the id, and the sheet's attribute list. */
  SHEET(node: any, options: any, resume: any) {
    this.visit(node.elts[0], options, async (e0: any, v0: any) => {
      this.visit(node.elts[1], options, async (e1: any, v1: any) => {
        const err = ([] as any[]).concat(e0 || [], e1 || []);
        try {
          const attrs = mergeAttributes(toPlainObject(v1), "sheet");
          assertKnownAttributes("SHEET", attrs);
          // The id has no home in the output contract — L0166 emits no id field and adding one
          // would break byte-identity. Bind it for downstream use instead.
          const id = tagValue(toPlainObject(v0));
          if (id) options["sheet-id"] = id;
          resume(err, attrs);
        } catch (e: any) {
          resume(err.concat(String((e && e.message) || e)), {});
        }
      });
    });
  }

  PARAMS(node: any, options: any, resume: any) {
    // Ported from L0166. Note it does NOT visit its continuation: `params {...} {v: "0.0.1"}`
    // discards the trailing record, which is why no `v` reaches the output.
    this.visit(node.elts[0], options, (err1: any, val1: any) => {
      if (err1 && err1.length) {
        resume(err1, {});
        return;
      }
      let values: any[] = [];
      let params = options.data && options.data.params
        ? toPlainObject(options.data.params)   // Use form data.
        : toPlainObject(val1);                 // Use defaults.
      if (params) {
        let keys: any;
        let vals: any;
        if (Array.isArray(params)) {
          keys = params[0];
          vals = params.slice(1);
        } else {
          keys = Object.keys(params);
          vals = [Object.values(params)];
          params = [keys].concat(vals);  // Make new form for params.
        }
        keys.forEach((k: string, i: number) => {
          keys[i] = k.trim();
        });
        values.push(keys);
        vals.forEach((v: any) => {
          values = values.concat(generateDataFromArgs(keys, v));
        });
      }
      options.params = params;
      let limit = (options.data && options.data.limit) || (val1 && val1.limit) || MAX_LIMIT;
      limit = (limit < values.length && limit) || values.length;
      limit = (limit < MAX_LIMIT && limit) || MAX_LIMIT;
      if (values.length > limit) {
        console.log(`WARNING truncating seed list to ${limit} values.`);
        values = values.slice(0, limit + 1); // Plus 1 because column names.
      }
      const records = values.slice(1).map((v: any) => buildEnv(values[0], v));
      resume([], { templateVariablesRecords: records });
    });
  }
}

/**
 * Generated attribute methods: read the argument per the table, return a single-key record.
 * Whatever encloses it — a keyed entry, or an object-shaped attribute — merges the list.
 */
for (const [name, meta] of Object.entries(attributeFields)) {
  Transformer.prototype[name] = function (node: any, options: any, resume: any) {
    this.visit(node.elts[0], options, async (e0: any, v0: any) => {
      const err = ([] as any[]).concat(e0 || []);
      try {
        const raw = toPlainObject(v0);
        const value = meta.shape === "object"
          ? (() => {
              const attrs = mergeAttributes(raw, meta.field);
              assertKnownAttributes(name, attrs);
              return attrs;
            })()
          : meta.coerce
            ? meta.coerce(raw)
            : raw;
        resume(err, { [meta.field]: value });
      } catch (e: any) {
        resume(err.concat(String((e && e.message) || e)), {});
      }
    });
  };
}

/**
 * Keyed entries — `cell A1 [...]`, `column A [...]`, `row 1 [...]`.
 *
 * Emits `{ [key]: attributes }`, exactly L0166's CELL/COLUMN/ROW, so the enclosing member list
 * folds them into the same `cells` / `columns` / `rows` records.
 */
// Key coercion is per container, transcribed from L0166: CELL and COLUMN read a tag (`A1`, `A`),
// while ROW accepts a string region (`"*"`, `"1..5"`) OR a bare number (`row 1`), stringifying it.
// A single shared rule would reject `row 1`, which the corpus uses.
const keyOf: Record<string, (v: any) => string | undefined> = {
  CELL: (v) => tagValue(v),
  COLUMN: (v) => tagValue(v),
  ROW: (v) => (typeof v === "string" && v) || (typeof v === "number" && String(v)) || tagValue(v),
};

for (const [name, container] of [["CELL", "cell"], ["COLUMN", "column"], ["ROW", "row"]] as const) {
  Transformer.prototype[name] = function (node: any, options: any, resume: any) {
    this.visit(node.elts[0], options, async (e0: any, v0: any) => {
      this.visit(node.elts[1], options, async (e1: any, v1: any) => {
        const err = ([] as any[]).concat(e0 || [], e1 || []);
        try {
          const key = keyOf[name](toPlainObject(v0));
          if (!key) {
            resume(err.concat(`${container}: expected a name, e.g. ${container} A1 [text "x"].`), {});
            return;
          }
          const attrs = mergeAttributes(toPlainObject(v1), `${container} ${key}`);
          assertKnownAttributes(name, attrs);
          resume(err, { [key]: attrs });
        } catch (e: any) {
          resume(err.concat(String((e && e.message) || e)), {});
        }
      });
    });
  };
}

/**
 * Member lists — `cells [...] {config}`, `columns [...] {config}`, `rows [...] {config}`.
 *
 * Merges the keyed entries into one record under `field`, then spreads the configuration record,
 * matching L0166's CELLS/COLUMNS/ROWS.
 */
for (const [name, field] of [["CELLS", "cells"], ["COLUMNS", "columns"], ["ROWS", "rows"]] as const) {
  Transformer.prototype[name] = function (node: any, options: any, resume: any) {
    this.visit(node.elts[0], options, async (e0: any, v0: any) => {
      this.visit(node.elts[1], options, async (e1: any, v1: any) => {
        const err = ([] as any[]).concat(e0 || [], e1 || []);
        const entries = toPlainObject(v0);
        const merged = (Array.isArray(entries) ? entries : [entries]).reduce(
          (acc: any, entry: any) => ({ ...acc, ...entry }), {});
        resume(err, { ...toPlainObject(v1), [field]: merged });
      });
    });
  };
}

/**
 * PROG — the output contract, transcribed from L0166 so the two languages agree field for field.
 */
Transformer.prototype.PROG = function (node: any, options: any, resume: any) {
  this.visit(node.elts[0], options, async (e0: any, v0: any) => {
    const rawData = options?.data || {};
    // Strip an upstream `errors` field before merging — it is not spreadsheet state and would
    // otherwise make this stage look errored whenever its input was.
    const { errors: _upstreamErrors, ...data } = rawData;
    const err = e0;
    let val0 = Array.isArray(v0) ? v0[v0.length - 1] : v0;   // Last expression.
    val0 = resolveInheritedPoints(toPlainObject(val0) || {});
    const {
      templateVariablesRecords,
      title,
      instructions,
      columns,
      rows,
      cells,
      hideMenu,
      errors,
    } = val0;
    const val = {
      title: title || "",
      instructions: instructions || "",
      templateVariablesRecords,
      validation: getValidation(val0),
      interaction: {
        type: "table",
        rows,
        columns,
        cells,
        ...(hideMenu !== undefined ? { hideMenu } : {}),
      },
      errors,
    };
    resume(err, { ...val, ...data });
  });
};

export const compiler = new Compiler({
  langID: "0179",
  version: "v0.0.1",
  Checker,
  Transformer,
});
