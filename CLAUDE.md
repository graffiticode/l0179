# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

L0179 is a Graffiticode dialect for interactive spreadsheets. It is a **source-surface port of
L0166**: same compiled output, field for field; the only difference is that attributes are
written as arity-1 words inside a `[...]` list instead of an arity-2 chain.

```
cell A1 text "10" width 100 {}      # L0166 — a chain
cell A1 [text "10" width 100]       # L0179 — an attribute list
```

That equivalence is the project's central constraint. Because output is identical, the renderer
(`@graffiticode/l0166`'s Form) and the deployed Learnosity scorer work unchanged, and equivalence
is *testable* rather than asserted — see the differential test below.

Output contract (built in `Transformer.PROG`):
`{title, instructions, templateVariablesRecords, validation, interaction: {type: "table", rows, columns, cells}, errors}`.

## Commands

```bash
npm run build          # core tsc → build-static → api tsc → view lib → view embed → assemble
npm run dev            # language server on :50179 with tsx watch (api workspace)
npm start              # run the built server
npm test               # vitest in packages/core
npm run lint           # eslint (flat config, all workspaces); lint:fix / format also available
npm run diff-test      # L0166 ↔ L0179 equivalence over the shared corpus
```

Node >= 22 (`.nvmrc`: 22), npm workspaces.

Single test: `npm run -w packages/core test -- -t "the starter template compiles"`.
Vitest must run with `packages/core` as cwd — the tests read `spec/*` by relative path.

`npm run assemble` (part of `build`) wipes and repopulates `packages/api/static/` from
`packages/core/dist/static/` + `packages/view/dist-embed/`. It is generated output, gitignored;
never edit files there — edit `packages/core/spec/` or the view sources.

### Differential test

```bash
npm run diff-test                          # defaults: --l0166 ~/work/graffiticode/l0166
                                           #           --corpus ~/work/graffiticode/console/training/l0166-training-examples.md
npm run diff-test -- --limit 20 --emit /tmp/out
```

Requires the sibling `l0166` checkout and the `console` corpus, and requires `packages/core/dist/`
to be built (it imports `../dist/index.js`). For each corpus example it parses the L0166 source,
translates the AST to L0179 source, compiles both, and deep-compares. The translator inside
`tools/differential-test.mjs` is also what seeds `packages/core/spec/examples.md` (`--emit`).

Assert on **compiled output**, never on source shape — a source-shape check passes on programs
that compile to the wrong thing.

## Architecture

Three workspaces:

- **`packages/core`** (`@graffiticode/l0179`) — the compiler. Extends `@graffiticode/l0000`
  (`Compiler`, `Checker`, `Transformer`, `lexicon`).
- **`packages/api`** (private) — Express language server: `POST /compile`, `GET /form`,
  `GET /` health, and public static assets mounted *before* auth so they need no token.
  Auth attaches `req.auth` but does not reject anonymous requests.
- **`packages/view`** (`@graffiticode/l0179-view`) — `Form` re-exports
  `@graffiticode/l0166`'s Form verbatim (same data shape), injected into the shared `View` from
  `@graffiticode/l0000-view` as `<View Form={Form} reduce={reduce} />`. Two Vite builds: the
  library (`vite.config.ts`, React external) and the standalone `/form` embed
  (`vite.embed.config.ts` → `dist-embed/`).

  `src/components/form/reduce.ts` is **not optional wiring** — it is the half of L0166's state
  protocol that is not generic. L0166's Form reports an edited cell as
  `{cells: {A1: {text, formattedValue}}}` and expects it merged into `data.interaction.cells`
  per cell, preserving each cell's `assess` rules and formatting. The shared View's generic
  `update` merges onto the top level instead, which writes a `cells` key nothing renders while
  `interaction.cells` goes stale — the edit never reaches the grid and the next compile redraws
  the sheet from source, erasing what the learner typed. Everything else in the protocol
  (`init`, `compiled`, `response`, `focus`) is handled by the shared View; `reduce` returns
  `undefined` for those so they fall through.

### The attribute table drives everything

`packages/core/src/attributes.ts` is the vocabulary as data. Adding an attribute is **a row in
that table** — the lexicon entry (`lexicon.ts`), the Checker method, and the Transformer method
are all generated from it in loops. Never hand-write an attribute handler.

Two hand-maintained pieces sit alongside it:

- `attributeFields[NAME].field` / `.coerce` are **transcribed from L0166, not inferred**, and are
  deliberately non-uniform: most style attributes emit kebab keys (`background-color`) and coerce
  through `tagValue(v) || ""`; `align` omits the `|| ""`; `method` lowercases; `hide-formulabar`
  emits `hideMenu`. A uniform pass-through table would silently change all of it.
- `validAttributes` — which words each container accepts. This is the payoff of the style: an
  attribute list merges whatever it is handed, so without this check a word written one level too
  high lands in a record nothing reads and compiles clean. The error message names the legal set
  *and* where the misplaced word actually belongs, because the consumer is an LLM code generator
  that reads compiler output and retries.

Only containers are written by hand: `SHEETS`/`SHEET`, `CELLS`/`CELL`, `COLUMNS`/`COLUMN`,
`ROWS`/`ROW`, `PARAMS`, `PROG`.

### Ported-verbatim files — do not "improve"

`packages/core/src/validation.ts` and `params.ts` are transcriptions of L0166's compiler,
including its quirks. `rowInRegion`'s `||`-that-should-be-`&&` is load-bearing for existing
programs and pinned by the differential test. Fixing it is a behaviour change for *both*
languages and belongs in its own change. Same for `PARAMS` discarding its continuation (which is
why the trailing `{"v": "0.0.1"}` never reaches the output).

### Checker vs Transformer

Value validation belongs in the **Transformer**, not the Checker: the base `Checker.LIST` visits
only its first element, so a rule written in the Checker fires for the first attribute of a list
and silently skips the rest. The Checker here is deliberately a thin child-walker.

### Arity is the grammar

Two shapes, distinguished by arity in `lexicon.ts`:
- arity 1 — an attribute; evaluates to a single-key record the enclosing list merges.
- arity 2 — member list (`cells [...] {config}`), keyed entry (`cell A1 [attrs]`), or chaining
  (`params {...} {...}`).

Cell/column addresses are regex-keyed `TAG` lexicon entries (`^[A-Z][0-9]+$`, `^[A-Z]$`), so `A1`
and `A` parse as barewords. Row *regions* stay quoted strings (`row "*"`, `row "1..5"`) because
they are ranges; `row 1` (bare number) is also accepted and stringified.

Exactly one `sheet` is supported — more is an explicit error, because the output contract has no
envelope for a second one.

## Spec is tested, not decorative

`packages/core/spec/` holds the published language surface: `spec.md` (rendered to `spec.html` by
spec-md), `instructions.md` (concatenated onto L0000's at build time), `usage-guide.md`,
`examples.md` (the retrieval corpus), `template.gc`, `scope.json`, `schema.json`,
`language-info.json`.

`src/docs.test.ts` enforces that every fenced program in `spec.md` / `instructions.md` /
`examples.md` **compiles** (not merely parses), that `template.gc` compiles, that retired L0166
words (`hide-menu`, `index`, `order`) appear nowhere in code spans, and that every word documented
in spec.md's tables exists in the attribute table. These docs are LLM input — a wrong example is
reproduced verbatim into generated programs.

`language-info.json`'s `authoring_guide` is **injected at build time** from `usage-guide.md`'s
`## Overview` section (`tools/build-static.js` fails the build if it's missing or under 100
chars). Edit the Overview, not the JSON.

## Deploy

Cloud Run, project `graffiticode`, service `l0179`, region `us-central1`, port 50179.
`npm run gcp:build` (Cloud Build) / `gcp:deploy` / `gcp:logs`. `AUTH_URL` is the only runtime env
var — spreadsheets read task data via `get-val-public` and params, never `get-val-private`, so no
`GRAFFITICODE_SECRET_KEY` is needed. If a private value is ever introduced, add the secret to
`cloudbuild.yaml` **and** propagate it with `console/scripts/set-compiler-secret.sh 0179`.

`/lexicon.js` is a back-compat alias serving `lexicon.json` for the still-deployed console; drop
it once the console migrates.

## Related repos (siblings under `~/work/graffiticode/`)

- `l0166` — the language L0179 ports; source of truth for output behaviour.
- `console` — `docs/language-authoring-style.md` (the attribute-list style this language follows,
  referenced throughout the source) and `training/l0166-training-examples.md` (the corpus).
- `l0176` — a sibling in the same style; several files here are ported from it.
