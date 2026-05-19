# vue-i18n + locizer example

A minimal Vue 3.5 sample showing how to load translations from
[Locize](https://www.locize.com/?from=locizer-vue-i18n-example) into
[vue-i18n](https://vue-i18n.intlify.dev/) using the lightweight
[`locizer`](https://github.com/locize/locizer) client. Companion blog
post:
[Give vue-i18n more superpowers](https://www.locize.com/blog/give-vue-i18n-more-superpowers?from=locizer-vue-i18n-example).

Stack: Vue 3.5 · vue-i18n 11 (Composition API, `legacy: false`) ·
locizer 6 · Vite 8.

## Getting started

1. Create a free account and a project at
   <https://www.locize.com/?from=locizer-vue-i18n-example>, then grab
   your project id from the project's API page.
2. Edit `src/i18n.js` and replace the demo `projectId` with your own.
   Optionally set `apiKey` to a dev-scoped Locize key to enable
   `saveMissing` (never bundle a write-enabled key in production).
3. `npm install && npm run dev`, then open <http://localhost:5173>.

## What's in this example

### `src/i18n.js` — the integration surface

- `locizer.init({ projectId, apiKey? })` boots the locizer client. The
  `apiKey` is optional and only needed for `saveMissing`-style writes.
- `locizer.loadAll(namespace, cb)` fetches every published language for
  the namespace in parallel, and the callback installs each language as
  a vue-i18n locale message via `i18n.global.setLocaleMessage`.
- `handleMissing(locale, key)` is registered via vue-i18n's
  `setMissingHandler` and forwards new keys to `locizer.add(...)`
  — analogous to i18next's `saveMissing` option.

### Locize CDN endpoint

Locize ships two CDN infrastructures (full comparison at
[CDN types: Standard vs. Pro](https://www.locize.com/docs/integration/cdn-types-standard-vs-pro?from=locizer-vue-i18n-example)):

- **Standard CDN** at `api.lite.locize.app` — BunnyCDN-backed, free for
  generous monthly volumes, 1-hour fixed cache, public-only. Default
  for newly created Locize projects.
- **Pro CDN** at `api.locize.app` — CloudFront-backed, paid, supports
  private downloads, custom caching, namespace backups.

The shipped demo project lives on the Pro CDN, which is why
`src/i18n.js` sets `cdnType: 'pro'` in `locizer.init(...)`. If you swap
in your own Locize project, flip `cdnType` to match (`'standard'` for
`api.lite.locize.app`, `'pro'` for `api.locize.app`).

### `<Suspense>` for async i18n boot

`src/Suspenser.vue` wraps `App.vue` in `<Suspense>`. `App.vue`'s
`<script setup>` calls `await loadMessagesPromise`, so the fallback
template shows while translations load and the app renders only once
they're ready.

### Composition API only (`legacy: false`)

vue-i18n's legacy mode is deprecated in v11 and removed in v12, so this
example sets `legacy: false` in `createI18n` and uses `useI18n()`
throughout. `globalInjection: true` keeps `$t` available in templates
for convenience.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on <http://localhost:5173> |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |

## Related

- [Locize platform docs](https://www.locize.com/docs?from=locizer-vue-i18n-example)
- [vue-i18n documentation](https://vue-i18n.intlify.dev/)
- [`locizer`](https://github.com/locize/locizer) — the lightweight
  Locize client used here
- i18next-vue alternative:
  [locize-i18next-vue-example](https://github.com/locize/locize-i18next-vue-example)
