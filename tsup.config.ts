import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/components/ui/index.ts" },
  outDir: "dist-ds",
  format: ["esm"],
  dts: { tsconfig: "tsconfig.ds.json" },
  tsconfig: "tsconfig.ds.json",
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
