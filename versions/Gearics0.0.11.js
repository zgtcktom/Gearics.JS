(function(window, undefined) {
	/*
	 * Gearics.js
	 * => Author(s): Tom Chung
	 * => Version: 0.0.0 developing
	 * => Modified date: YYYY-MM-DD
	 * Copyright preserved
	 */

	('use strict');

	var $ = function(selector) {
		this.arguments = arguments;
		this.inherit = null;
		if ( typeof selector === 'string')
			selector = arguments[0] = selector.charAt(0) == '#' ? document.getElementById(selector.slice(1)) : document.querySelectorAll(selector);
		if (selector && selector.constructor == NodeList)
			for (var i = 0, len = this.length = selector.length; i < len; this[i] = new $(selector[i++]));
	};

	$.each = window.$.each;
	$.map = window.$.map;
	$.define = window.$.define;
	$.event = window.$.event;
	$.style = window.$.style;
	$.storage = window.$.storage;
	$.animate = function(elem) {
		var callback = $.inherit(new $.event(elem));
		return $;
	};

	var inherit = $.inherit = function(data) {
		if (data && data.constructor == $.event)
			(inherit.event = inherit.event || []).push(data);
		inherit.is = true;
		return $;
	};

	$.event = function(target, type) {
		if (this.constructor != $.event) {
			var data = $.event.data;
			if ( typeof target === 'undefined')
				return data;
			var data = target.constructor == $.event ? target : (data.get(target) || data.set(target, new $.event(target)).get(target));
			if ( typeof type === 'undefined')
				return data;
			var list = data.on(type);
			return list;
		}
		this.target = target;
		this.data = {};
	};

	$.define($.event, {
		data : new $.storage(),
		prototype : {
			constructor : $.event,
			on : function(type, func) {
				var data = this.data;
				if ( typeof type === 'undefined')
					return data;
				var list = data[type] = data[type] || [];
				if ( typeof func !== 'function')
					return list;
				if (list.indexOf(func) == -1)
					list.push(func);
				return this;
			},
			off : function(type, func) {
				var data = this.data;
				if ( typeof type === 'undefined')
					this.data = {};
				else {
					var list = data[type] = data[type] || [];
					if ( typeof func === 'function') {
						var inx = list.indexOf(func);
						if (inx != -1)
							list.splice(inx, 1);
					} else
						data[type] = [];
				}
				return this;
			},
			dispatch : function(type, props) {
				for (var target = this.target, data = this.data, list = data[type] = data[type] || [], i = 0, len = list.length; i < len; list[i++].call(target, props));
				return this;
			}
		}
	});

	$.on = function(target, type, func) {
		if (target.addEventListener)
			target.addEventListener(type, func);
		var result = $.event(target).on(type, func);
		return result.constructor != $.event ? result : $.inherit($);
	};

	$.off = function(target, type, func) {
		if (target.removeEventListener)
			target.removeEventListener(type, func);
		var result = $.event(target).off(type, func);
		return result.constructor != $.event ? result : $.inherit($);
	};

	$.dispatch = function(target, type, props) {
		var result = $.event(target).dispatch(type, props);
		return result.constructor != $.event ? result : $.inherit($);
	};

	$.init = function(key, func, isIgnore, isEvent) {
		$.prototype[key] = function() {
			$.inherit.is = false;
			var thisArgs = $.map(this.arguments), args = $.map(arguments), len = this.length;
			if (!thisArgs.length && args.length)
				thisArgs[0] = args.shift();
			if (!isEvent)
				this.inherit = $.inherit.event = null;
			else if (this.inherit)
				thisArgs[0] = this.inherit;
			if (isIgnore || typeof len === 'undefined') {
				if (this.inherit)
					thisArgs[0] = thisArgs[0][0];
				var result = func.apply(null, thisArgs.concat(args));
			} else
				for (var nodeList = thisArgs[0], result = [], i = 0; i < len; thisArgs[0] = nodeList[i], result[i++] = func.apply(null, thisArgs.concat(args)));
			this.inherit = $.inherit.event;
			return isEvent || $.inherit.is ? this : result;
		};
	};

	$.init('style', $.style, false, false);
	$.init('animate', $.animate, false, false);
	$.init('$', function() {
	}, false, false);
	$.init('on', $.on, false, true);
	$.init('off', $.off, false, true);
	$.init('dispatch', $.dispatch, false, true);

	document.addEventListener('DOMContentLoaded', function() {
		console.log(new $('div')[0].animate().on('done', function(a) {
			console.log(this)
		}).dispatch('done', {
			a : 5
		}));
	});
	for (var i = 0, s = new Date(); new Date - s < 0; i++) {
		$.inherit()
	}
	console.log(i)

})(window);
