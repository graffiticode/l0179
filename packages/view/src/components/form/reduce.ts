// SPDX-License-Identifier: MIT
/**
 * L0179's language-specific reducer cases, passed to the shared View as `reduce`.
 *
 * L0179 renders L0166's spreadsheet Form (see Form.tsx), so it must speak L0166's state
 * protocol. All of that protocol is generic except one case: an `update` carrying `cells`.
 * L0166's Form reports an edited cell as `{cells: {A1: {text, formattedValue}}}` and expects
 * it merged into `data.interaction.cells`, per cell, PRESERVING each cell's other properties
 * (its `assess` rules, its formatting).
 *
 * The shared View's generic `update` merges onto the top level instead, which writes a `cells`
 * key nothing renders and leaves `interaction.cells` untouched — the edit never reaches the
 * grid, and the next compile response redraws the sheet from source, erasing what was typed.
 * Transcribed from L0166's own reducer so the two agree.
 *
 * Everything else — `init`, `compiled`, `response`, `focus` — is returned as `undefined` so
 * the shared View handles it.
 */
import type { StateAction, LanguageReducer } from "@graffiticode/l0000-view";

/** The per-cell fields L0166's Form reports on an edit. */
const mergeCell = (prev: any, next: any) => ({
  ...prev,
  text: next?.text,
  formattedValue: next?.formattedValue,
});

export const reduce: LanguageReducer = (data: any, { type, args }: StateAction) => {
  // Only an `update` carrying cells is ours; anything else falls through to the shared View.
  if (type !== "update" || !args?.cells || !data?.interaction) return undefined;
  const cells = Object.keys(args.cells).reduce(
    (acc: any, name: string) => ({ ...acc, [name]: mergeCell(acc[name], args.cells[name]) }),
    data.interaction.cells || {},
  );
  return { ...data, interaction: { ...data.interaction, cells } };
};
