"use strict";

(function($, window){

	var timer		= null,
	    timer_delay		= 200,  // ms
	    timer_next_delay	= 3000, // ms
	    send_throttle	= 10,   // times
	    errors		= [],
	    allow_send_error	= false,
	    document_ready_time,
	    window_load_time;

	$(function(){
		document_ready_time = _time();
	});

	$(window).on('load', function(){
		window_load_time    = _time();
		allow_send();
	});

	function allow_send () {
		allow_send_error = true;
	}

	function send_error(message) {

		if (allow_send_error == null) {
			console.warn("Error.js: before send is allowed!");
			return;
		}

		if (send_throttle < 0) {
			return;
		}

		message += "\n(error time: "+_time()+")\n";

		errors.push(message);

		if (timer === null) {
			timer = setTimeout(function(){
				var additional_data = _error_additional_data();

				$.post('/js_error.pl', {
					msg:		errors.join("\n\n")+additional_data,
					sn:		_get_global('is.session.sn'),
					w_log_id:	_get_global('is.session.w_log_id'),
					title:		$('title').html(),
				});

				send_throttle--;
				errors.length = 0;
				timer = null;
			}, timer_delay);

			timer_delay = timer_next_delay;
		}
	}

	function _get_global(dot_selector) {

		if (!dot_selector) {
			return undefined;
		}

		var split = dot_selector.split('.');

		var tmp = window;
		for (var i = 0; i < split.length; ++i) {
			try {
				tmp = tmp[split[i]];
			} catch (e) {
				return undefined;
			}
		}

		return tmp;
	}

	function _time() {
		var d = new Date();
		return ("0" + d.getDate()).slice(-2) + ". " + ("0"+(d.getMonth()+1)).slice(-2) + ". " + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
	}

	function _error_additional_data() {

		var session = obj_to_str(_get_global('is.session'));
		var additional_data = obj_to_str({
			ready_time:	document_ready_time,
			load_time:	window_load_time,
			location:	location.href,
			ruzne_jquery:	jQueryF !== jQuery,
			user_agent:	navigator.userAgent,
			name:		$('#sticky_panel .jmeno').text(),
			Foundation:	window.Foundation,
			nav_type:	_get_global('performance.navigation.type'),
		});

		return "\n\n-----===== is.session =====-----\n\n"+session+"\n"+additional_data+"\n";

		function obj_to_str(obj) {
			return Object.keys(obj || {}).sort().map(function(i) {
				return i+": "+obj[i];
			}).join("\n");
		}
	}

	function _get_stack_trace(error, skip) {

		if (error) {
			var stack = (error.stack || '');
			return stack.split("\n").splice(skip ? skip : 0).join("\n");
		}
	}

	// toto zachyti vsetky chyby javascriptu, ktore vybublaju uplne hore a nechyti ich catch
	window.onerror = function(msg, url, line_num, column_num, error_obj) {

		var trace = _get_stack_trace(error_obj);

		if (trace) {
			send_error(msg+"\n"+trace);
		} else {

			var url_line_col = url;
			if (line_num) {
				url_line_col += ':'+line_num;
			}
			if (column_num) {
				url_line_col += ':'+column_num;
			}

			send_error(msg+"\n"+url_line_col);
		}
	};

	var expose = {
		send:	send_error,
		trace:	_get_stack_trace,
		allow_send: allow_send,
	};

	Object.defineProperty(window, '_is_error', {
		writable:       false, // zakaze assignment operator
		configurable:   true,
		enumerable:     true,
		value:		expose,
	});


})(window.jQueryF || jQuery, window);
