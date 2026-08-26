# L0179 should have no dependency on L0166

**Status:** open · **Scope:** `packages/view` only — `packages/core` is already independent

## Where it stands

L0179 was built as a source-surface rewrite: the same compiled envelope as L0166, a different
way of writing it. `packages/core/src/compiler.ts` says so directly — "it is why the renderer
(@graffiticode/l0166) and the deployed scorer work unchanged". Reusing the renderer was the
point, and it is why the port could be proved correct by `tools/differential-test.mjs` instead
of by re-testing a UI.

The compiler already carries no dependency: `packages/core/src/validation.ts` and `params.ts`
are transcribed verbatim from L0166's compiler, source copied under comment, not imported.

The view layer was never given that treatment. There is exactly one dependency edge left:

```
packages/view/package.json → "@graffiticode/l0166": "^0.1.6"
```

feeding three uses:

| where | what |
| :-- | :-- |
| `src/components/form/Form.tsx` | `export const Form = SpreadsheetForm` — the entire renderer |
| `src/index.css` | `@import "@graffiticode/l0166/style.css"` — its stylesheet |
| `src/index.ts` | re-exports `scoreCells` / `getCellsValidation` |

No other package depends on L0166. The Learnosity integration deliberately imports everything
through `@graffiticode/l0179-view`, so when this edge goes, nothing downstream changes.

## What shedding it means

Porting the renderer, the same way the compiler was ported. In L0166 that is
`packages/app/lib/components/form/`: `TableEditor.tsx` (3,533 lines) plus `Editor`, `FormulaBar`,
`TextEditor`, `MenuView`, `ProtectedCellTooltip`, `ThemeToggle`, `translatex-rules.js` and
`Form.css` — ProseMirror tables, formula evaluation via `@graffiticode/translatex`, cell
formatting, and the scoring functions.

This is a real project, not a cleanup. Two things are worth settling before starting it.

**Is divergence actually wanted?** Today the two languages cannot drift: they render through
one component. A copy makes divergence possible, which is the point if L0179 is meant to grow
its own UI, and a liability if it is not. `Form.tsx` already flags this — "If the two data
models ever diverge, this file is where that shows up first".

**What guards equivalence afterwards?** `differential-test.mjs` compares compiler output and
would not notice two renderers drifting apart. A port needs its own equivalence check, or the
guarantee that today's shared component provides is simply lost.

## Order of work

1. **Scoring first.** It is the smallest piece, it is DOM-free, and the Learnosity scorer
   bundles need it independently — see `l0166/docs/scoring-subpath.md`. Extracting it upstream
   makes it cheap to transcribe here, exactly as `validation.ts` was.
2. **Then the renderer**, with an equivalence test standing before the copy is made.

Until step 1 lands, `packages/view` keeps the edge and every other package stays clean.
