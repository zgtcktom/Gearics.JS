(function(window, undefined) {
	/*
	 * Gearics.js
	 * => Author(s): Tom Chung
	 * => Version: 0.0.0 developing
	 * => Modified date: YYYY-MM-DD
	 * Copyright preserved
	 */

	('use strict');

	$.inherit = function(self) {
		if (this.constructor != $.inherit) {
			$.inherit.current.data = new $.inherit(self);
			return self;
		}
		this.self = Object(self);
		this.data = {};
		this.hasOwnListener = this.self.hasOwnProperty('addEventListener') ? true : false;
	};

	$.define($.inherit, {
		current : function() {
			var current = $.inherit.current, data = current.data;
			delete current.data;
			return data;
		},
		data : function(self, type) {
			var list = self.data[type] = self.data[type] || [];
			return list;
		},
		prototype : {
			constructor : $.inherit,
			on : function(type, func) {
				if (!this.hasOwnProperty(type))
					this[type] = function(props) {
						return self.dispatch(type, props);
					};
				if ( typeof func != 'function')
					return list;
				var self = this, list = $.inherit.data(this, type);
				list.push(func);
				if (this.hasOwnListener)
					this.self.addEventListener(type, func);
				return this;
			},
			off : function(type, func) {
				var self = this, list = $.inherit.data(this, type);
				if ( typeof func == 'function') {
					if (this.hasOwnListener)
						this.self.removeEventListener(type, func);
					list.splice(list.indexOf(func));
				} else if (this.hasOwnListener) {
					self = this.self;
					$.each(list, function(func) {
						self.removeEventListener(type, func);
					});
				}
				this.data[type] = [];
				return this;
			},
			dispatch : function(type, props) {
				for (var self = this.self, list = $.inherit.data(this, type), i = 0, len = list.length; i < len; list[i++].call(self, props));
				return this;
			}
		}
	});

	$.init = function() {
		var args = this.args = $.map(arguments), selector = args[0];
		if ( typeof selector == 'string')
			selector = args[0] = /^#/.test(selector) ? document.getElementById(selector.slice(1)) : document.querySelectorAll(selector);
		var type = this.type = selector.constructor == NodeList ? 'nodeList' : $.isElement(selector) ? 'element' : 'object';
		this.data = {};
		if (type == 'nodeList') {
			var self = this;
			this.length = selector.length;
			this.item = function(i) {
				return selector[i];
			};
			$.each(selector, function(i) {
				self[i] = new $.init($.define($.map(args), 0, this));
			});
		}
	};

	$.define($.init, {
		inherit : function(self, data) {
			if (!data)
				return false;
			$.each($.remove(Object.keys($.inherit.prototype), 'constructor').concat(self.data), function(key) {
				self[key] = function() {
					data[key].apply(data, arguments);
					return this;
				};
			});
		},
		core : {
			each : $.each,
			map : $.map,
			which : $.which,
			unique : $.unique
		},
		addMethod : function(key, func) {
			$.init.prototype[key] = function() {
				$.inherit.current();
				var self = this, inherited = $.map(this.args), args = $.map(arguments);
				if (this.type == 'nodeList') {
					var arr;
					$.each(inherited[0], function() {
						var result = func.apply(null, $.define($.map(inherited), 0, this).concat(args));
						if (result != $) {
							arr = arr || [];
							arr.push(result);
						}
					});
					return arr || this;
				}
				var result = func.apply(null, inherited.concat(args));
				console.log(this);
				$.init.inherit(this, $.inherit.current());
				return result == $ ? this : result;
			}
		},
		prototype : {
			constructor : $
		}
	});

	$.each($, function(func, key) {
		$.init.addMethod(key, func);
	}, true);

})(window);
