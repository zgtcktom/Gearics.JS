(function(window, undefined) {

	/*
	 * Gearics.js
	 * Copyright preserved
	 */

	('use strict');

	var $ = {};

	var documentElement = document.documentElement;

	// $.inherit
	var inherit = $.inherit = function(data) {
		isInherited = true;
		if (data && data.constructor === event)
			inheritedEvent = data;
		else if (data !== $)
			isInherited = false;
		return data;
	}, isInherited = false, inheritedEvent = null;

	// $.storage
	var storage = $.storage = function(obj, key, val) {
		if (this.constructor !== storage) {
			var len = arguments.length;
			if (len === 0)
				storage.global = new storage;
			else {
				var glob = storage.global, $storage = glob.get(obj);
				if (!$storage)
					glob.set(obj, $storage = new storage);
				switch(len) {
					case 1:
						return $storage;
					case 2:
						return $storage.get(key);
					default:
						$storage.set(key, val);
				}
			}
			return $;
		}
		this.keys = [];
		this.values = [];
	};
	storage.prototype.get = function(key) {
		var keys = this.keys, vals = this.values;
		if (arguments.length !== 0)
			return vals[keys.indexOf(key)];
		for (var arr = [], i = 0, len = keys.length; i < len; arr[i] = {
			key : keys[i],
			value : vals[i++]
		});
		return arr;
	};
	storage.prototype.set = function(key, val) {
		var keys = this.keys, vals = this.values, len = arguments.length;
		if (len === 0)
			keys.length = vals.length = 0;
		else {
			var inx = keys.indexOf(key);
			if (len === 1) {
				if (inx !== -1) {
					keys.splice(inx, 1);
					vals.splice(inx, 1);
				}
			} else if (inx !== -1)
				vals[inx] = val;
			else {
				keys.push(key);
				vals.push(val);
			}
		}
		return this;
	};
	storage.prototype.size = function(len) {
		var keys = this.keys;
		if (arguments.length === 0)
			return keys.length;
		keys.length = this.values.length = len;
		return this;
	};
	storage.global = new storage;
	var storageElement = storage.element = documentElement.appendChild(document.createElement('gearics-storage'));
	storage.create = function(func) {
		var elem = storageElement.appendChild(document.createElement('gearics-item'));
		if ( typeof func === 'function')
			func.call(elem, storageElement);
		return elem;
	};

	// $.event
	var event = $.event = function(target) {
		if (this.constructor !== event) {
			if (target && target.constructor === event)
				return target;
			var glob = event.global, $event = glob.get(target);
			if (!$event)
				glob.set(target, $event = new event(target));
			return $event;
		}
		this.target = target;
		this.data = {};
	};
	event.prototype.on = function(type, func) {
		var data = this.data;
		if (arguments.length === 0)
			return data;
		var list = data[type] = data[type] || [];
		if ( typeof func !== 'function')
			return list;
		if (list.indexOf(func) === -1)
			list.push(func);
		return this;
	};
	event.prototype.off = function(type, func) {
		if (arguments.length === 0)
			this.data = {};
		else {
			var data = this.data;
			if ( typeof func === 'function') {
				var list = this.on(type), inx = list.indexOf(func);
				if (inx !== -1)
					list.splice(inx, 1);
			} else
				data[type] = [];
		}
		return this;
	};
	event.prototype.dispatch = function(type, props) {
		for (var target = this.target, list = this.on(type), i = 0, len = list.length; i < len; list[i++].call(target, props, this, type));
		return this;
	};
	event.global = storage(event);

	// $.queue
	var queue = $.queue = function(target) {
		if (this.constructor !== queue) {
			var glob = queue.global, $queue = glob.get(target);
			if (!$queue)
				glob.set(target, $queue = new queue(target));
			return $queue;
		}
		this.target = target;
		this.data = [];
		this.state = 0;
	};
	queue.prototype.enqueue = function(func, isImmed) {
		var data = this.data;
		if (arguments.length === 0)
			data.length = 0;
		else if ( typeof func === 'function' && data.push(func) === 1 && isImmed && !this.state)
			this.dequeue();
		return this;
	};
	queue.prototype.dequeue = function() {
		this.state = 0;
		var data = this.data;
		if (data.length > 0) {
			this.state = 1;
			var $event = data.shift().call(this.target, this);
			if ($event && $event.constructor === $.event) {
				var self = this;
				$event.on('complete', function() {
					if (self.state)
						self.dequeue();
				});
			}
		}
		return this;
	};
	queue.prototype.size = function(len) {
		var data = this.data;
		if (arguments.length === 0)
			return data.length;
		data.length = len;
		return this;
	};
	queue.global = storage(queue);

	// $.style
	var style = $.style = function(elem, props) {
		var len = arguments.length;
		if (this.constructor === style)
			return len === 0 ? documentElement.appendChild(document.createElement('style')) : rules[sheet.insertRule((elem.slice(0, 10) === '@keyframes' ? statement + elem.slice(10) : elem ) + ('{' + ( typeof props === 'string' ? props : parse(props)) + '}'), 0)];
		if (len === 0)
			return document.styleSheets;
		var computedSty = getComputedStyle(elem);
		if (len === 1)
			return computedSty;
		if (len === 2)
			if (props && props.constructor === Object)
				for (var keys = Object.keys(props), i = 0, len = keys.length; i < len; i++) {
					var key = keys[i];
					style(elem, key, props[key]);
				}
			else
				return computedSty[computedSty.hasOwnProperty(props) ? props : prefix + props];
		else {
			var sty = elem.style, key = (sty.hasOwnProperty(props) ? props : prefix + props).replace(/[A-Z]/g, function(str) {
				return '-' + str.toLowerCase();
			}), val = arguments[2], oper = /^[-+*/](?==)/.exec(val);
			sty.setProperty(key, oper ? 'calc(' + computedSty[key] + ' ' + oper[0] + ' ' + val.slice(2) + ')' : val);
		}
		return $;
	};
	var sheet = style.sheet = (style.element = new style).sheet;
	var rules = style.rules = sheet.cssRules;
	var prefix = /-(?:webkit|moz|o|ms)-/.exec(Array.prototype.slice.call(getComputedStyle(documentElement))), prefix = style.prefix = prefix ? prefix[0] : '';
	var keyframes = style.keyframes = function() {
		for (var list = Object.create(CSSRuleList.prototype), inx = 0, i = 0, len = rules.length; i < len; i++) {
			var item = rules[i];
			if (item.constructor === CSSKeyframesRule)
				list[inx++] = item;
		}
		list.length = inx;
		return list;
	};
	var statement = keyframes.statement = documentElement.style.hasOwnProperty('animation') ? '@keyframes' : '@' + prefix + 'keyframes';
	var parse = style.parse = function(props) {
		for (var cssText = '', keys = Object.keys(props), i = 0, len = keys.length; i < len; i++) {
			var key = keys[i], val = props[key], key = key.replace(/[A-Z]/g, function(str) {
				return '-' + str.toLowerCase();
			});
			cssText += key + (val && val.constructor === Object ? '{' + parse(val) + '}' : ':' + val + ';');
		}
		return cssText;
	};
	new style('@keyframes animation-progress', '0%{opacity:0}to{opacity:1}');

	// $.animate
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;

	var animate = $.animate = function(target, props) {
		this.event = new $.event(this.target = target);
		this.queue = new $.queue(this);
	};
	animate.prototype.animate = function(props, options) {
		var props = Object(props), options = Object(options);
		var target = this.target;
		var $event = new event(target);
		this.queue.enqueue(function() {
			for (var sty = getComputedStyle(target), initial = {}, keys = Object.keys(props), i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				initial[key] = sty[key];
			}
			var delay = options.delay || 0;
			var duration = typeof options.duration === 'number' ? options.duration : 1000;
			var timingFunction = options.timingFunction || 'linear';
			var prop = duration + 'ms ' + timingFunction + ' ' + delay + 'ms 1';
			storage.create(function() {
				var elem = this;
				style(elem, 'animation', 'animation-progress ' + prop);
				requestAnimationFrame(function steps() {
					var progress = getComputedStyle(elem).opacity;
					if (progress != 1) {
						$event.dispatch('progress', progress);
						requestAnimationFrame(steps);
					} else {
						style(target, props);
						$event.dispatch('complete');
					}
				});
			});
			style(target, 'animation', new style('@keyframes animation-' + rules.length, {
				from : initial,
				to : props
			}).name + ' ' + prop);
			return $event;
		}, true);
		this.on = function(type, func) {
			$event.on(type, func);
			return this;
		};
		return this;
	};

	window.onload = function() {
		var oa = new animate(documentElement).animate({
			backgroundColor : 'red'
		}).animate({
			backgroundColor : 'orange'
		}).animate({
			backgroundColor : 'yellow'
		}).animate({
			backgroundColor : 'green'
		}).animate({
			backgroundColor : 'blue'
		}).animate({
			backgroundColor : 'purple'
		}); (function anim1() {
			new animate(document.getElementById('ele1')).animate({
				padding : '100px',
				width : '0px',
				height : '0px',
				borderRadius : '0px'
			}).animate({
				margin : '50px',
				background : 'blue'
			}, {
				duration : 200
			}).animate({
				margin : '0px',
				padding : '50px',
				background : 'red'
			}, {
				duration : 200
			}).animate({
				padding : '100px',
				background : 'black'
			}, {
				duration : 200
			}).on('complete', function() {
				style(this, 'transform', 'rotateZ(0deg)');
			}).animate({
				boxShadow : '0 0 20px #ccc',
				background : '#fff',
				width : '100px',
				height : '100px',
				padding : '0px',
				borderRadius : '50%'
			}).on('complete', function() {
				anim1();
			});
		});
		(function anim() {
			oa.animate({
				backgroundColor : '#' + Math.round(Math.random() * 0xFFFFFF).toString(16)
			}, {
				duration : 500
			}).on('complete', function() {
				anim();
			});
		});
	};

	window.$ = $;

})(window);
