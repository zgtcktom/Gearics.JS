(function(window, undefined) {
	/*
	 * Gearics.js
	 * => Author(s): Tom Chung
	 * => Version: 0.0.0 developing
	 * => Modified date: YYYY-MM-DD
	 * Copyright preserved
	 */

	('use strict');

	var Gearics = function() {

	}, $ = Gearics;
	// core

	$.each = function(obj, callback, isObj) {
		var i = 0, len = obj.length;
		if (len && !isObj)
			for (; i < len; i++) {
				if (callback.call(obj[i], i, obj) == false)
					break;
			}
		else
			for (var keys = Object.keys(obj), len = keys.length; i < len; i++) {
				var key = keys[i];
				if (callback.call(obj[key], key, obj) == false)
					break;
			}
		return $;
	}

	$.map = function(arr, callback) {
		var newArr = [], i = 0, len = arr.length;
		if ( typeof callback == 'function')
			for (; i < len; newArr[i] = callback.call(arr[i], i++, arr));
		else
			for (; i < len; newArr[i] = arr[i++]);
		return newArr;
	}

	$.which = function(arr, callback) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i];
			if (callback.call(ele, i, arr) == true)
				newArr.push(ele);
		}
		return newArr;
	}

	$.unique = function(arr) {
		for (var newArr = [], i = 0, len = arr.length; i < len; i++) {
			var ele = arr[i];
			if (newArr.indexOf(ele) == -1)
				newArr.push(ele);
		}
		return newArr;
	}

	$.define = function(obj, keys, vals) {
		if (keys == undefined)
			return obj;
		switch(keys.constructor) {
			case Array:
				for (var i = 0, len = keys.length; i < len; obj[keys[i]] = vals[i++]);
				break;
			case Object:
				for (var map = keys, keys = Object.keys(map), i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					obj[key] = map[key];
				}
				break;
			default:
				obj[keys] = vals;
				break;
		}
		return obj;
	}

	$.keyOf = function(obj, val) {
		for (var keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			if (obj[key] == val)
				return key;
		}
	}

	$.clone = function(obj, deep) {
		if ( typeof obj != 'object')
			return obj;
		if (obj.cloneNode != undefined)
			return obj.cloneNode(deep);
		if (obj.length != undefined)
			return $.map(obj);
		for (var newObj = {}, keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			newObj[key] = deep ? $.clone(obj[key], deep) : obj[key];
		}
		return newObj;
	}

	$.remove = function(obj, val) {
		if (obj.constructor == Array)
			while (true) {
				var i = obj.indexOf(val);
				if (i == -1)
					break;
				obj.splice(i, 1);
			}
		else
			for (var keys = Object.keys(obj), i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				if (obj[key] == val)
					delete obj[key];
			}
		return obj;
	}

	$.replace = function(str, search, replace) {
		if (search.constructor != Array)
			return str.replace(new RegExp(search.replace(/\W/g, '\\$&'), 'g'), replace);
		if (search.length == 0)
			return str;
		for (var rsl = '', prev = 0, arr = [], i = 0, len = search.length, val, index; i < len; i++) {
			val = search[i], index = prev + val.length + str.slice(prev).indexOf(val), rsl += (i + 1 == len ? str.slice(prev) : str.slice(prev, index)).replace(val, replace[i]), prev = index;
		}
		return rsl;
	}

	$.trim = function(str) {
		return str.trim().replace(/\s{2,}/g, ' ').replace(/\s?,\s?|\(\s|\s\)/g, function(str) {
			return str.trim();
		});
	}

	$.benchmark = function(cases, callback) {
		for (var arr = [], callback = callback || {}, progress = callback.progress, done = callback.done, i = 0, len = cases.length; i < len; i++) {
			var time = new Date(), count = 0, ele = cases[i];
			while (new Date() - time < 1000) {
				ele();
				count++;
			}
			var rsl = Math.round(count * 1000 / (new Date() - time));
			arr[i] = rsl;
			if (progress != undefined)
				progress(rsl, i, ele);
		}
		if (done != undefined)
			done(arr, cases);
		return $;
	}
	// determiner

	$.isElement = function(obj) {
		return obj && obj.nodeType == Node.ELEMENT_NODE;
	}

	$.isEmpty = function(obj) {
		return obj == undefined || obj == null || $.isElement(obj) && obj.innerHTML.trim() == '' || typeof obj != 'function' && obj.length == 0 || typeof obj == 'object' && Object.keys(obj).length == 0;
	}
	// APIs
	$.dataset = function(obj, key, val) {
		var list = $.dataset.list, data;
		$.each(list, function() {
			if (this.obj == obj) {
				data = this.props;
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
	}
	$.dataset.list = [];

	$.color = function(expr, force) {
		if (expr != undefined) {
			var list = $.color.list, color = list[expr];
			if (color != undefined)
				return $.color(color);
			var expr = $.trim(expr), expr = expr.match(/^([^(]+)\(([^)]+)\)$/) || expr.match(/^(#)((?:[0-9a-f]{3}){1,2})$/i);
			if (!expr)
				return;
			var r, g, b, a, type = expr[1], args = expr[2], len = args.length;
			if (type == '#') {
				if (len == 3)
					args = args.replace(/./g, '$&$&');
				else if (len != 6)
					return;
				var rgb = parseInt(args, 16);
				r = (rgb >> 16) & 0xFF;
				g = (rgb >> 8) & 0xFF;
				b = rgb & 0xFF;
				a = 1;
			} else {
				args = args.split(',');
				len = args.length;
				switch(type) {
					case 'rgb':
					case 'hsl':
						if (len != 3)
							return;
						type = type + 'a';
						args[3] = 1;
						len = args.length;
						break;
					case 'rgba':
					case 'hsla':
						if (len != 4)
							return;
						break;
					default:
						return;
				}
				var toNum = function(expr, max, min) {
					var expr, rsl;
					if (expr.slice(-1) != '%')
						rsl = expr;
					else
						rsl = expr.slice(0, -1) / 100 * max;
					return force == true ? rsl : rsl > max ? max : rsl < min ? min : rsl;
				}
				switch(type) {
					case 'rgba':
						for (var i = 0; i < 3; i++) {
							var arg = toNum(args[i], 255, 0);
							if (isNaN(arg))
								return;
							args[i] = arg;
						}
						r = args[0];
						g = args[1];
						b = args[2];
						a = args[3];
						break;
					case 'hsla':
						for (var i = 0; i < 3; i++) {
							if (i == 0)
								var arg = toNum(args[i], 360, 0);
							else
								var arg = toNum(args[i], 1, 0);
							if (isNaN(arg))
								return;
							args[i] = arg;
						}
						var hue2rgb = function(t1, t2, h) {
							if (h < 0)
								h += 1;
							if (h > 1)
								h -= 1;
							if (h < 1 / 6)
								return t1 + (t2 - t1) * 6 * h;
							if (h < 1 / 2)
								return t2;
							if (h < 2 / 3)
								return t1 + (t2 - t1) * (2 / 3 - h) * 6;
							return t1;
						}, h = args[0] / 360, s = args[1], l = args[2];
						a = args[3];
						if (s == 0)
							r = g = b = l;
						else {
							var t2 = l < 0.5 ? l * (1 + s) : l + s - l * s, t1 = 2 * l - t2;
							r = hue2rgb(t1, t2, h + 1 / 3) * 255;
							g = hue2rgb(t1, t2, h) * 255;
							b = hue2rgb(t1, t2, h - 1 / 3) * 255;
						}
						break;
					default:
						return;
				}
			}
		}
		return {
			r : Math.round(r),
			g : Math.round(g),
			b : Math.round(b),
			a : a,
			toRgb : function() {
				return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
			},
			toRgba : function() {
				return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
			},
			toHex : function() {
				var toHex = function(c) {
					var hex = c.toString(16);
					return hex.length > 1 ? hex : 0 + hex;
				}
				return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
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
			},
			toName : function() {
				return $.keyOf(list, this.toHex());
			}
		}
	}
	$.color.list = {
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
	}

	$.calc = function(expr, elem) {
		var formatColor = function(expr, force) {
			var colors = $.which(expr.match(/(rgb|hsl)a?\([^)]+\)|#(\w{3}){1,2}|\w+/ig), function() {
				return $.color(this) != undefined;
			});
			if (colors != null)
				var expr = $.replace(expr, colors, $.which($.map(colors, function() {
					var color = $.color(this, force);
					if (color != undefined)
						return color.toRgba();
				}), function() {
					return this != undefined;
				}));
			return expr;
		}, expr = formatColor($.trim(expr), true), oper = expr.match(/[-+/*](?==)/);
		if (oper == null)
			return lhs;
		var lhs = expr.slice(0, oper.index).trim(), rhs = expr.slice(oper.index + 2).trim(), valsReg = /[-+]?(?:\d*\.\d+|\d+)[^\), ]*/g, numReg = /^[-+]?(\d*\.\d+|\d+)/, unitReg = /(\D+|)$/;
		if (lhs == 'none')
			return rhs;
		if (isFinite(rhs))
			return lhs.replace(valsReg, function(str) {
				var num = str.match(numReg)[0] * 1;
				return (oper == '*' ? num * rhs : oper == '/' ? num / rhs : num + rhs * 1) + str.match(unitReg)[0];
			});
		if (lhs.replace(valsReg, '').indexOf(rhs.replace(valsReg, '')) == -1)
			return;
		var lhsVals = lhs.match(valsReg);
		if (lhsVals == null)
			return;
		var list = [];
		lhs.replace(valsReg, function(str, index) {
			list.push(index);
		});
		var rhsVals = rhs.match(valsReg);
		$.each(lhsVals, function(key) {
			var index = list[key], len = lhs.length;
			lhs = lhs.slice(0, index) + lhs.slice(index).replace(this, function(str) {
				var num = str.match(numReg)[0] * 1, unit = rhsVals[key].match(unitReg)[0];
				if (str.match(unitReg)[0] == '' || unit == '' || unit == str.match(unitReg)[0]) {
					var rhsNum = rhsVals[key].match(numReg)[0] * 1;
					return (oper == '*' ? num * rhsNum : oper == '/' ? num / rhsNum : num + rhsNum) + (str.match(unitReg)[0] || unit);
				} else
					return $.getStyle(elem, 'calc(' + str + ' ' + oper + ' ' + rhsVals[key] + ')');
			});
			list = $.map(list, function() {
				return this + lhs.length - len;
			})
		});
		return formatColor(lhs);
	}
	// DOM

	$.animate = function(elem, dura, props, callback) {
		var start, req = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		switch(props.constructor) {
			case Function:
				var anim = function(ts) {
					if (!start) {
						start = ts;
					}
					var prog = Math.min((ts - start) / dura, 1);
					props.call(elem, prog);
					if (ts - start < dura) {
						req(anim);
					} else if (callback && callback.complete) {
						callback.complete.call(elem);
					}
				}
				break;
			case Object:
				var initProps = [], animProps = $.map(Object.keys(props), function() {
					var key = this, val = props[key], prop = $.getStyle(elem, key);
					initProps.push(prop);
					return $.getStyle(elem, key, '-=' + $.getStyle(elem, key, val));
				}), keys = Object.keys(props);
				return $.animate(elem, dura, function(prog) {
					$.each(initProps, function(i) {
						var key = keys[i];
						$.style(elem, key, $.calc($.getStyle(elem, key, this) + '+=' + $.calc($.getStyle(elem, key, animProps[i]) + '*=' + prog, elem), elem));
					});
				}, callback);
		}
		req(anim);
		return $;
	}

	$.getStyle = function(elem, key, val) {
		var sty = getComputedStyle(elem), prefix = $.style.prefix;
		if (key == undefined)
			return sty;
		if (val == undefined) {
			if (key.constructor == String)
				return sty[key] || sty[prefix + key] || $.getStyle(elem, 'marginTop', key);
			return $.define({}, Object.keys(key), $.map(key, function(key) {
				return $.getStyle(elem, key, this);
			}));
		}
		var prop = $.style(elem, key);
		$.style(elem, key, val);
		var rsl = $.getStyle(elem, key);
		$.style(elem, key, prop);
		return rsl;
	}

	$.style = function(elem, key, val) {
		var sty = elem.style;
		if (key.constructor == Object)
			return $.each(key, function(key) {
				$.style(elem, key, this);
			});
		var name = sty[key] != undefined ? key : $.style.prefix + key;
		if (val != undefined) {
			var prop = sty[name];
			if (val.constructor == Object) {
				return $.each(val, function(key) {
					var lhs = prop.match(new RegExp(key + '\\([^)]+\\)')), lhs = lhs ? lhs[0] : 0, rhs = this, rsl;
					if (lhs) {
						if (rhs.slice(1, 2) != '=')
							sty[name] = prop.replace(lhs, key + '(' + rhs + ')');
						else
							sty[name] = key + '(' + $.calc(lhs.slice(key.length + 1, -1) + rhs) + ')';
					} else
						sty[name] += ' ' + key + '(' + (rhs.slice(1, 2) == '=' ? rhs.slice(2) : rhs) + ')';
				});
			}
			if (val.slice(1, 2) != '=') {
				sty[name] = val;
				return $;
			}
			var propVal = $.calc(prop + val, elem) || $.calc($.getStyle(elem, key) + val, elem);
			if (propVal != undefined)
				sty[name] = propVal;
			else {
				sty[name] = 'calc(' + prop + ' ' + val.slice(0, 1) + ' ' + val.slice(2) + ')';
				sty[name] = $.getStyle(elem, key);
			}
			return $;
		}
		return sty[name];
	}
	$.style.prefix = (/-(moz|webkit|ms|o)-/g.exec($.getStyle(document.documentElement).cssText) || [''])[0];

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
	}

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
	}

	$.attr = function(elem, props) {
		return props ? props.constructor == String ? elem.getAttribute(props) : $.each(props, function(key) {
			elem.setAttribute(key, this);
		}) : elem.attributes;
	}

	$.innerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.innerHTML;
		}
		elem.innerHTML = str;
		return $;
	}

	$.outerHTML = function(elem, str) {
		if (str == undefined) {
			return elem.outerHTML;
		}
		elem.outerHTML = str;
		return $;
	}

	$.appendTo = function(elem, child) {
		elem.appendChild(child);
		return $;
	}
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
	}
	// development standrad
	// DOMSelector = $$ = (selector || Element || NodeList || Object(not access $.each))

	window.$ = window.Gearics = Gearics;
})(window);
