import LocizeBackend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { interpolate } from './interpolator';
import { formatLanguageCode, isWhitelisted, getLanguagePartFromCode } from './languageUtils';

const services = {
  interpolator: {
    interpolate
  },
  languageUtils: {
    formatLanguageCode,
    isWhitelisted
  }
}

const locizer = {
  init(options) {
    this.options = options;
    this.backend = new LocizeBackend(services, options);
    this.detector = new LanguageDetector(services, options);
    this.lng = options.lng || this.detector.detect();
    return this;
  },

  getLanguage(lng, callback) {
    if (typeof lng === 'function') {
      callback = lng;
      lng = this.lng;
    }
    if (!lng) lng = this.lng;

    const isValid = (lngs, l) => lngs[l] && lngs[l].translated[this.options.version || 'latest'] >= (this.options.loadIfTranslatedOver || 1);

    this.getLanguages((err, lngs) => {
      if (isValid(lngs, lng)) return callback(null, lng);
      if (isValid(lngs, getLanguagePartFromCode(lng))) return callback(null, getLanguagePartFromCode(lng));
      callback(null, this.options.fallbackLng || Object.keys(lngs)[0]);
    });
    return this;
  },

  getLanguages(callback) {
    if (this.publishedLngs) callback(null, this.publishedLngs);
    this.backend.getLanguages((err, data) => {
      if (!err) this.publishedLngs = data;
      callback(null, data);
    });
    return this;
  },

  load(ns, lng, callback) {
    if (typeof lng === 'function') {
      callback = lng;
      lng = null;
    }

    this.getLanguage(lng, (err, lng) => {
      this.backend.read(lng, ns, (err, data) => callback(err, data, lng));
    });

    return this;
  },

  add(namespace, key, value, callback) {
    this.backend.create(this.options.referenceLng, namespace, key, value, callback);
    return this;
  }
}

export default locizer;
