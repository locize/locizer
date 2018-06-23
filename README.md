[![Travis](https://img.shields.io/travis/locize/locizer/master.svg?style=flat-square)](https://travis-ci.org/locize/locizer)
[![Coveralls](https://img.shields.io/coveralls/locize/locizer/master.svg?style=flat-square)](https://coveralls.io/github/locize/locizer)
[![npm version](https://img.shields.io/npm/v/locizer.svg?style=flat-square)](https://www.npmjs.com/package/locizer)
[![Bower](https://img.shields.io/bower/v/locizer.svg)]()
[![David](https://img.shields.io/david/locize/locizer.svg?style=flat-square)](https://david-dm.org/locize/locizer)

# locizer.js

locizer.js is lightweight client to access data from your locize project and use that inside your application (eg. passing that to polyglot, formatjs).

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/locizer), bower or [downloaded](https://github.com/locize/locizer/blob/master/locizer.min.js) from this repo.

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
          fallbackLng: 'en',
          referenceLng: 'en',
          projectId: '[your project id]'
        })
        .load('translation', function(err, translations, lng) {
          // feed the translations to formatjs, polyglot,...
        });
    </script>
  </head>
  <body>
  </body>
</html>
```

# Init options

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

  // language detection options:

  // order and from where user language should be detected
  order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],

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
// load namespaces from locize in the lng provided in options or detected from user
locizer.load('namespace', (err, res) => {});

// load in different lng
locizer.load('namespace', 'de', (err, res) => {});
```

## add

```js
// add a new key
locizer.add('myNamespace', 'myKey', 'myValue', 'context information');
```

## update

```js
// add a new key
locizer.update('myNamespace', 'myKey', 'myValue', 'context information');
```

## setting last used info

```js
// add a new key
locizer.used('myNamespace', 'myKey');
```
