(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.locizer = factory());
}(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

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

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
          args = arguments;

      var later = function later() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function getLastOfPath(object, path, Empty) {
    function cleanKey(key) {
      return key && key.indexOf('###') > -1 ? key.replace(/###/g, '.') : key;
    }

    var stack = typeof path !== 'string' ? [].concat(path) : path.split('.');

    while (stack.length > 1) {
      if (!object) return {};
      var key = cleanKey(stack.shift());
      if (!object[key] && Empty) object[key] = new Empty();
      object = object[key];
    }

    if (!object) return {};
    return {
      obj: object,
      k: cleanKey(stack.shift())
    };
  }

  function setPath(object, path, newValue) {
    var _getLastOfPath = getLastOfPath(object, path, Object),
        obj = _getLastOfPath.obj,
        k = _getLastOfPath.k;

    obj[k] = newValue;
  }
  function pushPath(object, path, newValue, concat) {
    var _getLastOfPath2 = getLastOfPath(object, path, Object),
        obj = _getLastOfPath2.obj,
        k = _getLastOfPath2.k;

    obj[k] = obj[k] || [];
    if (concat) obj[k] = obj[k].concat(newValue);
    if (!concat) obj[k].push(newValue);
  }
  function getPath(object, path) {
    var _getLastOfPath3 = getLastOfPath(object, path),
        obj = _getLastOfPath3.obj,
        k = _getLastOfPath3.k;

    if (!obj) return undefined;
    return obj[k];
  }
  var regexp = new RegExp('\{\{(.+?)\}\}', 'g');

  function makeString(object) {
    if (object == null) return '';
    return '' + object;
  }

  function interpolate(str, data, lng) {
    var match, value;

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    } // regular escape on demand


    while (match = regexp.exec(str)) {
      value = match[1].trim();
      if (typeof value !== 'string') value = makeString(value);
      if (!value) value = '';
      value = regexSafe(value);
      str = str.replace(match[0], data[value] || value);
      regexp.lastIndex = 0;
    }

    return str;
  }
  function isMissingOption(obj, props) {
    return props.reduce(function (mem, p) {
      if (mem) return mem;

      if (!obj || !obj[p] || typeof obj[p] !== 'string' || !obj[p].toLowerCase() === p.toLowerCase()) {
        var err = "i18next-locize-backend :: got \"".concat(obj[p], "\" in options for ").concat(p, " which is invalid.");
        console.warn(err);
        return err;
      }

      return false;
    }, false);
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function ajax(url, options, callback, data, cache) {
    try {
      var x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
      x.open(data ? 'POST' : 'GET', url, 1);

      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }

      if (options.authorize && options.apiKey) {
        x.setRequestHeader('Authorization', options.apiKey);
      }

      if (data || options.setContentTypeJSON) {
        x.setRequestHeader('Content-type', 'application/json');
      }

      x.onreadystatechange = function () {
        x.readyState > 3 && callback && callback(x.responseText, x);
      };

      x.send(JSON.stringify(data));
    } catch (e) {
      typeof window !== 'undefined' && window.console && console.log(e);
    }
  }

  function getDefaults() {
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
      "private": false,
      whitelistThreshold: 0.9,
      failLoadingOnEmptyJSON: false,
      // useful if using chained backend
      allowedAddOrUpdateHosts: ['localhost'],
      onSaved: false,
      checkForProjectTimeout: 3 * 1000,
      storageExpiration: 60 * 60 * 1000
    };
  }

  var hasLocalStorageSupport;

  try {
    hasLocalStorageSupport = window !== 'undefined' && window.localStorage !== null;
    var testKey = 'notExistingLocizeProject';
    window.localStorage.setItem(testKey, 'foo');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    hasLocalStorageSupport = false;
  }

  function getStorage(storageExpiration) {
    var setProjectNotExisting = function setProjectNotExisting() {};

    var isProjectNotExisting = function isProjectNotExisting() {};

    if (hasLocalStorageSupport) {
      setProjectNotExisting = function setProjectNotExisting(projectId) {
        window.localStorage.setItem("notExistingLocizeProject_".concat(projectId), Date.now());
      };

      isProjectNotExisting = function isProjectNotExisting(projectId) {
        var ret = window.localStorage.getItem("notExistingLocizeProject_".concat(projectId));
        if (!ret) return false;

        if (Date.now() - ret > storageExpiration) {
          window.localStorage.removeItem("notExistingLocizeProject_".concat(projectId));
          return false;
        }

        return true;
      };
    } else {
      setProjectNotExisting = function setProjectNotExisting(projectId) {
        var date = new Date();
        date.setTime(date.getTime() + storageExpiration);
        var expires = "; expires=".concat(date.toGMTString());
        var name = "notExistingLocizeProject_".concat(projectId);
        document.cookie = "".concat(name, "=").concat(Date.now()).concat(expires, ";path=/");
      };

      isProjectNotExisting = function isProjectNotExisting(projectId) {
        var name = "notExistingLocizeProject_".concat(projectId);
        var nameEQ = "".concat(name, "=");
        var ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];

          while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
          }

          if (c.indexOf(nameEQ) === 0) return true; // return c.substring(nameEQ.length,c.length);
        }

        return false;
      };
    }

    return {
      setProjectNotExisting: setProjectNotExisting,
      isProjectNotExisting: isProjectNotExisting
    };
  }

  var I18NextLocizeBackend =
  /*#__PURE__*/
  function () {
    function I18NextLocizeBackend(services, options, callback) {
      _classCallCheck(this, I18NextLocizeBackend);

      if (services && services.projectId) {
        this.init(null, services, {}, options);
      } else {
        this.init(null, options, {}, callback);
      }

      this.type = 'backend';
    }

    _createClass(I18NextLocizeBackend, [{
      key: "init",
      value: function init(services) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i18nextOptions = arguments.length > 2 ? arguments[2] : undefined;
        var callback = arguments.length > 3 ? arguments[3] : undefined;
        this.options = _objectSpread({}, getDefaults(), {}, this.options, {}, options); // initial

        this.services = services;
        this.somethingLoaded = false;
        this.isProjectNotExisting = false;
        this.storage = getStorage(this.options.storageExpiration);
        if (this.options.pull) console.warn('The pull API was removed use "private: true" option instead: https://docs.locize.com/integration/api#fetch-private-namespace-resources');
        var hostname = typeof window !== 'undefined' && window.location && window.location.hostname;

        if (hostname) {
          this.isAddOrUpdateAllowed = typeof this.options.allowedAddOrUpdateHosts === 'function' ? this.options.allowedAddOrUpdateHosts(hostname) : this.options.allowedAddOrUpdateHosts.indexOf(hostname) > -1;
          if (i18nextOptions.saveMissing && !this.isAddOrUpdateAllowed) services && services.logger && services.logger.warn(typeof this.options.allowedAddOrUpdateHosts === 'function' ? "locize-backend: will not save missings because allowedAddOrUpdateHosts returned false for the host \"".concat(hostname, "\".") : "locize-backend: will not save missings because the host \"".concat(hostname, "\" was not in the list of allowedAddOrUpdateHosts: ").concat(this.options.allowedAddOrUpdateHosts.join(', '), " (matches need to be exact)."));
        } else {
          this.isAddOrUpdateAllowed = true;
        }

        if (typeof callback === 'function') {
          this.getOptions(function (err, opts) {
            if (err) return callback(err);
            _this.options.referenceLng = options.referenceLng || opts.referenceLng || _this.options.referenceLng;
            callback(null, opts);
          });
        }

        this.queuedWrites = {};
        this.debouncedProcess = debounce(this.process, 10000);
      }
    }, {
      key: "getLanguages",
      value: function getLanguages(callback) {
        var _this2 = this;

        var isMissing = isMissingOption(this.options, ['projectId']);
        if (isMissing) return callback(new Error(isMissing));
        var url = interpolate(this.options.getLanguagesPath, {
          projectId: this.options.projectId
        });

        if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) {
          this.isProjectNotExisting = true;
        }

        if (this.isProjectNotExisting) return callback(new Error("locize project ".concat(this.options.projectId, " does not exist!")));
        this.loadUrl(url, {}, function (err, ret, info) {
          if (!_this2.somethingLoaded && info && info.resourceNotExisting) {
            _this2.isProjectNotExisting = true;

            _this2.storage.setProjectNotExisting(_this2.options.projectId);

            return callback(new Error("locize project ".concat(_this2.options.projectId, " does not exist!")));
          }

          _this2.somethingLoaded = true;
          callback(err, ret);
        });
      }
    }, {
      key: "getOptions",
      value: function getOptions(callback) {
        var _this3 = this;

        this.getLanguages(function (err, data) {
          if (err) return callback(err);
          var keys = Object.keys(data);
          if (!keys.length) return callback(new Error('was unable to load languages via API'));
          var referenceLng = keys.reduce(function (mem, k) {
            var item = data[k];
            if (item.isReferenceLanguage) mem = k;
            return mem;
          }, '');
          var whitelist = keys.reduce(function (mem, k) {
            var item = data[k];
            if (item.translated[_this3.options.version] && item.translated[_this3.options.version] >= _this3.options.whitelistThreshold) mem.push(k);
            return mem;
          }, []);
          var hasRegion = keys.reduce(function (mem, k) {
            if (k.indexOf('-') > -1) return true;
            return mem;
          }, false);
          callback(null, {
            fallbackLng: referenceLng,
            referenceLng: referenceLng,
            whitelist: whitelist,
            load: hasRegion ? 'all' : 'languageOnly'
          });
        });
      }
    }, {
      key: "checkIfProjectExists",
      value: function checkIfProjectExists(callback) {
        var logger = this.services.logger;

        if (this.somethingLoaded) {
          if (callback) callback(null);
          return;
        }

        this.getLanguages(function (err) {
          if (err && err.message && err.message.indexOf('does not exist') > 0) {
            if (callback) return callback(err);
            logger.error(err.message);
          }
        });
      }
    }, {
      key: "read",
      value: function read(language, namespace, callback) {
        var _this4 = this;

        var _ref = this.services || {
          logger: console
        },
            logger = _ref.logger;

        var url;
        var options = {};

        if (this.options["private"]) {
          var isMissing = isMissingOption(this.options, ['projectId', 'version', 'apiKey']);
          if (isMissing) return callback(new Error(isMissing), false);
          url = interpolate(this.options.privatePath, {
            lng: language,
            ns: namespace,
            projectId: this.options.projectId,
            version: this.options.version
          });
          options = {
            authorize: true
          };
        } else {
          var _isMissing = isMissingOption(this.options, ['projectId', 'version']);

          if (_isMissing) return callback(new Error(_isMissing), false);
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
          var err = new Error("locize project ".concat(this.options.projectId, " does not exist!"));
          logger.error(err.message);
          if (callback) callback(err);
          return;
        }

        this.loadUrl(url, options, function (err, ret, info) {
          if (!_this4.somethingLoaded) {
            if (info && info.resourceNotExisting) {
              setTimeout(function () {
                return _this4.checkIfProjectExists();
              }, _this4.options.checkForProjectTimeout);
            } else {
              _this4.somethingLoaded = true;
            }
          }

          callback(err, ret);
        });
      }
    }, {
      key: "loadUrl",
      value: function loadUrl(url, options, callback) {
        var _this5 = this;

        ajax(url, _objectSpread({}, this.options, {}, options), function (data, xhr) {
          var resourceNotExisting = xhr.getResponseHeader('x-cache') === 'Error from cloudfront';
          if (xhr.status === 408 || xhr.status === 400) // extras for timeouts on cloudfront
            return callback('failed loading ' + url, true
            /* retry */
            , {
              resourceNotExisting: resourceNotExisting
            });
          if (xhr.status >= 500 && xhr.status < 600) return callback('failed loading ' + url, true
          /* retry */
          , {
            resourceNotExisting: resourceNotExisting
          });
          if (xhr.status >= 400 && xhr.status < 500) return callback('failed loading ' + url, false
          /* no retry */
          , {
            resourceNotExisting: resourceNotExisting
          });
          var ret, err;

          try {
            ret = JSON.parse(data);
          } catch (e) {
            err = 'failed parsing ' + url + ' to json';
          }

          if (err) return callback(err, false);
          if (_this5.options.failLoadingOnEmptyJSON && !Object.keys(ret).length) return callback('loaded result empty for ' + url, false, {
            resourceNotExisting: resourceNotExisting
          });
          callback(null, ret, {
            resourceNotExisting: resourceNotExisting
          });
        });
      }
    }, {
      key: "create",
      value: function create(languages, namespace, key, fallbackValue, callback, options) {
        var _this6 = this;

        if (!callback) callback = function callback() {};
        this.checkIfProjectExists(function (err) {
          if (err) return callback(err); // missing options

          var isMissing = isMissingOption(_this6.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
          if (isMissing) return callback(new Error(isMissing)); // unallowed host

          if (!_this6.isAddOrUpdateAllowed) return callback('host is not allowed to create key.');
          if (typeof languages === 'string') languages = [languages];

          if (languages.filter(function (l) {
            return l === _this6.options.referenceLng;
          }).length < 1) {
            _this6.services && _this6.services.logger && _this6.services.logger.warn("locize-backend: will not save missings because the reference language \"".concat(_this6.options.referenceLng, "\" was not in the list of to save languages: ").concat(languages.join(', '), " (open your site in the reference language to save missings)."));
          }

          languages.forEach(function (lng) {
            if (lng === _this6.options.referenceLng) _this6.queue.call(_this6, _this6.options.referenceLng, namespace, key, fallbackValue, callback, options);
          });
        });
      }
    }, {
      key: "update",
      value: function update(languages, namespace, key, fallbackValue, callback, options) {
        var _this7 = this;

        if (!callback) callback = function callback() {};
        this.checkIfProjectExists(function (err) {
          if (err) return callback(err); // missing options

          var isMissing = isMissingOption(_this7.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
          if (isMissing) return callback(new Error(isMissing));
          if (!_this7.isAddOrUpdateAllowed) return callback('host is not allowed to update key.');
          if (!options) options = {};
          if (typeof languages === 'string') languages = [languages]; // mark as update

          options.isUpdate = true;
          languages.forEach(function (lng) {
            if (lng === _this7.options.referenceLng) _this7.queue.call(_this7, _this7.options.referenceLng, namespace, key, fallbackValue, callback, options);
          });
        });
      }
    }, {
      key: "write",
      value: function write(lng, namespace) {
        var _this8 = this;

        var lock = getPath(this.queuedWrites, ['locks', lng, namespace]);
        if (lock) return;
        var missingUrl = interpolate(this.options.addPath, {
          lng: lng,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
        var updatesUrl = interpolate(this.options.updatePath, {
          lng: lng,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
        var missings = getPath(this.queuedWrites, [lng, namespace]);
        setPath(this.queuedWrites, [lng, namespace], []);

        if (missings.length) {
          // lock
          setPath(this.queuedWrites, ['locks', lng, namespace], true);
          var hasMissing = false;
          var hasUpdates = false;
          var payloadMissing = {};
          var payloadUpdate = {};
          missings.forEach(function (item) {
            var value = item.options && item.options.tDescription ? {
              value: item.fallbackValue || '',
              context: {
                text: item.options.tDescription
              }
            } : item.fallbackValue || '';

            if (item.options && item.options.isUpdate) {
              if (!hasUpdates) hasUpdates = true;
              payloadUpdate[item.key] = value;
            } else {
              if (!hasMissing) hasMissing = true;
              payloadMissing[item.key] = value;
            }
          });
          var todo = 0;
          if (hasMissing) todo++;
          if (hasUpdates) todo++;

          var doneOne = function doneOne() {
            todo--;

            if (!todo) {
              // unlock
              setPath(_this8.queuedWrites, ['locks', lng, namespace], false);
              missings.forEach(function (missing) {
                if (missing.callback) missing.callback();
              }); // emit notification onSaved

              if (_this8.options.onSaved) _this8.options.onSaved(lng, namespace); // rerun

              _this8.debouncedProcess(lng, namespace);
            }
          };

          if (!todo) doneOne();

          if (hasMissing) {
            ajax(missingUrl, _objectSpread({}, {
              authorize: true
            }, {}, this.options), function (data, xhr) {
              //const statusCode = xhr.status.toString();
              // TODO: if statusCode === 4xx do log
              doneOne();
            }, payloadMissing);
          }

          if (hasUpdates) {
            ajax(updatesUrl, _objectSpread({}, {
              authorize: true
            }, {}, this.options), function (data, xhr) {
              //const statusCode = xhr.status.toString();
              // TODO: if statusCode === 4xx do log
              doneOne();
            }, payloadUpdate);
          }
        }
      }
    }, {
      key: "process",
      value: function process() {
        var _this9 = this;

        Object.keys(this.queuedWrites).forEach(function (lng) {
          if (lng === 'locks') return;
          Object.keys(_this9.queuedWrites[lng]).forEach(function (ns) {
            var todo = _this9.queuedWrites[lng][ns];

            if (todo.length) {
              _this9.write(lng, ns);
            }
          });
        });
      }
    }, {
      key: "queue",
      value: function queue(lng, namespace, key, fallbackValue, callback, options) {
        pushPath(this.queuedWrites, [lng, namespace], {
          key: key,
          fallbackValue: fallbackValue || '',
          callback: callback,
          options: options
        });
        this.debouncedProcess();
      }
    }]);

    return I18NextLocizeBackend;
  }();

  I18NextLocizeBackend.type = 'backend';

  var arr = [];
  var each = arr.forEach;
  var slice = arr.slice;
  function defaults(obj) {
    each.call(slice.call(arguments, 1), function (source) {
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
      var expires;

      if (minutes) {
        var date = new Date();
        date.setTime(date.getTime() + minutes * 60 * 1000);
        expires = '; expires=' + date.toGMTString();
      } else expires = '';

      domain = domain ? 'domain=' + domain + ';' : '';
      document.cookie = name + '=' + value + expires + ';' + domain + 'path=/';
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
        cookie.create(options.lookupCookie, lng, options.cookieMinutes, options.cookieDomain);
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
    var testKey$1 = 'i18next.translate.boo';
    window.localStorage.setItem(testKey$1, 'foo');
    window.localStorage.removeItem(testKey$1);
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
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      // cache user language
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      //cookieMinutes: 10,
      //cookieDomain: 'myDomain'
      checkWhitelist: true
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
        this.options = defaults(options, this.options || {}, getDefaults$1()); // backwards compatibility

        if (this.options.lookupFromUrlIndex) this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex;
        this.i18nOptions = i18nOptions;
        this.addDetector(cookie$1);
        this.addDetector(querystring);
        this.addDetector(localStorage);
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
        var found;
        detected.forEach(function (lng) {
          if (found) return;

          var cleanedLng = _this.services.languageUtils.formatLanguageCode(lng);

          if (!_this.options.checkWhitelist || _this.services.languageUtils.isWhitelisted(cleanedLng)) found = cleanedLng;
        });

        if (!found) {
          var fallbacks = this.i18nOptions.fallbackLng;
          if (typeof fallbacks === 'string') fallbacks = [fallbacks];
          if (!fallbacks) fallbacks = [];

          if (Object.prototype.toString.apply(fallbacks) === '[object Array]') {
            found = fallbacks[0];
          } else {
            found = fallbacks[0] || fallbacks["default"] && fallbacks["default"][0];
          }
        }

        return found;
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

  function debounce$1(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
          args = arguments;

      var later = function later() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  function replaceIn(str, arr, options) {
    var ret = str;
    arr.forEach(function (s) {
      var regexp = new RegExp("{{".concat(s, "}}"), 'g');
      ret = ret.replace(regexp, options[s]);
    });
    return ret;
  }
  function isMissingOption$1(obj, props) {
    return props.reduce(function (mem, p) {
      if (mem) return mem;

      if (!obj || !obj[p] || typeof obj[p] !== 'string' || !obj[p].toLowerCase() === p.toLowerCase()) {
        var err = "i18next-lastused :: got \"".concat(obj[p], "\" in options for ").concat(p, " which is invalid.");
        console.warn(err);
        return err;
      }

      return false;
    }, false);
  }

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function ajax$1(url, options, callback, data, cache) {
    try {
      var x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
      x.open(data ? 'POST' : 'GET', url, 1);

      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }

      if (options.authorize && options.apiKey) {
        x.setRequestHeader('Authorization', options.apiKey);
      }

      if (data || options.setContentTypeJSON) {
        x.setRequestHeader('Content-type', 'application/json');
      }

      x.onreadystatechange = function () {
        x.readyState > 3 && callback && callback(x.responseText, x);
      };

      x.send(JSON.stringify(data));
    } catch (e) {
      window.console && window.console.log(e);
    }
  }

  function getDefaults$2() {
    return {
      lastUsedPath: 'https://api.locize.app/used/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      referenceLng: 'en',
      crossDomain: true,
      setContentTypeJSON: false,
      version: 'latest',
      debounceSubmit: 90000,
      allowedHosts: ['localhost']
    };
  }

  var locizeLastUsed = {
    init: function init(options) {
      var isI18next = options.t && typeof options.t === 'function';
      this.options = isI18next ? _objectSpread$1({}, getDefaults$2(), {}, this.options, {}, options.options.locizeLastUsed) : _objectSpread$1({}, getDefaults$2(), {}, this.options, {}, options);
      var hostname = window.location && window.location.hostname;

      if (hostname) {
        this.isAllowed = this.options.allowedHosts.indexOf(hostname) > -1;
      } else {
        this.isAllowed = true;
      }

      this.submitting = null;
      this.pending = {};
      this.done = {};
      this.submit = debounce$1(this.submit, this.options.debounceSubmit); // intercept

      if (isI18next) this.interceptI18next(options);
    },
    interceptI18next: function interceptI18next(i18next) {
      var _this = this;

      var origGetResource = i18next.services.resourceStore.getResource;

      i18next.services.resourceStore.getResource = function (lng, ns, key, options) {
        // call last used
        if (key) _this.used(ns, key); // by pass orginal call

        return origGetResource.call(i18next.services.resourceStore, lng, ns, key, options);
      };
    },
    used: function used(ns, key) {
      var _this2 = this;

      ['pending', 'done'].forEach(function (k) {
        if (_this2.done[ns] && _this2.done[ns][key]) return;
        if (!_this2[k][ns]) _this2[k][ns] = {};
        _this2[k][ns][key] = true;
      });
      this.submit();
    },
    submit: function submit() {
      var _this3 = this;

      if (!this.isAllowed) return;
      if (this.submitting) return this.submit(); // missing options

      var isMissing = isMissingOption$1(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
      if (isMissing) return callback(new Error(isMissing));
      this.submitting = this.pending;
      this.pending = {};
      var namespaces = Object.keys(this.submitting);
      var todo = namespaces.length;

      var doneOne = function doneOne() {
        todo--;

        if (!todo) {
          _this3.submitting = null;
        }
      };

      namespaces.forEach(function (ns) {
        var keys = Object.keys(_this3.submitting[ns]);
        var url = replaceIn(_this3.options.lastUsedPath, ['projectId', 'version', 'lng', 'ns'], _objectSpread$1({}, _this3.options, {
          lng: _this3.options.referenceLng,
          ns: ns
        }));

        if (keys.length) {
          ajax$1(url, _objectSpread$1({}, {
            authorize: true
          }, {}, _this3.options), function (data, xhr) {
            doneOne();
          }, keys);
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
  function isWhitelisted(code) {
    return true;
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
      formatLanguageCode: formatLanguageCode,
      isWhitelisted: isWhitelisted
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
