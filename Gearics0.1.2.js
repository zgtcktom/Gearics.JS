(function(window, undefined) {

	/*
	 * Gearics.js
	 * Copyright preserved
	 */

	('use strict');

	var Color = function(red, green, blue, alpha) {
		if ( typeof red === 'string') {
			var string = red.trim().toLowerCase();
			if (string[0] === '#') {
				var digits = string.slice(1), length = digits.length, values = length === 3 ? parseInt(digits[0] + digits[0] + digits[1] + digits[1] + digits[2] + digits[2] + 'ff', 16) : length === 4 ? parseInt(digits[0] + digits[0] + digits[1] + digits[1] + digits[2] + digits[2] + digits[3] + digits[3], 16) : length === 8 ? parseInt(digits, 16) : length === 6 ? parseInt(digits + 'ff', 16) : null;
				return values === null ? null : new Color(values >> 24 & 255, values >> 16 & 255, values >> 8 & 255, (values & 255) / 255);
			}
			var index = string.indexOf('('), toNumber = function(string, base) {
				return typeof string === 'string' && ( string = string.trim())[string.length - 1] === '%' ? string.slice(0, -1) / 100 * base : string * 1;
			};
			if (index !== -1 && string[string.length - 1] === ')') {
				var type = string.slice(0, index), string = string.slice(index + 1, -1);
				if (!string)
					return null;
				var values = string.split(','), length = values.length;
				switch(type) {
					case 'gray':
						if (length > 2)
							return null;
						var value = toNumber(values[0], 255);
						return new Color(value, value, value, length === 1 ? 1 : toNumber(values[1], 1));
					case 'device-cmyk':
						if (length === 4)
							var alpha = 1;
						else if (length === 5)
							var alpha = toNumber(values[4], 1);
						else
							return null;
						var black = toNumber(values[3], 1);
						return new Color(255 - Math.min(1, toNumber(values[0], 1) * (1 - black ) + black) * 255, 255 - Math.min(1, toNumber(values[1], 1) * (1 - black ) + black) * 255, 255 - Math.min(1, toNumber(values[2], 1) * (1 - black ) + black) * 255, alpha);
				}
				if (type.length !== length)
					return null;
				if (type === 'rgb' || type === 'hsl' || type === 'hsv' || type === 'hwb') {
					type += 'a';
					values[3] = 1;
				}
				switch(type) {
					case 'rgba':
						return new Color(toNumber(values[0], 255), toNumber(values[1], 255), toNumber(values[2], 255), toNumber(values[3], 1));
					case 'hsla':
						var hue = toNumber(values[0], 360) / 360, saturation = toNumber(values[1], 1), lightness = toNumber(values[2], 1), hueToRGB = function(hue) {
							if (isNaN(hue))
								return NaN;
							if (hue < 0)
								hue++;
							else if (hue >= 1)
								hue--;
							return luminocity1 + hue < 1 / 6 ? (luminocity2 - luminocity1) * 6 * hue : hue < .5 ? luminocity2 : hue < 2 / 3 ? (luminocity2 - luminocity1) * (2 / 3 - hue) * 6 : luminocity1;
						}, luminocity2 = (lightness <= .5 ? lightness * saturation : saturation - lightness * saturation) + lightness, luminocity1 = lightness * 2 - luminocity2;
						return new Color(hueToRGB(hue + 1 / 3) * 255, hueToRGB(hue) * 255, hueToRGB(hue - 1 / 3) * 255, toNumber(values[3], 1));
					case 'hsva':
						var hue = toNumber(values[0], 360) / 360, saturation = toNumber(values[1], 1), value = toNumber(values[2], 1), alpha = toNumber(values[3], 1), i = Math.floor(hue * 6), f = hue * 6 - i, p = value * (1 - saturation), q = value * (1 - f * saturation), t = value * (1 - (1 - f) * saturation);
						switch (i % 6) {
							case 0:
								return new Color(value * 255, t * 255, p * 255, alpha);
							case 1:
								return new Color(q * 255, value * 255, p * 255, alpha);
							case 2:
								return new Color(p * 255, value * 255, t * 255, alpha);
							case 3:
								return new Color(p * 255, g * 255, value * 255, alpha);
							case 4:
								return new Color(t * 255, p * 255, value * 255, alpha);
						}
						return new Color(value * 255, p * 255, q * 255, alpha);
					case 'hwba':
						var hue = toNumber(values[0], 360) / 60, whiteness = toNumber(values[1], 1), blackness = toNumber(values[2], 1), alpha = toNumber(values[3], 1), value = 1 - blackness;
						if (whiteness === blackness)
							return new Color(whiteness * 255, whiteness * 255, whiteness * 255, alpha);
						var i = Math.floor(hue), f = hue - i;
						if (i & 1)
							f = 1 - f;
						var n = whiteness + f * (value - whiteness);
						n *= 255;
						value *= 255;
						whiteness *= 255;
						switch (i) {
							case 0:
								return new Color(value, n, whiteness, alpha);
							case 1:
								return new Color(n, value, whiteness, alpha);
							case 2:
								return new Color(whiteness, value, n, alpha);
							case 3:
								return new Color(whiteness, n, value, alpha);
							case 4:
								return new Color(n, whiteness, value, alpha);
							case 5:
								return new Color(value, whiteness, n, alpha);
						}
				}
				return null;
			}
			var index = string.indexOf(' ');
			if (index === -1) {
				var array = namedColors[string];
				return new Color(array[0], array[1], array[2], array[3]);
			}
			var splash = string.slice(0, index), base = namedColors[string.slice(index + 1)];
			if (!base)
				return null;
			if (splash[splash.length - 1] === ')') {
				var index = splash.indexOf('ish(');
				if (index === -1)
					return null;
				var percentage = toNumber(splash.slice(index + 4, -1), 1), splash = splash.slice(0, index + 3);
			} else
				var percentage = splash.slice(-3) === 'ish' ? .25 : .5;
			splash = namedColors[splash];
			if (!splash)
				return null;
			var remaining = 1 - percentage;
			return new Color(splash[0] * percentage + base[0] * remaining, splash[1] * percentage + base[1] * remaining, splash[2] * percentage + base[2] * remaining, splash[3] * percentage + base[3] * remaining);
		}
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}, namedColors = {
		reddish : [255, 0, 0, 1],
		orangish : [255, 165, 0, 1],
		yellowish : [255, 255, 0, 1],
		greenish : [0, 255, 0, 1],
		bluish : [0, 0, 255, 1],
		purplish : [128, 0, 128, 1],
		transparent : [0, 0, 0, 0],
		aliceblue : [240, 248, 255, 1],
		antiquewhite : [250, 235, 215, 1],
		aqua : [0, 255, 255, 1],
		aquamarine : [127, 255, 212, 1],
		azure : [240, 255, 255, 1],
		beige : [245, 245, 220, 1],
		bisque : [255, 228, 196, 1],
		black : [0, 0, 0, 1],
		blanchedalmond : [255, 235, 205, 1],
		blue : [0, 0, 255, 1],
		blueviolet : [138, 43, 226, 1],
		brown : [165, 42, 42, 1],
		burlywood : [222, 184, 135, 1],
		cadetblue : [95, 158, 160, 1],
		chartreuse : [127, 255, 0, 1],
		chocolate : [210, 105, 30, 1],
		coral : [255, 127, 80, 1],
		cornflowerblue : [100, 149, 237, 1],
		cornsilk : [255, 248, 220, 1],
		crimson : [220, 20, 60, 1],
		cyan : [0, 255, 255, 1],
		darkblue : [0, 0, 139, 1],
		darkcyan : [0, 139, 139, 1],
		darkgoldenrod : [184, 134, 11, 1],
		darkgray : [169, 169, 169, 1],
		darkgreen : [0, 100, 0, 1],
		darkgrey : [169, 169, 169, 1],
		darkkhaki : [189, 183, 107, 1],
		darkmagenta : [139, 0, 139, 1],
		darkolivegreen : [85, 107, 47, 1],
		darkorange : [255, 140, 0, 1],
		darkorchid : [153, 50, 204, 1],
		darkred : [139, 0, 0, 1],
		darksalmon : [233, 150, 122, 1],
		darkseagreen : [143, 188, 143, 1],
		darkslateblue : [72, 61, 139, 1],
		darkslategray : [47, 79, 79, 1],
		darkslategrey : [47, 79, 79, 1],
		darkturquoise : [0, 206, 209, 1],
		darkviolet : [148, 0, 211, 1],
		deeppink : [255, 20, 147, 1],
		deepskyblue : [0, 191, 255, 1],
		dimgray : [105, 105, 105, 1],
		dimgrey : [105, 105, 105, 1],
		dodgerblue : [30, 144, 255, 1],
		firebrick : [178, 34, 34, 1],
		floralwhite : [255, 250, 240, 1],
		forestgreen : [34, 139, 34, 1],
		fuchsia : [255, 0, 255, 1],
		gainsboro : [220, 220, 220, 1],
		ghostwhite : [248, 248, 255, 1],
		gold : [255, 215, 0, 1],
		goldenrod : [218, 165, 32, 1],
		gray : [128, 128, 128, 1],
		green : [0, 128, 0, 1],
		greenyellow : [173, 255, 47, 1],
		grey : [128, 128, 128, 1],
		honeydew : [240, 255, 240, 1],
		hotpink : [255, 105, 180, 1],
		indianred : [205, 92, 92, 1],
		indigo : [75, 0, 130, 1],
		ivory : [255, 255, 240, 1],
		khaki : [240, 230, 140, 1],
		lavender : [230, 230, 250, 1],
		lavenderblush : [255, 240, 245, 1],
		lawngreen : [124, 252, 0, 1],
		lemonchiffon : [255, 250, 205, 1],
		lightblue : [173, 216, 230, 1],
		lightcoral : [240, 128, 128, 1],
		lightcyan : [224, 255, 255, 1],
		lightgoldenrodyellow : [250, 250, 210, 1],
		lightgray : [211, 211, 211, 1],
		lightgreen : [144, 238, 144, 1],
		lightgrey : [211, 211, 211, 1],
		lightpink : [255, 182, 193, 1],
		lightsalmon : [255, 160, 122, 1],
		lightseagreen : [32, 178, 170, 1],
		lightskyblue : [135, 206, 250, 1],
		lightslategray : [119, 136, 153, 1],
		lightslategrey : [119, 136, 153, 1],
		lightsteelblue : [176, 196, 222, 1],
		lightyellow : [255, 255, 224, 1],
		lime : [0, 255, 0, 1],
		limegreen : [50, 205, 50, 1],
		linen : [250, 240, 230, 1],
		magenta : [255, 0, 255, 1],
		maroon : [128, 0, 0, 1],
		mediumaquamarine : [102, 205, 170, 1],
		mediumblue : [0, 0, 205, 1],
		mediumorchid : [186, 85, 211, 1],
		mediumpurple : [147, 112, 219, 1],
		mediumseagreen : [60, 179, 113, 1],
		mediumslateblue : [123, 104, 238, 1],
		mediumspringgreen : [0, 250, 154, 1],
		mediumturquoise : [72, 209, 204, 1],
		mediumvioletred : [199, 21, 133, 1],
		midnightblue : [25, 25, 112, 1],
		mintcream : [245, 255, 250, 1],
		mistyrose : [255, 228, 225, 1],
		moccasin : [255, 228, 181, 1],
		navajowhite : [255, 222, 173, 1],
		navy : [0, 0, 128, 1],
		oldlace : [253, 245, 230, 1],
		olive : [128, 128, 0, 1],
		olivedrab : [107, 142, 35, 1],
		orange : [255, 165, 0, 1],
		orangered : [255, 69, 0, 1],
		orchid : [218, 112, 214, 1],
		palegoldenrod : [238, 232, 170, 1],
		palegreen : [152, 251, 152, 1],
		paleturquoise : [175, 238, 238, 1],
		palevioletred : [219, 112, 147, 1],
		papayawhip : [255, 239, 213, 1],
		peachpuff : [255, 218, 185, 1],
		peru : [205, 133, 63, 1],
		pink : [255, 192, 203, 1],
		plum : [221, 160, 221, 1],
		powderblue : [176, 224, 230, 1],
		purple : [128, 0, 128, 1],
		red : [255, 0, 0, 1],
		rosybrown : [188, 143, 143, 1],
		royalblue : [65, 105, 225, 1],
		saddlebrown : [139, 69, 19, 1],
		salmon : [250, 128, 114, 1],
		sandybrown : [244, 164, 96, 1],
		seagreen : [46, 139, 87, 1],
		seashell : [255, 245, 238, 1],
		sienna : [160, 82, 45, 1],
		silver : [192, 192, 192, 1],
		skyblue : [135, 206, 235, 1],
		slateblue : [106, 90, 205, 1],
		slategray : [112, 128, 144, 1],
		slategrey : [112, 128, 144, 1],
		snow : [255, 250, 250, 1],
		springgreen : [0, 255, 127, 1],
		steelblue : [70, 130, 180, 1],
		tan : [210, 180, 140, 1],
		teal : [0, 128, 128, 1],
		thistle : [216, 191, 216, 1],
		tomato : [255, 99, 71, 1],
		turquoise : [64, 224, 208, 1],
		violet : [238, 130, 238, 1],
		wheat : [245, 222, 179, 1],
		white : [255, 255, 255, 1],
		whitesmoke : [245, 245, 245, 1],
		yellow : [255, 255, 0, 1],
		yellowgreen : [154, 205, 50, 1]
	};

	Color.prototype.normalize = function() {
		var round = function(value, isAlpha) {
			return typeof value !== 'number' || value < 0 ? 0 : isAlpha ? value > 1 ? 1 : value : value > 255 ? 255 : Math.round(value);
		};
		this.red = round(this.red);
		this.green = round(this.green);
		this.blue = round(this.blue);
		this.alpha = round(this.alpha, true);
		return this;
	};

	Color.prototype.clone = function() {
		return new Color(this.red, this.green, this.blue, this.alpha);
	};

	Color.prototype.is = function(color) {
		return color && this.red === color.red && this.green === color.green && this.blue === color.blue && this.alpha === color.alpha;
	};

	Color.prototype.toRGB = function(isReturnArray) {
		var red = this.red, green = this.green, blue = this.blue;
		return isReturnArray ? [red, green, blue] : 'rgb(' + red + ',' + green + ',' + blue + ')';
	};

	Color.prototype.toRGBA = function(isReturnArray) {
		var array = this.toRGB(true), alpha = this.alpha;
		return isReturnArray ? [array[0], array[1], array[2], alpha] : 'rgba(' + array[0] + ',' + array[1] + ',' + array[2] + ',' + alpha + ')';
	};

	Color.prototype.toHSL = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, max = Math.max(red, green, blue), min = Math.min(red, green, blue), hue, saturation, lightness = (max + min) / 2;
		if (max === min)
			hue = saturation = 0;
		else
			var delta = max - min, saturation = delta / (lightness > .5 ? 2 - max - min : max + min), hue = (max === red ? (green - blue) / delta + (green < blue ? 6 : 0) : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4) / 6;
		hue *= 360;
		return isReturnArray ? [hue, saturation, lightness] : 'hsl(' + hue + ',' + saturation * 100 + '%,' + lightness * 100 + '%)';
	};

	Color.prototype.toHSLA = function(isReturnArray) {
		var array = this.toHSL(true), alpha = this.alpha;
		return isReturnArray ? [array[0], array[1], array[2], alpha] : 'hsla(' + array[0] + ',' + array[1] * 100 + '%,' + array[2] * 100 + '%,' + alpha + ')';
	};

	Color.prototype.toHSV = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, max = Math.max(red, green, blue), min = Math.min(red, green, blue);
		if (max === min)
			return new Color(0, 0, min);
		var delta = (red === min) ? green - blue : (blue == min ? red - green : blue - red), hue = 60 * ((red === min ? 3 : blue === min ? 1 : 5) - delta / (max - min)), saturation = (max - min) / max, value = max;
		return isReturnArray ? [hue, saturation, value] : 'hsv(' + hue + ',' + saturation * 100 + '%,' + value * 100 + '%)';
	};

	Color.prototype.toHSVA = function(isReturnArray) {
		var array = this.toHSV(true), alpha = this.alpha;
		return isReturnArray ? [array[0], array[1], array[2], alpha] : 'hsva(' + array[0] + ',' + array[1] * 100 + '%,' + array[2] * 100 + '%,' + alpha + ')';
	};

	Color.prototype.toHWB = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, max = Math.max(red, green, blue), min = Math.min(red, green, blue), blackness = 1 - max, hue = min === max ? 0 : ((red === min ? 3 : green == min ? 5 : 1) - (red === min ? green - blue : green === min ? blue - red : red - green) / (max - min)) * 60;
		return isReturnArray ? [hue, min, blackness] : 'hwb(' + hue + ',' + min * 100 + '%,' + blackness * 100 + '%)';
	};

	Color.prototype.toHWBA = function(isReturnArray) {
		var array = this.toHWB(true), alpha = this.alpha;
		return isReturnArray ? [array[0], array[1], array[2], alpha] : 'hwba(' + array[0] + ',' + array[1] * 100 + '%,' + array[2] * 100 + '%,' + alpha + ')';
	};

	Color.prototype.toHex = function(hasAlpha) {
		var RGBtoHex = function(value) {
			return ( value = Math.round(value).toString(16)).length > 1 ? value : 0 + value;
		}, string = '#' + RGBtoHex(this.red) + RGBtoHex(this.green) + RGBtoHex(this.blue);
		if (hasAlpha)
			string += RGBtoHex(this.alpha * 255);
		return string;
	};

	Color.prototype.toDeviceCmyk = function(isReturnArray) {
		var red = this.red / 255, green = this.green / 255, blue = this.blue / 255, alpha = this.alpha, black = Math.min(1 - red, 1 - green, 1 - blue), cyan = (1 - red - black) / (1 - black), magenta = (1 - green - black) / (1 - black), yellow = (1 - blue - black) / (1 - black);
		return isReturnArray ? [cyan, magenta, yellow, black, alpha] : 'device-cmyk(' + cyan * 100 + '%,' + magenta * 100 + '%,' + yellow * 100 + '%,' + black * 100 + '%,' + alpha + ')';
	};

	Color.prototype.invert = function() {
		this.red = 255 - this.red;
		this.green = 255 - this.green;
		this.blue = 255 - this.blue;
		return this;
	};

	Color.prototype.grayscale = function() {
		this.red *= .2126;
		this.green *= .7152;
		this.blue *= .0722;
		return this;
	};

	Color.prototype.brighten = function(value) {
		this.red += value;
		this.green += value;
		this.blue += value;
		return this;
	};

	Color.prototype.threshold = function(value) {
		this.red = this.green = this.blue = .2126 * this.red + .7152 * this.green + .0722 * this.blue >= value ? 255 : 0;
		return this;
	};

	Color.prototype.saturate = function(value) {
		var red = this.red, green = this.green, blue = this.blue, brightness = Math.sqrt(red * red * .299 + green * green * .587 + blue * blue * .114);
		this.red = brightness + (red - brightness) * ++value;
		this.green = brightness + (green - brightness) * value;
		this.blue = brightness + (blue - brightness) * value;
		return this;
	};

	Color.prototype.opacity = function(value) {
		this.alpha += value;
		return this;
	};

	(function() {
		console.log(new Color(255, 100, 0, 1).saturate(-1).opacity(-.5));
		console.log(Color('hwb(60,40%,20%)'));

		window.addEventListener('load', function() {
			var color = Color('red blue');
			for (var c = 0, s = new Date; new Date - s < 1000; c++) {
				color.toHSLA();
			}
			console.log(c);
			for (var c = 0, s = new Date; new Date - s < 1000; c++) {
				Color('#abcf');
			}
			console.log(c);
			for (var c = 0, s = new Date; new Date - s < 1000; c++) {
				Color('#aabbccff');
			}
			console.log(c);
			for (var c = 0, s = new Date; new Date - s < 1000; c++) {
				Color('#aabbcc');
			}
			console.log(c);
			for (var c = 0, s = new Date; new Date - s < 1000; c++) {
				Color('#abc');
			}
			console.log(c);
		});
	})();

})(window);
