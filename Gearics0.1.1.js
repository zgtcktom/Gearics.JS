(function(window, undefined) {

	/*
	 * Gearics.js
	 * Copyright preserved
	 */

	('use strict');

	var $s = function(selectorText) {
		var selector = cache[selectorText];
		if (selector)
			return selector;
		selector = new Selector(selectorText);
		if (selector.hasOwnProperty('selectorText'))
			cache[selector.selectorText] = selector;
		return selector;
	};

	var cache = {};

	// Selector
	var Selector = $.Selector = function(selectorText) {

		this.length = 0;

		var nodeList;

		if ( typeof selectorText === 'string') {

			this.selectorText = selectorText;

			if (selectorText[0] === '<') {
				var element = document.createElement('storage');
				element.innerHTML = selectorText;
				nodeList = element.children;
			} else
				nodeList = document.querySelectorAll(selectorText);

		} else if (selectorText)
			nodeList = selectorText.hasOwnProperty('length') ? selectorText : selectorText.hasOwnProperty('nodeType') ? [selectorText] : null;

		if (nodeList)
			for (var index = 0, length = this.length = nodeList.length; index < length; this[index] = nodeList[index++]);
	};

	Selector.prototype.item = function(index) {
		return new Selector(this[index]);
	};

	Selector.prototype.innerHTML = function(string) {
		for (var index = 0, length = this.length; index < length; this[index++].innerHTML = string);
		return this;
	};

	// Dataset
	var Dataset = $.Dataset = function(object) {

		this.keys = [];
		this.values = [];
		this.length = 0;

		if ( object = Object(object))
			for (var keys = Object.keys(object), index = 0, length = keys.length; index < length; index++) {
				var key = keys[index];
				this.set(key, object[key]);
			}
	};

	Dataset.prototype.has = function(key) {
		return this.keys.indexOf(key) !== -1;
	};

	Dataset.prototype.get = function(key) {
		var keys = this.keys, values = this.values;
		if (arguments.length !== 0)
			return values[keys.indexOf(key)];
		for (var object = {}, index = 0, length = this.length; index < length; object[keys[index]] = values[index++]);
		return object;
	};

	Dataset.prototype.set = function(key, value) {
		var keys = this.keys, values = this.values, length = arguments.length;
		if (length === 0)
			this.length = keys.length = values.length = 0;
		else {
			var index = keys.indexOf(key);
			if (length > 1)
				if (index !== -1)
					values[inx] = value;
				else
					this.length = keys.push(key) && values.push(value);
			else if (index !== -1) {
				keys.splice(index, 1);
				values.splice(index, 1);
				this.length--;
			}
		}
		return this;
	};

	Dataset.prototype.item = function(index) {
		return {
			key : this.keys[index],
			value : this.values[index]
		};
	};

	// Event
	var Event = $.Event = function(target, callback) {

		this.target = target;
		this.data = {};

		if (callback)
			for (var keys = Object.keys(callback), index = 0, length = keys.length; index < length; index++) {
				var key = keys[index];
				this.on(key, callback[key]);
			}
	};

	Event.prototype.on = function(type, callback) {
		var data = this.data;
		if (arguments.length === 0)
			return data;
		var list = data[type] = data[type] || [];
		if ( typeof callback !== 'function')
			return list;
		if (list.indexOf(callback) === -1)
			list.push(callback);
		return this;
	};

	Event.prototype.off = function(type, callback) {
		if (arguments.length === 0)
			this.data = {};
		else {
			var data = this.data, list = data[type] = data[type] || [];
			if ( typeof callback === 'function') {
				var index = list.indexOf(callback);
				if (index !== -1)
					list.splice(index, 1);
			} else
				list.length = 0;
		}
		return this;
	};

	Event.prototype.dispatch = function(type, props) {
		var data = this.data;
		if (arguments.length === 0)
			for (var keys = Object.keys(data), props = Object(props), index = 0, length = keys.length; index < length; this.dispatch(keys[index++], props));
		else {
			var list = data[type];
			if (list)
				for (var target = this.target, list = list.slice(), props = Object(props), index = 0, length = list.length; index < length; list[index++].call(target, props, this, type));
		}
		return this;
	};

	Object.defineProperty(Event.prototype, 'length', {
		get : function() {
			if (this.data)
				return Object.keys(this.data).length;
		}
	});

	// Queue
	var Queue = $.Queue = function(target) {
		this.target = target;
		this.state = Queue.PENDING;
		var list = this.list = [];
	};

	Queue.prototype.enqueue = function(callback, isDequeue) {
		var list = this.list;
		if (arguments.length === 0)
			list.length = 0;
		else if (list.push(callback) === 1 && isDequeue && this.state === Queue.PENDING)
			this.dequeue();
		return this;
	};

	Queue.prototype.dequeue = function(isPeek) {
		var list = this.list;
		if (list.length) {
			this.state = Queue.RUNNING;
			var result = ( isPeek ? list[0] : list.shift()).call(this);
			if (result && result.constructor === Event) {
				var self = this;
				result.on('complete', function() {
					if (self.state === Queue.RUNNING)
						self.dequeue(isPeek);
				});
			}
		} else
			this.state = Queue.PENDING;
		return this;
	};

	Queue.prototype.dequeueAll = function(isPeek) {
		for (var list = this.list, index = 0, length = list.length; index < length; list[index++].call(this));
		if (!isPeek)
			list.length = 0;
		this.state = Queue.PENDING;
		return this;
	};

	Queue.prototype.insert = function(callback, index) {
		this.list.splice(index, 0, callback);
		return this;
	};

	Queue.prototype.pause = function() {
		this.state = Queue.PAUSED;
		return this;
	};

	Queue.prototype.peek = function(index) {
		var callback = this.list[index];
		if ( typeof callback === 'function')
			callback.call(this);
		return this;
	};

	Queue.prototype.item = function(index) {
		return this.list[index];
	};

	Queue.prototype.has = function(callback) {
		return this.list.indexOf(callback) !== -1;
	};

	Object.defineProperty(Queue.prototype, 'length', {
		get : function() {
			if (this.list)
				return this.list.length;
		},
		set : function(length) {
			if (this.list)
				return this.list.length = length;
		}
	});

	Queue.PENDING = 0;

	Queue.RUNNING = 1;

	Queue.PAUSED = 2;

	// Inherit
	var Inherit = $.Inherit = function(value) {
		this.value = value;
		this.event = new Event(this);
	};

	Inherit.prototype.inherit = function(callback) {
		this.value = typeof callback === 'function' ? callback.call(this) : callback;
		return this;
	};

	Inherit.init = function(callback) {
		return function() {
			var value = this.value, arguments = Array.prototype.slice.call(arguments);
			arguments.unshift(value);
			var result = callback.apply(null, arguments);
			return result === value ? this : result;
		};
	};

	// Benchmark
	var Benchmark = $.Benchmark = function() {
	};

	Benchmark.prototype.length = 0;

	Benchmark.prototype.add = function(callback, options) {
		this[this.length++] = callback;
		return this;
	};

	// Graphics
	var Graphics = $.Graphics = function(type) {
		var canvas = this.canvas = document.createElement('canvas');
		this.context = canvas.getContext('2d');
		this.style = canvas.style;
		this.nodeList = [];
		this.type = Graphics.CANVAS;
	};

	Graphics.CANVAS = 0;
	Graphics.SVG = 1;
	Graphics.DOM = 2;

	Graphics.prototype.width = 0;

	Graphics.prototype.height = 0;

	Graphics.prototype.size = function(width, height) {
		var canvas = this.canvas;
		canvas.width = this.width = width;
		canvas.height = this.height = height;
		return this;
	};

	Graphics.prototype.clear = function() {
		var context = this.context;
		context.clearRect(0, 0, this.width, this.height);
		return this;
	};

	Graphics.prototype.getDataURL = function() {
		return this.canvas.toDataURL();
	};

	Graphics.prototype.render = function() {
		this.clear();
		for (var nodeList = this.nodeList, index = 0, length = nodeList.length; index < length; index++) {
			nodeList[index].call(this);
		}
		return this;
	};

	Graphics.prototype.add = function(callback) {
		this.nodeList.push(callback);
		return this;
	};

	Graphics.prototype.appendTo = function(element) {
		element.appendChild(this.canvas);
		return this;
	};

	// Request

	// Widget

	// Animation

	var BezierCurve = $.BezierCurve = function() {
		for (var index = 0, length = this.length = arguments.length; index < length; this[index] = arguments[index++] * 1);
	};

	BezierCurve.prototype.getAxes = function(variable) {
		var array = this;
		while (array.length > 2) {
			for (var newArray = [], axis, index = 0, length = array.length - 2; index < length; newArray[newArray.push(( axis = array[index]) + (array[index + 2] - axis) * variable)] = ( axis = array[++index]) + (array[++index + 1] - axis) * variable);
			array = newArray;
		}
		return array;
	};

	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;

	var Animation = $.Animation = function(target, props, func, duration, bezierCurve) {
		var start = null;
		requestAnimationFrame(function step(time) {
			if (start === null)
				start = time;
			var progress = Math.min((time - start) / duration, 1);
			func(bezierCurve.getAxes(progress)[1]);
			if (progress < 1)
				requestAnimationFrame(step);
		});
	};

	// Color
	var Color = $.Color = function(red, green, blue, alpha) {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = arguments.length < 4 ? 1 : alpha;
	};

	Color.prototype.is = function(color) {
		return color && color.red === this.red && color.green === this.green && color.blue === this.blue && color.alpha === this.alpha;
	};

	Color.prototype.normalize = function() {
		var valueOf = function(value, isAlpha) {
			return value < 0 ? 0 : isAlpha ? value > 1 ? 1 : ~~value : value > 255 ? 255 : ~~value;
		};
		this.red = valueOf(this.red);
		this.green = valueOf(this.green);
		this.blue = valueOf(this.blue);
		this.alpha = valueOf(this.alpha, true);
		return this;
	};

	Color.prototype.toRGB = function(isReturnArray) {
		var red = this.red, green = this.green, blue = this.blue;
		return isReturnArray ? [red, green, blue] : 'rgb(' + red + ',' + green + ',' + blue + ')';
	};

	Color.prototype.toRGBA = function(isReturnArray) {
		var array = this.toRGB(true).concat(this.alpha);
		return isReturnArray ? array : 'rgba(' + array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3] + ')';
	};

	Color.prototype.toHex = function(isReturnArray) {
		var RGBtoHex = function(value) {
			return ( value = (~~value).toString(16)).length > 1 ? value : 0 + value;
		}, red = RGBtoHex(this.red), green = RGBtoHex(this.green), blue = RGBtoHex(this.blue);
		return isReturnArray ? [red, green, blue] : '#' + red + green + blue;
	};

	Color.prototype.toHSL = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, max = Math.max(red, green, blue), min = Math.min(red, green, blue), hue, saturation, lightness = (max + min) / 2;
		if (max === min)
			hue = saturation = 0;
		else
			var delta = max - min, saturation = delta / (lightness > .5 ? 2 - max - min : max + min), hue = (max === red ? (green - blue) / delta + (green < blue ? 6 : 0) : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4) / 6;
		hue *= 360;
		saturation = saturation * 100 + '%';
		lightness = lightness * 100 + '%';
		return isReturnArray ? [hue, saturation, lightness] : 'hsl(' + hue + ',' + saturation + ',' + lightness + ')';
	};

	Color.prototype.toHSLA = function(isReturnArray) {
		var array = this.toHSL(true).concat(this.alpha);
		return isReturnArray ? array : 'hsla(' + array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3] + ')';
	};

	Color.prototype.toHSV = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, max = Math.max(red, green, blue), min = Math.min(red, green, blue), value = max * 100 + '%', delta = max - min, saturation = (max === 0 ? 0 : delta / max * 100) + '%', hue = max === min ? 0 : (max === red ? (green - blue) / delta + (green < blue ? 6 : 0) : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4) * 60;
		return isReturnArray ? [hue, saturation, value] : 'hsv(' + hue + ',' + saturation + ',' + value + ')';
	};

	Color.prototype.toHSVA = function(isReturnArray) {
		var array = this.toHSV(true).concat(this.alpha);
		return isReturnArray ? array : 'hsva(' + array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3] + ')';
	};

	Color.prototype.toName = function() {
		for (var names = Color.names, keys = Object.keys(names), index = 0, length = keys.length; index < length; index++) {
			var key = keys[index];
			if (this.is(names[key]))
				return key;
		}
		return null;
	};

	Color.create = function(array) {
		return array ? new Color(array[0], array[1], array[2], array.length < 4 ? 1 : array[3]) : new Color(0, 0, 0, 0);
	};

	Color.parse = function(string) {

		if ( typeof string !== 'string')
			return null;

		if ((string = string.trim())[0] === '#') {

			switch(string.length) {
				case 4:
					string = string[1] + string[1] + string[2] + string[2] + string[3] + string[3];
					break;
				case 7:
					string = string.slice(1);
					break;
				default:
					return null;
			}

			var rgb = parseInt(string, 16);

			return new Color((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF, 1);
		}

		var type = string.match(/^[A-z]+/);

		if (type === null)
			return null;

		var index = ( type = type[0]).length;

		if (string[index] !== '(' || string[string.length - 1] !== ')')
			return null;

		var values = string.slice(index + 1, -1).split(',');

		if (type.length !== values.length)
			return null;

		if (type.length === 3) {
			type += 'a';
			values[3] = 1;
		}

		var valueOf = function(index, base) {
			var value = values[index];
			return isFinite(value) ? value * 1 : (value = (value + '').trim())[value.length - 1] == '%' ? value.slice(0, -1) / 100 * base : NaN;
		};

		if (type === 'rgba')
			return new Color(valueOf(0, 255), valueOf(1, 255), valueOf(2, 255), valueOf(3, 1));

		if (type === 'hsla') {

			var hue = valueOf(0, 360) / 360, saturation = valueOf(1, 1), lightness = valueOf(2, 1);

			var hueToRGB = function(hue) {

				if (isNaN(hue))
					return NaN;
				if (hue < 0)
					hue++;
				else if (hue >= 1)
					hue--;

				return luminocity1 + hue < 1 / 6 ? (luminocity2 - luminocity1) * 6 * hue : hue < .5 ? luminocity2 : hue < 2 / 3 ? (luminocity2 - luminocity1) * (2 / 3 - hue) * 6 : luminocity1;
			};

			var luminocity2 = (lightness <= .5 ? lightness * saturation : saturation - lightness * saturation) + lightness;

			var luminocity1 = lightness * 2 - luminocity2;

			return new Color(hueToRGB(hue + 1 / 3) * 255, hueToRGB(hue) * 255, hueToRGB(hue - 1 / 3) * 255, valueOf(3, 1));
		}

		return null;
	};

	Color.names = {
		transparent : new Color(0, 0, 0, 0),
		aliceblue : new Color(240, 248, 255),
		antiquewhite : new Color(250, 235, 215),
		aqua : new Color(0, 255, 255),
		aquamarine : new Color(127, 255, 212),
		azure : new Color(240, 255, 255),
		beige : new Color(245, 245, 220),
		bisque : new Color(255, 228, 196),
		black : new Color(0, 0, 0),
		blanchedalmond : new Color(255, 235, 205),
		blue : new Color(0, 0, 255),
		blueviolet : new Color(138, 43, 226),
		brown : new Color(165, 42, 42),
		burlywood : new Color(222, 184, 135),
		cadetblue : new Color(95, 158, 160),
		chartreuse : new Color(127, 255, 0),
		chocolate : new Color(210, 105, 30),
		coral : new Color(255, 127, 80),
		cornflowerblue : new Color(100, 149, 237),
		cornsilk : new Color(255, 248, 220),
		crimson : new Color(220, 20, 60),
		cyan : new Color(0, 255, 255),
		darkblue : new Color(0, 0, 139),
		darkcyan : new Color(0, 139, 139),
		darkgoldenrod : new Color(184, 134, 11),
		darkgray : new Color(169, 169, 169),
		darkgreen : new Color(0, 100, 0),
		darkgrey : new Color(169, 169, 169),
		darkkhaki : new Color(189, 183, 107),
		darkmagenta : new Color(139, 0, 139),
		darkolivegreen : new Color(85, 107, 47),
		darkorange : new Color(255, 140, 0),
		darkorchid : new Color(153, 50, 204),
		darkred : new Color(139, 0, 0),
		darksalmon : new Color(233, 150, 122),
		darkseagreen : new Color(143, 188, 143),
		darkslateblue : new Color(72, 61, 139),
		darkslategray : new Color(47, 79, 79),
		darkslategrey : new Color(47, 79, 79),
		darkturquoise : new Color(0, 206, 209),
		darkviolet : new Color(148, 0, 211),
		deeppink : new Color(255, 20, 147),
		deepskyblue : new Color(0, 191, 255),
		dimgray : new Color(105, 105, 105),
		dimgrey : new Color(105, 105, 105),
		dodgerblue : new Color(30, 144, 255),
		firebrick : new Color(178, 34, 34),
		floralwhite : new Color(255, 250, 240),
		forestgreen : new Color(34, 139, 34),
		fuchsia : new Color(255, 0, 255),
		gainsboro : new Color(220, 220, 220),
		ghostwhite : new Color(248, 248, 255),
		gold : new Color(255, 215, 0),
		goldenrod : new Color(218, 165, 32),
		gray : new Color(128, 128, 128),
		green : new Color(0, 128, 0),
		greenyellow : new Color(173, 255, 47),
		grey : new Color(128, 128, 128),
		honeydew : new Color(240, 255, 240),
		hotpink : new Color(255, 105, 180),
		indianred : new Color(205, 92, 92),
		indigo : new Color(75, 0, 130),
		ivory : new Color(255, 255, 240),
		khaki : new Color(240, 230, 140),
		lavender : new Color(230, 230, 250),
		lavenderblush : new Color(255, 240, 245),
		lawngreen : new Color(124, 252, 0),
		lemonchiffon : new Color(255, 250, 205),
		lightblue : new Color(173, 216, 230),
		lightcoral : new Color(240, 128, 128),
		lightcyan : new Color(224, 255, 255),
		lightgoldenrodyellow : new Color(250, 250, 210),
		lightgray : new Color(211, 211, 211),
		lightgreen : new Color(144, 238, 144),
		lightgrey : new Color(211, 211, 211),
		lightpink : new Color(255, 182, 193),
		lightsalmon : new Color(255, 160, 122),
		lightseagreen : new Color(32, 178, 170),
		lightskyblue : new Color(135, 206, 250),
		lightslategray : new Color(119, 136, 153),
		lightslategrey : new Color(119, 136, 153),
		lightsteelblue : new Color(176, 196, 222),
		lightyellow : new Color(255, 255, 224),
		lime : new Color(0, 255, 0),
		limegreen : new Color(50, 205, 50),
		linen : new Color(250, 240, 230),
		magenta : new Color(255, 0, 255),
		maroon : new Color(128, 0, 0),
		mediumaquamarine : new Color(102, 205, 170),
		mediumblue : new Color(0, 0, 205),
		mediumorchid : new Color(186, 85, 211),
		mediumpurple : new Color(147, 112, 219),
		mediumseagreen : new Color(60, 179, 113),
		mediumslateblue : new Color(123, 104, 238),
		mediumspringgreen : new Color(0, 250, 154),
		mediumturquoise : new Color(72, 209, 204),
		mediumvioletred : new Color(199, 21, 133),
		midnightblue : new Color(25, 25, 112),
		mintcream : new Color(245, 255, 250),
		mistyrose : new Color(255, 228, 225),
		moccasin : new Color(255, 228, 181),
		navajowhite : new Color(255, 222, 173),
		navy : new Color(0, 0, 128),
		oldlace : new Color(253, 245, 230),
		olive : new Color(128, 128, 0),
		olivedrab : new Color(107, 142, 35),
		orange : new Color(255, 165, 0),
		orangered : new Color(255, 69, 0),
		orchid : new Color(218, 112, 214),
		palegoldenrod : new Color(238, 232, 170),
		palegreen : new Color(152, 251, 152),
		paleturquoise : new Color(175, 238, 238),
		palevioletred : new Color(219, 112, 147),
		papayawhip : new Color(255, 239, 213),
		peachpuff : new Color(255, 218, 185),
		peru : new Color(205, 133, 63),
		pink : new Color(255, 192, 203),
		plum : new Color(221, 160, 221),
		powderblue : new Color(176, 224, 230),
		purple : new Color(128, 0, 128),
		red : new Color(255, 0, 0),
		rosybrown : new Color(188, 143, 143),
		royalblue : new Color(65, 105, 225),
		saddlebrown : new Color(139, 69, 19),
		salmon : new Color(250, 128, 114),
		sandybrown : new Color(244, 164, 96),
		seagreen : new Color(46, 139, 87),
		seashell : new Color(255, 245, 238),
		sienna : new Color(160, 82, 45),
		silver : new Color(192, 192, 192),
		skyblue : new Color(135, 206, 235),
		slateblue : new Color(106, 90, 205),
		slategray : new Color(112, 128, 144),
		slategrey : new Color(112, 128, 144),
		snow : new Color(255, 250, 250),
		springgreen : new Color(0, 255, 127),
		steelblue : new Color(70, 130, 180),
		tan : new Color(210, 180, 140),
		teal : new Color(0, 128, 128),
		thistle : new Color(216, 191, 216),
		tomato : new Color(255, 99, 71),
		turquoise : new Color(64, 224, 208),
		violet : new Color(238, 130, 238),
		wheat : new Color(245, 222, 179),
		white : new Color(255, 255, 255),
		whitesmoke : new Color(245, 245, 245),
		yellow : new Color(255, 255, 0),
		yellowgreen : new Color(154, 205, 50)
	};
		
	// Playground
	document.addEventListener('DOMContentLoaded', function() {

		new Animation(document, {}, function(p) {
			document.querySelector('div').innerHTML = p;
			document.querySelector('div').style.marginLeft = p * 100 + 'px';
		}, 2000, new BezierCurve(0, 0, 0, 1, 1, 0, 1, 1));

		console.log({
			BezierCurve : new BezierCurve(0, 0, 0, .63, .87, .19, 1, 1),
			Benchmark : new Benchmark().add(alert),
			Selector : new Selector('<div id="56"></div><br>'),
			Event : new Event(document),
			Dataset : new Dataset(document),
			Queue : new Queue(document),
			Inherit : new Inherit(document)
		});

		var g = new Graphics().appendTo(document.body).size(500, 500).add(function() {
			var context = this.context;
			context.beginPath();
			context.moveTo(0, 0);
			var c = new BezierCurve(0, 0, 0, .63, .87, .19, 1, 1);
			for (var i = 0; i < 100; i++) {
				var p = c.getAxes(i / 100);
				context.lineTo(p[0] * 100, p[1] * 100);
			}
			context.stroke();
		}).render();

		var type = 'rgb', co = Color.parse('rgb(154, 205, 50)');
		for (var c = 0, s = new Date; new Date - s < 0000; c++) {
			Color.parse('hsla(225,100%,39.21568627450981%,20%)');
		}
		console.log(c);

	});

})(window);
