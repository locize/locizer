(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.locizer = factory());
}(this, (function () { 'use strict';

  const arr = [];
  const each = arr.forEach;
  const slice = arr.slice;

  function defaults (obj) {
    each.call(slice.call(arguments, 1), (source) => {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj
  }

  function debounce (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this; var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }
  function getLastOfPath (object, path, Empty) {
    function cleanKey (key) {
      return (key && key.indexOf('###') > -1) ? key.replace(/###/g, '.') : key
    }

    const stack = (typeof path !== 'string') ? [].concat(path) : path.split('.');
    while (stack.length > 1) {
      if (!object) return {}

      const key = cleanKey(stack.shift());
      if (!object[key] && Empty) object[key] = new Empty();
      object = object[key];
    }

    if (!object) return {}
    return {
      obj: object,
      k: cleanKey(stack.shift())
    }
  }

  function setPath (object, path, newValue) {
    const { obj, k } = getLastOfPath(object, path, Object);

    obj[k] = newValue;
  }

  function pushPath (object, path, newValue, concat) {
    const { obj, k } = getLastOfPath(object, path, Object);

    obj[k] = obj[k] || [];
    if (concat) obj[k] = obj[k].concat(newValue);
    if (!concat) obj[k].push(newValue);
  }

  function getPath (object, path) {
    const { obj, k } = getLastOfPath(object, path);

    if (!obj) return undefined
    return obj[k]
  }

  const regexp = new RegExp('{{(.+?)}}', 'g');

  function makeString (object) {
    if (object == null) return ''
    return '' + object
  }

  function interpolate (str, data, lng) {
    let match, value;

    function regexSafe (val) {
      return val.replace(/\$/g, '$$$$')
    }

    // regular escape on demand
    // eslint-disable-next-line no-cond-assign
    while (match = regexp.exec(str)) {
      value = match[1].trim();
      if (typeof value !== 'string') value = makeString(value);
      if (!value) value = '';
      value = regexSafe(value);
      str = str.replace(match[0], data[value] || value);
      regexp.lastIndex = 0;
    }
    return str
  }

  function isMissingOption (obj, props) {
    return props.reduce((mem, p) => {
      if (mem) return mem
      if (!obj || !obj[p] || typeof obj[p] !== 'string' || !obj[p].toLowerCase() === p.toLowerCase()) {
        const err = `i18next-locize-backend :: got "${obj[p]}" in options for ${p} which is invalid.`;
        console.warn(err);
        return err
      }
      return false
    }, false)
  }

  var fetchApi;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi = window.fetch;
    }
  }

  if (typeof require !== 'undefined' && (typeof window === 'undefined' || typeof window.document === 'undefined')) {
    var f = fetchApi || require('node-fetch');
    if (f.default) f = f.default;
    exports.default = f;
    module.exports = exports.default;
  }

  var fetchNode = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  let fetchApi$1;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$1 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$1 = window.fetch;
    }
  }
  let XmlHttpRequestApi;
  if (typeof XMLHttpRequest === 'function') {
    if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequestApi = global.XMLHttpRequest;
    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequestApi = window.XMLHttpRequest;
    }
  }
  let ActiveXObjectApi;
  if (typeof ActiveXObject === 'function') {
    if (typeof global !== 'undefined' && global.ActiveXObject) {
      ActiveXObjectApi = global.ActiveXObject;
    } else if (typeof window !== 'undefined' && window.ActiveXObject) {
      ActiveXObjectApi = window.ActiveXObject;
    }
  }
  if (!fetchApi$1 && fetchNode && !XmlHttpRequestApi && !ActiveXObjectApi) fetchApi$1 = undefined || fetchNode; // because of strange export
  if (typeof fetchApi$1 !== 'function') fetchApi$1 = undefined;

  // fetch api stuff
  const requestWithFetch = (options, url, payload, callback) => {
    fetchApi$1(url, {
      method: payload ? 'POST' : 'GET',
      body: payload ? JSON.stringify(payload) : undefined,
      headers: {
        Authorization: options.authorize && options.apiKey ? options.apiKey : undefined,
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      const resourceNotExisting = response.headers && response.headers.get('x-cache') === 'Error from cloudfront';
      if (!response.ok) return callback(response.statusText || 'Error', { status: response.status, resourceNotExisting })
      response.text().then((data) => {
        callback(null, { status: response.status, data, resourceNotExisting });
      }).catch(callback);
    }).catch(callback);
  };

  // xml http request stuff
  const requestWithXmlHttpRequest = (options, url, payload, callback) => {
    try {
      let x;
      if (XmlHttpRequestApi) {
        x = new XmlHttpRequestApi();
      } else {
        x = new ActiveXObjectApi('MSXML2.XMLHTTP.3.0');
      }
      x.open(payload ? 'POST' : 'GET', url, 1);
      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      if (options.authorize && options.apiKey) {
        x.setRequestHeader('Authorization', options.apiKey);
      }
      if (payload || options.setContentTypeJSON) {
        x.setRequestHeader('Content-Type', 'application/json');
      }
      x.onreadystatechange = () => {
        const resourceNotExisting = x.getResponseHeader('x-cache') === 'Error from cloudfront';
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, { status: x.status, data: x.responseText, resourceNotExisting });
      };
      x.send(JSON.stringify(payload));
    } catch (e) {
      console && console.log(e);
    }
  };

  const request = (options, url, payload, callback) => {
    if (typeof payload === 'function') {
      callback = payload;
      payload = undefined;
    }
    callback = callback || (() => {});

    if (fetchApi$1) {
      // use fetch api
      return requestWithFetch(options, url, payload, callback)
    }

    if (typeof XMLHttpRequest === 'function' || typeof ActiveXObject === 'function') {
      // use xml http request
      return requestWithXmlHttpRequest(options, url, payload, callback)
    }

    // import('node-fetch').then((fetch) => {
    //   fetchApi = fetch.default || fetch // because of strange export of node-fetch
    //   requestWithFetch(options, url, payload, callback)
    // }).catch(callback)
  };

  const getDefaults = () => {
    return {
      loadPath: 'https://api.locize.app/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      privatePath: 'https://api.locize.app/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      getLanguagesPath: 'https://api.locize.app/languages/{{projectId}}',
      addPath: 'https://api.locize.app/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      updatePath: 'https://api.locize.app/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      referenceLng: 'en',
      crossDomain: true,
      setContentTypeJSON: false,
      version: 'latest',
      private: false,
      translatedPercentageThreshold: 0.9,
      // temporal backwards compatibility WHITELIST REMOVAL
      whitelistThreshold: 0.9,
      // end temporal backwards compatibility WHITELIST REMOVAL
      failLoadingOnEmptyJSON: false, // useful if using chained backend
      allowedAddOrUpdateHosts: ['localhost'],
      onSaved: false,
      reloadInterval: 60 * 60 * 1000,
      checkForProjectTimeout: 3 * 1000,
      storageExpiration: 60 * 60 * 1000
    }
  };

  let hasLocalStorageSupport;
  try {
    hasLocalStorageSupport = typeof window !== 'undefined' && window.localStorage !== null;
    const testKey = 'notExistingLocizeProject';
    window.localStorage.setItem(testKey, 'foo');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    hasLocalStorageSupport = false;
  }

  function getStorage (storageExpiration) {
    let setProjectNotExisting = () => {};
    let isProjectNotExisting = () => {};
    if (hasLocalStorageSupport) {
      setProjectNotExisting = (projectId) => {
        window.localStorage.setItem(`notExistingLocizeProject_${projectId}`, Date.now());
      };
      isProjectNotExisting = (projectId) => {
        const ret = window.localStorage.getItem(`notExistingLocizeProject_${projectId}`);
        if (!ret) return false
        if (Date.now() - ret > storageExpiration) {
          window.localStorage.removeItem(`notExistingLocizeProject_${projectId}`);
          return false
        }
        return true
      };
    } else if (typeof document !== 'undefined') {
      setProjectNotExisting = (projectId) => {
        const date = new Date();
        date.setTime(date.getTime() + storageExpiration);
        const expires = `; expires=${date.toGMTString()}`;
        const name = `notExistingLocizeProject_${projectId}`;
        document.cookie = `${name}=${Date.now()}${expires};path=/`;
      };
      isProjectNotExisting = (projectId) => {
        const name = `notExistingLocizeProject_${projectId}`;
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return true // return c.substring(nameEQ.length,c.length);
        }
        return false
      };
    }

    return {
      setProjectNotExisting,
      isProjectNotExisting
    }
  }

  class I18NextLocizeBackend {
    constructor (services, options = {}, allOptions = {}, callback) {
      this.services = services;
      this.options = options;
      this.allOptions = allOptions;
      this.type = 'backend';
      if (services && services.projectId) {
        this.init(null, services, allOptions, options);
      } else {
        this.init(services, options, allOptions, callback);
      }
    }

    init (services, options = {}, allOptions = {}, callback) {
      this.services = services;
      // temporal backwards compatibility WHITELIST REMOVAL
      if (options.whitelistThreshold !== undefined && options.translatedPercentageThreshold === undefined) {
        if (services && services.logger) services.logger.deprecate('whitelistThreshold', 'option "whitelistThreshold" will be renamed to "translatedPercentageThreshold" in the next major - please make sure to rename this option asap.');
        options.translatedPercentageThreshold = options.whitelistThreshold;
      }
      // end temporal backwards compatibility WHITELIST REMOVAL
      this.options = defaults(options, this.options || {}, getDefaults());
      this.allOptions = allOptions;
      this.somethingLoaded = false;
      this.isProjectNotExisting = false;
      this.storage = getStorage(this.options.storageExpiration);

      if (this.options.pull) {
        console.warn(
          'The pull API was removed use "private: true" option instead: https://docs.locize.com/integration/api#fetch-private-namespace-resources'
        );
      }

      const hostname = typeof window !== 'undefined' && window.location && window.location.hostname;
      if (hostname) {
        this.isAddOrUpdateAllowed = typeof this.options.allowedAddOrUpdateHosts === 'function' ? this.options.allowedAddOrUpdateHosts(hostname) : this.options.allowedAddOrUpdateHosts.indexOf(hostname) > -1;

        if (services && services.logger && (allOptions.saveMissing || allOptions.updateMissing)) {
          if (!this.isAddOrUpdateAllowed) {
            services.logger.warn(
              typeof this.options.allowedAddOrUpdateHosts === 'function'
                ? `locize-backend: will not save or update missings because allowedAddOrUpdateHosts returned false for the host "${hostname}".`
                : `locize-backend: will not save or update missings because the host "${hostname}" was not in the list of allowedAddOrUpdateHosts: ${this.options.allowedAddOrUpdateHosts.join(
                ', '
              )} (matches need to be exact).`
            );
          } else if (hostname !== 'localhost') {
            services.logger.warn(`locize-backend: you are using the save or update missings feature from this host "${hostname}".\nMake sure you will not use it in production!\nhttps://docs.locize.com/guides-tips-and-tricks/going-production`);
          }
        }
      } else {
        this.isAddOrUpdateAllowed = true;
      }

      if (typeof callback === 'function') {
        this.getOptions((err, opts) => {
          if (err) return callback(err)
          this.options.referenceLng = options.referenceLng || opts.referenceLng || this.options.referenceLng;
          callback(null, opts);
        });
      }

      this.queuedWrites = { pending: {} };
      this.debouncedProcess = debounce(this.process, 10000);

      if (this.interval) clearInterval(this.interval);
      if (this.options.reloadInterval) {
        this.interval = setInterval(() => this.reload(), this.options.reloadInterval);
      }
    }

    reload () {
      const { backendConnector, languageUtils, logger } = this.services;
      if (!backendConnector) return
      const currentLanguage = backendConnector.language;
      if (currentLanguage && currentLanguage.toLowerCase() === 'cimode') return // avoid loading resources for cimode

      const toLoad = [];
      const append = (lng) => {
        const lngs = languageUtils.toResolveHierarchy(lng);
        lngs.forEach(l => {
          if (toLoad.indexOf(l) < 0) toLoad.push(l);
        });
      };

      append(currentLanguage);

      if (this.allOptions.preload) this.allOptions.preload.forEach((l) => append(l));

      toLoad.forEach(lng => {
        this.allOptions.ns.forEach(ns => {
          backendConnector.read(lng, ns, 'read', null, null, (err, data) => {
            if (err) logger.warn(`loading namespace ${ns} for language ${lng} failed`, err);
            if (!err && data) logger.log(`loaded namespace ${ns} for language ${lng}`, data);

            backendConnector.loaded(`${lng}|${ns}`, err, data);
          });
        });
      });
    }

    getLanguages (callback) {
      const isMissing = isMissingOption(this.options, ['projectId']);
      if (isMissing) return callback(new Error(isMissing))

      const url = interpolate(this.options.getLanguagesPath, {
        projectId: this.options.projectId
      });

      if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) {
        this.isProjectNotExisting = true;
      }

      if (this.isProjectNotExisting) return callback(new Error(`locize project ${this.options.projectId} does not exist!`))

      this.loadUrl({}, url, (err, ret, info) => {
        if (!this.somethingLoaded && info && info.resourceNotExisting) {
          this.isProjectNotExisting = true;
          this.storage.setProjectNotExisting(this.options.projectId);
          return callback(new Error(`locize project ${this.options.projectId} does not exist!`))
        }
        this.somethingLoaded = true;
        callback(err, ret);
      });
    }

    getOptions (callback) {
      this.getLanguages((err, data) => {
        if (err) return callback(err)
        const keys = Object.keys(data);
        if (!keys.length) { return callback(new Error('was unable to load languages via API')) }

        const referenceLng = keys.reduce((mem, k) => {
          const item = data[k];
          if (item.isReferenceLanguage) mem = k;
          return mem
        }, '');

        const lngs = keys.reduce((mem, k) => {
          const item = data[k];
          if (
            item.translated[this.options.version] &&
            item.translated[this.options.version] >=
              this.options.translatedPercentageThreshold
          ) { mem.push(k); }
          return mem
        }, []);

        const hasRegion = keys.reduce((mem, k) => {
          if (k.indexOf('-') > -1) return true
          return mem
        }, false);

        callback(null, {
          fallbackLng: referenceLng,
          referenceLng,
          supportedLngs: lngs,
          // temporal backwards compatibility WHITELIST REMOVAL
          whitelist: lngs,
          // end temporal backwards compatibility WHITELIST REMOVAL
          load: hasRegion ? 'all' : 'languageOnly'
        });
      });
    }

    checkIfProjectExists (callback) {
      const { logger } = this.services;
      if (this.somethingLoaded) {
        if (callback) callback(null);
        return
      }
      if (this.alreadyRequestedCheckIfProjectExists) {
        setTimeout(() => this.checkIfProjectExists(callback), this.options.checkForProjectTimeout);
        return
      }
      this.alreadyRequestedCheckIfProjectExists = true;
      this.getLanguages((err) => {
        if (err && err.message && err.message.indexOf('does not exist') > 0) {
          if (logger) logger.error(err.message);
        }
        if (callback) callback(err);
      });
    }

    read (language, namespace, callback) {
      const { logger } = this.services || { logger: console };
      let url;
      let options = {};
      if (this.options.private) {
        const isMissing = isMissingOption(this.options, ['projectId', 'version', 'apiKey']);
        if (isMissing) return callback(new Error(isMissing), false)

        url = interpolate(this.options.privatePath, {
          lng: language,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
        options = { authorize: true };
      } else {
        const isMissing = isMissingOption(this.options, ['projectId', 'version']);
        if (isMissing) return callback(new Error(isMissing), false)

        url = interpolate(this.options.loadPath, {
          lng: language,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
      }

      if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) {
        this.isProjectNotExisting = true;
      }

      if (this.isProjectNotExisting) {
        const err = new Error(`locize project ${this.options.projectId} does not exist!`);
        if (logger) logger.error(err.message);
        if (callback) callback(err);
        return
      }

      this.loadUrl(options, url, (err, ret, info) => {
        if (!this.somethingLoaded) {
          if (info && info.resourceNotExisting) {
            setTimeout(() => this.checkIfProjectExists(), this.options.checkForProjectTimeout);
          } else {
            this.somethingLoaded = true;
          }
        }
        callback(err, ret);
      });
    }

    loadUrl (options, url, payload, callback) {
      options = defaults(options, this.options);
      if (typeof payload === 'function') {
        callback = payload;
        payload = undefined;
      }
      callback = callback || (() => {});
      request(options, url, payload, (err, res) => {
        const resourceNotExisting = res && res.resourceNotExisting;

        if (res && (res.status === 408 || res.status === 400)) { // extras for timeouts on cloudfront
          return callback('failed loading ' + url, true /* retry */, { resourceNotExisting })
        }
        if (res && res.status >= 500 && res.status < 600) { return callback('failed loading ' + url, true /* retry */, { resourceNotExisting }) }
        if (res && res.status >= 400 && res.status < 500) { return callback('failed loading ' + url, false /* no retry */, { resourceNotExisting }) }
        if (err) return callback(err, false)

        let ret, parseErr;
        try {
          ret = JSON.parse(res.data);
        } catch (e) {
          parseErr = 'failed parsing ' + url + ' to json';
        }
        if (parseErr) return callback(parseErr, false)
        if (this.options.failLoadingOnEmptyJSON && !Object.keys(ret).length) { return callback('loaded result empty for ' + url, false, { resourceNotExisting }) }
        callback(null, ret, { resourceNotExisting });
      });
    }

    create (languages, namespace, key, fallbackValue, callback, options) {
      if (!callback) callback = () => {};

      this.checkIfProjectExists((err) => {
        if (err) return callback(err)

        // missing options
        const isMissing = isMissingOption(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
        if (isMissing) return callback(new Error(isMissing))

        // unallowed host
        if (!this.isAddOrUpdateAllowed) { return callback('host is not allowed to create key.') }

        if (typeof languages === 'string') languages = [languages];

        if (languages.filter(l => l === this.options.referenceLng).length < 1) {
          this.services &&
            this.services.logger &&
            this.services.logger.warn(
              `locize-backend: will not save missings because the reference language "${
              this.options.referenceLng
            }" was not in the list of to save languages: ${languages.join(
              ', '
            )} (open your site in the reference language to save missings).`
            );
        }

        languages.forEach(lng => {
          if (lng === this.options.referenceLng) {
            // eslint-disable-next-line no-useless-call
            this.queue.call(
              this,
              this.options.referenceLng,
              namespace,
              key,
              fallbackValue,
              callback,
              options
            );
          }
        });
      });
    }

    update (languages, namespace, key, fallbackValue, callback, options) {
      if (!callback) callback = () => {};

      this.checkIfProjectExists((err) => {
        if (err) return callback(err)

        // missing options
        const isMissing = isMissingOption(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
        if (isMissing) return callback(new Error(isMissing))

        if (!this.isAddOrUpdateAllowed) { return callback('host is not allowed to update key.') }

        if (!options) options = {};
        if (typeof languages === 'string') languages = [languages];

        // mark as update
        options.isUpdate = true;

        languages.forEach(lng => {
          if (lng === this.options.referenceLng) {
            // eslint-disable-next-line no-useless-call
            this.queue.call(
              this,
              this.options.referenceLng,
              namespace,
              key,
              fallbackValue,
              callback,
              options
            );
          }
        });
      });
    }

    writePage (lng, namespace, missings, callback) {
      const missingUrl = interpolate(this.options.addPath, {
        lng: lng,
        ns: namespace,
        projectId: this.options.projectId,
        version: this.options.version
      });
      const updatesUrl = interpolate(this.options.updatePath, {
        lng: lng,
        ns: namespace,
        projectId: this.options.projectId,
        version: this.options.version
      });

      let hasMissing = false;
      let hasUpdates = false;
      const payloadMissing = {};
      const payloadUpdate = {};

      missings.forEach(item => {
        const value =
          item.options && item.options.tDescription
            ? {
              value: item.fallbackValue || '',
              context: { text: item.options.tDescription }
            }
            : item.fallbackValue || '';
        if (item.options && item.options.isUpdate) {
          if (!hasUpdates) hasUpdates = true;
          payloadUpdate[item.key] = value;
        } else {
          if (!hasMissing) hasMissing = true;
          payloadMissing[item.key] = value;
        }
      });

      let todo = 0;
      if (hasMissing) todo++;
      if (hasUpdates) todo++;
      const doneOne = (err) => {
        todo--;
        if (!todo) callback(err);
      };

      if (!todo) doneOne();

      if (hasMissing) {
        request(
          defaults({ authorize: true }, this.options),
          missingUrl,
          payloadMissing,
          doneOne
        );
      }

      if (hasUpdates) {
        request(
          defaults({ authorize: true }, this.options),
          updatesUrl,
          payloadUpdate,
          doneOne
        );
      }
    }

    write (lng, namespace) {
      const lock = getPath(this.queuedWrites, ['locks', lng, namespace]);
      if (lock) return

      const missings = getPath(this.queuedWrites, [lng, namespace]);
      setPath(this.queuedWrites, [lng, namespace], []);
      const pageSize = 1000;

      if (missings.length) {
        // lock
        setPath(this.queuedWrites, ['locks', lng, namespace], true);

        const namespaceSaved = () => {
          // unlock
          setPath(this.queuedWrites, ['locks', lng, namespace], false);

          missings.forEach(missing => {
            if (missing.callback) missing.callback();
          });

          // emit notification onSaved
          if (this.options.onSaved) this.options.onSaved(lng, namespace);

          // rerun
          this.debouncedProcess(lng, namespace);
        };

        const amountOfPages = missings.length / pageSize;
        let pagesDone = 0;

        let page = missings.splice(0, pageSize);
        this.writePage(lng, namespace, page, () => {
          pagesDone++;
          if (pagesDone >= amountOfPages) namespaceSaved();
        });
        while (page.length === pageSize) {
          page = missings.splice(0, pageSize);
          if (page.length) {
            this.writePage(lng, namespace, page, () => {
              pagesDone++;
              if (pagesDone >= amountOfPages) namespaceSaved();
            });
          }
        }
      }
    }

    process () {
      Object.keys(this.queuedWrites).forEach(lng => {
        if (lng === 'locks') return
        Object.keys(this.queuedWrites[lng]).forEach(ns => {
          const todo = this.queuedWrites[lng][ns];
          if (todo.length) {
            this.write(lng, ns);
          }
        });
      });
    }

    queue (lng, namespace, key, fallbackValue, callback, options) {
      pushPath(this.queuedWrites, [lng, namespace], {
        key: key,
        fallbackValue: fallbackValue || '',
        callback: callback,
        options
      });

      this.debouncedProcess();
    }
  }

  I18NextLocizeBackend.type = 'backend';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var arr$1 = [];
  var each$1 = arr$1.forEach;
  var slice$1 = arr$1.slice;
  function defaults$1(obj) {
    each$1.call(slice$1.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }

  var cookie = {
    create: function create(name, value, minutes, domain) {
      var cookieOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        path: '/'
      };
      var expires;

      if (minutes) {
        var date = new Date();
        date.setTime(date.getTime() + minutes * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      } else expires = '';

      domain = domain ? 'domain=' + domain + ';' : '';
      cookieOptions = Object.keys(cookieOptions).reduce(function (acc, key) {
        return acc + ';' + key.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        }) + '=' + cookieOptions[key];
      }, '');
      document.cookie = name + '=' + encodeURIComponent(value) + expires + ';' + domain + cookieOptions;
    },
    read: function read(name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }

      return null;
    },
    remove: function remove(name) {
      this.create(name, '', -1);
    }
  };
  var cookie$1 = {
    name: 'cookie',
    lookup: function lookup(options) {
      var found;

      if (options.lookupCookie && typeof document !== 'undefined') {
        var c = cookie.read(options.lookupCookie);
        if (c) found = c;
      }

      return found;
    },
    cacheUserLanguage: function cacheUserLanguage(lng, options) {
      if (options.lookupCookie && typeof document !== 'undefined') {
        cookie.create(options.lookupCookie, lng, options.cookieMinutes, options.cookieDomain, options.cookieOptions);
      }
    }
  };

  var querystring = {
    name: 'querystring',
    lookup: function lookup(options) {
      var found;

      if (typeof window !== 'undefined') {
        var query = window.location.search.substring(1);
        var params = query.split('&');

        for (var i = 0; i < params.length; i++) {
          var pos = params[i].indexOf('=');

          if (pos > 0) {
            var key = params[i].substring(0, pos);

            if (key === options.lookupQuerystring) {
              found = params[i].substring(pos + 1);
            }
          }
        }
      }

      return found;
    }
  };

  var hasLocalStorageSupport$1;

  try {
    hasLocalStorageSupport$1 = window !== 'undefined' && window.localStorage !== null;
    var testKey = 'i18next.translate.boo';
    window.localStorage.setItem(testKey, 'foo');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    hasLocalStorageSupport$1 = false;
  }

  var localStorage = {
    name: 'localStorage',
    lookup: function lookup(options) {
      var found;

      if (options.lookupLocalStorage && hasLocalStorageSupport$1) {
        var lng = window.localStorage.getItem(options.lookupLocalStorage);
        if (lng) found = lng;
      }

      return found;
    },
    cacheUserLanguage: function cacheUserLanguage(lng, options) {
      if (options.lookupLocalStorage && hasLocalStorageSupport$1) {
        window.localStorage.setItem(options.lookupLocalStorage, lng);
      }
    }
  };

  var hasSessionStorageSupport;

  try {
    hasSessionStorageSupport = window !== 'undefined' && window.sessionStorage !== null;
    var testKey$1 = 'i18next.translate.boo';
    window.sessionStorage.setItem(testKey$1, 'foo');
    window.sessionStorage.removeItem(testKey$1);
  } catch (e) {
    hasSessionStorageSupport = false;
  }

  var sessionStorage = {
    name: 'sessionStorage',
    lookup: function lookup(options) {
      var found;

      if (options.lookupsessionStorage && hasSessionStorageSupport) {
        var lng = window.sessionStorage.getItem(options.lookupsessionStorage);
        if (lng) found = lng;
      }

      return found;
    },
    cacheUserLanguage: function cacheUserLanguage(lng, options) {
      if (options.lookupsessionStorage && hasSessionStorageSupport) {
        window.sessionStorage.setItem(options.lookupsessionStorage, lng);
      }
    }
  };

  var navigator$1 = {
    name: 'navigator',
    lookup: function lookup(options) {
      var found = [];

      if (typeof navigator !== 'undefined') {
        if (navigator.languages) {
          // chrome only; not an array, so can't use .push.apply instead of iterating
          for (var i = 0; i < navigator.languages.length; i++) {
            found.push(navigator.languages[i]);
          }
        }

        if (navigator.userLanguage) {
          found.push(navigator.userLanguage);
        }

        if (navigator.language) {
          found.push(navigator.language);
        }
      }

      return found.length > 0 ? found : undefined;
    }
  };

  var htmlTag = {
    name: 'htmlTag',
    lookup: function lookup(options) {
      var found;
      var htmlTag = options.htmlTag || (typeof document !== 'undefined' ? document.documentElement : null);

      if (htmlTag && typeof htmlTag.getAttribute === 'function') {
        found = htmlTag.getAttribute('lang');
      }

      return found;
    }
  };

  var path = {
    name: 'path',
    lookup: function lookup(options) {
      var found;

      if (typeof window !== 'undefined') {
        var language = window.location.pathname.match(/\/([a-zA-Z-]*)/g);

        if (language instanceof Array) {
          if (typeof options.lookupFromPathIndex === 'number') {
            if (typeof language[options.lookupFromPathIndex] !== 'string') {
              return undefined;
            }

            found = language[options.lookupFromPathIndex].replace('/', '');
          } else {
            found = language[0].replace('/', '');
          }
        }
      }

      return found;
    }
  };

  var subdomain = {
    name: 'subdomain',
    lookup: function lookup(options) {
      var found;

      if (typeof window !== 'undefined') {
        var language = window.location.href.match(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/gi);

        if (language instanceof Array) {
          if (typeof options.lookupFromSubdomainIndex === 'number') {
            found = language[options.lookupFromSubdomainIndex].replace('http://', '').replace('https://', '').replace('.', '');
          } else {
            found = language[0].replace('http://', '').replace('https://', '').replace('.', '');
          }
        }
      }

      return found;
    }
  };

  function getDefaults$1() {
    return {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      // cache user language
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'] //cookieMinutes: 10,
      //cookieDomain: 'myDomain'

    };
  }

  var Browser =
  /*#__PURE__*/
  function () {
    function Browser(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Browser);

      this.type = 'languageDetector';
      this.detectors = {};
      this.init(services, options);
    }

    _createClass(Browser, [{
      key: "init",
      value: function init(services) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i18nOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        this.services = services;
        this.options = defaults$1(options, this.options || {}, getDefaults$1()); // backwards compatibility

        if (this.options.lookupFromUrlIndex) this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex;
        this.i18nOptions = i18nOptions;
        this.addDetector(cookie$1);
        this.addDetector(querystring);
        this.addDetector(localStorage);
        this.addDetector(sessionStorage);
        this.addDetector(navigator$1);
        this.addDetector(htmlTag);
        this.addDetector(path);
        this.addDetector(subdomain);
      }
    }, {
      key: "addDetector",
      value: function addDetector(detector) {
        this.detectors[detector.name] = detector;
      }
    }, {
      key: "detect",
      value: function detect(detectionOrder) {
        var _this = this;

        if (!detectionOrder) detectionOrder = this.options.order;
        var detected = [];
        detectionOrder.forEach(function (detectorName) {
          if (_this.detectors[detectorName]) {
            var lookup = _this.detectors[detectorName].lookup(_this.options);

            if (lookup && typeof lookup === 'string') lookup = [lookup];
            if (lookup) detected = detected.concat(lookup);
          }
        });
        if (this.services.languageUtils.getBestMatchFromCodes) return detected; // new i18next v19.5.0

        return detected.length > 0 ? detected[0] : null; // a little backward compatibility
      }
    }, {
      key: "cacheUserLanguage",
      value: function cacheUserLanguage(lng, caches) {
        var _this2 = this;

        if (!caches) caches = this.options.caches;
        if (!caches) return;
        if (this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(lng) > -1) return;
        caches.forEach(function (cacheName) {
          if (_this2.detectors[cacheName]) _this2.detectors[cacheName].cacheUserLanguage(lng, _this2.options);
        });
      }
    }]);

    return Browser;
  }();

  Browser.type = 'languageDetector';

  const arr$2 = [];
  const each$2 = arr$2.forEach;
  const slice$2 = arr$2.slice;

  function defaults$2 (obj) {
    each$2.call(slice$2.call(arguments, 1), (source) => {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj
  }

  function debounce$1 (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this; var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }

  function isMissingOption$1 (obj, props) {
    return props.reduce((mem, p) => {
      if (mem) return mem
      if (!obj || !obj[p] || typeof obj[p] !== 'string' || !obj[p].toLowerCase() === p.toLowerCase()) {
        const err = `i18next-lastused :: got "${obj[p]}" in options for ${p} which is invalid.`;
        console.warn(err);
        return err
      }
      return false
    }, false)
  }

  function replaceIn (str, arr, options) {
    let ret = str;
    arr.forEach(s => {
      const regexp = new RegExp(`{{${s}}}`, 'g');
      ret = ret.replace(regexp, options[s]);
    });
    return ret
  }

  var fetchApi$2;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$2 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$2 = window.fetch;
    }
  }

  if (typeof require !== 'undefined' && (typeof window === 'undefined' || typeof window.document === 'undefined')) {
    var f$1 = fetchApi$2 || require('node-fetch');
    if (f$1.default) f$1 = f$1.default;
    exports.default = f$1;
    module.exports = exports.default;
  }

  var fetchNode$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  let fetchApi$3;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$3 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$3 = window.fetch;
    }
  }
  let XmlHttpRequestApi$1;
  if (typeof XMLHttpRequest === 'function') {
    if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequestApi$1 = global.XMLHttpRequest;
    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequestApi$1 = window.XMLHttpRequest;
    }
  }
  let ActiveXObjectApi$1;
  if (typeof ActiveXObject === 'function') {
    if (typeof global !== 'undefined' && global.ActiveXObject) {
      ActiveXObjectApi$1 = global.ActiveXObject;
    } else if (typeof window !== 'undefined' && window.ActiveXObject) {
      ActiveXObjectApi$1 = window.ActiveXObject;
    }
  }
  if (!fetchApi$3 && fetchNode$1 && !XmlHttpRequestApi$1 && !ActiveXObjectApi$1) fetchApi$3 = undefined || fetchNode$1; // because of strange export
  if (typeof fetchApi$3 !== 'function') fetchApi$3 = undefined;

  // fetch api stuff
  const requestWithFetch$1 = (options, url, payload, callback) => {
    fetchApi$3(url, {
      method: payload ? 'POST' : 'GET',
      body: payload ? JSON.stringify(payload) : undefined,
      headers: {
        Authorization: options.authorize && options.apiKey ? options.apiKey : undefined,
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      const resourceNotExisting = response.headers && response.headers.get('x-cache') === 'Error from cloudfront';
      if (!response.ok) return callback(response.statusText || 'Error', { status: response.status, resourceNotExisting })
      response.text().then((data) => {
        callback(null, { status: response.status, data, resourceNotExisting });
      }).catch(callback);
    }).catch(callback);
  };

  // xml http request stuff
  const requestWithXmlHttpRequest$1 = (options, url, payload, callback) => {
    try {
      let x;
      if (XmlHttpRequestApi$1) {
        x = new XmlHttpRequestApi$1();
      } else {
        x = new ActiveXObjectApi$1('MSXML2.XMLHTTP.3.0');
      }
      x.open(payload ? 'POST' : 'GET', url, 1);
      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      if (options.authorize && options.apiKey) {
        x.setRequestHeader('Authorization', options.apiKey);
      }
      if (payload || options.setContentTypeJSON) {
        x.setRequestHeader('Content-Type', 'application/json');
      }
      x.onreadystatechange = () => {
        const resourceNotExisting = x.getResponseHeader('x-cache') === 'Error from cloudfront';
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, { status: x.status, data: x.responseText, resourceNotExisting });
      };
      x.send(JSON.stringify(payload));
    } catch (e) {
      console && console.log(e);
    }
  };

  const request$1 = (options, url, payload, callback) => {
    if (typeof payload === 'function') {
      callback = payload;
      payload = undefined;
    }
    callback = callback || (() => {});

    if (fetchApi$3) {
      // use fetch api
      return requestWithFetch$1(options, url, payload, callback)
    }

    if (typeof XMLHttpRequest === 'function' || typeof ActiveXObject === 'function') {
      // use xml http request
      return requestWithXmlHttpRequest$1(options, url, payload, callback)
    }

    // import('node-fetch').then((fetch) => {
    //   fetchApi = fetch.default || fetch // because of strange export of node-fetch
    //   requestWithFetch(options, url, payload, callback)
    // }).catch(callback)
  };

  const getDefaults$2 = () => {
    return {
      lastUsedPath: 'https://api.locize.app/used/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      referenceLng: 'en',
      crossDomain: true,
      setContentTypeJSON: false,
      version: 'latest',
      debounceSubmit: 90000,
      allowedHosts: ['localhost']
    }
  };

  const locizeLastUsed = {
    init (options) {
      const isI18next = options.t && typeof options.t === 'function';

      this.options = isI18next ? defaults$2(options.options.locizeLastUsed, this.options || {}, getDefaults$2()) : defaults$2(options, this.options || {}, getDefaults$2());

      const hostname = typeof window !== 'undefined' && window.location && window.location.hostname;
      if (hostname) {
        this.isAllowed = this.options.allowedHosts.indexOf(hostname) > -1;
      } else {
        this.isAllowed = true;
      }

      this.submitting = null;
      this.pending = {};
      this.done = {};

      this.submit = debounce$1(this.submit, this.options.debounceSubmit);

      // intercept
      if (isI18next) this.interceptI18next(options);
    },

    interceptI18next (i18next) {
      const origGetResource = i18next.services.resourceStore.getResource;

      i18next.services.resourceStore.getResource = (lng, ns, key, options) => {
        // call last used
        if (key) this.used(ns, key);

        // by pass orginal call
        return origGetResource.call(i18next.services.resourceStore, lng, ns, key, options)
      };
    },

    used (ns, key, callback) {
      ['pending', 'done'].forEach((k) => {
        if (this.done[ns] && this.done[ns][key]) return
        if (!this[k][ns]) this[k][ns] = {};
        this[k][ns][key] = true;
      });

      this.submit(callback);
    },

    submit (callback) {
      if (!this.isAllowed) return callback && callback(new Error('not allowed'))
      if (this.submitting) return this.submit(callback)

      // missing options
      const isMissing = isMissingOption$1(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
      if (isMissing) return callback && callback(new Error(isMissing))

      this.submitting = this.pending;
      this.pending = {};

      const namespaces = Object.keys(this.submitting);

      let todo = namespaces.length;
      const doneOne = (err) => {
        todo--;
        if (!todo) {
          this.submitting = null;
          if (callback) callback(err);
        }
      };
      namespaces.forEach((ns) => {
        const keys = Object.keys(this.submitting[ns]);
        const url = replaceIn(this.options.lastUsedPath, ['projectId', 'version', 'lng', 'ns'], defaults$2({ lng: this.options.referenceLng, ns }, this.options));

        if (keys.length) {
          request$1(defaults$2({ authorize: true }, this.options), url, keys, doneOne);
        } else {
          doneOne();
        }
      });
    }
  };

  locizeLastUsed.type = '3rdParty';

  var regexp$1 = new RegExp('\{\{(.+?)\}\}', 'g');

  function makeString$1(object) {
    if (object == null) return '';
    return '' + object;
  }

  function interpolate$1(str, data, lng) {
    var match, value;

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    } // regular escape on demand


    while (match = regexp$1.exec(str)) {
      value = match[1].trim();
      if (typeof value !== 'string') value = makeString$1(value);
      if (!value) value = '';
      value = regexSafe(value);
      str = str.replace(match[0], data[value] || value);
      regexp$1.lastIndex = 0;
    }

    return str;
  }

  function formatLanguageCode(code) {
    return code;
  }
  function getLanguagePartFromCode(code) {
    if (code.indexOf('-') < 0) return code;
    var specialCases = ['NB-NO', 'NN-NO', 'nb-NO', 'nn-NO', 'nb-no', 'nn-no'];
    var p = code.split('-');
    return specialCases.indexOf(code) > -1 ? p[1].toLowerCase() : p[0];
  }

  var services = {
    interpolator: {
      interpolate: interpolate$1
    },
    languageUtils: {
      formatLanguageCode: formatLanguageCode
    }
  };
  var locizer = {
    init: function init(options) {
      this.options = options;
      this.backend = new I18NextLocizeBackend(services, options);
      this.detector = new Browser(services, options);
      this.lng = options.lng || this.detector.detect();
      locizeLastUsed.init(options);
      return this;
    },
    getLanguage: function getLanguage(lng, callback) {
      var _this = this;

      if (typeof lng === 'function') {
        callback = lng;
        lng = this.lng;
      }

      if (!lng) lng = this.lng;

      var isValid = function isValid(lngs, l) {
        return lngs[l] && lngs[l].translated[_this.options.version || 'latest'] >= (_this.options.loadIfTranslatedOver || 1);
      };

      this.getLanguages(function (err, lngs) {
        if (isValid(lngs, lng)) return callback(null, lng);
        if (isValid(lngs, getLanguagePartFromCode(lng))) return callback(null, getLanguagePartFromCode(lng));
        callback(null, _this.options.fallbackLng || Object.keys(lngs)[0]);
      });
      return this;
    },
    getLanguages: function getLanguages(callback) {
      var _this2 = this;

      if (this.publishedLngs) {
        callback(null, this.publishedLngs);
      } else {
        this.backend.getLanguages(function (err, data) {
          if (!err) _this2.publishedLngs = data;
          callback(null, data);
        });
      }

      return this;
    },
    load: function load(ns, lng, callback) {
      var _this3 = this;

      if (typeof lng === 'function') {
        callback = lng;
        lng = null;
      }

      this.getLanguage(lng, function (err, lng) {
        _this3.backend.read(lng, ns, function (err, data) {
          return callback(err, data, lng);
        });
      });
      return this;
    },
    add: function add(namespace, key, value, context, callback) {
      var options = {};

      if (typeof context === 'function') {
        callback = context;
      } else if (typeof context === 'string') {
        options.tDescription = context;
      }

      this.backend.create(this.options.referenceLng, namespace, key, value, callback, options);
      return this;
    },
    update: function update(namespace, key, value, context, callback) {
      var options = {
        isUpdate: true
      };

      if (typeof context === 'function') {
        callback = context;
      } else if (typeof context === 'string') {
        options.tDescription = context;
      }

      this.backend.create(this.options.referenceLng, namespace, key, value, callback, options);
      return this;
    },
    used: function used(namespace, key) {
      locizeLastUsed.used(namespace, key);
    }
  };

  return locizer;

})));
