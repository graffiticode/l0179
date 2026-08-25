// SPDX-License-Identifier: MIT
// @graffiticode/l0179-view — L0179's Form and its reducer cases, plus the shared View they
// are injected into (re-exported from the parent language's view package).
export { Form, reduce } from "./components/form";
export { View } from "@graffiticode/l0000-view";
export type {
  FormProps,
  FormComponent,
  CompileError,
  StateAction,
  LanguageReducer,
} from "@graffiticode/l0000-view";
