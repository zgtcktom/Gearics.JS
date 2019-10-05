(function(window, undefined) {

	/*
	 * Gearics.js
	 * Copyright preserved
	 */

	('use strict');

	var $ = function(selector) {
		if (this.constructor != $) {
			for (var args = [null], i = 0, len = arguments.length; i < len; args[i + 1] = arguments[i++]);
			return new (Function.prototype.bind.apply($, args));
		}
		this.arguments = arguments;
		this.inherit = null;
		if ( typeof selector === 'string')
			selector = arguments[0] = selector.charAt(0) == '#' ? document.getElementById(selector.slice(1)) : document.querySelectorAll(selector);
		if (selector && selector.constructor == NodeList)
			for (var i = 0, len = this.length = selector.length; i < len; this[i] = new $(selector[i++]));
	};

	// Core

	var each = $.each = function(obj, func, isObj) {
		var i = 0, len = obj.length;
		if (obj.constructor == NodeList)
			for (; i < len; i++) {
				if (func.call(obj[i], i, obj) == false)
					break;
			}
		else if (!isObj && typeof len !== 'undefined')
			for (; i < len; i++) {
				if (func(obj[i], i, obj) == false)
					break;
			}
		else
			for (var keys = Object.keys(obj), len = keys.length; i < len; i++) {
				var key = keys[i];
				if (func(obj[key], key, obj) == false)
					break;
			}
		return inherit($);
	};

	var map = $.map = function(obj, func, isObj) {
		var arr = [], i = 0, len = obj.length, isFunc = typeof func === 'function';
		if (obj.constructor == NodeList)
			for (; i < len; arr[i] = func.call(obj[i], i++, obj));
		else if (!isObj && typeof len !== 'undefined')
			if (isFunc)
				for (; i < len; arr[i] = func(obj[i], i++, obj));
			else
				for (; i < len; arr[i] = obj[i++]);
		else {
			var keys = Object.keys(obj), len = keys.length;
			if (isFunc)
				for (; i < len; i++) {
					var key = keys[i];
					arr[i] = func(obj[key], key, obj);
				}
			else
				for (; i < len; arr[i] = obj[keys[i++]]);
		}
		return inherit(arr);
	};

	var define = $.define = function(obj, key, val) {
		switch(key.constructor) {
			case Object:
				for (var props = key, keys = Object.keys(props), i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					obj[key] = props[key];
				}
				break;
			case Array:
				for (var i = 0, len = key.length; i < len; obj[key[i]] = val[i++]);
				break;
			default:
				obj[key] = val;
		}
		inherit($);
		return obj;
	};

	var keyOf = $.keyOf = function(obj, val, isMulti) {
		var keys = Object.keys(obj), i = 0, len = keys.length;
		if (isMulti) {
			for (var arr = []; i < len; i++) {
				var key = keys[i];
				if (obj[key] == val)
					arr.push(key);
			}
			return arr;
		}
		for (; i < len; i++) {
			var key = keys[i];
			if (obj[key] == val)
				return key;
		}
	};

	var compare = $.compare = function() {
		var len = arguments.length;
		if (len < 2)
			return true;
		for (var i = 1; i < len; i++) {
			var obj = arguments[i], prevObj = arguments[i - 1];
			if (obj == prevObj)
				break;
			if (obj === null || prevObj === null || obj === undefined || prevObj === undefined)
				return false;
			switch(typeof obj) {
				case 'string':
				case 'number':
				case 'boolean':
					switch(typeof prevObj) {
						case 'string':
						case 'number':
						case 'boolean':
							return false;
					}
					break;
				case 'function':
					if ( typeof prevObj === 'function' && obj.toString() != prevObj.toString())
						return false;
			}
			if (obj.constructor !== prevObj.constructor)
				return false;
			var keys = Object.keys(obj), prevKeys = Object.keys(prevObj), len2 = keys.length;
			if (len2 != prevKeys.length)
				return false;
			for (var i2 = 0; i2 < len2; i2++) {
				var key = keys[i2];
				if (prevKeys.indexOf(key) === -1 || !compare(obj[key], prevObj[key]))
					return false;
			}
		}
		return true;
	};

	var replace = $.replace = function(obj, search, replace) {
		$.inherit($);
		if ( typeof obj === 'string') {
			switch(search.constructor) {
				case String:
					return obj.replace(new RegExp(search.replace(/\W/g, '\\$&'), 'g'), replace);
				case Array:
					if (!search.length)
						return obj;
					for (var str = '', prev = 0, i = 0, len = search.length; i < len; prev = inx, i++) {
						var val = search[i], inx = prev + obj.slice(prev).indexOf(val) + val.length;
						str += (i + 1 == len ? obj.slice(prev) : obj.slice(prev, inx)).replace(val, replace[i]);
					}
					return str;
			}
			for (var keys = Object.keys(search), i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				obj = replace(obj, key, search[key]);
			}
			return obj;
		}
		for (var keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			if (obj[key] == search)
				obj[key] = replace;
		}
		return obj;
	};

	var remove = $.remove = function(obj, val, isMulti) {
		inherit($);
		if (isElement(obj)) {
			obj.parentNode.removeChild(obj);
			return $;
		}
		if (obj.constructor == Array) {
			var inx = obj.indexOf(val);
			if (isMulti)
				while (inx != -1) {
					obj.splice(inx, 1);
					inx = obj.indexOf(val);
				}
			else if (inx != -1)
				obj.splice(inx, 1);
		} else if (isMulti)
			for (var keys = keyOf(obj, val, true), i = 0, len = keys.length; i < len;
			delete obj[keys[i++]]);
		else
			delete obj[keyOf(obj, val)];
		return obj;
	};

	var clone = $.clone = function(obj, deep) {
		if ( typeof obj !== 'object')
			return obj;
		if (isElement(obj))
			return obj.cloneNode(deep);
		if ( typeof obj.length !== 'undefined')
			return map(obj);
		for (var newObj = {}, keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			newObj[key] = deep ? clone(obj[key], deep) : obj[key];
		}
		return newObj;
	};

	var which = $.which = function(arr, func, isRev) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i], result = func(ele, i, arr);
			if ( isRev ? !result : result)
				newArr.push(ele);
		}
		return inherit(newArr);
	};

	var unique = $.unique = function(arr) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i];
			if (newArr.indexOf(ele) === -1)
				newArr.push(ele);
		}
		return inherit(newArr);
	};

	var iterate = $.iterate = function(func, count, isObj) {
		var i = 0;
		if (!isObj && typeof func === 'function') {
			for (; i < count; func(i++));
			return $.inherit($);
		}
		for (var arr = []; i < count; arr[i++] = func);
		return arr;
	};

	var search = $.search = function(str, expr) {
		var arr = [];
		switch(expr.constructor) {
			case RegExp:
				var prev = 0;
				while (true) {
					var match = expr.exec(str);
					if (match === null)
						break;
					var inx = match.index, val = match[0], len = val.length;
					if (len < 1)
						return arr;
					str = str.slice(inx + len);
					arr.push([val, inx + prev]);
					prev += inx + len;
				}
				break;
			default:
				var len = expr.length;
				if (len < 1)
					return false;
				while (true) {
					var inx = str.indexOf(expr, inx ? inx + len : 0);
					if (inx === -1)
						break;
					arr.push([expr, inx]);
				}
		}
		return arr;
	};

	// Determiner

	var isElement = $.isElement = function(obj) {
		return obj && obj.nodeType === Node.ELEMENT_NODE;
	};

	var isEmpty = $.isEmpty = function(obj) {
		return obj === undefined || obj === null || isElement(obj) && obj.innerHTML.length === 0 || typeof obj !== 'function' && obj.length === 0;
	};

	// Event
	var inherit = $.inherit = function(data) {
		inherit.is = false;
		if (data === $)
			inherit.is = true;
		else if (data && data.constructor === event)
			(inherit.event = inherit.event || []).push(data);
		return data;
	};

	var event = $.event = function(target, type) {
		if (this.constructor !== event) {
			var data = event.data;
			if ( typeof target === 'undefined')
				return data;
			var eventObj;
			if (target.constructor === event)
				eventObj = target;
			else {
				for (var i = 0, len = data.length; i < len; i++) {
					var item = data[i];
					if (item.target == target)
						eventObj = item;
				}
				eventObj = eventObj || data[data.push(new event(target)) - 1];
			}
			return typeof type === 'undefined' ? eventObj : eventObj.on(type);
		}
		this.target = target;
		this.data = {};
		if ( typeof type !== 'undefined')
			for (var props = type, keys = Object.keys(props), i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				this.on(key, props[key]);
			}
	};
	event.data = [];
	define(event.prototype, {
		on : function(type, func) {
			var data = this.data, list = data[type] = data[type] || [];
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
	});

	var on = $.on = function(target, type, func) {
		if (target.addEventListener)
			target.addEventListener(type, func);
		var result = event(target).on(type, func);
		return result.constructor == event ? inherit($) : result;
	};

	var off = $.off = function(target, type, func) {
		if (target.removeEventListener)
			target.removeEventListener(type, func);
		var result = event(target).off(type, func);
		return result.constructor == event ? inherit($) : result;
	};

	var dispatch = $.dispatch = function(target, type, props) {
		var result = event(target).dispatch(type, props);
		return result.constructor == event ? inherit($) : result;
	};

	// APIs

	var storage = $.storage = function(obj, key, val) {
		if (this.constructor !== storage) {
			var data = storage.data, map = data.get(obj) || data.set(obj, {}).get(obj);
			switch(arguments.length) {
				case 1:
					return map;
				case 2:
					return map[key];
			}
			map[key] = val;
			return inherit($);
		}
		this.data = [];
	};
	define(storage.prototype, {
		has : function(key) {
			for (var obj = false, data = this.data, i = 0, len = data.length; i < len; i++) {
				var item = data[i];
				if (item.key == key)
					obj = item;
			}
			return obj;
		},
		get : function(key) {
			var obj = this.has(key);
			return obj ? obj.val : undefined;
		},
		set : function(key, val) {
			if ( typeof key === 'undefined')
				this.data = [];
			else {
				var data = this.data, obj = this.has(key);
				if (obj && typeof val === 'undefined')
					data.splice(data.indexOf(obj), 1);
				else
					(obj || data[data.push({
						key : key
					}) - 1]).val = val;
			}
			return this;
		}
	});
	storage.data = new storage();

	var color = $.color = function(expr) {
		if (this.constructor !== color) {
			if (!expr)
				return false;
			if (/^[A-z]+$/.test(expr)) {
				var hex = color.list[expr];
				if (hex)
					return color(hex);
				return false;
			}
			expr = expr.match(expr.charAt(0) === '#' ? /^(#)((?:[0-9a-f]{3}){1,2})$/i : /^((?:rgb|hsl)a?)\((.+)\)$/i);
			if (!expr)
				return false;
			var type = expr[1], args = expr[2];
			if (type === '#') {
				var len = args.length;
				if (len === 3)
					args = args.replace(/./g, '$&$&');
				else if (len !== 6)
					return false;
				var rgb = parseInt(args, 16);
				return new color((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF, 1);
			}
			var args = args.split(','), len = args.length;
			switch(type) {
				case 'rgb':
				case 'hsl':
					if (len !== 3)
						return false;
					type += 'a';
					args[3] = 1;
					len++;
					break;
				case 'rgba':
				case 'hsla':
					if (len !== 4)
						return false;
			}
			var valid = function(i, base) {
				var val = (args[i] + '').trim();
				if (isFinite(val))
					val = args[i] = val * 1;
				else if (val.charAt(val.length - 1) === '%')
					val = args[i] = val.slice(0, -1) / 100 * base;
				return isNaN(val);
			}, i = 0;
			switch(type) {
				case 'rgba':
					for (; i < 4; i++) {
						if (valid(i, i === 3 ? 1 : 255))
							return false;
					}
					return new color(args[0], args[1], args[2], args[3]);
				case 'hsla':
					for (; i < 4; i++) {
						if (valid(i, i === 0 ? 360 : 1))
							return false;
					}
					var hue = function(t1, t2, h) {
						if (h < 0)
							h++;
						if (h > 1)
							h--;
						return h < .5 ? t2 : (t1 + h < 1 / 6 ? (t2 - t1) * 6 * h : h < 2 / 3 ? (t2 - t1) * (2 / 3 - h) * 6 : 0);
					}, h = args[0] / 360, s = args[1], l = args[2], a = args[3];
					if (s == 0)
						return [l, l, l, a];
					var t2 = l < .5 ? l * (1 + s) : l + s - l * s, t1 = 2 * l - t2;
					return new color(hue(t1, t2, h + 1 / 3) * 255, hue(t1, t2, h) * 255, hue(t1, t2, h - 1 / 3) * 255, a);
			}
			return false;
		}
		this.r = arguments[0] * 1;
		this.g = arguments[1] * 1;
		this.b = arguments[2] * 1;
		this.a = typeof arguments[3] === 'undefined' ? 1 : arguments[3] * 1;
	};
	color.list = {
		aliceblue : '#f0f8ff',
		antiquewhite : '#faebd7',
		aqua : '#00ffff',
		aquamarine : '#7fffd4',
		azure : '#f0ffff',
		beige : '#f5f5dc',
		bisque : '#ffe4c4',
		black : '#000000',
		blanchedalmond : '#ffebcd',
		blue : '#0000ff',
		blueviolet : '#8a2be2',
		brown : '#a52a2a',
		burlywood : '#deb887',
		cadetblue : '#5f9ea0',
		chartreuse : '#7fff00',
		chocolate : '#d2691e',
		coral : '#ff7f50',
		cornflowerblue : '#6495ed',
		cornsilk : '#fff8dc',
		crimson : '#dc143c',
		cyan : '#00ffff',
		darkblue : '#00008b',
		darkcyan : '#008b8b',
		darkgoldenrod : '#b8860b',
		darkgray : '#a9a9a9',
		darkgreen : '#006400',
		darkgrey : '#a9a9a9',
		darkkhaki : '#bdb76b',
		darkmagenta : '#8b008b',
		darkolivegreen : '#556b2f',
		darkorange : '#ff8c00',
		darkorchid : '#9932cc',
		darkred : '#8b0000',
		darksalmon : '#e9967a',
		darkseagreen : '#8fbc8f',
		darkslateblue : '#483d8b',
		darkslategray : '#2f4f4f',
		darkslategrey : '#2f4f4f',
		darkturquoise : '#00ced1',
		darkviolet : '#9400d3',
		deeppink : '#ff1493',
		deepskyblue : '#00bfff',
		dimgray : '#696969',
		dimgrey : '#696969',
		dodgerblue : '#1e90ff',
		firebrick : '#b22222',
		floralwhite : '#fffaf0',
		forestgreen : '#228b22',
		fuchsia : '#ff00ff',
		gainsboro : '#dcdcdc',
		ghostwhite : '#f8f8ff',
		gold : '#ffd700',
		goldenrod : '#daa520',
		gray : '#808080',
		green : '#008000',
		greenyellow : '#adff2f',
		grey : '#808080',
		honeydew : '#f0fff0',
		hotpink : '#ff69b4',
		indianred : '#cd5c5c',
		indigo : '#4b0082',
		ivory : '#fffff0',
		khaki : '#f0e68c',
		lavender : '#e6e6fa',
		lavenderblush : '#fff0f5',
		lawngreen : '#7cfc00',
		lemonchiffon : '#fffacd',
		lightblue : '#add8e6',
		lightcoral : '#f08080',
		lightcyan : '#e0ffff',
		lightgoldenrodyellow : '#fafad2',
		lightgray : '#d3d3d3',
		lightgreen : '#90ee90',
		lightgrey : '#d3d3d3',
		lightpink : '#ffb6c1',
		lightsalmon : '#ffa07a',
		lightseagreen : '#20b2aa',
		lightskyblue : '#87cefa',
		lightslategray : '#778899',
		lightslategrey : '#778899',
		lightsteelblue : '#b0c4de',
		lightyellow : '#ffffe0',
		lime : '#00ff00',
		limegreen : '#32cd32',
		linen : '#faf0e6',
		magenta : '#ff00ff',
		maroon : '#800000',
		mediumaquamarine : '#66cdaa',
		mediumblue : '#0000cd',
		mediumorchid : '#ba55d3',
		mediumpurple : '#9370db',
		mediumseagreen : '#3cb371',
		mediumslateblue : '#7b68ee',
		mediumspringgreen : '#00fa9a',
		mediumturquoise : '#48d1cc',
		mediumvioletred : '#c71585',
		midnightblue : '#191970',
		mintcream : '#f5fffa',
		mistyrose : '#ffe4e1',
		moccasin : '#ffe4b5',
		navajowhite : '#ffdead',
		navy : '#000080',
		oldlace : '#fdf5e6',
		olive : '#808000',
		olivedrab : '#6b8e23',
		orange : '#ffa500',
		orangered : '#ff4500',
		orchid : '#da70d6',
		palegoldenrod : '#eee8aa',
		palegreen : '#98fb98',
		paleturquoise : '#afeeee',
		palevioletred : '#db7093',
		papayawhip : '#ffefd5',
		peachpuff : '#ffdab9',
		peru : '#cd853f',
		pink : '#ffc0cb',
		plum : '#dda0dd',
		powderblue : '#b0e0e6',
		purple : '#800080',
		red : '#ff0000',
		rosybrown : '#bc8f8f',
		royalblue : '#4169e1',
		saddlebrown : '#8b4513',
		salmon : '#fa8072',
		sandybrown : '#f4a460',
		seagreen : '#2e8b57',
		seashell : '#fff5ee',
		sienna : '#a0522d',
		silver : '#c0c0c0',
		skyblue : '#87ceeb',
		slateblue : '#6a5acd',
		slategray : '#708090',
		slategrey : '#708090',
		snow : '#fffafa',
		springgreen : '#00ff7f',
		steelblue : '#4682b4',
		tan : '#d2b48c',
		teal : '#008080',
		thistle : '#d8bfd8',
		tomato : '#ff6347',
		turquoise : '#40e0d0',
		violet : '#ee82ee',
		wheat : '#f5deb3',
		white : '#ffffff',
		whitesmoke : '#f5f5f5',
		yellow : '#ffff00',
		yellowgreen : '#9acd32'
	};
	define(color.prototype, {
		toRgb : function(isNorm) {
			return 'rgb(' + ( isNorm ? Math.round(this.r) + ',' + Math.round(this.g) + ',' + Math.round(this.b) : this.r + ',' + this.g + ',' + this.b) + ')';
		},
		toRgba : function(isNorm) {
			return this.toRgb(isNorm).replace('rgb', 'rgba').slice(0, -1) + ',' + ( isNorm ? this.a.toFixed(2) * 1 : this.a) + ')';
		},
		toHsl : function(isNorm) {
			var r = this.r / 255, g = this.g / 255, b = this.b / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
			if (max == min)
				h = s = 0;
			else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}
			return 'hsl(' + ( isNorm ? Math.round(h * 360) + ',' + Math.round(s * 100) + '%,' + Math.round(l * 100) : h * 360 + ',' + s * 100 + '%,' + l * 100) + '%)';
		},
		toHsla : function(isNorm) {
			return this.toHsl(isNorm).replace('hsl', 'hsla').slice(0, -1) + ',' + ( isNorm ? this.a.toFixed(2) * 1 : this.a) + ')';
		},
		toHex : function() {
			var hex = function(color) {
				var hex = Math.round(color).toString(16);
				return hex.length > 1 ? hex : 0 + hex;
			}
			return '#' + hex(this.r) + hex(this.g) + hex(this.b);
		},
		toName : function() {
			return keyOf(color.list, this.toHex());
		}
	});

	var formatColor = $.formatColor = function(str, isNorm) {
		return str.replace(/[A-z]+\([^)]{5,}\)|#(?:[0-9A-f]{3}){1,2}|[A-z]{3,}/g, function(expr) {
			var color = $.color(expr);
			return color ? color.toRgba(isNorm) : expr;
		});
	};

	var calc = $.calc = function(expr, elem) {
		var expr = formatColor(expr), oper = expr.match(/[-+/*](?==)/);
		if (!oper)
			return expr;
		var inx = oper.index, lHS = expr.slice(0, inx), rHS = expr.slice(inx + 2), valsReg = /[-+]?(?:\d*\.\d+|\d+)(?:%|[A-z]*)/g, unitReg = /\D*$/;
		if (isFinite(rHS))
			return formatColor(lHS.replace(valsReg, function(val) {
				var num = parseFloat(val);
				return (oper == '*' ? num * rHS : oper == '/' ? num / rHS : oper == '-' ? num - rHS : num + rHS * 1) + val.match(unitReg)[0];
			}), true);
		if (lHS.replace(valsReg, '').indexOf(rHS.replace(valsReg, '')) == -1)
			return false;
		var i = 0, rHSVals = rHS.match(valsReg);
		return formatColor(lHS.replace(valsReg, function(val) {
			if (rHSVals[i] != undefined) {
				var num = parseFloat(val), unit = val.match(unitReg)[0], rHSVal = rHSVals[i++], rHSNum = parseFloat(rHSVal), rHSUnit = rHSVal.match(unitReg)[0];
				if (!unit || !rHSUnit || unit == rHSUnit)
					return (oper == '*' ? num * rHSNum : oper == '/' ? num / rHSNum : oper == '-' ? num - rHSNum : num + rHSNum * 1) + (unit || rHSUnit);
				return getStyle(elem, 'width', 'calc(' + val + ' ' + oper + ' ' + rHSVal + ')');
			}
			return val;
		}), true);
	};

	// CSS

	var getStyle = $.getStyle = function(elem, props) {
		var sty = getComputedStyle(elem);
		switch(arguments.length) {
			case 1:
				return sty;
			case 2:
				switch(props.constructor) {
					case Array:
						return map(props, function(key) {
							return getStyle(elem, key);
						});
					case Object:
						return define({}, Object.keys(props), map(props, function(val, key) {
							return getStyle(elem, key, val);
						}));
					default:
						return sty[props] || sty[prefix + props];
				}
		}
		var prop = style(elem, props);
		style(elem, props, arguments[2]);
		var val = getStyle(elem, props);
		style(elem, props, prop);
		return val;
	};

	var style = $.style = function(elem, props) {
		var sty = elem.style, key = typeof sty[props] !== 'undefined' ? props : prefix + props;
		switch(arguments.length) {
			case 1:
				return sty;
			case 2:
				switch(props.constructor) {
					case Array:
						return map(props, function(key) {
							return style(elem, key);
						});
					case Object:
						return inherit(each(props, function(val, key) {
							style(elem, key, val);
						}, true));
					default:
						return sty[key];
				}
		}
		var val = arguments[2], prop = sty[key];
		sty[key] = val.charAt(1) != '=' ? val : calc(prop + val, elem) || getStyle(elem, key, 'calc(' + prop + ' ' + val.charAt(0) + ' ' + val.slice(2) + ')');
		return inherit($);
	};
	var prefix = style.prefix = (/-(moz|webkit|ms|o)-/.exec(getComputedStyle(document.documentElement).cssText) || [''])[0];

	var animate = $.animate = function(target, props, dura, callback) {
		if ( typeof props === 'function' || props === null) {
			var req = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame, anim = function(time) {
				if ( typeof start === 'undefined')
					start = time;
				var prog = Math.min((time - start) / dura, 1);
				if (props !== null)
					props.call(target, prog);
				inherit(callback.dispatch('progress', prog));
				if (prog < 1)
					req(anim);
				else
					inherit(callback.dispatch('done'));
			}, start, callback = new $.event(target, callback);
			req(anim);
			inherit(callback);
			return $;
		}
		for (var keys = Object.keys(props), initVals = [], animVals = [], i = 0, len = keys.length; i < len; i++) {
			var key = keys[i], val = initVals[i] = getStyle(target, key) || 0;
			animVals[i] = calc(getStyle(target, key, props[key]) + '-=' + val, target);
		}
		return animate(target, function(prog) {
			for (var i = 0; i < len; style(target, keys[i], calc(initVals[i] + '+=' + calc(animVals[i++] + '*=' + prog))));
		}, dura);
	};

	// DOM

	$.innerHTML = function(elem, str) {
		if ( typeof str === 'undefined')
			return elem.innerHTML;
		elem.innerHTML = str;
		return inherit($);
	};

	$.outerHTML = function(elem, str) {
		if ( typeof str === 'undefined')
			return elem.outerHTML;
		elem.outerHTML = str;
		return inherit($);
	};

	$.appendTo = function(child, elem) {
		elem.appendChild(child);
		return inherit($);
	};

	// Ajax

	var ajax = $.ajax = function(url, data, callback) {
		var req = new XMLHttpRequest(), callback = new event(req, callback);
		if (data) {
			if (data.constructor == HTMLFormElement)
				var form = new FormData(data);
			else
				for (var form = new FormData(), keys = Object.keys(data), i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					form.append(key, data[key]);
				}
		}
		req.open( data ? 'post' : 'get', url, true);
		req.send(data);
		inherit(callback);
		return req;
	};

	// Init

	var init = $.init = function(key, func, isIgnore, isEvent) {
		$.prototype[key] = function() {
			inherit.is = false;
			var thisArgs = map(this.arguments), args = map(arguments), len = this.length;
			if (!thisArgs.length && args.length)
				thisArgs[0] = args.shift();
			if (!isEvent)
				this.inherit = inherit.event = null;
			else if (this.inherit)
				thisArgs[0] = this.inherit;
			if (isIgnore || typeof len === 'undefined') {
				if (this.inherit)
					thisArgs[0] = thisArgs[0][0];
				var result = func.apply(null, thisArgs.concat(args));
			} else
				for (var nodeList = thisArgs[0], result = [], i = 0; i < len; thisArgs[0] = nodeList[i], result[i++] = func.apply(null, thisArgs.concat(args)));
			this.inherit = inherit.event;
			return inherit.is || inherit.event ? this : result;
		};
		return $;
	};

	init('$', function() {
		return inherit($);
	}, false, false);

	for (var ignoreList = ['each', 'map', 'define', 'keyOf', 'compare'], eventList = ['event', 'on', 'off', 'dispatch'], keys = Object.keys($), i = 0, len = keys.length; i < len; i++) {
		var key = keys[i];
		init(key, $[key], ignoreList.indexOf(key) !== -1, eventList.indexOf(key) !== -1);
	}

	// Globalize

	window.$ = window.Gearics = $;

})(window);
