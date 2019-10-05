(function(window, undefined) {
	/*
	 Gearics.js
	 Version: 0.1
	 Author(s): TomChung
	 */

	('use strict');

	// Initial
	var Gearics = function(selectorString) {
		return new (Function.prototype.bind.apply(Gearics.exec, [null].concat(Gearics.toArray(arguments))));
	}
	// Core
	Gearics.each = function(obj, callback) {
		if (obj.length) {
			for (var i = 0, len = obj.length; i < len; i++) {
				callback.call(obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			for (var i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				callback.call(obj[key], key, obj);
			}
		}
		return Gearics;
	}
	Gearics.toArray = function(obj) {
		for (var arr = [], len = obj.length, i = 0; i < len; arr[i] = obj[i++]);
		return arr;
	}
	Gearics.dataset = function(obj) {
		var list = Gearics.dataset.list = Gearics.dataset.list || [];
		var data;
		Gearics.each(list, function(key) {
			if (this.obj == obj) {
				data = this.props;
			}
		});
		return data || list[list.push({
			obj : obj,
			props : {}
		}) - 1].props;
	}
	// APIs
	Gearics.attr = function(elem, props) {
		return typeof props == 'string' ? elem.getAttribute(props) : Gearics.each(props, function(key) {
			elem.setAttribute(key, this);
		});
	}
	Gearics.exec = function(selectors) {
		var args = this.args = Gearics.toArray(arguments);
		if (selectors.nodeType && selectors.nodeType == Node.ELEMENT_NODE) {
			args[0] = selectors;
		} else if ( typeof selectors == 'string' && /#.+/.test(selectors)) {
			args[0] = document.querySelector(selectors);
		} else if ( typeof selectors == 'string') {
			args[0] = document.querySelectorAll(selectors);
		} else {
			args[0] = selectors;
		}
	}
	Gearics.rand = function(chars, patn) {
		var len = chars.length;
		return (patn || '$').replace(/\$/g, function() {
			return chars.charAt(~~(Math.random() * len));
		});
	}
	Gearics.animate = function(routine, duration, callback) {
		var render = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		var progress = 0;
		var animation = function(timestamp) {
			progress = Math.min(timestamp / duration, 1);
			routine.call(null, progress);
			if (progress < 1) {
				render(animation);
			}
		}
		render(animation);
	}
	Gearics.ajax = function(url, data, callback) {
		var req = new XMLHttpRequest();
		Gearics.each(callback, function(type) {
			req.addEventListener(type, this);
		});
		if (data) {
			var form;
			if (data.constructor == HTMLFormElement) {
				form = new FormData(data);
			} else {
				form = new FormData();
				Gearics.each(data, function(key) {
					form.append(key, this);
				});
			}
		}
		req.open( data ? 'post' : 'get', url, true);
		req.send(data);
	}
	Gearics.on = function(elem, type, callback) {
		var list = Gearics.dataset(elem)[type] = Gearics.dataset(elem)[type] || [];
		list.push(callback);
		elem.addEventListener(type, callback);
	}
	Gearics.off = function(elem, type, callback) {
		var list = Gearics.dataset(elem)[type];
		if (callback != undefined) {
			list.splice(list.indexOf(callback));
			elem.removeEventListener(type, callback);
		} else {
			Gearics.each(list, function() {
				elem.removeEventListener(type, this);
			});
		}
	}
	Gearics.style = function(elem, props) {
		var prefix = Gearics.style.prefix;
		if ( typeof props == 'string') {
			return elem.style[props] || elem.style[prefix + props];
		}
		var oSty = getComputedStyle(elem, null);
		Gearics.each(props, function(key) {
			var pKey = elem.style[key] != undefined ? key : prefix + key;
			if (this.slice(1, 2) == '=') {
				elem.style[pKey] = 'calc(' + oSty[pKey] + ' ' + this.slice(0, 1) + ' ' + this.slice(2) + ')';
				elem.style[pKey] = getComputedStyle(elem, null)[pKey];
			} else {
				elem.style[pKey] = this;
			}
		});
		return Gearics;
	}
	Gearics.style.prefix = (/-(moz|webkit|ms|o)-/.exec(Gearics.toArray(getComputedStyle(document.documentElement, null)).valueOf())||[''])[0];
	Gearics.fullscreen = function(elem, isEnabled) {
		var elem = elem || document.documentElement;
		if (isEnabled == false || isEnabled != true && elem != null && elem == (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
			(document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen).call(document);
		} else {
			(elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen).call(elem, Element.ALLOW_KEYBOARD_INPUT);
		}
	}
	for (var i = 0, props = Object.keys(Gearics), len = props.length; i < len; i++) {
		var key = props[i];
		Gearics.exec.prototype[key] = (function(key) {
			return (function() {
				var args = Gearics.toArray(arguments);
				if (this.args[0].length) {
					var args = this.args.concat(args);
					var returnVal;
					Gearics.each(this.args[0], function() {
						var argus = Gearics.toArray(args);
						argus[0] = this;
						var result = Gearics[key].apply(null, argus);
						if (result != Gearics) {
							returnVal = returnVal || [];
							returnVal.push(result);
						}
					});
					return returnVal || this;
				} else {
					var returnVal = Gearics[key].apply(null, this.args.concat(args));
					return returnVal != Gearics ? returnVal : this;
				}
			})
		})(key);
	}
	window.$ = window.Gearics = Gearics;
})(window);
