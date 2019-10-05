(function(window, undefined) {
	/*
	 * Gearics.js
	 * => Author(s): Tom Chung
	 * => Version: 0.0.0 developing
	 * => Modified date: YYYY-MM-DD
	 * Copyright preserved
	 */

	/*
	 * Shorthand names reference,
	 * obj = object
	 * arr = array
	 * num = number
	 * str = string
	 * ele = element in array
	 * elem = element of DOM
	 * val = value
	 * prop = property
	 * len = length
	 * i = index || item
	 * dflt = default
	 * func = function
	 * rsl = result
	 * arg = argument
	 * proc = process
	 * prog = progress
	 * req = request
	 * expr = expression
	 */

	('use strict');

	var Gearics = function() {

	}, $ = Gearics;

	// core
	$.toArray = function(obj) {
		for (var arr = [], len = obj.length, i = 0; i < len; arr[i] = obj[i++]);
		return arr;
	}

	$.each = function(obj, callback, isObj) {
		var i = 0, len = obj.length;
		if (len && !isObj) {
			for (; i < len; i++) {
				callback.call(obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			for ( len = keys.length; i < len; i++) {
				var key = keys[i];
				callback.call(obj[key], key, obj);
			}
		}
		return $;
	}

	$.map = function(obj, callback, isObj) {
		var arr = [], callback = callback ||
		function() {
			return this;
		};
		$.each(obj, function(key, obj) {
			arr.push(callback.call(this, key, obj));
		}, isObj);
		return arr;
	}

	$.which = function(obj, callback, isObj) {
		var arr = [];
		$.each(obj, function(key) {
			var rsl = callback(this);
			if (rsl) {
				arr.push(this);
			}
		}, isObj);
		return arr;
	}

	$.assign = function(obj, keys, vals) {
		$.each(keys, function(i) {
			obj[this] = vals[i];
		});
		return obj;
	}

	$.define = function(obj, props, isDflt) {
		$.each(props, function(key) {
			obj[key] = isDflt ? (obj[key] || this) : this;
		});
		return obj;
	}

	$.unique = function(obj, isObj) {
		var arr = [];
		$.each(obj, function(key) {
			if (arr[key] == undefined) {
				arr.push(this);
			}
		}, isObj);
		return arr;
	}

	$.clone = function(obj, deep) {
		if ($.isElement(obj)) {
			return obj.cloneNode(deep);
		}
		switch(obj.constructor) {
			case Array:
				return obj.slice();
			case String:
				return obj.toString();
			case Object:
				var keys = Object.keys(obj);
				return $.assign({}, keys, $.map(keys, function() {
					var prop = obj[this];
					if (deep && typeof prop == 'object') {
						return $.clone(prop, deep);
					}
					return prop;
				}));
			default:
				return obj;
		}

	}

	$.remove = function(obj, props) {
		if ($.isElement(obj)) {
			obj.parentNode.removeChild(obj);
			return $;
		}
		switch(obj.constructor) {
			case Array:
				var i = obj.indexOf(props);
				while (i != -1) {
					obj.splice(i, 1);
					i = obj.indexOf(props);
				}
			case String:
				return obj.replace(new RegExp(props.replace(/\W/, '\\$&'), 'g'), '');
			default:
				$.each(obj, function(key) {
					if (this == props) {
						delete obj[key];
					}
				});
		}
		return obj;
	}

	$.replace = function(str, search, replace) {
		if (search.constructor != Array) {
			return str.replace(new RegExp(search.replace(/\W/g, '\\$&'), 'g'), replace);
		}
		for (var rsl = '', prev = 0, arr = [], i = 0, len = search.length, val, index; i < len; i++) {
			val = search[i], index = prev + val.length + str.slice(prev).indexOf(val), rsl += (i + 1 == len ? str.slice(prev) : str.slice(prev, index)).replace(val, replace[i]), prev = index;
		}
		return rsl;
	}

	console.log($.replace('rgba(0,255,0,1)', ['0', '255', '0'], ['255', '0', '255']));
	console.log($.replace('rgba(0,255,0,1)', '0', '100'));

	// determiner
	$.isElement = function(obj) {
		return obj && obj.nodeType == Node.ELEMENT_NODE;
	}

	$.isEmpty = function(obj) {
		return obj == undefined || obj == null || $.isElement(obj) && obj.innerHTML.trim() == '' || typeof obj != 'function' && obj.length == 0 || typeof obj == 'object' && Object.getOwnPropertyNames(obj).length == 0;
	}
	// API

	$.color3 = function(expr) {
		var expr = expr.trim().replace(/\s{2,}/g, ' ').replace(/,\s|\s,|\(\s|\s\)/g, function(str) {
			return str.trim();
		});
		var expr = expr.match(/^([^(]+)\(([^)]+)\)$/i) || expr.match(/^(#)((?:[0-9a-f]{3}){1,2})$/i);
		if (!expr)
			return;
		var r, g, b, a;
		var type = expr[1], args = expr[2], len = args.length;
		if (type == '#') {
			if (len == 3) {
				args = args.replace(/./g, '$&$&');
				len = 6;
			} else if (len != 6) {
				return;
			}
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
					args.push(1);
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
			var toNum = function(pct, max, min) {
				var pct = pct + '', rsl;
				if (pct.slice(-1) != '%') {
					rsl = pct;
				} else {
					rsl = pct.slice(0, -1) / 100 * max;
				}
				return rsl > max ? max : rsl < min ? min : rsl;
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
						if (i == 0) {
							var arg = toNum(args[i], 360, 0);
						} else {
							var arg = toNum(args[i], 1, 0);
						}
						if (isNaN(arg))
							return;
						args[i] = arg;
					}
					var h = args[0] / 360;
					var s = args[1];
					var l = args[2];
					a = args[3];
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
					}
					if (s == 0) {
						r = g = b = l;
					} else {
						var t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
						var t1 = 2 * l - t2;
						r = hue2rgb(t1, t2, h + 1 / 3) * 255;
						g = hue2rgb(t1, t2, h) * 255;
						b = hue2rgb(t1, t2, h - 1 / 3) * 255;
					}
					break;
				default:
					return;
			}
		}
		r = Math.round(r);
		g = Math.round(g);
		b = Math.round(b);
		return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	}

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
		if (val != undefined) {
			data[key] = val;
			return $;
		}
		return key != undefined ? data[key] : data;
	}
	$.dataset.list = [];

	$.calc = function(expr, elem) {
		var expr = expr.replace(/\s{2,}|\s*[,]\s*|\(\s+|\s+\)/g, function(str) {
			return str.trim() || ' ';
		});
		var oper = expr.match(/[-+/*](?==)/);
		var lhs = expr.slice(0, oper.index).trim();
		var rhs = expr.slice(oper.index + 2).trim();
		var valsReg = /[-+]?(?:\d*\.\d+|\d+)[^\), ]*/g;
		var numReg = /^[-+]?(\d*\.\d+|\d+)/;
		var unitReg = /(\D+|)$/;
		if (isFinite(rhs)) {
			return lhs.replace(valsReg, function(str) {
				var num = str.match(numReg)[0] * 1;
				return (oper == '*' ? num * rhs : oper == '/' ? num / rhs : num + rhs * 1) + str.match(unitReg)[0];
			});
		}
		if (lhs.replace(valsReg, '').indexOf(rhs.replace(valsReg, '')) == -1) {
			return false;
		}
		var lhsVals = lhs.match(valsReg);
		if (lhsVals == null) {
			return false;
		}
		var list = [];
		lhs.replace(valsReg, function(str, index) {
			list.push(index);
		});
		var rhsVals = rhs.match(valsReg);
		$.each(lhsVals, function(key) {
			var index = list[key];
			var len = lhs.length;
			lhs = lhs.slice(0, index) + lhs.slice(index).replace(this, function(str) {
				var num = str.match(numReg)[0] * 1;
				var unit = rhsVals[key].match(unitReg)[0];
				if (str.match(unitReg)[0] == '' || unit == '' || unit == str.match(unitReg)[0]) {
					var rhsNum = rhsVals[key].match(numReg)[0] * 1;
					return (oper == '*' ? num * rhsNum : oper == '/' ? num / rhsNum : num + rhsNum) + (str.match(unitReg)[0] || unit);
				} else {
					return $.getStyle(elem, 'calc(' + str + ' ' + oper + ' ' + rhsVals[key] + ')');
				}
			});
			list = $.map(list, function() {
				return this + lhs.length - len;
			})
		});
		return lhs;
	}
	// DOM

	$.animate = function() {

	}

	$.getStyle = function(elem, key, val) {
		var sty = getComputedStyle(elem), prefix = $.style.prefix;
		if (val != undefined) {
			var prop = $.style(elem, key);
			$.style(elem, key, val);
			var rsl = $.getStyle(elem, key);
			$.style(elem, key, prop);
			return rsl;
		}
		if (key) {
			if (key.constructor == String) {
				return sty[key] || sty[prefix + key] || $.getStyle(elem, 'width', key);
			}
			return $.assign({}, Object.keys(key), $.map(key, function(key) {
				return $.getStyle(elem, key, this);
			}));
		}
		return sty;
	}

	$.style = function(elem, key, val) {
		var sty = elem.style;
		if (key.constructor == Object) {
			return $.each(key, function(name) {
				$.style(elem, name, this);
			});
		}
		var name = sty[key] != undefined ? key : $.style.prefix + key;
		if (val != undefined) {
			if (val.constructor == Object) {
				$.each(val, function(key) {
					var lhs = sty[name].match(new RegExp(key + '\\([^)]+\\)'));
					lhs = lhs ? lhs[0] : 0;
					var rhs = this;
					var rsl;
					if (rhs.slice(1, 2) != '=') {
						if (new RegExp(key + '\\([^)]+\\)').test(sty[name])) {
							sty[name] = sty[name].replace(lhs, key + '(' + rsl + ')');
						} else {
							sty[name] += ' ' + key + '(' + rsl + ')';
						}
						return $;
					} else {
						rsl = $.calc((lhs == 0 ? 0 : lhs.slice(key.length + 1, lhs.length - 1)) + rhs);
					}
					if (new RegExp(key + '\\([^)]+\\)').test(sty[name])) {
						sty[name] = sty[name].replace(lhs, key + '(' + rsl + ')');
					} else {
						sty[name] += ' ' + key + '(' + rsl + ')';
					}
				});
				return $;
			}
			var prop = sty[name];
			if (val.slice(1, 2) != '=') {
				sty[name] = val;
				return $;
			}
			sty[name] = $.calc(sty[name] + val, elem) || $.calc($.getStyle(elem, key) + val, elem);
			return $;
		}
		return sty[name];
	}

	$.define($.style, {
		prefix : (/-(moz|webkit|ms|o)-/g.exec($.getStyle(document.documentElement).cssText) || [''])[0]
	});

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

	$.on(document, 'DOMContentLoaded', function() {

		$.on(document.querySelector('#div2'), 'click', function() {
			$.off(this, 'mousemove');
			$.style(document.querySelector('#div2'), {
				margin : '+=2em',
				transform : {
					rotateZ : '+=45deg'
				},
				backgroundColor : '+=rgb(-10,10,10)'
			})
			console.log($.style(document.querySelector('#div2'), 'background-color'))
			$.on(this, 'mousemove', function() {
				$.style(this, {
					transform : {
						rotateZ : '+=5'
					}
				})
			});
		});

		console.log('1.20, 123.5px,52% 53cm (10px)'.match(/[-+]?(\d*(\.\d+)|\d+)[^\), ]+/g));

		$.on(document.querySelector('#div2'), 'click', function() {
			console.log($.calc('2em+=5px', document.documentElement))
			console.log('---boundary---');
			$.color3('rgb(0,255,110)');
			$.color3('rgb(10%,100%,110)');
			$.color3('hsla(245,100%,50%,1)');
		});
	});

	window.$2 = window.Gearics2 = Gearics;
})(window);
