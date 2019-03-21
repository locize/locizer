(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.locizer = factory());
}(this, (function () { 'use strict';

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
  var match = void 0,
      value = void 0;

  function regexSafe(val) {
    return val.replace(/\$/g, '$$$$');
  }

  // regular escape on demand
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// https://gist.github.com/Xeoncross/7663273
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
    window.console && console.log(e);
  }
}

function getDefaults() {
  return {
    loadPath: 'https://api.locize.io/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    privatePath: 'https://api.locize.io/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    pullPath: 'https://api.locize.io/pull/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    getLanguagesPath: 'https://api.locize.io/languages/{{projectId}}',
    addPath: 'https://api.locize.io/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    updatePath: 'https://api.locize.io/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    referenceLng: 'en',
    crossDomain: true,
    setContentTypeJSON: false,
    version: 'latest',
    pull: false,
    private: false,
    whitelistThreshold: 0.9
  };
}

var Backend = function () {
  function Backend(services, options, callback) {
    _classCallCheck(this, Backend);

    if (services && services.projectId) {
      this.init(null, services, {}, options);
    } else {
      this.init(null, options, {}, callback);
    }

    this.type = 'backend';
  }

  _createClass(Backend, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _this = this;

      var i18nextOptions = arguments[2];
      var callback = arguments[3];

      this.options = _extends({}, getDefaults(), this.options, options); // initial

      if (this.options.pull) console.warn('deprecated: pull will be removed in future versions and should be replaced with locize private versions');

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
    key: 'getLanguages',
    value: function getLanguages(callback) {
      var url = interpolate(this.options.getLanguagesPath, { projectId: this.options.projectId });

      this.loadUrl(url, {}, callback);
    }
  }, {
    key: 'getOptions',
    value: function getOptions(callback) {
      var _this2 = this;

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
          if (item.translated[_this2.options.version] && item.translated[_this2.options.version] >= _this2.options.whitelistThreshold) mem.push(k);
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
    key: 'read',
    value: function read(language, namespace, callback) {
      var url = void 0;
      var options = {};
      if (this.options.private) {
        url = interpolate(this.options.privatePath, { lng: language, ns: namespace, projectId: this.options.projectId, version: this.options.version });
        options = { authorize: true };
      } else if (this.options.pull) {
        url = interpolate(this.options.pullPath, { lng: language, ns: namespace, projectId: this.options.projectId, version: this.options.version });
        options = { authorize: true };
      } else {
        url = interpolate(this.options.loadPath, { lng: language, ns: namespace, projectId: this.options.projectId, version: this.options.version });
      }

      this.loadUrl(url, options, callback);
    }
  }, {
    key: 'loadUrl',
    value: function loadUrl(url, options, callback) {
      ajax(url, _extends({}, this.options, options), function (data, xhr) {
        if (xhr.status >= 500 && xhr.status < 600) return callback('failed loading ' + url, true /* retry */);
        if (xhr.status >= 400 && xhr.status < 500) return callback('failed loading ' + url, false /* no retry */);

        var ret = void 0,
            err = void 0;
        try {
          ret = JSON.parse(data);
        } catch (e) {
          err = 'failed parsing ' + url + ' to json';
        }
        if (err) return callback(err, false);
        callback(null, ret);
      });
    }
  }, {
    key: 'create',
    value: function create(languages, namespace, key, fallbackValue, callback, options) {
      var _this3 = this;

      if (!callback) callback = function callback() {};
      if (typeof languages === 'string') languages = [languages];

      languages.forEach(function (lng) {
        if (lng === _this3.options.referenceLng) _this3.queue.call(_this3, _this3.options.referenceLng, namespace, key, fallbackValue, callback, options);
      });
    }
  }, {
    key: 'update',
    value: function update(languages, namespace, key, fallbackValue, callback, options) {
      var _this4 = this;

      if (!callback) callback = function callback() {};
      if (!options) options = {};
      if (typeof languages === 'string') languages = [languages];

      // mark as update
      options.isUpdate = true;

      languages.forEach(function (lng) {
        if (lng === _this4.options.referenceLng) _this4.queue.call(_this4, _this4.options.referenceLng, namespace, key, fallbackValue, callback, options);
      });
    }
  }, {
    key: 'write',
    value: function write(lng, namespace) {
      var _this5 = this;

      var lock = getPath(this.queuedWrites, ['locks', lng, namespace]);
      if (lock) return;

      var missingUrl = interpolate(this.options.addPath, { lng: lng, ns: namespace, projectId: this.options.projectId, version: this.options.version });
      var updatesUrl = interpolate(this.options.updatePath, { lng: lng, ns: namespace, projectId: this.options.projectId, version: this.options.version });

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
          var value = item.options && item.options.tDescription ? { value: item.fallbackValue || '', context: { text: item.options.tDescription } } : item.fallbackValue || '';
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
            setPath(_this5.queuedWrites, ['locks', lng, namespace], false);

            missings.forEach(function (missing) {
              if (missing.callback) missing.callback();
            });

            // rerun
            _this5.debouncedProcess(lng, namespace);
          }
        };

        if (!todo) doneOne();

        if (hasMissing) {
          ajax(missingUrl, _extends({ authorize: true }, this.options), function (data, xhr) {
            //const statusCode = xhr.status.toString();
            // TODO: if statusCode === 4xx do log

            doneOne();
          }, payloadMissing);
        }

        if (hasUpdates) {
          ajax(updatesUrl, _extends({ authorize: true }, this.options), function (data, xhr) {
            //const statusCode = xhr.status.toString();
            // TODO: if statusCode === 4xx do log

            doneOne();
          }, payloadUpdate);
        }
      }
    }
  }, {
    key: 'process',
    value: function process() {
      var _this6 = this;

      Object.keys(this.queuedWrites).forEach(function (lng) {
        if (lng === 'locks') return;
        Object.keys(_this6.queuedWrites[lng]).forEach(function (ns) {
          var todo = _this6.queuedWrites[lng][ns];
          if (todo.length) {
            _this6.write(lng, ns);
          }
        });
      });
    }
  }, {
    key: 'queue',
    value: function queue(lng, namespace, key, fallbackValue, callback, options) {
      pushPath(this.queuedWrites, [lng, namespace], { key: key, fallbackValue: fallbackValue || '', callback: callback, options: options });

      this.debouncedProcess();
    }
  }]);

  return Backend;
}();

Backend.type = 'backend';

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
    var expires = void 0;
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
      }if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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
    var found = void 0;

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
    var found = void 0;

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

var hasLocalStorageSupport = void 0;
try {
  hasLocalStorageSupport = window !== 'undefined' && window.localStorage !== null;
  var testKey = 'i18next.translate.boo';
  window.localStorage.setItem(testKey, 'foo');
  window.localStorage.removeItem(testKey);
} catch (e) {
  hasLocalStorageSupport = false;
}

var localStorage = {
  name: 'localStorage',

  lookup: function lookup(options) {
    var found = void 0;

    if (options.lookupLocalStorage && hasLocalStorageSupport) {
      var lng = window.localStorage.getItem(options.lookupLocalStorage);
      if (lng) found = lng;
    }

    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(lng, options) {
    if (options.lookupLocalStorage && hasLocalStorageSupport) {
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
    var found = void 0;
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
    var found = void 0;
    if (typeof window !== 'undefined') {
      var language = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
      if (language instanceof Array) {
        if (typeof options.lookupFromUrlIndex === 'number') {
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
    var found = void 0;
    if (typeof window !== 'undefined') {
      var language = window.location.pathname.match(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/gi);
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

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults$1() {
  return {
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',

    // cache user language
    caches: ['localStorage'],
    excludeCacheFor: ['cimode']
    //cookieMinutes: 10,
    //cookieDomain: 'myDomain'
  };
}

var Browser = function () {
  function Browser(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck$1(this, Browser);

    this.type = 'languageDetector';
    this.detectors = {};

    this.init(services, options);
  }

  _createClass$1(Browser, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var i18nOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults$1());
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
    key: 'addDetector',
    value: function addDetector(detector) {
      this.detectors[detector.name] = detector;
    }
  }, {
    key: 'detect',
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

      var found = void 0;
      detected.forEach(function (lng) {
        if (found) return;
        var cleanedLng = _this.services.languageUtils.formatLanguageCode(lng);
        if (_this.services.languageUtils.isWhitelisted(cleanedLng)) found = cleanedLng;
      });

      if (!found) {
        var fallbacks = this.i18nOptions.fallbackLng;
        if (typeof fallbacks === 'string') fallbacks = [fallbacks];
        if (!fallbacks) fallbacks = [];

        if (Object.prototype.toString.apply(fallbacks) === '[object Array]') {
          found = fallbacks[0];
        } else {
          found = fallbacks[0] || fallbacks.default && fallbacks.default[0];
        }
      }

      return found;
    }
  }, {
    key: 'cacheUserLanguage',
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
		var regexp = new RegExp('{{' + s + '}}', 'g');
		ret = ret.replace(regexp, options[s]);
	});

	return ret;
}

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// https://gist.github.com/Xeoncross/7663273
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
    window.console && console.log(e);
  }
}

function getDefaults$2() {
  return {
    lastUsedPath: 'https://api.locize.io/used/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    referenceLng: 'en',
    crossDomain: true,
    setContentTypeJSON: false,
    version: 'latest',
    debounceSubmit: 90000
  };
}

var locizeLastUsed = {
  init: function init(options) {
    var isI18next = options.t && typeof options.t === 'function';

    this.options = isI18next ? _extends$1({}, getDefaults$2(), this.options, options.options.locizeLastUsed) : _extends$1({}, getDefaults$2(), this.options, options);

    this.submitting = null;
    this.pending = {};
    this.done = {};

    this.submit = debounce$1(this.submit, this.options.debounceSubmit);

    // intercept
    if (isI18next) this.interceptI18next(options);
  },

  interceptI18next: function interceptI18next(i18next) {
    var _this = this;

    var origGetResource = i18next.services.resourceStore.getResource;

    i18next.services.resourceStore.getResource = function (lng, ns, key, options) {
      // call last used
      if (key) _this.used(ns, key);

      // by pass orginal call
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

    if (this.submitting) return this.submit();
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
      var url = replaceIn(_this3.options.lastUsedPath, ['projectId', 'version', 'lng', 'ns'], _extends$1({}, _this3.options, { lng: _this3.options.referenceLng, ns: ns }));

      if (keys.length) {
        ajax$1(url, _extends$1({ authorize: true }, _this3.options), function (data, xhr) {
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
  var match = void 0,
      value = void 0;

  function regexSafe(val) {
    return val.replace(/\$/g, '$$$$');
  }

  // regular escape on demand
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
    this.backend = new Backend(services, options);
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
    var options = { isUpdate: true };
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
