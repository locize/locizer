import * as index from './index.js'

export default index.default

export type CdnType = index.CdnType
export type Language = index.Language
export type Languages = index.Languages
export type Translations = index.Translations
export type LocizerOptions = index.LocizerOptions
export type LoadCallback<T extends index.Translations = index.Translations> =
  index.LoadCallback<T>
export type LoadAllCallback<
  T extends index.Translations = index.Translations
> = index.LoadAllCallback<T>
export type GetLanguageCallback = index.GetLanguageCallback
export type GetLanguagesCallback = index.GetLanguagesCallback
export type WriteCallback = index.WriteCallback
export type Locizer = index.Locizer
