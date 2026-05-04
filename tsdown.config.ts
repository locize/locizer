import { defineConfig } from 'tsdown'

const srcEntry = { index: 'src/index.js' }

export default defineConfig([
  // ── ESM build (consumed via `import` / `./esm` subpath) ──
  // Dependencies stay external — npm consumers install them themselves.
  {
    entry: srcEntry,
    format: ['esm'],
    outDir: 'dist/esm',
    outExtensions: () => ({ js: '.js' }),
    dts: false,
    sourcemap: false,
    clean: true,
  },
  // ── CJS build ──
  {
    entry: srcEntry,
    format: ['cjs'],
    outDir: 'dist/cjs',
    outExtensions: () => ({ js: '.js' }),
    dts: false,
    sourcemap: false,
    clean: true,
  },
  // ── IIFE bundle for direct <script> use (unminified + minified) ──
  // Inlines every dependency so the script tag is a self-contained drop-in.
  {
    entry: { locizer: 'src/index.js' },
    format: ['iife'],
    globalName: 'locizer',
    outDir: '.',
    outputOptions: { entryFileNames: '[name].js' },
    target: 'es2020',
    deps: { alwaysBundle: [/.*/] },
    dts: false,
    sourcemap: false,
    clean: false,
  },
  {
    entry: { 'locizer.min': 'src/index.js' },
    format: ['iife'],
    globalName: 'locizer',
    outDir: '.',
    outputOptions: { entryFileNames: '[name].js' },
    target: 'es2020',
    deps: { alwaysBundle: [/.*/] },
    minify: true,
    dts: false,
    sourcemap: false,
    clean: false,
  },
])
