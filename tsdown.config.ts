import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  alias: { "@": "./src" },
  format: ["esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  treeshake: true,
  platform: "neutral",
});
