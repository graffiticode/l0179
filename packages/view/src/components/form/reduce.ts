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

/** Fold reported cells into one cell map, preserving everything the report does not carry. */
const mergeCells = (into: any, reported: any) =>
  Object.keys(reported).reduce(
    (acc: any, name: string) => ({ ...acc, [name]: mergeCell(acc[name], reported[name]) }),
    into || {},
  );

export const reduce: LanguageReducer = (data: any, { type, args }: StateAction) => {
  // Only an `update` carrying cells is ours; anything else falls through to the shared View.
  if (type !== "update" || !args?.cells || !data?.interaction) return undefined;

  // With several sheets the Form tags the edit with the sheet it came from. Merging into
  // `interaction.cells` regardless would write sheet 2's edit onto sheet 1's grid — the same
  // class of mistake as merging onto the top level, one level down.
  const { sheetId } = args as any;
  if (sheetId && Array.isArray(data.interaction.sheets)) {
    const sheets = data.interaction.sheets.map((s: any) => (
      s.id === sheetId ? { ...s, cells: mergeCells(s.cells, args.cells) } : s
    ));
    return {
      ...data,
      interaction: {
        ...data.interaction,
        sheets,
        // The flat fields mirror the first sheet, for consumers that predate `sheets`.
        ...(sheets[0]?.id === sheetId ? { cells: sheets[0].cells } : {}),
      },
    };
  }

  return {
    ...data,
    interaction: { ...data.interaction, cells: mergeCells(data.interaction.cells, args.cells) },
  };
};
