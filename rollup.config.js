const path = require('path');

// ES6 转 ES5，让我们可以使用 ES6 新特性来编写代码
import babel from '@rollup/plugin-babel';
// 将 CommonJS 模块转换为 ES6 供 rollup 处理
import commonjs from '@rollup/plugin-commonjs';
// json
import json from '@rollup/plugin-json';
// rollup 无法识别 node_modules 中的包，帮助 rollup 查找外部模块，然后导入
import resolve from '@rollup/plugin-node-resolve';
// typescript 支持
import typescript from '@rollup/plugin-typescript';
// 压缩 js 代码，包括 ES6 代码压缩、删除注释
import { terser } from 'rollup-plugin-terser';

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
  plugins: [
    resolve(),
    babel({ babelHelpers: 'bundled' }),
    commonjs(),
    typescript({ compilerOptions: { lib: ['es5', 'es6', 'dom'], target: 'es5' } }),
    json(),
    terser(),
  ],
};
