// GW-UTILS: rollup.config.js

import { terser } from "rollup-plugin-terser";
import dts from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "js/index.js",
    plugins: [nodeResolve()],
    output: [
      {
        file: "dist/gw-canvas.min.js",
        format: "umd",
        name: "GWC",
        // freeze: false,
        // extend: true,
        sourcemap: true,
        plugins: [terser()],
      },
      {
        file: "dist/gw-canvas.mjs",
        format: "es",
        // freeze: false,
      },
      {
        file: "dist/gw-canvas.js",
        format: "umd",
        name: "GWC",
        // freeze: false,
        // extend: true,
        sourcemap: true,
      },
    ],
  },
  {
    input: "./js/index.d.ts",
    output: [{ file: "dist/gw-canvas.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
