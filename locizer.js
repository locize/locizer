(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.locizer = factory());
})(this, (function () { 'use strict';

  function _typeof$3(o) {
    "@babel/helpers - typeof";

    return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$3(o);
  }

  function toPrimitive(t, r) {
    if ("object" != _typeof$3(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof$3(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }

  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof$3(i) ? i : i + "";
  }

  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }

  var arr$2 = [];
  var each$2 = arr$2.forEach;
  var slice$2 = arr$2.slice;
  function defaults$2(obj) {
    each$2.call(slice$2.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  function debounce$1(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
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
  var regexp$1 = new RegExp('{{(.+?)}}', 'g');
  function makeString$1(object) {
    if (object == null) return '';
    return '' + object;
  }
  function interpolate$1(str, data, lng) {
    var match, value;
    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }
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
  function isMissingOption$1(obj, props) {
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
  function defer() {
    var res;
    var rej;
    var promise = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });
    promise.resolve = res;
    promise.reject = rej;
    return promise;
  }

  var fetchApi$3;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$3 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$3 = window.fetch;
    } else {
      fetchApi$3 = fetch;
    }
  }

  if (typeof require !== 'undefined' && typeof window === 'undefined') {
    var f$1 = fetchApi$3 || require('cross-fetch');
    if (f$1.default) f$1 = f$1.default;
    exports.default = f$1;
    module.exports = exports.default;
  }

  var fetchNode$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  function _typeof$2(o) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$2(o); }
  var fetchApi$2;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$2 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$2 = window.fetch;
    } else {
      fetchApi$2 = fetch;
    }
  }
  var XmlHttpRequestApi$1;
  if (typeof XMLHttpRequest === 'function' || (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof$2(XMLHttpRequest)) === 'object') {
    if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequestApi$1 = global.XMLHttpRequest;
    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequestApi$1 = window.XMLHttpRequest;
    }
  }
  var ActiveXObjectApi$1;
  if (typeof ActiveXObject === 'function') {
    if (typeof global !== 'undefined' && global.ActiveXObject) {
      ActiveXObjectApi$1 = global.ActiveXObject;
    } else if (typeof window !== 'undefined' && window.ActiveXObject) {
      ActiveXObjectApi$1 = window.ActiveXObject;
    }
  }
  if (!fetchApi$2 && fetchNode$1 && !XmlHttpRequestApi$1 && !ActiveXObjectApi$1) fetchApi$2 = fetchNode$1;
  if (typeof fetchApi$2 !== 'function') fetchApi$2 = undefined;
  var requestWithFetch$1 = function requestWithFetch(options, url, payload, callback) {
    var headers = {};
    if (typeof window === 'undefined' && typeof global !== 'undefined' && typeof global.process !== 'undefined' && global.process.versions && global.process.versions.node) {
      headers['User-Agent'] = "i18next-locize-backend (node/".concat(global.process.version, "; ").concat(global.process.platform, " ").concat(global.process.arch, ")");
    }
    if (options.authorize && options.apiKey) {
      headers.Authorization = options.apiKey;
    }
    if (payload || options.setContentTypeJSON) {
      headers['Content-Type'] = 'application/json';
    }
    var resolver = function resolver(response) {
      var resourceNotExisting = response.headers && response.headers.get('x-cache') === 'Error from cloudfront';
      if (!response.ok) return callback(response.statusText || 'Error', {
        status: response.status,
        resourceNotExisting: resourceNotExisting
      });
      response.text().then(function (data) {
        callback(null, {
          status: response.status,
          data: data,
          resourceNotExisting: resourceNotExisting
        });
      }).catch(callback);
    };
    if (typeof fetch === 'function') {
      fetch(url, {
        method: payload ? 'POST' : 'GET',
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers
      }).then(resolver).catch(callback);
    } else {
      fetchApi$2(url, {
        method: payload ? 'POST' : 'GET',
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers
      }).then(resolver).catch(callback);
    }
  };
  var requestWithXmlHttpRequest$1 = function requestWithXmlHttpRequest(options, url, payload, callback) {
    try {
      var x;
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
      x.onreadystatechange = function () {
        var resourceNotExisting = x.getResponseHeader('x-cache') === 'Error from cloudfront';
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
          status: x.status,
          data: x.responseText,
          resourceNotExisting: resourceNotExisting
        });
      };
      x.send(JSON.stringify(payload));
    } catch (e) {
      console && console.log(e);
    }
  };
  var request$1 = function request(options, url, payload, callback) {
    if (typeof payload === 'function') {
      callback = payload;
      payload = undefined;
    }
    callback = callback || function () {};
    if (fetchApi$2) {
      return requestWithFetch$1(options, url, payload, callback);
    }
    if (typeof XMLHttpRequest === 'function' || (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof$2(XMLHttpRequest)) === 'object' || typeof ActiveXObject === 'function') {
      return requestWithXmlHttpRequest$1(options, url, payload, callback);
    }
    callback(new Error('No fetch and no xhr implementation found!'));
  };

  function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
  function _classCallCheck$1(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
  function _defineProperties$1(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
  function _createClass$1(e, r, t) { return r && _defineProperties$1(e.prototype, r), t && _defineProperties$1(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
  function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof$1(i) ? i : i + ""; }
  function _toPrimitive(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
  var getDefaults$2 = function getDefaults() {
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
      failLoadingOnEmptyJSON: false,
      allowedAddOrUpdateHosts: ['localhost'],
      onSaved: false,
      reloadInterval: typeof window !== 'undefined' ? false : 60 * 60 * 1000,
      checkForProjectTimeout: 3 * 1000,
      storageExpiration: 60 * 60 * 1000,
      writeDebounce: 5 * 1000
    };
  };
  var hasLocalStorageSupport$1;
  try {
    hasLocalStorageSupport$1 = typeof window !== 'undefined' && window.localStorage !== null;
    var testKey = 'notExistingLocizeProject';
    window.localStorage.setItem(testKey, 'foo');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    hasLocalStorageSupport$1 = false;
  }
  function getStorage(storageExpiration) {
    var setProjectNotExisting = function setProjectNotExisting() {};
    var isProjectNotExisting = function isProjectNotExisting() {};
    if (hasLocalStorageSupport$1) {
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
    } else if (typeof document !== 'undefined') {
      setProjectNotExisting = function setProjectNotExisting(projectId) {
        var date = new Date();
        date.setTime(date.getTime() + storageExpiration);
        var expires = "; expires=".concat(date.toGMTString());
        var name = "notExistingLocizeProject_".concat(projectId);
        try {
          document.cookie = "".concat(name, "=").concat(Date.now()).concat(expires, ";path=/");
        } catch (err) {}
      };
      isProjectNotExisting = function isProjectNotExisting(projectId) {
        var name = "notExistingLocizeProject_".concat(projectId);
        var nameEQ = "".concat(name, "=");
        try {
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return true;
          }
        } catch (err) {}
        return false;
      };
    }
    return {
      setProjectNotExisting: setProjectNotExisting,
      isProjectNotExisting: isProjectNotExisting
    };
  }
  var getCustomRequestInfo = function getCustomRequestInfo(url, options, payload) {
    var headers = {};
    if (options.authorize && options.apiKey) {
      headers.Authorization = options.apiKey;
    }
    if (payload || options.setContentTypeJSON) {
      headers['Content-Type'] = 'application/json';
    }
    return {
      method: payload ? 'POST' : 'GET',
      url: url,
      headers: headers,
      body: payload
    };
  };
  var handleCustomRequest = function handleCustomRequest(opt, info, cb) {
    if (opt.request.length === 1) {
      try {
        var r = opt.request(info);
        if (r && typeof r.then === 'function') {
          r.then(function (data) {
            return cb(null, data);
          }).catch(cb);
        } else {
          cb(null, r);
        }
      } catch (err) {
        cb(err);
      }
      return;
    }
    opt.request(info, cb);
  };
  var I18NextLocizeBackend = function () {
    function I18NextLocizeBackend(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = arguments.length > 3 ? arguments[3] : undefined;
      _classCallCheck$1(this, I18NextLocizeBackend);
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
    return _createClass$1(I18NextLocizeBackend, [{
      key: "init",
      value: function init(services) {
        var _this = this;
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var callback = arguments.length > 3 ? arguments[3] : undefined;
        if (!options.referenceLng && allOptions.fallbackLng && Array.isArray(allOptions.fallbackLng) && allOptions.fallbackLng[0] !== 'dev') {
          options.referenceLng = allOptions.fallbackLng[0];
        }
        this.services = services;
        var defOpt = getDefaults$2();
        var passedOpt = defaults$2(options, this.options || {});
        if (passedOpt.reloadInterval && passedOpt.reloadInterval < 5 * 60 * 1000) {
          console.warn('Your configured reloadInterval option is to low.');
          passedOpt.reloadInterval = defOpt.reloadInterval;
        }
        this.options = defaults$2(options, this.options || {}, defOpt);
        this.allOptions = allOptions;
        this.somethingLoaded = false;
        this.isProjectNotExisting = false;
        this.storage = getStorage(this.options.storageExpiration);
        if (this.options.pull) {
          console.warn('The pull API was removed use "private: true" option instead: https://docs.locize.com/integration/api#fetch-private-namespace-resources');
        }
        var hostname = typeof window !== 'undefined' && window.location && window.location.hostname;
        if (hostname) {
          this.isAddOrUpdateAllowed = typeof this.options.allowedAddOrUpdateHosts === 'function' ? this.options.allowedAddOrUpdateHosts(hostname) : this.options.allowedAddOrUpdateHosts.indexOf(hostname) > -1;
          if (services && services.logger && (allOptions.saveMissing || allOptions.updateMissing)) {
            if (!this.isAddOrUpdateAllowed) {
              services.logger.warn(typeof this.options.allowedAddOrUpdateHosts === 'function' ? "locize-backend: will not save or update missings because allowedAddOrUpdateHosts returned false for the host \"".concat(hostname, "\".") : "locize-backend: will not save or update missings because the host \"".concat(hostname, "\" was not in the list of allowedAddOrUpdateHosts: ").concat(this.options.allowedAddOrUpdateHosts.join(', '), " (matches need to be exact)."));
            } else if (hostname !== 'localhost') {
              services.logger.warn("locize-backend: you are using the save or update missings feature from this host \"".concat(hostname, "\".\nMake sure you will not use it in production!\nhttps://docs.locize.com/guides-tips-and-tricks/going-production"));
            }
          }
        } else {
          this.isAddOrUpdateAllowed = true;
        }
        if (typeof callback === 'function') {
          this.getOptions(function (err, opts, languages) {
            if (err) return callback(err);
            _this.options.referenceLng = options.referenceLng || opts.referenceLng || _this.options.referenceLng;
            callback(null, opts, languages);
          });
        }
        this.queuedWrites = {
          pending: {}
        };
        this.debouncedProcess = debounce$1(this.process, this.options.writeDebounce);
        if (this.interval) clearInterval(this.interval);
        if (this.options.reloadInterval && this.options.projectId) {
          this.interval = setInterval(function () {
            return _this.reload();
          }, this.options.reloadInterval);
          if (_typeof$1(this.interval) === 'object' && typeof this.interval.unref === 'function') this.interval.unref();
        }
      }
    }, {
      key: "reload",
      value: function reload() {
        var _this2 = this;
        var _ref = this.services || {
            logger: console
          },
          backendConnector = _ref.backendConnector,
          languageUtils = _ref.languageUtils,
          logger = _ref.logger;
        if (!backendConnector) return;
        var currentLanguage = backendConnector.language;
        if (currentLanguage && currentLanguage.toLowerCase() === 'cimode') return;
        var toLoad = [];
        var append = function append(lng) {
          var lngs = languageUtils.toResolveHierarchy(lng);
          lngs.forEach(function (l) {
            if (toLoad.indexOf(l) < 0) toLoad.push(l);
          });
        };
        append(currentLanguage);
        if (this.allOptions.preload) this.allOptions.preload.forEach(function (l) {
          return append(l);
        });
        toLoad.forEach(function (lng) {
          _this2.allOptions.ns.forEach(function (ns) {
            backendConnector.read(lng, ns, 'read', null, null, function (err, data) {
              if (err) logger.warn("loading namespace ".concat(ns, " for language ").concat(lng, " failed"), err);
              if (!err && data) logger.log("loaded namespace ".concat(ns, " for language ").concat(lng), data);
              backendConnector.loaded("".concat(lng, "|").concat(ns), err, data);
            });
          });
        });
      }
    }, {
      key: "getLanguages",
      value: function getLanguages(callback) {
        var _this3 = this;
        var deferred;
        if (!callback) {
          deferred = defer();
          callback = function callback(err, ret) {
            if (err) return deferred.reject(err);
            deferred.resolve(ret);
          };
        }
        var isMissing = isMissingOption$1(this.options, ['projectId']);
        if (isMissing) return callback(new Error(isMissing));
        var url = interpolate$1(this.options.getLanguagesPath, {
          projectId: this.options.projectId
        });
        if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) {
          this.isProjectNotExisting = true;
        }
        if (this.isProjectNotExisting) return callback(new Error("locize project ".concat(this.options.projectId, " does not exist!")));
        this.getLanguagesCalls = this.getLanguagesCalls || [];
        this.getLanguagesCalls.push(callback);
        if (this.getLanguagesCalls.length > 1) return;
        this.loadUrl({}, url, function (err, ret, info) {
          if (!_this3.somethingLoaded && info && info.resourceNotExisting) {
            _this3.isProjectNotExisting = true;
            _this3.storage.setProjectNotExisting(_this3.options.projectId);
            var e = new Error("locize project ".concat(_this3.options.projectId, " does not exist!"));
            var _clbs = _this3.getLanguagesCalls;
            _this3.getLanguagesCalls = [];
            return _clbs.forEach(function (clb) {
              return clb(e);
            });
          }
          if (ret) {
            var referenceLng = Object.keys(ret).reduce(function (mem, k) {
              var item = ret[k];
              if (item.isReferenceLanguage) mem = k;
              return mem;
            }, '');
            if (referenceLng && _this3.options.referenceLng !== referenceLng) {
              _this3.options.referenceLng = referenceLng;
            }
          }
          _this3.somethingLoaded = true;
          var clbs = _this3.getLanguagesCalls;
          _this3.getLanguagesCalls = [];
          clbs.forEach(function (clb) {
            return clb(err, ret);
          });
        });
        return deferred;
      }
    }, {
      key: "getOptions",
      value: function getOptions(callback) {
        var _this4 = this;
        var deferred;
        if (!callback) {
          deferred = defer();
          callback = function callback(err, ret) {
            if (err) return deferred.reject(err);
            deferred.resolve(ret);
          };
        }
        this.getLanguages(function (err, data) {
          if (err) return callback(err);
          var keys = Object.keys(data);
          if (!keys.length) {
            return callback(new Error('was unable to load languages via API'));
          }
          var lngs = keys.reduce(function (mem, k) {
            var item = data[k];
            if (item.translated[_this4.options.version] && item.translated[_this4.options.version] >= _this4.options.translatedPercentageThreshold) {
              mem.push(k);
            }
            return mem;
          }, []);
          var hasRegion = keys.reduce(function (mem, k) {
            if (k.indexOf('-') > -1) return true;
            return mem;
          }, false);
          callback(null, {
            fallbackLng: _this4.options.referenceLng,
            referenceLng: _this4.options.referenceLng,
            supportedLngs: lngs.length === 0 && _this4.options.referenceLng ? [_this4.options.referenceLng] : lngs,
            load: hasRegion ? 'all' : 'languageOnly'
          }, data);
        });
        return deferred;
      }
    }, {
      key: "checkIfProjectExists",
      value: function checkIfProjectExists(callback) {
        var _this5 = this;
        var _ref2 = this.services || {
            logger: console
          },
          logger = _ref2.logger;
        if (this.somethingLoaded) {
          if (callback) callback(null);
          return;
        }
        if (this.alreadyRequestedCheckIfProjectExists) {
          setTimeout(function () {
            return _this5.checkIfProjectExists(callback);
          }, this.options.checkForProjectTimeout);
          return;
        }
        this.alreadyRequestedCheckIfProjectExists = true;
        this.getLanguages(function (err) {
          if (err && err.message && err.message.indexOf('does not exist') > 0) {
            if (logger) logger.error(err.message);
          }
          if (callback) callback(err);
        });
      }
    }, {
      key: "read",
      value: function read(language, namespace, callback) {
        var _this6 = this;
        var _ref3 = this.services || {
            logger: console
          },
          logger = _ref3.logger;
        var url;
        var options = {};
        if (this.options.private) {
          var isMissing = isMissingOption$1(this.options, ['projectId', 'version', 'apiKey']);
          if (isMissing) return callback(new Error(isMissing), false);
          url = interpolate$1(this.options.privatePath, {
            lng: language,
            ns: namespace,
            projectId: this.options.projectId,
            version: this.options.version
          });
          options = {
            authorize: true
          };
        } else {
          var _isMissing = isMissingOption$1(this.options, ['projectId', 'version']);
          if (_isMissing) return callback(new Error(_isMissing), false);
          url = interpolate$1(this.options.loadPath, {
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
          if (logger) logger.error(err.message);
          if (callback) callback(err);
          return;
        }
        this.loadUrl(options, url, function (err, ret, info) {
          if (!_this6.somethingLoaded) {
            if (info && info.resourceNotExisting) {
              setTimeout(function () {
                return _this6.checkIfProjectExists();
              }, _this6.options.checkForProjectTimeout);
            } else {
              _this6.somethingLoaded = true;
            }
          }
          callback(err, ret);
        });
      }
    }, {
      key: "loadUrl",
      value: function loadUrl(options, url, payload, callback) {
        var _this7 = this;
        options = defaults$2(options, this.options);
        if (typeof payload === 'function') {
          callback = payload;
          payload = undefined;
        }
        callback = callback || function () {};
        var clb = function clb(err, res) {
          var resourceNotExisting = res && res.resourceNotExisting;
          if (res && (res.status === 408 || res.status === 400)) {
            return callback('failed loading ' + url, true, {
              resourceNotExisting: resourceNotExisting
            });
          }
          if (res && (res.status >= 500 && res.status < 600 || !res.status)) {
            return callback('failed loading ' + url, true, {
              resourceNotExisting: resourceNotExisting
            });
          }
          if (res && res.status >= 400 && res.status < 500) {
            return callback('failed loading ' + url, false, {
              resourceNotExisting: resourceNotExisting
            });
          }
          if (!res && err && err.message) {
            var errorMessage = err.message.toLowerCase();
            var isNetworkError = ['failed', 'fetch', 'network', 'load'].find(function (term) {
              return errorMessage.indexOf(term) > -1;
            });
            if (isNetworkError) {
              return callback('failed loading ' + url + ': ' + err.message, true, {
                resourceNotExisting: resourceNotExisting
              });
            }
          }
          if (err) return callback(err, false);
          var ret, parseErr;
          try {
            if (typeof res.data === 'string') {
              ret = JSON.parse(res.data);
            } else {
              ret = res.data;
            }
          } catch (e) {
            parseErr = 'failed parsing ' + url + ' to json';
          }
          if (parseErr) return callback(parseErr, false);
          if (_this7.options.failLoadingOnEmptyJSON && !Object.keys(ret).length) {
            return callback('loaded result empty for ' + url, false, {
              resourceNotExisting: resourceNotExisting
            });
          }
          callback(null, ret, {
            resourceNotExisting: resourceNotExisting
          });
        };
        if (!this.options.request || url.indexOf("/languages/".concat(options.projectId)) > 0) return request$1(options, url, payload, clb);
        var info = getCustomRequestInfo(url, options, payload);
        handleCustomRequest(this.options, info, clb);
      }
    }, {
      key: "create",
      value: function create(languages, namespace, key, fallbackValue, callback, options) {
        var _this8 = this;
        if (typeof callback !== 'function') callback = function callback() {};
        this.checkIfProjectExists(function (err) {
          if (err) return callback(err);
          var isMissing = isMissingOption$1(_this8.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
          if (isMissing) return callback(new Error(isMissing));
          if (!_this8.isAddOrUpdateAllowed) {
            return callback('host is not allowed to create key.');
          }
          if (typeof languages === 'string') languages = [languages];
          if (languages.filter(function (l) {
            return l === _this8.options.referenceLng;
          }).length < 1) {
            _this8.services && _this8.services.logger && _this8.services.logger.warn("locize-backend: will not save missings because the reference language \"".concat(_this8.options.referenceLng, "\" was not in the list of to save languages: ").concat(languages.join(', '), " (open your site in the reference language to save missings)."));
          }
          languages.forEach(function (lng) {
            if (lng === _this8.options.referenceLng) {
              _this8.queue.call(_this8, _this8.options.referenceLng, namespace, key, fallbackValue, callback, options);
            }
          });
        });
      }
    }, {
      key: "update",
      value: function update(languages, namespace, key, fallbackValue, callback, options) {
        var _this9 = this;
        if (typeof callback !== 'function') callback = function callback() {};
        this.checkIfProjectExists(function (err) {
          if (err) return callback(err);
          var isMissing = isMissingOption$1(_this9.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
          if (isMissing) return callback(new Error(isMissing));
          if (!_this9.isAddOrUpdateAllowed) {
            return callback('host is not allowed to update key.');
          }
          if (!options) options = {};
          if (typeof languages === 'string') languages = [languages];
          options.isUpdate = true;
          languages.forEach(function (lng) {
            if (lng === _this9.options.referenceLng) {
              _this9.queue.call(_this9, _this9.options.referenceLng, namespace, key, fallbackValue, callback, options);
            }
          });
        });
      }
    }, {
      key: "writePage",
      value: function writePage(lng, namespace, missings, callback) {
        var missingUrl = interpolate$1(this.options.addPath, {
          lng: lng,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
        var updatesUrl = interpolate$1(this.options.updatePath, {
          lng: lng,
          ns: namespace,
          projectId: this.options.projectId,
          version: this.options.version
        });
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
        var doneOne = function doneOne(err) {
          todo--;
          if (!todo) callback(err);
        };
        if (!todo) doneOne();
        if (hasMissing) {
          if (!this.options.request) {
            request$1(defaults$2({
              authorize: true
            }, this.options), missingUrl, payloadMissing, doneOne);
          } else {
            var info = getCustomRequestInfo(missingUrl, defaults$2({
              authorize: true
            }, this.options), payloadMissing);
            handleCustomRequest(this.options, info, doneOne);
          }
        }
        if (hasUpdates) {
          if (!this.options.request) {
            request$1(defaults$2({
              authorize: true
            }, this.options), updatesUrl, payloadUpdate, doneOne);
          } else {
            var _info = getCustomRequestInfo(updatesUrl, defaults$2({
              authorize: true
            }, this.options), payloadUpdate);
            handleCustomRequest(this.options, _info, doneOne);
          }
        }
      }
    }, {
      key: "write",
      value: function write(lng, namespace) {
        var _this10 = this;
        var lock = getPath(this.queuedWrites, ['locks', lng, namespace]);
        if (lock) return;
        var missings = getPath(this.queuedWrites, [lng, namespace]);
        setPath(this.queuedWrites, [lng, namespace], []);
        var pageSize = 1000;
        var clbs = missings.filter(function (m) {
          return m.callback;
        }).map(function (missing) {
          return missing.callback;
        });
        if (missings.length) {
          setPath(this.queuedWrites, ['locks', lng, namespace], true);
          var namespaceSaved = function namespaceSaved() {
            setPath(_this10.queuedWrites, ['locks', lng, namespace], false);
            clbs.forEach(function (clb) {
              return clb();
            });
            if (_this10.options.onSaved) _this10.options.onSaved(lng, namespace);
            _this10.debouncedProcess(lng, namespace);
          };
          var amountOfPages = missings.length / pageSize;
          var pagesDone = 0;
          var page = missings.splice(0, pageSize);
          this.writePage(lng, namespace, page, function () {
            pagesDone++;
            if (pagesDone >= amountOfPages) namespaceSaved();
          });
          while (page.length === pageSize) {
            page = missings.splice(0, pageSize);
            if (page.length) {
              this.writePage(lng, namespace, page, function () {
                pagesDone++;
                if (pagesDone >= amountOfPages) namespaceSaved();
              });
            }
          }
        }
      }
    }, {
      key: "process",
      value: function process() {
        var _this11 = this;
        Object.keys(this.queuedWrites).forEach(function (lng) {
          if (lng === 'locks') return;
          Object.keys(_this11.queuedWrites[lng]).forEach(function (ns) {
            var todo = _this11.queuedWrites[lng][ns];
            if (todo.length) {
              _this11.write(lng, ns);
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
  }();
  I18NextLocizeBackend.type = 'backend';

  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }

  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
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

  // eslint-disable-next-line no-control-regex
  var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  var serializeCookie = function serializeCookie(name, val, options) {
    var opt = options || {};
    opt.path = opt.path || '/';
    var value = encodeURIComponent(val);
    var str = "".concat(name, "=").concat(value);
    if (opt.maxAge > 0) {
      var maxAge = opt.maxAge - 0;
      if (Number.isNaN(maxAge)) throw new Error('maxAge should be a Number');
      str += "; Max-Age=".concat(Math.floor(maxAge));
    }
    if (opt.domain) {
      if (!fieldContentRegExp.test(opt.domain)) {
        throw new TypeError('option domain is invalid');
      }
      str += "; Domain=".concat(opt.domain);
    }
    if (opt.path) {
      if (!fieldContentRegExp.test(opt.path)) {
        throw new TypeError('option path is invalid');
      }
      str += "; Path=".concat(opt.path);
    }
    if (opt.expires) {
      if (typeof opt.expires.toUTCString !== 'function') {
        throw new TypeError('option expires is invalid');
      }
      str += "; Expires=".concat(opt.expires.toUTCString());
    }
    if (opt.httpOnly) str += '; HttpOnly';
    if (opt.secure) str += '; Secure';
    if (opt.sameSite) {
      var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
      switch (sameSite) {
        case true:
          str += '; SameSite=Strict';
          break;
        case 'lax':
          str += '; SameSite=Lax';
          break;
        case 'strict':
          str += '; SameSite=Strict';
          break;
        case 'none':
          str += '; SameSite=None';
          break;
        default:
          throw new TypeError('option sameSite is invalid');
      }
    }
    return str;
  };
  var cookie = {
    create: function create(name, value, minutes, domain) {
      var cookieOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        path: '/',
        sameSite: 'strict'
      };
      if (minutes) {
        cookieOptions.expires = new Date();
        cookieOptions.expires.setTime(cookieOptions.expires.getTime() + minutes * 60 * 1000);
      }
      if (domain) cookieOptions.domain = domain;
      document.cookie = serializeCookie(name, encodeURIComponent(value), cookieOptions);
    },
    read: function read(name) {
      var nameEQ = "".concat(name, "=");
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
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
        var search = window.location.search;
        if (!window.location.search && window.location.hash && window.location.hash.indexOf('?') > -1) {
          search = window.location.hash.substring(window.location.hash.indexOf('?'));
        }
        var query = search.substring(1);
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

  var hasLocalStorageSupport = null;
  var localStorageAvailable = function localStorageAvailable() {
    if (hasLocalStorageSupport !== null) return hasLocalStorageSupport;
    try {
      hasLocalStorageSupport = window !== 'undefined' && window.localStorage !== null;
      var testKey = 'i18next.translate.boo';
      window.localStorage.setItem(testKey, 'foo');
      window.localStorage.removeItem(testKey);
    } catch (e) {
      hasLocalStorageSupport = false;
    }
    return hasLocalStorageSupport;
  };
  var localStorage = {
    name: 'localStorage',
    lookup: function lookup(options) {
      var found;
      if (options.lookupLocalStorage && localStorageAvailable()) {
        var lng = window.localStorage.getItem(options.lookupLocalStorage);
        if (lng) found = lng;
      }
      return found;
    },
    cacheUserLanguage: function cacheUserLanguage(lng, options) {
      if (options.lookupLocalStorage && localStorageAvailable()) {
        window.localStorage.setItem(options.lookupLocalStorage, lng);
      }
    }
  };

  var hasSessionStorageSupport = null;
  var sessionStorageAvailable = function sessionStorageAvailable() {
    if (hasSessionStorageSupport !== null) return hasSessionStorageSupport;
    try {
      hasSessionStorageSupport = window !== 'undefined' && window.sessionStorage !== null;
      var testKey = 'i18next.translate.boo';
      window.sessionStorage.setItem(testKey, 'foo');
      window.sessionStorage.removeItem(testKey);
    } catch (e) {
      hasSessionStorageSupport = false;
    }
    return hasSessionStorageSupport;
  };
  var sessionStorage = {
    name: 'sessionStorage',
    lookup: function lookup(options) {
      var found;
      if (options.lookupSessionStorage && sessionStorageAvailable()) {
        var lng = window.sessionStorage.getItem(options.lookupSessionStorage);
        if (lng) found = lng;
      }
      return found;
    },
    cacheUserLanguage: function cacheUserLanguage(lng, options) {
      if (options.lookupSessionStorage && sessionStorageAvailable()) {
        window.sessionStorage.setItem(options.lookupSessionStorage, lng);
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
      // If given get the subdomain index else 1
      var lookupFromSubdomainIndex = typeof options.lookupFromSubdomainIndex === 'number' ? options.lookupFromSubdomainIndex + 1 : 1;
      // get all matches if window.location. is existing
      // first item of match is the match itself and the second is the first group macht which sould be the first subdomain match
      // is the hostname no public domain get the or option of localhost
      var language = typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);

      // if there is no match (null) return undefined
      if (!language) return undefined;
      // return the given group match
      return language[lookupFromSubdomainIndex];
    }
  };

  // some environments, throws when accessing document.cookie
  var canCookies = false;
  try {
    // eslint-disable-next-line no-unused-expressions
    document.cookie;
    canCookies = true;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  var order = ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'];
  if (!canCookies) order.splice(1, 1);
  function getDefaults$1() {
    return {
      order: order,
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      // cache user language
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      // cookieMinutes: 10,
      // cookieDomain: 'myDomain'

      convertDetectedLanguage: function convertDetectedLanguage(l) {
        return l;
      }
    };
  }
  var Browser = /*#__PURE__*/function () {
    function Browser(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck(this, Browser);
      this.type = 'languageDetector';
      this.detectors = {};
      this.init(services, options);
    }
    return _createClass(Browser, [{
      key: "init",
      value: function init(services) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i18nOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        this.services = services || {
          languageUtils: {}
        }; // this way the language detector can be used without i18next
        this.options = defaults$1(options, this.options || {}, getDefaults$1());
        if (typeof this.options.convertDetectedLanguage === 'string' && this.options.convertDetectedLanguage.indexOf('15897') > -1) {
          this.options.convertDetectedLanguage = function (l) {
            return l.replace('-', '_');
          };
        }

        // backwards compatibility
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
        return this;
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
        detected = detected.map(function (d) {
          return _this.options.convertDetectedLanguage(d);
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
  }();
  Browser.type = 'languageDetector';

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
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
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
  function isMissingOption(obj, props) {
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
  function replaceIn(str, arr, options) {
    var ret = str;
    arr.forEach(function (s) {
      var regexp = new RegExp("{{".concat(s, "}}"), 'g');
      ret = ret.replace(regexp, options[s]);
    });
    return ret;
  }

  var fetchApi$1;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi$1 = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi$1 = window.fetch;
    } else {
      fetchApi$1 = fetch;
    }
  }

  if (typeof require !== 'undefined' && typeof window === 'undefined') {
    var f = fetchApi$1 || require('cross-fetch');
    if (f.default) f = f.default;
    exports.default = f;
    module.exports = exports.default;
  }

  var fetchNode = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
  var fetchApi;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi = window.fetch;
    } else {
      fetchApi = fetch;
    }
  }
  var XmlHttpRequestApi;
  if (typeof XMLHttpRequest === 'function' || (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof(XMLHttpRequest)) === 'object') {
    if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequestApi = global.XMLHttpRequest;
    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequestApi = window.XMLHttpRequest;
    }
  }
  var ActiveXObjectApi;
  if (typeof ActiveXObject === 'function') {
    if (typeof global !== 'undefined' && global.ActiveXObject) {
      ActiveXObjectApi = global.ActiveXObject;
    } else if (typeof window !== 'undefined' && window.ActiveXObject) {
      ActiveXObjectApi = window.ActiveXObject;
    }
  }
  if (!fetchApi && fetchNode && !XmlHttpRequestApi && !ActiveXObjectApi) fetchApi = fetchNode;
  if (typeof fetchApi !== 'function') fetchApi = undefined;
  var requestWithFetch = function requestWithFetch(options, url, payload, callback) {
    var resolver = function resolver(response) {
      var resourceNotExisting = response.headers && response.headers.get('x-cache') === 'Error from cloudfront';
      if (!response.ok) return callback(response.statusText || 'Error', {
        status: response.status,
        resourceNotExisting: resourceNotExisting
      });
      response.text().then(function (data) {
        callback(null, {
          status: response.status,
          data: data,
          resourceNotExisting: resourceNotExisting
        });
      }).catch(callback);
    };
    var headers = {
      Authorization: options.authorize && options.apiKey ? options.apiKey : undefined,
      'Content-Type': 'application/json'
    };
    if (typeof window === 'undefined' && typeof global !== 'undefined' && typeof global.process !== 'undefined' && global.process.versions && global.process.versions.node) {
      headers['User-Agent'] = "locize-lastused (node/".concat(global.process.version, "; ").concat(global.process.platform, " ").concat(global.process.arch, ")");
    }
    if (typeof fetch === 'function') {
      fetch(url, {
        method: payload ? 'POST' : 'GET',
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers
      }).then(resolver).catch(callback);
    } else {
      fetchApi(url, {
        method: payload ? 'POST' : 'GET',
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers
      }).then(resolver).catch(callback);
    }
  };
  var requestWithXmlHttpRequest = function requestWithXmlHttpRequest(options, url, payload, callback) {
    try {
      var x;
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
      x.onreadystatechange = function () {
        var resourceNotExisting = x.getResponseHeader('x-cache') === 'Error from cloudfront';
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
          status: x.status,
          data: x.responseText,
          resourceNotExisting: resourceNotExisting
        });
      };
      x.send(JSON.stringify(payload));
    } catch (e) {
      console && console.log(e);
    }
  };
  var request = function request(options, url, payload, callback) {
    if (typeof payload === 'function') {
      callback = payload;
      payload = undefined;
    }
    callback = callback || function () {};
    if (fetchApi) {
      return requestWithFetch(options, url, payload, callback);
    }
    if (typeof XMLHttpRequest === 'function' || (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof(XMLHttpRequest)) === 'object' || typeof ActiveXObject === 'function') {
      return requestWithXmlHttpRequest(options, url, payload, callback);
    }
    callback(new Error('No fetch and no xhr implementation found!'));
  };

  var getDefaults = function getDefaults() {
    return {
      lastUsedPath: 'https://api.locize.app/used/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
      referenceLng: 'en',
      crossDomain: true,
      setContentTypeJSON: false,
      version: 'latest',
      debounceSubmit: 90000,
      allowedHosts: ['localhost']
    };
  };
  var locizeLastUsed = {
    init: function init(options) {
      var isI18next = options.t && typeof options.t === 'function';
      if (isI18next && !options.options.locizeLastUsed.projectId && options.options.backend.projectId) {
        options.options.locizeLastUsed.projectId = options.options.backend.projectId;
      }
      if (isI18next && !options.options.locizeLastUsed.version && options.options.backend.version) {
        options.options.locizeLastUsed.version = options.options.backend.version;
      }
      if (isI18next && !options.options.locizeLastUsed.apiKey && options.options.backend.apiKey) {
        options.options.locizeLastUsed.apiKey = options.options.backend.apiKey;
      }
      if (isI18next && !options.options.locizeLastUsed.referenceLng && options.options.backend.referenceLng) {
        options.options.locizeLastUsed.referenceLng = options.options.backend.referenceLng;
      }
      if (isI18next && !options.options.locizeLastUsed.referenceLng && options.options.fallbackLng && Array.isArray(options.options.fallbackLng) && options.options.fallbackLng[0] !== 'dev') {
        options.options.locizeLastUsed.referenceLng = options.options.fallbackLng[0];
      }
      this.options = isI18next ? defaults(options.options.locizeLastUsed, this.options || {}, getDefaults()) : defaults(options, this.options || {}, getDefaults());
      var hostname = typeof window !== 'undefined' && window.location && window.location.hostname;
      if (hostname) {
        this.isAllowed = this.options.allowedHosts.indexOf(hostname) > -1;
      } else {
        this.isAllowed = true;
      }
      this.submitting = null;
      this.pending = {};
      this.done = {};
      this.submit = debounce(this.submit, this.options.debounceSubmit);
      if (isI18next) this.interceptI18next(options);
    },
    interceptI18next: function interceptI18next(i18next) {
      var _this = this;
      var origGetResource = i18next.services.resourceStore.getResource;
      i18next.services.resourceStore.getResource = function (lng, ns, key, options) {
        if (key) _this.used(ns, key);
        return origGetResource.call(i18next.services.resourceStore, lng, ns, key, options);
      };
    },
    used: function used(ns, key, callback) {
      var _this2 = this;
      ['pending', 'done'].forEach(function (k) {
        if (_this2.done[ns] && _this2.done[ns][key]) return;
        if (!_this2[k][ns]) _this2[k][ns] = {};
        _this2[k][ns][key] = true;
      });
      this.submit(callback);
    },
    submit: function submit(callback) {
      var _this3 = this;
      if (!this.isAllowed) return callback && callback(new Error('not allowed'));
      if (this.submitting) return this.submit(callback);
      var isMissing = isMissingOption(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
      if (isMissing) return callback && callback(new Error(isMissing));
      this.submitting = this.pending;
      this.pending = {};
      var namespaces = Object.keys(this.submitting);
      var todo = namespaces.length;
      var doneOne = function doneOne(err) {
        todo--;
        if (!todo) {
          _this3.submitting = null;
          if (callback) callback(err);
        }
      };
      namespaces.forEach(function (ns) {
        var keys = Object.keys(_this3.submitting[ns]);
        var url = replaceIn(_this3.options.lastUsedPath, ['projectId', 'version', 'lng', 'ns'], defaults({
          lng: _this3.options.referenceLng,
          ns: ns
        }, _this3.options));
        if (keys.length) {
          request(defaults({
            authorize: true
          }, _this3.options), url, keys, doneOne);
        } else {
          doneOne();
        }
      });
    }
  };
  locizeLastUsed.type = '3rdParty';

  var regexp = new RegExp('\{\{(.+?)\}\}', 'g');
  function makeString(object) {
    if (object == null) return '';
    return '' + object;
  }
  function interpolate(str, data, lng) {
    var match, value;
    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }
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

  function formatLanguageCode(code) {
    return code;
  }
  function getLanguagePartFromCode(code) {
    if (code.indexOf('-') < 0) return code;
    var specialCases = ['NB-NO', 'NN-NO', 'nb-NO', 'nn-NO', 'nb-no', 'nn-no'];
    var p = code.split('-');
    return specialCases.indexOf(code) > -1 ? p[1].toLowerCase() : p[0];
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  var services = {
    interpolator: {
      interpolate: interpolate
    },
    languageUtils: {
      formatLanguageCode: formatLanguageCode
    }
  };
  var asyncEach = function asyncEach(arr, fn, callback) {
    var results = [];
    var count = arr.length;
    arr.forEach(function (item, index) {
      fn(item, function (err, data) {
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
  var locizer = {
    init: function init(options) {
      this.options = options;
      this.backend = new I18NextLocizeBackend(services, options);
      this.detector = new Browser(services, options);
      this.lng = options.lng || this.detector.detect();
      this.referenceLng = options.referenceLng;
      locizeLastUsed.init(options);
      return this;
    },
    isValid: function isValid(lngs, l) {
      return lngs[l] && lngs[l].translated[this.options.version || 'latest'] >= (this.options.loadIfTranslatedOver || 1);
    },
    getLanguage: function getLanguage(lng, callback) {
      var _this = this;
      if (typeof lng === 'function') {
        callback = lng;
        lng = this.lng;
      }
      if (!lng) lng = this.lng;
      this.getLanguages(function (err, lngs) {
        if (err) return callback(err);
        if (_this.isValid(lngs, lng)) return callback(null, lng);
        if (_this.isValid(lngs, getLanguagePartFromCode(lng))) return callback(null, getLanguagePartFromCode(lng));
        callback(null, _this.options.fallbackLng || _this.referenceLng || Object.keys(lngs)[0]);
      });
      return this;
    },
    getLanguages: function getLanguages(callback) {
      var _this2 = this;
      if (this.publishedLngs) {
        callback(null, this.publishedLngs);
      } else {
        this.backend.getLanguages(function (err, data) {
          if (err) return callback(err);
          if (!err) _this2.publishedLngs = data;
          if (!_this2.referenceLng) {
            Object.keys(data).forEach(function (l) {
              if (data[l].isReferenceLanguage) _this2.referenceLng = l;
            });
          }
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
        if (err) return callback(err);
        _this3.backend.read(lng, ns, function (err, data) {
          return callback(err, data, lng);
        });
      });
      return this;
    },
    loadAll: function loadAll(ns, callback) {
      var _this4 = this;
      this.getLanguages(function (err, lngs) {
        if (err) return callback(err);
        var validLngs = Object.keys(lngs).filter(function (l) {
          return _this4.isValid(lngs, l);
        });
        asyncEach(validLngs, function (l, clb) {
          _this4.load(ns, l, function (err, res) {
            if (err) return clb(err);
            clb(null, _defineProperty({}, l, res));
          });
        }, function (err, results) {
          if (err) return callback(err);
          var ret = results.reduce(function (prev, l) {
            return _objectSpread(_objectSpread({}, prev), l);
          }, {});
          callback(null, ret);
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
      this.backend.create(this.referenceLng, namespace, key, value, callback, options);
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
      this.backend.create(this.referenceLng, namespace, key, value, callback, options);
      return this;
    },
    used: function used(namespace, key) {
      locizeLastUsed.used(namespace, key);
    }
  };

  return locizer;

}));
