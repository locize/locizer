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
