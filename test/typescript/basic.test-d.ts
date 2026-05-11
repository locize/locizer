import locizer from 'locizer'
import type {
  Languages,
  LocizerOptions,
  Translations
} from 'locizer'

// init returns the locizer instance and accepts a LocizerOptions object.
const options: LocizerOptions = {
  projectId: '1234',
  apiKey: '5678',
  fallbackLng: 'en',
  referenceLng: 'en',
  version: 'latest',
  cdnType: 'standard',
  loadIfTranslatedOver: 0.1,
  private: false,
  noCache: false,
  allowedHosts: ['localhost'],
  allowedAddOrUpdateHosts: ['localhost'],
  order: ['querystring', 'cookie', 'navigator']
}

locizer.init(options)

// instance properties
const lng: string | undefined = locizer.lng
const ref: string | undefined = locizer.referenceLng
const opts: LocizerOptions = locizer.options
void lng
void ref
void opts

// getLanguages: callback typed against Languages map
locizer.getLanguages((err: Error | null, lngs: Languages) => {
  void err
  const en = lngs.en
  if (en) {
    const isRef: boolean | undefined = en.isReferenceLanguage
    const translated: number = en.translated.latest ?? 0
    void isRef
    void translated
  }
})

// getLanguage: with and without explicit language
locizer.getLanguage((err, lng) => {
  void err
  const s: string = lng
  void s
})
locizer.getLanguage('de', (err, lng) => {
  void err
  void lng
})

// load: with and without explicit language; data is the namespace tree
locizer.load('common', (err, data, lng) => {
  void err
  void lng
  const v: string | Translations | undefined = data.greeting
  void v
})
locizer.load('common', 'de', (err, data) => {
  void err
  void data
})

// loadAll: returns a per-language map
locizer.loadAll('common', (err, all) => {
  void err
  const en = all.en
  if (en) {
    const greet: string | Translations | undefined = en.greeting
    void greet
  }
})

// add / update / used
locizer.add('common', 'newKey', 'New value')
locizer.add('common', 'newKey', 'New value', 'description')
locizer.add('common', 'newKey', 'New value', 'description', (err) => {
  void err
})

locizer.update('common', 'existingKey', 'Updated', 'updated description')
locizer.used('common', 'someKey')
