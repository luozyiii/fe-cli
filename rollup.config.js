const path = require("path");

import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
// import { terser } from "rollup-plugin-terser";

const inputPath = path.resolve(__dirname, "./src/index.ts");
const outputPath = path.resolve(__dirname, "./lib/index.js");
export default {
  input: inputPath,
  output: [
    {
      file: outputPath,
      format: "cjs",
    },
  ],
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true,
    }),
    // terser(),
  ],
};
