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
		if (this.constructor != $) {
			for (var arr = [null], i = 0, len = arguments.length; i < len; arr[i + 1] = arguments[i++]);
			return new (Function.prototype.bind.apply($, arr));
		}
		this.arguments = arguments;
		if ( typeof selector == 'string')
			if (selector.charAt(0) == '#')
				arguments[0] = document.getElementById(selector.slice(1)) || selector;
			else
				var nodeList = arguments[0] = document.querySelectorAll(selector);
		if (nodeList || selector && selector.constructor == NodeList)
			for (var i = 0, len = this.length = nodeList.length; i < len; this[i] = new $(nodeList[i++]));
	};

	// Core

	$.inherit = function(obj) {
		$.inherit.data = Object(obj);
		return obj;
	};

	$.each = function(obj, func, isObj) {
		var i = 0, len = obj.length;
		if (obj.constructor == NodeList)
			for (; i < len; i++) {
				if (func.call(obj[i], i, obj) == false)
					break;
			}
		else if (len != undefined && !isObj)
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
		return $.inherit($);
	};

	$.map = function(obj, func, isObj) {
		var arr = [], i = 0, len = obj.length, isFunc = typeof func == 'function';
		if (obj.constructor == NodeList)
			for (; i < len; arr[i] = func.call(obj[i], i++, obj));
		else if (len != undefined && !isObj)
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
		return arr;
	};

	$.define = function(obj, key, val) {
		switch(key.constructor) {
			case Array:
				for (var i = 0, len = key.length; i < len; obj[key[i]] = val[i++]);
				break;
			case Object:
				for (var map = key, keys = Object.keys(map), i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					obj[key] = map[key];
				}
				break;
			default:
				obj[key] = val;
		}
		return obj;
	};

	$.keyOf = function(obj, val, isMulti) {
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

	$.remove = function(obj, val, isMulti) {
		if ($.isElement(obj)) {
			obj.parentNode.removeChild(obj);
			return $.inherit($);
		}
		if (obj.constructor == Array) {
			var i = obj.indexOf(val);
			if (isMulti)
				while (i != -1) {
					obj.splice(i, 1);
					i = obj.indexOf(val);
				}
			else if (i != -1)
				obj.splice(obj.indexOf(val), 1);
		} else if (isMulti)
			for (var keys = $.keyOf(obj, val, true), i = 0, len = keys.length; i < len;
			delete obj[keys[i++]]);
		else
			delete obj[$.keyOf(obj, val)];
		return obj;
	};

	$.clone = function(obj, deep) {
		if ( typeof obj != 'object')
			return obj;
		if ($.isElement(obj))
			return obj.cloneNode(deep);
		if (obj.length != undefined)
			return $.map(obj);
		for (var newObj = {}, keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			newObj[key] = deep ? $.clone(obj[key], deep) : obj[key];
		}
		return newObj;
	};

	$.compare = function() {
		var len = arguments.length;
		if (len < 2)
			return false;
		for (var i = 1; i < len; i++) {
			var obj = arguments[i], prevObj = arguments[i - 1];
			if (obj == prevObj)
				break;
			if (obj == null || prevObj == null || obj == undefined || prevObj == undefined)
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
					if ( typeof prevObj == 'function' && obj.toString() != prevObj.toString())
						return false;
			}
			if (obj.constructor != prevObj.constructor)
				return false;
			var keys = Object.keys(obj), prevKeys = Object.keys(prevObj), len2 = keys.length;
			if (len2 != prevKeys.length)
				return false;
			for (var i2 = 0; i2 < len2; i2++) {
				var key = keys[i2];
				if (prevKeys.indexOf(key) == -1 || !$.compare(obj[key], prevObj[key]))
					return false;
			}
		}
		return true;
	};

	$.which = function(arr, func, isRev) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i], result = func(ele, i, arr);
			if ( isRev ? !result : result)
				newArr.push(ele);
		}
		return newArr;
	};

	$.unique = function(arr) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i];
			if (newArr.indexOf(ele) == -1)
				newArr.push(ele);
		}
		return newArr;
	};

	$.iterate = function(func, count, isObj) {
		var i = 0;
		if ( typeof func == 'function' && !isObj) {
			for (; i < count; func(i++));
			return $.inherit($);
		}
		for (var arr = []; i < count; arr[i++] = func);
		return arr;
	};

	$.search = function(str, expr) {
		var arr = [];
		switch(expr.constructor) {
			case RegExp:
				var prev = 0;
				while (true) {
					var match = expr.exec(str);
					if (match == null)
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
					if (inx == -1)
						break;
					arr.push([expr, inx]);
				}
		}
		return arr;
	};

	$.replace = function(str, search, replace) {
		if (search.constructor == String)
			return str.replace(new RegExp(search.replace(/\W/g, '\\$&'), 'g'), replace);
		if (!search.length)
			return str;
		for (var newStr = '', prev = 0, i = 0, len = search.length; i < len; prev = index, i++) {
			var val = search[i], index = prev + str.slice(prev).indexOf(val) + val.length;
			newStr += (i + 1 == len ? str.slice(prev) : str.slice(prev, index)).replace(val, replace[i]);
		}
		return newStr;
	};

	$.trimExpr = function(str) {
		return str.trim().replace(/\s{2,}/g, ' ').replace(/\(\s|\s\)|\s?,\s?/g, function(str) {
			return str.trim();
		});
	};

	// Determiner

	$.isElement = function(obj) {
		return obj && obj.nodeType == Node.ELEMENT_NODE;
	};

	$.isEmpty = function(obj) {
		return obj == undefined || obj == null || $.isElement(obj) && obj.innerHTML.length == 0 || typeof obj != 'function' && obj.length == 0;
	};

	// APIs

	$.storage = function(obj, key, val) {
		if (this.constructor != $.storage) {
			var data = $.storage.data, map = data.get(obj) || data.set(obj, {}).get(obj);
			switch(arguments.length) {
				case 0:
					return data;
				case 1:
					return map;
				case 2:
					return map[key];
			}
			map[key] = val;
			return $.inherit($);
		}
		this.data = [];
	};

	$.define($.storage, {
		prototype : {
			constructor : $.storage,
			has : function(key) {
				for (var obj = false, data = this.data, i = 0, len = data.length; i < len; i++) {
					var ele = data[i];
					if (ele.key == key)
						obj = ele;
				}
				return obj;
			},
			get : function(key) {
				var obj = this.has(key);
				return obj ? obj.val : undefined;
			},
			set : function(key, val) {
				var data = this.data, obj = this.has(key);
				if (obj && val == undefined)
					data.splice(data.indexOf(item), 1);
				else
					(obj || data[data.push({
						key : key
					}) - 1]).val = val;
				return this;
			}
		}
	}).data = new $.storage();

	$.color = function(expr) {
		if (this.constructor == $.color) {
			var args = arguments[0], args = args && args.constructor == Array ? args : arguments;
			switch(args.length) {
				case 3:
				case 4:
					this.r = args[0] * 1;
					this.g = args[1] * 1;
					this.b = args[2] * 1;
					this.a = args[3] != undefined ? args[3] * 1 : 1;
			}
			return;
		}
		if (!expr)
			return false;
		if (/^[A-z]+$/.test(expr)) {
			var hex = $.color.list[expr];
			if (hex)
				return $.color(hex);
			return false;
		}
		expr = expr.match(expr.charAt(0) == '#' ? /^(#)((?:[0-9a-f]{3}){1,2})$/i : /^((?:rgb|hsl)a?)\((.+)\)$/i);
		if (!expr)
			return false;
		var type = expr[1], args = expr[2];
		if (type == '#') {
			switch(args.length) {
				case 3:
					args = args.replace(/./g, '$&$&');
					break;
				case !6:
					return false;
			}
			var rgb = parseInt(args, 16);
			return new $.color((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF, 1);
		}
		var args = args.split(','), len = args.length;
		switch(type) {
			case 'rgb':
			case 'hsl':
				if (len != 3)
					return false;
				type += 'a';
				args[3] = 1;
				len = 4;
				break;
			case 'rgba':
			case 'hsla':
				if (len != 4)
					return false;
		}
		var valid = function(i, base) {
			var val = (args[i] + '').trim();
			if (isFinite(val))
				val = args[i] = val * 1;
			else if (val.charAt(val.length - 1) == '%')
				val = args[i] = val.slice(0, -1) / 100 * base;
			return isNaN(val);
		}, i = 0;
		switch(type) {
			case 'rgba':
				for (; i < 4; i++) {
					if (valid(i, i == 3 ? 1 : 255))
						return false;
				}
				return new $.color(args);
			case 'hsla':
				for (; i < 4; i++) {
					if (valid(i, i == 0 ? 360 : 1))
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
				return new $.color(hue(t1, t2, h + 1 / 3) * 255, hue(t1, t2, h) * 255, hue(t1, t2, h - 1 / 3) * 255, a);
		}
		return false;
	};

	$.define($.color, {
		list : {
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
		},
		prototype : {
			constructor : $.color,
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
				return $.keyOf($.color.list, this.toHex());
			}
		}
	});

	$.formatColor = function(str, isNorm) {
		return str.replace(/[A-z]+\([^)]{5,}\)|#(?:[0-9A-f]{3}){1,2}|[A-z]{3,}/g, function(expr) {
			var color = $.color(expr);
			return color ? color.toRgba(isNorm) : expr;
		});
	};

	$.calc = function(expr, elem) {
		var expr = $.formatColor(expr), oper = expr.match(/[-+/*](?==)/);
		if (!oper)
			return expr;
		var inx = oper.index, lHS = expr.slice(0, inx), rHS = expr.slice(inx + 2), valsReg = /[-+]?(?:\d*\.\d+|\d+)(?:%|[A-z]*)/g, unitReg = /\D*$/;
		if (isFinite(rHS))
			return $.formatColor(lHS.replace(valsReg, function(val) {
				var num = parseFloat(val);
				return (oper == '*' ? num * rHS : oper == '/' ? num / rHS : oper == '-' ? num - rHS : num + rHS * 1) + val.match(unitReg)[0];
			}), true);
		if (lHS.replace(valsReg, '').indexOf(rHS.replace(valsReg, '')) == -1)
			return false;
		var i = 0, rHSVals = rHS.match(valsReg);
		return $.formatColor(lHS.replace(valsReg, function(val) {
			if (rHSVals[i] != undefined) {
				var num = parseFloat(val), unit = val.match(unitReg)[0], rHSVal = rHSVals[i++], rHSNum = parseFloat(rHSVal), rHSUnit = rHSVal.match(unitReg)[0];
				if (!unit || !rHSUnit || unit == rHSUnit)
					return (oper == '*' ? num * rHSNum : oper == '/' ? num / rHSNum : oper == '-' ? num - rHSNum : num + rHSNum * 1) + (unit || rHSUnit);
				return $.getStyle(elem, 'width', 'calc(' + val + ' ' + oper + ' ' + rHSVal + ')');
			}
			return val;
		}), true);
	};

	// Event

	$.event = function(obj, type, data) {
		if (this.constructor != $.event) {
			var data = data || $.event.data, map = data.get(obj) || data.set(obj, {}).get(obj);
			if (type == undefined)
				return map;
			return map[type] || $.define(map, type, [])[type];
		}
		this.obj = obj;
		this.data = new $.storage();
	};

	$.define($.event, {
		data : new $.storage(),
		prototype : {
			constructor : $.event,
			on : function(type, func) {
				var list = $.event(this.obj, type, this.data);
				if (list.indexOf(func) == -1)
					list.push(func);
				return this;
			},
			off : function(type, func) {
				$.remove($.event(this.obj, type, this.data), func);
				return this;
			},
			dispatch : function(type, props) {
				var obj = this.obj;
				$.each($.event(obj, type, this.data), function(func) {
					func.call(obj, props);
				});
				return this;
			}
		}
	});

	$.on = function(target, type, func) {
		if (target.addEventListener)
			target.addEventListener(type, func);
		if (target.constructor == $.event)
			target.on(type, func);
		var list = $.event(target, type);
		if (list.indexOf(func) == -1)
			list.push(func);
		return $.inherit($);
	};

	$.off = function(target, type, func) {
		if (target.removeEventListener)
			target.removeEventListener(type, func);
		$.remove($.event(target, type), func);
		return $;
	};

	$.dispatch = function(target, type, props) {
		return $.each($.event(target, type), function(func) {
			func.call(target, props);
		});
	};

	// DOM

	$.getStyle = function(elem, props) {
		var sty = getComputedStyle(elem);
		switch(arguments.length) {
			case 1:
				return sty;
			case 2:
				switch(props.constructor) {
					case Array:
						return $.map(props, function(key) {
							return $.getStyle(elem, key);
						});
					case Object:
						return $.define({}, Object.keys(props), function(val, key) {
							return $.getStyle(elem, key, val);
						});
					default:
						return sty[props] || sty[$.style.prefix + props];
				}
		}
		var prop = $.style(elem, props);
		$.style(elem, props, arguments[2]);
		var val = $.getStyle(elem, props);
		$.style(elem, props, prop);
		return val;
	};

	$.style = function(elem, props) {
		var sty = elem.style, key = typeof sty[props] !== 'undefined' ? props : $.style.prefix + props;
		switch(arguments.length) {
			case 1:
				return sty;
			case 2:
				switch(props.constructor) {
					case Array:
						return $.map(props, function(key) {
							return $.style(elem, key);
						});
					case Object:
						return $.each(props, function(val, key) {
							$.style(elem, key, val);
						}, true);
					default:
						return sty[key];
				}
		}
		var val = arguments[2], prop = sty[key];
		sty[key] = val.charAt(1) != '=' ? val : $.calc(prop + val, elem) || $.getStyle(elem, key, 'calc(' + prop + ' ' + val.charAt(0) + ' ' + val.slice(2) + ')');
		return $.inherit($);
	};

	$.style.prefix = (/-(moz|webkit|ms|o)-/.exec($.getStyle(document.documentElement).cssText) || [''])[0];

	$.animate = function(target, props, dura) {
		if ( typeof props === 'function') {
			var req = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame, anim = function(time) {
				if ( typeof start === 'undefined')
					start = time;
				var prog = Math.min((time - start) / dura, 1);
				props.call(target, prog);
				$.inherit(callback).dispatch('progress', prog);
				if (prog < 1)
					req(anim);
				else
					callback.dispatch('done');
			}, start, callback = new $.event(target);
			req(anim);
			return $.inherit(callback);
		}
		for (var keys = Object.keys(props), initVals = [], animVals = [], i = 0, len = keys.length; i < len; i++) {
			var key = keys[i], val = initVals[i] = $.getStyle(target, key) || 0;
			animVals[i] = $.calc($.getStyle(target, key, props[key]) + '-=' + val, target);
		}
		return $.animate(target, function(prog) {
			for (var i = 0; i < len; $.style(target, keys[i], $.calc(initVals[i] + '+=' + $.calc(animVals[i++] + '*=' + prog))));
		}, dura);
	};

	$.innerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.innerHTML;
		}
		elem.innerHTML = str;
		return $.inherit($);
	};

	$.outerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.outerHTML;
		}
		elem.outerHTML = str;
		return $.inherit($);
	};

	$.appendTo = function(elem, child) {
		elem.appendChild(child);
		return $.inherit($);
	};

	// Ajax

	$.ajax = function(url, data, callback) {
		var req = new XMLHttpRequest();
		$.on(req, callback);
		if (data) {
			var form;
			if (data.constructor == HTMLFormElement) {
				form = new FormData(data);
			} else {
				form = new FormData();
				$.each(data, function(key) {
					form.append(key, this);
				});
			}
		}
		req.open( data ? 'post' : 'get', url, true);
		req.send(data);
		return req;
	};

	$.prototype.constructor = $;

	$.each($, function(func, key) {
		if ($.prototype.hasOwnProperty(key))
			return;
		$.prototype[key] = function() {
			var args = $.map(arguments), thisArgs = $.map(this.arguments), isNodeList = this.hasOwnProperty('length') && ['inherit', 'each', 'map', 'which', 'unique'].indexOf(key) == -1;
			if ($.inherit.hasOwnProperty('data') && $.inherit.data != $) {
				$.define(thisArgs, 0, $.inherit.data);
				isNodeList = false;
			}
			if (key != 'on' || key != 'off' || key != 'dispatch')
				delete $.inherit.data;
			if (isNodeList)
				var result = $.map(thisArgs[0], function() {
					return func.apply(null, [this].concat(args));
				});
			else
				var result = func.apply(null, thisArgs.concat(args));
			return Object($.inherit.data).constructor == $.event ? this : $.inherit.data != $ ? result : this;
		};
	}, true);

	window.$ = window.Gearics = $;

})(window);
