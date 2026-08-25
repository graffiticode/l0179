<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0179 Training Examples

Prompt/program pairs for retrieval. Every program here was produced by translating an L0166
program from the shared corpus and verifying that both compile to identical output
(packages/core/tools/differential-test.mjs), so the behaviour is measured rather than assumed.

## Example 1

### Prompt

Put values 10.333, 20.667, and 30.111 in A1 through A3. Add a formula in A4 that sums them and rounds to 1 decimal place.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "10.333"]
      cell A2 [text "20.667"]
      cell A3 [text "30.111"]
      cell A4 [text "=ROUND(SUM(A1:A3),1)"]
      cell B1 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 2

### Prompt

Create a cell with vertically centered content.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [vertical-align "middle"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 3

### Prompt

Create a cell that displays text in a monospace font.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [font-family "monospace"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 4

### Prompt

Create a spreadsheet with a bold header row, data rows with values in column B, and an AVERAGE formula at the bottom. Center-align column B and format it with one decimal place.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "left"]
      column B [width 150 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#DDDDDD"]
    ] {}
    cells [
      cell A1 [text "Item"]
      cell B1 [text "Value"]
      cell A2 [text "Alpha"]
      cell B2 [text "10.0" format "#,##0.0"]
      cell A3 [text "Beta"]
      cell B3 [text "20.0" format "#,##0.0"]
      cell A4 [text "Gamma"]
      cell B4 [text "30.0" format "#,##0.0"]
      cell A5 [text "Delta"]
      cell B5 [text "40.0" format "#,##0.0"]
      cell A6 [text "Average" font-weight "bold"]
      cell B6 [text "=AVERAGE(B2:B5)" format "#,##0.0"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 5

### Prompt

Make a 2 by 2 empty grid.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 6

### Prompt

Create a spreadsheet with a title, instructions, params for 5 rows of question text in column A, blank assessed cells in column B with expected answers, a formula row at the bottom computing a percentage, a bold header row, borders between each question row, right-aligned score column, and number format on the percentage cell.

### Code

```
sheets [
  sheet "s1" [
    title "Quiz Assessment"
    instructions "\n- Read each question carefully.\n- Enter your answer in the blank cell in column B.\n- Your score will be calculated automatically at the bottom.\n- Press submit when finished.\n"
    columns [
      column A [width 350 align "left"]
      column B [width 150 align "right"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#DDDDDD"]
    ] {}
    cells [
      cell A1 [text "Question" font-weight "bold"]
      cell B1 [text "Your Answer" font-weight "bold"]
      cell A2 [text "1. {{A2}}" border "bottom"]
      cell B2 [text "" assess [method "value" expected "Answer1"] border "bottom" align "right"]
      cell A3 [text "2. {{A3}}" border "bottom"]
      cell B3 [text "" assess [method "value" expected "Answer2"] border "bottom" align "right"]
      cell A4 [text "3. {{A4}}" border "bottom"]
      cell B4 [text "" assess [method "value" expected "Answer3"] border "bottom" align "right"]
      cell A5 [text "4. {{A5}}" border "bottom"]
      cell B5 [text "" assess [method "value" expected "Answer4"] border "bottom" align "right"]
      cell A6 [text "5. {{A6}}" border "bottom"]
      cell B6 [text "" assess [method "value" expected "Answer5"] border "bottom" align "right"]
      cell A7 [text ""]
      cell A8 [text "Score (% Correct)" font-weight "bold"]
      cell B8 [text "=COUNTIF(B2:B6,{\"Answer1\",\"Answer2\",\"Answer3\",\"Answer4\",\"Answer5\"})/5*100" font-weight "bold" format "#,##0.00" align "right"]
    ] {}
  ]
] params {"A6": "Question 5 text" "A5": "Question 4 text" "A4": "Question 3 text" "A3": "Question 2 text" "A2": "Question 1 text"} {"v": "0.0.1"}..
```

## Example 7

### Prompt

column a align center

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 8

### Prompt

Create an assessed cell where acceptable answers are in the range 100 to 200 with a step of 50.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [assess [method "value" expected "100,150,200"]]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 9

### Prompt

Make a 6-row spreadsheet where even rows (2, 4, 6) have a light gray background and odd rows are white.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [background-color "#ffffff"]
      row 2 [background-color "#d3d3d3"]
      row 3 [background-color "#ffffff"]
      row 4 [background-color "#d3d3d3"]
      row 5 [background-color "#ffffff"]
      row 6 [background-color "#d3d3d3"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
      cell A3 []
      cell B3 []
      cell A4 []
      cell B4 []
      cell A5 []
      cell B5 []
      cell A6 []
      cell B6 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 10

### Prompt

Make a cell with underlined text that says "Click Here".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Click Here" text-decoration "underline"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 11

### Prompt

set column a width 150 left aligned column b 200 width right aligned column c width 100 center aligned

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "left"]
      column B [width 200 align "right"]
      column C [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell C1 []
      cell A2 []
      cell B2 []
      cell C2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 12

### Prompt

Create a cell in A1 that contains the text "The quick brown fox jumps over the lazy dog".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "left"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "The quick brown fox jumps over the lazy dog"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 13

### Prompt

Create a spreadsheet with a title, instructions, params for two input values displayed in row 1, two assessed blank cells in rows 2 and 3 expecting computed results, protected cells on the instruction labels, and a light yellow background on the input cells.

### Code

```
sheets [
  sheet "s1" [
    title "Input & Computation Practice"
    instructions "\n- Two input values are pre-filled in row 1 via params.\n- Enter the sum of the two values in cell A2.\n- Enter the product of the two values in cell B2.\n- Assessed cells will be validated automatically.\n"
    columns [
      column A [width 150 align "center"]
      column B [width 150 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold"]
    ] {}
    cells [
      cell A1 [text "{{A1}}" background-color "#FFFACD"]
      cell B1 [text "{{B1}}" background-color "#FFFACD"]
      cell A2 [text "" assess [method "value" expected "20"]]
      cell B2 [text "" assess [method "value" expected "96"]]
    ] {}
  ]
] params {"B1": "8" "A1": "12"} {"v": "0.0.1"}..
```

## Example 14

### Prompt

Create a spreadsheet template where cells display parameter values using template syntax.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 [text "{{B1}}"]
      cell A2 [text "{{A2}}"]
      cell B2 [text "{{B2}}"]
    ] {}
  ]
] params {"B2": "Value B2" "A2": "Value A2" "B1": "Value B1" "A1": "Value A1"} {"v": "0.0.1"}..
```

## Example 15

### Prompt

Update the code for column A using these property values:
```json
{
  "align": "",
  "width": 0
}
```
Note: Only the properties shown above have changed and need to be updated. Empty strings ("") mean the property should be cleared/removed.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A []
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 16

### Prompt

Create a spreadsheet titled "Quiz Instructions" with these instructions: "Read each question carefully. Enter your answer in the blank cell. Press submit when finished." Leave the grid empty.

### Code

```
sheets [
  sheet "s1" [
    title "Quiz Instructions"
    instructions "\nRead each question carefully. Enter your answer in the blank cell. Press submit when finished.\n"
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell B1 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 17

### Prompt

make row 1 protected

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [protected true]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 18

### Prompt

Create a cell formatted to display numbers with two decimal places and thousand separators.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "1234567.89" format "#,##0.00"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 19

### Prompt

Create a spreadsheet with two columns. Column A header is "Item" and column B header is "Price". Make both headers bold.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Item" font-weight "bold"]
      cell B1 [text "Price" font-weight "bold"]
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 20

### Prompt

make a simple income statement assessment

### Code

```
sheets [
  sheet "s1" [
    title "Income Statement Assessment"
    instructions "\n- Calculate the missing values in the income statement\n- Fill in Net Sales, Gross Profit, Operating Income, and Net Income\n"
    columns [
      column A [width 200 align "left"]
      column B [width 120 align "right" format "($#,##0)"]
    ] {}
    cells [
      cell A1 [text "INCOME STATEMENT" font-weight "bold"]
      cell B1 [text "Amount ($)" font-weight "bold"]
      cell A2 [text "Revenue" font-weight "bold"]
      cell B2 [text "50000"]
      cell A3 [text "Sales Returns"]
      cell B3 [text "2000"]
      cell A4 [text "Net Sales" font-weight "bold"]
      cell B4 [text "" assess [method "value" expected "48000"]]
      cell A5 [text "Cost of Goods Sold"]
      cell B5 [text "30000"]
      cell A6 [text "Gross Profit" font-weight "bold"]
      cell B6 [text "" assess [method "value" expected "18000"]]
      cell A7 [text "Operating Expenses:" font-weight "bold"]
      cell A8 [text "  Salaries"]
      cell B8 [text "8000"]
      cell A9 [text "  Rent"]
      cell B9 [text "3000"]
      cell A10 [text "  Utilities"]
      cell B10 [text "1000"]
      cell A11 [text "Total Operating Expenses"]
      cell B11 [text "12000"]
      cell A12 [text "Operating Income" font-weight "bold"]
      cell B12 [text "" assess [method "value" expected "6000"]]
      cell A13 [text "Interest Expense"]
      cell B13 [text "500"]
      cell A14 [text "Income Before Tax"]
      cell B14 [text "5500"]
      cell A15 [text "Income Tax (20%)"]
      cell B15 [text "1100"]
      cell A16 [text "Net Income" font-weight "bold"]
      cell B16 [text "" assess [method "value" expected "4400"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 21

### Prompt

Make a spreadsheet with column A styled in italic.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center" font-style "italic"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 22

### Prompt

make column a bold

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center" font-weight "bold"]
    ] {}
    rows [
      row 1 [background-color "#eee"]
    ] {}
    cells [
      cell A1 [text "A1"]
      cell A2 [text "A2"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 23

### Prompt

Update the code for column A using these property values:
```json
{"align":"right"}
```
Note: Only the properties shown above have changed and need to be updated.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "right"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 24

### Prompt

Create a four-column spreadsheet with a header row, 4 data rows, and a SUM total row. Column D computes row totals. Use bold headers and a bottom border on the header row.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "center"]
      column B [width 150 align "center"]
      column C [width 150 align "center"]
      column D [width 150 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" border "bottom"]
    ] {}
    cells [
      cell A1 [text "Category"]
      cell B1 [text "Q1"]
      cell C1 [text "Q2"]
      cell D1 [text "Total"]
      cell A2 [text "Alpha"]
      cell B2 [text "100"]
      cell C2 [text "200"]
      cell D2 [text "=SUM(B2:C2)"]
      cell A3 [text "Beta"]
      cell B3 [text "150"]
      cell C3 [text "250"]
      cell D3 [text "=SUM(B3:C3)"]
      cell A4 [text "Gamma"]
      cell B4 [text "120"]
      cell C4 [text "180"]
      cell D4 [text "=SUM(B4:C4)"]
      cell A5 [text "Delta"]
      cell B5 [text "90"]
      cell C5 [text "310"]
      cell D5 [text "=SUM(B5:C5)"]
      cell A6 [text "Total" font-weight "bold"]
      cell B6 [text "=SUM(B2:B5)" font-weight "bold"]
      cell C6 [text "=SUM(C2:C5)" font-weight "bold"]
      cell D6 [text "=SUM(D2:D5)" font-weight "bold"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 25

### Prompt

Create a spreadsheet where the entire first row is bold.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 26

### Prompt

give column a a large width

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 500 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 27

### Prompt

Create a spreadsheet with a mix of display-only cells showing instructions and assessed input cells. Column A has the labels "2+3=", "7-4=", and "3x2=". Column B has blank assessed cells expecting 5, 3, and 6.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "2+3="]
      cell B1 [text "" assess [method "value" expected "5"]]
      cell A2 [text "7-4="]
      cell B2 [text "" assess [method "value" expected "3"]]
      cell A3 [text "3x2="]
      cell B3 [text "" assess [method "value" expected "6"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 28

### Prompt

Create a spreadsheet with a title, 4 columns (Description, Qty, Unit Price, Line Total), 3 data rows with cross-column multiplication formulas in column D, and a SUM grand total. Use bold headers and right-align the numeric columns.

### Code

```
sheets [
  sheet "s1" [
    title "Sales Invoice"
    columns [
      column A [width 200 align "left"]
      column B [width 80 align "center"]
      column C [width 120 align "right"]
      column D [width 120 align "right"]
    ] {}
    cells [
      cell A1 [text "Description" font-weight "bold" background-color "#DDDDDD"]
      cell B1 [text "Qty" font-weight "bold" background-color "#DDDDDD"]
      cell C1 [text "Unit Price" font-weight "bold" background-color "#DDDDDD"]
      cell D1 [text "Line Total" font-weight "bold" background-color "#DDDDDD"]
      cell A2 [text "Widget A"]
      cell B2 [text "5"]
      cell C2 [text "25" format "$#,##0.00"]
      cell D2 [text "=B2*C2" format "$#,##0.00"]
      cell A3 [text "Widget B"]
      cell B3 [text "3"]
      cell C3 [text "75" format "$#,##0.00"]
      cell D3 [text "=B3*C3" format "$#,##0.00"]
      cell A4 [text "Widget C"]
      cell B4 [text "10"]
      cell C4 [text "12" format "$#,##0.00"]
      cell D4 [text "=B4*C4" format "$#,##0.00"]
      cell A6 [text "Grand Total" font-weight "bold" align "right"]
      cell D6 [text "=SUM(D2:D4)" font-weight "bold" format "$#,##0.00" background-color "#FFFFCC"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 29

### Prompt

Create a column of five input cells where the expected answers are Mon, Tue, Wed, Thu, Fri.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "Mon"]]
      cell A2 [text "" assess [method "value" expected "Tue"]]
      cell A3 [text "" assess [method "value" expected "Wed"]]
      cell A4 [text "" assess [method "value" expected "Thu"]]
      cell A5 [text "" assess [method "value" expected "Fri"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 30

### Prompt

Create a spreadsheet with row formatting on row 1 (bold, background color) and column formatting on column B (right-aligned, number format). Fill in a 4-row data set with a SUM at the bottom.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "left"]
      column B [width 150 align "right" format "#,##0.00"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#4472C4" color "#ffffff"]
    ] {}
    cells [
      cell A1 [text "Item"]
      cell B1 [text "Amount"]
      cell A2 [text "Rent"]
      cell B2 [text "1200.00"]
      cell A3 [text "Utilities"]
      cell B3 [text "350.00"]
      cell A4 [text "Groceries"]
      cell B4 [text "475.00"]
      cell A5 [text "Transportation"]
      cell B5 [text "220.00"]
      cell A6 [text "Total" font-weight "bold"]
      cell B6 [text "=SUM(B2:B5)" font-weight "bold"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 31

### Prompt

Create a spreadsheet with a single empty cell.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
    ] {}
    cells [
      cell A1 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 32

### Prompt

Put values 10, 20, and 30 in A1 through A3. Assess cell A4 expecting the student to enter the formula =SUM(A1:A3).

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "10"]
      cell A2 [text "20"]
      cell A3 [text "30"]
      cell A4 [text "" assess [method "formula" expected "=SUM(A1:A3)"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 33

### Prompt

Create a 3 by 3 grid where every cell is assessed. The expected values are 1 through 9 reading left to right, top to bottom.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "1"]]
      cell B1 [text "" assess [method "value" expected "2"]]
      cell C1 [text "" assess [method "value" expected "3"]]
      cell A2 [text "" assess [method "value" expected "4"]]
      cell B2 [text "" assess [method "value" expected "5"]]
      cell C2 [text "" assess [method "value" expected "6"]]
      cell A3 [text "" assess [method "value" expected "7"]]
      cell B3 [text "" assess [method "value" expected "8"]]
      cell C3 [text "" assess [method "value" expected "9"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 34

### Prompt

Create two input cells. Cell A1 should expect the answer "Hello" and cell A2 should expect "World".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "Hello"]]
      cell B1 []
      cell A2 [text "" assess [method "value" expected "World"]]
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 35

### Prompt

Create a row of five input cells where the expected answers are 2, 4, 6, 8, 10.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
      column D [width 100 align "center"]
      column E [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "2"]]
      cell B1 [text "" assess [method "value" expected "4"]]
      cell C1 [text "" assess [method "value" expected "6"]]
      cell D1 [text "" assess [method "value" expected "8"]]
      cell E1 [text "" assess [method "value" expected "10"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 36

### Prompt

set column a to width 200

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 200 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 37

### Prompt

make a table with a single cell with an assessment

### Code

```
sheets [
  sheet "s1" [
    columns [
      column "A" [width 50]
    ] {}
    cells [
      cell A1 [text "20" assess [method "value" expected "20"]]
    ] {}
  ]
] {"v": "0.0.3"}..
```

## Example 38

### Prompt

Create a parameterized spreadsheet where A1 and A2 are filled by params and A3 is an assessed SUM formula cell expecting the correct total.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 []
      cell A2 [text "{{A2}}"]
      cell B2 []
      cell A3 [text "=SUM(A1:A2)" assess [method "formula" expected "=SUM(A1:A2)"]]
    ] {}
  ]
] params {"A2": "200" "A1": "100"} {"v": "0.0.1"}..
```

## Example 39

### Prompt

Create a spreadsheet with two sections separated by a border row. The top section has 3 data rows with a SUM subtotal. The bottom section has 2 data rows with a SUM subtotal. Add a final row that sums both subtotals. Bold the subtotal and total rows.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "center"]
      column B [width 150 align "center"]
    ] {}
    rows [
      row 5 [font-weight "bold"]
      row 9 [font-weight "bold"]
      row 11 [font-weight "bold"]
    ] {}
    cells [
      cell A1 [text "Label" font-weight "bold"]
      cell B1 [text "Value" font-weight "bold"]
      cell A2 [text "Item 1"]
      cell B2 [text "100"]
      cell A3 [text "Item 2"]
      cell B3 [text "200"]
      cell A4 [text "Item 3"]
      cell B4 [text "300"]
      cell A5 [text "Subtotal 1"]
      cell B5 [text "=SUM(B2:B4)"]
      cell A6 [text "---" border "top,bottom"]
      cell B6 [text "---" border "top,bottom"]
      cell A7 [text "Item 4"]
      cell B7 [text "400"]
      cell A8 [text "Item 5"]
      cell B8 [text "500"]
      cell A9 [text "Subtotal 2"]
      cell B9 [text "=SUM(B7:B8)"]
      cell A10 [text ""]
      cell B10 [text ""]
      cell A11 [text "Total"]
      cell B11 [text "=SUM(B5,B9)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 40

### Prompt

Make a spreadsheet where row 3 text is colored red.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 3 [color "red"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
      cell A3 []
      cell B3 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 41

### Prompt

remove width from column a

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 42

### Prompt

Create a spreadsheet with parameters providing two input numbers in A1 and A2, and a SUM formula in A3 that adds them.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell A2 [text "{{A2}}"]
      cell A3 [text "=SUM(A1:A2)"]
    ] {}
  ]
] params {"A2": "20" "A1": "10"} {"v": "0.0.1"}..
```

## Example 43

### Prompt

Create a cell assessed with the value method where the expected answer is "Springfield".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [assess [method "value" expected "Springfield"]]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 44

### Prompt

Make a cell that has italic text with a strikethrough decoration.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [font-style "italic" text-decoration "line-through"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 45

### Prompt

Create a spreadsheet with a title, instructions, params providing input values for 3 rows, AVERAGE formulas in the last column, ROUND to 2 decimal places on the averages, assessed average cells, a bold header row with background color, and center-aligned columns.

### Code

```
sheets [
  sheet "s1" [
    title "Student Performance Tracker"
    instructions "\n- Enter each student's name in column A.\n- Scores for each subject are pre-filled via params — update as needed.\n- The Average column (column E) calculates the rounded mean of the three scores.\n- Assessed average cells will be validated automatically.\n- Bold headers with background color indicate column labels.\n"
    columns [
      column A [width 180 align "center"]
      column B [width 120 align "center"]
      column C [width 120 align "center"]
      column D [width 120 align "center"]
      column E [width 140 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#2C3E50" color "#FFFFFF"]
    ] {}
    cells [
      cell A1 [text "Student Name"]
      cell B1 [text "Score 1"]
      cell C1 [text "Score 2"]
      cell D1 [text "Score 3"]
      cell E1 [text "Average"]
      cell A2 [text "{{A2}}"]
      cell B2 [text "{{B2}}"]
      cell C2 [text "{{C2}}"]
      cell D2 [text "{{D2}}"]
      cell E2 [text "=ROUND(AVERAGE(B2:D2),2)" assess [method "formula" expected "=ROUND(AVERAGE(B2:D2),2)"]]
      cell A3 [text "{{A3}}"]
      cell B3 [text "{{B3}}"]
      cell C3 [text "{{C3}}"]
      cell D3 [text "{{D3}}"]
      cell E3 [text "=ROUND(AVERAGE(B3:D3),2)" assess [method "formula" expected "=ROUND(AVERAGE(B3:D3),2)"]]
      cell A4 [text "{{A4}}"]
      cell B4 [text "{{B4}}"]
      cell C4 [text "{{C4}}"]
      cell D4 [text "{{D4}}"]
      cell E4 [text "=ROUND(AVERAGE(B4:D4),2)" assess [method "formula" expected "=ROUND(AVERAGE(B4:D4),2)"]]
    ] {}
  ]
] params {"D4": "89" "C4": "91" "B4": "95" "A4": "Carol White" "D3": "74" "C3": "80" "B3": "76" "A3": "Bob Smith" "D2": "85" "C2": "92" "B2": "88" "A2": "Alice Johnson"} {"v": "1"}..
```

## Example 46

### Prompt

Create a cell with a solid black border on all sides.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [border "1px solid black"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 47

### Prompt

Make a spreadsheet with cells showing 25%, 50%, and 75%.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "25%"]
      cell A2 [text "50%"]
      cell A3 [text "75%"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 48

### Prompt

Make a cell with red text that says "Warning".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Warning" color "red"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 49

### Prompt

Create an assessed cell where the expected answer is -25.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 [assess [method "value" expected "-25"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 50

### Prompt

Create a spreadsheet with values 10, 20, 30, 40, 50 in cells A1 through A5, and put a SUM formula in A6 that totals them.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "10"]
      cell A2 [text "20"]
      cell A3 [text "30"]
      cell A4 [text "40"]
      cell A5 [text "50"]
      cell A6 [text "=SUM(A1:A5)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 51

### Prompt

Create a cell with a light blue background color.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [background-color "#ADD8E6"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 52

### Prompt

make row 1 bold

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 53

### Prompt

give row 1 the height of 24px

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-size "24px"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 54

### Prompt

Create a spreadsheet with a parameter that populates cell A1 with "Hello".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] params {"A1": "Hello, Goodbye, Foo"} {"v": "0.0.1"}..
```

## Example 55

### Prompt

Update the code for column A using these property values:
```json
{"width":500}
```
Note: Only the properties shown above have changed and need to be updated.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 500 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 56

### Prompt

Create a data table with 5 rows. Column A has names: Tom, Sara, Mike, Lily, Jake. Column B has ages: 25, 32, 28, 19, 41.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "left"]
      column B [width 100 align "right"]
    ] {}
    cells [
      cell A1 [text "Name" font-weight "bold"]
      cell B1 [text "Age" font-weight "bold"]
      cell A2 [text "Tom"]
      cell B2 [text "25"]
      cell A3 [text "Sara"]
      cell B3 [text "32"]
      cell A4 [text "Mike"]
      cell B4 [text "28"]
      cell A5 [text "Lily"]
      cell B5 [text "19"]
      cell A6 [text "Jake"]
      cell B6 [text "41"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 57

### Prompt

Make a cell with 16 pixel font size that says "Big Text".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Big Text" font-size "16px"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 58

### Prompt

align cell a1 right

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [align "right"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 59

### Prompt

make column a right align with width 150 and column b left align with width 50

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "right"]
      column B [width 50 align "left"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 60

### Prompt

Create a parameterized quiz where param values provide the questions in column A and the assessed answer cells in column B expect specific values.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 200 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 [text "" assess [method "value" expected "{{B1}}"]]
      cell A2 [text "{{A2}}"]
      cell B2 [text "" assess [method "value" expected "{{B2}}"]]
      cell A3 [text "{{A3}}"]
      cell B3 [text "" assess [method "value" expected "{{B3}}"]]
      cell A4 [text "{{A4}}"]
      cell B4 [text "" assess [method "value" expected "{{B4}}"]]
    ] {}
  ]
] params {"B4": "4" "A4": "What is 8/2?" "B3": "5" "A3": "What is 10-5?" "B2": "9" "A2": "What is 3x3?" "B1": "4" "A1": "What is 2+2?"} {"v": "0.0.1"}..
```

## Example 61

### Prompt

Make a spreadsheet with a single center-aligned column.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 62

### Prompt

format column A using ($#,##0)

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center" format "($#,##0)"]
    ] {}
    rows [
      row 1 [background-color "#eee"]
    ] {}
    cells [
      cell A1 [text "10000"]
      cell A2 [text "-10000"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 63

### Prompt

Create a four-column spreadsheet with columns A through D, all 100 pixels wide.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
      column B [width 100]
      column C [width 100]
      column D [width 100]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell C1 []
      cell D1 []
      cell A2 []
      cell B2 []
      cell C2 []
      cell D2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 64

### Prompt

Make a spreadsheet with one column that is 200 pixels wide.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 200]
    ] {}
    cells [
      cell A1 []
      cell A2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 65

### Prompt

add row 2 with font height 24px

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    rows [
      row 1 [background-color "#eee"]
      row 2 [font-size "24px"]
    ] {}
    cells [
      cell A1 [text "A1"]
      cell A2 [text "A2" font-family "Arial" assess [method "value" expected "A2"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 66

### Prompt

Put three values in a single row: Red, Green, Blue.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Red"]
      cell B1 [text "Green"]
      cell C1 [text "Blue"]
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 67

### Prompt

Create a spreadsheet where column B has a light yellow background color.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center" background-color "#FFFFE0"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 68

### Prompt

Create a spreadsheet with three cells in column A containing the numbers 10, 20, and 30.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "10"]
      cell A2 [text "20"]
      cell A3 [text "30"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 69

### Prompt

Create a spreadsheet where cell A3 is assessed for the value "30" and cell B3 is assessed for the formula =SUM(B1:B2).

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
      cell A3 [assess [method "value" expected "30"]]
      cell B3 [assess [method "formula" expected "=SUM(B1:B2)"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 70

### Prompt

Create an assessed addition spreadsheet — two input values in row 1 and an assessed blank cell in row 2 expecting their sum — and hide the formula bar so students only see the cells.

### Code

```
sheets [
  sheet "s1" [
    hide-formulabar true
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "4"]
      cell B1 [text "7"]
      cell A2 [text "" assess [method "value" expected "=A1+B1"]]
    ] {}
  ]
] {v: "0.0.1"}..
```

## Example 71

### Prompt

Make a spreadsheet with three empty input cells in column A for user entry.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text ""]
      cell A2 [text ""]
      cell A3 [text ""]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 72

### Prompt

Create an input cell that is initially blank. The student must type 42 to get it correct.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "42"]]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 73

### Prompt

Create a vertical list in column A with three items: Apple, Banana, Cherry.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Apple"]
      cell A2 [text "Banana"]
      cell A3 [text "Cherry"]
      cell B1 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 74

### Prompt

create a simple home budget assessment

### Code

```
sheets [
  sheet "s1" [
    title ""
    columns [
      column A [width 150 align "left"]
      column B [width 100 format "($#,##0)"]
      column C [width 250 align "left"]
    ] {}
    cells [
      cell A1 [text "CATEGORY" font-weight "bold"]
      cell B1 [text "AMOUNT" font-weight "bold"]
      cell C1 [text "DETAILS" font-weight "bold"]
      cell A2 [text "Income"]
      cell B2 [text "5000"]
      cell C2 [text "Total monthly income"]
      cell A3 [text "Rent"]
      cell B3 [text "" assess [method "formula" expected "=B2*0.35"]]
      cell C3 [text "35% of your total income"]
      cell A4 [text "Utilities"]
      cell B4 [text "200"]
      cell C4 [text "Fixed expense"]
      cell A5 [text "Food"]
      cell B5 [text "" assess [method "formula" expected "=B2*0.15"]]
      cell C5 [text "15% of your total income"]
      cell A6 [text "Transportation"]
      cell B6 [text "" assess [method "formula" expected "=B2*0.10"]]
      cell C6 [text "10% of your total income"]
      cell A7 [text "Entertainment"]
      cell B7 [text "150"]
      cell C7 [text "Fixed expense"]
      cell A8 [text "Savings"]
      cell B8 [text "" assess [method "formula" expected "=B2*0.20"]]
      cell C8 [text "20% of your total income"]
      cell A9 [text "Miscellaneous"]
      cell B9 [text "" assess [method "formula" expected "=B2-SUM(B3:B8)"]]
      cell C9 [text "Remaining income after all other expenses"]
    ] {}
  ]
] {"v": "0.0.2"}..
```

## Example 75

### Prompt

Create a spreadsheet where the first row has a larger 14px font.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-size "14px"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 76

### Prompt

align column a and b to the right

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "right"]
      column B [width 100 align "right"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 77

### Prompt

make a single cell table

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
    ] {}
    cells [
      cell A1 [text "A1"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 78

### Prompt

Create a two-column label/value layout with 4 rows. Column A has bold labels, column B has values. The last row uses a formula to compute a result from the rows above.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "left"]
      column B [width 150 align "right"]
    ] {}
    cells [
      cell A1 [text "Value 1" font-weight "bold"]
      cell B1 [text "100"]
      cell A2 [text "Value 2" font-weight "bold"]
      cell B2 [text "200"]
      cell A3 [text "Value 3" font-weight "bold"]
      cell B3 [text "300"]
      cell A4 [text "Total" font-weight "bold"]
      cell B4 [text "=SUM(B1:B3)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 79

### Prompt

Create a two-column label/value spreadsheet with 3 input rows and a formula row. Use bold labels in column A, right-align column B, and add a border below the last input row to separate it from the total.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "left"]
      column B [width 150 align "right"]
    ] {}
    cells [
      cell A1 [text "Item 1" font-weight "bold"]
      cell B1 [text ""]
      cell A2 [text "Item 2" font-weight "bold"]
      cell B2 [text ""]
      cell A3 [text "Item 3" font-weight "bold" border "bottom"]
      cell B3 [text "" border "bottom"]
      cell A4 [text "Total" font-weight "bold"]
      cell B4 [text "=SUM(B1:B3)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 80

### Prompt

Update the code for column A using these property values:
```json
{"align":""}
```
Note: Only the properties shown above have changed and need to be updated. Empty strings ("") mean the property should be cleared/removed.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 81

### Prompt

Create a spreadsheet with a title, markdown instructions, two columns of given values, and a third column with assessed blank cells expecting computed results. Style the header row bold and center-align the value columns.

### Code

```
sheets [
  sheet "s1" [
    title "Addition Practice"
    instructions "\n- Look at the two values in columns A and B\n- Enter the sum of each row in column C\n- All answers should be whole numbers\n"
    columns [
      column A [width 120 align "center"]
      column B [width 120 align "center"]
      column C [width 120 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold"]
    ] {}
    cells [
      cell A1 [text "Value 1"]
      cell B1 [text "Value 2"]
      cell C1 [text "Sum"]
      cell A2 [text "12"]
      cell B2 [text "8"]
      cell C2 [text "" assess [method "value" expected "20"]]
      cell A3 [text "25"]
      cell B3 [text "17"]
      cell C3 [text "" assess [method "value" expected "42"]]
      cell A4 [text "34"]
      cell B4 [text "56"]
      cell C4 [text "" assess [method "value" expected "90"]]
      cell A5 [text "7"]
      cell B5 [text "93"]
      cell C5 [text "" assess [method "value" expected "100"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 82

### Prompt

Make a two-column layout where the first column is narrow (80px) for labels and the second column is wide (300px) for content.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 80 align "right"]
      column B [width 300 align "left"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 83

### Prompt

Put 100 in A1 and 200 in A2. Create a SUM formula cell in A3 and assess that the total equals 300.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "100"]
      cell A2 [text "200"]
      cell A3 [text "=SUM(A1:A2)" assess [method "value" expected "300"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 84

### Prompt

Create a spreadsheet with the title "Monthly Report" and an empty grid.

### Code

```
sheets [
  sheet "s1" [
    title "Monthly Report"
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 85

### Prompt

Create a header cell that is bold, blue text, 18px font size, with a light gray background.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [font-weight "bold" color "#0000FF" font-size "18px" background-color "#D3D3D3"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 86

### Prompt

Create a spreadsheet with date values: 2024-01-15, 2024-06-30, 2024-12-25

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "right"]
    ] {}
    cells [
      cell A1 [text "Date" font-weight "bold"]
      cell A2 [text "2024-01-15"]
      cell A3 [text "2024-06-30"]
      cell A4 [text "2024-12-25"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 87

### Prompt

Create a two-column spreadsheet where column A is 150 wide and column B is 250 wide.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "center"]
      column B [width 250 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 88

### Prompt

Make a spreadsheet with cells showing $1,000 and $2,500 and $10,000.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 120 align "right"]
    ] {}
    cells [
      cell A1 [text "1000" format "($#,##0)"]
      cell A2 [text "2500" format "($#,##0.00)"]
      cell A3 [text "10000" format "($#,##0.00)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 89

### Prompt

Make a cell that only has borders on the top and bottom.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [border "top,bottom"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 90

### Prompt

Create a spreadsheet where row 2 content is vertically aligned to the middle.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
    rows [
      row 2 [vertical-align "middle"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 91

### Prompt

Create a minimal empty spreadsheet template.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
      column B [width 100]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 92

### Prompt

column a align center

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "right"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 93

### Prompt

Put "Pass" in B1 and "Fail" in C1. Add an IF formula in D1 that displays B1 if A1 is true and C1 if false.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
      column D [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 [text "Pass"]
      cell C1 [text "Fail"]
      cell D1 [text "=IF(A1,B1,C1)"]
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 94

### Prompt

Create a spreadsheet with a dark bold header row and five plain data rows beneath it.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 150 align "center"]
      column B [width 150 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#222" color "#ffffff"]
    ] {}
    cells [
      cell A1 [text "Column A"]
      cell B1 [text "Column B"]
      cell A2 [text "Row 2A"]
      cell B2 [text "Row 2B"]
      cell A3 [text "Row 3A"]
      cell B3 [text "Row 3B"]
      cell A4 [text "Row 4A"]
      cell B4 [text "Row 4B"]
      cell A5 [text "Row 5A"]
      cell B5 [text "Row 5B"]
      cell A6 [text "Row 6A"]
      cell B6 [text "Row 6B"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 95

### Prompt

Create an assessed cell where the expected answer is 3.14.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [assess [method "value" expected "3.14"]]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 96

### Prompt

Create a two-column spreadsheet where column A has display-only labels and column B has blank assessed cells. Include 4 rows. Assess each B cell with the value method.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Label 1"]
      cell B1 [text "" assess [method "value" expected ""]]
      cell A2 [text "Label 2"]
      cell B2 [text "" assess [method "value" expected ""]]
      cell A3 [text "Label 3"]
      cell B3 [text "" assess [method "value" expected ""]]
      cell A4 [text "Label 4"]
      cell B4 [text "" assess [method "value" expected ""]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 97

### Prompt

Create two cells with values 10 and 20. Add a third cell assessed with the formula method where the student must enter the correct SUM formula.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "10"]
      cell A2 [text "20"]
      cell A3 [text "" assess [method "formula" expected "=SUM(A1:A2)"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 98

### Prompt

left align column A

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "left"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "A1"]
      cell B1 [text "B1"]
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 99

### Prompt

Put test scores 80, 90, 70, 85, 95 in B1 through B5. Assess cell B6 expecting the student to enter =AVERAGE(B1:B5).

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell B1 [text "80"]
      cell B2 [text "90"]
      cell B3 [text "70"]
      cell B4 [text "85"]
      cell B5 [text "95"]
      cell B6 [text "" assess [method "formula" expected "=AVERAGE(B1:B5)"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 100

### Prompt

Create a spreadsheet with values 5, 10, 15, 20 in cells A1 through A4. In column B, create a running total where each cell sums all values in column A from row 1 to the current row.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "5"]
      cell B1 [text "=SUM(A1:A1)"]
      cell A2 [text "10"]
      cell B2 [text "=SUM(A1:A2)"]
      cell A3 [text "15"]
      cell B3 [text "=SUM(A1:A3)"]
      cell A4 [text "20"]
      cell B4 [text "=SUM(A1:A4)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 101

### Prompt

Create a spreadsheet where row 1 is bold.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 102

### Prompt

Create a spreadsheet with prices in column A (10, 20, 30) and quantities in column B (2, 3, 1). In column C, put the formula to multiply each price by its quantity.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Price" font-weight "bold"]
      cell B1 [text "Quantity" font-weight "bold"]
      cell C1 [text "Total" font-weight "bold"]
      cell A2 [text "10"]
      cell B2 [text "2"]
      cell C2 [text "=A2*B2"]
      cell A3 [text "20"]
      cell B3 [text "3"]
      cell C3 [text "=A3*B3"]
      cell A4 [text "30"]
      cell B4 [text "1"]
      cell C4 [text "=A4*B4"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 103

### Prompt

Create a cell where the student must enter the value 100. Validate their answer.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "" assess [method "value" expected "100"]]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 104

### Prompt

Create a spreadsheet with a title, instructions, 3 sections with borders between them, SUM formulas for section subtotals, a final total row using SUM of subtotals, an IF formula that displays "Positive" or "Negative" based on the result, number formatting on value cells, bold on total rows, and an assessed cell on the final total.

### Code

```
sheets [
  sheet "s1" [
    title "Multi-Section Budget Summary"
    instructions "\n- Review each section and verify the values entered.\n- Section subtotals are calculated automatically using SUM formulas.\n- The Final Total combines all section subtotals.\n- The Status column will display \"Positive\" or \"Negative\" based on the final total.\n"
    columns [
      column A [width 220 align "left"]
      column B [width 160 align "right" format "#,##0.00"]
      column C [width 160 align "left"]
    ] {}
    cells [
      cell A1 [text "MULTI-SECTION BUDGET SUMMARY" font-weight "bold" font-size "16px"]
      cell B1 [text "Amount ($)" font-weight "bold"]
      cell A2 [text "SECTION 1: INCOME" font-weight "bold" background-color "#D9EAD3" border "bottom"]
      cell B2 [text "" background-color "#D9EAD3" border "bottom"]
      cell A3 [text "  Salary"]
      cell B3 [text "50000"]
      cell A4 [text "  Freelance"]
      cell B4 [text "12000"]
      cell A5 [text "  Investments"]
      cell B5 [text "8000"]
      cell A6 [text "Section 1 Subtotal" font-weight "bold" background-color "#B6D7A8" border "top,bottom"]
      cell B6 [text "=SUM(B3:B5)" font-weight "bold" background-color "#B6D7A8" border "top,bottom"]
      cell A7 [text ""]
      cell A8 [text "SECTION 2: FIXED EXPENSES" font-weight "bold" background-color "#FCE5CD" border "bottom"]
      cell B8 [text "" background-color "#FCE5CD" border "bottom"]
      cell A9 [text "  Rent"]
      cell B9 [text "15000"]
      cell A10 [text "  Insurance"]
      cell B10 [text "3600"]
      cell A11 [text "  Loan Repayment"]
      cell B11 [text "6000"]
      cell A12 [text "Section 2 Subtotal" font-weight "bold" background-color "#F9CB9C" border "top,bottom"]
      cell B12 [text "=SUM(B9:B11)" font-weight "bold" background-color "#F9CB9C" border "top,bottom"]
      cell A13 [text ""]
      cell A14 [text "SECTION 3: VARIABLE EXPENSES" font-weight "bold" background-color "#CFE2F3" border "bottom"]
      cell B14 [text "" background-color "#CFE2F3" border "bottom"]
      cell A15 [text "  Groceries"]
      cell B15 [text "4800"]
      cell A16 [text "  Entertainment"]
      cell B16 [text "2400"]
      cell A17 [text "  Utilities"]
      cell B17 [text "1800"]
      cell A18 [text "Section 3 Subtotal" font-weight "bold" background-color "#9FC5E8" border "top,bottom"]
      cell B18 [text "=SUM(B15:B17)" font-weight "bold" background-color "#9FC5E8" border "top,bottom"]
      cell A19 [text ""]
      cell A20 [text "FINAL TOTAL (Income - Expenses)" font-weight "bold" font-size "14px" background-color "#EAD1DC" border "top,bottom"]
      cell B20 [text "=B6-SUM(B12,B18)" font-weight "bold" font-size "14px" background-color "#EAD1DC" border "top,bottom" assess [method "value" expected "37400"]]
      cell C20 [text "=IF(B20>=0,\"Positive\",\"Negative\")" font-style "italic" font-weight "bold"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 105

### Prompt

Create a parameterized spreadsheet where A1 gets the number 42 and A2 gets 100 from parameters.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 []
      cell A2 [text "{{A2}}"]
      cell B2 []
    ] {}
  ]
] params {"A2": "100" "A1": "42"} {"v": "0.0.1"}..
```

## Example 106

### Prompt

Put 150 in A1 and 250 in A2. Add a SUM formula in A3.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "150"]
      cell B1 []
      cell A2 [text "250"]
      cell B2 []
      cell A3 [text "=SUM(A1:A2)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 107

### Prompt

Create a spreadsheet with two factors in columns A and B, and blank assessed product cells in column C. Include 4 rows. The assessed cells expect the correct multiplication result.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Factor 1" font-weight "bold"]
      cell B1 [text "Factor 2" font-weight "bold"]
      cell C1 [text "Product" font-weight "bold"]
      cell A2 [text "3"]
      cell B2 [text "4"]
      cell C2 [text "" assess [method "value" expected "12"]]
      cell A3 [text "7"]
      cell B3 [text "6"]
      cell C3 [text "" assess [method "value" expected "42"]]
      cell A4 [text "5"]
      cell B4 [text "8"]
      cell C4 [text "" assess [method "value" expected "40"]]
      cell A5 [text "9"]
      cell B5 [text "2"]
      cell C5 [text "" assess [method "value" expected "18"]]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 108

### Prompt

Make a spreadsheet with three cells containing the decimal values 3.14, 2.718, and 1.618.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "right"]
    ] {}
    cells [
      cell A1 [text "3.14"]
      cell A2 [text "2.718"]
      cell A3 [text "1.618"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 109

### Prompt

remove alignment on column b

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 110

### Prompt

make column C width 250

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 250]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
      cell C2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 111

### Prompt

Make a two-column spreadsheet with labels in column A (Name, Age, City) and values in column B (Alice, 30, Denver).

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Name" font-weight "bold"]
      cell B1 [text "Alice"]
      cell A2 [text "Age" font-weight "bold"]
      cell B2 [text "30"]
      cell A3 [text "City" font-weight "bold"]
      cell B3 [text "Denver"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 112

### Prompt

Make a spreadsheet where cell A1 is protected from editing.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [protected true]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 113

### Prompt

Create a header row with bold white text on a dark navy background, with 14px font size.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" color "white" background-color "#1a2744" font-size "14px"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 114

### Prompt

Put values 5, 10, and 15 in cells A1, B1, and C1. Add a SUM formula in D1 that adds the three values.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
      column C [width 100 align "center"]
      column D [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "5"]
      cell B1 [text "10"]
      cell C1 [text "15"]
      cell D1 [text "=SUM(A1:C1)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 115

### Prompt

Make a spreadsheet where row 1 has bold blue text and row 3 has italic red text.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" color "#0000FF"]
      row 3 [font-style "italic" color "#FF0000"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
      cell A3 []
      cell B3 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 116

### Prompt

Create a spreadsheet with a title, instructions, 4 columns with custom widths, a bold header row with background color, 4 data rows with alternating row colors, AVERAGE formulas in the last column, assessed blank cells for missing values, and center-aligned score columns.

### Code

```
sheets [
  sheet "s1" [
    title "Student Score Tracker"
    instructions "\n- Enter each student's scores in the Score columns (columns B, C, and D).\n- Leave any unknown scores blank — they will be assessed automatically.\n- The Average column (column E) will calculate each student's mean score.\n- Bold headers indicate column labels; alternating row colors help readability.\n"
    columns [
      column A [width 180 align "left"]
      column B [width 120 align "center"]
      column C [width 120 align "center"]
      column D [width 120 align "center"]
      column E [width 140 align "center"]
    ] {}
    rows [
      row 1 [font-weight "bold" background-color "#2C3E50" color "#FFFFFF"]
      row 2 [background-color "#F2F2F2"]
      row 3 [background-color "#FFFFFF"]
      row 4 [background-color "#F2F2F2"]
      row 5 [background-color "#FFFFFF"]
    ] {}
    cells [
      cell A1 [text "Student Name"]
      cell B1 [text "Score 1"]
      cell C1 [text "Score 2"]
      cell D1 [text "Score 3"]
      cell E1 [text "Average"]
      cell A2 [text "Alice Johnson"]
      cell B2 [text "88"]
      cell C2 [text "92"]
      cell D2 [text "" assess [method "value" expected "85"]]
      cell E2 [text "=AVERAGE(B2:D2)"]
      cell A3 [text "Bob Smith"]
      cell B3 [text "76"]
      cell C3 [text "" assess [method "value" expected "80"]]
      cell D3 [text "74"]
      cell E3 [text "=AVERAGE(B3:D3)"]
      cell A4 [text "Carol White"]
      cell B4 [text "" assess [method "value" expected "95"]]
      cell C4 [text "91"]
      cell D4 [text "89"]
      cell E4 [text "=AVERAGE(B4:D4)"]
      cell A5 [text "David Lee"]
      cell B5 [text "70"]
      cell C5 [text "68"]
      cell D5 [text "" assess [method "value" expected "72"]]
      cell E5 [text "=AVERAGE(B5:D5)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 117

### Prompt

Make a single column spreadsheet with a bold header that says "Name".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100]
    ] {}
    cells [
      cell A1 [text "Name" font-weight "bold"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 118

### Prompt

Create a spreadsheet with a column B that is right-aligned for displaying dollar amounts.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "right"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 119

### Prompt

Create a spreadsheet with cell A1 containing the text "Hello".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Hello"]
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 120

### Prompt

Make a spreadsheet with column A having a 1px solid gray border.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center" border "1px solid gray"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 121

### Prompt

Put 80, 90, and 70 in cells A1, A2, and A3. Calculate the average in A4.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "80"]
      cell A2 [text "90"]
      cell A3 [text "70"]
      cell A4 [text "=average(A1:A3)"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 122

### Prompt

Make a spreadsheet where row 2 has a light gray background.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    rows [
      row 2 [background-color "#D3D3D3"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell A2 []
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 123

### Prompt

Create a spreadsheet with parameters that fill in four cells: A1 gets "Name", B1 gets "Score", A2 gets "Alice", B2 gets "95".

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "{{A1}}"]
      cell B1 [text "{{B1}}"]
      cell A2 [text "{{A2}}"]
      cell B2 [text "{{B2}}"]
    ] {}
  ]
] params {"B2": "95" "A2": "Alice" "B1": "Score" "A1": "Name"} {"v": "0.0.1"}..
```

## Example 124

### Prompt

Create a three-column spreadsheet where column A is left-aligned, column B is center-aligned, and column C is right-aligned.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "left"]
      column B [width 100 align "center"]
      column C [width 100 align "right"]
    ] {}
    cells [
      cell A1 []
      cell B1 []
      cell C1 []
      cell A2 []
      cell B2 []
      cell C2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 125

### Prompt

Create a spreadsheet with test scores 85, 92, 78, 95, 88 in cells B2 through B6, and put an AVERAGE formula in B7.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "Test #" font-weight "bold"]
      cell B1 [text "Score" font-weight "bold"]
      cell A2 [text "1"]
      cell B2 [text "85"]
      cell A3 [text "2"]
      cell B3 [text "92"]
      cell A4 [text "3"]
      cell B4 [text "78"]
      cell A5 [text "4"]
      cell B5 [text "95"]
      cell A6 [text "5"]
      cell B6 [text "88"]
      cell A7 [text "Average" font-weight "bold"]
      cell B7 [text "=AVERAGE(B2:B6)" font-weight "bold"]
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 126

### Prompt

Put the value 3.14159 in cell A1 and add a ROUND formula in A2 that rounds it to 2 decimal places.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "center"]
      column B [width 100 align "center"]
    ] {}
    cells [
      cell A1 [text "3.14159"]
      cell B1 []
      cell A2 [text "=ROUND(A1,2)"]
      cell B2 []
    ] {}
  ]
] {"v": "0.0.1"}..
```

## Example 127

### Prompt

Create a spreadsheet with cells containing -50, -100, and -150.

### Code

```
sheets [
  sheet "s1" [
    columns [
      column A [width 100 align "right"]
    ] {}
    cells [
      cell A1 [text "-50"]
      cell A2 [text "-100"]
      cell A3 [text "-150"]
    ] {}
  ]
] {"v": "0.0.1"}..
```
