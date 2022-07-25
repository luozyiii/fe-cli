const path = require('path');

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const inputPath = path.resolve(__dirname, './src/index.ts');
const outputPath = path.resolve(__dirname, './lib/index.js');
export default {
  input: inputPath,
  output: [
    {
      file: outputPath,
      format: 'cjs',
    },
  ],
  plugins: [resolve(), babel({ babelHelpers: 'bundled' }), commonjs(), typescript()],
};
