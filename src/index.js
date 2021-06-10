import LocizeBackend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import LocizeLastUsed from 'locize-lastused';

import { interpolate } from './interpolator';
import { formatLanguageCode, getLanguagePartFromCode } from './languageUtils';

const services = {
  interpolator: {
    interpolate
  },
  languageUtils: {
    formatLanguageCode
  }
};

const asyncEach = (arr, fn, callback) => {
  const results = [];
  let count = arr.length;
  arr.forEach((item, index) => {
    fn(item, (err, data) => {
      results[index] = data;
      if (err) {
        callback && callback(err);
        callback = null;
      }
      if (--count === 0 && callback) {
        callback(null, results);
      }
    });
  });
};

const locizer = {
  init(options) {
    this.options = options;
    this.backend = new LocizeBackend(services, options);
    this.detector = new LanguageDetector(services, options);
    this.lng = options.lng || this.detector.detect();
    this.referenceLng = options.referenceLng;

    LocizeLastUsed.init(options);
    return this;
  },

  isValid(lngs, l) {
    return lngs[l] && lngs[l].translated[this.options.version || 'latest'] >= (this.options.loadIfTranslatedOver || 1);
  },

  getLanguage(lng, callback) {
    if (typeof lng === 'function') {
      callback = lng;
      lng = this.lng;
    }
    if (!lng) lng = this.lng;

    this.getLanguages((err, lngs) => {
      if (this.isValid(lngs, lng)) return callback(null, lng);
      if (this.isValid(lngs, getLanguagePartFromCode(lng))) return callback(null, getLanguagePartFromCode(lng));
      callback(null, this.options.fallbackLng || this.this.referenceLng || Object.keys(lngs)[0]);
    });
    return this;
  },

  getLanguages(callback) {
    if (this.publishedLngs) {
      callback(null, this.publishedLngs);
    } else {
      this.backend.getLanguages((err, data) => {
        if (!err) this.publishedLngs = data;
        if (!this.referenceLng) {
          Object.keys(data).forEach((l) => {
            if (data[l].isReferenceLanguage) this.referenceLng = l;
          });
        }
        callback(null, data);
      });
    }
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

  loadAll(ns, callback) {
    this.getLanguages((err, lngs) => {
      const validLngs = Object.keys(lngs).filter((l) => this.isValid(lngs, l));

      asyncEach(validLngs, (l, clb) => {
        this.load(ns, l, (err, res) => {
          if (err) return clb(err);
          clb(null, { [l]: res });
        })
      }, (err, results) => {
        if (err) return callback(err);
        const ret = results.reduce((prev, l) => ({ ...prev,  ...l }), {});
        callback(null, ret);
      });
    });

    return this;
  },

  add(namespace, key, value, context, callback) {
    let options = {};
    if (typeof context === 'function') {
      callback = context;
    } else if (typeof context === 'string') {
      options.tDescription = context;
    }
    this.backend.create(this.referenceLng, namespace, key, value, callback, options);
    return this;
  },

  update(namespace, key, value, context, callback) {
    let options = { isUpdate: true };
    if (typeof context === 'function') {
      callback = context;
    } else if (typeof context === 'string') {
      options.tDescription = context;
    }
    this.backend.create(this.referenceLng, namespace, key, value, callback, options);
    return this;
  },

  used(namespace, key) {
    LocizeLastUsed.used(namespace, key);
  }
}

export default locizer;
