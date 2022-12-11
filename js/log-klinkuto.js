(function() {
	// po zruseni stareho designu presun kod do is.js a odstran tento soubor

	function send_tracking_info(e, href) {
		var	data = $(this).attr('data-track').split(/:/),
			url = '/system/log_kliknuto',
			param = {
				w: data[0],
				s: data[1],
				u: href,
				p: data[2],
				h: data[3],
				a: '' // muze byt zmeneno par radku nize
			},
			fallback = false;

			if (e._return) { // nic nativniho, to tam strcim sam - znamena to, ze mackam Enter v naseptavaci
				param.a = 'e';
			} else if (e.button === 1 || e.ctrlKey) {
				param.a = 'm';
			}

		if (typeof navigator.sendBeacon === 'function' && typeof FormData === 'function') {
			var fd = new FormData;
			for (var k in param) {
				fd.append(k, param[k]);
			}
			try {
				fallback = ! navigator.sendBeacon(url, fd);
			} catch (e) {
				fallback = true;
			}
		} else {
			fallback = true;
		}

		if (fallback) {
			var qs = [];
			for (var k in param) {
				qs.push(k + '=' + encodeURIComponent(param[k]));
			}
			var img = new Image(1, 1);
			img.src = url + '?' + qs.join('&');
		}
	}

	if (typeof jQueryF === 'function' || typeof jQuery171 === 'function') {
		(function($) {
			$(document).ready(function() {
				$(document.body).on('click mouseup', 'a[data-track]', function(e) {
					var $t = $(e.target).closest('a');
					if (e.type !== 'mouseup' || e.button === 1) {
						send_tracking_info.call($t, e, $t.attr('href'));
					}
				});

				$('form[data-track]').on('submit', function(e) {
					send_tracking_info.call(this, e, $(this).attr('action'));
				});
			});
		})(window.jQueryF || window.jQuery171);
	}

	if (typeof is === 'function') {
		// zadefinujeme do globalniho is, abychom mohli volat send_tracking_info odjinud
		is.Define.module('WTracking', function(ns, $) {
			return {
				send: send_tracking_info
			};
		});
	}

})();
