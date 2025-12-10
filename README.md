[![Travis](https://img.shields.io/travis/locize/locizer/master.svg?style=flat-square)](https://travis-ci.org/locize/locizer)
[![npm version](https://img.shields.io/npm/v/locizer.svg?style=flat-square)](https://www.npmjs.com/package/locizer)

# locizer.js

locizer.js is lightweight client to access data from your locize project and use that inside your application (eg. passing that to polyglot, formatjs).

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locizer) or [downloaded](https://github.com/locize/locizer/blob/master/locizer.min.js) from this repo.

Or load it from the offical npm cdn:

[https://unpkg.com/locizer[@version]/locizer[.min].js](https://unpkg.com/locizer/locizer.min.js)

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/locizer/locizer.min.js"></script>
    <script>
      locizer
        .init({
          fallbackLng: "en",
          projectId: "[your project id]",
          cdnType: 'standard'
        })
        .load("translation", function(err, translations, lng) {
          // feed the translations to formatjs, polyglot,...
        });
    </script>
  </head>
  <body></body>
</html>
```

# Init options

**IMPORTANT** make sure you do not add your apiKey in the production build to avoid misuse by strangers

```js
{
  lng: 'en', // optional if set we won't detect language of user
  fallbackLng: 'en',
  referenceLng: 'en',

  loadIfTranslatedOver: 0.1, // default 1 - we only load lngs that are fully translated, lower this value to load files from languages that are just partially translated

  projectId: 'c8038fbe-7be8-4f96-9692-943b3333185b',
  apiKey: '27e9ecff-8926-43b0-80fd-e683abe49297', // only needed if you want to add new keys via locizer - remove on production!
  version: 'latest', // version to load from locize
  private: false, // set true if using locize private publish
  cdnType: 'standard', // default 'pro'
  noCache: false // fetches non cached translations (do not set to true in production)

  // hostnames that are allowed to send last used data
  // please keep those to your local system, staging, test servers (not production)
  allowedHosts: ['localhost'],
  // hostnames that are allowed to add, update keys
  // please keep those to your local system, staging, test servers (not production)
  allowedAddOrUpdateHosts: ['localhost'],

  // language detection options:

  // order and from where user language should be detected
  order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],

  // keys or params to lookup language from
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',

  // cache user language on
  caches: ['localStorage', 'cookie'],

  // optional expire and domain for set cookie
  cookieMinutes: 10,
  cookieDomain: 'myDomain',

  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement
}
```

# Example usage

## vue-i18n (Vue v3)

The full example can be found [here](https://github.com/locize/locizer/tree/master/example/vue).

```js
import { createI18n } from 'vue-i18n'
import locizer from 'locizer'

locizer.init({
  projectId: '1fb2c780-f038-4ffe-b988-5d9fe2e3ba2d'
});

export const i18n = createI18n({
  locale: locizer.lng, // set locale
  fallbackLocale: 'en' // set fallback locale
  // If you need to specify other options, you can set other options
  // ...
});

// called from within setup hook in App.vue
export const loadMessagesPromise = new Promise((resolve, reject) => {
  locizer.loadAll('messages', (err, messages) => {
    if (err) return reject(err);
    Object.keys(messages).forEach((l) => {
      i18n.global.setLocaleMessage(l, messages[l])
    });
    resolve(messages);
  });
})

```

# API

## init

```js
locizer.init(options);
```

## getLanguage

```js
// gives the language provided in options or detected from user compared to languages existing in your project (see also init option: loadIfTranslatedOver)
locizer.getLanguage((err, lng) => {));

// if you want the language detected but unfiltered against what your project provided
var loc = locizer.detector.detect();
```

## getLanguages

```js
// gives you all languages supported in your project
locizer.getLanguages((err, lngs) => {));

// something like:
{
  "en": {
    "name": "English",
    "nativeName": "English",
    "translated": {
      "latest": 1
    }
  },
  "de": {
    "name": "German",
    "nativeName": "Deutsch",
    "translated": {
      "latest": 0.19999999999999998
    }
  }
}
```

## load

```js
// load a namespace from locize in the lng provided in options or detected from user
locizer.load("namespace", (err, res) => {});

// load in different lng
locizer.load("namespace", "de", (err, res) => {});
```

## loadAll

```js
// load a namespace from locize in all languages
locizer.loadAll("namespace", (err, res) => {
  // res:
  // {
  //   en: {
  //     hello: "hello world"
  //   },
  //   de: {
  //     hello: "hallo welt"
  //   }
  // }
});
```

## add

```js
// add a new key
locizer.add("myNamespace", "myKey", "myValue", "context information");
```

## update

```js
// add a new key
locizer.update("myNamespace", "myKey", "myValue", "context information");
```

## setting last used info

```js
// add a new key
locizer.used("myNamespace", "myKey");
```
