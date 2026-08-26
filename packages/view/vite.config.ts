// Library build: publishes @graffiticode/l0179-view as ESM, with bundled types and an extracted
// style.css. React is external (peer dependency).
//
// TWO entries, and the second one is not a convenience. `scoring` is published on its own
// subpath so the Learnosity SCORER can import it without the renderer. Relying on tree-shaking
// through the main entry does not work: the published entry is a single pre-bundled file, and
// ProseMirror's top-level initialisation is not provably pure, so React and the whole grid
// survive into the scorer bundle -- measured at ~500 kB, still carrying `document` references.
// Learnosity runs the scorer SERVER-side, so that is a correctness problem, not a size one.
// This is the fix L0166 tracked upstream as docs/scoring-subpath.md and never landed.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        scoring: resolve(__dirname, "src/scoring/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react(), dts({ rollupTypes: true })],
});
