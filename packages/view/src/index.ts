// SPDX-License-Identifier: MIT
// @graffiticode/l0179-view — L0179's Form and its reducer cases, plus the shared View they
// are injected into (re-exported from the parent language's view package).
// The stylesheet is a side effect of the entry so the lib build extracts it to dist/style.css,
// which is what the package's "./style.css" export points at. Without this import nothing
// references index.css from the library entry (only embed/main.tsx did), the file is never
// emitted, and that export subpath 404s for every consumer.
import "./index.css";

export { Form, reduce } from "./components/form";
// Scoring travels with the Form, which is L0166's for now (see components/form/Form.tsx).
// Re-exported so consumers have ONE import source for the language and no consumer needs its
// own dependency on L0166 -- when the renderer is ported, this line changes and nothing
// downstream does.
export { scoreCells, getCellsValidation } from "@graffiticode/l0166";
export { View } from "@graffiticode/l0000-view";
export type {
  FormProps,
  FormComponent,
  CompileError,
  StateAction,
  LanguageReducer,
} from "@graffiticode/l0000-view";
