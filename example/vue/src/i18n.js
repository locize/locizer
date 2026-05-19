import { createI18n } from 'vue-i18n'
import locizer from 'locizer'

const namespace = 'messages'

// Set an apiKey only in dev — used by saveMissing (handleMissing below)
// to push new reference-language keys to Locize. Never bundle a
// write-enabled key in production.
const apiKey = undefined // 'my-api-key'

locizer.init({
  projectId: '1fb2c780-f038-4ffe-b988-5d9fe2e3ba2d',
  apiKey,
  cdnType: 'pro'
})

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: locizer.lng,
  fallbackLocale: 'en',
})

// Called from the <Suspense> async setup in App.vue. Loads every
// published language for the namespace in parallel, then hands them to
// vue-i18n via setLocaleMessage.
export const loadMessagesPromise = new Promise((resolve, reject) => {
  locizer.loadAll(namespace, (err, messages) => {
    if (err) return reject(err)
    Object.keys(messages).forEach((l) => {
      i18n.global.setLocaleMessage(l, messages[l])
    })
    resolve(messages)
  })
})

// Wire-up for vue-i18n's setMissingHandler: when a key is requested in
// the reference language and isn't yet known, push it to Locize.
export function handleMissing(locale, key) {
  if (!apiKey) return
  if (locale !== locizer.referenceLng) return
  locizer.add(namespace, key, key)
}
