<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Graffiticode L0179 Vocabulary

L0179 is an authoring language for interactive spreadsheets. A primary use case is
spreadsheet-based assessment — cells that grade student-entered values or formulas against an
expected answer, optionally with parameterized inputs that vary per render. L0179 also supports
display and worksheet modes without grading.

L0179 emits the same compiled form as L0166 and differs only in how source is written: attributes
are collected in a bracket list rather than chained. See
`console/docs/language-authoring-style.md`.

## Structure

A program is a `sheets` list holding one `sheet`, and the sheet's body is an attribute list.

```
sheets [
  sheet "s1" [
    title "Quarterly Totals"
    columns [
      column A [width 200 align "right"]
    ] {}
    cells [
      cell A1 [text "Revenue" font-weight "bold"]
      cell A2 [text "=SUM(B2:B4)"]
    ] {}
  ]
] {
  "v": "0.0.1"
}..
```

| Word | Form | Description |
| :--- | :--- | :---------- |
| `sheets` | member list | The program's sheets, plus a configuration record. Exactly one sheet is supported. |
| `sheet` | keyed entry | An id and the sheet's attribute list. |
| `cells` / `columns` / `rows` | member list | The cells, columns, or row regions, plus a configuration record. |
| `cell` / `column` / `row` | keyed entry | An address and its attribute list. |
| `assess` | attribute list | Grading rules for a cell, column, or row. |
| `params` | chaining attribute | Per-render values; follows the `sheets` list. |

## Attributes

Written inside a `[...]` list as a word applied to a value. Order does not matter.

| Attribute | Applies to | Description |
| :-------- | :--------- | :---------- |
| `text` | cell | The cell's content: a literal, or a formula starting with `=`. |
| `width` | column | Column width in pixels. |
| `align` | cell, column, row | `left`, `right`, `center`, `justify`. |
| `background-color`, `color` | cell, column, row | Fill and text color. |
| `font-weight`, `font-size`, `font-family`, `font-style` | cell, column, row | Type. |
| `text-decoration`, `vertical-align`, `border` | cell, column, row | Presentation. |
| `format` | cell, column, row | A number format, e.g. `"#,##0.00"`. |
| `protected` | cell, column, row | When true the learner cannot edit the cell. |
| `title`, `instructions` | sheet | Text shown above the grid. |
| `hide-formulabar` | sheet | Hides the `fx` input above the grid. |

An attribute a container does not accept is a compile error naming what that container takes.

### assess

Grading rules for a cell. Also settable on a column or row, where the cells inherit it.

```
cell B2 [text "" assess [method "value" expected "836" points 2]]
```

| Member | Description |
| :----- | :---------- |
| `method` | `"value"` compares the entered value to `expected`. |
| `expected` | A literal (`"836"`) or a formula (`"=A1+C1"`) evaluated at scoring time. |
| `points` | What a correct cell is worth. Default 1. Fractions allowed; `points 0` is checked but unscored. |

Points precedence is cell, then row, then column. Every assessed cell is scored independently
and the results summed, so partial credit is the default rather than a mode.

### params

Per-render values, written after the `sheets` list. Keys are quoted cell addresses; a cell reads
one with `{{NAME}}`.

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

A value is a literal, a comma-separated choice list (`"pigs, chickens, cows"`), or a range
`start..stop:step`.

## Formula functions

Available inside a `text` or `expected` value that begins with `=`.

| Function | Syntax | Description |
| :------- | :----- | :---------- |
| `SUM` | `=SUM(A1:A10)` | Adds numeric values in a range. |
| `AVERAGE` | `=AVERAGE(A1:A10)` | Arithmetic mean. |
| `ROUND` | `=ROUND(A1,2)` | Rounds to a number of decimal places. |
| `IF` | `=IF(A1,B1,C1)` | Conditional value. |

## Examples

### A display grid

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150]
      column B [width 100 align "right"]
    ] {}
    cells [
      cell A1 [text "Item" font-weight "bold"]
      cell B1 [text "Value" font-weight "bold"]
      cell A2 [text "Alpha"]
      cell B2 [text "10.0" format "#,##0.0"]
    ] {}
  ]
] {
  "v": "0.0.1"
}..
```

### An assessed formula cell

```
sheets [
  sheet "s1" [
    cells [
      cell A1 [text "10"]
      cell A2 [text "20"]
      cell A3 [text "30"]
      cell A4 [text "" assess [method "value" expected "=SUM(A1:A3)"]]
    ] {}
  ]
] {
  "v": "0.0.1"
}..
```

### Weighted cells with row inheritance

```
sheets [
  sheet "s1" [
    rows [
      row 2 [assess [points 2]]
    ] {}
    cells [
      cell A1 [text "Employee" font-weight "bold"]
      cell B1 [text "Gross Pay" font-weight "bold"]
      cell A2 [text "Nakamura"]
      cell B2 [text "" assess [method "value" expected "836"]]
    ] {}
  ]
] {
  "v": "0.0.1"
}..
```
