var locizer = (function() {
	//#region node_modules/i18next-locize-backend/esm/index.js
	const arr$1 = [];
	const each$1 = arr$1.forEach;
	const slice$2 = arr$1.slice;
	const UNSAFE_KEYS$1 = [
		"__proto__",
		"constructor",
		"prototype"
	];
	function defaults$2(obj) {
		each$1.call(slice$2.call(arguments, 1), (source) => {
			if (source) for (const prop of Object.keys(source)) {
				if (UNSAFE_KEYS$1.indexOf(prop) > -1) continue;
				if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		});
		return obj;
	}
	function isSafeUrlSegment(v) {
		if (typeof v !== "string") return false;
		if (v.length === 0 || v.length > 128) return false;
		if (UNSAFE_KEYS$1.indexOf(v) > -1) return false;
		if (v.indexOf("..") > -1) return false;
		if (v.indexOf("/") > -1 || v.indexOf("\\") > -1) return false;
		if (/[?#%\s@]/.test(v)) return false;
		if (/[\x00-\x1F\x7F]/.test(v)) return false;
		return true;
	}
	function sanitizeLogValue(v) {
		if (typeof v !== "string") return v;
		return v.replace(/[\r\n\x00-\x1F\x7F]/g, " ");
	}
	function debounce$1(func, wait, immediate) {
		let timeout;
		return function() {
			const context = this;
			const args = arguments;
			const later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
	function getLastOfPath(object, path, Empty) {
		function cleanKey(key) {
			return key && key.indexOf("###") > -1 ? key.replace(/###/g, ".") : key;
		}
		const stack = typeof path !== "string" ? [].concat(path) : path.split(".");
		while (stack.length > 1) {
			if (!object) return {};
			const key = cleanKey(stack.shift());
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
		const { obj, k } = getLastOfPath(object, path, Object);
		obj[k] = newValue;
	}
	function pushPath(object, path, newValue, concat) {
		const { obj, k } = getLastOfPath(object, path, Object);
		obj[k] = obj[k] || [];
		if (concat) obj[k] = obj[k].concat(newValue);
		if (!concat) obj[k].push(newValue);
	}
	function getPath(object, path) {
		const { obj, k } = getLastOfPath(object, path);
		if (!obj) return void 0;
		return obj[k];
	}
	const regexp$1 = /* @__PURE__ */ new RegExp("{{(.+?)}}", "g");
	function makeString$1(object) {
		if (object == null) return "";
		return "" + object;
	}
	function interpolateUrl(str, data) {
		let match;
		let unsafe = false;
		while (match = regexp$1.exec(str)) {
			const key = match[1].trim();
			if (UNSAFE_KEYS$1.indexOf(key) > -1) {
				regexp$1.lastIndex = 0;
				continue;
			}
			const raw = data[key];
			if (raw == null) {
				regexp$1.lastIndex = 0;
				continue;
			}
			const segments = makeString$1(raw).split("+");
			let segmentsOk = true;
			for (const seg of segments) if (!isSafeUrlSegment(seg)) {
				segmentsOk = false;
				break;
			}
			if (!segmentsOk) {
				unsafe = true;
				break;
			}
			str = str.replace(match[0], segments.join("+"));
			regexp$1.lastIndex = 0;
		}
		regexp$1.lastIndex = 0;
		return unsafe ? null : str;
	}
	function isMissingOption$1(obj, props) {
		return props.reduce((mem, p) => {
			if (mem) return mem;
			if (!obj || !obj[p] || typeof obj[p] !== "string" || !obj[p].toLowerCase() === p.toLowerCase()) {
				const err = `i18next-locize-backend :: got "${obj[p]}" in options for ${p} which is invalid.`;
				console.warn(err);
				return err;
			}
			return false;
		}, false);
	}
	function defer() {
		let res;
		let rej;
		const promise = new Promise((resolve, reject) => {
			res = resolve;
			rej = reject;
		});
		promise.resolve = res;
		promise.reject = rej;
		return promise;
	}
	const g$1 = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : void 0;
	let fetchApi$1;
	if (typeof fetch === "function") fetchApi$1 = fetch;
	else if (g$1 && typeof g$1.fetch === "function") fetchApi$1 = g$1.fetch;
	const XmlHttpRequestApi$1 = (typeof XMLHttpRequest === "function" || typeof XMLHttpRequest === "object") && g$1 ? g$1.XMLHttpRequest : void 0;
	const ActiveXObjectApi$1 = typeof ActiveXObject === "function" && g$1 ? g$1.ActiveXObject : void 0;
	const storage = {};
	const parseMaxAge = (headerString) => {
		if (!headerString) return 0;
		const matches = headerString.match(/max-age=([0-9]+)/);
		return matches ? parseInt(matches[1], 10) : 0;
	};
	const requestWithFetch$1 = (options, url, payload, callback) => {
		const headers = {};
		if (typeof window === "undefined" && typeof global !== "undefined" && typeof global.process !== "undefined" && global.process.versions && global.process.versions.node) headers["User-Agent"] = `i18next-locize-backend (node/${global.process.version}; ${global.process.platform} ${global.process.arch})`;
		if (options.authorize && options.apiKey) headers.Authorization = options.apiKey;
		if (payload || options.setContentTypeJSON) headers["Content-Type"] = "application/json";
		const resolver = (response) => {
			let resourceNotExisting = response.headers && response.headers.get("x-cache") === "Error from cloudfront";
			if (options.cdnType === "standard" && response.status === 404 && (!response.headers || !response.headers.get("x-cache"))) {
				resourceNotExisting = true;
				return callback(null, {
					status: 200,
					data: "{}",
					resourceNotExisting
				});
			}
			if (!response.ok) return callback(response.statusText || "Error", {
				status: response.status,
				resourceNotExisting
			});
			const cacheControl = response.headers && response.headers.get("cache-control");
			response.text().then((data) => {
				callback(null, {
					status: response.status,
					data,
					resourceNotExisting,
					cacheControl
				});
			}).catch(callback);
		};
		if (typeof fetch === "function") fetch(url, {
			method: payload ? "POST" : "GET",
			body: payload ? JSON.stringify(payload) : void 0,
			headers
		}).then(resolver).catch(callback);
		else fetchApi$1(url, {
			method: payload ? "POST" : "GET",
			body: payload ? JSON.stringify(payload) : void 0,
			headers
		}).then(resolver).catch(callback);
	};
	const requestWithXmlHttpRequest$1 = (options, url, payload, callback) => {
		try {
			const x = XmlHttpRequestApi$1 ? new XmlHttpRequestApi$1() : new ActiveXObjectApi$1("MSXML2.XMLHTTP.3.0");
			x.open(payload ? "POST" : "GET", url, 1);
			if (!options.crossDomain) x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			if (options.authorize && options.apiKey) x.setRequestHeader("Authorization", options.apiKey);
			if (payload || options.setContentTypeJSON) x.setRequestHeader("Content-Type", "application/json");
			x.onreadystatechange = () => {
				let resourceNotExisting = x.getResponseHeader("x-cache") === "Error from cloudfront";
				if (options.cdnType === "standard" && x.status === 404 && !x.getResponseHeader("x-cache")) {
					resourceNotExisting = true;
					return x.readyState > 3 && callback(null, {
						status: 200,
						data: "{}",
						resourceNotExisting
					});
				}
				const cacheControl = x.getResponseHeader("Cache-Control");
				x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
					status: x.status,
					data: x.responseText,
					resourceNotExisting,
					cacheControl
				});
			};
			x.send(JSON.stringify(payload));
		} catch (e) {
			console && console.log(e);
		}
	};
	const request$1 = (options, url, payload, callback) => {
		if (typeof payload === "function") {
			callback = payload;
			payload = void 0;
		}
		callback = callback || (() => {});
		const useCacheLayer = typeof window === "undefined" && options.useCacheLayer;
		if (useCacheLayer && !payload && !options.noCache && storage[url] && storage[url].expires > Date.now()) return callback(null, storage[url].data);
		const originalCallback = callback;
		callback = (err, res) => {
			if (useCacheLayer && !err && res && !payload && res.cacheControl) {
				const maxAge = parseMaxAge(res.cacheControl);
				if (maxAge > 0) storage[url] = {
					data: res,
					expires: Date.now() + maxAge * 1e3
				};
			}
			originalCallback(err, res);
		};
		if (!payload && options.noCache && options.cdnType === "standard") url += (url.indexOf("?") >= 0 ? "&" : "?") + "cache=no";
		if (fetchApi$1) return requestWithFetch$1(options, url, payload, callback);
		if (XmlHttpRequestApi$1 || ActiveXObjectApi$1) return requestWithXmlHttpRequest$1(options, url, payload, callback);
		callback(/* @__PURE__ */ new Error("No fetch and no xhr implementation found!"));
	};
	const getApiPaths = (cdnType) => {
		if (!cdnType) cdnType = "standard";
		return {
			loadPath: `https://api${cdnType === "standard" ? ".lite" : ""}.locize.app/{{projectId}}/{{version}}/{{lng}}/{{ns}}`,
			privatePath: `https://api${cdnType === "standard" ? ".lite" : ""}.locize.app/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}`,
			getLanguagesPath: `https://api${cdnType === "standard" ? ".lite" : ""}.locize.app/languages/{{projectId}}`,
			addPath: `https://api${cdnType === "standard" ? ".lite" : ""}.locize.app/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}`,
			updatePath: `https://api${cdnType === "standard" ? ".lite" : ""}.locize.app/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}`
		};
	};
	const getDefaults$2 = (cdnType) => {
		if (!cdnType) cdnType = "standard";
		return defaults$2({
			cdnType,
			noCache: false,
			referenceLng: "en",
			crossDomain: true,
			setContentTypeJSON: false,
			version: "latest",
			private: false,
			translatedPercentageThreshold: .9,
			failLoadingOnEmptyJSON: false,
			allowedAddOrUpdateHosts: ["localhost"],
			onSaved: false,
			reloadInterval: typeof window !== "undefined" ? false : 3600 * 1e3,
			checkForProjectTimeout: 3 * 1e3,
			storageExpiration: 3600 * 1e3,
			writeDebounce: 5 * 1e3,
			useCacheLayer: typeof window === "undefined"
		}, getApiPaths(cdnType));
	};
	let hasLocalStorageSupport$1;
	try {
		hasLocalStorageSupport$1 = typeof window !== "undefined" && window.localStorage !== null;
		const testKey = "notExistingLocizeProject";
		window.localStorage.setItem(testKey, "foo");
		window.localStorage.removeItem(testKey);
	} catch (e) {
		hasLocalStorageSupport$1 = false;
	}
	function getStorage(storageExpiration) {
		let setProjectNotExisting = () => {};
		let isProjectNotExisting = () => {};
		if (hasLocalStorageSupport$1) {
			setProjectNotExisting = (projectId) => {
				window.localStorage.setItem(`notExistingLocizeProject_${projectId}`, Date.now());
			};
			isProjectNotExisting = (projectId) => {
				const ret = window.localStorage.getItem(`notExistingLocizeProject_${projectId}`);
				if (!ret) return false;
				if (Date.now() - ret > storageExpiration) {
					window.localStorage.removeItem(`notExistingLocizeProject_${projectId}`);
					return false;
				}
				return true;
			};
		} else if (typeof document !== "undefined") {
			setProjectNotExisting = (projectId) => {
				const date = /* @__PURE__ */ new Date();
				date.setTime(date.getTime() + storageExpiration);
				const expires = `; expires=${date.toGMTString()}`;
				const name = `notExistingLocizeProject_${projectId}`;
				try {
					document.cookie = `${name}=${Date.now()}${expires};path=/`;
				} catch (err) {}
			};
			isProjectNotExisting = (projectId) => {
				const nameEQ = `${`notExistingLocizeProject_${projectId}`}=`;
				try {
					const ca = document.cookie.split(";");
					for (let i = 0; i < ca.length; i++) {
						let c = ca[i];
						while (c.charAt(0) === " ") c = c.substring(1, c.length);
						if (c.indexOf(nameEQ) === 0) return true;
					}
				} catch (err) {}
				return false;
			};
		}
		return {
			setProjectNotExisting,
			isProjectNotExisting
		};
	}
	const getCustomRequestInfo = (url, options, payload) => {
		const headers = {};
		if (options.authorize && options.apiKey) headers.Authorization = options.apiKey;
		if (payload || options.setContentTypeJSON) headers["Content-Type"] = "application/json";
		return {
			method: payload ? "POST" : "GET",
			url,
			headers,
			body: payload
		};
	};
	const handleCustomRequest = (opt, info, cb) => {
		if (opt.request.length === 1) {
			try {
				const r = opt.request(info);
				if (r && typeof r.then === "function") r.then((data) => cb(null, data)).catch(cb);
				else cb(null, r);
			} catch (err) {
				cb(err);
			}
			return;
		}
		opt.request(info, cb);
	};
	function randomizeTimeout(base) {
		const variance = base * .25;
		const min = Math.max(0, base - variance);
		const max = base + variance;
		return Math.floor(min + Math.random() * (max - min));
	}
	var I18NextLocizeBackend = class {
		constructor(services, options = {}, allOptions = {}, callback) {
			this.services = services;
			this.options = options;
			this.allOptions = allOptions;
			this.type = "backend";
			if (services && services.projectId) this.init(null, services, allOptions, options);
			else this.init(services, options, allOptions, callback);
		}
		init(services, options = {}, allOptions = {}, callback) {
			if (!options.referenceLng && allOptions.fallbackLng && Array.isArray(allOptions.fallbackLng) && allOptions.fallbackLng[0] !== "dev") options.referenceLng = allOptions.fallbackLng[0];
			this.services = services;
			const orgPassedOptions = defaults$2({}, options);
			const passedOpt = defaults$2(options, this.options || {});
			const defOpt = getDefaults$2(passedOpt.cdnType);
			if (passedOpt.reloadInterval && passedOpt.reloadInterval < 300 * 1e3) {
				console.warn("Your configured reloadInterval option is to low.");
				passedOpt.reloadInterval = defOpt.reloadInterval;
			}
			this.options = defaults$2(options, this.options || {}, defOpt);
			this.allOptions = allOptions;
			this.somethingLoaded = false;
			this.isProjectNotExisting = false;
			this.storage = getStorage(this.options.storageExpiration);
			const apiPaths = getApiPaths(this.options.cdnType);
			Object.keys(apiPaths).forEach((ap) => {
				if (!orgPassedOptions[ap]) this.options[ap] = apiPaths[ap];
			});
			if (allOptions.debug && orgPassedOptions.noCache === void 0 && this.options.cdnType === "standard") this.options.noCache = true;
			if (this.options.noCache && this.options.cdnType !== "standard") console.warn(`The 'noCache' option is not available for 'cdnType' '${this.options.cdnType}'!`);
			const hostname = typeof window !== "undefined" && window.location && window.location.hostname;
			if (hostname) {
				this.isAddOrUpdateAllowed = typeof this.options.allowedAddOrUpdateHosts === "function" ? this.options.allowedAddOrUpdateHosts(hostname) : this.options.allowedAddOrUpdateHosts.indexOf(hostname) > -1;
				if (services && services.logger && (allOptions.saveMissing || allOptions.updateMissing)) {
					if (!this.isAddOrUpdateAllowed) services.logger.warn(typeof this.options.allowedAddOrUpdateHosts === "function" ? `locize-backend: will not save or update missings because allowedAddOrUpdateHosts returned false for the host "${hostname}".` : `locize-backend: will not save or update missings because the host "${hostname}" was not in the list of allowedAddOrUpdateHosts: ${this.options.allowedAddOrUpdateHosts.join(", ")} (matches need to be exact).`);
					else if (hostname !== "localhost") services.logger.warn(`locize-backend: you are using the save or update missings feature from this host "${hostname}".\nMake sure you will not use it in production!\nhttps://www.locize.com/docs/going-to-production`);
				}
			} else this.isAddOrUpdateAllowed = true;
			if (typeof callback === "function") this.getOptions((err, opts, languages) => {
				if (err) return callback(err);
				this.options.referenceLng = options.referenceLng || opts.referenceLng || this.options.referenceLng;
				callback(null, opts, languages);
			});
			this.queuedWrites = { pending: {} };
			this.debouncedProcess = debounce$1(this.process, this.options.writeDebounce);
			if (this.interval) clearInterval(this.interval);
			if (this.options.reloadInterval && this.options.projectId) {
				this.interval = setInterval(() => this.reload(), this.options.reloadInterval);
				if (typeof this.interval === "object" && typeof this.interval.unref === "function") this.interval.unref();
			}
		}
		reload() {
			const { backendConnector, languageUtils, logger } = this.services || { logger: console };
			if (!backendConnector) return;
			const currentLanguage = backendConnector.language;
			if (currentLanguage && currentLanguage.toLowerCase() === "cimode") return;
			const toLoad = [];
			const append = (lng) => {
				languageUtils.toResolveHierarchy(lng).forEach((l) => {
					if (toLoad.indexOf(l) < 0) toLoad.push(l);
				});
			};
			append(currentLanguage);
			if (this.allOptions.preload) this.allOptions.preload.forEach((l) => append(l));
			toLoad.forEach((lng) => {
				this.allOptions.ns.forEach((ns) => {
					backendConnector.read(lng, ns, "read", null, null, (err, data) => {
						if (err) logger.warn(`loading namespace ${ns} for language ${lng} failed`, err);
						if (!err && data) logger.log(`loaded namespace ${ns} for language ${lng}`, data);
						backendConnector.loaded(`${lng}|${ns}`, err, data);
					});
				});
			});
		}
		getLanguages(callback) {
			let deferred;
			if (!callback) {
				deferred = defer();
				callback = (err, ret) => {
					if (err) return deferred.reject(err);
					deferred.resolve(ret);
				};
			}
			const isMissing = isMissingOption$1(this.options, ["projectId"]);
			if (isMissing) {
				callback(new Error(isMissing));
				return deferred;
			}
			const url = interpolateUrl(this.options.getLanguagesPath, { projectId: this.options.projectId });
			if (url == null) {
				callback(/* @__PURE__ */ new Error("i18next-locize-backend: unsafe projectId — refusing to build request URL for projectId=" + sanitizeLogValue(String(this.options.projectId))));
				return deferred;
			}
			if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) this.isProjectNotExisting = true;
			if (this.isProjectNotExisting) {
				callback(new Error(this.isProjectNotExistingErrorMessage || `Locize project ${this.options.projectId} does not exist!`));
				return deferred;
			}
			this.getLanguagesCalls = this.getLanguagesCalls || [];
			this.getLanguagesCalls.push(callback);
			if (this.getLanguagesCalls.length > 1) return deferred;
			this.loadUrl({}, url, (err, ret, info) => {
				if (!this.somethingLoaded && info && info.resourceNotExisting) {
					this.isProjectNotExisting = true;
					let errMsg = `Locize project ${this.options.projectId} does not exist!`;
					this.isProjectNotExistingErrorMessage = errMsg;
					const cdnTypeAlt = this.options.cdnType === "standard" ? "pro" : "standard";
					const urlAlt = interpolateUrl(getApiPaths(cdnTypeAlt).getLanguagesPath, { projectId: this.options.projectId });
					if (urlAlt == null) return;
					this.loadUrl({}, urlAlt, (errAlt, retAlt, infoAlt) => {
						if (!errAlt && retAlt && (!infoAlt || !infoAlt.resourceNotExisting)) {
							errMsg += ` It seems you're using the wrong cdnType. Your Locize project is configured to use "${cdnTypeAlt}" but here you've configured "${this.options.cdnType}".`;
							this.isProjectNotExistingErrorMessage = errMsg;
						} else if (!this.somethingLoaded && infoAlt && infoAlt.resourceNotExisting) {
							this.isProjectNotExisting = true;
							this.storage.setProjectNotExisting(this.options.projectId);
						}
						const e = new Error(errMsg);
						const clbs = this.getLanguagesCalls;
						this.getLanguagesCalls = [];
						clbs.forEach((clb) => clb(e));
					});
					return;
				}
				if (ret) {
					this.loadedLanguages = Object.keys(ret);
					const referenceLng = this.loadedLanguages.reduce((mem, k) => {
						if (ret[k].isReferenceLanguage) mem = k;
						return mem;
					}, "");
					if (referenceLng && this.options.referenceLng !== referenceLng) this.options.referenceLng = referenceLng;
				}
				this.somethingLoaded = true;
				const clbs = this.getLanguagesCalls;
				this.getLanguagesCalls = [];
				clbs.forEach((clb) => clb(err, ret));
			});
			return deferred;
		}
		getOptions(callback) {
			let deferred;
			if (!callback) {
				deferred = defer();
				callback = (err, ret) => {
					if (err) return deferred.reject(err);
					deferred.resolve(ret);
				};
			}
			this.getLanguages((err, data) => {
				if (err) return callback(err);
				const keys = Object.keys(data);
				if (!keys.length) return callback(/* @__PURE__ */ new Error("was unable to load languages via API"));
				const lngs = keys.reduce((mem, k) => {
					const item = data[k];
					if (item.translated[this.options.version] && item.translated[this.options.version] >= this.options.translatedPercentageThreshold) mem.push(k);
					return mem;
				}, []);
				const hasRegion = keys.reduce((mem, k) => {
					if (k.indexOf("-") > -1) return true;
					return mem;
				}, false);
				callback(null, {
					fallbackLng: this.options.referenceLng,
					referenceLng: this.options.referenceLng,
					supportedLngs: lngs.length === 0 && this.options.referenceLng ? [this.options.referenceLng] : lngs,
					load: hasRegion ? "all" : "languageOnly"
				}, data);
			});
			return deferred;
		}
		checkIfProjectExists(callback) {
			const { logger } = this.services || { logger: console };
			if (this.somethingLoaded) {
				if (callback) callback(null);
				return;
			}
			if (this.alreadyRequestedCheckIfProjectExists) {
				setTimeout(() => this.checkIfProjectExists(callback), randomizeTimeout(this.options.checkForProjectTimeout));
				return;
			}
			this.alreadyRequestedCheckIfProjectExists = true;
			this.getLanguages((err) => {
				if (err && err.message && err.message.indexOf("does not exist") > 0) {
					if (logger) logger.error(err.message);
				}
				if (callback) callback(err);
			});
		}
		checkIfLanguagesLoaded(callback) {
			const { logger } = this.services || { logger: console };
			if (this.loadedLanguages) {
				if (callback) callback(null);
				return;
			}
			this.getLanguages((err) => {
				if (err && err.message && err.message.indexOf("does not exist") > 0) {
					if (logger) logger.error(err.message);
				}
				if (callback) callback(err);
			});
		}
		read(language, namespace, callback) {
			const { logger } = this.services || { logger: console };
			let url;
			let options = {};
			if (this.options.private) {
				const isMissing = isMissingOption$1(this.options, [
					"projectId",
					"version",
					"apiKey"
				]);
				if (isMissing) return callback(new Error(isMissing), false);
				url = interpolateUrl(this.options.privatePath, {
					lng: language,
					ns: namespace,
					projectId: this.options.projectId,
					version: this.options.version
				});
				options = { authorize: true };
			} else {
				const isMissing = isMissingOption$1(this.options, ["projectId", "version"]);
				if (isMissing) return callback(new Error(isMissing), false);
				url = interpolateUrl(this.options.loadPath, {
					lng: language,
					ns: namespace,
					projectId: this.options.projectId,
					version: this.options.version
				});
			}
			if (url == null) return callback(/* @__PURE__ */ new Error("i18next-locize-backend: unsafe lng/ns/projectId/version — refusing to build request URL for lng=" + sanitizeLogValue(String(language)) + " ns=" + sanitizeLogValue(String(namespace))), false);
			if (!this.isProjectNotExisting && this.storage.isProjectNotExisting(this.options.projectId)) this.isProjectNotExisting = true;
			if (this.isProjectNotExisting) {
				const err = new Error(this.isProjectNotExistingErrorMessage || `Locize project ${this.options.projectId} does not exist!`);
				if (logger) logger.error(err.message);
				if (callback) callback(err);
				return;
			}
			if (this.warnedLanguages && this.warnedLanguages.indexOf(language) > -1) {
				const err = /* @__PURE__ */ new Error(`Will not continue to load language "${language}" since it is not available in Locize project ${this.options.projectId}!`);
				if (logger) logger.error(err.message);
				if (callback) callback(err);
				return;
			}
			this.loadUrl(options, url, (err, ret, info) => {
				const resourceNotExisting = info && info.resourceNotExisting;
				if (!resourceNotExisting) {
					this.hasResourcesForLng || (this.hasResourcesForLng = {});
					this.hasResourcesForLng[language] = true;
				}
				if (resourceNotExisting && (!this.hasResourcesForLng || !this.hasResourcesForLng[language])) setTimeout(() => {
					this.checkIfLanguagesLoaded(() => {
						if (!this.loadedLanguages) return;
						if (this.loadedLanguages.indexOf(language) > -1) return;
						if (this.warnedLanguages && this.warnedLanguages.indexOf(language) > -1) return;
						this.warnedLanguages || (this.warnedLanguages = []);
						this.warnedLanguages.push(language);
						if (logger) logger.error(`Language "${language}" is not available in Locize project ${this.options.projectId}!`);
					});
				}, randomizeTimeout(this.options.checkForProjectTimeout));
				if (!this.somethingLoaded) if (resourceNotExisting) setTimeout(() => this.checkIfProjectExists(), randomizeTimeout(this.options.checkForProjectTimeout));
				else this.somethingLoaded = true;
				callback(err, ret);
			});
		}
		loadUrl(options, url, payload, callback) {
			options = defaults$2(options, this.options);
			if (typeof payload === "function") {
				callback = payload;
				payload = void 0;
			}
			callback = callback || (() => {});
			const clb = (err, res) => {
				const resourceNotExisting = res && res.resourceNotExisting;
				if (res && (res.status === 408 || res.status === 400)) return callback("failed loading " + url, true, { resourceNotExisting });
				if (res && (res.status >= 500 && res.status < 600 || !res.status)) return callback("failed loading " + url, true, { resourceNotExisting });
				if (res && res.status >= 400 && res.status < 500) return callback("failed loading " + url, false, { resourceNotExisting });
				if (!res && err && err.message) {
					const errorMessage = err.message.toLowerCase();
					if ([
						"failed",
						"fetch",
						"network",
						"load"
					].find((term) => errorMessage.indexOf(term) > -1)) return callback("failed loading " + url + ": " + err.message, true, { resourceNotExisting });
				}
				if (err) return callback(err, false);
				let ret, parseErr;
				try {
					if (typeof res.data === "string") ret = JSON.parse(res.data);
					else ret = res.data;
				} catch (e) {
					parseErr = "failed parsing " + url + " to json";
				}
				if (parseErr) return callback(parseErr, false);
				if (this.options.failLoadingOnEmptyJSON && !Object.keys(ret).length) return callback("loaded result empty for " + url, false, { resourceNotExisting });
				callback(null, ret, { resourceNotExisting });
			};
			if (!this.options.request || url.indexOf(`/languages/${options.projectId}`) > 0) return request$1(options, url, payload, clb);
			const info = getCustomRequestInfo(url, options, payload);
			handleCustomRequest(this.options, info, clb);
		}
		create(languages, namespace, key, fallbackValue, callback, options) {
			if (typeof callback !== "function") callback = () => {};
			this.checkIfProjectExists((err) => {
				if (err) return callback(err);
				const isMissing = isMissingOption$1(this.options, [
					"projectId",
					"version",
					"apiKey",
					"referenceLng"
				]);
				if (isMissing) return callback(new Error(isMissing));
				if (!this.isAddOrUpdateAllowed) return callback("host is not allowed to create key.");
				if (typeof languages === "string") languages = [languages];
				if (languages.filter((l) => l === this.options.referenceLng).length < 1) this.services && this.services.logger && this.services.logger.warn(`locize-backend: will not save missings because the reference language "${this.options.referenceLng}" was not in the list of to save languages: ${languages.join(", ")} (open your site in the reference language to save missings).`);
				languages.forEach((lng) => {
					if (lng === this.options.referenceLng) this.queue.call(this, this.options.referenceLng, namespace, key, fallbackValue, callback, options);
				});
			});
		}
		update(languages, namespace, key, fallbackValue, callback, options) {
			if (typeof callback !== "function") callback = () => {};
			this.checkIfProjectExists((err) => {
				if (err) return callback(err);
				const isMissing = isMissingOption$1(this.options, [
					"projectId",
					"version",
					"apiKey",
					"referenceLng"
				]);
				if (isMissing) return callback(new Error(isMissing));
				if (!this.isAddOrUpdateAllowed) return callback("host is not allowed to update key.");
				if (!options) options = {};
				if (typeof languages === "string") languages = [languages];
				options.isUpdate = true;
				languages.forEach((lng) => {
					if (lng === this.options.referenceLng) this.queue.call(this, this.options.referenceLng, namespace, key, fallbackValue, callback, options);
				});
			});
		}
		writePage(lng, namespace, missings, callback) {
			const missingUrl = interpolateUrl(this.options.addPath, {
				lng,
				ns: namespace,
				projectId: this.options.projectId,
				version: this.options.version
			});
			const updatesUrl = interpolateUrl(this.options.updatePath, {
				lng,
				ns: namespace,
				projectId: this.options.projectId,
				version: this.options.version
			});
			if (missingUrl == null || updatesUrl == null) {
				if (typeof callback === "function") callback(/* @__PURE__ */ new Error("i18next-locize-backend: unsafe lng/ns/projectId/version — refusing to persist missing keys for lng=" + sanitizeLogValue(String(lng)) + " ns=" + sanitizeLogValue(String(namespace))));
				return;
			}
			let hasMissing = false;
			let hasUpdates = false;
			const payloadMissing = {};
			const payloadUpdate = {};
			missings.forEach((item) => {
				const value = item.options && item.options.tDescription ? {
					value: item.fallbackValue || "",
					context: { text: item.options.tDescription }
				} : item.fallbackValue || "";
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
			if (hasMissing) if (!this.options.request) request$1(defaults$2({ authorize: true }, this.options), missingUrl, payloadMissing, doneOne);
			else {
				const info = getCustomRequestInfo(missingUrl, defaults$2({ authorize: true }, this.options), payloadMissing);
				handleCustomRequest(this.options, info, doneOne);
			}
			if (hasUpdates) if (!this.options.request) request$1(defaults$2({ authorize: true }, this.options), updatesUrl, payloadUpdate, doneOne);
			else {
				const info = getCustomRequestInfo(updatesUrl, defaults$2({ authorize: true }, this.options), payloadUpdate);
				handleCustomRequest(this.options, info, doneOne);
			}
		}
		write(lng, namespace) {
			if (getPath(this.queuedWrites, [
				"locks",
				lng,
				namespace
			])) return;
			const missings = getPath(this.queuedWrites, [lng, namespace]);
			setPath(this.queuedWrites, [lng, namespace], []);
			const pageSize = 1e3;
			const clbs = missings.filter((m) => m.callback).map((missing) => missing.callback);
			if (missings.length) {
				setPath(this.queuedWrites, [
					"locks",
					lng,
					namespace
				], true);
				const namespaceSaved = () => {
					setPath(this.queuedWrites, [
						"locks",
						lng,
						namespace
					], false);
					clbs.forEach((clb) => clb());
					if (this.options.onSaved) this.options.onSaved(lng, namespace);
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
					if (page.length) this.writePage(lng, namespace, page, () => {
						pagesDone++;
						if (pagesDone >= amountOfPages) namespaceSaved();
					});
				}
			}
		}
		process() {
			Object.keys(this.queuedWrites).forEach((lng) => {
				if (lng === "locks") return;
				Object.keys(this.queuedWrites[lng]).forEach((ns) => {
					if (this.queuedWrites[lng][ns].length) this.write(lng, ns);
				});
			});
		}
		queue(lng, namespace, key, fallbackValue, callback, options) {
			pushPath(this.queuedWrites, [lng, namespace], {
				key,
				fallbackValue: fallbackValue || "",
				callback,
				options
			});
			this.debouncedProcess();
		}
	};
	I18NextLocizeBackend.type = "backend";
	//#endregion
	//#region node_modules/i18next-browser-languagedetector/dist/esm/i18nextBrowserLanguageDetector.js
	const { slice: slice$1, forEach } = [];
	function defaults$1(obj) {
		forEach.call(slice$1.call(arguments, 1), (source) => {
			if (source) {
				for (const prop in source) if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		});
		return obj;
	}
	function hasXSS(input) {
		if (typeof input !== "string") return false;
		return [
			/<\s*script.*?>/i,
			/<\s*\/\s*script\s*>/i,
			/<\s*img.*?on\w+\s*=/i,
			/<\s*\w+\s*on\w+\s*=.*?>/i,
			/javascript\s*:/i,
			/vbscript\s*:/i,
			/expression\s*\(/i,
			/eval\s*\(/i,
			/alert\s*\(/i,
			/document\.cookie/i,
			/document\.write\s*\(/i,
			/window\.location/i,
			/innerHTML/i
		].some((pattern) => pattern.test(input));
	}
	const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
	const serializeCookie = function(name, val) {
		const opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : { path: "/" };
		let str = `${name}=${encodeURIComponent(val)}`;
		if (opt.maxAge > 0) {
			const maxAge = opt.maxAge - 0;
			if (Number.isNaN(maxAge)) throw new Error("maxAge should be a Number");
			str += `; Max-Age=${Math.floor(maxAge)}`;
		}
		if (opt.domain) {
			if (!fieldContentRegExp.test(opt.domain)) throw new TypeError("option domain is invalid");
			str += `; Domain=${opt.domain}`;
		}
		if (opt.path) {
			if (!fieldContentRegExp.test(opt.path)) throw new TypeError("option path is invalid");
			str += `; Path=${opt.path}`;
		}
		if (opt.expires) {
			if (typeof opt.expires.toUTCString !== "function") throw new TypeError("option expires is invalid");
			str += `; Expires=${opt.expires.toUTCString()}`;
		}
		if (opt.httpOnly) str += "; HttpOnly";
		if (opt.secure) str += "; Secure";
		if (opt.sameSite) switch (typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite) {
			case true:
				str += "; SameSite=Strict";
				break;
			case "lax":
				str += "; SameSite=Lax";
				break;
			case "strict":
				str += "; SameSite=Strict";
				break;
			case "none":
				str += "; SameSite=None";
				break;
			default: throw new TypeError("option sameSite is invalid");
		}
		if (opt.partitioned) str += "; Partitioned";
		return str;
	};
	const cookie = {
		create(name, value, minutes, domain) {
			let cookieOptions = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {
				path: "/",
				sameSite: "strict"
			};
			if (minutes) {
				cookieOptions.expires = /* @__PURE__ */ new Date();
				cookieOptions.expires.setTime(cookieOptions.expires.getTime() + minutes * 60 * 1e3);
			}
			if (domain) cookieOptions.domain = domain;
			document.cookie = serializeCookie(name, value, cookieOptions);
		},
		read(name) {
			const nameEQ = `${name}=`;
			const ca = document.cookie.split(";");
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) === " ") c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		},
		remove(name, domain) {
			this.create(name, "", -1, domain);
		}
	};
	var cookie$1 = {
		name: "cookie",
		lookup(_ref) {
			let { lookupCookie } = _ref;
			if (lookupCookie && typeof document !== "undefined") return cookie.read(lookupCookie) || void 0;
		},
		cacheUserLanguage(lng, _ref2) {
			let { lookupCookie, cookieMinutes, cookieDomain, cookieOptions } = _ref2;
			if (lookupCookie && typeof document !== "undefined") cookie.create(lookupCookie, lng, cookieMinutes, cookieDomain, cookieOptions);
		}
	};
	var querystring = {
		name: "querystring",
		lookup(_ref) {
			let { lookupQuerystring } = _ref;
			let found;
			if (typeof window !== "undefined") {
				let { search } = window.location;
				if (!window.location.search && window.location.hash?.indexOf("?") > -1) search = window.location.hash.substring(window.location.hash.indexOf("?"));
				const params = search.substring(1).split("&");
				for (let i = 0; i < params.length; i++) {
					const pos = params[i].indexOf("=");
					if (pos > 0) {
						if (params[i].substring(0, pos) === lookupQuerystring) found = params[i].substring(pos + 1);
					}
				}
			}
			return found;
		}
	};
	var hash = {
		name: "hash",
		lookup(_ref) {
			let { lookupHash, lookupFromHashIndex } = _ref;
			let found;
			if (typeof window !== "undefined") {
				const { hash } = window.location;
				if (hash && hash.length > 2) {
					const query = hash.substring(1);
					if (lookupHash) {
						const params = query.split("&");
						for (let i = 0; i < params.length; i++) {
							const pos = params[i].indexOf("=");
							if (pos > 0) {
								if (params[i].substring(0, pos) === lookupHash) found = params[i].substring(pos + 1);
							}
						}
					}
					if (found) return found;
					if (!found && lookupFromHashIndex > -1) {
						const language = hash.match(/\/([a-zA-Z-]*)/g);
						if (!Array.isArray(language)) return void 0;
						return language[typeof lookupFromHashIndex === "number" ? lookupFromHashIndex : 0]?.replace("/", "");
					}
				}
			}
			return found;
		}
	};
	let hasLocalStorageSupport = null;
	const localStorageAvailable = () => {
		if (hasLocalStorageSupport !== null) return hasLocalStorageSupport;
		try {
			hasLocalStorageSupport = typeof window !== "undefined" && window.localStorage !== null;
			if (!hasLocalStorageSupport) return false;
			const testKey = "i18next.translate.boo";
			window.localStorage.setItem(testKey, "foo");
			window.localStorage.removeItem(testKey);
		} catch (e) {
			hasLocalStorageSupport = false;
		}
		return hasLocalStorageSupport;
	};
	var localStorage = {
		name: "localStorage",
		lookup(_ref) {
			let { lookupLocalStorage } = _ref;
			if (lookupLocalStorage && localStorageAvailable()) return window.localStorage.getItem(lookupLocalStorage) || void 0;
		},
		cacheUserLanguage(lng, _ref2) {
			let { lookupLocalStorage } = _ref2;
			if (lookupLocalStorage && localStorageAvailable()) window.localStorage.setItem(lookupLocalStorage, lng);
		}
	};
	let hasSessionStorageSupport = null;
	const sessionStorageAvailable = () => {
		if (hasSessionStorageSupport !== null) return hasSessionStorageSupport;
		try {
			hasSessionStorageSupport = typeof window !== "undefined" && window.sessionStorage !== null;
			if (!hasSessionStorageSupport) return false;
			const testKey = "i18next.translate.boo";
			window.sessionStorage.setItem(testKey, "foo");
			window.sessionStorage.removeItem(testKey);
		} catch (e) {
			hasSessionStorageSupport = false;
		}
		return hasSessionStorageSupport;
	};
	var sessionStorage = {
		name: "sessionStorage",
		lookup(_ref) {
			let { lookupSessionStorage } = _ref;
			if (lookupSessionStorage && sessionStorageAvailable()) return window.sessionStorage.getItem(lookupSessionStorage) || void 0;
		},
		cacheUserLanguage(lng, _ref2) {
			let { lookupSessionStorage } = _ref2;
			if (lookupSessionStorage && sessionStorageAvailable()) window.sessionStorage.setItem(lookupSessionStorage, lng);
		}
	};
	var navigator$1 = {
		name: "navigator",
		lookup(options) {
			const found = [];
			if (typeof navigator !== "undefined") {
				const { languages, userLanguage, language } = navigator;
				if (languages) for (let i = 0; i < languages.length; i++) found.push(languages[i]);
				if (userLanguage) found.push(userLanguage);
				if (language) found.push(language);
			}
			return found.length > 0 ? found : void 0;
		}
	};
	var htmlTag = {
		name: "htmlTag",
		lookup(_ref) {
			let { htmlTag } = _ref;
			let found;
			const internalHtmlTag = htmlTag || (typeof document !== "undefined" ? document.documentElement : null);
			if (internalHtmlTag && typeof internalHtmlTag.getAttribute === "function") found = internalHtmlTag.getAttribute("lang");
			return found;
		}
	};
	var path = {
		name: "path",
		lookup(_ref) {
			let { lookupFromPathIndex } = _ref;
			if (typeof window === "undefined") return void 0;
			const language = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
			if (!Array.isArray(language)) return void 0;
			return language[typeof lookupFromPathIndex === "number" ? lookupFromPathIndex : 0]?.replace("/", "");
		}
	};
	var subdomain = {
		name: "subdomain",
		lookup(_ref) {
			let { lookupFromSubdomainIndex } = _ref;
			const internalLookupFromSubdomainIndex = typeof lookupFromSubdomainIndex === "number" ? lookupFromSubdomainIndex + 1 : 1;
			const language = typeof window !== "undefined" && window.location?.hostname?.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);
			if (!language) return void 0;
			return language[internalLookupFromSubdomainIndex];
		}
	};
	let canCookies = false;
	try {
		document.cookie;
		canCookies = true;
	} catch (e) {}
	const order = [
		"querystring",
		"cookie",
		"localStorage",
		"sessionStorage",
		"navigator",
		"htmlTag"
	];
	if (!canCookies) order.splice(1, 1);
	const getDefaults$1 = () => ({
		order,
		lookupQuerystring: "lng",
		lookupCookie: "i18next",
		lookupLocalStorage: "i18nextLng",
		lookupSessionStorage: "i18nextLng",
		caches: ["localStorage"],
		excludeCacheFor: ["cimode"],
		convertDetectedLanguage: (l) => l
	});
	var Browser = class {
		constructor(services) {
			let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			this.type = "languageDetector";
			this.detectors = {};
			this.init(services, options);
		}
		init() {
			let services = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : { languageUtils: {} };
			let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			let i18nOptions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
			this.services = services;
			this.options = defaults$1(options, this.options || {}, getDefaults$1());
			if (typeof this.options.convertDetectedLanguage === "string" && this.options.convertDetectedLanguage.indexOf("15897") > -1) this.options.convertDetectedLanguage = (l) => l.replace("-", "_");
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
			this.addDetector(hash);
		}
		addDetector(detector) {
			this.detectors[detector.name] = detector;
			return this;
		}
		detect() {
			let detectionOrder = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.options.order;
			let detected = [];
			detectionOrder.forEach((detectorName) => {
				if (this.detectors[detectorName]) {
					let lookup = this.detectors[detectorName].lookup(this.options);
					if (lookup && typeof lookup === "string") lookup = [lookup];
					if (lookup) detected = detected.concat(lookup);
				}
			});
			detected = detected.filter((d) => d !== void 0 && d !== null && !hasXSS(d)).map((d) => this.options.convertDetectedLanguage(d));
			if (this.services && this.services.languageUtils && this.services.languageUtils.getBestMatchFromCodes) return detected;
			return detected.length > 0 ? detected[0] : null;
		}
		cacheUserLanguage(lng) {
			let caches = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.options.caches;
			if (!caches) return;
			if (this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(lng) > -1) return;
			caches.forEach((cacheName) => {
				if (this.detectors[cacheName]) this.detectors[cacheName].cacheUserLanguage(lng, this.options);
			});
		}
	};
	Browser.type = "languageDetector";
	//#endregion
	//#region node_modules/locize-lastused/esm/index.js
	const arr = [];
	const each = arr.forEach;
	const slice = arr.slice;
	function defaults(obj) {
		each.call(slice.call(arguments, 1), (source) => {
			if (source) {
				for (const prop in source) if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		});
		return obj;
	}
	function debounce(func, wait, immediate) {
		let timeout;
		return function() {
			const context = this;
			const args = arguments;
			const later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
	function isMissingOption(obj, props) {
		return props.reduce((mem, p) => {
			if (mem) return mem;
			if (!obj || !obj[p] || typeof obj[p] !== "string" || !obj[p].toLowerCase() === p.toLowerCase()) {
				const err = `i18next-lastused :: got "${obj[p]}" in options for ${p} which is invalid.`;
				console.warn(err);
				return err;
			}
			return false;
		}, false);
	}
	function replaceIn(str, arr, options) {
		let ret = str;
		arr.forEach((s) => {
			const regexp = new RegExp(`{{${s}}}`, "g");
			ret = ret.replace(regexp, options[s]);
		});
		return ret;
	}
	const g = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : void 0;
	let fetchApi;
	if (typeof fetch === "function") fetchApi = fetch;
	else if (g && typeof g.fetch === "function") fetchApi = g.fetch;
	const XmlHttpRequestApi = (typeof XMLHttpRequest === "function" || typeof XMLHttpRequest === "object") && g ? g.XMLHttpRequest : void 0;
	const ActiveXObjectApi = typeof ActiveXObject === "function" && g ? g.ActiveXObject : void 0;
	const requestWithFetch = (options, url, payload, callback) => {
		const resolver = (response) => {
			const resourceNotExisting = response.headers && response.headers.get("x-cache") === "Error from cloudfront";
			if (!response.ok) return callback(response.statusText || "Error", {
				status: response.status,
				resourceNotExisting
			});
			response.text().then((data) => {
				callback(null, {
					status: response.status,
					data,
					resourceNotExisting
				});
			}).catch(callback);
		};
		const headers = {
			Authorization: options.authorize && options.apiKey ? options.apiKey : void 0,
			"Content-Type": "application/json"
		};
		if (typeof window === "undefined" && typeof global !== "undefined" && typeof global.process !== "undefined" && global.process.versions && global.process.versions.node) headers["User-Agent"] = `locize-lastused (node/${global.process.version}; ${global.process.platform} ${global.process.arch})`;
		if (typeof fetch === "function") fetch(url, {
			method: payload ? "POST" : "GET",
			body: payload ? JSON.stringify(payload) : void 0,
			headers
		}).then(resolver).catch(callback);
		else fetchApi(url, {
			method: payload ? "POST" : "GET",
			body: payload ? JSON.stringify(payload) : void 0,
			headers
		}).then(resolver).catch(callback);
	};
	const requestWithXmlHttpRequest = (options, url, payload, callback) => {
		try {
			const x = XmlHttpRequestApi ? new XmlHttpRequestApi() : new ActiveXObjectApi("MSXML2.XMLHTTP.3.0");
			x.open(payload ? "POST" : "GET", url, 1);
			if (!options.crossDomain) x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			if (options.authorize && options.apiKey) x.setRequestHeader("Authorization", options.apiKey);
			if (payload || options.setContentTypeJSON) x.setRequestHeader("Content-Type", "application/json");
			x.onreadystatechange = () => {
				const resourceNotExisting = x.getResponseHeader("x-cache") === "Error from cloudfront";
				x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
					status: x.status,
					data: x.responseText,
					resourceNotExisting
				});
			};
			x.send(JSON.stringify(payload));
		} catch (e) {
			console && console.log(e);
		}
	};
	const request = (options, url, payload, callback) => {
		if (typeof payload === "function") {
			callback = payload;
			payload = void 0;
		}
		callback = callback || (() => {});
		if (fetchApi) return requestWithFetch(options, url, payload, callback);
		if (XmlHttpRequestApi || ActiveXObjectApi) return requestWithXmlHttpRequest(options, url, payload, callback);
		callback(/* @__PURE__ */ new Error("No fetch and no xhr implementation found!"));
	};
	const getDefaults = () => {
		return {
			lastUsedPath: "https://api.locize.app/used/{{projectId}}/{{version}}/{{lng}}/{{ns}}",
			referenceLng: "en",
			crossDomain: true,
			setContentTypeJSON: false,
			version: "latest",
			debounceSubmit: 9e4,
			allowedHosts: ["localhost"]
		};
	};
	const locizeLastUsed = {
		init(options) {
			const isI18next = options.t && typeof options.t === "function";
			if (isI18next && !options.options.locizeLastUsed.projectId && options.options.backend.projectId) options.options.locizeLastUsed.projectId = options.options.backend.projectId;
			if (isI18next && !options.options.locizeLastUsed.version && options.options.backend.version) options.options.locizeLastUsed.version = options.options.backend.version;
			if (isI18next && !options.options.locizeLastUsed.apiKey && options.options.backend.apiKey) options.options.locizeLastUsed.apiKey = options.options.backend.apiKey;
			if (isI18next && !options.options.locizeLastUsed.referenceLng && options.options.backend.referenceLng) options.options.locizeLastUsed.referenceLng = options.options.backend.referenceLng;
			if (isI18next && !options.options.locizeLastUsed.referenceLng && options.options.fallbackLng && Array.isArray(options.options.fallbackLng) && options.options.fallbackLng[0] !== "dev") options.options.locizeLastUsed.referenceLng = options.options.fallbackLng[0];
			this.options = isI18next ? defaults(options.options.locizeLastUsed, this.options || {}, getDefaults()) : defaults(options, this.options || {}, getDefaults());
			const hostname = typeof window !== "undefined" && window.location && window.location.hostname;
			if (hostname) this.isAllowed = this.options.allowedHosts.indexOf(hostname) > -1;
			else this.isAllowed = true;
			this.submitting = null;
			this.pending = {};
			this.done = {};
			this.submit = debounce(this.submit, this.options.debounceSubmit);
			if (isI18next) this.interceptI18next(options);
		},
		interceptI18next(i18next) {
			const origGetResource = i18next.services.resourceStore.getResource;
			i18next.services.resourceStore.getResource = (lng, ns, key, options) => {
				if (key) this.used(ns, key);
				return origGetResource.call(i18next.services.resourceStore, lng, ns, key, options);
			};
		},
		used(ns, key, callback) {
			["pending", "done"].forEach((k) => {
				if (this.done[ns] && this.done[ns][key]) return;
				if (!this[k][ns]) this[k][ns] = {};
				this[k][ns][key] = true;
			});
			this.submit(callback);
		},
		submit(callback) {
			if (!this.isAllowed) return callback && callback(/* @__PURE__ */ new Error("not allowed"));
			if (this.submitting) return this.submit(callback);
			const isMissing = isMissingOption(this.options, [
				"projectId",
				"version",
				"apiKey",
				"referenceLng"
			]);
			if (isMissing) return callback && callback(new Error(isMissing));
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
				const url = replaceIn(this.options.lastUsedPath, [
					"projectId",
					"version",
					"lng",
					"ns"
				], defaults({
					lng: this.options.referenceLng,
					ns
				}, this.options));
				if (keys.length) request(defaults({ authorize: true }, this.options), url, keys, doneOne);
				else doneOne();
			});
		}
	};
	locizeLastUsed.type = "3rdParty";
	//#endregion
	//#region src/interpolator.js
	const regexp = /* @__PURE__ */ new RegExp("{{(.+?)}}", "g");
	const UNSAFE_KEYS = [
		"__proto__",
		"constructor",
		"prototype"
	];
	function makeString(object) {
		if (object == null) return "";
		return "" + object;
	}
	function interpolate(str, data, lng) {
		let match, value;
		function regexSafe(val) {
			return val.replace(/\$/g, "$$$$");
		}
		while (match = regexp.exec(str)) {
			value = match[1].trim();
			if (typeof value !== "string") value = makeString(value);
			if (!value) value = "";
			value = regexSafe(value);
			const subst = UNSAFE_KEYS.indexOf(value) > -1 ? value : data[value] || value;
			str = str.replace(match[0], subst);
			regexp.lastIndex = 0;
		}
		return str;
	}
	//#endregion
	//#region src/languageUtils.js
	function formatLanguageCode(code) {
		return code;
	}
	function getLanguagePartFromCode(code) {
		if (code.indexOf("-") < 0) return code;
		const specialCases = [
			"NB-NO",
			"NN-NO",
			"nb-NO",
			"nn-NO",
			"nb-no",
			"nn-no"
		];
		const p = code.split("-");
		return specialCases.indexOf(code) > -1 ? p[1].toLowerCase() : p[0];
	}
	//#endregion
	//#region src/index.js
	const services = {
		interpolator: { interpolate },
		languageUtils: { formatLanguageCode }
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
				if (--count === 0 && callback) callback(null, results);
			});
		});
	};
	//#endregion
	return {
		init(options) {
			this.options = options;
			this.backend = new I18NextLocizeBackend(services, options);
			this.detector = new Browser(services, options);
			this.lng = options.lng || this.detector.detect();
			this.referenceLng = options.referenceLng;
			locizeLastUsed.init(options);
			return this;
		},
		isValid(lngs, l) {
			return lngs[l] && lngs[l].translated[this.options.version || "latest"] >= (this.options.loadIfTranslatedOver || 1);
		},
		getLanguage(lng, callback) {
			if (typeof lng === "function") {
				callback = lng;
				lng = this.lng;
			}
			if (!lng) lng = this.lng;
			this.getLanguages((err, lngs) => {
				if (err) return callback(err);
				if (this.isValid(lngs, lng)) return callback(null, lng);
				if (this.isValid(lngs, getLanguagePartFromCode(lng))) return callback(null, getLanguagePartFromCode(lng));
				callback(null, this.options.fallbackLng || this.referenceLng || Object.keys(lngs)[0]);
			});
			return this;
		},
		getLanguages(callback) {
			if (this.publishedLngs) callback(null, this.publishedLngs);
			else this.backend.getLanguages((err, data) => {
				if (err) return callback(err);
				if (!err) this.publishedLngs = data;
				if (!this.referenceLng) Object.keys(data).forEach((l) => {
					if (data[l].isReferenceLanguage) this.referenceLng = l;
				});
				callback(null, data);
			});
			return this;
		},
		load(ns, lng, callback) {
			if (typeof lng === "function") {
				callback = lng;
				lng = null;
			}
			this.getLanguage(lng, (err, lng) => {
				if (err) return callback(err);
				this.backend.read(lng, ns, (err, data) => callback(err, data, lng));
			});
			return this;
		},
		loadAll(ns, callback) {
			this.getLanguages((err, lngs) => {
				if (err) return callback(err);
				asyncEach(Object.keys(lngs).filter((l) => this.isValid(lngs, l)), (l, clb) => {
					this.load(ns, l, (err, res) => {
						if (err) return clb(err);
						clb(null, { [l]: res });
					});
				}, (err, results) => {
					if (err) return callback(err);
					callback(null, results.reduce((prev, l) => ({
						...prev,
						...l
					}), {}));
				});
			});
			return this;
		},
		add(namespace, key, value, context, callback) {
			const options = {};
			if (typeof context === "function") callback = context;
			else if (typeof context === "string") options.tDescription = context;
			this.backend.create(this.referenceLng, namespace, key, value, callback, options);
			return this;
		},
		update(namespace, key, value, context, callback) {
			const options = { isUpdate: true };
			if (typeof context === "function") callback = context;
			else if (typeof context === "string") options.tDescription = context;
			this.backend.create(this.referenceLng, namespace, key, value, callback, options);
			return this;
		},
		used(namespace, key) {
			locizeLastUsed.used(namespace, key);
		}
	};
})();
