// Type definitions for `locizer`.
//
// `locizer` is a lightweight client for the Locize CDN, framework-agnostic
// and callback-based. It also exposes the underlying
// `i18next-locize-backend` instance on `.backend` and the
// `i18next-browser-languagedetector` instance on `.detector` for advanced
// use cases.

/**
 * Locize CDN type — pick the one your Locize project is configured for.
 * 'standard' targets `api.lite.locize.app`, 'pro' targets `api.locize.app`.
 */
export type CdnType = 'standard' | 'pro'

/**
 * A single language entry as returned by the Locize languages endpoint.
 */
export interface Language {
  name: string
  nativeName: string
  /** True for the project's reference (source) language. */
  isReferenceLanguage?: boolean
  /**
   * Translation progress per published version, between 0 and 1.
   * Example: `{ latest: 0.9 }`.
   */
  translated: Record<string, number>
  /** Any additional fields returned by the API. */
  [extra: string]: unknown
}

/**
 * Languages map keyed by language code (e.g. `en`, `de-CH`).
 */
export type Languages = Record<string, Language>

/**
 * Recursive translation message tree. Locize publishes JSON which can be
 * arbitrarily nested.
 */
export interface Translations {
  [key: string]: string | Translations
}

/**
 * Options passed to `locizer.init(...)`. Additional options accepted by
 * `i18next-locize-backend` or `i18next-browser-languagedetector` are
 * forwarded as-is — type them via the `[extra: string]: unknown` index.
 */
export interface LocizerOptions {
  /** Your Locize project id. */
  projectId: string
  /**
   * Locize API key. Only required if you want to add or update keys from
   * the running app. Never bundle this in production builds.
   */
  apiKey?: string
  /** Explicit user language. If omitted, locizer detects it. */
  lng?: string
  /** Fallback language when the detected one isn't available. */
  fallbackLng?: string
  /** Reference (source) language of your Locize project. */
  referenceLng?: string
  /**
   * Threshold for languages to be considered loadable, between 0 and 1.
   * Default: 1 (only fully-translated languages). Lower this value to load
   * languages that are partially translated.
   */
  loadIfTranslatedOver?: number
  /** Published project version to load. Default: `'latest'`. */
  version?: string
  /** Load from privately-published files (requires `apiKey`). Default: false. */
  private?: boolean
  /** Locize CDN endpoint variant. Default: `'standard'`. */
  cdnType?: CdnType
  /** Bypass the CDN cache. Do not enable in production. */
  noCache?: boolean

  // ── Last-used reporting (locize-lastused) ────────────────────────────
  /** Hosts allowed to send last-used data. Keep to dev/staging hosts. */
  allowedHosts?: string[]
  /** Hosts allowed to add or update keys. Keep to dev/staging hosts. */
  allowedAddOrUpdateHosts?: string[]

  // ── Language detection (i18next-browser-languagedetector) ────────────
  /** Order and source of language detection. */
  order?: Array<
    | 'querystring'
    | 'cookie'
    | 'localStorage'
    | 'sessionStorage'
    | 'navigator'
    | 'htmlTag'
    | 'path'
    | 'subdomain'
    | string
  >
  /** Query-string parameter name to read the user language from. */
  lookupQuerystring?: string
  /** Cookie name to read the user language from. */
  lookupCookie?: string
  /** localStorage key to read the user language from. */
  lookupLocalStorage?: string
  /** Where to cache the detected user language. */
  caches?: Array<'localStorage' | 'cookie' | string>
  /** Cookie expiration in minutes. */
  cookieMinutes?: number
  /** Cookie domain to set. */
  cookieDomain?: string
  /** Element whose `lang` attribute is read for the `htmlTag` detector. */
  htmlTag?: HTMLElement

  /** Any other option accepted by the underlying backend / detector. */
  [extra: string]: unknown
}

/**
 * Callback used by single-language loads. Receives the namespace contents
 * and the resolved language code.
 */
export type LoadCallback<T extends Translations = Translations> = (
  err: Error | null,
  data: T,
  lng?: string
) => void

/**
 * Callback used by `loadAll`. Receives a map keyed by language code.
 */
export type LoadAllCallback<T extends Translations = Translations> = (
  err: Error | null,
  data: Record<string, T>
) => void

export type GetLanguageCallback = (err: Error | null, lng: string) => void
export type GetLanguagesCallback = (
  err: Error | null,
  lngs: Languages
) => void

export type WriteCallback = (err: Error | null) => void

/**
 * The locizer singleton.
 */
export interface Locizer {
  /** Options passed to the most recent `init(...)` call. */
  options: LocizerOptions
  /** The detected or explicitly configured user language. */
  lng?: string
  /** The reference language as configured in Locize. */
  referenceLng?: string
  /** Cached result of `getLanguages` — populated after the first call. */
  publishedLngs?: Languages
  /** Underlying `i18next-locize-backend` instance, exposed for advanced use. */
  backend: unknown
  /**
   * Underlying `i18next-browser-languagedetector` instance, exposed for
   * advanced use.
   */
  detector: unknown

  /** Initialise locizer. Must be called before any other method. */
  init(options: LocizerOptions): Locizer

  /** True if the language is published with enough translation progress. */
  isValid(lngs: Languages, lng: string): boolean

  /** Resolve the user language against the project's supported languages. */
  getLanguage(callback: GetLanguageCallback): Locizer
  getLanguage(lng: string, callback: GetLanguageCallback): Locizer

  /** Fetch the languages map for the configured project. */
  getLanguages(callback: GetLanguagesCallback): Locizer

  /**
   * Load a namespace for the current or specified language.
   *
   * ```ts
   * locizer.load('common', (err, data, lng) => { ... })
   * locizer.load('common', 'de', (err, data) => { ... })
   * ```
   */
  load<T extends Translations = Translations>(
    namespace: string,
    callback: LoadCallback<T>
  ): Locizer
  load<T extends Translations = Translations>(
    namespace: string,
    lng: string,
    callback: LoadCallback<T>
  ): Locizer

  /** Load a namespace in every published language in parallel. */
  loadAll<T extends Translations = Translations>(
    namespace: string,
    callback: LoadAllCallback<T>
  ): Locizer

  /**
   * Add a new key to the reference language. Requires `apiKey` and a host
   * allowed by `allowedAddOrUpdateHosts`.
   */
  add(
    namespace: string,
    key: string,
    value: string,
    context?: string,
    callback?: WriteCallback
  ): Locizer
  add(
    namespace: string,
    key: string,
    value: string,
    callback?: WriteCallback
  ): Locizer

  /**
   * Update an existing key on the reference language. Requires `apiKey` and
   * a host allowed by `allowedAddOrUpdateHosts`.
   */
  update(
    namespace: string,
    key: string,
    value: string,
    context?: string,
    callback?: WriteCallback
  ): Locizer
  update(
    namespace: string,
    key: string,
    value: string,
    callback?: WriteCallback
  ): Locizer

  /**
   * Report that a key is in use, so unused keys can later be cleaned up.
   * Honours `allowedHosts`.
   */
  used(namespace: string, key: string): void
}

declare const locizer: Locizer
export default locizer
