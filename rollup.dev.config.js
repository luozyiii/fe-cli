const path = require("path");

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";

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
    resolve(),
    babel({
      exclude: "node_modules/**",
    }),
    commonjs(),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true,
    }),
  ],
};
