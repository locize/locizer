import { createI18n } from 'vue-i18n';
import locizer from 'locizer';

const namespace = 'messages';
const apiKey = undefined; //'my-api-key'; // used for handleMissing functionality
locizer.init({
  projectId: '1fb2c780-f038-4ffe-b988-5d9fe2e3ba2d',
  apiKey
});

export const i18n = createI18n({
  locale: locizer.lng, // set locale
  fallbackLocale: 'en' // set fallback locale
  // If you need to specify other options, you can set other options
  // ...
});

// called from within setup hook in App.vue
export const loadMessagesPromise = new Promise((resolve, reject) => {
  locizer.loadAll(namespace, (err, messages) => {
    if (err) return reject(err);
    Object.keys(messages).forEach((l) => {
      i18n.global.setLocaleMessage(l, messages[l])
    });
    resolve(messages);
  });
});

export function handleMissing (locale, key) {
  if (!apiKey) return;
  if (locale !== locizer.referenceLng) return;
  locizer.add(namespace, key, key);
}
