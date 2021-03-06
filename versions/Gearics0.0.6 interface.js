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
		return new (Function.prototype.bind.apply($.init, [null].concat($.map(arguments))));
	};

	// Core

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
		return $;
	};

	$.map = function(arr, func) {
		var newArr = [], i = 0, len = arr.length;
		if ( typeof func == 'function')
			for (; i < len; newArr[i] = func(arr[i], i++, arr));
		else
			for (; i < len; newArr[i] = arr[i++]);
		return newArr;
	};

	$.which = function(arr, func) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i];
			if (func(ele, i, arr) == true)
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

	$.iterate = function(val, count, isObj) {
		var i = 0;
		if ( typeof val == 'function' && !isObj) {
			for (; i < count; val(i++));
			return $;
		}
		for (var arr = []; i < count; arr[i++] = val);
		return arr;
	};

	$.define = function(obj, key, val) {
		switch(key.constructor) {
			case Array:
				for (var i = 0, len = key.length; i < len; obj[key[i]] = val[i++]);
				break;
			case Object:
				for (var map = key, keys = Object.keys(map), i = 0, len = keys.length; i < len; key = keys[i], obj[key] = map[key], i++);
				break;
			default:
				obj[key] = val;
		}
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

	$.vals = function(obj) {
		for (var arr = [], keys = Object.keys(obj), i = 0, len = keys.length; i < len; arr[i] = obj[keys[i++]]);
		return arr;
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

	$.remove = function(obj, val) {
		if ($.isElement(obj)) {
			obj.parentNode.removeChild(obj);
			return $;
		}
		if (obj.constructor == Array)
			while (true) {
				var i = obj.indexOf(val);
				if (i == -1)
					break;
				obj.splice(i, 1);
			}
		else
			for (var keys = $.keyOf(obj, val, true), i = 0, len = keys.length; i < len;
			delete obj[keys[i++]]);
		return obj;
	};

	$.replace = function(str, search, replace) {
		if ( typeof search != 'object')
			return str.replace(new RegExp(search.replace(/\W/g, '\\$&'), 'g'), replace);
		if (!search.length)
			return str;
		for (var newStr = '', prev = 0, i = 0, len = search.length; i < len; prev = index, i++) {
			var val = search[i], index = prev + str.slice(prev).indexOf(val) + val.length;
			newStr += (i + 1 == len ? str.slice(prev) : str.slice(prev, index)).replace(val, replace[i]);
		}
		return newStr;
	};

	$.trimExpr = function(expr) {
		return expr.trim().replace(/\s{2,}/g, ' ').replace(/\(\s|\s\)|\s?,\s?/g, function(str) {
			return str.trim();
		});
	};

	// Determiner

	$.isElement = function(obj) {
		return obj && obj.nodeType == Node.ELEMENT_NODE;
	};

	$.isEmpty = function(obj) {
		return obj == undefined || obj == null || $.isElement(obj) && obj.innerHTML.trim() == '' || typeof obj != 'function' && obj.length == 0 || typeof obj == 'object' && Object.keys(obj).length == 0;
	};

	// APIs

	$.InheritObj = $.define(function(self) {
		this.self = self;
		this.data = {};
	}, {
		data : function(self, type) {
			var data = self.data[type] = self.data[type] || {
				list : [],
				props : {}
			};
			return data;
		},
		prototype : {
			on : function(type, func) {
				var self = this, data = $.InheritObj.data(this, type), list = data.list;
				if ( typeof func != 'function')
					return list;
				list.push(func);
				if (this[type] == undefined)
					this[type] = function() {
						return self.dispatch(type);
					};
				return this;
			},
			off : function(type, func) {
				var data = $.InheritObj.data(this, type), list = data.list;
				if (list && func != undefined)
					list.splice(list.indexOf(func));
				else
					data.list = [];
				return this;
			},
			props : function(type, key, val) {
				var props = $.InheritObj.data(this, type).props;
				if (key == undefined)
					return props;
				if (val == undefined)
					return props[key];
				props[key] = val;
				return this;
			},
			dispatch : function(type) {
				for (var self = this.self, data = $.InheritObj.data(this, type), list = data.list, props = data.props, i = 0, len = list.length; i < len; list[i++].call(self, props));
				return this;
			}
		}
	});

	$.benchmark = function() {
		var cases = arguments, event = new $.InheritObj();
		return event.on('init', function() {
			event.props('done', 'response', $.map(cases, function(func) {
				for (var start = new Date(), current = new Date() - start, i = 0; current < 2000; current = new Date() - start, func(i++));
				event.props('progress', 'response', i).dispatch('progress');
				return i;
			})).dispatch('done');
		});
	};

	$.inherit = function(data) {
		if (data == undefined)
			return $.inherit.data;
		$.inherit.data = data;
		return $;
	};
	$.inherit.data = null;

	$.dataset = $.define(function(obj, key, val) {
		var list = $.dataset.list, data;
		$.each(list, function(ele) {
			if (ele.obj == obj) {
				data = ele.props;
				return false;
			}
		});
		data = data || list[list.push({
			obj : obj,
			props : {}
		}) - 1].props;
		if (val == undefined)
			return key != undefined ? data[key] : data;
		data[key] = val;
		return $;
	}, {
		list : []
	});

	$.color = $.define(function(expr) {
		if (expr != undefined && expr.constructor == String) {
			var color = $.color.list[expr];
			if (color != undefined)
				return $.color(color);
			var expr = $.trimExpr(expr), expr = expr.match(/^([^(]+)\(([^)]+)\)$/) || expr.match(/^(#)((?:[0-9a-f]{3}){1,2})$/i);
			if (!expr)
				return false;
			var type = expr[1], args = expr[2], r, g, b, a;
			if (type == '#') {
				var len = args.length;
				if (len == 3)
					args = args.replace(/./g, '$&$&');
				else if (len != 6)
					return false;
				var rgb = parseInt(args, 16);
				return new $.color([(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF, 1]);
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
			var toNum = function(expr, base) {
				return isFinite(expr) ? expr : expr.charAt(expr.length - 1) == '%' ? expr.slice(0, -1) / 100 * base : false;
			};
			switch(type) {
				case 'rgba':
					for (var i = 0; i < 3; i++) {
						var arg = toNum(args[i], 255);
						if (isNaN(arg))
							return false;
						args[i] = arg;
					}
					return new $.color(args);
				case 'hsla':
					for (var i = 0; i < 3; i++) {
						var arg = toNum(args[i], 1);
						if (isNaN(arg))
							return false;
						args[i] = arg;
					}
					var toRgb = function(t1, t2, h) {
						if (h < 0)
							h += 1;
						if (h > 1)
							h -= 1;
						return h < 1 / 2 ? t2 : (t1 + h < 1 / 6 ? (t2 - t1) * 6 * h : h < 2 / 3 ? (t2 - t1) * (2 / 3 - h) * 6 : 0);
					}, h = args[0], s = args[1], l = args[2], a = args[3];
					if (s == 0)
						return new $.color([l, l, l, a]);
					var t2 = l < 0.5 ? l * (1 + s) : l + s - l * s, t1 = 2 * l - t2;
					return new $.color([toRgb(t1, t2, h + 1 / 3) * 255, toRgb(t1, t2, h) * 255, toRgb(t1, t2, h - 1 / 3) * 255]);
				default:
					return false;
			}
		}
		this.r = (expr.r || expr[0]) * 1;
		this.g = (expr.g || expr[1]) * 1;
		this.b = (expr.b || expr[2]) * 1;
		this.a = (expr.a || expr[3]) * 1;
	}, {
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
			toRgb : function() {
				return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
			},
			toRgba : function() {
				return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
			},
			toHex : function() {
				var toHex = function(color) {
					var hex = color.toString(16);
					return hex.length > 1 ? hex : 0 + hex;
				}
				return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
			},
			toName : function() {
				return $.keyOf($.color.list, this.toHex());
			},
			toHsl : function() {
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
				return 'hsl(' + h * 360 + ',' + s * 100 + '%,' + l * 100 + '%)';
			},
			toHsla : function() {
				return this.toHsl().replace('hsl', 'hsla').slice(0, -1) + ',' + this.a + ')';
			}
		}
	});

	$.formatColor = function(expr, isNorm) {
		var match = expr.match(/\w+\([^)]+\)|#(?:[0-9a-f]{3}){1,2}|\w+/ig);
		if (match) {
			var colors = [], list = [];
			$.each(match, function(ele) {
				var color = $.color(ele);
				if (color) {
					colors.push(ele);
					list.push( isNorm ? 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')' : color.toRgba());
				}
			});
			return $.replace(expr, colors, list);
		}
		return expr;
	}

	$.calc = function(expr, elem) {
		var expr = $.formatColor($.trimExpr(expr)), oper = expr.match(/[-+/*](?==)/);
		if (!oper)
			return false;
		var lhs = expr.slice(0, oper.index).trim(), rhs = expr.slice(oper.index + 2).trim(), valsReg = /[-+]?(?:\d*\.\d+|\d+)[^\), ]*/g, unitReg = /(\D+|)$/;
		if (isFinite(rhs))
			return $.formatColor(lhs.replace(valsReg, function(str) {
				var num = parseFloat(str);
				return (oper == '*' ? rhs * num : oper == '/' ? rhs / num : oper == '+' ? rhs + num : num - rhs) + str.match(unitReg)[0];
			}), true);
		if (lhs.replace(valsReg, '').indexOf(rhs.replace(valsReg, '')) == -1)
			return false;
		var lhsVals = lhs.match(valsReg);
		if (!lhsVals)
			return false;
		var rhsVals = rhs.match(valsReg);
		return $.formatColor($.replace(lhs, lhsVals, $.map(rhsVals, function(val, i) {
			var lhsVal = lhsVals[i], lhsNum = parseFloat(lhsVal), lhsUnit = lhsVal.match(unitReg)[0], num = parseFloat(val), unit = val.match(unitReg)[0];
			if (lhsUnit == '' || unit == '' || lhsUnit == unit)
				return (oper == '*' ? lhsNum * num : oper == '/' ? lhsNum / num : oper == '+' ? lhsNum + num : lhsNum - num) + (lhsUnit || unit);
			return $.getStyle(elem, 'calc(' + lhsVal + ' ' + oper + ' ' + val + ')');
		})), true);
	};

	// DOM

	$.getStyle = function(elem, key, val) {
		var sty = getComputedStyle(elem);
		if (key == undefined)
			return sty;
		if (val == undefined) {
			if (key.constructor == Object)
				return $.define({}, Object.keys(key), $.map(key, function(val, key) {
					return $.getStyle(elem, key, val);
				}));
			var prefix = $.style.prefix;
			return sty[key] || sty[key + prefix] || $.getStyle(elem, 'width', key);
		}
		var prop = $.style(elem, key);
		$.style(elem, key, val);
		var val = $.getStyle(elem, key);
		$.style(elem, key, prop);
		return val;
	};

	$.style = $.define(function(elem, key, val) {
		if (key.constructor == Object)
			return $.each(key, function(val, key) {
				$.style(elem, key, val);
			});
		var sty = elem.style, name = sty[key] != undefined ? key : $.style.prefix + key, prop = sty[name];
		if (val == undefined)
			return prop;
		sty[name] = val.charAt(1) != '=' ? val : $.calc(prop + val, elem) || $.calc($.getStyle(elem, name) + val, elem) || $.getStyle(elem, name, 'calc(' + prop + ' ' + val.charAt(0) + ' ' + val.slice(2) + ')');
		return $;
	}, {
		prefix : (function(vendor) {
			var str = vendor.exec($.getStyle(document.documentElement).cssText);
			return str ? str[0] : '';
		})(/-(moz|webkit|ms|o)-/g)
	});

	$.animate = function(elem, dura, func) {
		if (func.constructor != Function) {
			var keys = Object.keys(func), initVals = $.map(keys, function(key) {
				return $.style(elem, key) || '0';
			}), vals = $.vals(func), animVals = $.map(vals, function(val, i) {
				return $.calc($.getStyle(elem, keys[i], val) + '-=' + initVals[i], elem);
			});
			return $.animate(elem, dura, function(prog) {
				$.each(keys, function(key, i) {
					$.style(elem, key, $.calc(initVals[i] + '+=' + $.calc(animVals[i] + '*=' + prog)));
				});
			});
		}
		var anim = function(timestamp) {
			if (!start)
				start = timestamp;
			var prog = Math.min((timestamp - start) / dura, 1);
			func.call(elem, prog);
			if (prog < 1) {
				req(anim);
				callback.dispatch('progress');
			} else
				callback.dispatch('done');
		}, callback = new $.inherit(anim), start;
		var req = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		req(anim);
		$.inherit.current.data = callback;
		return $;
	};

	$.on = function(elem, type, callback) {
		$.dataset(elem, type, $.dataset(elem, type) || []);
		if (callback) {
			if (type.constructor == Object) {
				$.each(type, function(key) {
					$.on(elem, key, this);
				});
			} else {
				elem.addEventListener(type, callback);
				$.dataset(elem, type).push(callback);
			}
			return $;
		}
		return $.dataset(elem, type);
	};

	$.off = function(elem, type, callback) {
		var list = $.dataset(elem, type) || [];
		if (callback) {
			if (type.constructor == Object) {
				$.each(type, function(key) {
					$.off(elem, key, this);
				});
			} else {
				$.remove(list, callback);
				elem.removeEventListener(type, callback);
			}
		} else {
			$.dataset(elem, type, []).each(list, function() {
				elem.removeEventListener(type, this);
			});
		}
		return $;
	};

	$.attr = function(elem, props) {
		return props ? props.constructor == String ? elem.getAttribute(props) : $.each(props, function(key) {
			elem.setAttribute(key, this);
		}) : elem.attributes;
	};

	$.innerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.innerHTML;
		}
		elem.innerHTML = str;
		return $;
	};

	$.outerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.outerHTML;
		}
		elem.outerHTML = str;
		return $;
	};

	$.appendTo = function(elem, child) {
		elem.appendChild(child);
		return $;
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

	// Selector

	var coreSelector = function() {
		var args = this.args = $.map(arguments), selector = args[0];
		if ( typeof selector == 'string')
			args[0] = selector = document[/^#/.test(selector) ? 'getElementById' : 'querySelectorAll'](selector);
		this.type = selector.constructor == NodeList ? 'nodeList' : $.isElement(selector) ? 'element' : 'object';
		if (this.type == 'nodeList') {
			var self = this;
			$.each(selector, function(i) {
				self[i] = $(this);
			})
		}
	};

	var coreFuncList = [$.each, $.map, $.which, $.unique];

	$.each($, function(func, key) {
		coreSelector.prototype[key] = (function(func, key) {
			return coreFuncList.indexOf(func) == -1 ? function() {
				var args = this.args, currentArgs = $.map(arguments);
				switch(this.type) {
					case 'nodeList':
						var arr;
						$.each(this.args[0], function() {
							var rsl = func.apply(null, $.define($.map(args), 0, this).concat(currentArgs));
							if (rsl != $) {
								var arr = arr || [];
								arr.push(rsl);
							}
						});
						return arr || this;
					default:
						var rsl = func.apply(null, $.map(args).concat(currentArgs));
						return rsl != $ ? rsl : this;
				}
			} : function() {
				var rsl = func.apply(null, $.map(this.args));
				return rsl != $ ? rsl : this;
			};
		})(func, key)
	}, true);

	window.$ = window.Gearics = $;

})(window);
