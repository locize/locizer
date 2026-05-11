### 6.1.0

- feat: ship official TypeScript declarations. `index.d.ts` (CJS) and `index.d.mts` (ESM re-export) cover the full public surface — `init`, `getLanguage`, `getLanguages`, `load`, `loadAll`, `add`, `update`, `used`, the instance properties (`lng`, `referenceLng`, `options`, `publishedLngs`), and types for the language map, message tree, and every callback signature. Consumers no longer need an ambient `declare module 'locizer'` shim.
- build: `npm run build` now runs a `finalize` step that copies the root declarations into `dist/esm/index.d.{mts,ts}` and `dist/cjs/index.d.ts`, matching the pattern used by `i18next-locize-backend`. `package.json#exports` declares them under each subpath (`.`, `./cjs`, `./esm`), and a top-level `"types": "./index.d.mts"` keeps legacy tooling happy.
- chore: added a `tsd`-backed type test at `test/typescript/basic.test-d.ts` and a `test:typescript` script (`tsc --noEmit && tsd`); `npm test` now runs `lint` + `build` + this type check. Adds `tsd` and `typescript` to devDependencies.

### 6.0.0

- BREAKING: bumped `i18next-locize-backend` to v10 and `locize-lastused` to v5. Both dropped their `cross-fetch` dependency, so locizer no longer ships the `cross-fetch` / `node-fetch` fallback in its bundle. Native `fetch` is now required (Node ≥ 18, modern browsers, Deno, Bun — all of which ship it). For runtimes without native `fetch`, install a ponyfill yourself before loading this module, or stay on v5.
- BREAKING: minimum Node version is now 18 (`engines.node = ">=18"`), inherited from the upstream bumps.
- chore: declared `"type": "module"` and `"sideEffects": false`. CJS consumers continue to work via the `dist/cjs/index.js` build (with a `{"type":"commonjs"}` marker dropped into `dist/cjs/`).
- build: replaced rollup 3 + babel + `cpy-cli` + `rimraf` with [`tsdown`](https://tsdown.dev) (rolldown + oxc). One config produces ESM, CJS, and IIFE bundles. Output layout collapsed: ESM at `dist/esm/index.js`, CJS at `dist/cjs/index.js`, plus root `locizer.js` / `locizer.min.js` for `<script>` use. `package.json#exports` map added (was missing).
- build: minified browser bundle: 40.7 KB → 32.9 KB (−19%); unminified 80.6 KB → 57.0 KB (−29%).
- chore: dropped 11 dev dependencies — `@babel/core`, `@babel/plugin-transform-runtime`, `@babel/preset-env`, `@rollup/plugin-babel`, `@rollup/plugin-commonjs`, `@rollup/plugin-node-resolve`, `@rollup/plugin-terser`, `babel-eslint` (unused), `babelify` (unused), `chai` + `mocha` (no test files exist), `cpy-cli`, `rimraf`, `rollup`. Net devDeps: 17 → 4.
- chore: ESLint config converted from CommonJS (`eslint.config.js` with `require`) to ESM (`eslint.config.mjs` with `import`) since the package is now `"type": "module"`. neostandard rules unchanged.
- chore: tightened `.npmignore` (`example`, `.vscode`, `package-lock.json`, etc.); added the new `tsdown.config.ts`.
- chore: added `.github/workflows/node.yml` — first CI workflow for this repo. Runs lint + build on Node 20 / 22 / 24.

### 5.0.2

Security hardening — no GHSA on its own (the real URL-building now lives in the upstream `i18next-locize-backend@9.0.2` which has its own [GHSA-mgcp-mfp8-3q45](https://github.com/locize/i18next-locize-backend/security/advisories/GHSA-mgcp-mfp8-3q45); the changes here are defence-in-depth and inherited-fix plumbing).

- security (defence-in-depth): guard `interpolate()` against prototype-chain lookups — `data['__proto__']` / `['constructor']` / `['prototype']` no longer dereference the pollutable prototype chain. locizer passes this helper into `i18next-locize-backend` as a service; the backend already applies its own URL-specific sanitisation, this is an extra layer for any future code path that reuses `interpolate` directly.
- chore: bump `i18next-locize-backend` 9.0.1 → **9.0.2** ([GHSA-mgcp-mfp8-3q45](https://github.com/locize/i18next-locize-backend/security/advisories/GHSA-mgcp-mfp8-3q45))
- chore: remove unused `coveralls` devDependency
- chore: ignore `.env*` and `*.pem`/`*.key` files in `.gitignore`

### 5.0.1

- update i18next-locize-backend dep

### 5.0.0

- update i18next-locize-backend dep
- changed default cdnType to "standard" instead of "prod"

### 4.0.2

- update i18next-locize-backend dep

### 4.0.1

- update i18next-locize-backend dep

### 4.0.0

- log/error is shown if cdnType is not defined, because of changing default to 'standard' instead of 'pro'

### 3.5.3

- update i18next-locize-backend dep

### 3.5.2

- update i18next-locize-backend dep

### 3.5.1

- update i18next-locize-backend dep

### 3.5.0

- update deps

### 3.4.3

- update deps (before next major versions)

### 3.4.2

- update deps

### 3.4.1

- update deps

### 3.4.0

- update deps

### 3.3.10

- update deps

### 3.3.9

- update i18next deps

### 3.3.8

- update i18next deps

### 3.3.7

- fix typo

### 3.3.6

- update locize dependencies

### 3.3.5

- optimize error scenario, if project id does not exist

### 3.3.4

- update locize dependencies

### 3.3.3

- update locize dependencies

### 3.3.2

- update locize dependencies

### 3.3.1

- add reference language to fallback for getLanguage()

### 3.3.0

- automatically try to detect referenceLng

### 3.2.0

- update dependencies
- offer loadAll function

### 3.1.0

- update dependencies

### 3.0.8

- update dependencies

### 3.0.7

- update dependencies

### 3.0.6

- update dependencies

### 3.0.5

- update dependencies

### 3.0.4

- update dependencies

### 3.0.3

- update dependencies

### 3.0.2

- update dependencies

### 3.0.1

- update dependencies

### 3.0.0

- update major dependencies

### 2.1.3

- update dependencies

### 2.1.2

- update dependencies

### 2.1.1

- update dependencies

### 2.1.0

- update dependencies

### 2.0.1

- update dependencies

### 2.0.0

- update dependencies to using `locize.app` instead of `locize.io`
- remove bower
- update build process

### 1.3.0

- update dependencies (adds host check for add, update and used)

### 1.2.2

- fix double callback issue

### 1.2.1

- fix typo

### 1.2.0

- support context in add / update
- support update key
- support for last used

### v1.1.0

- additional return lng on load callback

### v1.0.0

- initial version
