// SPDX-License-Identifier: MIT
/**
 * The attribute vocabulary, as data.
 *
 * Every word here is arity 1: it takes one value and evaluates to a single-key record, which the
 * enclosing container merges. Adding an attribute is a row in this file — the Checker and
 * Transformer methods are generated from it in compiler.ts, never hand-written. See
 * console/docs/language-authoring-style.md.
 *
 * `field` and `coerce` are transcribed from L0166's per-word transformers, not inferred. They
 * are not uniform and the differences are load-bearing for byte-identical output:
 *   - most style attributes emit a KEBAB key (`'background-color'`), not the camelCase name;
 *   - `hide-formulabar` emits `hideMenu`, the one word whose field is unrelated to its spelling;
 *   - most style attributes coerce through `tagValue(v) || ''`, so a bare tag and a quoted
 *     string are the same thing and an absent value becomes "" rather than undefined;
 *   - `align` coerces WITHOUT the `|| ''` fallback, and `method` lowercases.
 * A uniform pass-through table would have silently changed all of that.
 */

/** L0166's `tagValue`: a Transformer value is a string, or a `{tag}` record. */
export const tagValue = (v: any): string | undefined =>
  (typeof v === "string" && v) || (v && typeof v.tag === "string" && v.tag) || undefined;

const asTag = (v: any) => tagValue(v) || "";

export type Shape = "object";

export interface AttributeMeta {
  /** The key this attribute emits. */
  field: string;
  /** How the argument is read; omitted means "a value, passed through". */
  shape?: Shape;
  /** Value coercion, transcribed from L0166. Omitted means the value is used as-is. */
  coerce?: (v: any) => any;
}

export const attributeFields: Record<string, AttributeMeta> = {
  // Content
  TEXT: { field: "text" },

  // Presentation. Note the kebab fields and the `|| ''` coercion — see the header.
  WIDTH: { field: "width" },
  ALIGN: { field: "align", coerce: tagValue },
  BACKGROUND_COLOR: { field: "background-color", coerce: asTag },
  FONT_WEIGHT: { field: "font-weight", coerce: asTag },
  FONT_SIZE: { field: "font-size", coerce: asTag },
  FONT_FAMILY: { field: "font-family", coerce: asTag },
  FONT_STYLE: { field: "font-style", coerce: asTag },
  COLOR: { field: "color", coerce: asTag },
  TEXT_DECORATION: { field: "text-decoration", coerce: asTag },
  BORDER: { field: "border", coerce: asTag },
  VERTICAL_ALIGN: { field: "vertical-align", coerce: asTag },
  FORMAT: { field: "format", coerce: asTag },
  PROTECTED: { field: "protected" },

  // Assessment
  ASSESS: { field: "assess", shape: "object" },
  METHOD: { field: "method", coerce: (v) => tagValue(v)?.toLowerCase() || v },
  EXPECTED: { field: "expected" },
  POINTS: { field: "points" },

  // Sheet-level
  TITLE: { field: "title" },
  INSTRUCTIONS: { field: "instructions" },
  HIDE_FORMULABAR: { field: "hideMenu" },
};

/**
 * Source spelling for each emitted field, so an error message names the word the author wrote
 * rather than the key it compiles to — `hide-formulabar`, never `hideMenu`.
 */
export const fieldToWord: Record<string, string> = Object.entries(attributeFields).reduce(
  (acc, [name, meta]) => {
    acc[meta.field] = name.toLowerCase().replace(/_/g, "-");
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Which attributes each container accepts, in source spelling.
 *
 * This is the payoff of the style and the reason it is maintained by hand: an attribute list
 * merges whatever it is handed, so without this a word written one level too high lands in a
 * record nothing reads, compiles clean, and silently does not do what it says. L0176 shipped
 * exactly that at its block levels before adding this check.
 */
export const validAttributes: Record<string, string[]> = {
  SHEET: ["title", "instructions", "hide-formulabar", "columns", "rows", "cells"],
  CELL: [
    "text", "assess", "width", "align", "background-color", "font-weight", "font-size",
    "font-family", "font-style", "color", "text-decoration", "border", "vertical-align",
    "format", "protected",
  ],
  COLUMN: [
    "width", "align", "background-color", "font-weight", "font-size", "font-family",
    "font-style", "color", "text-decoration", "border", "vertical-align", "format",
    "protected", "assess",
  ],
  ROW: [
    "align", "background-color", "font-weight", "font-size", "font-family", "font-style",
    "color", "text-decoration", "border", "vertical-align", "format", "protected", "assess",
  ],
  ASSESS: ["method", "expected", "points"],
};

/** Containers that legitimately own each word, for the "belongs to" hint. */
const wordOwners: Record<string, string[]> = Object.entries(validAttributes).reduce(
  (acc, [container, words]) => {
    for (const w of words) (acc[w] = acc[w] || []).push(container.toLowerCase());
    return acc;
  },
  {} as Record<string, string[]>,
);

/**
 * Reject attributes a container does not take.
 *
 * The message is a product surface: the code generator is an LLM that reads compiler output and
 * retries, so it names the legal set AND where the attribute actually belongs. The second half
 * is the high-leverage one — an L0176 error of this shape took a deterministic failure to 10/10
 * once the misplacement was spelled out.
 */
export function assertKnownAttributes(container: string, attrs: Record<string, unknown>) {
  const allowed = validAttributes[container];
  if (!allowed) return;
  const where = container.toLowerCase();
  const unknown = Object.keys(attrs)
    .map((field) => fieldToWord[field] || field)
    .filter((word) => !allowed.includes(word));
  if (unknown.length === 0) return;
  const hints = unknown
    .map((w) => {
      const owners = (wordOwners[w] || []).filter((o) => o !== where);
      return owners.length ? ` \`${w}\` belongs to ${owners.join(" or ")}.` : "";
    })
    .join("");
  throw new Error(
    `${where}: ${unknown.map((u) => `\`${u}\``).join(", ")} ` +
      `${unknown.length === 1 ? "is not an attribute" : "are not attributes"} of ${where}. ` +
      `It takes: ${allowed.join(", ")}.${hints}`,
  );
}

/**
 * Merge an attribute list into one object.
 *
 * Throws rather than silently dropping: a malformed entry is a compile error, because the
 * alternative is a program that looks right and quietly loses an attribute.
 */
export function mergeAttributes(attrs: any, where: string): Record<string, any> {
  if (!Array.isArray(attrs)) {
    throw new Error(`${where}: expected an attribute list in [brackets], e.g. [text "Total"].`);
  }
  const out: Record<string, any> = {};
  for (const a of attrs) {
    if (a === null || a === undefined || typeof a !== "object" || Array.isArray(a)) {
      throw new Error(
        `${where}: every entry must be an attribute applied to a value, e.g. [text "Total" width 100].`,
      );
    }
    Object.assign(out, a);
  }
  return out;
}
