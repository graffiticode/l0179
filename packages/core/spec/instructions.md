<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0179 — interactive spreadsheets

L0179 authors interactive spreadsheets: cell grids with text, formatting, and formulas, plus
optional assessed cells that grade what a learner types.

OUT_OF_SCOPE: assessment ITEMS or QUESTIONS as content (multiple-choice, reading passages, stems,
answer keys, rubric-scored prose); charts and visualizations; pivot tables; cross-sheet
references; database tables, CSV editors, or query builders; macros and user-defined functions.
L0179 authors a spreadsheet INTERACTION, not question items. If the request is for one of these,
say so instead of emitting a program.

## The shape of a program

Every program is one `sheets` list holding one `sheet`, and the sheet's body is a list of
attributes:

```
sheets [
  sheet "s1" [
    title "Quarterly Totals"
    columns [
      column A [width 200 align "right"]
    ] {}
    cells [
      cell A1 [text "Revenue" font-weight "bold"]
      cell B1 [text "=SUM(B2:B4)"]
    ] {}
  ]
] {
  "v": "0.0.1"
}..
```

## Three rules cover the whole syntax

1. **An attribute is a word applied to a value**, written inside a `[...]` list:
   `text "Revenue"`, `width 200`, `points 2`. Order does not matter.
2. **A cell, column, or row is its name followed by its attribute list**:
   `cell A1 [text "10"]`, `column A [width 100]`, `row 1 [font-weight "bold"]`.
   A cell with no attributes is `cell B1 []`.
3. **`cells`, `columns`, and `rows` are lists of those, each followed by `{}`**:
   `cells [ cell A1 [...] cell A2 [...] ] {}`. The `{}` is the block's configuration and is
   almost always empty — write it anyway.

There is no chaining. An attribute never takes the rest of the program.

## Attributes

**On a cell** — `text`, `assess`, and the presentation attributes below.
**On a column or row** — the presentation attributes, plus `assess` to set defaults for the
cells in it.
**On the sheet** — `title`, `instructions`, `hide-formulabar`, and the `columns` / `rows` /
`cells` blocks.

Presentation: `width`, `align`, `background-color`, `font-weight`, `font-size`, `font-family`,
`font-style`, `color`, `text-decoration`, `border`, `vertical-align`, `format`, `protected`.

Values are CSS, written as strings, and `width` is the exception at a bare number:

```
column A [width 200]
cell A1 [font-size "14px" font-weight "bold" color "#1a2744" background-color "#eee"]
```

**A size needs its unit.** `font-size "14px"` renders; `font-size "16"` and `font-size 16` are
both compile errors, because a bare number is not a CSS size and a browser discards it silently.

An attribute a container does not accept is a compile error naming what it does take, so put
each attribute on the thing it describes: `width` belongs to a column, not to the sheet.

## Cell text and formulas

`text` holds either a literal value or a formula beginning with `=`:

```
cell A4 [text "=ROUND(SUM(A1:A3),1)"]
```

Available in formulas: `SUM`, `AVERAGE`, `ROUND`, `IF`, and arithmetic.

## Assessed cells

An assessed cell is a blank cell with an `assess` attribute list:

```
cell B2 [text "" assess [method "value" expected "836"]]
```

- `method "value"` compares what the learner enters to `expected`.
- `expected` may be a literal (`"836"`) or a formula (`"=A1+C1"`), evaluated at scoring time
  against the current cell values — which is what makes parameterized items work.
- `points` sets what a correct cell is worth. Omitting it is the same as `points 1`. It may be
  fractional, and `points 0` marks a cell that is checked but scores nothing. It can be set on a
  row or column instead, and each cell inherits it — cell beats row beats column.

Each assessed cell is scored independently and the results are summed, so partial credit is the
default behaviour rather than something to switch on.

## Parameterized sheets

`params` supplies values that vary per render, and goes after the `sheets` list:

```
sheets [
  sheet "s1" [
    cells [
      cell A1 [text "{{A1}}"]
      cell A2 [text "" assess [method "value" expected "=A1*2"]]
    ] {}
  ]
] params {
  "A1": "10..50:10"
} {
  "v": "0.0.1"
}..
```

**Params keys are quoted strings.** A value is a literal, a comma-separated list of choices
(`"pigs, chickens, cows"`), or a range `start..stop:step` (`"1000..2000:500"`). Cells reference
a param with `{{NAME}}`.

## Conventions

- Address cells as `A1`, columns as `A`, rows as a number (`row 1`) or a quoted region
  (`row "*"` for every row).
- End the program with the version record and `..`: `] {\n  "v": "0.0.1"\n}..`
- Give the sheet a short id: `sheet "s1"`.
