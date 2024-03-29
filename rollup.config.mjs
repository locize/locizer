/* eslint-disable import/no-extraneous-dependencies */
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

const getBabelOptions = ({ useESModules }) => ({
  exclude: /node_modules/,
  babelHelpers: 'runtime',
  plugins: [['@babel/transform-runtime', { useESModules }]],
  comments: false
});

const input = './src/index.js';
const name = 'locizer'
// check relative and absolute paths for windows and unix
const external = id => !id.startsWith('.') && !id.startsWith('/') && !id.includes(':');

export default [
  {
    input,
    output: { format: 'cjs', file: pkg.main },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: false }))
    ]
  },

  {
    input,
    output: { format: 'esm', file: pkg.module },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: true }))
    ]
  },

  {
    input,
    output: { format: 'umd', name, file: `dist/umd/${name}.js` },
    plugins: [
      babel(getBabelOptions({ useESModules: true })),
      nodeResolve()
    ],
  },
  {
    input,
    output: { format: 'umd', name, file: `dist/umd/${name}.min.js` },
    plugins: [
      babel(getBabelOptions({ useESModules: true })),
      nodeResolve(),
      terser()
    ],
  }
]