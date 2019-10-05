(function(window, undefined) {
	/*
	 * Gearics.js
	 * => Author(s): Tom Chung
	 * => Version: 0.0.0 developing
	 * => Modified date: YYYY-MM-DD
	 * Copyright preserved
	 */

	('use strict');

	$.inherit = $.define(function(self) {
		if (self != undefined) {
			var result = $.inherit.current = $.define(new $.inherit(), {
				self : self,
				data : {}
			});
			return result;
		}
		if ($.inherit.current) {
			var inherit = $.inherit.current;
			$.inherit.current = null;
			return inherit;
		}
		if (this.constructor != $.inherit)
			return false;
	}, {
		current : null,
		data : function(self, type) {
			var data = self.data[type] = self.data[type] || {
				list : [],
				props : {}
			};
			return data;
		},
		prototype : {
			constructor : $.inherit,
			on : function(type, func) {
				var data = $.inherit.data(this, type), list = data.list;
				if ( typeof func != 'function')
					return list;
				var self = this;
				list.push(func);
				if (!this.hasOwnProperty(type))
					this[type] = function() {
						return self.dispatch(type);
					};
				return this;
			},
			off : function(type, func) {
				var data = $.inherit.data(this, type), list = data.list;
				if ( typeof func == 'function')
					list.splice(list.indexOf(func));
				else
					data.list = [];
				return this;
			},
			dispatch : function(type, props) {
				for (var self = this.self, data = $.inherit.data(this, type), list = data.list, i = 0, len = list.length; i < len; list[i++].call(self, props));
				return this;
			}
		}
	});

	$.init = function() {
		var self = this, args = this.args = $.map(arguments), selector = args[0];
		if ( typeof selector == 'string')
			selector = args[0] = document[/^#/.test(selector) ? 'querySelector' : 'querySelectorAll'](selector);
		this.type = selector.constructor == NodeList ? 'nodeList' : $.isElement(selector) ? 'element' : 'object';
		this.data = {};
		if (this.type == 'nodeList') {
			this.length = selector.length;
			this.item = function(i) {
				return selector[i];
			};
			$.each(selector, function(i) {
				self[i] = $($.define($.map(args), 0, this));
			});
		}
	};

	$.define($.init, {
		core : {
			each : $.each,
			map : $.map,
			which : $.which,
			unique : $.unique
		},
		addMethod : function(key, func) {
			$.init.prototype[key] = function() {
				var inherited = $.map(this.args), args = $.map(arguments), self = this;
				if ($.init.core[key] || this.type != 'nodeList') {
					var result = func.apply(null, inherited.concat(args));
					var inherit = $.inherit();
					if (inherit)
						$.define(this, {
							on : inherit.on,
							off : inherit.off,
							dispatch : inherit.dispatch
						});
					return (inherit || result == $) ? this : result;
				}
				var arr;
				$.each(inherited[0], function() {
					var result = func.apply(null, $.define($.map(args), 0, this).concat(args));
					if (result != $) {
						arr = arr || [];
						arr.push(rsl);
					}
				});
				var inherit = $.inherit();
				if (inherit)
					$.define(this, {
						on : inherit.on,
						off : inherit.off,
						dispatch : inherit.dispatch
					});
				return inherit ? this : (arr || this);
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
