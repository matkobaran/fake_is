/*
 * Rozsireni knihovny is.js o funkce spojene s e-learningem.
 * Moduly a tridy by mely zacinat na 'El'.

is.Define.module('El<nazev>', function (namespace, $) {
	return {
		init: function (opt) {

		},
	};
});

 **/

"use strict";

is.Define.module('El', function (namespace, $) {
	var module = {};

	$.each({

		/* Vybere modální okno k uzamčení a appendne uzamčení k modálnímu oknu, následně otevře m. okno.
		 * Uzamčení je hláška zobrazující v případě, že dotyčný chce paralerně otevřít další průchod.
		 *
		 * is.El.uzamknout_modal({
		 * 	text_elm: 'selector' || $() || DOMelm,	// obsah pro vlozeni do modalniho okna
		 * 	modal: { ... },				// parametry pro is.Reveal.create();
		 * });
		 */
		uzamknout_modal: function (opt) {
			var $text, modal;

			opt = opt || {};
			modal = opt.modal || {};

			$text = $(opt.text_elm);
			if (!$text.length) {
				console.error('Nebyl nalezen obsah upozorneni.', opt);
				return;
			}

			modal.open = true;
			is.Reveal.create($text, modal);

			return;
		},

		/* Umozni spustit is.Zdurazneni se zpozdenim.
		 *
		 * is.El.zdurazneni(delay, typ, html, opt);
		 *
		 * 	delay		- opozdeni zobrazeni chybove hlasky
		 * 	typ, html, opt	- standardni argumenty is.Zdurazneni
		 */
		zdurazneni: function () {
			var args = [].slice.call(arguments);
			var delay = args.shift();

			setTimeout(function () {
				is.Zdurazneni.zdurazneni.apply(is.Zdurazneni, args);
			}, delay);
		},

		/**
		 * Vytvori inputy typu hidden a vrati je v poli, ktere je mozne pomoci
		 * jQuery method vlozit do stranky (append, after ...).
		 *
		 * 	// hash
		 *	var inputs = is.El.$hidden_inputs({
		 *		name: 'value',
		 *		...
		 *	}, 'cover_class');
		 *
		 * 	// vysledek z $.fn.serializeArray
		 *	var inputs = is.El.$hidden_inputs([
		 *		{ name: '...', value: '...' },
		 *		...
		 *	], 'cover_class');
		 *
		 *	$form.append(inputs);
		 *
		 **/
		$hidden_inputs: function (name_value, div_class) {
			var inputs = [];
			var name_value_array;

			if (name_value == null) {
				return;
			}

			if ($.isPlainObject(name_value)) {
				name_value_array = [];
				$.each(name_value, function (name, value) {
					name_value_array.push({
						name	: name,
						value	: value,
					});
				});
			} else if ($.isArray(name_value)) {
				name_value_array = name_value;
			} else {
				console.error('Chybny typ argumentu "name_value".', name_value);
				return;
			}

			$.each(name_value_array, function (i, hash) {
				inputs.push($('<input>').attr({
					type: 'hidden',
					name: hash.name,
					value: hash.value,
				}));
			});

			return $('<div>')
					.addClass('hide ' + (div_class || ''))
					.append(inputs);
		},

		/**
		 * Zinicializuje tlacitka, ktera umozni expandovat zobrazeni v rezimu 'skladani' nebo 'prohlidky'.
		 */
		init_expand: function (opt) {
			var user_interacted;
			var $odpo_expand_toggle = $('.odpo_expand_toggle');
			var $odpo_otazka_telo = $('.odpo_otazka_telo');
			var $content = $('#content');

			if (opt.expand) {
				$odpo_expand_toggle.removeClass('hide');
				_expand_toggle();
			}

			$(window)
				.off('.'+namespace)
				// kontrola jestli neni potreba zobrazit expandovaci talcitko
				.on('resize.'+namespace, function () {
					if (!opt.expand || user_interacted) {
						$odpo_expand_toggle.toggleClass('hide', !$content.is('.odpo_is_expanded') && !$odpo_otazka_telo.overflown().length);
					}
				});

			$odpo_expand_toggle
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					user_interacted = true;
					_expand_toggle();
				});
		},

		/**
		 *	Umoznuje podbarvit vybranou otazku v seznamu duplicitnich otazek.
		 */
		init_one_dupl: function (opt) {
			var $cover = $(opt.cover_elm);
			var data_radio_cover_list_label = namespace+'DuplRadioCoverList';
			var data_radio_cover_label = namespace+'DuplRadioCover';

			$cover
				.off('.'+namespace)
				.on('change.'+namespace, ':radio', function () {
					var $radio = $(this);
					var name = $radio.attr('name');
					var $all_radio_with_same_name_covers, $all_radio_with_same_name;

					if (!$radio.data(data_radio_cover_list_label)) {
						$all_radio_with_same_name = $cover.find('[name="' + name + '"]');
						$all_radio_with_same_name_covers = $all_radio_with_same_name.closest('.odpo_dupl_question_cover');
						$all_radio_with_same_name.each(function () {
							var $input = $(this);
							var $cover = $input.closest('.odpo_dupl_question_cover');
							$input.data(data_radio_cover_list_label, $all_radio_with_same_name_covers);
							$input.data(data_radio_cover_label, $cover);
						});
					}

					$radio.data(data_radio_cover_list_label).removeClass('odpo_dupl_question_selected');
					$radio.data(data_radio_cover_label).addClass('odpo_dupl_question_selected');
				});
		},

		// umozni vytvorit/prepsat validator s regexp zapisem
		set_validator_regexp: function (opt) {
			is.Forms.set_validator(opt.name, (opt.error_msg || 'error_msg'), new RegExp(opt.regexp));
		},

	}, function (key, value) {
		Object.defineProperty(module, key, {
			value:		value,
			writable:       false,
			configurable:   false,
			enumerable:     true,
		});
	});

	// zmeni stav expandovani stranky
	function _expand_toggle () {
		var $content = $('#content');
		var expand = !$content.is('.odpo_is_expanded');
		var $odpo_panel_levypruh_horni_container = $('#odpo_panel_levypruh_horni_container');
		var levypruh_height_before = expand ? 0 : $odpo_panel_levypruh_horni_container.height();

		$content.toggleClass('odpo_is_expanded');
		$('#odpo_panel_levypruh_container, #odpo_panel_levypruh_header, .preview_levy_pruh, #preview_levy_pruh_header').toggleClass('hide-for-small-only show-for-large');
		$('#odpo_panel_levypruh_horni_container, #odpo_sticky_panel, .odpo_content_buttons, #preview_levy_pruh_horni_header').toggleClass('show-for-small-only hide-for-large');
		is.NavMenu.toggle(true);

		if (Foundation.MediaQuery.is('medium only')) {
			// odectu nebo prictu vysku leveho pruhu,
			// ktery se stehuje na medium nahoru nad parametry odpovedniku
			$(window).scrollTop(
				$(window).scrollTop()
				- levypruh_height_before
				+ (expand ? $odpo_panel_levypruh_horni_container.height() : 0)
			);
		}

		$(window)
			.resize()
			.scroll();

		$('.odpo_expand_toggle').text(is.ldb.get(expand ? 'isEl_expand_compress' : 'isEl_expand_expand'))
	}

	return module;
});

is.Define.module('ElObtiznost', function (namespace, $) {

	return {
		init: function () {
			// TODO oddelat hack, az bude mozne seznam bloku
			// zobrazit v modalnim okne pres ajax
			$('#bloky').closest('form').children('input').last()
				.after(
					$('.obtiznost_bloky_zpet_spodni')
						.filter('.hide')
						.removeClass('hide')
				);

			// prepocita velikost 'vice_mene' v otazce
			$(window.document)
				.off('.'+namespace)
				.on('down.zf.accordion.'+namespace, '.obtiznost_otazky', function () {
					is.ViceMene.reflow();
				})
				.on('click.'+namespace, '.'+namespace+'_send_all_button', function (evt) {
					var $reveal = $(this).closest('.reveal');
					evt.preventDefault();

					if (!is.PbEditObsahUco || !$reveal.find('form').length) {
						is.Zdurazneni.chyba('Není co odeslat. Nejdříve je potřeba vyplnit hodnocení.');
					} else {
						is.PbEditObsahUco.send_all_forms($reveal);
					}
				});
		},

		init_hide_instruction: function () {
			$('#app_content')
				.off('.'+namespace+'_ihi')
				.on('click.'+namespace+'_ihi', '.button_show_instructions, .button_hide_instructions', function (evt) {
					$(evt.target).closest('.cover_hide_instructions').toggleClass('hide_instructions');
				});
		},
	};
});


/**
 * Obsahuje inicializace pro odpovednik.
 */
is.Define.module('ElOdpovednik', function (namespace, $) {
	var module = {};

	$.each({

		/**
		 * Provede inicializaci aktivnich prvku ve fromulari odpovedniku.
		 *
		 *	is.ElOdpovednik.init({
		 *		form_elm: '#id' || form || $(form),	// formular odpovedniku
		 *		question_cover_class: '.nazev_tridy',	// obal, ktery obsahuje jednu otazku
		 *		sticky_panel_elm:  '#id' || form || $(form),	// odpovednikovy sticky panel, ktery nahrazuje systemovy
		 *		questions_cover_elm:  '#id' || form || $(form),	// obal obsahujici vsechny otazky
		 *	});
		 */
		init: function (opt) {
			var $form = $(opt.form_elm);
			var abide, $main, scroll_shift, monitoring_id;

			if (!$form.length) {
				console.error('Formular odpovedniku nenalezen.');
				return;
			}

			// inicializace pocitadel
			$form.find('.el-pocitadlo').each(function () {
				var $content = $(this);

				new is.ElPocitadlo({
					input_elm: $content.is('.html-editor') ? $content.data('isHtmlEditor').$textarea : $content,
					info_elm: $content.closest(opt.question_cover_class).find($content.data('el-pocitadlo-info-elm')),
					unit: $content.data('el-pocitadlo-unit'),
					limit_block: $content.data('el-pocitadlo-limit-block'),
					limit_warn: $content.data('el-pocitadlo-limit-warn'),
					remove_tags: $content.is('.html-editor') || $content.data('el-pocitadlo-remove-tags'),
				});
			});

			// zruseni validace pri odeslani formulare
			abide = is.Foundation.get_plugin($form, Foundation.Abide);
			if (abide) {
				abide.$element.off('submit.zf.abide');
			}

			// Ochrana proti padum foundation validation u inputu, ktere nejsou generovane na serveru.
			// Je potreba az v document.ready aby se nasly i ty dogenerovane pomoci JS.
			$(function () {
				// vsechny inputy v 'instructions'
				$('.odpo_otazka_text_')
					.find(':input')
						.attr('data-abide-ignore', '');

				// vsechny inputy v otazce, ktere se neposilaji na server (nemaji 'name')
				$('.odpo_otazka_')
					.find(':input')
					.not('[name]')
						.attr('data-abide-ignore', '');
			});

			// Zobrazi a skryje modalni okno aby proslo renderovanim a spravne se nastavil font nadpisu.
			// Delalo hlavne problem u 'modal_submit', ktere se poprve zobrazuje az tesne pred vyvolanim POST.
			$('.reveal').each(function () {
				var $modal = $(this);
				var $cover = $modal.parent();

				$cover.addClass('invisible');
				$modal.foundation('open').foundation('close');
				$cover.removeClass('invisible');
			});

			if (opt.window_scroll) {
				if (opt.window_scroll === 'main') {
					$main = $('main');
					if ($main.length) {
						scroll_shift = $main.offset().top
					} else {
						console.error('Na strance chybi tag "main".');
					}
				} else {
					scroll_shift = opt.window_scroll
				}

				scroll_shift -= $(opt.sticky_panel_elm).filter(':visible').height() || 0;
				if (scroll_shift) {
					$(window).scrollTop(scroll_shift);
				}
			}

			if (opt.monitoring) {
				if (opt.monitoring.ref_line_elm == null) {
					opt.monitoring.ref_line_elm = $('#odpo_app_main_content');
				}

				monitoring_id = is.ElMonitoring.init_one(opt.monitoring);
			}

			$form.off('.'+namespace)
				// aktualizuje pocet otazek, ktere je jeste potreba vyplnit
				.on('change.'+namespace+' input.'+namespace, '.odpo_otazka_telo :input', function (evt) {
					var $zbyvajici, $inputs, are_filled, has_been_filled, $input_test_sklad, title;
					var $telo = $(this).closest('.odpo_otazka_telo');
					var $otazka = $telo.closest('.odpo_otazka_');
					var data_inputs_namespace = namespace+'_inputs';
					var data_zbyvajici_namespace = namespace+'_inputs';

					$zbyvajici = $form.data(data_zbyvajici_namespace);
					if (!$zbyvajici) {
						$zbyvajici = $('.odpo_panel_levypruh_bodovani_zbyvajici').filter(function () {
							var $closest_form = $(this).closest('form');
							return $closest_form && $closest_form[0] === $form[0];
						});
						$form.data(data_zbyvajici_namespace, $zbyvajici);
					}

					if (!$zbyvajici.length) {
						return;
					}

					$inputs = $telo.data(data_inputs_namespace);
					if (!$inputs) {
						$inputs = $telo.find(':input');
						$input_test_sklad = $inputs.filter('[name="test_sklad"]').first();
						$inputs = $inputs.filter('[name^="' + $input_test_sklad.val() + '"]');
						$telo.data(data_inputs_namespace, $inputs);
					}

					if (!$inputs.length) {
						return;
					}

					are_filled = $inputs.is(function () {
						var $input = $(this);
						return (
							// je neco vyplneno
							!!is.Forms.get_input_val($input).length
							&& (
								// neni select => vyplneno znamena nejakou hodnotu
								!$input.is('select')
								// je select => overi se jestli ta hodnota neni prazdny string
								|| $.trim($input.find('option:selected').text()) !== ''
							)
						);
					});
					has_been_filled = !$otazka.hasClass('unfilled');
					if (has_been_filled !== are_filled) {
						$otazka.toggleClass('unfilled', !are_filled);
						$zbyvajici.each(function () {
							var $self = $(this);
							var actual = +$self.text();

							$self.text(actual + (are_filled ? -1 : 1));
						});
					}
				})
				// potlaceni defaultni akce tlacika, pokud ma na sobe akci, ktera se projevi pouze pri zaplem JS
				.on('click.'+namespace, '[type="submit"]', function (evt) {
					var $button = $(this);
					var hiddens = {};

					// odeslat bez kontroly spojeni
					if ($button.is('.do-not-check-connection')) {
						return;
					}

					evt.preventDefault();

					// otevre modalni okno s jinym tlacitkem submit
					if ($button.data('open')) {
						return;
					}

					hiddens.window_scroll = $(window).scrollTop();
					hiddens[$button.attr('name')] = $button.attr('value');
					_check_connection_before_submit($form, hiddens);
				})
				// pred odeslanim zobrazit modal aby uzivatel nemohl menit odpovedi
				.on('submit.'+namespace, function (evt) {
					var monitoring_serialize;
					var $modal_submit = $('#odpo_modal_submit');
					var $modal_submit_close = $modal_submit.find('.close-button').addClass('hide');
					var add_hiddens = {
						odpo_is_expanded: ($('#content').is('.odpo_is_expanded') || '')
					};

					if (monitoring_id != null) {
						monitoring_serialize = is.ElMonitoring.serialize_one(monitoring_id) || '';
						if (monitoring_serialize !== '') {
							add_hiddens.monitoring = monitoring_serialize;
						}
					}

					if ($form.data('isElAutoSubmit')) {
						add_hiddens.seconds_used = _get_seconds_used_for_request($form);
					}

					$form.append(is.El.$hidden_inputs(add_hiddens, 'odpo_hiddens_temp'));

					$modal_submit.foundation('open');
					setTimeout(function () {
						// po nejake dobe ukaze tlacitko pro zavreni modalniho okna
						// aby bylo mozne cist v odpovedniku, pokud se odeslani nepodari
						$modal_submit_close.removeClass('hide');
					}, 15 * 1000);
				});

			is.ElOdpovednik.init_auto_save($form, opt.page_number);

			_kontrola_struktury_otazek($form);
		},

		/**
		 * Nastavi na formualri odpovedniku automaticke prubezne ukladani.
		 *
		 * 	is.ElOdpovednik.init_auto_save($form, page_nubmer);
		 *
		 */
		init_auto_save: function ($form, page_number) {
			var data_soucasneho_requestu = {};
			var ajax_prubezne_ulozit, data_prubezne_ulozit;

			$form = $($form);
			if (!$form.length) {
				console.error('Formular odpovedniku nenalezen.');
				return;
			}

			$form.storeSerialize();
			if (page_number == null || isNaN(+page_number)) {
				console.error('Průběžně uložit nelze provést přes ajax. Chybí důležiý parametr page_number.', page_number);
				return;
			}

			data_prubezne_ulozit = {};
			data_prubezne_ulozit['autosubmit'] = true;
			data_prubezne_ulozit['operace'] = 'prubezne_ulozit';
			data_prubezne_ulozit['uloz_str_' + page_number] = true;

			// automaticke zalohovani odpovedi
			ajax_prubezne_ulozit = new is.Ajax({
				no_fail_msg: true,
				url: (is('session.auth') || '') + '/elearning/test_ajax',
				data: data_prubezne_ulozit,
				success: function (data) {
					var result = data.result || {};

					if (result.potvrzeni) {
						is.Zdurazneni.potvrzeni(result.potvrzeni, { fade_out: true });
						$form.storeSerialize();
						if (data_soucasneho_requestu.seconds_used) {
							_add_seconds_used_from_successful_request($form, data_soucasneho_requestu.seconds_used);
						}
					} else if (result.chyba) {
						if (data.show) {
							is.Zdurazneni.chyba(result.chyba);
						}
					}
				},
				error: function () {
					var hiddens = {};
					hiddens.window_scroll = $(window).scrollTop();
					hiddens['uloz_str_' + page_number] = true;
					$form.find('.odpo_hiddens_temp').remove();
					$form.append(is.El.$hidden_inputs(hiddens, 'odpo_hiddens_temp'));

					_error_connection_evt.apply(this, arguments);
				}
			});

			setInterval(function () {
				data_soucasneho_requestu = {};

				if ($form.data(namespace + 'AutoSaveActive') === false) {
					return;
				}

				if (!$form.hasSerializeChanged().length) {
					return;
				}

				if ($form.data('isElAutoSubmit')) {
					data_soucasneho_requestu.seconds_used = _get_seconds_used_for_request($form);
				}

				ajax_prubezne_ulozit.send_form($form, data_soucasneho_requestu)
				.fail(function () {
					$('#odpo_modal_error_submit')
						.find('.odpo_error_msg_cover_auto')
							.removeClass('hide');
				});
			}, (10 * 60 + Math.floor(Math.random() * 120)) * 1000); 	// 10-12 min (dle zkusenosti median=15 a prumer=10)


			// TODO odpr6 ukladat vyserializovany odpovednik do cache prohlizece https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
			// 		function(mod){try{localStorage.setItem(mod,mod);localStorage.removeItem(mod);return true;}catch(e){return false;}}
		},

		/**
		 * Povoli nebo zakaze provadeni automatickeho prubezneho ukladani.
		 *
		 * 	is.ElOdpovednik.set_auto_save_active($form, active);
		 *
		 */
		set_auto_save_active: function ($form, active) {
			$form = $($form);
			if (!$form.length) {
				console.error('Formular odpovedniku nenalezen.');
				return;
			}

			$form.data(namespace + 'AutoSaveActive', !!active);
		},

		/*
		 * Inicializuje jeden odkaz v liste strankovani
		 *
		 * 	is.ElOdpovednik.init_strankovani_odkaz({
		 * 		elm: '#id' || elm || $(elm)		// odkaz
		 * 		form_elm: '#id' || form || $(form)	// formular, ktery se po kliknuti na odkaz ma odeslat
		 *		cgiparhidden: {				// seznam parametru, ktere se maji pridat do formulare pred odeslanim
		 *			key: 'value',
		 *		},
		 *	});
		 */
		init_strankovani_odkaz: function (opt) {
			var $elm = $(opt.elm);
			var $form = $(opt.form_elm);
			var ns_strankovani = namespace + '_strankovani_odkaz';

			if (!$elm || !$form.length) {
				console.error('Formular odpovedniku nebo tlacitko strankovani nenalezeno.', $elm, $elm.length, $form, $form.length, opt);
				return;
			}

			$elm
				.off('.'+ns_strankovani)
				.on('click.'+ns_strankovani, function () {
					_check_connection_before_submit($form, opt.cgiparhidden);
				});
		},

		/**
		 * Zajisit, aby byl uzivatel upozornen, pokud odchazi ze stranky a nema ulozena data.
		 *
		 * 	is.ElOdpovednik.init_unload({
		 * 		form_elm: selector || DOM elm || $(),		# identifikator formu
		 * 		message: '...',					# neprazdna zprava
		 * 	});
		 **/
		init_unload: function (opt) {
			var $form = $(opt.form_elm);
			var ns_unload = namespace + '_unload';
			var odeslano = false;

			if (!$form.length || !opt.message) {
				console.error('Formular odpovedniku nenalezen nebo zprava je prazdna.', $form.length, opt);
				return;
			}

			$form
				.off('.'+ns_unload)
				.on('submit.'+ns_unload, function () {
					odeslano = true;
				});

			is.Design.add_unload(function () {
				if (!odeslano) {
					return opt.message;
				}
			});
		},

		/*
		 * Odkazy pro zmenu zobrazeni vypisu pruchodu predela na prepinatka,
		 * ktere schovavaji/zobrazuji cast stranky.
		 **/
		init_pruchody_prepinace: function () {
			$('.odpo_filter_pruchody')
				.off('.'+namespace)
				.on('click.'+namespace, '.odp-pruchody-zobraz, .odp-akce-zobraz', {}, function (evt) {
					var $anchor = $(this);

					evt.preventDefault();
					(evt.data.$pruchody = evt.data.$pruchody || $('.odp-pruchody')).toggleClass('hide', !$anchor.is('.odp-pruchody-zobraz'));
					(evt.data.$akce = evt.data.$akce || $('.odp-akce')).toggleClass('hide', !$anchor.is('.odp-akce-zobraz'));
				});
		},

	}, function (key, value) {
		Object.defineProperty(module, key, {
			value:		value,
			writable:       false,
			configurable:   false,
			enumerable:     true,
		});
	});

	function _check_connection_before_submit ($form, hiddens) {
		$('#odpo_modal_submit').foundation('open');
		$form.find('.odpo_hiddens_temp').remove();
		$form.append(is.El.$hidden_inputs(hiddens, 'odpo_hiddens_temp'));

		// kontrola dostupnosti serveru
		is.Ajax.ping({
			timeout: 4095,
			success: function () {
				$form.submit();
			},
			error: _error_connection_evt,
		});
	}

	function _error_connection_evt (jqXHR, text_status) {
		var $modal = $('#odpo_modal_error_submit');
		var $submit = $modal.find('.button[type="submit"]').removeClass('hide');
		var abort_loop = false;
		var typ;

		$modal.find('iframe').parent().remove();
		$modal.off('._error_connection_evt');
		$modal.on('closed.zf.reveal._error_connection_evt', function(evt) {
			abort_loop = true;
			$modal.find('iframe').parent().remove();
		});

		if (text_status === 'timeout') {
			typ = 'timeout';
		} else if (jqXHR.status === 0) {
			typ = jqXHR.status;
		} else if (jqXHR.status === 403) {
			typ = jqXHR.status;
			// schovam na chvili tlacitko odeslat, aby v modalnim okne nebyla dve modra tlacitka
			$submit.addClass('hide');
			setTimeout(function () { $submit.removeClass('hide'); }, 30 * 1000);	// 30s
			// zobrazim iframe s prihlasenim
			$modal.find('.odpo_error_msg_cover_'+typ).last().after(
				$('<p>').append(
					$('<iframe>', {
						src:	'/auth/prihlasen' + (is('session.ekurz') ? '?ekurzy' : ''),
						style:	'width: 100%; height: 300px; border: 1px solid black;',	// vysku nelze dynamicky menit protoze islogin je jina domena
						onload: function () {
							var $iframe = $(this);
							(function loop () {
								var body, $mark;

								try {
									body = $iframe.parent() && ($iframe[0].contentDocument || {}).body;
									$mark = body && $(body).find('.lc8zOpUtCNwT8iaN7Wcm17oq');
								} catch (e) {}

								if ($mark && $mark.length) {
									// po uspesnem prihlaseni autoaticky odesle
									$modal.closest('form').trigger('submit');
								} else if (!abort_loop) {
									setTimeout(loop, 200);
								}
							}());
						},
					})
				)
			);
		} else {
			typ = 'other';
		}

		$('#odpo_modal_submit').foundation('close');

		$modal
			.find('.odpo_error_msg_cover')
				.addClass('hide')
				.end()
			.find('.odpo_error_msg_cover_' + typ)
				.removeClass('hide')
				.end()
			.foundation('open');
	}

	function _kontrola_struktury_otazek ($form) {
		var $input_group;

		// kontrola struktury prvku input-group
		$input_group = $form.find('.input-group');
		if ($input_group.length) {
			$input_group = $input_group.filter(function () {
				return !$(this).closest('.odpo_input_group_cover').length;
			});

			if ($input_group.length) {
				$input_group = $input_group.map(function () { return $(this).find(':input').attr('name') });
				console.error('Některý z input-group elementu neni spravne obalen. Muze rozbijet design otazky.', $input_group.get());
			}
		}
	}

	function _get_seconds_used_for_request ($form) {
		var seconds_sent, seconds_used;

		if (!$form || !$form.data('isElAutoSubmit')) {
			return;
		}

		seconds_sent = $form.data(namespace+'SecondUsedSent') || 0;
		seconds_used = $form.data('isElAutoSubmit').get_seconds_used();

		return Math.floor(seconds_used - seconds_sent);
	}

	function _add_seconds_used_from_successful_request ($form, seconds) {
		var seconds_sent;

		if (!$form || !$form.data('isElAutoSubmit') || !seconds) {
			return;
		}

		seconds_sent = $form.data(namespace+'SecondUsedSent') || 0;
		$form.data(namespace+'SecondUsedSent', seconds_sent + seconds);
	}

	return module;
});

is.Define.class('ElQuestion', function (namespace, $) {
	var was_init = false;
	var options = {};

	function ElQuestion ($question) {
		var self = this;
		var instance = $question.data(namespace);

		if (instance) {
			return instance;
		}
		$question.data(namespace, self);

		self.$question = $question;
		self.opt = options[$question[0].id];
		self.$inputs = $question.find('.odpo_otazka_input').filter('[id]');
		self.ok_answers_index = self.opt.index || 0;
		self.ok_answers_count = (self.opt.ok_answers || []).length;
		self.$elms = {};
	}

	$.extend(ElQuestion, {

		init: function () {
			if (was_init) {
				return;
			}

			$(document)
				.off('.'+namespace)
				.on('click.'+namespace, '.' + namespace + '_ok_answers_prev', { direction: -1 }, _evt_change_solution)
				.on('click.'+namespace, '.' + namespace + '_ok_answers_next', { direction: 1 }, _evt_change_solution)
				.on('click.'+namespace, '.' + namespace + '_ok_answers_correct_toggle', function () {
					var el_question = ElQuestion.get_instance(this);
					el_question.toggle_correct();
				});

			was_init = true;
		},

		init_one: function (opt) {
			options[opt.id] = opt;
		},

		get_instance: function (question_or_descendant_elm) {
			var $elm = $(question_or_descendant_elm);
			var instance = $elm.data(namespace);
			var $question;

			if (instance) {
				return instance;
			}

			$question = $elm.hasClass('odpo_otazka_') ? $elm : $elm.closest('.odpo_otazka_');
			instance = $question.data(namespace);

			if (instance) {
				$elm.data(namespace, instance);
				return instance;
			}

			instance = new ElQuestion($question);

			if ($elm[0] !== $question[0]) {
				$elm.data(namespace, instance);
			}

			return instance;
		},

	});

	$.extend(ElQuestion.prototype, {

		get_$elm: function (name) {
			var self = this;

			if (self.$elms[name] != null) {
				return self.$elms[name];
			}

			return self.$elms[name] = self.$question.find('.' + namespace + '_' + name);
		},

		get_actual_ok_answers_index: function () {
			var self = this;

			return self.ok_answers_index;
		},

		get_ok_answers_count: function () {
			var self = this;

			return self.ok_answers_count;
		},

		change_ok_answers_to: function (index) {
			var self = this;
			var opt = self.opt.ok_answers[index];

			self.$inputs.each(function () {
				var el_input = is.ElInput.get_instance(this);

				el_input.change_ok_answer_to(index);
			});

			self.ok_answers_index = index;
			self.get_$elm('ok_answers_all').toggleClass('hide', !opt.all);
			self.get_$elm('ok_answers_one').toggleClass('hide', !!opt.all);
			self.get_$elm('ok_answers_actual').text(index + 1);
			self.get_$elm('ok_answers_info').removeClass('bgbarva2 bgbarva5').addClass(opt.bgcolor);

			// TODO vyvolat udalost o zmene reseni
		},

		toggle_correct: function () {
			var self = this;

			self.get_$elm('correct_content_cover').toggleClass('hide');
		},

	});

	function _evt_change_solution (evt) {
		var el_question = ElQuestion.get_instance(this);
		var index = el_question.get_actual_ok_answers_index();
		var count = el_question.get_ok_answers_count();

		index = (count + index + evt.data.direction) % count;
		el_question.change_ok_answers_to(index);
	}

	return ElQuestion;
});

is.Define.class('ElInput', function (namespace, $) {
	var inputs = {};
	var $null = $();
	var color_to_rgb = {};	// TODO presunout nekde do centralu

	function ElInput (opt) {
		var self = this;

		self.opt = opt;
		self.$elms = {};
		self.actual_index = 0;
	}

	$.extend(ElInput, {

		init_one: function (opt) {
			inputs[opt.id] = new ElInput(opt);
		},

		get_instance: function (input) {
			return inputs[input.id];
		},

		set_color_to_rgb: function (i_color_to_rgb) {
			color_to_rgb = i_color_to_rgb;
		},
	});

	$.extend(ElInput.prototype, {

		// input, label, correct, correct_icon
		get_$elm: function (name) {
			var cover_name, $cover,
				self = this;

			// vytahne z cache
			if (self.$elms[name] != null) {
				return self.$elms[name];
			}

			// dotahne zakladni prvek - napr 'correct'
			cover_name = name.split('_', 1)[0];
			$cover = self.$elms[cover_name] = self.$elms[cover_name] || $(self.opt.elms[cover_name]);

			// dotahne potomka - napr 'correct_icon'
			if (cover_name !== name) {
				return self.$elms[name] = !$cover.length ? $null : $cover.find('.' + namespace + '_' + name);
			}

			return $cover;
		},

		change_ok_answer_to: function (index) {
			var self = this;
			var $label = self.get_$elm('label');
			var $correct = self.get_$elm('correct');
			var $star = self.get_$elm('star');
			var new_ok_answer = self.opt.ok_answers[index];
			var actual_ok_answer = self.opt.ok_answers[self.actual_index];
			var $latex_imgs, text, html, title, tooltip, $correct_icon;

			if ($star.length) {
				$star.toggleClass('invisible', !new_ok_answer.any_ok_answer);
			}

			if ($label.length) {
				$label
					.removeClass(actual_ok_answer.color)
					.addClass(new_ok_answer.color);

				self.get_$elm('label_latex').each(function () {
					var $img = $(this);
					var src = $img.attr('src');
					var tag_a = document.createElement('a');
					var search;

					tag_a.href = src;

					search = tag_a.search.replace(/^\?code=/, '');
					search = decodeURIComponent(search);
					search = search.replace(
						'[RGB]{' + color_to_rgb[actual_ok_answer.color] + '}',
						'[RGB]{' + color_to_rgb[new_ok_answer.color] + '}'
					);

					tag_a.search = 'code=' + encodeURIComponent(search);

					$img.attr('src', tag_a.href);
				});
			}

			if ($correct.length) {
				$correct_icon = self.get_$elm('correct_icon');

				title = new_ok_answer.title || '';
				if (new_ok_answer.correct) {
					title += '<hr />' + new_ok_answer.correct.join('<br />');
					text = new_ok_answer.correct.join(', ');
				} else {
					text = '';
				}

				self.get_$elm('correct_content')
					.html(text);

				self.get_$elm('postfix_correct')
					.html(new_ok_answer.correct_posfix);

				$correct_icon
					.removeClass((actual_ok_answer.color || '') + ' ' + (actual_ok_answer.icon || ''))
					.addClass((new_ok_answer.color || '') + ' ' + (new_ok_answer.icon || ''));

				tooltip = is.Foundation.get_plugin($correct_icon);
				if (tooltip) {
					tooltip.template
						.html(title);
				} else {
					$correct_icon
						.attr('title', title);
				}
			}

			self.actual_index = index;
		},

	});

	return ElInput;

});

/**
 * Umoznuje k inputu zobrazit statistiky obsahu o poctu znaku nebo slov.
 **/
is.Define.class('ElPocitadlo', function (namespace, $) {
	var default_opt = {
		unit: 'word',
	};

	var regex_tag_all = /<[^>]*?>/gm;
	var regex_ws_all = /\s+/gm;
	var regex_interpunction = /[,\.;:!\?\+\/–—\* ]+/;

	/**
	 * Vytvori pocitadlo na danem inputu. Na jednom inputu muze byt jedno pocitadlo.
	 *
	 * 	var pocitadlo = new is.ElPocitadlo({
	 * 		input_elm: 	'selector' | DOMelm | $(),	# prvek ve kterem se pocitaji znaky/slova
	 * 		info_elm:	'selector' | DOMelm | $(),	# prvek ve kterem se zobrazuji informace o poctech
	 * 		unit:		'word' | 'char',		# jednotka, ktera se ma pocitat
	 * 		limit_block: 	100,				# po kolika znacich ma zakazat dalsi upravy, funguje poze s unit 'char' (v kodu vynucene)
	 * 		limit_warn: 	90,				# kdy se ma zobrazit varovani
	 * 		limit_min: 	40,				# upozornovat, ze je vyzadovan minimalni pocet znaku
	 * 		remove_tags:	true,				# pred spocitanim ocistit o tagy a provest decode_c
	 * 	});
	 *
	 **/
	function ElPocitadlo (opt) {
		var self = this;

		self.opt = $.extend(true, {}, default_opt, opt);
		self.$input = $(self.opt.input_elm);
		self.$info = $(self.opt.info_elm);

		if (!self.$input.length || !self.$info.length) {
			is.Console.log('Nedohledal se input nebo prostor pro zobrazeni vysledku.', self.$input.length, self.$info.length, opt);
			return;
		}

		if (self.$input.data(namespace)) {
			return self.$input.data(namespace);
		}
		self.$input.data(namespace, self);

		if (self.opt.limit_block || self.$input.is('[maxlength]')) {
			self.opt.unit = 'char';
			self.opt.limit_block = self.opt.limit_block || self.$input.attr('maxlength');
			self.$input.attr('maxlength', self.opt.limit_block);
		}

		self.limit_max = +(self.opt.limit_block || self.opt.limit_warn || 0);
		self.limit_min = +(self.opt.limit_min || 0);
		if (self.limit_max && self.limit_min >= self.limit_max) {
			self.limit_min = 0;
		}

		self.$input
			.on('keyup.'+namespace+' change.'+namespace, function () {
				self.show_info();
			});

		self.show_info();
	}

	/**
	 * Zinicializuje jeden prvek podle opt.
	 **/
	ElPocitadlo.init = function (opt) {
		new ElPocitadlo(opt);
	};

	/**
	 * Odpoji pocitadlo.
	 *
	 *	pocitadlo.destroy();
	 **/
	ElPocitadlo.prototype.destroy = function () {
		var self = this;

		self.$input
			.off('.'+namespace)
			.removeData(namespace);
		self.$info.empty();
	};

	/**
	 * Zobrazi aktualni info.
	 *
	 * 	pocitadlo.show_info();
	 **/
	ElPocitadlo.prototype.show_info = function () {
		var self = this;

		self.$info.html(self.get_info());
	};

	/**
	 * Vrati aktualni info.
	 *
	 * 	var info = pocitadlo.get_info();
	 *
	 **/
	ElPocitadlo.prototype.get_info = function () {
		var self = this;
		var count = self.get_count();
		var limit_max = self.limit_max;
		var limit_min = self.limit_min;
		var span_class = '';
		var info = '';
		var en_info = is.session.lang === 'en';

		if (limit_max && (count > limit_max * 0.8 || count < limit_min)) {
			span_class = 'highlight ';
		}

		if (self.opt.limit_block && count >= limit_max) {
			span_class += 'ko';
			if (en_info) {
				info += "The limit is reached. You can't insert more than " + limit_max + " charakters.";
			} else {
				info += 'Je dosaženo limitu. Více než ' +  limit_max + ' znaků vložit nelze.';
			}
		} else {
			info += (en_info ? 'The text contains' : 'Text obsahuje') + ' ' + count + ' ' + _words_or_chars(self.opt.unit, count) + '.';

			if (!limit_max) {
				// kdyz neni omezujici limit, zobrazi se pouze hlaska o poctu
			} else if (count < limit_min) {
				if (en_info) {
					info += ' ' + (limit_min - count) + ' ' + _words_or_chars(self.opt.unit, limit_min - count) + ' needed to minimal limit.';
				} else {
					info += ' Je potřeba dopsat alespoň ' + (limit_min - count) + ' ' + _words_or_chars(self.opt.unit, limit_min - count) + '.';
				}
			} else if (count < limit_max) {
				if (en_info) {
					info += ' ' + (limit_max - count) + ' ' + _words_or_chars(self.opt.unit, limit_max - count) + ' left to limit_max.';
				} else {
					info += ' Lze dopsat max. ' + (limit_max - count) + ' ' + _words_or_chars(self.opt.unit, limit_max - count) + '.';
				}
			} else if (count > limit_max) {
				span_class += 'ko';
				info += ' ' + (en_info ? 'The limit is exceeded by' : 'Limit je překročen o') + ' ' + (count - limit_max) + ' ' + _words_or_chars(self.opt.unit, count - limit_max) + '.';
			} else if (count === limit_max) {
				info += ' ' + (en_info ? 'That is exactly limit.' : 'To je přesně limit.');
			}
		}

		return '<span class="' + span_class + '">' + info + '</span>';
	}

	/**
	 * Vrati obsah v podobe textu, ktery je pripraveny pro analyzu.
	 *
	 * 	var text = pocitadlo.get_value();
	 **/
	ElPocitadlo.prototype.get_value = function () {
		var self = this;
		var text = self.$input.val();

		if (self.opt.limit_block) {
			return text;
		}

		if (self.opt.remove_tags) {
			text = text.replace(regex_tag_all, ' ');
			text = is.Misc.decode_c(text);
		}

		text = text.replace(regex_ws_all, ' ');
		text = $.trim(text);

		return text;
	};

	/**
	 * Spocita pocet jednotek v textu.
	 *
	 * 	var pocet = pocitadlo.get_count();
	 *
	 **/
	ElPocitadlo.prototype.get_count = function () {
		var self = this;
		var text = self.get_value();
		var count = text.length;

		if (text.length && self.opt.unit === 'word') {
			count = $.grep(text.split(regex_interpunction), function (word) {
				return !!word.length;
			}).length;
		}

		return count;
	};

	// vrati spravne sklonovane slovo dle poctu
	function _words_or_chars(unit, count) {
		var res;
		var en_info = is.session.lang === 'en';

		if (en_info) {
			res = unit === 'word' ? 'word' : 'character';
			if (count !== 1) {
				res += 's';
			}

			return res;
		}

		if (count === 1) {
			res = unit === 'word' ? 'slovo' : 'znak';
		} else if (count > 1 && count < 5) {
			res = unit === 'word' ? 'slova' : 'znaky';
		} else {
			res = unit === 'word' ? 'slov' : 'znaků';
		}

		return res;
	}

	return ElPocitadlo;
});


/**
 * Automaticke ulozeni (submit) obsahu formulare po vyprseni casoveho limitu.
 * vyzaduje knihovnu moment.js.
 **/
is.Define.class('ElAutoSubmit', function (namespace, $) {
	var was_init;
	var default_opt = {
		warning_limit: 5 * 60,
		alert_limit: 1 * 60,
		submit_params: {
			uloz:	true,
		},
	};
	var onload_opt_reg = {};

	/**
	 * Inicializace casovace u formulare.
	 *
	 * 	var auto_submit = new is.ElAutoSubmit({
	 *		form_elm: 'selector' | DOM element | $(),		// identifikace formulare
	 *		timer_cover_elm: 'selector' | DOM element | $(),	// identifikace mista kde se ma zobrazit casovac
	 *		class_prefix: '...',					// trida pomoci, ktere je mozne najit jednotlive podcasti casovace
	 *		seconds: '...',						// pocet sekund
	 *		warning_limit: ...,					// pocet sekund pred koncem intervalu kdy ma jiz byt oranzovy progress
	 *		alert_limit: ...,					// pocet sekund pred koncem intervalu kdy ma jiz byt cerveny progress
	 *		show_seconds: true,					// nezavisle na zbyvajicim case zobrazovat format se sekundama
	 *		submit_params: {},					// parametry ktere se maji pridat pri odeslani formulare
	 * 	});
	 **/
	function ElAutoSubmit (opt) {
		var self = this;
		var interval, seconds, onload_opt;

		// schvlane neni deep copy aby se pripadne preplaclo cele 'submit_params' a nedoplnovalo se
		opt = $.extend({}, default_opt, opt);
		if (opt.warning_limit < opt.alert_limit * 2) {
			console.error('Interval varovani je neumerne kratsi nez interval poplachu =o)');
		}

		seconds = Math.floor(opt.seconds);
		if (isNaN(seconds) || seconds < 0 || 28800 < seconds) {
			console.error('Doba intervalu je mimo povoleny rozsah <0;28800> sekund.', seconds, opt);
			return;
		}

		self.$form = $(opt.form_elm);
		self.$timer_cover = $(opt.timer_cover_elm);
		if (!self.$form.length || !self.$timer_cover) {
			console.error('Nektery z elementu nebyl nalezen.', opt.form_elm, opt.timer_cover_elm+opt.class_prefix, self.$form.length, self.$timer_cover);
			return;
		}

		self.seconds_at_start = seconds;
		self.$timer = self.$timer_cover.find(opt.class_prefix + '_time');
		self.$min_label = self.$timer_cover.find(opt.class_prefix + '_min');
		self.$remaining_label = self.$timer_cover.find(opt.class_prefix + '_remaining');
		self.$progress = self.$timer_cover.find('.progress');
		self.$progress_meter = self.$progress.find('.progress-meter');
		self.warning_limit = opt.warning_limit;
		self.was_warning = false;
		self.alert_limit = opt.alert_limit;
		self.was_alert = false;
		self.less_then_minute = false;
		self.show_seconds = opt.show_seconds;
		self.submited = false;
		self.submit_params = opt.submit_params;

		self.time_to = null;
		self.time_helper = null;
		self.get_seconds_left = null;
		self.get_time_left = null;
		try {
			interval = window.moment.duration(seconds, 'seconds');
		} catch (e) {}
		if (interval && interval.asSeconds() === seconds) {
			self.time_to = window.moment().add(interval);
			self.get_seconds_left = function () {
				return Math.max(0, self.time_to.diff(window.moment(), 'seconds'));
			};
			self.get_time_left = function (seconds) {
				return window.moment.duration(seconds, 'seconds');
			};
		} else {
			self.time_helper = new TimeHelper(seconds);
			self.get_seconds_left = function () {
				return Math.max(0, self.time_helper.seconds_left);
			};
			self.get_time_left = function () {
				return self.time_helper;
			};
		}

		if (opt.start_onload && !self.$form.data(namespace)) {
			self.$form.data(namespace, self);
			self.$form.find('.odpo_blur').remove();
			onload_opt = onload_opt_reg[opt.form_elm];
			if (onload_opt) {
				onload_opt_reg[opt.form_elm] = null;
				if (onload_opt.$info_wait) {
					onload_opt.$info_wait.remove();
				} else {
					clearTimeout(onload_opt.info_wait_timeout_id);
				}
			}
		}

		self.update();
		self.interval_id = setInterval(function () {
			self.update();
		}, 1000);
	}

	/*
	 * Umozni inicializovat jeden formular. Parametry viz. konstrutor.
	 */
	ElAutoSubmit.init = function (opt) {
		var onload_opt;

		if (opt.start_onload) {
			onload_opt = onload_opt_reg[opt.form_elm];
			if (!onload_opt) {
				onload_opt = {};
				onload_opt.info_wait_timeout_id = setTimeout(function () {
					onload_opt.$info_wait = is.Zdurazneni.upozorneni(opt.info_wait_text);
				}, 2000);
				onload_opt_reg[opt.form_elm] = onload_opt;
			}

			$(window).on('load', function () {
				new ElAutoSubmit(opt);
			});
		} else {
			new ElAutoSubmit(opt);
		}
	};

	/*
	 * Aktualizuj informace pro uzivatele.
	 */
	ElAutoSubmit.prototype.update = function () {
		var self = this;
		var seconds = self.get_seconds_left();
		var time_left = self.get_time_left(seconds);

		// alert
		if (!self.was_alert) {
			if (seconds < self.alert_limit) {
				self.was_alert = true;
				self.$progress_meter
					.addClass('bgbarva3')
					.removeClass('bgbarva4');
				self.$timer
					.addClass('barva3')
					.removeClass('barva4');
				self.$remaining_label
					.addClass('barva3 odpo_blink');
				self.$min_label
					.addClass('hide');
		// warning
			} else if (!self.was_warning) {
				if (seconds < self.warning_limit) {
					is.ElOdpovednik.set_auto_save_active(self.$form, false);
					self.was_warning = true;
					self.$progress_meter
						.addClass('bgbarva4');
					self.$timer
						.addClass('barva4');
					self.$min_label
						.addClass('hide');
		// less then minute
				} else if (!self.less_then_minute) {
					if (seconds < 60) {
						self.less_then_minute = true;
						self.$min_label
							.addClass('hide');
					}
				}
			}
		}

		if (self.show_seconds || self.was_alert || self.was_warning || self.less_then_minute) {
			self.$timer.text(time_left.minutes() + ':' + ('0'+time_left.seconds()).substr(-2));
		} else {
			self.$timer.text(Math.floor(time_left.asMinutes()));
		}

		self.$progress.fProgress(seconds, { duration: 0 });

		if (seconds <= 0) {
			clearInterval(self.interval_id);
			self.get_seconds_left = function () { return 0; }
			self.submit_form();
		}
	};

	/*
	 * Odesle formular.
	 */
	ElAutoSubmit.prototype.submit_form = function () {
		var self = this;

		if (self.submited || self.submit_params === false) {
			return
		}

		self.submited = true;
		self.$form
			.find('.odpo_hiddens_temp')
				.remove()
				.end()
			.append(is.El.$hidden_inputs($.extend(true, {},
				{
					autosubmit: true,
				},
				self.submit_params
			), 'odpo_hiddens_temp'))
			.submit();
	};

	/*
	 * Vrati pocet sekund, po ktere byl casovac spusten.
	 */
	ElAutoSubmit.prototype.get_seconds_used = function () {
		var self = this;

		return Math.min(self.seconds_at_start, Math.max(0, self.seconds_at_start - self.get_seconds_left()));
	};

	// Imituje vsechny funkce, ktere se pouzivaji v souvislosti s knihovnou window.moment v ElAutoSubmit.update().
	function TimeHelper (seconds) {
		this.seconds_left = Math.floor(+seconds);
	}

	TimeHelper.prototype = {
		// snizi pocet zbyvajicich sekund o jedu
		decrese_second: function () {
			return --this.seconds_left;
		},

		// vrati pocet minut (prirozene cislo), ktery zbyva do konce
		asMinutes: function () {
			return Math.floor(this.seconds_left / 60);
		},

		// vrati hodnotu minut v intervalu 0-59
		minutes: function () {
			return this.asMinutes() % 60;
		},

		// vrati pocet sekund v intervalu 0-59
		seconds: function () {
			return this.seconds_left % 60;
		},
	};

	return ElAutoSubmit;
});

is.Define.module('ElMaple', function (namespace, $) {

	return {
		/*
		 * Zinicializuje kontrolu syntaxe pro jedno tlacitko a jeden input.
		 *
		 * 	is.ElMaple.init_syntax_check({
		 * 		button_elm: 'selector' | DOM element | $(),		// identifikace tlacitka
		 * 		input_elm: 'selector' | DOM element | $(),		// identifikace inputu
		 * 		dropdown_elm: 'selector' | DOM element | $(),		// identifikace dropdownu kde se ma zobrazovat vysledek - nepovinne
		 * 	});
		 *
		 */
		init_syntax_check: function (opt) {
			var $button = $(opt.button_elm);
			var $img_cover = $(opt.dropdown_elm);
			var dropdown_plugin = is.Foundation.get_plugin($img_cover);
			var $input = $(opt.input_elm);
			var $img = $();
			var loading = new is.Loading({
				size:		'inline',
				parent:		$img_cover,
			});

			// Pokud neni neco nalezeno, tise se zamlci.
			// Muze vznikat kdyz se kontroluji otazky, jestli jsou ok pred odpovezenim testu
			if (!$button.length || !$input.length) {
				return;
			}

			// pokud jiz na tlacitku je udalost s timto namespace, jiz probehl init
			if ($button.hasEvent('click.'+namespace).length) {
				return;
			}

			// vlozi obal pro loader nebo obrazek, pokud je to potreba
			if (!dropdown_plugin) {
				$img_cover = $('<span>');
				$button.after($img_cover);
			}

			// spusti kontrolu maple po kliknuti na tlacitko
			$button.on('click.'+namespace, function (evt) {
				var formula = is.Forms.get_input_val($input);

				evt.stopPropagation();
				__clear_img_cover();

				if (!formula) {
					return;
				}

				if (dropdown_plugin) {
					dropdown_plugin.$element.removeClass('hide');
					dropdown_plugin.open();
				}
				loading.show();

				$img = $('<img>')
					.on('load', function () {
						__clear_img_cover();
						$img_cover.html($img);
					})
					.on('error', function () {
						__clear_img_cover();
						is.Zdurazneni.chyba('mapleserver error', {
							fade_out: true,
						});
					})
					.attr('src', '/system/maple-latexconv?jazyk=' + is('session.lang') + ';eq=' + encodeURIComponent(formula));
			});

			// vymaze obrazek zobrazeni po kontrole pri vstupu do inputu
			$input.on('focus.'+namespace, function () {
				if (dropdown_plugin) {
					dropdown_plugin.$element.addClass('hide');
				}
				__clear_img_cover();
			});

			function __clear_img_cover() {
				loading.hide();
				$img.off();
				$img_cover.empty();
			}
		},
	};
});

is.Define.module('ElQdefPreview', function (namespace, $) {

	return {

		init: function () {
			$('.preview_otazka_zdroj_vse')
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					is.Rozklikavatko.show('.preview_otazka_zdroj_rozklikavatko');
					setTimeout(function () {
						is.ViceMene.reflow();
					}, 0);
				});

			$('.preview_otazka_zdroj_nic')
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					is.Rozklikavatko.hide('.preview_otazka_zdroj_rozklikavatko');
				});

			$('.preview_device_show')
				.off('.'+namespace)
				.one('click.'+namespace, function () {
					var $iframe = $(this).closest('.odpo_info_parametry_obsah').find('iframe');
					var src = $iframe.data('src');

					if (src) {
						$iframe.attr('src', src);
						$iframe.removeData('src');
					}
				});
		},
	};
});

is.Define.module('ElOdpovedi', function (namespace, $) {
	var $dropdown, $hidden_container, $wrench_menu, can_unselect_row, ajax,
		$wrench = $();

	return {
		init: function (opt) {
			var $modal, $modal_content, $modal_close;

			$.each('vsepruch vseakce'.split(' '), function (i, filter) {
				var $rozklikavatka = $('.odpovedi_rozklikavatko_' + filter);
				var $button_all = $('.odpovedi_butt_' + filter + '_a');
				var $button_one = $('.odpovedi_butt_' + filter);

				$button_all.add($button_one)
					.off('click.'+namespace)
					.on('click.'+namespace, function () {
						if (this === $button_all[0]) {
							is.Rozklikavatko.show($rozklikavatka);
						} else if (this === $button_one[0]) {
							is.Rozklikavatko.hide($rozklikavatka);
						}
					});
			});

			$hidden_container = $('.odpovedi_hidden_container');
			$wrench_menu = $hidden_container.find('.odpovedi_wrench_menu');

			$('.odpovedi_wrench')
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					var same_wrench = $wrench[0] === this;

					can_unselect_row = true;
					_unselect_row();

					// opakovane kliknuti na stejny klic schova dropdown
					if (same_wrench) {
						$dropdown.foundation('close');
						return;
					}

					_destroy_dropdown();
					$wrench = $(this);
					$wrench.closest('.odpovedi_wrench_cover').addClass('selected');
					$wrench_menu.find('.zadani_duplicate_one,.zadani_duplicate_one_count_cover').toggleClass('hide', !$wrench.data('change_duplicate_one'));
					$wrench_menu.find('.odpovedi_c_to_b_one').toggleClass('hide', !$wrench.data('change_c_to_b_one'));
					$wrench_menu.find('.odpovedi_b_to_c_one').toggleClass('hide', !$wrench.data('change_b_to_c_one'));
					$wrench_menu.find('.odpovedi_b_to_c_more').toggleClass('hide', !$wrench.data('change_b_to_c_more'));
					$wrench_menu.find('.odpovedi_akce_time_ignore').toggleClass('hide', !$wrench.data('odpovedi_akce_time_ignore'));
					$wrench_menu.find('.odpovedi_akce_time_use').toggleClass('hide', !$wrench.data('odpovedi_akce_time_use'));
					$wrench_menu.find('.odpovedi_delete_row').toggleClass('hide', $wrench.data('session_count') !== 1);
					$wrench_menu.find('.odpovedi_delete_rows').toggleClass('hide', ($wrench.data('session_count') || 1) === 1);
					$wrench_menu.find('.odpovedi_delete_answers').toggleClass('hide', !$wrench.data('can_delete_answers'));
					$wrench_menu.find('.odpovedi_export_xml')
						.toggleClass('hide', !!$wrench.data('akid'))
						.attr('href', $wrench.data('export-xml-href') || '#');
					$wrench_menu.find('.odpovedi_export_xml_last')
						.toggleClass('hide', !$wrench.data('export-xml-href-last'))
						.attr('href', $wrench.data('export-xml-href-last') || '#');
					_add_dropdown();
					_show_dropdown();
				});

			$modal = is.Reveal.create('', {
				tlacitko_x: true,
				data: {
					closeOnClick	: false,
					closeOnEsc	: false,
				},
			});
			$modal_content = $modal.find('.reveal-content');
			$modal_close = $modal.children('.close-button');

			$modal
				.on('open.zf.reveal', function () {
					can_unselect_row = false;

					if ($dropdown) {
						$dropdown.foundation('close');
					}

					$modal_close.addClass('hide');
				})
				.on('closed.zf.reveal', function () {
					can_unselect_row = true;
					_unselect_row();
				})
				.on('click', '.navodek-nadpis', function () {
					setTimeout(function () {
						$(window).trigger('changed.zf.mediaquery');
					}, 0);
				});

			ajax = new is.Ajax({
				url: '/auth/elearning/test_ajax',
				loading: new is.Loading({
					parent		: $modal_content,
					insertMethod	: 'html',
					delay		: 0,
				}),
				beforeSend: function () {
					$modal_close.addClass('hide');
				},
			});

			$('.odpovedi_operace')
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					_load_operation($(this));
				});

			if (opt.load_operation) {
				_load_operation($(opt.load_operation), opt.load_operation_params);
			}

			function _load_operation ($operace, data) {
				data = data || {};
				data.testurl = opt.testurl;

				if (!$operace || !$operace.length) {
					$modal.foundation('close');
					return;
				}

				$modal.removeClass('tiny small large extra_large full');
				$modal.addClass($operace.data('reveal-size'));
				$modal.foundation('open');

				$.each('operace all zadani qucz qucz_typ predmet zuv bez_banneru qanswpruch akid typ_zmeny'.split(' '), function (i, name) {
					var value = $wrench.data(name) || $operace.data(name);

					if (value) {
						data[name] = value;
					}
				});

				if (data.operace === 'zadani_duplicate') {
					data.count = $operace.parent().find('.zadani_duplicate_one_count').val();
				}

				can_unselect_row = false;
				ajax.request(data)
					.done(_operace_done($modal_content, $modal_close));

			}
		},

		init_b_to_c_form: function (opt) {
			var $form = $(opt.form_elm);
			var $starsi_pruchody = $form.find('.odpovedi_pruchod_starsi');
			var $posledni_pruchody = $form.find('.odpovedi_pruchod_posledni');

			$form.find('.odpovedi_butt_b_to_c')
				.off('.'+namespace)
				.on('click.'+namespace, function () {
					$starsi_pruchody.prop('checked', !!$(this).data('all'));
					$posledni_pruchody.prop('checked', true);
				});
		},

		init_filter: function () {
			var $radio_qucz_typ = $('[type="radio"][name="qucz_typ"]');
			var $input = $('[type="text"][name="qucz"]');

			is.Forms.set_validator('el_odpovedi_id_list', 'error_msg', /^(?:(?:[a-zA-Z0-9]{5}(?:[\s,;\.]+(?:[a-zA-Z0-9]{5})?)?)+|(?:[1-9][0-9]*(?:[\s,;\.]+(?:[1-9][0-9]*)?)?)+)$/);

			$radio_qucz_typ
				.off('.'+namespace)
				.on('change.'+namespace, function () {
					var disable = !is.Forms.get_input_val($radio_qucz_typ).length;

					$input.add($input.closest('.input-group').find('button')).toggleAttr('disabled', disable);

					if (disable) {
						$input.closest('form').foundation('removeErrorClasses', $input);
					} else {
						if (is.Forms.get_input_val($input).length) {
							$input.closest('form').foundation('validateInput', $input);
						}

						$input.trigger('focus');
					}
				});
		},
	};

	function _operace_done ($modal_content, $modal_close) {
		return function (data) {
			$modal_content.fhtml(data.html);

			if (!data.reload) {
				$modal_close.removeClass('hide');
			}

			if (data.form) {
				is.Forms.ajax_submit($modal_content.find('form'), ajax)
					.done(_operace_done($modal_content, $modal_close));
			}
		};
	}

	function _unselect_row () {
		if (!can_unselect_row) {
			return;
		}

		if ($wrench.length) {
			$wrench
				.removeAttr('data-open aria-controls data-is-focus data-yeti-box aria-haspopup aria-expanded')
				.removeClass('hover')
				.closest('.odpovedi_wrench_cover')
					.removeClass('selected');

			$wrench = $();
		}
	}

	function _destroy_dropdown () {
		if (!$dropdown) {
			return;
		}

		$wrench_menu.find('.odpovedi_export_xml').attr('href', '#');
		$wrench_menu.appendTo($hidden_container);

		if ($dropdown.hasClass('is-open')) {
			$dropdown.foundation('close');
		}
		$dropdown.foundation('destroy');
		$dropdown.remove();
		$dropdown = null;

	}

	function _add_dropdown () {
		$dropdown = $('<div>')
			.attr({
				id: is.Misc.uniq_id(),
				'data-dropdown': '',
			})
			.css({
				zIndex: 10,
			})
			.addClass('dropdown-pane left odpovedi_wrench_menu_cover')
			.appendTo($hidden_container)
			.append($wrench_menu)
			.on('hide.zf.dropdown', function () {
				_unselect_row();
			});
	}

	function _show_dropdown () {
		if (!$dropdown) {
			return;
		}

		$wrench.attr('data-open', $dropdown.attr('id'));
		new window.Foundation.Dropdown($dropdown, {closeOnClick: true, trapFocus: true});
		$dropdown.foundation('open');
	}
});

is.Define.module('ElPruvodce', function (namespace, $) {
	var ajax, $elp_robsah, $preskocit_modal, $files_modal, $elp_files_modal_opustit, $elp_2nd_modal_skoc, $window;
	var modul = {};

	modul.init_button = function (opt) {
		var $iframe;
		var $body_and_html = $(document.body).add(document.documentElement);

		$('#elp_modal')
			.off('.'+namespace)
			.on('open.zf.reveal.'+namespace, function() {
				$body_and_html.css('overflow', 'hidden');

				$iframe = $('<iframe>', {
					src:	'/auth/elearning/pruvodce?predmet=' + opt.predmet_id + (is.session.myuco ? ';myuco='+is.session.myuco : ''),
					onload: function () {
						// zvetseni modalniho okna podle content iframe
						var $iframe = $(this);
						(function loop () {
							try {
								var height = (($iframe[0].contentDocument || {}).body || {}).scrollHeight;

								if (height && height !== $iframe.height()) {
									$iframe.height(height);
									window.parent.dispatchEvent(new Event('resize'));
								}
							} catch (e) {}

							// dokud je v DOM opakovat
							setTimeout(loop, 80);
						}());
					},
				}).appendTo(this);
			})
			.on('closed.zf.reveal.'+namespace, function() {
				$body_and_html.css('overflow', 'auto');

				$iframe.remove();
				$iframe = null;
			});

	}; // konec ElPruvodce.init_button

	modul.init_content = function (opt) {
		var $elp_robsah = $('#elp_robsah');
		ajax = new is.Ajax({
			url: '/auth/elearning/pruvodce_ajax.pl',
			data: {
				predmet_id: opt.predmet_id,
			},
			loading: {
				'parent'	: $elp_robsah,
				insertMethod	: 'html',
			},
		});

		ajax.request({
			operace: 'elp_copy',
		}).done(function(data) {
			$elp_robsah.html(data.html);
		});

		_init_events();
	}; // konec ElPruvodce.init_content

	function _init_events () {
		$elp_robsah = $('#elp_robsah');
		$preskocit_modal = $('#preskocit_modal');
		$files_modal = $('#files_modal');
		$elp_files_modal_opustit = $('#elp_files_modal_opustit');
		$elp_2nd_modal_skoc = $('#elp_2nd_modal_skoc');
		$window = $(window);

		$(document)
			.off('.'+namespace)
			.on('click.'+namespace, '#elp_sum_preskocit[data-close]', function () {
				// pokud nejsme v iframe, vyuzije se funkcionalita foundation
				if (window.parent === window) {
					return;
				}

				window.parent.jQueryF('#elp_modal').foundation('close');
			})
			.on('click.'+namespace, '.elp_control', function() {
				var $elpc = $(this);
				var elpc = $elpc.data('elp-control');

				if (!$elpc.hasClass('aktualni')) {
					_load_operation(elpc);
				}
			});

		$('.elp_cover')
			.off('.'+namespace)
			.on('click.'+namespace, '.tip_move', function () {
				var $tip_move = $(this);
				var move_left = $tip_move.data('tip-move-left');
				var $tip_content = $tip_move.closest('.tip_cover').find('.tip_content');

				if (move_left) {
					$tip_content.children().last().prependTo($tip_content);
				} else {
					$tip_content.children().first().appendTo($tip_content);
				}
			});

		$preskocit_modal
			.off('.'+namespace)
			.on('closed.zf.reveal', function () {
				var $modal = $(this);

				if (!$modal.data('skipped')) {
					$modal.data('opened', false);
				}
				$modal.data('skipped', false);
			});

		$files_modal
			.off('.'+namespace)
			.on('closed.zf.reveal', function () {
				var $modal = $(this);

				if (!$modal.data('skipped')) {
					$modal.data('opened', false);
				}
				$modal.data('skipped', false);
			});

		$elp_2nd_modal_skoc
			.off('.'+namespace)
			.on('click.'+namespace, function () {
				$preskocit_modal.data('skipped', true);
			});

		$elp_files_modal_opustit
			.off('.'+namespace)
			.on('click.'+namespace, function () {
				$files_modal.data('skipped', true);
			});

	} // konec _init_events

	function _load_operation (elpc, data) {
		var open_modal = false;
		var open_files_modal = false;

		if (!$elp_robsah) {
			_init_events();
		}

		if (!$preskocit_modal.data('opened')) {
			if ($('#elp_copy_link').hasClass('aktualni')) {
				if (elpc !== 'elp_copy') {	// pokud jdeme z elp_copy do elp_copy, tak se neptat
					if (!$('#elp_copy_link_ahref').hasClass('dale')) {	// pokud nepreskakujeme, neptame se
						open_modal = true;
					}
				}
			}
		}

		if (!$files_modal.data('opened')) {
			if ($('#elp_studmat_link').hasClass('aktualni')) {
				open_files_modal = ($elp_robsah.find('.form_files_ajax').data('isFormFiles') || {}).files_count;
			}
		}

		if (open_modal) {
			if (elpc) {
				$elp_2nd_modal_skoc.data('elp-control', elpc);
			}
			$preskocit_modal.data('opened', true).foundation('open');
		} else if (open_files_modal) {
			if (elpc) {
				$elp_files_modal_opustit.data('elp-control', elpc);
			}
			$files_modal.data('opened', true).foundation('open');
		} else {
			$preskocit_modal.data('opened', false);
			$files_modal.data('opened', false);
			ajax.request(data || {
				operace: 	elpc,
			}).done(function(data) {
				$elp_robsah.html(data.html);
				$('.elp_link').removeClass('aktualni').addClass('neaktualni');
				$('#'+elpc+'_link').removeClass('neaktualni').addClass('aktualni');

				// schovani menu pri prechodu na dalsi stranku na malych obrazovkach
				if ($window.width() < 704) {
					$('.levy-panel').hide();
				}
			}).complete(function () {
				$elp_robsah.find('.form_files_ajax').on('ajax_done.isUploadFiles', function (evt, data) {
					$elp_robsah.find('.server_status').html(data.info_ucebni_materialy);
				});
			});
		}
	}

	/*
	 * 	Inicializuje udalost ktera se vyvola po zalozeni odevzdavarny.
	 *
	 * 	is.ElPruvodce.init_odevzdavarny({
	 *		cover_elm : selector || elm || jQuery	# rodic s formularem odevzdavarn
	 * 	});
	 */
	modul.init_odevzdavarny = function (opt) {
		var $cover = $(opt.cover_elm);

		if (!$cover.length) {
			console.error('Nenalezen obal obsahujici formular (ocekava se selector tzn. napr. "#prvek_46542").', opt.cover_elm);
			return;
		}

		$cover
			.off('.'+namespace)
			.on('callbackVytvoreniOde.'+namespace, 'form', function(evt, ode_data) {
				var $element = $(evt.target).closest('.js-io-element');
				if (ode_data.chyba) {
					is.Zdurazneni.chyba(ode_data.chyba);
				} else {
					_load_operation('elp_ode', {
						operace: 'elp_ode',
						ode_id: ode_data.zalozeny_ode,
					});
				}
			});
	};

	/*
	 * 	Inicializuje udalost zalozeni osnovu.
	 *
	 * 	is.ElPruvodce.init_osnovy({
	 *		cover_elm : selector || elm || jQuery	# rodic s formularem odevzdavarn
	 * 	});
	 */
	modul.init_osnovy = function (opt) {
		var $cover = $(opt.cover_elm);

		if (!$cover.length) {
			console.error('Nenalezen obal obsahujici formular (ocekava se selector tzn. napr. "#prvek_46542").', opt.cover_elm);
			return;
		}

		$cover
			.off('.'+namespace)
			.on('submit.'+namespace, 'form', function (evt) {
				var $form = $(this);
				evt.preventDefault();

				_load_operation('elp_osnova', $form.serializeArray());
			});
	};

	modul.init_copy = function (opt) {
		var $cover = $(opt.cover_elm);

		if (!$cover.length) {
			console.error('Nenalezen obal obsahujici formular (ocekava se selector tzn. napr. "#prvek_46542").', opt.cover_elm);
			return;
		}

		$cover
			.off('.'+namespace)
			.on('submit.'+namespace, 'form', function (evt) {
				var $form = $(this);
				evt.preventDefault();

				_load_operation('elp_copy', $form.serializeArray());
			});
	};

	return modul;
}); // konec is.ElPruvodce

is.Define.module('ElHtmlEditor', function (namespace, $) {
	var default_opt;

	return {
		// zinicializuje html editor na vsech prvcich oznacenych tridou .odpo_init_html_editor
		init: function () {
			$('.odpo_init_html_editor').each(function () {
				var opt = $.extend(true, {}, is.ElHtmlEditor.get_default_opt());

				$(this).htmlEditor(opt);
			});
		},

		// zinicializuje jeden html editor
		// 	opt.textarea_elm
		init_one: function (opt) {
			var editor_opt = $.extend(true, {}, is.ElHtmlEditor.get_default_opt());

			$(opt.textarea_elm).htmlEditor(editor_opt);
		},

		// musi se volat az po document.ready aby byly nacteny ldb
		get_default_opt: function () {
			return 	default_opt = default_opt || {
				textarea_trigger_change: true,
				forbid_img_upload: true,
				toolbar_order : [
					'undo', 'redo', '|',
					'format', '|',
					'bold', 'italic', 'underline', 'strikeThrough', 'removeFormat', 'subscript', 'superscript', '|',
					'justifyLeft', 'justifyCenter', 'justifyRight', '|',
					'insertOrderedList', 'insertUnorderedList', "rightIndent", "leftIndent", '|',
					'insertHorizontalRule', 'table', 'tex', '|',
					'code_on'
				],
				tools: {
					justifyCenter: {
						cmd: 'justifyCenter',
						label: '<i class="se-icon isi-editor-zarovnat-stred"></i>',
						description: is('ldb.' + namespace + '_icon_justifyCenter'),
					},
					justifyLeft: {
						cmd: 'justifyLeft',
						label: '<i class="se-icon isi-editor-zarovnat-vlevo"></i>',
						description: is('ldb.' + namespace + '_icon_justifyLeft'),
					},
					justifyRight: {
						cmd: 'justifyRight',
						label: '<i class="se-icon isi-editor-zarovnat-vpravo"></i>',
						description: is('ldb.' + namespace + '_icon_justifyRight'),
					},
					insertHorizontalRule: {
						cmd: 'insertHorizontalRule',
						label: '<i class="se-icon isi-minus"></i>',
						description: is('ldb.' + namespace + '_icon_insertHorizontalRule'),
					},
					subscript: {
						cmd: 'subscript',
						label: '<i class="se-icon isi-editor-index-dolni"></i>',
						description: is('ldb.' + namespace + '_icon_subscript'),
					},
					superscript: {
						cmd: 'superscript',
						label: '<i class="se-icon isi-editor-index-horni"></i>',
						description: is('ldb.' + namespace + '_icon_superscript'),
					},
				},
			};
		},
	};

}); // konec is.ElHtmlEditor

is.Define.module('ElTextWithOptions', function (namespace, $) {
	var default_opt;

	return {
		// zinicializuje plneni textu z moznosti na vsech prvcich oznacenych tridou .odpo_text_with_options
		init: function () {
			$('.odpo_text_with_options')
				.each(function () {
					// hack pro editaci u ktere je kvuli chybove hlasce poitreba prohodit poradi prvku
					var $options_cover = $(this);
					var input_id = $options_cover.data('input-id');
					var $label = $('label[for="' + input_id + '"]');
					if ($label.length && $label[0] !== $options_cover.prev()[0]) {
						$label.after($options_cover);
					}
				})
				.off('.'+namespace)
				.on('click.'+namespace, '.odpo_text_option_selectable', function (evt) {
					var $cover = $(evt.delegateTarget);
					if ($cover.hasClass('readonly')) {
						return;
					}

					var $option = $(evt.currentTarget);
					var $input = $('#' + $cover.data('input-id'));
					is.ElTextWithOptions.toggle_state($cover, $option, $input);

					$input.trigger('change');
				});
		},

		toggle_state: function ($cover, $option, $input) {
			var $options = $cover.children('.odpo_text_options');
			var $used = $cover.children('.odpo_text_options_used');
			var $hidden = $cover.children('.odpo_text_options_layout');
			var used = $option.parent()[0] === $used[0];

			if (used) {
				var index = $option.data('text-option-index');
				$options.children().eq(index).append($option);
			} else {
				$used.append($option);
			}

			$input.val($used.children().map(function() { return $(this).text(); }).get().join(' '));
			$hidden.val($used.children().map(function() { return $(this).data('text-option-index'); }).get().join(','));
		},

		reset_options: function (odpo_text_with_options_elm) {
			var $cover = $(odpo_text_with_options_elm);
			var $used_children = $cover.children('.odpo_text_options_used').children();
			if (!$used_children.length) {
				return;
			}

			var $input = $('#' + $cover.data('input-id'));
			$used_children.each(function () {
				is.ElTextWithOptions.toggle_state($cover, $(this), $input);
			});
		},

		set_options_by_text: function (odpo_text_with_options_elm) {
			var $cover = $(odpo_text_with_options_elm);
			var $input = $('#' + $cover.data('input-id'));
			var input_val = $input.val();

			is.ElTextWithOptions.reset_options(odpo_text_with_options_elm);
			if (input_val === '') {
				return;
			}

			var $options_buttons = $cover.children('.odpo_text_options').find('.odpo_text_option_selectable');
			var options = $options_buttons.map(function () { return this.innerHTML; }).get();
			var used_options = is.ElTextWithOptions.guess_order_of_strings_in_sentence(input_val, options);
			if (!used_options) {
				return;
			}

			var index_used = {};
			var options_length = options.length;
			$.each(used_options, function () {
				var i;
				for (i = 0; i < options_length; ++i) {
					if (index_used[i]) {
						continue;
					}

					if (options[i] !== this) {
						continue;
					}

					is.ElTextWithOptions.toggle_state($cover, $options_buttons.eq(i), $input);
					index_used[i] = true;
				}
			});

			$input.trigger('change');
		},

		guess_order_of_strings_in_sentence: function (sentence, strings) {
			var strings_count = (strings || []).length;
			var i, string, tmp_sentence, tmp_strings;

			if (sentence === '') {
				return [];
			}

			if (!strings_count) {
				return;
			}

			for (i = 0; i < strings_count; ++i) {
				string = strings[i];
				if ((sentence.toLowerCase() + ' ').indexOf(string.toLowerCase() + ' ') !== 0) {
					continue;
				}

				tmp_sentence = sentence.substring(string.length).replace(/^\s+/, '');
				tmp_strings = strings.slice(0, i).concat(strings.slice(i + 1));
				tmp_strings = is.ElTextWithOptions.guess_order_of_strings_in_sentence(tmp_sentence, tmp_strings);
				if (tmp_strings) {
					return [ string ].concat(tmp_strings);
				}
			}

			return;
		},
	};

}); // konec is.ElTextWithOptions

is.Define.module('ElQdefxEdit', function (namespace, $) {
	var cache_solution;
	var cache_settings;
	var templates = {};

	var module = {
		init: function () {
			$(document)
				.off('.'+namespace)
				.on('change.'+namespace, '.odpo_edit_form_percent', _evt_change_percent)
				.on('click.'+namespace, '.odpo_edit_settings_edit', _evt_edit_settings)
				.on('click.'+namespace, '.odpo_edit_solution_add', { action: 'add' }, _evt_edit_solution)
				.on('click.'+namespace, '.odpo_edit_solution_edit', { action: 'edit' }, _evt_edit_solution)
				.on('click.'+namespace, '.odpo_edit_solution_delete', function (evt) {
					$(evt.target).closest('.odpo_edit_solution').remove();
				})
				.on('click.'+namespace, '.odpo_edit_answer_add', { action: 'add' }, _evt_edit_answer)
				.on('click.'+namespace, '.odpo_edit_answer_edit', { action: 'edit' }, _evt_edit_answer)
				.on('click.'+namespace, '.odpo_edit_answer_delete', function (evt) {
					$(evt.target).closest('.odpo_edit_answer').remove();
				})
				.on('change.'+namespace, '.odpo_modal_form_edit_answer .input_group', _evt_answer_change_group)
				.on('change.'+namespace, '.odpo_modal_form_edit_answer .input_external', _evt_answer_change_external)
				.on('submit.'+namespace, '.odpo_modal_edit form', function (evt) {
					evt.preventDefault();
				})
				.on('formvalid.zf.abide.'+namespace, '.odpo_modal_form_edit_answer', _evt_formvalid_answer);

			if (cache_solution) {
				cache_solution.$form
					.off('.'+namespace)
					.on('formvalid.zf.abide.'+namespace, _evt_formvalid_solution);

				cache_solution.$type
					.off('.'+namespace)
					.on('change.'+namespace, _evt_solution_change_type);
			}

			if (cache_settings) {
				cache_settings.$form
					.off('.'+namespace)
					.on('formvalid.zf.abide.'+namespace, _evt_formvalid_settings);
			}
		},

		set_modal_settings_elm: function (modal_settings_elm) {
			if (cache_settings) {
				return;
			}

			cache_settings = {};
			cache_settings.$modal = $(modal_settings_elm);
			cache_settings.$form = cache_settings.$modal.find('form');
			cache_settings.$inputs = cache_settings.$form.find(':input').not(':button,:submit,:reset');
			cache_settings.$textarea = $();

			module.init();
		},

		set_modal_solution_elm: function (modal_solution_elm) {
			if (cache_solution) {
				return;
			}

			cache_solution = {};
			cache_solution.$modal = $(modal_solution_elm);
			cache_solution.$form = cache_solution.$modal.find('form');
			cache_solution.$inputs = cache_solution.$form.find('.odpo_edit_solution_form_inputs_cover').find(':input[name]').not(':button,:submit,:reset');
			cache_solution.$textarea = cache_solution.$inputs.filter('textarea');
			cache_solution.$type = cache_solution.$inputs.filter('[name="type"]');
			cache_solution.$answers_cover = cache_solution.$form.find('.odpo_edit_solution_form_answers_cover');
			cache_solution.$points_cover = cache_solution.$form.find('.odpo_edit_form_points_cover');
			cache_solution.$points_cover_povinne = cache_solution.$points_cover.find('.povinne');
			cache_solution.$points_cover_inputs = cache_solution.$points_cover.find(':input');
			cache_solution.$points = cache_solution.$points_cover_inputs.filter('[name="points"]');

			module.init();
		},

		set_template: function (key, html) {
			templates[key] = html;
		},
	};

	function _get_cache_answer_modal (elm) {
		var $modal = $(elm).closest('.reveal');
		var cache_key = 'cache_answer_modal';
		var cache = $modal.data(cache_key);
		if (cache == null) {
			cache = {};
			cache.$modal = $modal;
			cache.$form = $modal.find('form');
			cache.$inputs = cache.$form.find(':input').not(':button,:submit,:reset');
			cache.$group = cache.$inputs.filter('[name="group"]');
			cache.$group_options = cache.$group.children('option');
			cache.$inputs_covers = cache.$form.find('.input_cover');
			cache.$inputs_in_covers = cache.$inputs_covers.find(':input');
			cache.$textarea = $();
			cache.$input_external = cache.$inputs.filter('.input_external');
			cache.$inputs_external_param = cache.$inputs.filter('.input_external_param');
			cache.$text_with_options = cache.$form.find('.odpo_text_with_options');
			$modal.data(cache_key, cache);
		}

		return cache;
	}

	function _evt_solution_change_type (evt) {
		var $input = $(evt.currentTarget);
		var value = $input.val();
		var hide = value === 'comment';
		var required = value === 'partial';

		var validators = cache_solution.$points.attr('data-validator');
		validators = is.Misc[required ? 'add_words' : 'remove_words'](validators, 'required');
		cache_solution.$points.attr('data-validator', validators);
		cache_solution.$form.foundation('removeErrorClasses', cache_solution.$points);

		cache_solution.$points_cover.toggleClass('hide', hide);
		cache_solution.$points_cover_povinne.toggleClass('hide', !required);
		cache_solution.$points_cover_inputs.prop('disabled', hide);
	}

	function _evt_change_percent (evt) {
		var $percent = $(evt.currentTarget);
		var step = $percent.is(':checked') ? 10 : 1;
		$percent.closest('.input-group-label').siblings('.input-group-field').data('step', step);
	}

	function _get_selector_by_group_option ($option) {
		var data = $option.data();
		var selector = '.type_' + data.type;
		if (data.options != null) {
			selector += '.options_' + data.options;
		}

		return selector;
	}

	function _evt_answer_change_group (evt) {
		var cache = _get_cache_answer_modal(evt.currentTarget);

		cache.$inputs_covers.addClass('hide');
		cache.$inputs_in_covers.prop('disabled', true);

		cache.$inputs_covers.filter(_get_selector_by_group_option(cache.$group_options.filter(':selected')))
			.removeClass('hide')
			.find(':input')
				.prop('disabled', false)
				.filter('.input_external').trigger('change.'+namespace);
	}

	function _evt_answer_change_external (evt) {
		var cache = _get_cache_answer_modal(evt.currentTarget);
		var disabled = !cache.$input_external.is(':checked');
		cache.$inputs_external_param.prop('disabled', disabled);
	}

	function _reset_form (cache) {
		cache.$form.trigger('reset');
		cache.$textarea.each(function () {
			$(this).closest('.html-editor').htmlEditor('set_value', '');
		});
	}

	function _set_inputs_values_by_hiddens(cache, $hiddens) {
		cache.$inputs.each(function () {
			var $input = $(this);
			var name = $input.attr('name');
			var $hidden = $hiddens.filter('[name$="_' + name + '"]');
			var value;

			if (!$hidden.length) {
				return;
			}

			value = $hidden.val();
			if ($input.is(':radio,:checkbox')) {
				$input.filter('[value="' + value + '"]').prop('checked', true);
			} else {
				$input.val(value);
			}
		});

		cache.$textarea.each(function () {
			var $textarea = $(this);
			$textarea.closest('.html-editor').htmlEditor('set_value', $textarea.val());
		});
	}

	function _trigger_init_change($inputs) {
		$inputs.filter('.odpo_edit_init_change').not('[disabled]').trigger('change.'+namespace);
	}

	function _evt_edit_settings(evt) {
		var $button = $(evt.currentTarget);
		var $orig_hiddens = $button.closest('.odpo_edit_settings').find('.odpo_edit_setting_cover').children(':input[type="hidden"]');
		var opt = {};

		opt.$button = $button;
		opt.cgi_param_setting = $button.closest('.odpo_edit_settings').find('.odpo_edit_setting_cgi_param').val();

		cache_settings.$modal.data('edit_opt_settings', opt);
		_reset_form(cache_settings);

		_set_inputs_values_by_hiddens(cache_settings, $orig_hiddens.filter('[name^="' + opt.cgi_param_setting + '_"]'));

		_trigger_init_change(cache_settings.$inputs);
		cache_settings.$modal.foundation('open');
	}

	function _evt_formvalid_settings() {
		var opt = cache_settings.$modal.data('edit_opt_settings');
		var serialize_array = cache_settings.$inputs.serializeArray();
		var $cover = opt.$button.next();
		var settings = [];
		var pairs = {};
		$.each(serialize_array, function (i, hash) {
			pairs[hash.name] = hash.value;
		});

		$.each('ok nok null'.split(' '), function (i, type) {
			var name_points = type + '_points';
			var name_percent = type + '_percent';
			var points = pairs[name_points];
			if (points === '') {
				return;
			}

			settings.push(
				$('<input>').attr({
					type: 'hidden',
					name: opt.cgi_param_setting + '_' + name_points,
					value: points,
				})
			);
			if (pairs[name_percent] != null) {
				points += '%';
				settings.push(
					$('<input>').attr({
						type: 'hidden',
						name: opt.cgi_param_setting + '_' + name_percent,
						value: 1,
					})
				);
			}

			var label = $('label[for="' + cache_settings.$inputs.filter('[name$="' + name_points + '"]').attr('id') + '"]').text();
			settings.push(' ' + label + ' ' + points + ';');
		});

		$cover.empty();
		if (settings.length) {
			$cover.append(settings);
		}

		cache_settings.$modal.foundation('close');
	}

	function _evt_edit_solution(evt) {
		var $button = $(evt.currentTarget);
		var cgi_param_question = $button.closest('.odpo_edit_root').find('.odpo_edit_root_param_prefix').val();
		var cache_answer = _get_cache_answer_modal('#' + cgi_param_question + '_modal_answer_edit');
		var opt = {
			action: evt.data.action,
			$button: $button,
			cgi_param_solution: $button.closest('.odpo_edit_solutions').find('.odpo_edit_solution_cgi_param').val(),
			cache_answer: cache_answer,
		};
		var $orig_hiddens;

		cache_solution.$modal.data('edit_opt_solution', opt);
		cache_answer.$modal.data('edit_opt_solution', opt);

		cache_solution.$answers_cover.empty();
		_reset_form(cache_solution);
		if (opt.action === 'add') {
			opt.cgi_param_solution_prefix = is.Misc.uniq_id();
		} else if (opt.action === 'edit') {
			$orig_hiddens = opt.$button.closest('.odpo_edit_solution').find('.odpo_edit_solution_hiddens').children(':input[type="hidden"]');
			opt.cgi_param_solution_prefix = $orig_hiddens.filter('[name="' + opt.cgi_param_solution + '"]').val();
			_set_inputs_values_by_hiddens(cache_solution, $orig_hiddens.filter('[name^="' + opt.cgi_param_solution_prefix + '_"]'));

			$orig_hiddens.filter('[name="' + opt.cgi_param_solution_prefix + '_answer"]').map(function () {
				var cgi_param_answer_prefix = $(this).val();
				var $hiddens = $orig_hiddens.filter('[name^="' + cgi_param_answer_prefix + '_"]');
				var serialize_array = $.map($hiddens.serializeArray(), function (hash) {
					hash.name = hash.name.replace(cgi_param_answer_prefix + '_', '');
					return hash;
				});
				_answer_to_edit_html(cache_answer, cgi_param_answer_prefix, serialize_array)
					.appendTo(cache_solution.$answers_cover);
			});
		}

		_trigger_init_change(cache_solution.$inputs);
		cache_solution.$modal.foundation('open');
	}

	function _evt_formvalid_solution() {
		var opt = cache_solution.$modal.data('edit_opt_solution');
		var $solution = $(templates.solution);
		var serialize_array = cache_solution.$inputs.serializeArray();
		var caption = '';
		var comment = '';
		var valid = true;

		if (!cache_solution.$answers_cover.children().length) {
			valid = false;
			is.Zdurazneni.chyba('žádná odpověď.', { fade_out: true, stack: false });	// TODO překlad
		}

		if (!valid) {
			return;
		}

		serialize_array = $.grep(serialize_array, function (hash) {
			if (hash.name === 'objects' && hash.value === '<br>') {
				return;
			}

			if ($.trim(hash.value) === '') {
				return;
			}

			return true;
		});

		$.each(serialize_array, function (i, hash) {
			switch (hash.name) {
				case 'type':
					caption += hash.value;
					break;
				case 'points':
					caption += ' ' + hash.value;
					break;
				case 'percent':
					caption += '%';
					break;
				case 'exactly':
					caption += ' ex';
					break;
				case 'objects':
					comment = hash.value;
					break;
			}
		});

		$solution.find('.odpo_edit_solution_hiddens').append(
			$('<input>').attr({
				type: 'hidden',
				name: opt.cgi_param_solution,
				value: opt.cgi_param_solution_prefix,
			}),
			$.map(serialize_array, function (hash) {
				return $('<input>').attr({
					type: 'hidden',
					name:  opt.cgi_param_solution_prefix + '_' + hash.name,
					value: hash.value,
				});
			}),
			cache_solution.$answers_cover.find(':input[type="hidden"]')
		);

		$solution.find('.odpo_edit_solution_caption').text(caption);
		$solution.find('.odpo_edit_solution_comment').html(comment);
		$solution.find('.odpo_edit_solution_answers').append(
			cache_solution.$answers_cover.children().map(function () {
				return '<li>' + $(this).find('.odpo_edit_answer_text_cover').html();
			})
			.get()
			.join('')
		);

		if (opt.action === 'add') {
			opt.$button.prev().append($solution);
		} else if (opt.action === 'edit') {
			opt.$button.closest('.odpo_edit_solution').replaceWith($solution);
		}

		cache_solution.$modal.foundation('close');
	}

	function _evt_edit_answer(evt) {
		var $button = $(evt.currentTarget);
		var opt_solution = cache_solution.$modal.data('edit_opt_solution');
		var cache = opt_solution.cache_answer;
		var opt = {
			action: evt.data.action,
			$button: $button,
		};
		var $orig_hiddens;

		cache.$modal.data('edit_opt_answer', opt);

		_reset_form(cache);
		if (opt.action === 'add') {
			opt.cgi_param_answer_prefix = is.Misc.uniq_id();
		} else if (opt.action === 'edit') {
			$orig_hiddens = opt.$button.closest('.odpo_edit_answer').find('.odpo_edit_answer_hidden_cover').children(':input[type="hidden"]');
			opt.cgi_param_answer_prefix = $orig_hiddens.filter('[name="' + opt_solution.cgi_param_solution_prefix + '_answer"]').val();
			_set_inputs_values_by_hiddens(cache, $orig_hiddens.filter('[name^="' + opt.cgi_param_answer_prefix + '_"]'));
		}

		cache.$text_with_options.each(function () {
			is.ElTextWithOptions.set_options_by_text(this);
		});

		_trigger_init_change(cache.$inputs);
		cache.$modal.foundation('open');
	}

	function _evt_formvalid_answer(evt) {
		var cache = _get_cache_answer_modal(evt.currentTarget);
		var opt = cache.$modal.data('edit_opt_answer');
		var opt_solution = cache.$modal.data('edit_opt_solution');
		var serialize_array = cache.$form.serializeArray();
		var $answer = _answer_to_edit_html(cache, opt.cgi_param_answer_prefix, serialize_array);
		var $all_answers = cache_solution.$answers_cover.children();
		var all_serialize = {};
		var all_groups = {};
		var valid = true;
		var $orig_answer;

		if (opt.action === 'edit') {
			$orig_answer = opt.$button.closest('.odpo_edit_answer');
			$all_answers = $all_answers.not($orig_answer);
		}

		if ($all_answers.length) {
			$.each([$answer].concat($all_answers.get()), function () {
				var $hidden = $(this).find('[name="' + opt_solution.cgi_param_solution_prefix + '_answer"]');
				var cgi_param_answer_prefix = $hidden.val();
				var $hiddens = $hidden.siblings('[name^="' + cgi_param_answer_prefix + '_"]');

				if ($hidden.data('group_input_type') !== 'checkbox') {
					var group = $hiddens.filter('[name$="_group"]').val();
					if (all_groups[group]) {
						valid = false;
						is.Zdurazneni.chyba('Skupina „' + group + '“ se již v řešení vyskytuje.', { fade_out: true, stack: false });	// TODO překlad
						return false;
					}
					all_groups[group] = true;
				}

				var serialize_array = $.map($hiddens.serializeArray(), function (hash) {
					hash.name = hash.name.replace(cgi_param_answer_prefix + '_', '');
					return hash;
				});
				serialize_array.sort(function (a, b) {
					return a.name.localeCompare(b.name);
				});
				var serialize = $.param(serialize_array, true);
				if (all_serialize[serialize]) {
					valid = false;
					is.Zdurazneni.chyba('Duplicitní odpověď.', { fade_out: true, stack: false });	// TODO překlad
					return false;
				}
				all_serialize[serialize] = true;
			});
		}

		if (!valid) {
			return;
		}

		if (opt.action === 'add') {
			opt.$button.prev().append($answer);
		} else if (opt.action === 'edit') {
			$orig_answer.replaceWith($answer);
		}

		cache.$modal.foundation('close');
	}

	function _answer_to_edit_html(cache, cgi_param_answer_prefix, serialize_array) {
		var opt_solution = cache.$modal.data('edit_opt_solution');
		var $html = $(templates.edit_solution_answer);
		var pairs = {};
		$.each(serialize_array, function (i, hash) {
			pairs[hash.name] = hash.value;
		});

		$html.children('.odpo_edit_answer_text_cover').html(_answer_pairs_to_html(cache, pairs));
		$html.children('.odpo_edit_answer_hidden_cover').append(
			$('<input>').attr({
				type: 'hidden',
				name: opt_solution.cgi_param_solution_prefix + '_answer',
				value: cgi_param_answer_prefix,
				'data-group_input_type': cache.$group_options.filter('[value="' + pairs.group + '"]').data('type'),
			}),
			$.map(serialize_array, function (hash) {
				return $('<input>').attr({
					type: 'hidden',
					name:  cgi_param_answer_prefix + '_' + hash.name,
					value: hash.value,
				});
			})
		);

		return $html;
	}

	function _answer_pairs_to_html (cache, pairs) {
		var input_str, answer_html, label_content, $options_cover;

		input_str = pairs.group;
		if (pairs.key != null) {
			input_str += '&nbsp;(' + pairs.key + ')';

			$options_cover = cache.$form
				.find(_get_selector_by_group_option(cache.$group_options.filter('[value="' + pairs.group + '"]')));
			if ($options_cover.data('options_name') != null) {
				input_str += '&nbsp;[' + $options_cover.data('options_name') + ']';
			}

			label_content = $options_cover
				.find(':radio[name="key"][value="' + pairs.key + '"]')
				.parent()
				.find('.label_content')
				.html();

			answer_html = label_content;
		} else if (pairs.value != null) {
			if (pairs.value !== '') {
				answer_html = is.Misc.c(pairs.value);
			} else {
				answer_html = '<em class="nedurazne">' + 'Prázdný text' + '</em>'; // TODO ldb
			}
		} else if (pairs.check_type === 'number') {
			if (pairs.check_to == null || pairs.check_to === pairs.check_from) {
				answer_html = pairs.check_from;
			} else {
				answer_html = '<span class="nedurazne" title="' + 'Číslo z&nbsp;intervalu od&ndash;do včetně.' + '">'; // TODO ldb
				answer_html += 	'&lt;';
				answer_html += 	'<span class="barvacerna">' + pairs.check_from + '</span>';
				answer_html += 	'; ';
				answer_html += 	'<span class="barvacerna">' + pairs.check_to + '</span>';
				answer_html += 	'&lt;';
				answer_html += '</span>';
			}
		} else if (pairs.check_type === 'external') {
			answer_html = is.Misc.c(pairs.check_service + ': ' + pairs.check_correct);
		}

		if (pairs.negate === 'true') {
			if (answer_html == null) {
				answer_html = '<em class="nedurazne">' + 'Prázdný text' + '</em>'; // TODO ldb
			}

			answer_html = '<strike>&nbsp;' + answer_html + '&nbsp;</strike>';
		}

		return input_str + '; ' + answer_html;
	}

	return module;
});

is.Define.module('ElPreviewQuestion', function (namespace, $) {
	var modul = {};

	modul.init_solution_highlight = function () {
		$('.odpo_otazka_preview_part_solutions')
			.off('.'+namespace+'_otazka_preview_part_solutions')
			.on('mouseenter.'+namespace+'_otazka_preview_part_solutions'+' mouseleave.'+namespace+'_otazka_preview_part_solutions', 'td, caption, fieldset, .odpo_solution_feedback', function (evt) {
				var $target, $td_list, $tr_list, content, title, input_id_list, $input_list, method, $fieldset, $comment, $comment_matched, $solution;

				$target = $(this);
				if ($target.is('fieldset')) {
					$target = $target.find('caption');
				} else if ($target.closest('fieldset, .odpo_otazka_preview_part_solutions').is('fieldset')) {
					$fieldset = $target.closest('fieldset');
					if (evt.type === 'mouseenter') {
						$fieldset.trigger('mouseleave.'+namespace+'_otazka_preview_part_solutions');
					}
				}

				if ($target.hasClass('odpo_solution_feedback') || $target.is('caption')) {
					$solution = $target.closest('.odpo_preview_part_solution')
					$comment = $solution.find('.odpo_solution_feedback');
					$tr_list = $solution.find('.odpo_preview_part_solution_table').find('tr');
					$td_list = $tr_list.children();

					$comment_matched = $solution.map(function () {
						var solution_ident = $(this).data('solution-ident');
						return [].slice.call(document.getElementsByClassName('odpo_solution_match_feedback_item_ident_' + solution_ident));
					});

					$td_list = $td_list.add($comment).add($comment_matched);
					$input_list = $tr_list.map(function () {
						var id = $(this).data('input-id');
						return document.getElementById(id);
					});
				} else {
					content = $target.text();
					if (content === '') {
						 title = $target.children('i').attr('title');
					}

					$td_list = $target
							.closest('.odpo_otazka_preview_part_solutions')
								.find('td:nth-child(' + ($target.index() + 1) + ')')
								.filter(function () {
									return content === ''
										? $(this).children('i').attr('title') === title
										: $(this).text() === content;
								});

					input_id_list = $td_list.parent().map(function () { return $(this).data('input-id'); });
					input_id_list = $.uniqueSort(input_id_list.get());

					$input_list = $($.map(input_id_list, function (id) { return document.getElementById(id); }));
				}

				_change_highlight(evt, $input_list, $td_list);

				if ($fieldset && evt.type === 'mouseleave') {
					$fieldset.trigger('mouseenter.'+namespace+'_otazka_preview_part_solutions');
				}
			});

		$('.odpo_otazka_telo')
			.off('.'+namespace+'_otazka_telo')
			.on('mouseenter.'+namespace+'_otazka_telo'+' mouseleave.'+namespace+'_otazka_telo', 'input, select, textarea, label, .odpo_input_substitution, .html-editor', function (evt) {
				var $input, $td_list;
				var $target = $(this);

				if ($target.parent().is('label')) {
					return;
				}

				if ($target.hasClass('odpo_input_substitution')) {
					$input = $('#' + $target.data('input-id'));
				} else if ($target.is('label')) {
					$input = $target.find('input, select, textarea').first();
				} else {
					$input = $target;
				}

				if ($input.is('.readonly-clone')) {
					$input = $input.next();
				}

				$td_list = $(".odpo_preview_part_solution_input_row_" + $input.attr('id')).map(function () {
					var $self = $(this);

					if ($self.closest('.preview_otazka_zdroj_rozklikavatko').hasClass('hide')) {
						return [];
					}

					if ($self.is('tr')) {
						return $self.children('td').get();
					}

					return this;
				});
				if (!$td_list.length) {
					return;
				}

				_change_highlight(evt, $input, $td_list);
			});

		$('.odpo_solution_match_feedback_item')
			.off('.'+namespace+'_solution_match_feedback_item')
			.on('mouseenter.'+namespace+'_solution_match_feedback_item'+' mouseleave.'+namespace+'_solution_match_feedback_item', function (evt) {
				var $target = $(this);

				$('.odpo_preview_part_solution_ident_' + $target.data('solution-ident')).find('.odpo_solution_feedback').trigger(evt.type+'.'+namespace+'_otazka_preview_part_solutions');
			});
	};

	function _change_highlight(evt, $input_list, $td_list) {
		var show_highlight = evt.type === 'mouseenter';

		var $box_list = $input_list.map(function () {
			var $parent;
			var $input = $(this);
			var data = $input.data();

			if (data.inputSubstitutionId) {
				return document.getElementById(data.inputSubstitutionId);
			}

			$input = data.jqueryReadonly || $input;
			$parent = $input.parent();
			if ($parent.is('label') || $parent.hasClass('input-group')) {
				return $parent[0];
			}

			return $input[0];
		});

		$box_list.toggleClass('box-highlight', show_highlight);
		$td_list.toggleClass('highlight', show_highlight);
	}

	return modul;
}); // konec ElPreviewQuestion

is.Define.class('ElConverter', function(namespace, $) {
	var demo_content_rc = "Dusíkaté deriváty jsou\nalkoholy\n* fenoly\n* aminy\n\nKyslík obsahují\naminy\n* fenoly";
	var demo_content_ah = "Dusíkaté deriváty jsou\n\nKyslík obsahují";
	var regex_split_questions = /(?:\n\s*){2,}/;
	var regex_new_line = /\n/;
	var regex_line_start = /^/gm;
	var regex_ratio_all = /\:/g;
	var regex_dash_begin_lines = /^\-/gm;
	var regex_quest_begin_lines = /^\?/gm;
	var regex_questions_separator_on_end = /\s*--\s*$/;
	var questions_separator = "\n--\n";
	var was_first_init = false;
	var chars_for_rand_str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	function ElConverter (opt) {
		var self = this;
		var $cover = $(opt.cover_elm);
		var instance = $cover.data(namespace);

		if (instance) {
			return instance;
		}
		$cover.data(namespace, self);

		if (!was_first_init) {
			_first_init();
			was_first_init = true;
		}

		self.$cover = $cover;
		self.$target = $(opt.target_elm);
		self.uniq_key = namespace + '_' + is.Misc.uniq_id();

		self.cache_elms();
		self.bind_events();
		if (opt.active) {
			self.$cover.foundation('open');
		}
	}

	ElConverter.init = function (opt) {
		new ElConverter(opt);
	};

	function _first_init() {
		is.Forms.set_validator(namespace + '_some_error', 'error_msg',  function (val, $input) {
			return !$input.data(namespace + '_some_error');
		});
	}

	$.extend(ElConverter.prototype, {

		cache_elms: function () {
			var self = this;
			var $cover = self.$cover;
			var class_prefix = '.' + namespace + '_';

			jQuery.each($.trim(
				  'panel_type_c panel_type_rc panel_type_a panel_type_ah '
				+ 'panel_type_ah_counter_limit panel_type_ah_counter_limit_block '
				+ 'button_demo button_use button_source_clear '
				+ 'some_error form '
				+ 'type type_c_solution type_a_width type_a_height type_rc_warn_answer_count '
				+ 'type_ah_counter_type type_ah_counter_type_option_chars_block '
				+ 'points_ok points_nok '
				+ 'source result '
				).split(' '), function( _i, name ) {
					var $elm = self['$' + name] = $cover.find(class_prefix + name);
					if (!$elm.length) {
						console.error('Nepodarilo se nalezt ' + class_prefix + name, $cover.length);
					}
				}
			);

			self.$type_ah_counter_limit = self.$panel_type_ah_counter_limit.find(':input, button');
			self.$type_ah_counter_limit_block = self.$panel_type_ah_counter_limit_block.find(':input, button');
			self.$target_form = self.$target.closest('form');
		},

		bind_events: function () {
			var self = this;
			var odeslano = false;

			self.$cover.on('open.zf.reveal.'+namespace, function () {
				self.active = true;
				self.update_settings();
				self.$source.focus();
			});

			self.$cover.on('close.zf.reveal.'+namespace, function () {
				self.active = false;
			});

			self.$button_demo.on('click.'+namespace, function () {
				var source_val = $.trim(self.$source.val());

				if (	source_val !== ''
					&& source_val !== demo_content_rc
					&& source_val !== demo_content_ah
					&& !window.confirm("Nahráním dema se smaže sučasný obsah textového pole „Zjednodušený formát“.\nChcete přesto nahrát demo?")	// TODO ldb
				) {
					return;
				}

				if (source_val !== self.demo_content) {
					self.$source.val(self.demo_content);
					self.$source.trigger('change');
				}

				self.update_result();
			});

			self.$form.on('change.'+namespace, 'input, select', function () {
				self.update_settings();
				self.update_result();
			});

			self.$source.on('input.'+namespace, function () {
				self.update_result();
			});

			self.$button_use.on('click.'+namespace, function (evt) {
				if (!self.append_result_to_target()) {
					return;
				}

				if ($(this).hasClass('secondary')) {
					self.source_clear();
					self.$source.focus();
				} else {
					self.$cover.foundation('close');
				}
			});

			self.$button_source_clear.on('click.'+namespace, function (evt) {
				self.source_clear();
			});

			self.$target_form.storeSerialize();
			is.Design.add_unload(function () {
				var target_val, result_val;

				if (!odeslano) {
					if (self.$target_form.hasSerializeChanged().length) {
						return 'Neuložená data.';
					}

					if (self.active) {
						target_val = self.$target.val();
						result_val = self.$result.val();
						if (result_val !== '' && target_val.indexOf(result_val) < 0) {
							return 'Neuložená data.';
						}
					}
				}
			});

			self.$target_form.on('submit.'+namespace, function (evt) {
				var $target_form = $(this);
				var hiddens_class = self.uniq_key + '_hiddens';
				var result_val;

				$target_form.find('.' + hiddens_class).remove();
				$target_form.append(is.El.$hidden_inputs(
					self.$form.serializeArray(),
					hiddens_class
				));

				odeslano = true;
			});
		},

		update_settings: function () {
			var self = this;
			var type = self.$type.val();
			var type_ah_counter_type_val;

			self.type = type;

			self.$panel_type_c.addClass('hide');
			self.$panel_type_rc.addClass('hide');
			self.$panel_type_a.addClass('hide');
			self.$panel_type_ah.addClass('hide');
			self.$panel_type_ah_counter_limit.addClass('hide');
			self.$panel_type_ah_counter_limit_block.addClass('hide');
			self.$type_ah_counter_type.toggleAttr('disabled', true);
			self.$type_ah_counter_limit.toggleAttr('disabled', true);
			self.$type_ah_counter_limit_block.toggleAttr('disabled', true);
			self.$type_ah_counter_type_option_chars_block.toggleAttr('disabled', false);

			self.solution_type = null;
			switch (type) {
				// rc
				case 'c':
					self.$panel_type_c.removeClass('hide');
					self.solution_type = self.$type_c_solution.val();
				case 'r':
					self.$panel_type_rc.removeClass('hide');
					self.solution_type = self.solution_type || 'separate';
					self.type_rc_warn_answer_count = self.$type_rc_warn_answer_count.is(':checked');
					self.points_ok = self.$points_ok.val();
					self.points_nok = self.$points_nok.val();
					self.transform_fce = self.transform_to_rc;
					self.demo_content = demo_content_rc;
					break;
				// ah
				case 'a':
					self.$panel_type_a.removeClass('hide');
					self.type_a_width = self.$type_a_width.val();
					self.type_a_height = self.$type_a_height.val();
				case 'h':
					self.transform_fce = self.transform_to_ah;
					self.demo_content = demo_content_ah;
					self.$panel_type_ah.removeClass('hide');
					self.$type_ah_counter_type.toggleAttr('disabled', false);

					type_ah_counter_type_val = self.$type_ah_counter_type.val();
					if (type === 'h') {
						if (type_ah_counter_type_val === 'chars_block') {
							type_ah_counter_type_val = 'chars';
							self.$type_ah_counter_type.val(type_ah_counter_type_val);
						}

						self.$type_ah_counter_type_option_chars_block.toggleAttr('disabled', true);
					}

					if (type_ah_counter_type_val === 'chars_block') {
						self.$panel_type_ah_counter_limit_block.removeClass('hide');
						self.$type_ah_counter_limit_block.toggleAttr('disabled', false);
					} else if (type_ah_counter_type_val !== '') {
						self.$panel_type_ah_counter_limit.removeClass('hide');
						self.$type_ah_counter_limit.toggleAttr('disabled', false);
					}

					break;
			}

		},

		update_result: function () {
			var self = this;
			var source = $.trim(self.$source.val());
			var transform_result = !source ? {} : self.transform_fce(source);
			var value = (transform_result.questions || []).join(questions_separator);
			var some_error = !!transform_result.some_error;
			var result_val = self.$result.val();

			self.$some_error.val(some_error ? 1 : '');
			self.$result.data(namespace + '_some_error', some_error);
			if (result_val !== value) {
				self.$result.val(value);
				self.$result.trigger('change');
			}

			if (value === '' && self.$result.hasClass('is-invalid-input')) {
				self.$form.foundation('removeErrorClasses', self.$result);
			}
		},

		transform_to_rc: function (source) {
			var self = this;
			var type = self.type;
			var solution_type_not_separate = self.solution_type !== 'separate';
			var solution_type_ex = self.solution_type === 'oneline_ex';
			var questions = _parse_source(source);
			var ok = 'ok' + (self.points_ok === '' ? '' : ' ' + self.points_ok);
			var nok = (self.points_nok === '' ? '' : 'nok ' + self.points_nok);
			var warn_answer_count = self.type_rc_warn_answer_count;
			var answers_count = 0;
			var result = [];
			var some_error = false;

			$.each(questions, function (i, lines) {
				var question = _analyze_question_lines(lines);
				var solution = [];
				var solution_ok = '';
				var result_lines = [];
				var result_text;
				var error;

				// validate
				if (warn_answer_count) {
					answers_count = answers_count || question.answers.length;
				}

				error = _validate_question(question, answers_count);
				if (error) {
					result_lines.push('CHYBA: ' + error + "\n");	// TODO ldb
					some_error = true;
				}

				// vytvoreni otazky
				result_lines.push(question.task);
				$.each(question.answers, function (i, answer) {
					var mark = ':' + type + answer.id;

					if (answer.correct) {
						if (solution_type_not_separate) {
							solution_ok += mark;
						} else {
							solution.push(mark + ' ' + ok);
						}
					} else if (nok) {
						solution.push(mark + ' ' + nok);
					}

					result_lines.push('   ' + mark + ' ' +answer.label);
				});

				if (solution_type_not_separate) {
					solution_ok += ' ' + ok;

					if (solution_type_ex) {
						solution_ok += ' ex';
					}

					solution.unshift(solution_ok);
				}

				result_lines = result_lines.concat(solution);

				// prevedeni na text
				result_text = result_lines.join("\n");
				if (error) {
					result_text = result_text.replace(regex_line_start, '# ');
				}

				// zarazeni k ostatnim
				result.push(result_text);
			});

			return {
				questions	: result,
				some_error	: some_error,
			};
		},

		transform_to_ah: function (source) {
			var self = this;
			var type = self.type;
			var mark = '   :' + type;
			var add_counter = false;
			var counter_type = self.$type_ah_counter_type.val();
			var result, counter_limit;

			if (type === 'a') {
				 mark += '(' + self.type_a_width + 'x' + self.type_a_height + ')';
			}

			if (counter_type) {
				if (counter_type === 'chars_block') {
					counter_limit = self.$type_ah_counter_limit_block.val();
					add_counter = counter_limit > 0;
				} else {
					counter_limit = self.$type_ah_counter_limit.val();
					add_counter = true;
				}
			}

			result = $.map(_parse_source(source), function (lines) {
				var task = lines.join("\n");
				task = _make_secure_task(task);
				task += "\n" + mark;

				if (add_counter) {
					task = _wrap_by_counter(task, counter_type, counter_limit);
				}

				return task;
			});

			return {
				questions	: result,
			};
		},

		append_result_to_target: function () {
			var self = this;
			var target_val, result_val;

			if (!is.Forms.is_valid(self.$form)) {
				return false;
			}

			target_val = self.$target.val();
			result_val = self.$result.val();
			if (target_val.indexOf(result_val) >= 0) {
				is.Zdurazneni.chyba('Otázky nebyly přidány, protože je sada již obsahuje.', {	// TODO ldb
					fade_out: true,
					stack	: false,
				});
				return false;
			}

			target_val = $.trim(target_val);
			target_val = target_val.replace(regex_questions_separator_on_end, '');
			if (target_val) {
				target_val += questions_separator;
			}

			target_val += result_val;
			self.$target.val(target_val);
			self.$target.trigger('change');

			is.Zdurazneni.potvrzeni('Otázky byly přidány do sady.', {	// TODO ldb
				fade_out: true,
				stack	: false,
			});

			return true;
		},

		source_clear: function () {
			var self = this;
			var source_val = $.trim(self.$source.val());

			if (source_val !== '') {
				self.$source.val('');
				self.$source.trigger('change');
			}

			self.update_result();
		},
	});

	function _parse_source (source) {
		var questions = [];

		$.each(source.split(regex_split_questions), function (i, question_txt) {
			var lines = question_txt.split(regex_new_line);

			lines = $.map(lines, function (line) {
				return $.trim(line);
			});

			questions.push(lines);
		});

		return questions;
	}

	function _analyze_question_lines (lines) {
		var task = lines.shift();
		var answers = [];

		task = _make_secure_task(task);

		$.each(lines, function (i, line) {
			var id = i + 1;
			var prefix = line.substr(0, 1);
			var correct = false;

			if (prefix === '*') {
				correct = true;
				line = $.trim(line.substr(1));
			}

			line = _make_secure_answer(line);

			answers.push({
				id	: id,
				correct : correct,
				label	: line,
			});
		});

		return {
			task,
			answers,
		};
	}

	function _make_secure_answer (text) {

		text = text.replace(regex_ratio_all, '&#58;');

		return text;
	}

	function _make_secure_task (text) {

		text = _make_secure_answer(text);
		text = text.replace(regex_dash_begin_lines, '&ndash;');
		text = text.replace(regex_quest_begin_lines, '&#63;');

		return text;
	}

	function _validate_question (question, expect_answers_count) {
		var answers = question.answers;
		var answers_count = answers.length;
		var some_ok = false;
		var duplication = {};
		var duplication_found = [];

		if ($.trim(question.task) === '') {
			return 'Otázka nemá zadání.';	// TODO ldb
		}

		if (!answers_count) {
			return 'V otázce chybí odpovědi.';	// TODO ldb
		}

		if (expect_answers_count > 0 && answers_count !== expect_answers_count) {
			return 'Počet odpovědí u otázky (' + answers_count + ') neodpovídá očekávaní (' + expect_answers_count + ').';	// TODO ldb
		}

		$.each(answers, function (i, answer) {
			some_ok = some_ok || answer.correct;
			duplication[answer.label] = (duplication[answer.label] || 0) + 1;
		});

		if (!some_ok) {
			return 'Žádná odpověď nebyla označena za správnou.';	// TODO ldb
		}

		$.each(duplication, function (label, count) {
			if (count > 1) {
				duplication_found.push(label);
			}
		});

		if (duplication_found.length) {
			return ['Byly nalezeny duplicitní odpovědi.'].concat(duplication_found).join("\t\n");	// TODO ldb
		}

		return;
	}

	function _get_rand_str () {
		var result = '';

		while(result.length < 6) {
			result += chars_for_rand_str.substr(Math.floor(Math.random() * 62), 1);
		}

		return result;
	}

	function _wrap_by_counter (task, type, limit) {
		var result = '';
		var script = '';
		var info = '';
		var info_class = '';
		var ending = '';
		var rand_str = _get_rand_str();

		result += "<div id='otazka_" + rand_str + "'>";

		if (type === 'chars_block') {
			info_class = 'charCounter';
			script += "installCounterCB('otazka_" + rand_str + "', " + limit + "); countCharsLimitedBlock('otazka_" + rand_str + "', " + limit + ")";
		} else if (type === 'chars') {
			info_class = 'charCounter';
			if (limit) {
				script += "installCounterCL('otazka_" + rand_str + "', " + limit + "); countCharsLimited('otazka_" + rand_str + "', " + limit + ")";
			} else {
				script += "installCounterCU('otazka_" + rand_str + "'); countChars('otazka_" + rand_str + "')";
			}
		} else if (type === 'words') {
			info_class = 'wordCounter';
			if (limit) {
				script += "installCounterWL('otazka_" + rand_str + "', " + limit + "); countWordsLimited('otazka_" + rand_str + "', " + limit + ")";
			} else {
				script += "installCounterWU('otazka_" + rand_str + "'); countWordsUnlimited('otazka_" + rand_str + "')";
			}
		}

		info += '<p class="' + info_class + '" id="p_otazka_' + rand_str + '"> </p>';

		result += '<script type="text/javascript">';
		result += '$(document).ready(function(){' + script + '});</script>';

		ending += "</div>";

		return result + info + "\n" + task + "\n" + ending;
	}

	return ElConverter;

});

is.Define.module('ElMonitoring', function (namespace, $) {
	var module = {};
	var instances = [];
	var was_init = false;
	var apostrophe = '¨';
	var win = window;
	var $win = $(win);
	var doc = win.document;
	var $doc = $(doc);
	var win_size;
	var default_opt = {
		border_width: 10,
		grid_distance: 48.5,
	};

	namespace = '' + Math.round((Math.random() * 10000)) + '' + Math.round((Math.random() * 10000));

	$.each({

		init: function () {
			var onchange;

			if (was_init) {
				return;
			}
			was_init = true;

			win_size = {
				w: $win.width(),
				h: $win.height(),
			};

			$win
				.on('resize.'+namespace, { instances: instances, $win: $win, win_size: win_size }, function (evt) {
					var $win = evt.data.$win;
					var win_size = evt.data.win_size;
					var instances = evt.data.instances;
					var len = instances.length;
					var i = 0;
					var instance;

					win_size.w = $win.width();
					win_size.h = $win.height();
					for ( ; i < len; ++i) {
						instance = instances[i];
						instance.set_ref_line_left();
						instance.process_window_resize(evt, win_size);
					}
				})
				.on('scroll.'+namespace, { instances: instances }, function (evt) {
					var instances = evt.data.instances;
					var len = instances.length;
					var i = 0;
					var instance;
					for ( ; i < len; ++i) {
						instance = instances[i];
						instance.process_window_scroll(evt);
					}
				});

			$doc
				.on('mousemove.'+namespace, { instances: instances, win_size: win_size }, function (evt) {
					var win_size = evt.data.win_size;
					var instances = evt.data.instances;
					var len = instances.length;
					var i = 0;
					var instance;
					for ( ; i < len; ++i) {
						instance = instances[i];
						instance.process_mouse_move(evt, win_size);
					}
				})
				.on('keydown.'+namespace, { instances: instances }, function (evt) {
					var instances = evt.data.instances;
					var len = instances.length;
					var i = 0;
					var instance;
					for ( ; i < len; ++i) {
						instance = instances[i];
						instance.process_keys_log(evt);
					}
				})
				.on('focus.'+namespace, ':input', { instances: instances }, function (evt) {
					var $input = $(this);
					var instances = evt.data.instances;
					var len = instances.length;
					var i = 0;
					var instance;
					for (i = 0 ; i < len; ++i) {
						instance = instances[i];
						instance.process_inputs_log(evt, $input);
					}
				});

			onchange = (function (instances) {
				return function (evt) {
					var len = instances.length;
					var i = 0;
					var instance;
					for ( ; i < len; ++i) {
						instance = instances[i];
						instance.process_visibility_change(evt);
					}
				};
			})(instances);

			if (doc.hidden != null) {
				doc.addEventListener("visibilitychange", onchange);
			} else if (doc.mozHidden != null) {
				doc.addEventListener("mozvisibilitychange", onchange);
			} else if (doc.webkitHidden != null) {
				doc.addEventListener("webkitvisibilitychange", onchange);
			} else if (doc.msHidden != null) {
				doc.addEventListener("msvisibilitychange", onchange);
			} else if (doc.onfocusin != null) {
				doc.onfocusin = doc.onfocusout = onchange;
			} else {
				win.onpageshow = win.onpagehide = win.onfocus = win.onblur = onchange;
			}

		},

		init_one: function (opt) {
			var instance;

			module.init();
			instance = new ElMonitoring(opt);
			instance.set_window_size(win_size);

			return instances.push(instance);
		},

		serialize_one: function (id) {
			var instance = instances[id - 1];
			var result;

			if (!instance) {
				return '';
			}

			result = instance.get_log();

			if ($win.hasNotEvent('resize.'+namespace).length)	{ result.dr = 1; }
			if ($win.hasNotEvent('scroll.'+namespace).length)	{ result.ds = 1; }
			if ($doc.hasNotEvent('mousemove.'+namespace).length)	{ result.dm = 1; }
			if ($doc.hasNotEvent('keydown.'+namespace).length)	{ result.dk = 1; }

			return _stringify_object(result);
		},

	}, function (key, value) {
		Object.defineProperty(module, key, {
			value:		value,
			writable:       false,
			configurable:   false,
			enumerable:     true,
		});
	});

	function ElMonitoring (opt) {
		var self = this;

		self.opt = $.extend({}, default_opt, opt);

		self.$ref_line = $(self.opt.ref_line_elm);
		self.window_wihi = false;
		self.window_wihd = false;
		self.window_wdhi = false;
		self.window_wdhd = false;
		self.window_w = null;
		self.window_h = null;
		self.close_to_borders_last = false;
		self.close_to_borders_grid_point = null;
		self.scrolling = false;
		self.grid_point_index = 64;
		self.grid_point_index_digits = 0;

		self.grid = {};
		self.keys_log = {};
		self.inputs_log = {};
		self.mouse_null_coord_count = 0;
		self.visibility_changed_index = null;
		self.win_resize_index = null;

		self.set_ref_line_left();
	}

	$.extend(ElMonitoring.prototype, {

		get_log: function () {
			var self = this;
			var simple_grid = [];
			var simple_keys_log = [];
			var simple_inputs_log = [];
			var result = {};

			$.each(self.grid, function (coord, point) {
				simple_grid.push(
					_compress_point_index(point.i)
					+ ',' + coord
					+ ',' + _number_to_chars(point.c)
					+ (point.b ? ',' + _number_to_chars(point.b) : '')
				);
			});

			$.each(self.keys_log, function (key, value) {
				simple_keys_log.push(_compress_point_index(value) + ',' + key);
			});

			$.each(self.inputs_log, function (key, value) {
				simple_inputs_log.push(_compress_point_index(value) + ',' + key);
			});

			if (self.mouse_null_coord_count)	{ result.mn = _number_to_chars(self.mouse_null_coord_count);		}
			if (self.visibility_changed_index)	{ result.vc = _compress_point_index(self.visibility_changed_index);	}
			if (self.win_resize_index)		{ result.wr = _compress_point_index(self.win_resize_index);		}
			if (simple_keys_log.length)		{ result.kl = simple_keys_log;						}
			if (simple_inputs_log.length)		{ result.il = simple_inputs_log;					}
			if (simple_grid.length)			{ result.mg = simple_grid;						}

			return result;
		},

		set_window_size: function (win_size) {
			var self = this;

			self.window_w = win_size.w;
			self.window_h = win_size.h;
		},

		set_ref_line_left: function () {
			var self = this;

			self.ref_line_left = (self.$ref_line.offset() || { left: 0 }).left;
		},

		is_current_grid_point_index: function (point_index) {
			var self = this;

			return self.grid_point_index === (point_index || '').charCodeAt(self.grid_point_index_digits);
		},

		get_next_grid_point_index: function (point_index) {
			var self = this;
			var point_index_digits;

			point_index = point_index || '';
			point_index_digits = point_index.length;

			if (self.grid_point_index === 90 || point_index_digits > self.grid_point_index_digits) {
				self.grid_point_index = 64;
				++self.grid_point_index_digits;
			}

			for ( ; point_index_digits < self.grid_point_index_digits; ++point_index_digits) {
				point_index += '0';
			}

			point_index += String.fromCharCode(++self.grid_point_index);

			return point_index;
		},

		process_mouse_move: function (evt, win_size) {
			var self = this;
			var x = evt.clientX;
			var y = evt.clientY;
			var border_width, close_to_border;
			var grid_x, grid_y, grid_x_sign, grid_y_sign, grid_point_x, grid_point_y, grid_point_key, grid_point;

			if (x == null || y == null) {
				++self.mouse_null_coord_count;
				return;
			}

			grid_x = x - self.ref_line_left;
			grid_y = y;
			grid_x_sign = Math.sign(grid_x);
			grid_y_sign = Math.sign(grid_y);
			grid_point_x = grid_x_sign * ((Math.floor((grid_x_sign * grid_x) / (2 * self.opt.grid_distance)) * 2) + 1);
			grid_point_y = grid_y_sign * ((Math.floor((grid_y_sign * grid_y) / (2 * self.opt.grid_distance)) * 2) + 1);
			grid_point_key = grid_point_x + ',' + grid_point_y;
			grid_point = self.grid[grid_point_key];
			if (grid_point) {
				++grid_point.c;
				if (!self.is_current_grid_point_index(grid_point.i)) {
					grid_point.i = self.get_next_grid_point_index(grid_point.i);
				}
			} else {
				grid_point = self.grid[grid_point_key] = {
					i: self.get_next_grid_point_index(),
					b: 0,
					c: 1,
				};
			}

			border_width = self.opt.border_width;
			close_to_border = x < border_width || y < border_width || x > win_size.w - border_width || y > win_size.h - border_width;
			if (close_to_border !== self.close_to_borders_last) {
				if (close_to_border) {
					self.close_to_borders_grid_point = grid_point;
				} else {
					if (self.scrolling) {
						self.scrolling = false;
					} else {
						++self.close_to_borders_grid_point.b;
					}

					self.close_to_borders_grid_point = null;
				}
			}

			self.close_to_borders_last = close_to_border;
		},

		process_window_scroll: function (evt) {
			var self = this;

			if (self.close_to_borders_last && !self.scrolling) {
				self.scrolling = true;
			}
		},

		process_window_resize: function (evt, win_size) {
			var self = this;
			var w_diff = win_size.w - self.window_w;
			var h_diff = win_size.h - self.window_h;

			if (!w_diff && !h_diff) {
				return;
			}

			self.set_window_size(win_size);

			if (w_diff > 0) self.window_wdhi = self.window_wdhd = false;
			if (h_diff > 0) self.window_wihd = self.window_wdhd = false;
			if (w_diff < 0) self.window_wihi = self.window_wihd = false;
			if (h_diff < 0) self.window_wihi = self.window_wdhi = false;

			if (!self.window_wihi && !self.window_wihd && !self.window_wdhi && !self.window_wdhd) {
				self.win_resize_index = self.get_next_grid_point_index(self.win_resize_index);

				if (w_diff > 0) self.window_wihi = self.window_wihd = true;
				if (h_diff > 0) self.window_wihi = self.window_wdhi = true;
				if (w_diff < 0) self.window_wdhi = self.window_wdhd = true;
				if (h_diff < 0) self.window_wihd = self.window_wdhd = true;
			}
		},

		process_keys_log: function (evt) {
			var self = this;
			var special, key;

			if (evt.key.indexOf(apostrophe) >= 0) {
				return;
			}

			special = '' + (evt.ctrlKey?1:0) + (evt.altKey?1:0) + (evt.shiftKey?1:0) + (evt.metaKey?1:0);
			key = parseInt(special, 2) + ',' + (evt.keyCode == null ? '' : evt.keyCode) + ',' + (evt.key == null ? '' : evt.key);

			self.keys_log[key] = self.get_next_grid_point_index(self.keys_log[key]);
		},

		process_inputs_log: function (evt, $input) {
			var self = this;
			var name = $input.attr('name');
			var type, value, key;

			if (!name) {
				return;
			}

			type = $input.attr('type');
			if (type === 'checkbox' || type === 'radio') {
				value = $input.attr('value') || '';
			} else {
				value = '';
			}

			key = name + ',' + value;
			self.inputs_log[key] = self.get_next_grid_point_index(self.inputs_log[key]);
		},

		process_visibility_change: function () {
			var self = this;

			self.visibility_changed_index = self.get_next_grid_point_index(self.visibility_changed_index);
		},

	});

	function _number_to_chars (number) {
		var result;

		if (number < 0) {
			console.error(number);
			return '';
		}

		result = '';
		while (number) {
			result += String.fromCharCode(97 + (--number % 26));
			number = Math.floor(number / 26);
		}

		return result;
	}

	function _compress_point_index (point_index) {
		var len = point_index.length;
		var result = '';
		var pocet = 0;
		var i, actual_char, last_char;

		last_char = point_index[0];
		for (i = 1; i < len; ++i) {
			actual_char = point_index[i];
			if (last_char === actual_char) {
				++pocet;
			} else {
				result += last_char + _number_to_chars(pocet);
				pocet = 0;
				last_char = actual_char;
			}
		}

		result += last_char + _number_to_chars(pocet);

		return result;
	}

	function _stringify_object (object) {
		var result = [];

		$.each(object, function (key, value) {
			var i, len, tmp;

			if (Array.isArray(value)) {
				tmp = [];
				len = value.length;
				for (i = 0; i < len; ++i) {
					tmp.push(apostrophe + value[i] + apostrophe);
				}
				value = '[' + tmp.join(',') + ']';
			} else {
				value = apostrophe + value + apostrophe;
			}

			result.push(apostrophe + key + apostrophe + ':' + value);
		});

		return '{' + result.join(',') + '}';
	}

	return module;
});

is.Define.module('ElZpetnaVazba', function (namespace, $) {
	var ajax;

	return {
		init_edit_one: function (opt) {
			var $cover, $form;

			if (!is.Misc.is_valid_id(opt.cover_id)) {
				console.error('Neinicializovaly se udalosti editace obsahu zpětné vazby. Nevalidni id objektu (cover_id).', opt);
				return;
			}

			$cover = $('#'+opt.cover_id);

			if (!$cover.length) {
				console.error('Neinicializovaly se udalosti editace obsahu zpětné vazby. Nebyl nalezen prislusny objekt (cover_id).', opt);
				return;
			}

			$cover.closest('.odp_zv_cover').find('.vypln_zv').addClass('hide');


			// je zobrazen formular pro interakci s uzivatelem
			$form = $cover.find('form');
			$form.storeSerialize();
			$form.on('submit', function(e) {
				e.preventDefault();
			});

			var ajax = new is.Ajax({
				seq_request_skip: true,
				url: '/auth/elearning/test_ajax.pl',
			});


			is.Design.add_unload(function () {
				if ($form.closest(document.body).length && $form.hasSerializeChanged().length) {
					return 'Neuložená data.';
				}
			});

			$cover.on('click.'+namespace, '.zv_edit', function (evt) {
				ajax.send_form($form, {
					operace: $(this).data('operace'),
					bez_js_init: 1,
				}).done(function (data) {
					$.each(data.result || {}, function (typ, text) {
						is.Zdurazneni[typ](text, {fade_out: true});
					});
					if (data.html !== null) {
						$form.replaceWith(data.html);
						$form = $cover.find('form');
						$form.storeSerialize();
					}
				});
			});

			$cover.on('click.'+namespace, '.zv_delete', function (evt) {
				ajax.send_form($form, {
					operace: $(this).data('operace'),
				}).done(function (data) {
					$.each(data.result || {}, function (typ, text) {
						is.Zdurazneni[typ](text, {fade_out: true});
					});
					if (data.db_prazdna) {	// podarilo sa vymazat obsah
						$cover.closest('.odp_zv_cover').find('.vypln_zv').removeClass('hide');
						$cover.remove();
					} else {	// chyba
						// TODO
					}
				});
			});

			$cover.on('click.'+namespace, '.cancel_zv_edit', function (evt) {
				// TODO
				ajax.send_form($form, {
					operace: $(this).data('operace'),
				}).done(function (data) {
					$.each(data.result || {}, function (typ, text) {
						is.Zdurazneni[typ](text, {fade_out: true});
					});

					if (data.html !== null && !data.db_prazdna) {
						$form.replaceWith(data.html);
						$form = $cover.find('form');
						$form.storeSerialize();
					} else if (data.result.chyba === undefined) {	// V tomto pripade prazdne HTML neznamena chybu, checkneme hlasky
						$cover.closest('.odp_zv_cover').find('.vypln_zv').removeClass('hide');
						$cover.remove();
					}
				});
			});

			$cover.on('click.'+namespace, '.form_submit', function (evt) {
				if (!is.Forms.is_valid($form)) {
					return;
				}

				ajax.send_form($form, {
					operace: $(this).data('operace'),
				}).done(function (data) {
					$.each(data.result || {}, function (typ, text) {
						is.Zdurazneni[typ](text, {fade_out: true});
					});
					if (data.html !== null) {
						$form.replaceWith(data.html);
						$form = $cover.find('form');
						$form.find('[name="zv_zmeneno"]').val(data.zv_zmeneno);
						$form.storeSerialize();
					}

					/*
					// upravit hodnoty formulare pro dalsi editaci bez schovavani
					$form.find('[name="zv_zmeneno"]').val(data.zv_zmeneno);
					if (operace === 'smaz_zpetnu_vazbu') {
						$form.foundation('removeErrorClasses', $form.find('textarea'));
					}
					var $actual_content = $cover.find('.'+namespace+'ActualContent pre');
					$actual_content.stop().fadeTo(0, 0.25);
					if (data.db_prazdna) {
						$actual_content.html(data.obsah_current);
						$cover.find('[name="obsah"]').val('');
						$cover.find('[name="obsah"]').get(0).defaultValue = '';
					} else {
						$actual_content.text(data.obsah_current);
						$cover.find('[name="obsah"]').get(0).defaultValue = data.obsah_current;
					}
					$actual_content.stop().fadeTo(500, 1);

					var $hlasky = $cover.find('.'+namespace+'_hlasky');
					$hlasky.stop().fadeTo(0, 0.25);
					if ($hlasky.children().length) {
						$hlasky.children().replaceWith(data.html_hlasky);
					} else {
						$hlasky.append(data.html_hlasky);
					}
					$hlasky.stop().fadeTo(500, 1);
					*/
				});
			});

		},

		edit_all: function (opt) {
			$(document).on('click.'+namespace, '.edit_all', function () {
				var $self = $(this);
				var hash = {};
				var $covers = $();
				$('.'+namespace+'_form').each(function () {
					var $form = $(this);
					var poradi = $form.find('[name="poradi"]').val();
					var zv_zmeneno = $form.find('[name="zv_zmeneno"]').val();
					var obsah = is.Forms.get_input_val($form.find('[name="obsah"]'));

					if (obsah.length) {	// zaujimaju nas iba textareas ktore maju v sebe nejaky obsah
						hash[poradi] = [ obsah, zv_zmeneno ];
						$covers = $covers.add($form.closest('.odpo_zpetna_vazba_formular').parent());
					}

				});

				is.Ajax.request({
					url: '/auth/elearning/test_ajax.pl',
					data : {
						operace: 		'edit_zpetnu_vazbu_vsetky',
						obsahy: 		JSON.stringify(hash),
						pruchod_id:		$self.data('pruchod_id'),
						akce_id:		$self.data('akce_id'),
						typ:			'o',	// zatial sa pouziva iba tento typ, do buducna asi parametrizovat
						testurl:		$self.data('testurl'),
					},
				}).done(function (data) {
					$.each(data.result || {}, function (typ, text) {
						is.Zdurazneni[typ](text, {fade_out: true});
					});

					if (data.varovani != null && data.varovani.length) {
						// bez fade_out
						is.Zdurazneni.varovani(data.varovani);
					}

					var scrolled = false;
					// upravit hodnoty formulare pro dalsi editaci bez schovavani
					$covers.each(function () {
						var poradi = $(this).find('[name="poradi"]').val();

						if (typeof data.obsahy[poradi] !== 'undefined') {
							if (data.obsahy[poradi].html !== null) {
								$(this).replaceWith(data.obsahy[poradi].html);
								$(this).storeSerialize();
							}

							/*
							$form.find('[name="zv_zmeneno"]').val(data.obsahy[poradi].zv_zmeneno);
							var $actual_content = $(this).find('.'+namespace+'ActualContent pre');
							$actual_content.stop().fadeTo(0, 0.25);
							$actual_content.text(data.obsahy[poradi].obsah);
							$actual_content.stop().fadeTo(500, 1);
							var $hlasky = $(this).find('.'+namespace+'_hlasky');

							$hlasky.stop().fadeTo(0, 0.25);
							if ($hlasky.children().length) {
								$hlasky.children().replaceWith(data.obsahy[poradi].chyba);
							} else {
								$hlasky.append(data.obsahy[poradi].chyba);
							}
							$hlasky.stop().fadeTo(500, 1);

							if (!scrolled && typeof data.obsahy[poradi].chyba !== 'undefined' && data.obsahy[poradi].chyba.length) {
								is.HashNavigation.scrollTo($(this));
								scrolled = true;
							}
							*/
						}
					});
				});
			});
		},

	};
});
