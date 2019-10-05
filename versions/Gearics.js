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
		var args = $.toArray(arguments);
		var selectors = args[0];
		if ( typeof selectors == 'string') {
			var val = args[0];
			if (/#.+/.test(selectors)) {
				args[0] = document.querySelector(selectors);
			} else {
				args[0] = document.querySelectorAll(selectors);
			}
			if (args[0] == null) {
				args[0] = val;
			}
		}
		args.unshift(null);
		return new (Function.prototype.bind.apply($.core, args));
	}, $ = Gearics;

	// Core

	$.$ = function(thisArg, callback) {
		return callback.call(thisArg) || $;
	}

	$.toArray = function(obj) {
		for (var arr = [], len = obj.length, i = 0; i < len; arr[i] = obj[i++]);
		return arr;
	}

	$.each = function(obj, callback, isObject) {
		var i = 0, len = obj.length;
		if (len && isObject != true) {
			for (; i < len; i++) {
				callback.call(obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj), key;
			for ( len = keys.length; i < len; i++) {
				key = keys[i];
				callback.call(obj[key], key, obj);
			}
		}
		return $;
	}

	$.map = function(obj, callback) {
		var arr = [];
		$.each(obj, function(key) {
			arr.push(callback.call(this, key));
		});
		return arr;
	}

	$.assign = function(obj, keys, vals) {
		$.each(keys, $.type(vals, 'string') ? function() {
			obj[this] = vals;
		} : function(i) {
			obj[this] = vals[i];
		});
		return obj;
	}

	$.define = function(obj, props, isDefault) {
		$.each(props, function(key) {
			obj[key] = isDefault ? (obj[key] || this) : this;
		});
		return obj;
	}

	$.plain = function() {
		var arr = [], split = function() {
			if (this.constructor != String && this.length) {
				$.each(this, split);
			} else {
				arr.push(this);
			}
		}
		$.each($.toArray(arguments), split);
		return arr;
	}

	$.isEmpty = function(obj) {
		if ($.type(obj, 'element')) {
			return obj.innerHTML.trim() == '';
		}
		if (obj == undefined || (obj.length != undefined && obj.length == 0) || Object.keys(obj).length == 0) {
			return true;
		}
		return false;
	}

	$.isElement = function(obj) {
		return obj && obj.nodeType == Node.ELEMENT_NODE;
	}

	$.type = function(obj, isType) {
		// that's the standard
		// element, string, date, number, regexp, array, function, map, Gearics, boolean, object, null, undefined
		var type;
		if (obj == undefined) {
			type = 'undefined';
		} else if (obj == null) {
			type = 'null';
		} else {
			switch(obj.constructor) {
				case String:
					type = 'string';
					break;
				case Date:
					type = 'date';
					break;
				case Number:
					type = 'number';
					break;
				case RegExp:
					type = 'regexp';
					break;
				case Array:
					type = 'array';
					break;
				case Function:
					type = 'function';
					break;
				case Object:
					type = 'map';
					break;
				case $:
					type = 'Gearics';
					break;
			}
			if (obj.nodeType && obj.nodeType == Node.ELEMENT_NODE) {
				type = 'element';
			}
			type = type || typeof obj;
			return isType != undefined ? type == isType : type;
		}
	}

	$.by = function(obj, args, callback) {
		if (!$.type(args, 'array')) {
			args = [args];
		}
		args.push(obj);
		return callback.apply(null, args);
	}

	$.isOverlay = function(elem, elem2) {
		// completely
		// elem2 overlay elem
		var rect = elem.getBoundingClientRect();
		var rect2 = elem2.getBoundingClientRect();
		var rsl = rect.left >= rect2.left && rect.right <= rect2.right && rect.bottom <= rect2.bottom && rect.top >= rect2.top;
		return rsl;
	}
	$.isOverlap = function(elem, elem2) {
		// partly
		var rect = elem.getBoundingClientRect();
		var rect2 = elem2.getBoundingClientRect();
		var rsl = $.isOverlay(elem, elem2) || rect.left <= rect2.left && rect.right >= rect2.right && rect.bottom >= rect2.bottom && rect.top <= rect2.top;
		return rsl;
	}

	$.which = function(list, filter) {
		if ($.type(list, 'element')) {
			return filter(list) ? list : $;
		}
		var rsl = [];
		$.each(list, function() {
			if (filter(this) == true) {
				rsl.push(this);
			}
		});
		return rsl;
	}

	$.rand = function(chars, patn) {
		var len = chars.length;
		return (patn || '$').replace(/\$/g, function() {
			return chars.charAt(~~(Math.random() * len));
		});
	}

	$.remove = function(obj, props) {
		if (!$.type(props, 'array')) {
			props = [props];
		}
		var type = $.type(obj);
		if (type == 'array') {
			$.each(props, function() {
				obj.splice(obj.indexOf(this), 1);
			});
		} else if (type == 'obj') {
			$.each(props, function() {
				if (obj[this] != undefined) {
					delete obj[this];
				}
			});
		} else if (type == 'element') {
			obj.parentNode.removeChild(obj);
		} else if (type == 'string') {
			$.each(props, function() {
				obj = obj.replace(new RegExp(this.replace(/./, '\\$&'), 'g'), '');
			});
			return obj;
		}
		return $;
	}
	// APIs

	$.dataset = function(obj) {
		var list = $.dataset.list, data;
		$.each(list, function() {
			if (this.obj == obj) {
				data = this.props;
			}
		});
		return data || list[list.push({
			obj : obj,
			props : {}
		}) - 1].props;
	}

	$.dataset.list = [];

	$.html = function(elem, text, isEntire) {
		var prop = isEntire ? 'outerHTML' : 'innerHTML';
		if (text != undefined) {
			elem[prop] = text;
		} else {
			return elem[prop];
		}
		return $;
	}

	$.animate = function(elem, dura, props, callback) {
		var req = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		var start;
		if (props.constructor == Function) {
			var anim = function(ts) {
				if (!start) {
					start = ts;
				}
				var prog = Math.min((ts - start) / dura, 1);
				props.call(elem, prog);
				if (ts - start < dura) {
					req(anim);
				} else {
					if (callback && callback.complete) {
						callback.complete.call(elem);
					}
				}
			}
		} else if (props.constructor == Object) {
			var initVal = [];
			var animVal = [];
			$.each(props, function(key) {
				var val = $.getStyle(elem, key);
				initVal.push(val);
				var prop = {};
				prop[key] = this;
				animVal.push(parseFloat($.getStyle(elem, prop)) - parseFloat(val));
			});
			var anim = function(ts) {
				if (!start) {
					start = ts;
				}
				var prog = Math.min((ts - start) / dura, 1);
				var map = {};
				var i = 0;
				$.each(props, function(key) {
					var val = parseFloat(initVal[i]);
					map[key] = initVal[i].replace(val, val + animVal[i] * prog);
					i++;
				});
				$.style(elem, map);
				if (ts - start < dura) {
					req(anim);
				} else {
					if (callback && callback.complete) {
						callback.complete.call(elem);
					}
				}
			}
		}
		req(anim);
		return $;
	}

	$.attr = function(elem, props) {
		return props.constructor == String ? elem.getAttribute(props) : $.each(props, function(key) {
			elem.setAttribute(key, this);
		});
	}

	$.getStyle = function(elem, props) {
		var prefix = $.style.prefix, type = props.constructor, sty = getComputedStyle(elem, null), rsl = [];
		if (type == String) {
			var rsl = sty[props] || sty[prefix + props];
			if (!rsl) {
				var sty = elem.style, val = sty.width;
				$.style(elem, {
					width : props
				});
				rsl = getComputedStyle(elem, null).width;
				sty.width = val;
			}
			return rsl;
		} else if (type == Object) {
			var sty = elem.style;
			$.each(props, function(key) {
				var val = sty[key], prop = {};
				prop[key] = this;
				$.style(elem, prop);
				rsl.push(getComputedStyle(elem, null)[key]);
				sty[key] = val;
			});
			return rsl.length == 1 ? rsl[0] : rsl;
		} else if (type == Array) {
			$.each(props, function() {
				rsl.push(sty[this]);
			});
			return rsl;
		}
		return sty;
	}

	$.style = function(elem, props) {
		var prefix = $.style.prefix, sty = elem.style, type = props.constructor;
		return type == String ? (sty[props] || sty[prefix + props]) : type == Object ? $.each(props, function(key) {
			var name = sty[key] != undefined ? key : prefix + key, val = sty[name], type = this.constructor;
			if (type == Function) {
				sty[name] = this.call(val, name, sty);
			} else if (type == String) {
				if (this.slice(1, 2) == '=') {
					sty[name] = 'calc(' + (getComputedStyle(elem)[name] || 0) + ' ' + this.slice(0, 1) + ' ' + this.slice(2) + ')';
					sty[name] = getComputedStyle(elem)[name];
				} else {
					sty[name] = this;
				}
			} else {
				$.each(this, function(key) {
					var num = parseFloat(this) || parseFloat(this.slice(2)), oper = this.slice(0, 2), reg = new RegExp(key + '\\([^)]+\\)');
					sty[name] = reg.test(val) ? val.replace(reg, function(str) {
						var meas = parseFloat(str.slice(key.length + 1));
						return str.replace(meas, oper == '+=' ? (meas + num) : oper == '-=' ? (meas - num) : oper == '*=' ? (meas * num) : oper == '/=' ? (meas / num) : num);
					}) : val + ' ' + key + '(' + this.slice(2) + ')';
				});
			}
		}) : props ? getComputedStyle(elem) : sty;
	}

	Object.defineProperties($.style, {
		'prefix' : {
			value : (/-(moz|webkit|ms|o)-/g.exec(getComputedStyle(document.documentElement, null).cssText) || [''])[0]
		}
	});

	$.ajax = function(url, data, callback) {
		var req = new XMLHttpRequest();
		$.each(callback, function(type) {
			req.addEventListener(type, this);
		});
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
	}

	$.on = function(elem, type, callback) {
		var list = $.dataset(elem)[type] = $.dataset(elem)[type] || [];
		list.push(callback);
		elem.addEventListener(type, callback);
		return $;
	}

	$.off = function(elem, type, callback) {
		var list = $.dataset(elem)[type];
		if (callback != undefined) {
			list.splice(list.indexOf(callback));
			elem.removeEventListener(type, callback);
		} else {
			$.each(list, function() {
				elem.removeEventListener(type, this);
			});
		}
		return $;
	}

	$.fullscreen = function(elem, isEnabled) {
		var elem = elem || document.documentElement;
		if (isEnabled == false || isEnabled != true && elem != null && elem == (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
			(document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen).call(document);
		} else {
			(elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen).call(elem, Element.ALLOW_KEYBOARD_INPUT);
		}
	}

	$.inherit = function(processArgs, callback) {
		// parentArgs as array
		// args as function
		// callback as function
		return function() {
			var args = $.toArray(processArgs && processArgs.constructor == Function ? processArgs(arguments) : arguments);
			var parentArgs = this.args;
			var nodeList = parentArgs[0];
			var rsl;
			if (nodeList.constructor == NodeList) {
				var arr;
				$.each(nodeList, function() {
					var funcArgs = parentArgs.concat($.toArray(args));
					funcArgs[0] = this;
					rsl = callback.apply(null, funcArgs);
					if (rsl != $) {
						arr = arr || [];
						arr.push(rsl);
					}
				});
				return arr != undefined ? arr : this;
			} else {
				rsl = callback.apply(null, parentArgs.concat(args));
				return rsl != $ ? rsl : this;
			}
		}
	}

	$.calc = function(val, expr) {
		var oper = expr.slice(0, 1);
		var valNum = $.parse('number', val);
		var exprNum = $.parse('number', expr.slice(1));
		console.log(expr.slice(1).replace(exprNum, ''))
		if (val.replace(valNum, '') != expr.slice(1).replace(exprNum, '') && oper != '*' && oper != '/') {
			return false;
		}
		var calc;
		switch(oper) {
			case '+':
				calc = function(key) {
					val = val.replace(this, Number(this) + Number(exprNum[key]));
				}
				break;
			case '-':
				calc = function(key) {
					val = val.replace(this, Number(this) - Number(exprNum[key]));
				}
				break;
			case '*':
				calc = function() {
					val = val.replace(this, Number(this) * exprNum[0]);
				}
				break;
			case '/':
				calc = function() {
					val = val.replace(this, Number(this) / exprNum[0]);
				}
				break;
		}
		$.each(valNum, calc);
		return val;
	}

	$.parse = function(type, input) {
		var parser = $.parse[type];
		return parser != undefined ? parser.call(input) : input;
	}

	$.define($.parse, {
		number : function() {
			return $.map(this.match(/[-+]?(\d*(\.\d+)|\d+)/g), function() {
				return this;
			});

		}
	});

	$.draggable = function(elem, option, callback) {
		var isStart = false;
		var initX, initY;
		var dragmove = function(event) {
			$('#divAnim').style({
				background : $('#divAnim').by(elem, $.isOverlap) ? 'red' : 'black'
			});
			$.style(elem, {
				left : event.clientX - initX + window.scrollX + 'px',
				top : event.clientY - initY + window.scrollY + 'px'
			});
			$.on(document, 'mouseup', dragend);
		}
		var dragend = function() {
			$.off(document, 'mousemove', dragmove);
			$.off(document, 'mouseup', dragend);
		}
		var dragstart = function(event) {
			event.preventDefault();
			isStart = true;
			initX = event.offsetX;
			initY = event.offsetY;
			$.on(document, 'mousemove', dragmove);
		}
		$.on(elem, 'mousedown', dragstart);
	}
	// $.core

	$.core = function() {
		this.args = $.toArray(arguments);
		if (this.args[0].constructor == NodeList) {
			var self = this;
			$.each(this.args[0], function(key) {
				self[key] = $(this);
			});
		}
	}

	$.core.prototype.constructor = $;

	$.each(Object.keys($), function() {
		$.core.prototype[this] = (function(prop) {
			return function() {
				var args = $.toArray(arguments), obj = this.args[0], rsl;
				if (obj.length) {
					var arr = [];
					$.each(obj, function() {
						var cArgs = $.toArray(args);
						cArgs.unshift(this);
						rsl = $[prop].apply(null, cArgs);
						if (rsl != $) {
							arr.push(rsl);
						}
					});
					return arr.length > 0 ? arr : this;
				} else {
					rsl = $[prop].apply(null, this.args.concat(args));
					return rsl != $ ? rsl : this;
				}
			}
		})(this);
	});

	window.Gearics = window.$ = $;
})(window);
