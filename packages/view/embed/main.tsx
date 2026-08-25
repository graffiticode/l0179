// SPDX-License-Identifier: MIT
// The embeddable /form bundle for L0179: mounts the shared View (inherited from
// @graffiticode/l0000-view) with L0179's Form and its spreadsheet reducer cases. Also serves
// as the dev harness.
import React from "react";
import { createRoot } from "react-dom/client";
import { View, Form, reduce } from "../src";
import "../src/index.css";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <View Form={Form} reduce={reduce} />
    </React.StrictMode>,
  );
}
