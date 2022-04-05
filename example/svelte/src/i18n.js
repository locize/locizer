import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import locizer from 'locizer';
import { addLocizeSavedHandler } from 'locize';

const fallbackLocale = 'en';
const lngs = [fallbackLocale, 'de'];
const namespace = 'messages';
const apiKey = '3403d121-46be-40e8-b21d-e3066519232c'; // do not expose your API-Key in production

locizer.init({
  projectId: '72384226-6235-4472-a97f-b179a1f39dcc',
  apiKey
});

lngs.forEach((l) => {
  register(l, () => new Promise((resolve, reject) => {
    locizer.load(namespace, l, (err, ns) => {
      if (err) return reject(err);
      resolve(ns);
    });
  }));
})

locale.subscribe((lng) => {
  if (lng) localStorage.setItem('svelte-i18n-locale', lng);
});

let initialLocale;
const detectedLocale = localStorage.getItem('svelte-i18n-locale') || getLocaleFromNavigator();
if (lngs.indexOf(detectedLocale) > -1) initialLocale = detectedLocale;
if (!initialLocale && detectedLocale.indexOf('-') > 0) {
  const foundLng = lngs.find((l) => detectedLocale.indexOf(l + '-') === 0);
  if (foundLng) initialLocale = foundLng;
}
if (!initialLocale) initialLocale = fallbackLocale;

init({
  fallbackLocale,
  initialLocale,
  handleMissingMessage: apiKey ? ({ locale, id, defaultValue }) => {
    if (locale !== locizer.referenceLng) return;
    locizer.add(namespace, id, defaultValue);
  } : undefined
});

addLocizeSavedHandler(() => location.reload());
