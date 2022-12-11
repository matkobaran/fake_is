/**
 * is.js - js kniznica pre responzivny design
 *
 * Pristup k triedami a modulom cez jednotny namespace is.
 *
 * !!! PROSIM NEVKLADAT APLIKACNE ZAVISLY KOD!!!
 *
 * */

 "use strict";

 /**
  * Definicie namespacu 'is' a modulu Define, ktoreho verejne funkcie umoznuju
  * vytvarat triedy, moduly a properties v namespace is.
  */
 (function(window, $, undefined){
 
 // defaultny descriptor pre properties v 'is'
 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 var default_descriptor = {     // default descriptor values
     writable:       false, // zakaze assignment operator
     configurable:   false,
     enumerable:     true,
 };
 
 /**
  * Definicia is.
  *
  * Globalna premenna 'is' je namespace pre vsetky moduly, triedy a ine
  * properties. Je ju mozne volat ako funkciu, ktora sa sprava ako accessor
  * k properties 'is'.
  *
  * Signatura:
  *
  *	is(properties);
  *
  *		- properties, string teckou oddelene nazvy properties
  *
  * Priamy pristup standardnou teckovou notaci je mozny:
  *
  * 	is.ldb.chyba
  *
  * rozdiel pri pouziti:
  *
  * 	is('ldb.chyba');
  *
  * je v tom, ze v pripade, ze neexistuje ldb vypise chybu do konzole, ale
  * nevyhodi vyjimku.
  */
 function is(dot_selector) {
     var split = dot_selector.split('.');
 
     var tmp = is;
     for (var i = 0; i < split.length; ++i) {
         try {
             tmp = tmp[split[i]];
         } catch (e) {
             return undefined;
         }
     }
 
     return tmp;
 }
 
 // privatna metoda pre vytvorenie property nad 'is'
 function _defineProperty(name, value, descriptor) {
 
     descriptor = $.extend({}, default_descriptor, descriptor);
 
     descriptor.value = value;
 
     if (is.hasOwnProperty(name)) { // zabranim rewritu
         throw "Property '"+name+"' uz existuje!";
     }
 
     return Object.defineProperty(is, name, descriptor);
 }
 
 /**
  * Defaultne vytvori pomenovanu property v 'is', ktora je neprepisovatelna.
  *
  * is.Define.property(name, value, descriptor)
  *
  * - name, retazec - musi zacinat malym pismenom
  * - value - hodnota nesmie byt funkcia
  * - descriptor, objekt ES5 popis, viz param descriptor
  *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
  *
  * Funkcie vytvarajte v moduloch. Viz defineModule.
  */
 function defineProperty(name, value, descriptor) {
 
     if ($.isFunction(value)) {
         throw "Pokus o vytvorenie property typu function v is! Pouzite Define.module.";
     }
     if(!/^[a-z]/.test(''+name)) {
         throw "Nazov property ("+name+") v is musi zacinat s malym pismenom!";
     }
 
     return _defineProperty.apply(null, arguments);
 }
 
 /**
  * Vytvori triedu v mennom priestore 'is'.
  *
  * is.Define.class(name, func);
  * is.Define.class(name, parent_class_name, func);
  *
  * - name, retazec - nazov triedy zacinajuci velkym pismenom
  * - parent_class_name, retezec - nazev tridy od ktere trida 'name' ma dedit
  * - func(namespace) - funkcia obalujuca vlastnu definiciu triedy
  *   musi vratit konstruktor triedy
  *   parameter namespace je retazec v tvare 'is.'+name
  *
  * ! Pri dedeni je potreba zavolat konstruktor dedene tridy
  *   v konstruktoru tridy, ktera dedi.
  *	function TridaKteraDedi (a, b, c) {
  *		// nase konstrukce ktera nahrazuje
  *		// is.TridaZeKtereSeDedi.call(this, b, c);
  *		this.super(b, c);
  *		...
  *	}
  */
 function defineClass(name, parent_class_name, func) {
     var parent_class;
 
     if (typeof parent_class_name !== 'string') {
         func = parent_class_name;
         parent_class_name = undefined;
     }
 
     if (!$.isFunction(func)) {
         throw "Parameter 'func' musi byt typu function!";
     }
     if (!/^[A-Z]/.test(''+name)) {
         throw "Nazov triedy ("+name+") musi zacinat s velkym pismenom!";
     }
 
     var clas = func('is'+name, $);
 
     if (!$.isFunction(clas)) {
         throw "Navratova hodnota funkce predanej ako parameter 'func' musi byt typu function!";
     }
 
     if (parent_class_name) {
         if (!is.hasOwnProperty(parent_class_name)) {
             throw "Nenalezena trida, ze ktere se ma dedit!";
         }
 
         parent_class = is[parent_class_name];
         if (!$.isFunction(parent_class)) {
             throw "Trida, ze ktere se ma dedit, neni typu funkce!";
         }
 
         // kopie a rozsireni prototype
         clas.prototype = $.extend({}, parent_class.prototype, clas.prototype);
 
         // aby fungovalo instanceof
         Object.defineProperty(clas.prototype, 'constructor', {
             value: clas,
             enumerable: false,
             writable: true,
             configurable: true,
         });
 
         // metoda umoznujici volat konstruktor tridy z ktere se dedi
         Object.defineProperty(clas.prototype, 'super', {
             value: function () {
                 var clas_super = this.constructor.prototype.super;
 
                 this.constructor.prototype.super = parent_class.prototype.super;
                 parent_class.apply(this, [].slice.call(arguments));
                 this.constructor.prototype.super = clas_super;
             },
             enumerable: false,
             writable: true,
             configurable: true,
         });
     }
 
     return _defineProperty(name, clas);
 }
 
 /**
  * Vytvori modul v mennom priestore 'is'. Modul je mnozina funkcii.
  *
  * is.Define.module(name, func);
  *
  * - name, retazec - nazov modulu zacinajuci velkym pismenom
  * - func(namespace) - funkcia obalujuca vlastnu definiciu modulu
  *   musi vratit objekt modulu, tzn. objekt ktoreho properties su
  *   funkcie modulu
  *   parameter namespace je retazec v tvare 'is.'+name
  */
 function defineModule(name, func) {
 
     if (!$.isFunction(func)) {
         throw "Parameter 'func' musi byt typu function!";
     }
     if (!/^[A-Z]/.test(''+name)) {
         throw "Nazov modulu ("+name+") musi zacinat s velkym pismenom!";
     }
 
     var module = func('is'+name, $);
 
     if (!$.isPlainObject(module)) {
         throw "Navratova hodnota funkce parametru func musi byt typu object!";
     }
 
     return _defineProperty(name, module);
 }
 
 // definicia modulu 'Define'
 defineModule('Define', function() {
     return {
         property:	defineProperty,
         'class':	defineClass,
         module:		defineModule,
     };
 }); // konec is.Define
 
 // zverejnim is
 Object.defineProperty(window, 'is', $.extend(default_descriptor, { value: is }));
 
 })(window, jQueryF || jQuery); // konec definicie 'is'
 
 (function(is, $, window) { /* definicie dalsich modulov a tried is */
 
 /**
  * is modul pre pristup ku klientskej konzole
  */
 is.Define.module('Console', function(){
 
     var console_error_native = console.error; // ukradnem nativnu error fnci
 
     // prepisem nativni console.error
     console.error = function() {
         var args = arguments;
 
         if (is('session.debug') > 1) {
             console.info('Chyba neodoslana na server (pretoze debug > 1).');
             console_error_native.apply(this, args);
             return;
         }
 
         var msg = Object.keys(arguments).map(function(i) {
 
             var val = args[i];
             var type = $.type(val);
 
             switch (type) {
                 case "number":
                     if(isNaN(val)) {
                         val = "NaN";
                     } else if (!isFinite(val)) {
                         val = (0 > val ? '-' : '') + 'Infinity';
                     }
                     break;
                 case "function":
                 case "regexp":
                     val = val.toString();
                     break;
                 default:
                     if (val instanceof $) {
                         val = val.selector || (val.length ? val.map(function () { return this.toString(); }).get().join() : '');
                         val = "$('" + val + "')";
                     } else {
                         try {
                             val = JSON.stringify(val, null, '\t');
                         } catch (err) {
                             val = 'Nastala chyba v console.error: JSON.stringify(): ' + err;
                         }
                     }
             }
 
             return type + ': ' + val;
 
         }).join("\n");
 
         var trace;
         try {
             throw new Error();
         } catch(error) {
             trace = _is_error.trace(error, 1); // IE gets error.stack only after catch
         }
 
         _is_error.send(msg+"\n"+trace);
 
         var array = Array.prototype.slice.call(arguments);
         array.push(trace);
         console_error_native.apply(this, array);
     };
 
     return {
         // funkcia vypise hlasku do konzole ak je zvyseny debug rezim
         log:	function() {
             if (is('session.debug') > 1) {
                 console.log.apply(this, arguments);
             }
         },
         // funkcia vypise hlasku do konzole a tiez ju posle na server
         error: console.error, // exportuj ako is.Console.error
     };
 }); // konec is.Console
 
 /**
  * Modul pre dynamicke nacitavanie javascriptu.
  *
  * is.Require.js(js_file_url1, [, js_file_url2, ... ]).done(function(){
  *	// vsetky subory pripravene
  * });
  *
  * is.Require.css(css_file_url1, [, css_file_url2, ... ]);
  *
  * Funkcie vratia promise objekt, nad ktorym je mozne volat done, fail,
  * always.
  *
  * https://www.html5rocks.com/en/tutorials/speed/script-loading/
  */
 is.Define.module('Require', function(namespace, $){
 
     var present_js_files = {};
     var present_css_files = {};
 
     return {
         js: function(/* file_url1, [, file_url2, ... ] */) {
 
             var files_to_load = [];
 
             // preprocessing
             for (var i = 0; i < arguments.length; ++i) {
                 var file_url = arguments[i];
 
                 if (_version(file_url) == null) {
                     is.Console.error('is.Require.js: url scriptu neobsahuje parametr "_v".', file_url, _version( file_url ));
                     continue;
                 }
 
                 // check if file is already present
                 if (!present_js_files.hasOwnProperty(_remove_query(file_url)) && $('script[src^="'+file_url+'"]').length) {
                     is.Console.log('is.Require.js: subor "'+file_url+'" uz stranka obsahuje!');
                     continue;
                 }
 
                 var $some_version = $('script[src^="' + _remove_query(file_url) + '"]')
                 if ($some_version.length) { // nejaka verze souboru v strance existuje
 
                     // pokus o nacteni ruznych verzi stejneho souboru
                     if (_version( $some_version.attr('src') ) !== _version( file_url )) {
                         is.Zdurazneni.chyba( is.ldb.chyba );
                         continue; // nenacitat, nechat uzivatele obnovit stranku
                     }
                 }
 
                 files_to_load.push(file_url);
             }
 
             // script loading
             var when_files_loaded =  $.when();
             for (var i = 0; i < files_to_load.length; ++i) {
                 var file_url = files_to_load[i];
                 var file_without_query = _remove_query(file_url);
                 present_js_files[file_without_query] = present_js_files[file_without_query] || _load_script(file_url).fail(function(evt){
                     var $target = $(evt.target);
                     is.Console.error('is.Require.js: chyba pri nacitani suboru "' + $target.attr('src') + '".', files_to_load);
                     $target.remove();
                 });
                 when_files_loaded = $.when(when_files_loaded, present_js_files[file_without_query]);
             }
 
             return when_files_loaded;
         },
 
         css: function(/* file_url1, [, file_url2, ... ] */) {
 
             var files_to_load = [];
 
             // preprocessing
             for (var i = 0; i < arguments.length; ++i) {
                 var file_url = arguments[i];
 
                 // check if file is already present
                 if (!present_css_files.hasOwnProperty(_remove_query(file_url)) && $('link[href^="'+file_url+'"]').length) {
                     is.Console.log('is.Require.css: subor "'+file_url+'" uz stranka obsahuje!');
                     continue;
                 }
 
                 files_to_load.push(file_url);
             }
 
             // css loading
             var when_files_loaded =  $.when();
             for (var i = 0; i < files_to_load.length; ++i) {
                 var file_url = files_to_load[i];
                 var file_without_query = _remove_query(file_url);
                 present_css_files[file_without_query] = present_css_files[file_without_query] || _load_css(file_url).fail(function(evt){
                     var $target = $(evt.target);
                     var order = i;
                     is.Console.error('is.Require.css: chyba pri nacitani suboru "' + $target.attr('href') + '".', files_to_load);
                     $target.remove();
                 });
                 when_files_loaded = $.when(when_files_loaded, present_css_files[file_without_query]);
             }
 
             return when_files_loaded;
         },
     };
 
     function _load_script (file_url) {
 
         var deferred = $.Deferred();
 
         var script = document.createElement('script');
 
         script.addEventListener('load', deferred.resolve);
         script.addEventListener('error', deferred.reject);
         script.async = false;
         script.src = file_url;
         document.head.appendChild(script);
 
         return deferred.promise();
     }
 
     function _load_css (file_url) {
 
         var deferred = $.Deferred();
 
         var link = document.createElement('link');
 
         link.addEventListener('load', deferred.resolve);
         link.addEventListener('error', deferred.reject);
         link.href = file_url;
         link.rel = 'stylesheet';
         link.type = 'text/css';
         document.head.appendChild(link);
 
         return deferred.promise();
     }
 
     function _remove_query(file_url) {
         var qmark = file_url.indexOf('?');
         return file_url.substring(0, qmark === -1 ? file_url.length : qmark);
     }
 
     function _version(file_url) {
         var a = document.createElement('a');
         a.href = file_url;
         return ( a.search.match(/^[?]?_v=[a-z0-9]+$/i) || [] )[0];
     }
 
 }); // konec is.Require
 
 is.Define.class('TableSort', function(namespace, $) {
     var regex = /,/gi;
     var default_config = {
         ignoreCase : false,
         textExtraction : _rad_dle_data,
         widgets: [],
         headers: {},
         textSorter: {},
     };
 
     function TableSort(tab, config) {
         var self = this;
 
         self.$tabulka = $(tab);
         if (self.$tabulka.length !== 1) {
             console.error("Tabulka nebola nájdená", self.$tabulka.length, tab);
             return;
         }
 
         self.config = $.extend(true, {}, default_config, config);
         $.each('jazyk rep_headers ignoruj_col_span'.split(' '), function(i, param) {
             var data_param_value = self.$tabulka.data(param);
             self.config[param] = data_param_value != null ? data_param_value : self.config[param];
         });
 
         self.opakovani_hlavicek();
         self.reinit_cols();
 
         self.$tabulka.tablesorter(self.config);
     }
 
     TableSort.init = function(selector, config) {
         $(selector).each(function() {
             new is.TableSort(this, config);
         });
     };
 
     $.extend(TableSort.prototype, {
         reinit_cols : function () {
             var self = this;
             var headers = self.config.headers;
             var text_sorter = self.config.textSorter;
 
             self.$tabulka.find('th').each(function (index, el) {
                 var razeni, jazyk;
                 var $el = $(el);
 
                 if (self.config.ignoruj_col_span && $el.prop('colSpan') !== 1) {
                     $el.addClass('ne_sort');
                     headers[index] = {sorter: false};
                     return; // nastavuje sa podla spodnych stlpcov
                 }
 
                 /** headers[index] neprepisovat na headers.index **/
                 razeni = $el.data('razeni');
                 switch (razeni) {
                     case 'datum':
                         headers[index] = {sorter: $el.data('datum')};
                         break;
 
                     case 'digits':
                         headers[index] = {sorter: 'text'};
                         text_sorter[index] = _razeni_cisel;
                         break;
 
                     case 'ukonceni':
                         headers[index] = {sorter: 'ukonceni'};
                         break;
 
                     case 'typ_studia':
                         headers[index] = {sorter: 'typ_studia'};
                         break;
 
                     case 'neradit':
                         $el.addClass('ne_sort');
                         headers[index] = {sorter: false};
                         break;
 
                     default:
                         headers[index] = {sorter: 'text'};
                         jazyk = self.config.jazyk;
                         if (jazyk !== 'en') {
                             text_sorter[index] = _porovnani_dle_neanglickych_znaku;
                         }
                 }
             })
         },
 
         opakovani_hlavicek: function() {
             var self = this;
             if (self.config.rep_headers) {
                 self.config.widgetOptions = {rowsToSkip: self.config.rep_headers === true ? 10 : self.config.rep_headers };
                 self.config.widgets.push('repeatHeaders');
             }
         },
     });
 
     /* pomocne funkcie */
     function _porovnani_dle_neanglickych_znaku(a, b, direction, column, table) {
         return a.localeCompare(b);
     };
 
     function _rad_dle_data(node) {
         var $node = $(node);
         var attr = $node.data('razeni');
         if (attr != null && attr !== false) {
             return attr;
         }
         return $node.text();
     };
 
     function _razeni_cisel(a, b, direction, column, table) {
         var a_changed = +a.replace(regex, '.');
         var b_changed = +b.replace(regex, '.');
         return a_changed - b_changed;
     };
 
     return TableSort;
 });
 
 
 /**
  * Trieda predstavuje jednoduche ulozisko a poskytuje rozne metody pre
  * nastavovanie a ziskavanie dat uloziska.
  */
 is.Define.class('Store', function() {
 
     function Store(obj) {
         for (var prop in obj) {
             if (obj.hasOwnProperty(prop)) {
                 this[prop] = obj[prop];
             }
         }
     }
 
     Store.prototype = {
         get: function(name) {
             if (!this.hasOwnProperty(name)) {
                 throw 'is.Store.get(): key "' + name + '" does not exists!';
             }
 
             return this[name];
         },
         set: function(name, value) {
             if (typeof name === 'object') {
                 for (var prop in name) {
                     if (name.hasOwnProperty(prop)) {
                         this[prop] = name[prop];
                     }
                 }
 
                 return this;
             }
 
             this[name] = value;
             return value;
         },
         exists: function(name) {
             return this.hasOwnProperty(name);
         },
         defined: function(name) {
             return this[name] != null;
         },
         empty: function() { // vyprazdni ulozisko
             var self = this;
             Object.keys(self).forEach(function(key) { delete self[key]; });
         }
     }
 
     for (var prop in Store.prototype) {
         Object.defineProperty(Store.prototype, prop, {
             enumerable: false,
             writable: true,
             configurable: false,
             value: Store.prototype[prop], // nutne pre niektore prehliadace
         });
     }
 
     Store.create = function(stores) {
         for (var store in stores) {
 
             if (/[.]/.test(store)) {
                 throw "Nazov store nesmie obsahovat tecku!";
             }
 
             is.Define.property(store, new is.Store(stores[store]), { configurable: true });
         }
     };
 
     return Store;
 
 }); // konec is.Store
 
 /**
  * Modul slouží pro obslubu inicializace, jak samotného design,
  * tak jednotlivých modulů, které bylo ze serveru vyžádáno inicializovat.
  */
 is.Define.module('Design', function (namespace, $) {
     var unload_callbacks = [];
 
     return {
         /**
          * Spuštění všech vyžádaných inicializací. Spuští se na konci stránky,
          * takže je zajištěno, že jsou již všechny elementy na stránce.
          */
         init: function(data){
             _is_error.allow_send();
 
             if (_foundation_check()) {
                 return;
             }
             is.Store.create(data);
             $(document).foundation();
             is.Design.init_always();
             is.Design.call_init();
             is.Debug.check_all();
         },
 
         /**
          * Inicializace všech modulů a tříd, které jsou zaregistrovány v 'is.js_init'.
          */
         call_init: function() {
             if (is.js_init) {
                 for (var i in is.js_init) {
                     var module = is.js_init[i].module,
                         method = (is.js_init[i].method || 'init'),
                         params = (is.js_init[i].params || []);
 
                     var fn = is(module+'.'+method);
                     if (fn) {
 //						try {
                             fn.apply(window, params);
 //						} catch (err) {
 //							console.error("Chyba pri volani is."+module+"."+method+"()!", err);
 //						}
                     } else {
                         console.error("Chyba: pokus o spustenie neexistujucej funkcie is."+module+"."+method+"()!");
                     }
                 }
 
                 is.js_init.empty(); // zmaz pole
             }
         },
 
         /**
          * Inicicalizace prvků, které jsou mimo app_content.
          */
         init_header: function() {
 
             var $is_search = $('#is_search');
             $is_search.isSearch({
                 result: '#is_search_results',
                 clear_button: '.is_input_x',
                 complaint: {
                     open_btn: '#male_vyhledavani_reklamace_otevrit',
                     search_query: function() {
                         return $is_search.find('input[name="search"]').val();
                     }
                 },
             }).on('show.zf.dropdown', function(){
                 $is_search.find('input[name="search"]').focus();
             });
 
             var $window = $(window);
             var $sticky_panel = $('#sticky_panel');
             $window.on('scroll', function(e){
                 $sticky_panel.toggleClass('bgr', $window.scrollTop() > 0);
             }).trigger('scroll');
 
             $('#header_menu .is-logout-menu').click(function(){
                 $('#is_logout button[type=submit]').trigger('click');
             });
 
             $('ul.is-switch ul li').click(function(e){
                 e.stopImmediatePropagation();
             });
 
             $('ul.is-switch').on('show.zf.dropdownmenu', function(){ // otvorenie dropdown menu
                 $(document).trigger('closeme.zf.dropdown'); // zatvorim vsetky dropdown (ne-menu)
             });
 
             $('#prepinace ul ul li a, #prepinace label').on('touchend', function(e){
                 e.stopPropagation();
             });
 
             $('#is_logout').on('show.zf.dropdown', function(){
                 $('#is_logout .switch').show();
             });
 
             $('#is_logout').on('hide.zf.dropdown', function(){
                 $('#is_logout .switch').hide();
             });
 
             $('#motiv_reveal input').change(function() {
                 var $input	= $('#motiv_reveal input:checked');
                 var motiv_save	= $input.val();
                 var motiv_show	= motiv_save;
                 var reload	= $input.data('reload');
                 var tmavy	= !!$input.data('tmavy');
 
                 if (motiv_save === '0') {
                     motiv_show = $input.data('sezonni') || 1;
                 }
 
                 if (!reload) {
                     $('head link[href^="/css/r6/motiv"]').attr('href', '/css/r6/motiv/' + motiv_show + '.css');
                     $('body').toggleClass('motiv-tmavy', tmavy).toggleClass('motiv-svetly', !tmavy);
                     if (!tmavy) {
                         $('head link[href^="/css/r6/r6-tmavy"]').remove();
                     } else if (!$('head link[href^="/css/r6/r6-tmavy"]').length) {
                         $('head link[href^="/css/r6/r6.css').after(
                             $('<link>').attr({
                                 href:	'/css/r6/r6-tmavy.css',
                                 media:	'screen',
                                 rel:	'stylesheet',
                                 type:	'text/css',
                             })
                         );
                     }
                 }
 
                 is.Ajax.request('/auth/design_ajax', { operace: 'pref', nazev: 'w_design_motiv', hodnota: motiv_save }).done(function() {
                     if (reload) {
                         location.reload();
                     }
                 });
 
                 setTimeout(is.NavMenu.refresh, 200); // pockaj na load css
             });
 
             var dropdowns = '#header_menu, #header_zivot, #header_oblibene, #is_search, #is_logout';
             $(document).on('show.zf.dropdown', dropdowns, function(){
                 $('html, body').addClass('no_scroll');
             });
 
             $(document).on('hide.zf.dropdown', dropdowns, function(){
                 $('html, body').removeClass('no_scroll');
             });
 
             $('#header_menu, #header_zivot, #header_oblibene, #is_search, #is_logout').removeAttr('data-resize');
 
             var $onload_scroll_here = $('.onload_scroll_here:first'); // onload scrollne na element s triedou 'onload_scroll_here'
             var $onload_focus = $('.onload_focus:first'); // onload focus na input
 
             if ($onload_focus.length) {
                 $onload_focus.focus();
             } else {
                 is.HashNavigation.scrollTo($onload_scroll_here, 200);
             }
 
             $(document).on('click', '.novy_design_switch', function(e) {
                 e.preventDefault();
                 is.Ajax.request('/auth/design_ajax.pl', { operace: 'novy_design_switch', hodnota: 0 }).done(function(){
                     location.reload();
                 });
             });
 
             var fix_header_image = function() {
                 if ($('#app_header_image').length) {
                     $('#app_header_image').width( $(window).width() - $('#app_header_image').offset().left );
                 }
             };
 
             $(window).resize(Foundation.util.throttle(fix_header_image, 100));
             $(document).on('closed.zf.reveal', fix_header_image);
 
             $('.otheris').on('change.'+namespace, function(){
                 if ($(this).val() !== '') {
                     location.assign(
                         location.href.replace(
                             location.host,
                             $(this).val()
                         )
                     );
                 }
             });
         },
 
         /**
          * Inicializace jednoduchých nástrojů (zbytečné pro ně vytvářet modul), nebo nástrojů,
          * které jsou definovány v atributu 'class' a neexistuje pro ně metoda v Toolkitu.
          */
         init_toolkit: (function () {
             var first_init = true;
 
             return function () {
                 if (first_init) {
                     first_init = false;
                     _init_doc_events();
                 }
 
                 $('table.autohide').trigger('change.autohide');
 
                 $('.app-heading').not('.app-heading-ready').each(function () {
                     var $heading = $(this);
                     var id = $heading.attr('id');
 
                     if (!is.Misc.is_valid_id(id)) {
                         console.error('Nadpis nema validni atribut "id", preskakuji.', id, $heading.text());
                         return;
                     }
 
                     $heading
                         .append('<a href="#' + id + '" class="isi-link-h30 app-heading-ico"></a>')
                         .addClass('app-heading-ready');
                 });
             };
 
             function _init_doc_events () {
 
                 var window_scroll;
 
                 $(document)
                     .off('.toolkit')
                     // for window resize before opening orbit inside reveal
                     .on('open.zf.reveal', function(evt) {
                         var $reveal = $(evt.target);
                         var $orbit = $reveal.find('[data-orbit]');
                         var $overlay = $reveal.closest('.reveal-overlay');
 
                         // presunuti modalniho okna, aby bylo nejvyssi
                         $overlay = $overlay.length ? $overlay : $reveal;
                         $overlay.appendTo($overlay.parent());
 
                         // osetreni aby se po zavreni modalniho okna stranka nascrollovala na puvodni pozici
                         window_scroll = $(window).scrollTop();
 
                         // pokud obsahuje orbit, tak nastavi spravne vysku a focus
                         if ($orbit.length) {
                             $orbit.foundation('_setWrapperHeight');
                             is.Orbit.focus($orbit);
                         }
 
                         if (is.Player) {
                             is.Player.trigger_delayed_init($reveal);
                         }
                     })
                     .on('closed.zf.reveal', function(evt) {
                         $(window).scrollTop(window_scroll);
                         if (is.Player) {
                             is.Player.stop_load(this);
                         }
                     })
                     // navodek
                     .on('click.toolkit.navodek', '.navodek-nadpis button', function (evt) {
                         $(this).parent().next().toggleClass('hide');
                     })
                     // autohide table
                     .on('change.toolkit.autohide', 'table.autohide', function (event) {
                         var $table = $(this);
                         var $tr_visible = $table.find('tr').filter(function () {
                             return $(this).css('display') !== 'none';
                         });
 
                         $table.toggleClass('hide', !$tr_visible.length);
                     })
                     .on('click.toolkit.dropDownPaneSelectboxItem', 'div.dropdown-pane-selectbox div.polozka', function (evt) {
                         evt.preventDefault();
 
                         var $vybrana_polozka = $(this);
                         var vybrana_polozka_hodnota = $vybrana_polozka.data('value');
                         var vybrana_polozka_nazev = $vybrana_polozka.find('.nazev-polozky').html();
                         var vybrana_polozka_popis = $vybrana_polozka.find('.popis-polozky').html();
                         var jmeno_filtru = $vybrana_polozka.parent().attr('id');
                         var $filtr = $vybrana_polozka.closest('.selectbox-polozka');
                         var $material_icons = $filtr.find('.info-ikona-vrsek i.ikona');
 
                         // nastavení hidden value
                         $filtr.find('input[type="hidden"][name="'+jmeno_filtru+'"]').val(vybrana_polozka_hodnota);
 
                         // nastaveni popisu vybrané položky
                         if (! vybrana_polozka_nazev) {
                             vybrana_polozka_nazev = vybrana_polozka_popis.replace(/(^\(|\)$)/g,'');
                             vybrana_polozka_popis = '';
                         }
 
                         if (! vybrana_polozka_popis) {
                             vybrana_polozka_popis = '&nbsp;';
                         }
 
                         $filtr.find('.selectbox')
                             .find('.popis')
                                 .html(vybrana_polozka_popis)
                                 .end()
                             .find('.nazev')
                                 .html(vybrana_polozka_nazev)
                                 .end();
 
                         if ($material_icons.length) {
                             $material_icons
                                 .toggleClass('isi-napoveda nedurazne', !vybrana_polozka_hodnota)
                                 .toggleClass('isi-check zelena', !!vybrana_polozka_hodnota);
                         }
 
                         // skrytí menu
                         $vybrana_polozka.parent().foundation('toggle').trigger('dropDownPaneSelectbox:click');
                     })
                     // proklik tipu do pruvodce
                     .on('click.toolkit.tip', '.pruvodce_rozklik a[data-modal_id][data-slide_ident]', function () {
                         var data = $(this).data();
                         var $modal = $('#'+data.modal_id);
 
                         $modal.foundation('open');
                         is.Orbit.set_slide($modal.find('.orbit'), data.slide_ident);
                     })
                     // otevreni galerie
                     .on('click.toolkit.gallery', '.gallery-open:not(.gallery-open-ignore)', function (evt) {
                         var data	= [];
                         var $self	= $(this);
                         var group	= $self.data('gallery-group') || 'default';
                         var modal_id	= '#gallery_' + group;
                         var $modal	= $(modal_id);
                         var $anchors	= $('.gallery-open');
 
                         evt.preventDefault();
 
                         if (group === 'default') {
                             $anchors = $anchors.not('[data-gallery-group]');
                         } else {
                             $anchors = $anchors.filter('[data-gallery-group="' + group + '"]');
                         }
 
                         $anchors = $anchors.not('[data-gallery-index]');
 
                         var anchor_index = $anchors.index($self);
                         if (anchor_index < 0) {
                             anchor_index = $self.data('gallery-index');
                         }
 
                         // galerie jiz byla drive dotazena, staci otevrit
                         if ($modal.length) {
                             $modal.foundation('open');
                             is.Orbit.set_slide($modal.find('.orbit'), anchor_index);
                             return;
                         }
 
                         // vytvori se seznam obrazku
                         $anchors.each(function () {
                             var $self = $(this);
 
                             data.push({
                                 name: 'href',
                                 value: $self.data('gallery-href') || $self.attr('href'),
                             });
 
                             data.push({
                                 name: 'title',
                                 value: $self.data('gallery-title') || $self.attr('title'),
                             });
                         });
 
                         // stahne se galerie ze serveru
                         (new is.Ajax({
                             url: is('session.auth') + '/design_ajax',
                             data: {
                                 operace: 'gallery',
                                 group: group,
                                 active: anchor_index,
                             },
                         }))
                         .request(data)
                         .done(function (data) {
                             $(document.body).append(data.html);
                             // nejdrive inicialzuje pluginy a nasledne otevre modalni okno
                             $(modal_id).foundation().foundation('open');
                         });
                     })
                     // aktivuje tooltip u odlozeneho initu
                     .on('mouseenter.toolkit.tooltip tap.toolkit.tooltip touch.toolkit.tooltip focus.toolkit.tooltip', '.toolkit-tooltip-init', function (evt) {
                         var $self = $(this);
                         var plugin = is.Foundation.get_plugin($self);
 
                         if (plugin) {
                             return;
                         }
 
                         $self
                             .removeClass('toolkit-tooltip-init')
                             .attr('data-tooltip', '')
                             .foundation()
                             .trigger(evt.type + '.zf.tooltip');
                     });
             }
         }()),
 
         /*
          * Inicializace, která proběhne při každém volání funkce is.Design.init().
          * Metoda existuje, aby byla metoda is.Design.init() co nejmenší a co nejpřehlednější.
          */
         init_always: function() {
 
             /*
             *  prevent_multiclick - na vteřinu vypne možnost klikat na prvek
             *  disable_multiclick - napořád vypne možnost klikat na prvek
             *
             *  !!! obojí nefunguje v případě užití s inline napsaným onclick !!!
             *
             * */
             $(document).on('click', '.prevent_multiclick', { type : 0 }, _multipleclick);
             $(document).on('click', '.disable_multiclick', { type : 1 }, _multipleclick);
 
             /*
              *  Pokud je v href anchoru pouze #, povazuje se odkaz jako klikatko pro JS.
              *  Takovemu klikatku se musi dat evt.preventDefault(), aby kliknutim neposkocila
              *  stranka uplne nahoru. Zapomina se na to, proto je v obecnem miste tato zaplata.
              */
             $(document).on('click', 'a[href="#"]', function (evt) {
                 evt.preventDefault();
             });
 
             /**
              * Zajisti, aby spravne zafungovaly vsechny udalosti, ktere jsou navazany
              * na zmenu velikosti okna po nacteni stranky.
              */
             $(window).load(function () {
                 var resize_event;
 
                 try {
                     resize_event = new Event('resize');
                     window.dispatchEvent(resize_event);
                 } catch (e) {
                     // support IE, android < 5.0
                     try {
                         resize_event = document.createEvent('Event');
                         resize_event.initEvent('resize', true, true);
                         window.dispatchEvent(resize_event);
                     } catch (e) {
                         // u opravdu neschoneho zarizeni se pokusi alespon o jQuery resize
                         $(window).trigger('resize');
                     }
                 }
             });
 
             if (is.session.auth) {
                 is.Vizitka.init();
             }
 
             if (window.moment) {
                 window.moment.locale(is.session.lang);
 
                 if (window.moment.locale() !== is.session.lang) {
                     console.error('Nepodarilo se nastavit jazyk.', is.session.lang, window.moment.locale(), window.moment.locales());
                 }
             }
         },
 
         /**
          * Zaregistruje funkci, ktera se vyvola pred opustenim stranky.
          *
          * 	is.Design.add_unload(function () {
          *		if ( ... ) {
          *			return 'Text.';
          *		}
          * 	});
          *
          **/
         add_unload: function (callback) {
             if ($.type(callback) !== 'function') {
                 console.error('Predany parametr "callback" neni funkce.', $.type(callback), callback && callback.toString());
                 return;
             }
 
             if (window.onbeforeunload != null && window.onbeforeunload !== _unload_universial) {
                  unload_callbacks.push(window.onbeforeunload);
             }
 
             unload_callbacks.push(callback);
             window.onbeforeunload = _unload_universial;
         },
 
         /**
          * Odebere funkci ze seznamu funkci, ktere se vyvolaji pred opustenim stranky.
          *
          *	var moje_funkce = function () {};
          *
          * 	is.Design.add_unload(moje_funkce);
          * 	is.Design.remove_unload(moje_funkce);
          *
          **/
         remove_unload: function (callback) {
             var i;
 
             if ($.type(callback) !== 'function') {
                 console.error('Predany parametr "callback" neni funkce.', $.type(callback), callback && callback.toString());
                 return;
             }
 
             for (i = 0; i < unload_callbacks.length; ) {
                 if (unload_callbacks[i] === callback) {
                     unload_callbacks.splice(i, 1);
                 } else {
                     ++i;
                 }
             }
         },
 
         /*
          * Inicializuje udalosti, ktere umozni kopirovat obsah ze stranky do uzivatelovi schranky.
          * Je potreba mit nalinkovane prislusne knihovny.
          */
         init_clipboard: function (opt) {
             var clipboard;
 
             if (!opt.selector) {
                 console.error('Nebyl nastaven selector.', opt);
                 return;
             }
 
             if (!window.Clipboard) {
                 console.error('Nebyl nalezen konstruktor tridy Clipboard.');
                 return;
             }
 
             clipboard = new window.Clipboard(opt.selector);
 
             clipboard.on('success', function(evt) {
                 var $spoustec = $(evt.trigger);
                 var confirm_msg = is('ldb.'+namespace+'_init_clipboard_confirm');
 
                 if (confirm_msg) {
                     is.Zdurazneni.potvrzeni(confirm_msg, {
                         fade_out: true,
                         stack: false
                     });
                 } else {
                     console.error('Chybi potvrzovaci hlaska.');
                 }
 
                 evt.clearSelection();
             });
 
             return clipboard;
         },
 
     };
 
     function _multipleclick (evt) {
         var $self = $(this);
 
         // druhe a dalsi kliknuti se zamlci
         if ($self.data('multiclick-clicked')) {
             evt.stopImmediatePropagation();
             evt.preventDefault();
             return false;
         }
 
         // nastavi se, ze bylo kliknuto
         $self.data('multiclick-clicked', true);
         $self.addClass('disabled');
 
         // pokud je evt.data.type === 0, je po sekunde znovu objekt klikatelny
         if (evt.data.type === 0) {
             setTimeout(function() {
                     $self.data('multiclick-clicked', false);
                     $self.removeClass('disabled');
                 }, 1000
             );
         }
     }
 
     function _foundation_check () {
         if (window.Foundation === undefined || $.fn.foundation === undefined) { // foundation neni
 
             if ((window.Foundation === undefined || $.fn.foundation === undefined) && performance.navigation && performance.navigation.type !== 1) {
                 location.reload(true);
                 console.error('DEBUG: location.reload!');
                 return 1;
             }
 
             $.ajax({ /* nacitam onthefly */
                 dataType: 'script',
                 cache:    true,
                 async:    false,
                 url:      '/js/r6/foundation.js',
             }).always(function(){
 
                 if (window.Foundation === undefined || $.fn.foundation === undefined) { // stale nemam
 
                     if (location.search.indexOf('force_reload') !== -1) { // uz sme po realode, nepomohlo nic
                         console.error('DEBUG',
                                   'window.Foundation nebyl definovan v Design.init ( ani po reloadu).',
                                   window.Foundation,
                                   $.fn.foundation,
                                   arguments
                         );
                     } else { // skusim raz reload
                         var search = location.search;
                         search += (search.indexOf('?') !== -1 ? ';' : '?') + 'force_reload=1';
                         location.assign(search);
                     }
                 }
 
             });
         }
     }
 
     function _unload_universial () {
         var i, len, value;
 
         len = unload_callbacks.length;
         for (i = 0; i < len; ++i) {
             try {
                 value = unload_callbacks[i]();
                 if (value != null) {
                     return value;
                 }
             } catch(e) {}
         }
     }
 
 }); // konec is.Design
 
 /**
  * Inicializace toolkitiho nastroje rozklikavatko.
  */
 is.Define.module('Rozklikavatko', function (namespace, $) {
     var rozklikavatko;
     var was_init = false;
 
     rozklikavatko = {
 
         init: function() {
             if (was_init) {
                 return;
             }
 
             $(document)
                 .off('.'+namespace)
                 .on('click.'+namespace, '.rozklikavatko-nadpis', function (evt) {
                     evt.preventDefault();
                     rozklikavatko.toggle(this);
                 });
 
             was_init = true;
         },
 
         toggle: function ($rozklikavatka) {
             $($rozklikavatka).filter('.rozklikavatko-nadpis').each(function () {
                 var $nadpis = $(this);
                 var $obsah = $nadpis.data(namespace);
                 var active = $nadpis.hasClass('is-active');
 
                 if (!$obsah) {
                     $obsah = $('#'+$nadpis.data('content-id'));
                     $nadpis.data(namespace, $obsah);
                 }
 
                 if (active) {
                     // hide
                     $nadpis
                         .removeClass('is-active')
                         .attr('aria-expand', 'false');
                     $obsah
                         .addClass('hide print-hide')
                         .trigger('hide.'+namespace);
                 } else {
                     // show
                     $nadpis
                         .addClass('is-active')
                         .attr('aria-expand', 'true');
                     $obsah
                         .removeClass('hide print-hide')
                         .trigger('show.'+namespace);
                 }
             });
         },
 
         show: function ($rozklikavatka) {
             rozklikavatko.toggle($($rozklikavatka).not('.is-active'));
         },
 
         hide: function ($rozklikavatka) {
             rozklikavatko.toggle($($rozklikavatka).filter('.is-active'));
         },
     };
 
     return rozklikavatko;
 }); // konec is.Rozklikavatko
 
 /**
  * Doplnujici funkce pro Drobecky k css stylum, ktere raguji na rozliseni okna.
  */
 is.Define.module('Drobecky', function() {
     var $header_wrap, $row_width, $page_title, $drobecky_wrap, $drobecky;
 
     return {
         init: function() {
 
             $('#drobecky .sponka.red').each(function(){
                 $('#app_header .sponka').addClass('red');
             });
 
             if (!$('#drobecky .drobecek_app').length) {
                 $('.sep.last').removeClass('last');
             };
 
             $header_wrap	= $header_wrap	|| $('#app_header_wrapper');
             $row_width	= $row_width	|| $('#hlavicka');
             $page_title	= $page_title	|| $('#app_name');
             $drobecky	= $drobecky	|| $('#drobecky');
             $drobecky_wrap	= $drobecky_wrap|| $drobecky.find('.wrap');
 
             var toggle_bgr = function () {
                 var drobecky_toggle =	$drobecky_wrap.length
                             && $row_width.length
                             && $drobecky_wrap.outerWidth() > $row_width.outerWidth() * 0.58
                             ;
                 var title_toggle =	$page_title.length
                             && $row_width.length
                             && $page_title.outerWidth() > $row_width.outerWidth() * 0.58
                             ;
                 $drobecky.toggleClass('long', !!drobecky_toggle);
                 $header_wrap.toggleClass('long', !!title_toggle);
             };
 
             toggle_bgr();
             $(window).resize(toggle_bgr);
         },
     };
 }); // konec is.Drobecky
 
 /**
  * Inicializuje a obsluhuje oblibene polozky ve sticky panelu.
  */
 is.Define.module('Oblibene', function() {
 
     return {
         init: function() {
 
             //otevreni praveho menu sledovane se srdickem a oblibene s hvezdickou
             $('#header_oblibene').one('show.zf.dropdown', function() {
                 (new is.Ajax({
                     url: '/auth/design_ajax.pl',
                     loading: '#sledovane_loading',
                 })).request({
                     operace: 'load_prave_menu_sledovane',
                 }).done(function(data) {
                     $('#sledovane').html(data.html);
                 });
 
                 (new is.Ajax({
                     url: '/auth/design_ajax.pl',
                     loading: '#oblibene_loading',
                 })).request({
                     operace: 'load_prave_menu_oblibene',
                 }).done(function(data) {
                     $('#oblibene').html(data.html);
                 });
             });
 
             //prave menu oblibene strankovani prispevku
             $("#oblibene").on('click', '#vert_menu_right_prev', function(){
                 var active = $('input[name=vert_menu_right_favorite_active]').val();
                 var max = $('input[name=vert_menu_right_favorite_sum]').val();
                 if (active > 1) {
                     $('#vert_menu_right_favorite_' + active).hide();
                     active--;
                     $('#vert_menu_right_favorite_' + active).show();
                     $('input[name=vert_menu_right_favorite_active]').val(active);
 
                     if (active < 2) {
                         $('#vert_menu_right_prev').addClass('disabled');
                     }
                     if (active < max) {
                         $('#vert_menu_right_next').removeClass('disabled');
                     }
                 }
             });
 
             $("#oblibene").on('click', '#vert_menu_right_next', function(){
                 var active = $('input[name=vert_menu_right_favorite_active]').val();
                 var max = $('input[name=vert_menu_right_favorite_sum]').val();
                 if (+active < max) {
                     $('#vert_menu_right_favorite_' + active).hide();
                     active++;
                     $('#vert_menu_right_favorite_' + active).show();
                     $('input[name=vert_menu_right_favorite_active]').val(active);
 
                     var nova = $('input[name=vert_menu_right_favorite_active]').val();
 
                     if (active >= max) {
                         $('#vert_menu_right_next').addClass('disabled');
                     }
                     if (active > 1) {
                         $('#vert_menu_right_prev').removeClass('disabled');
                     }
                 }
             });
 
             $("#oblibene").on('click', '.close-button', function(){
                 var apl;
                 var ID = $(this).siblings('input[name=ID]').val();
                 var fak_id, kod;
 
                 var params;
 
                 switch ( $(this).siblings('input[name=typ]').val() ) {
                     case 'soubor':
                         apl = '/auth' + ID;
                         params = {
                             oblib: 0,
                             info: 1,
                             op: 'oblib',
                         };
                         break;
 
                     case 'df':
                         apl = '/auth/diskuse/diskuse_ajax.pl';
                         params = {
                             akce: 'zrus_obl',
                             guz: ID,
                         };
                         break;
                     case 'vyveska':
                            apl = '/auth/vyveska/vyveska_ajax.pl';
                            params = {
                                akce: 'zrus_obl',
                                guz: ID,
                                nevracej_zpravu: 1,
                            };
                            break;
                     case 'predmet':
                            apl = '/auth/predmety/predmety_ajax.pl';
                            var pieces = ID.split('|');
                            var fak_id = pieces[0],
                                kod    = pieces[1];
 
                            params = {
                                akce: 'zoblib',
                                fakulta: fak_id,
                                kod: kod,
                            };
                            break;
                 }
 
                 is.Ajax.request(apl, params).done(function(json){
 //							console.log(JSON.stringify(json));
                 });
 
                 $(this).closest('.vert_menu_right_favorite_li').hide("fast");
             });
 
         },
     };
 }); // konec is.Oblibene
 
 /**
  * Rozsiruje funkcionalitu Foundation core.
  */
 is.Define.module('Foundation', function() {
     var $window = $(window);
 
     return {
         /**
          * najde vsechny foundation prvky, ktere nejsou inicializovane a vrati je jako jQuery objekt
          */
         uninit_elemenents: function(context) {
             var $res = $();
 
             Object.keys(window.Foundation._plugins).forEach(function (plugin) {
                 $('[data-'+plugin+']', context || document).each(function () {
                     if ($(this).data('zfPlugin') == null && $.inArray(this, $res) < 0) {
                         $res = $res.add(this);
                     }
                 });
             });
 
             return $res;
         },
 
         /**
          * ako init, ale pokusi sa inicializovat len neinicializovane pluginy
          */
         safe_init: function(context) {
             is.Foundation.uninit_elemenents(context).foundation();
 
             // reinicializace re-insertnutych datepickeru
             $('[data-datepicker]', context).each(function() {
                 var dp		= $(this).data('datepicker');
                 var dp_params	= $(this).data('picker_init_params');
 
                 if ($.fn.fdatepicker && dp instanceof $.fn.fdatepicker.Constructor && dp.element[0] != this && dp_params) {
                     dp.element = $(this);
                     is.FDatePicker.init({ id: $(this).attr('id') });
                 }
             });
 
             Foundation.IHearYou();
         },
 
         /*
          * Znici vsetky instancie foundation pluginov v podstrome context,
          * ale tak, aby ich bolo mozne znovu volat inicializovat (napr.
          * pomocou safe_init). Volitelne znici len pluginy plugins.
          *
          * 	is.Foundation.safe_destroy([context] [, plugins]);
          *
          * 	napr. destroy vsech abide v podstrome #app_content:
          *
          * 	is.Foundation.safe_destroy('#app_content', { abide: 1 });
          * */
         safe_destroy: function(context, plugins) {
 
             if ($.isPlainObject(context)) {
                 plugins = context;
                 context = undefined;
             }
 
             Object.keys(plugins || window.Foundation._plugins).forEach(function (plugin) {
                 $('[data-' + plugin + ']', context || document).each(function () {
                     if ($(this).data('zfPlugin')) {
                         $(this)	.foundation('destroy')						// znicim plugin
                             .attr('data-' + plugin, $(this).data( 'data-' + plugin ) || '')	// poznacim data-plugin pre pripadnu reinicializaciu
                             ;
                     }
                 });
             });
         },
 
         /**
          * Vrati instanci pluginu prislusneho elementu
          *
          * 	var orbit = is.Foundation.get_plugin('#id');
          *
          * Pokud je na vstupu predan constructor pluginu, provede kontrolu:
          *
          * 	var orbit = is.Foundation.get_plugin($orbit, Foundation.Orbit);
          */
         get_plugin: function ($elem, constructor) {
             var plugin = $($elem).data('zfPlugin');
 
             if (constructor && !(plugin instanceof constructor)) {
                 console.error('Predany objekt nema (aktivovany) plugin:', $elem, constructor.name);
                 return;
             }
 
             return plugin;
         },
 
         init_sticky_in_reveal: function ($reveal) {
             var $reveal = $($reveal);
             var $overlay = $reveal.closest('.reveal-overlay');
 
             $reveal.find('.sticky').each(function () {
                 var $sticky = $(this);
                 var plugin = is.Foundation.get_plugin($sticky);
                 var event_name;
 
                 if (!plugin) {
                     return;
                 }
 
                 plugin.scrollCount = 0;
                 plugin.options.checkEvery = 0;
                 event_name = 'scroll.zf.' + ($sticky.data('resize') || '').split('-').reverse().join('-');
                 $overlay.off(event_name).on(event_name, function () {
                     $window.trigger(event_name);
                 });
             });
         },
     };
 }); // konec is.Foundation
 
 is.Define.module('Zivot', function() {
 
     return {
         init: function() {
 
             $(document).on('click', '.zivot_wrap .prispevek .vice, .zivot_wrap .prispevek .mene', function(e) {
                 var mene = $(e.target).hasClass('mene');
                 $(e.target).closest('.vice_mene').toggleClass('vm_content').find('.vice, .mene').toggle();
                 $(e.target).closest('.prispevek').find('.uryvek').toggleClass('mh').css('max-height', '');
 
                 e.preventDefault();
             });
 
             $(document).on('click', '.zivot_wrap .prispevek .zrus', function(e) {
                 var prispevek = $(this).closest('.prispevek');
                 is.Ajax.request(
                     '/auth/index_ajax.pl',
                     $.extend({ operace: 'nastav_prectenost', }, $(this).data())
                 ).done(function(){
                     prispevek.slideUp(function(){
                         prispevek.remove();
                     });
                 });
             });
 
             $(document).on('click', '.zivot_wrap .prispevek .odmitnout', function(e) {
                 var prispevek = $(this).closest('.prispevek');
 
                 if ($(this).hasClass('rpanel')) {
                     is.Ajax.request(
                         '/auth/zivot/',
                         {
                             pref:		'i_zivot_nezobraz_rpanel',
                             operace:	'uloz_pref',
                             hodnota:	'1',
                         }
                     );
                 } else {
                     is.Ajax.request(
                         '/auth/index_ajax.pl',
                         $.extend({ operace: 'odmitnout', }, $(this).data())
                     );
                 }
 
                 prispevek.slideUp(function(){
                     prispevek.remove();
                 });
 
             });
 
             $('#header_zivot').on('show.zf.dropdown', function() {
                 is.Ajax.request('/auth/design_ajax.pl', {
                     operace: 'zivot_menu',
                 }, {
                     loading: { parent: '#header_zivot', delay: 0, insertMethod: 'html' },
                 }).done(function(data){
                     $('#header_zivot').html(data.html).find('.uryvek').each(is.Zivot.uryvek_do);
                 });
             });
 
             if ($('#sticky_panel .ikony .sticky-zivot .pocet').length) {
                 is.Ajax.request('/auth/design_ajax', {
                     operace:	'dulezite_pocet',
                 }).done(function(data){
                     if (data && data.pocet) {
                         $('#sticky_panel .ikony .sticky-zivot .pocet').html(data.pocet).show();
                     }
                 });
             }
 
             $(document).on('click', '.dulezite_data .sprava .remove', function(e) {
 
                 if ($(this).data('typ') == 'mail') {
 
                     is.Ajax.request('/auth/design_ajax', {
                         operace:	'pref',
                         nazev:		'mail_cas_posledniho_cteni',
                         hodnota:	 $(this).data('time'),
                     });
 
                 } else { // typ uzel
                     is.Ajax.request('/auth/index_ajax.pl', {
                         operace:	'nastav_prectenost',
                         uzel:		$(this).data('uzel'),
                         zid:		$(this).data('zid'),
                     });
                 }
 
                 var dulezite_data = $(this).closest('.dulezite_data').add($(this).closest('#dulezite'));
                 $(this).closest('.sprava').remove();
                 dulezite_data.toggle(!!(dulezite_data.find('.sprava').length));
 
                 var pocet = parseInt($('#sticky_panel .ikony .sticky-zivot .pocet').html());
 
                 if (pocet > 1) {
                     pocet--;
                     $('#sticky_panel .ikony .sticky-zivot .pocet').html(pocet);
                 } else {
                     $('#sticky_panel .ikony .sticky-zivot .pocet').hide();
                 }
 
             });
 
             var pruzkum_ajax = new is.Ajax('/auth/design_ajax', { seq_request_skip: true, no_fail_msg: true });
             $(document).on('click', '.novy_is_pruzkum button', function(e){
                 pruzkum_ajax.request({ value: $(this).data('value'), operace: 'novy_is_pruzkum' });
 
                 var prisp = $(this).closest('.novy_is_pruzkum');
                 prisp.find('button').hide();
                 prisp.find('.po_odpovedi').show();
 
                 setTimeout(function(){
                     prisp.closest('.prispevek').find('.zrus').trigger('click');
                 }, 1500);
             });
 
             $(document).on('click', '.nastavit_sledovanou_slozku button', function(e){
                 if ($(this).data('value') == 'senat') {
                     var nastavit_sledovanou_slozku_ajax = new is.Ajax('/auth/dok/fmgr', { seq_request_skip: true, no_fail_msg: true });
                     nastavit_sledovanou_slozku_ajax.request({op: 'follow', furl: '/auth/do/rect/AS/zapisy/', ch: '/auth/do/rect/AS/zapisy/', detail: 'u', oblib: 'a'});
                     nastavit_sledovanou_slozku_ajax = new is.Ajax('/auth/dok/fmgr', { seq_request_skip: true, no_fail_msg: true });
                     nastavit_sledovanou_slozku_ajax.request({op: 'follow', furl: '/auth/do/rect/AS/ekon/', ch: '/auth/do/rect/AS/ekon/', detail: 'u', oblib: 'a'});
                     nastavit_sledovanou_slozku_ajax = new is.Ajax('/auth/dok/fmgr', { seq_request_skip: true, no_fail_msg: true });
                     nastavit_sledovanou_slozku_ajax.request({op: 'follow', furl: '/auth/do/rect/AS/legis/', ch: '/auth/do/rect/AS/legis/', detail: 'u', oblib: 'a'});
                 }
 
 
                 var prisp = $(this).closest('.nastavit_sledovanou_slozku');
                 prisp.find('button').hide();
                 prisp.find('.po_nastaveni').show();
 
                 setTimeout(function(){
                     prisp.closest('.prispevek').find('.zrus').trigger('click');
                 }, 2000);
             });
 
             $(document).on('click', '.zivot_wrap .prispevek a.read', function(e){
                 $(this).closest('.prispevek').find('.zrus').trigger('click');
             });
 
             $(document).on('click', '.dulezite_data .sprava a.read', function(e){
                 $(this).closest('.sprava').find('.remove').trigger('click');
             });
 
             $(document).on('click', '.zivot_wrap ul.soubory a', function(e) {
 
                 var $target	= $(e.target);
                 var ch		= $target.data('ch');
                 if (ch) {	// precteni uzlu aktivnich odkazu
                     is.Ajax.request(ch, {
                         op:		'napr',
                         precteno:	1,
                         opakovane:	1,
                         ch:		ch,
                     });
                 }
 
                 if ($target.closest('ul').children('li').length > 1) {
                     $target.closest('li').remove();
                 } else {
                     $target.closest('.prispevek, .sprava').find('.zrus, .remove').trigger('click');
                 }
             });
 
         },
         uryvek_do: function() {
 
             var mthis = this;
 
             setTimeout(function() { // se spozdenim
                 /* zobrazenie uryvku s obrazkom - musi byt pred kontrolou oveflowu */
                 var pic = $(mthis).find('img:first');
                 if (pic.length) {
                     var w = $(mthis).width();
                     if (pic.width() > w) {
                         pic.width(w);
                     }
 
                     if (pic.height() > 1000) {
                         pic.width('', '');
                         pic.height(250);
                     }
                 }
 
                 var child = $(mthis).find('.text:first');
                 if (child.length && $(mthis).isChildOverflowing(child)) {
                     $(mthis).closest('.prispevek').find('.vice_mene:first').show();
                 } else {
                     $(mthis).removeClass('mh');
                 }
 
             }, 50);
 
         },
         titulky_zivot_init: function() {
 
             $(".uryvek:visible").each(is.Zivot.uryvek_do);
 
             $('#zivot .dalsi').click(function(){
                 return true; // Zatim se nenatahnou prispevky sem ale primo se presmeruje do Zivota
 
                 /*
                 if (!$('#zivot').hasClass('vice')) {
                     $('#zivot').addClass('vice');
                     $('#obsah').addClass('vice');
                     $(".uryvek:visible").each(is.Zivot.uryvek_do);
                     return false;
                 }
 
                 return true;
                 */
             });
 
         },
     };
 }); // konec is.Zivot
 
 /**
  * Trieda upravuje default spravanie #hash odkazov (kotev), aby brali do uvahy
  * horny panel, ktory ma position fixed.
  */
 is.Define.module('HashNavigation', function(namespace, $) {
 
     return {
 
         // Prepise nativni chovani posunu stranky na element oznaceny id,
         // aby se pri posunu zohlednil sticky panel.
         init: function() {
             $(document).on('click.hashnav', 'a', function(e){
                 if (e.isDefaultPrevented()) {
                     return;
                 }
 
                 var anchor_hash	= this.hash;
                 var anchor_loc	= this.href.replace(anchor_hash, '');
                 var window_loc	= location.href.replace(location.hash,'');
                 var $target	= is.HashNavigation.hash_target(window.location.hash);
 
                 if (anchor_loc === window_loc && anchor_hash && $target.length) {
 
                     e.preventDefault();
                     var were_equal = location.hash === anchor_hash;
 
                     location.hash = anchor_hash; /* this might trigger hashchange event below */
                     if (were_equal) {
                         $(window).trigger('hashchange'); /* trigger manually */
                     }
                 }
             });
 
             $(window).on('hashchange.hashnav', function (e) {
                 e.preventDefault();
                 var $target	= is.HashNavigation.hash_target(window.location.hash);
                 is.HashNavigation.scrollTo($target);
             }).trigger('hashchange.hashnav');
 
             $(window).on('load', function(){
                 $(window).trigger('hashchange.hashnav');
             });
         },
 
         // Zrusi udalosti, ktere prepisuji nativni chovani posunu dle hash, a vrati puvodni funkcionalitu.
         destroy: function() {
             $(document).off('click.hashnav');
             $(window).off('hashchange.hashnav');
         },
 
         // vrati jquery object podla vstupneho hash selektoru,
         // riesi pripad, ze hash obsahuje znaky, ktore sa v jquery selektoroch
         // beru ako metaznaky a preto ich treba escapovat pomocou \\
         hash_target: function(hash) {
             hash = decodeURIComponent(hash);
 
             var selector = hash.replace(/^#/, '').replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, "\\$1");
 
             if (selector && !(/\s/.test(selector))) {
                 selector += ', [name='+selector+']';
                 return $('#'+selector);
             }
 
             return $([]);
         },
 
         // Posune stranku na vybrany element.
         //
         // 	is.HashNavigation.scrollTo(target, time);
         //
         // 	target	- jakykoli identifikator elementun na strance
         // 	time	- pokud je vyplneno, presun je plynuly
         //
         scrollTo: function(t, time) {
             var $sticky = $('#sticky_panel');
             var $target = $(t).first();
             if (arguments.length < 2) {
                 time = 0;
             }
 
             $target.trigger('beforeScrollTop.'+namespace);
 
             // Timeout s nulovym casem, aby udalosti s nulovym casem
             // provedene v beforeScrollTop se provedly drive nez skutecny scrollTop.
             setTimeout(function () {
                 if ($target.is(':visible')) {
                     $('html, body').animate({
                         scrollTop:  $target.offset().top - $sticky.outerHeight(),
                     }, time);
                 };
 
                 $target.trigger('afterScrollTop.'+namespace);
             }, 0);
         }
     };
 
 }); // konec is.HashNavigation
 
 /**
  * Slouží pro obsluhu pluginu $.fn.chosen. Krome upravenych vychozich parametru
  * poskytuje preklady univerzalnich textu.
  */
 is.Define.module('SelectChosen', function(namespace, $) {
     var default_chosen_params = {
         allow_single_deselect	: true,		// umozni odstranit vybranou hodnotu u selectu, ktery neni multiple
         search_contains		: true,		// umozni fulltextove vyhledavani v polozkach
         disable_search_threshold: 10,		// schova vyhledavani, pokud ma 'select' mene nez 10 polozek
     };
     var ldb_keys = 'placeholder_text_single placeholder_text_multiple no_results_text'.split(' ');
 
     return {
         /**
          * Iniializuje u vsech 'select' predanych v prvnim parameru jquery doplnek Chosen.
          * Oficialni dokumentace doplnku zde https://plugins.jquery.com/chosen/
          *
          * 	is.SelectChosen.init($select, chosen_params);
          *
          * 	kde:
          * 		$select		- identifikator nebo jQuery objekt
          * 		chosen_params	- parametry predane doplnku $.fn.chosen
          */
         init: function($select, chosen_params){
             var i, ldb_key;
 
             if (!$.fn.chosen) {
                 console.error('jQuery plugin $.fn.chosen nenalezen. Je treba provest inicializaci JS pres Toolkit.', $select, chosen_params);
                 return;
             }
 
             $select = $($select);
             if (!$select.is('select')) {
                 console.error('Nalezený element není typu "select".', $select, $select.length, chosen_params);
                 return;
             }
 
             // nastavi vychozi parametry
             chosen_params = $.extend(true, {}, default_chosen_params, chosen_params);
 
             // doplni preklady
             for (i = 0; i < ldb_keys.length; ++i) {
                 ldb_key = ldb_keys[i];
                 if (!chosen_params.hasOwnProperty(ldb_key)) {
                     chosen_params[ldb_key] = is.ldb.get(namespace + '_' + ldb_key);
                 }
             }
 
             if (chosen_params.no_results_text != null) {
                 chosen_params.no_results_text += ' ';
             }
 
             $select.chosen(chosen_params);
 
             if (chosen_params && chosen_params.set_max_width) {
                 var $chosen = $("#"+$select.attr('id')+"_chosen");
                 var value = $select.val();
                 $select.val('').trigger("chosen:updated");
                 $chosen.css('max-width', $chosen.css('width'));
                 $select.val(value);
                 $select.trigger("chosen:updated");
             }
         },
     };
 }); // konec is.SelectChosen
 
 /**
  * Modifikuje Foundation doplnek FDatePicker. Modifikace je zde, aby se nemuselo
  * zasahovat do zdrojoveho kodu, ktery je linkovan do stranky v minimalizovane verzi.
  *
  * Dale modul obsahuje samotnou inicializaci jednotlivych inputu na ktere je doplnek navazan.
  */
 is.Define.module('FDatePicker', function(namespace, $) {
     var first_init = true;
 
     return {
 
         /*
          * Iniicializuje kalendarik u inputu.
          *
          * 	is.FDatePicker.init({
          * 		id:		'prvek_65162',			# prvek, ktery se ma inicializovat
          * 		zvyraznit	{ '20183002': 'red', }		# vlastni zvyrazneni datumu
          * 		hodiny_minuty:	true,				# tru, pokud se name zobrazovat v kalendariku datum
          * 	});
          *
          * Pri prvni inicicalizaci provede upravy doplnku,
          * ktere zmeni chovani validace, aby lepe odpovidala
          * ostatnim inputum ve formulari.
          *
          */
         init: function(params){
             if (!$.fn.fdatepicker) {
                 console.error('jQuery plugin $.fn.fdatepicker nenalezen.', params);
                 return null;
             }
 
             if (first_init) {
                 first_init = false;
 
                 // prepise chovani pluginu Datepicker aby zvladal spravne validovat format 'd. m. yyyy'
                 $.fn.fdatepicker.Constructor.prototype.update = _fdatepicker_update;
                 $.fn.fdatepicker.Constructor.prototype._is_hide_original = $.fn.fdatepicker.Constructor.prototype.hide;
                 $.fn.fdatepicker.Constructor.prototype.hide = _fdatepicker_hide;
                 $.fn.fdatepicker.Constructor.prototype.setValue = _fdatepicker_setValue;
 
                 // - definuje validator, ktery maji nastaveny vsechny datepickery tvorene v Toolkitu
                 // - validator vychazi z upravene funkce $.fn.fdatepicker.Constructor.prototype.update
                 is.Forms.set_validator('fdatepicker', 'error_msg', function (val, $input) {
                     var datepicker = $input.data('datepicker');
                     return !datepicker || !datepicker.isInvalid;
                 });
 
                 $.fn.fdatepicker.dates['cs'] = {
                     days:		["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"],
                     daysShort:	["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
                     daysMin:	["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
                     months:		["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
                     monthsShort:	["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"],
                     today:		"Dnes"
                 };
             }
             // kalendar - Foundation Datepicker
             var $input = $('#'+params['id']);
 
             var saved_params = $input.data('picker_init_params');
             if (saved_params) {
                 $( $input.data('datepicker')['picker'] ).remove();
                 $input.removeData('datepicker');
                 params = saved_params;
             } else {
                 $input.data('picker_init_params', params);
             }
 
             $input.fdatepicker({
                 leftArrow: '<<',
                 rightArrow: '>>',
                 language: is.session.lang,
                 weekStart: 1,
                 startDate: (params.start_date || -Infinity),
                 endDate: (params.end_date || Infinity),
                 onRender: function (date) {
                     var highlight = '';
                     var yyyymmdd = '' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
                     var custom = (params['zvyraznit'] || {})[yyyymmdd];
 
                     if (custom) {
                         highlight = custom;
                     } else if (is.svatky.exists(yyyymmdd)) {
                         highlight = 'dp-svatek';
                     } else if (!(date.getDay() % 6)) {
                         highlight = 'dp-vikend';
                     }
 
                     return highlight;
                 }
             });
 
             if ($input.length) {
                 $input.data('datepicker').picker.toggleClass('no-date', !!params['hodiny_minuty']);
             }
 
             $input.on('focus', function () {
                 $('#'+params['id']).data('datepicker').wasFocused = true;
             });
         },
     };
 
     function _fdatepicker_hide () {
         $.fn.fdatepicker.Constructor.prototype._is_hide_original.apply(this, arguments);
 
         // pri schovani kalendariku se meni hodnota inputu,
         // proto je potreba znovu zavolat validatory
         this.update();
     }
 
     function _fdatepicker_update () {
         var date, fromArgs = false;
         var currentVal = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
         if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
             date = arguments[0];
             fromArgs = true;
         }
         else if (!currentVal && this.initialDate != null) { // If value is not set, set it to the initialDate
             date = this.initialDate
         }
         else {
             date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
         }
 
 //            if (date && date.length > this.formatText.length) {
 //                    $(this.picker).addClass('is-invalid')
 //                    $(this.element).addClass('is-invalid-input')
 //                    return;
 //            } else {
 //                $(this.picker).removeClass('is-invalid')
 //                $(this.element).removeClass('is-invalid-input')
 //
 //            }
 //
 //            this.date = DPGlobal.parseDate(date, this.format, this.language);
 
 //----- zacatek naseho vlastniho kodu jako nahrada vyse zakomentovaneho -------
         // pokud je ve formatu nejaka polozka definovana jednim pismenem (napr. den pomoci 'd')
         // zvysis se povolena delka, kterou muze mit hodnota v inputu
         var i, len = this.format.parts.length, posible_len = this.formatText.length;
         for (i = 0; i < len; i++) {
             if (this.format.parts[i].length === 1) {
                 ++ posible_len;
             }
         }
 
         // schvalne je pouzito this.isInvalid misto casto logictejsi this.isValid,
         // protoze je zadouci, aby kdyz neni hodnota vyplnena (this.isInvalid == null),
         // tak se input tvaril jako validni.
         this.isInvalid = date && date.length > posible_len;
         $(this.picker).toggleClass('is-invalid', !this.isInvalid);
         if (this.wasFocused) {
             var $form = this.element.closest('form');
             // pri zatvoreni modalneho okna doslo k odpojeniu $form od DOMu, preto kontrolujem, ci je $form stale pripojeny
             if ($form.length && $.contains(document, $form[0])) {
                 $form.foundation('validateInput', this.element);
             }
         }
         if (this.isInvalid) {
             return;
         }
 
         this.date = $.fn.fdatepicker.DPGlobal.parseDate(date, this.format, this.language);
 //----- konec nasho vlastniho kodu --------------------------------------------
 
         if (fromArgs || this.initialDate != null) this.setValue();
 
         if (this.date < this.startDate) {
             this.viewDate = new Date(this.startDate.valueOf());
         } else if (this.date > this.endDate) {
             this.viewDate = new Date(this.endDate.valueOf());
         } else {
             this.viewDate = new Date(this.date.valueOf());
         }
         this.fill();
     }
 
 //        setValue: function() {
 //            var formatted = this.getFormattedDate();
 //            if (!this.isInput) {
 //                if (this.component) {
 //                    this.element.find('input').val(formatted);
 //                }
 //                this.element.data('date', formatted);
 //            } else {
 //                this.element.val(formatted);
 //            }
 //        },
 
     // upravena funkce setValue zamezuje zmenit hodnotu inputu, pokud je readonly
     function _fdatepicker_setValue () {
         var $input, formatted;
 
         if (!this.isInput) {
             if (this.component) {
                 $input = this.element.find('input');
             }
         } else {
             $input = this.element;
         }
 
         if (!$input || $input.attr('readonly') == null) {
             formatted = this.getFormattedDate();
 
             if ($input) {
                 $input.val(formatted);
             }
 
             if (!this.isInput) {
                 this.element.data('date', formatted);
             }
         }
     }
 }); // konec is.FDatePicker
 
 is.Define.module('NavMenu', function(namespace) {
 
     var $left_menu   = $('#left_menu'),
         $offset  = $('#left_menu_offset_wrap'),
         $content = $('#content'),
         $window  = $(window),
         $footer  = $('footer'),
         menu_ajax;
 
     /* left menu props */
     var menu_top = parseInt($offset.css('top')),
         last_scroll_top = $window.scrollTop(),
         scrollable      = 0;
 
     return {
         init: function() {
 
             menu_ajax = new is.Ajax({ url: '/auth/design_ajax', seq_request_skip: true });
             var $edit_button = $('#left_menu div.items .toggle_edit_mode');
 
             menu_ajax.before(function(){
                 $edit_button.toggleClass('loading');
             });
 
             menu_ajax.after(function(){
                 $edit_button.toggleClass('loading');
             });
 
             $('#app_content').css('min-height', $left_menu.height() + 50);
             $window.on('resize.navmenu', _menu_pinned_should_scroll).trigger('resize.navmenu');
             $window.on('scroll.navmenu', _menu_pinned_onscroll);
 
             $(document).on('click', $edit_button.selector, function() {
 
                 $(this).removeClass('isi-nastaveni');
                 if ($left_menu.hasClass('edit')) {
                     _stop_edit_mode();
                 } else {
                     _system_menu_to_tags();
                     _start_edit_mode();
                 }
             });
 
             var edit_mode_mobile;
 
             $(document).on('click', '#header_menu ul.items .toggle_edit_mode', function() {
 
                 edit_mode_mobile = true;
 
                 $('#header_menu').foundation('close');
                 $('body').addClass('left_menu_force');
                 $('#left_menu').removeClass('hide-for-1280-only');
                 is.NavMenu.toggle( true );
                 $('#sticky_panel i[data-toggle="header_menu"]').hide();
 
                 _system_menu_to_tags();
                 _start_edit_mode();
             });
 
             $(document).on('click', '#left_menu button.hotovo', function() {
                 _stop_edit_mode();
 
                 if (edit_mode_mobile) {
                     edit_mode_mobile = false;
                     $('body').removeClass('left_menu_force');
                     $('#left_menu').addClass('hide-for-1280-only');
                     is.NavMenu.toggle( false );
                     $('#sticky_panel i[data-toggle="header_menu"]').show();
                     $('#header_menu').foundation('open');
                 }
             });
 
             $(document).on('click', '#drobecky .sponka', function(e){
 
                 _animate_pin($(this));
 
                 is.Ajax.request('/auth/design_ajax.pl', {
                     operace: 'pin_app',
                     title: $('title').html(),
                     url: location.href,
                 }).done(_after_pin);
             });
         },
         refresh: function() {
             $('#app_content').css('min-height', $left_menu.height() + 50);
             menu_top = parseInt($offset.css('top'));
             $(window).trigger('scroll').trigger('resize'); // just in case reposition menu
         },
         toggle: function(display) {
 
             if (!$left_menu.length) {
                 return;
             }
 
             if (!arguments.length) {
                 display = !$left_menu.is(':visible');
             }
 
             if ($window.scrollLeft() > 0) {
                 display = 0;
             }
 
             if (is.Expand.is_expanded()) {
                 display = 0;
             }
 
             var $header_menu = $('#sticky_panel i[data-toggle="header_menu"]');
 
             $left_menu.toggle(!!display);
             $header_menu.toggleClass('show-for-1280-only', !!display);
             $content.toggleClass('left_menu_enabled', !!display);
         },
         edit: _start_edit_mode,
     };
 
     // funkcia naznaci pohybom sponky ulozenie do menu
     function _animate_pin($pin) {
 
         var	pin_offset        = $pin.offset(),
             $left_menu_target = $('#left_menu ul.tags')
             ;
 
         $pin.hide(); // sponku schovam
 
         // vyrobim kopiu na stejnej pozicii
         var $clone = $('#drobecky .sponka').clone().addClass('drobecky_sponka_animating').offset(pin_offset).appendTo('body').show();
 
         // budem animovat pohyb sponky do menu
         if ($left_menu_target.is(':visible')) { // leve menu
 
             $clone.animate({
                 left: $('body .row:first:visible').offset().left -35,
                 top: $left_menu_target.offset().top + $left_menu_target.height(),
             }, 1500, function(){
                 $clone.remove();
                 $pin.show();
             });
 
         } else { // header menu
             var $header_menu_target = $('#sticky_panel i[data-toggle="header_menu"]');
 
             $clone.animate({
                 top: 10,
                 left: ($header_menu_target.offset() || {}).left,
             }, 1500, function(){
                 $clone.remove();
                 $pin.show();
                 $header_menu_target.trigger('click');
             });
         }
 
         return $clone;
     }
 
     function _start_edit_mode() {
 
         _hide_app_link_pins();
         var $tags = $left_menu.find('.tags');
         $left_menu.addClass('edit');
 
         $tags.sortable({
             update: function(el, ui) {
                 var ids = [];
                 $tags.find('> li a.remove').each(function(){
                     ids.push($(this).data('id'));
                 });
                 menu_ajax.request({
                     operace: 'menu_reorder',
                     zalozky_csv: ids.join(','),
                 });
             },
         });
 
         $tags.find('.remove').on('click.'+namespace, function(e){
             var self = this;
             menu_ajax.request({ operace: 'menu_delete_item', id: $(this).data('id') }).done(_after_pin);
             e.stopPropagation();
             e.preventDefault();
         });
 
         $tags.find('.edit').on('click.'+namespace, function(e){
             var self = this;
 
             _add_edit_form(self, {
                 operace: 'menu_edit_item_form',
                 id: $(self).data('id')
             }, {
                 operace: 'menu_edit_item_uloz',
                 id: $(self).data('id'),
             });
             e.stopPropagation();
             e.preventDefault();
         });
 
         $left_menu.find('div.add a').on('click.'+namespace, function(e){
             var self = this;
 
             _add_edit_form(self, {
                 operace: 'menu_empty_item_form',
                 id: $(self).data('id')
             }, {
                 operace: 'menu_add_item_uloz',
             });
             e.stopPropagation();
             e.preventDefault();
         });
 
         var editing = 0;
         function _add_edit_form(self, form_req_data, save_req_data) {
 
             if (!editing) {
                 editing++;
             } else {
                 return;
             }
 
             menu_ajax.request(form_req_data).done(function(data){
 
                 var $dropdown_el = $(data.html);
                 $(self).attr('data-toggle', 'left_menu_edit_dropdown');
                 $('body').append($dropdown_el);
 
                 var dropdown = new window.Foundation.Dropdown($dropdown_el, {
                     closeOnClick: true,
                     position: 'auto',
                     allowBottomOverlap: false,
                 });
                 $dropdown_el.foundation('open');
 
                 is.Forms.ajax_submit('#left_menu_edit_dropdown form', menu_ajax, save_req_data).done(_after_pin);
 
                 $dropdown_el.one('hide.zf.dropdown', function(){
                     $(self).removeAttr('data-toggle');
                     $dropdown_el.remove();
                     editing--;
                 });
 
                 $dropdown_el.find('#left_menu_edit_zrus').one('click', function(e){
                     e.preventDefault();
                 });
 
             });
 
         }
 
         $tags.find('div.add i').on('click.'+namespace, function(e){
             var self = this;
 
         });
 
         // shaking
         $tags.find('> li').each(function(){
             var delay = Math.floor((Math.random() * 75) + 1) / -100;
             var duration = Math.floor((Math.random() * 40) + 30) / 100;
 
             $(this).css('animation-delay', delay+'s');
             $(this).css('animation-duration', duration+'s');
         });
 
         // do not allow to follow url
         $tags.find('a').on('click.'+namespace, function(e) {
             e.preventDefault();
         });
 
         $left_menu.find('button.reset').on('click.'+namespace, function(){
             menu_ajax.request({ operace: 'menu_reset' }).done(function(data){
                 _stop_edit_mode();
                 var $tags = $left_menu.find('ul.tags').html(data.menu_html);
                 _start_edit_mode();
             });
         });
 
         _show_app_link_pins();
         is.NavMenu.refresh();
     }
 
     function _stop_edit_mode() {
 
         $left_menu.removeClass('edit');
         $('#left_menu div.items i.toggle_edit_mode').addClass('isi-nastaveni');
         var $tags = $left_menu.find('.tags');
 
         var sortable = $tags.data('ui-sortable');
         if (sortable) {
             $tags.sortable('destroy');
         }
 
         $tags.find('i').off('click.'+namespace);
         $tags.find('a').off('click.'+namespace);
         _hide_app_link_pins();
     }
 
     var pins;
     function _show_app_link_pins() {
 
         pins = [];
 
         var is_absolute = new RegExp('^(?:[a-z]+:)?//', 'i');
         var proto_host = window.location.protocol + "//" + window.location.host;
 
         $('#app_content, #odkazy-rel').find('a[href]:not([href="#"])').filter(function(i, e){
             var $e = $(e);
             var href = $e.attr('href');
             if (
                 (is_absolute.test(href) && href.indexOf(proto_host) != 0)
                 || (($e.text() || '').trim() == '' && !($e.attr('title') || '').trim())
                 || $e.closest('.menu_no_pin').length
             ) {
                 return false;
             }
             return true;
 
         }).each(function(i, e){
             var $e		= $(e);
             var url		= $e.attr('href');
             var text	= ($e.text() || '').trim();
             var attr_title	= ($e.attr('title') || '').trim();
             var title = (text ? text : attr_title);
             var $pin = $('<i class="app_link_pin isi-pripinacek" title="'+title+'"></i>');
             pins.push($pin);
 
             if ($e.css('float') != 'none') {
                 $pin.css('float', $e.css('float'));
                 $e.prepend($pin);
             } else {
                 $e.append($pin);
             }
 
             $pin.on('click', function(e){
                 e.preventDefault();
                 e.stopImmediatePropagation();
                 _animate_pin($(this));
 
                 menu_ajax.request({
                     operace: 'pin_app',
                     title: title,
                     url: is.Misc.absolutize(url),
                 }).done(_after_pin);
             });
         });
     }
 
     function _after_pin(data) {
         _hide_app_link_pins();
         $('#header_menu .items').find('li:not(.ikony, .noitem)').remove();
         $('#header_menu .items').append(data.html);
         $('#left_menu .items ul.tags').html(data.html);
         if ($left_menu.hasClass('edit')) {
             _stop_edit_mode();
             _start_edit_mode();
         }
         $('#left_menu_edit_dropdown').remove();
         is.NavMenu.refresh();
     }
 
     function _hide_app_link_pins() {
         if (pins && pins.length) {
             $.each(pins, function(i, e){
                 $(e).remove();
             });
             pins.length = 0;
         }
     }
 
     function _system_menu_to_tags() {
 
         var $lis = $left_menu.find('.tags > li.system');
         if (!$lis.length) {
             return;
         }
 
         menu_ajax.request({ operace: 'system_menu_to_tags' }).done(_after_pin);
 
     }
 
     function _menu_pinned_onscroll(e) {
 
         var scroll_top = $window.scrollTop();
         var scroll_step;
 
         // reset
         $left_menu.css('left', '');
         if ( $window.scrollLeft() > 0 ) {
             var left = parseFloat( $left_menu.css('left') ) || 0;
             $left_menu.css('left', left - $window.scrollLeft());
         }
 
         if ($footer.length && $footer.offset().top < $window.scrollTop() + $window.height()
             ) {
             _menu_pinned_should_scroll();
         }
 
         if (scrollable) {
             scroll_step = Math.abs(scroll_top - last_scroll_top);
             var old_top = $left_menu.offset().top - scroll_step;
 
             if (scroll_top > last_scroll_top){
                 // downscroll code
                 var new_top = $left_menu.offset().top - scroll_step;
 
                 var threshold = scroll_top + _window_height() - $left_menu.height();
 
                 new_top = near_threshold(new_top, threshold, 10); // ak sme blizko prahu, skocime na prah
 
                 $left_menu.offset({
                     top: Math.max(new_top, threshold),
                 });
 
             } else {
                 // upscroll code
                 var new_top = $left_menu.offset().top + scroll_step;
                 if (scroll_top > menu_top) {
 
                     var threshold = scroll_top + 40;
                     new_top = near_threshold(new_top, threshold, 10);
 
                     if (new_top <= threshold) {
                         $left_menu.offset({
                             top: new_top
                         });
                     }
                 } else {
                     var threshold = scroll_top + menu_top;
                     new_top = near_threshold(new_top, threshold, 10);
 
                     $left_menu.offset({
                         top: Math.min(new_top, scroll_top + menu_top)
                     });
                 }
             }
             last_scroll_top = scroll_top;
         }
 
         function near_threshold(val, th, proximity) { // helper fnc
             return (Math.abs(val - th) <= proximity ? th : val);
         }
     }
 
     function _menu_pinned_should_scroll() {
         var menu_height = $left_menu.height();
         var scrollable_old = scrollable;
 
         if (menu_top + menu_height > _window_height()) {
             scrollable = 1;
             last_scroll_top = $window.scrollTop();
 
             $left_menu.offset({ // moves menu with bottom window border
                 top: Math.max($window.scrollTop() + _window_height() - $left_menu.height(),
                         menu_top
                 ),
             });
         } else {
             scrollable = 0;
 
             $left_menu.animate({ top: 0 }, 0);
         }
 
         if (scrollable_old !== scrollable) {
             //console.log("menu_scrollable: " + scrollable + " at: " + $(window).height());
         }
 
     }
 
     function _window_height() {
         var bottom_offset = $('#sticky_bottom_panel_anchor').height();
 
         // ak je footer viditelny, tak simuluje, ze dolny okraj okna je horny okraj elementu footer
         // teda typicky zmensi
         if ($footer.length) {
             var margin_top = parseInt( $footer.css('marginTop') ) || 0;
             var offset_top = $footer.offset().top - margin_top;
             if (offset_top < $window.scrollTop() + $window.height())
                 return offset_top - $window.scrollTop() - bottom_offset;
         }
 
         return $window.height() - bottom_offset;
     }
 
 }); // konec is.NavMenu
 
 /* modre aplikacni menu */
 is.Define.module('AppMenu', function(namespace) {
 
     return {
 
         /**
          * Inicialisuje udalostu aplikacniho menu.
          * Aplikacni menu muze byt na strance jen jedno.
          */
         init: function() {
             $('.app-menu-hidden').removeClass('app-menu-hidden');
             $(window).off('resize.'+namespace).on( 'resize.'+namespace, Foundation.util.throttle( is.AppMenu.update_menu, 200 ));
             is.AppMenu.update_menu();
 
             $('#app_menu_items').find('.polozka').on('click.'+namespace, function(){
                 is.AppMenu.set_active(this);
             });
         },
 
         /**
          * Oznaci predanou polozku menu (a.polozka) jako aktivni.
          */
         set_active: function ($item) {
             var $items;
 
             $item = $($item);
             if ($item.is('.nezaktivnovat')) {
                 $item.removeClass('active');
                 return;
             }
 
             $items = $('#app_menu_items').children('.polozka');
             if ($item.parent()[0] !== $items.parent()[0]) {
                 $item = $items.eq($item.parent().parent().children().index($item.parent()));
             }
 
             $items.toggleClass('active', false);
             $item.addClass('active');
         },
 
         /**
          * Aktualizuje seznam zobrazenych a seznam skrytych polozek
          * na zaklade sirky stranky.
          */
         update_menu: function(){
             var app_menu = $('#app_menu_items')[0],
                 $app_menu_items = $('#app_menu_items > .polozka'),
                 $app_menu_small = $('#app_menu_small'),
                 $app_menu_small_items = $('#app_menu_small .polozka_parent'),
                 is_any_overflowing = false;
 
             $(app_menu).css('overflow', 'hidden'); // prevent content jumping in mobile filefox
             $app_menu_items.show(); // have to display items to measure overflow
 
             $app_menu_items.each(function(i, element) {
 
                 var right_offset = (i == $app_menu_items.length - 1) ? 0 : $app_menu_small.width();
 
                 if ((
                         element.offsetTop < app_menu.offsetTop
                         || element.offsetLeft < app_menu.offsetLeft
                     ) || (
                         element.offsetTop + element.offsetHeight > app_menu.offsetTop + app_menu.offsetHeight
                         || element.offsetLeft + element.offsetWidth > app_menu.offsetLeft + app_menu.offsetWidth - right_offset
                 )) {
 
                     $app_menu_items.slice(i).hide();
                     $app_menu_small_items.slice(i).css( "display", "block" );
                     is_any_overflowing = true;
                     return false; // break from the each loop
                 } else {
                     $(element).show();
                     $($app_menu_small_items.get(i)).hide();
                 }
 
             });
 
             $(app_menu).css('overflow', 'visible');
             $app_menu_small.toggle(is_any_overflowing);
         },
     };
 }); // konec is.AppMenu
 
 /**
  * Trieda pre vytvaranie ajaxoveho poziadavku v prostredi ISu.
  *
  * Trieda automaticky zohladni pouzitie myuco, jazyku, pri chybe automaticky
  * zopakuje request (implicitne 2x), podpora pre hlasenie chyby.
  *
  * Pouzitie objektoveho rozhrania:
  *
  * 	var naseptavac_ajax = new is.Ajax({
  *				url: '/auth/naseptavac_data',
  *				data: {
  *					typ: 'app', // CGI param stejny pre kazdy request
  *				},
  *	});
  *	naseptavac_ajax.request({
  *					q: $(this).val(), // parameter rozny pre kazdy request
  *				}).done(function(data) {
  *					...
  *				}); // a takto je mozne volat opakovane nad naseptavac_ajax i z inych miest
  *
  * Pouzitie funkcionalneho rozhrania:
  *
  *	is.Ajax.request('/auth/design_ajax.pl', {
  *				operace:	'pref',
  *				nazev:		'w_view_header_skryt',
  *				hodnota:	($('#content').hasClass('no_app_header') ? 'a' : 'n'),
  *	});
  *
  * Pomocou parametrov settings podporuje oproti $.ajax(settings) navyse este kluce:
  *
  * 	- shouldRetry, pocet opakovani requestu (impl. 2)
  * 	- delayRetry, opakovany request opozdit o ms
  * 	- nanobar, bool zobrazi indikator navigacie (podobne ako loading, ale typicky len pri ajaxovej navigacii - zmena url)
  *
  * Objektove rozhranie navyse podporuje:
  * 	- seq_request, boolean, ak je true, tak nikdy neprebiehaju 2 requesty naraz nad aktualnou instanciou,
  * 				request caka na dokoncenie predosleho requestu (xhr je stale asynchronny)
  * 	- seq_request_skip, boolean, ak je true, tak pri volani request zahadzuje poziadavky,
  * 			             ktore prisli pocas nejakeho existujuceho poziadavku
  *
  * Motatko - animace zobrazena behem nacitani obsahu
  *	- loading - instance tridy is.Loading nebo parametry, ktere akceptuje konstruktor is.Loading
  *
  *		var tmp_loading = new is.Loading('#some_div');
  *
  * 		loading: tmp_loading,
  *		loading: '#my_div',
  *		loading: {
  *				parent	: '#my_div',
  *				delay	: 0,
  *		},
  *
  * Implicitni http metoda je POST. Je mozne zmenit skrze settings.
  *
  * Poznamky:
  * 	- V pripade, ze data su specifikovane ako retazec, nedoplnia sa automaticke parametre requestu (napr. myuco).
  */
 is.Define.class('Ajax', function() {
 
     /**
      * Konstruktor Ajax - umozni pouzit objektove rozhranie
      *
      * varianty:
      * 	Ajax(url, settings)
      *	Ajax(settings)
      *
      * params:
      * 	- url, cielove url kazdeho requestu tejto instancie
      * 	- settings, objekt settings platny pre kazdy request
      * 		- kluce ako pre $.ajax(settings)
      */
     function Ajax(url, settings) {
 
         if (typeof url === 'object' && !(url instanceof String)) { /* one argument version */
             settings = url;
         }
 
         this.settings = settings || {};			/* is.Ajax settings */
 
         if (typeof url === 'string') { /* two argument version */
             this.settings.url = url;
         }
 
         this._deferred = $.Deferred().resolve();
 
         this.callbacks_before = $.Callbacks();
         this.callbacks_after  = $.Callbacks();
 
         if(this.settings.loading != null && !(this.settings.loading instanceof is.Loading)) {
             this.settings.loading = new is.Loading(this.settings.loading);
         }
     }
 
     /**
      * request(request_data, callback_ok, callback_fail, callback_always)
      *
      * fnce objektoveho rozhrania, vraci jquery obj nad ktorym je mozne volat done, fail, ...
      */
     Ajax.prototype.request = function(data, callback_ok, callback_fail, callback_always) {
         var self = this,
             seq_request = (self.settings.seq_request || self.settings.seq_request_skip),
             sr_defferred,	// pre seq_request
             sr_ajax_defferred;	// pre seq_request
 
         if (seq_request) {
             sr_defferred = $.Deferred(); // toto caka na pripadne predosle volanie request
             sr_ajax_defferred = $.Deferred(); // toto caka na skoncenie requestu z tohoto volania
         }
 
         if (self.settings.seq_request_skip && self._deferred.state() === 'pending') {
             return sr_ajax_defferred;
         }
 
         if (_data_is_empty(data)) {
             data = _data_normalize(self.settings.data);
         } else {
             data = _data_extend(_data_copy(self.settings.data), data);
         }
 
         var request_fn = function() {
 
             self.callbacks_before.fire();
 
             return _request(
                 $.extend({}, self.settings, {
                     data: data,
                 })
             ).done(function(data, textStatus, jqXHR) {
                 if (seq_request) {
                     sr_ajax_defferred.resolve(data, textStatus, jqXHR);
                 }
 
                 if (callback_ok) {
                     callback_ok(data);
                 }
                 if (callback_always) {
                     callback_always();
                 }
 
             }).fail(function(jqXHR, textStatus, errorThrown) {
                 if (seq_request) {
                     sr_ajax_defferred.reject(jqXHR, textStatus, errorThrown);
                 }
 
                 if (callback_fail) {
                     callback_fail(jqXHR, textStatus, errorThrown);
                 }
                 if (callback_always) {
                     callback_always();
                 }
 
                 if (!self.settings.no_fail_msg) {
                     _fail_msg(jqXHR, textStatus, errorThrown);
                 }
 
             }).always(function(){
                 self.callbacks_after.fire.apply(self.after, Array.prototype.slice.call(arguments));
 
                 if (seq_request) {
                     sr_defferred.resolve(); // toto volanie request je dokoncene
                 }
             });
         };
 
         if (seq_request) {
             this._deferred.then(request_fn); // request spustim, az ked predosle skoncia
             self._deferred = $.when(self._deferred, sr_defferred); // nech dalsie volanie seq_request caka na vsetky predosle a toto volanie
             return sr_ajax_defferred.promise(); // vratim deferred, ktory skonci rovnako ako request
         } else {
             return self.actual = request_fn();
         }
     };
 
     /**
      * Metoda zaregistruje funkciu/e, ktora sa vykova pred kazdym requestom danej instancie is.Ajax.
      *
      * Params:
      * 		callbacks - funkcia alebo pole funkcii
      *
      * Return:
      * 		vrati instanciu is.Ajax
      */
     Ajax.prototype.before = function(callbacks) {
         var self = this;
         self.callbacks_before.add(callbacks);
 
         return self;
     };
 
     /**
      * Metoda zaregistruje funkciu/e, ktora sa vykova po kazdom requeste danej instancie is.Ajax.
      *
      * Params:
      * 		callbacks - funkcia alebo pole funkcii
      *
      * Return:
      * 		vrati instanciu is.Ajax
      */
     Ajax.prototype.after = function(callbacks) {
         var self = this;
         self.callbacks_after.add(callbacks);
 
         return self;
     };
 
     /**
      * Metoda pred odeslanim requestu doplni settings (data) o informace z formulare.
      *
      * Pozor trvale zmeni hodnotu 'url' a 'method' v settings, pokud drive nebyly vyplneny.
      *
      *	ajax.send_form(form_selector, data)
      *
      * 		- form_selector: jquery selector nebo objekt formulare (odosiela sa prvy najdeny)
      * 		- data: data, ktera nejde vytahnout z formulare
      *
      *	Priklad:
      *
      *		is.Ajax.send_form('#moj_form', {
      *			dalsi_param: 'val',
      *		}).done(function() { ... });
      *
      * 	Pozn.
      * 		- nezahrna submit button (viz api.jquery.com/serializeArray/)
      * 		  je treba pridat explicitne
      * 		- z formulare pouzije krome dat (input, select, textarea atd.) i atribut 'action' a 'method'
      */
     Ajax.prototype.send_form = function(form_selector, data) {
         var self = this;
         var $form = $(form_selector).first();
         var zaloha_url = self.settings.url;
         var zaloha_method = self.settings.method;
         var request;
 
         self.settings.url = self.settings.url || $form.attr('action');
         self.settings.method = self.settings.method || ($form.attr('method') || '').toUpperCase();
 
         request = self.request(_data_extend(data, $form.serializeArray()));
 
         self.settings.url = zaloha_url;
         self.settings.method = zaloha_method;
 
         return request;
     };
 
     // request data added to every request from is.session
     var from_session = ['myuco', 'stuco', 'ctiuco'];
 
     // ajax default settings
     var default_settings = {
         method:		'POST',
         shouldRetry:	2,
         delayRetry:	250,
         traditional:	true,
     };
 
     function _request(settings) {
 
         settings = settings || {};
         settings.data = settings.data || {};
 
         // zjednotime nastavenia
         settings = $.extend(true, {}, default_settings, settings);
 
         // zobrazeni cekaci animace
         if (settings.loading != null) {
             if(!(settings.loading instanceof is.Loading)) {
                 settings.loading = new is.Loading(settings.loading);
             }
 
             settings.loading.show();
         }
 
         if (settings.nanobar != null) {
             is.Nanobar.start();
         }
 
         if (is('session.cgipar.lang') && $.inArray('lang', from_session) < 0) {
             from_session.push('lang');
         }
 
         // pridame automaticke parametre
         if (typeof settings.data !== 'string') {
             for (var i = 0; i < from_session.length; ++i) {
                 var key = from_session[i];
                 if (is.session.exists(key)) {
                     if (settings.data instanceof window.FormData) {
                         is.Console.log('Ve FormData objektu nelze overit zda obsahuje jiz nejakou hodnotu, proto pouze pridavam.');
                         settings.data.append(key, is.session.get(key));
                     } else if (Array.isArray(settings.data)) {
                         if ($.grep(settings.data, function(n){ return n.name === key }).length === 0) { // key neni v data
                             settings.data.push({ name: key, value: is.session.get(key)});
                         }
                     } else if ($.isPlainObject(settings.data)) {
                         if (!settings.data.hasOwnProperty(key)) {
                             settings.data[key] = is.session.get(key);
                         }
                     } // else if (typeof settings.data === 'string') { // zatim imho neni treba
                 }
             }
         }
 
         /* if shouldRetry is not a function or boolean, we add posibility of delay */
         if (typeof settings.shouldRetry !== "function" && typeof settings.shouldRetry !== 'boolean') {
 
             var retries = settings.shouldRetry;
 
             settings.shouldRetry = function() { // add retries with delay
                 return $.Deferred(function(dfr) {
                     setTimeout(function() {
                         dfr.resolve(retries-- > 0);
                     }, settings.retryDelay);
                 }).promise();
             };
         }
 
         return $.ajax(settings)
             .done(function () {
                 if (settings.loading) {
                     settings.loading.hide();
                 }
 
                 if (settings.nanobar != null) {
                     is.Nanobar.stop(true);
                 }
             })
             .fail(function (jqXHR, textStatus, errorThrown) {
                 if (settings.loading) {
                     settings.loading.hide();
                 }
 
                 if (settings.nanobar != null) {
                     is.Nanobar.stop(false);
                 }
 
                 if (!settings.no_fail_msg) {
                     if (jqXHR.status == 403) {	// forbidden
                         is.Reveal.prihlaseni();
                     }
                 }
             })
             .done(_process_sys);
     }
 
     var sys_handlers = [
         // vytvori/doplni klientske ldb
         {name: 'ldb', handler: function(value){
             if (is.hasOwnProperty('ldb')) {
                 is.ldb.set(value);
             } else {
                 is.Store.create({ldb: value});
             }
         }},
         // vytvori/doplni klientske data
         {name: 'client_data', handler: function(stores){
             for (var store_name in stores) {
                 var store_data = stores[store_name];
                 if (is.hasOwnProperty(store_name)) {
                     is[store_name].set(store_data);
                 } else {
                     is.Define.property(store_name, new is.Store(store_data), { configurable: true });
                 }
             }
         }},
         {name: 'body_append', handler: function(data) {
             var $data = $(data);
             $(document.body).append($data);
             $data.foundation();
         }},
         {name: 'title', handler: function(data) {
             $('title, #app_name').html(data);
         }},
         {name: 'app_name', handler: function(data) {
             $('#app_name').html(data);
         }},
         {name: 'prepinace', handler: function(data) {
             var $data = $(data);
             $('#is-prepinace #prepinace').replaceWith( $data );
             $data.foundation();
         }},
         {name: 'drobecky', handler: function(data) {
             $('#drobecky').replaceWith(data);
         }},
         {name: 'app_menu', handler: function(data) {
             $('#app_menu_items').replaceWith( $(data).foundation() );
         }},
         {name: 'link_tags', handler: function(tags) {
             for (var i = 0; i < tags.length; ++i) {
                 var attribs  = tags[i];
                 var selector = 'link' + Object.keys(attribs).map(function (attr) {
                     return '[' + attr + '="' + attribs[attr] + '"]';
                 }).join('');
 
                 if ($(selector).length) { // kontrola, ci uz rovnaky tag neexistuje
                     continue;
                 }
 
                 var tag = '<link ' + Object.keys(attribs).map(function (attr) {
                     return attr + '="' + attribs[attr] + '"';
                 }).join(' ') + '>';
 
                 $('head').append( tag );
             }
         }},
         {name: 'meta_tags', handler: function(tags) {
             for (var i = 0; i < tags.length; ++i) {
                 var attribs  = tags[i];
                 var selector = 'meta' + Object.keys(attribs).map(function (attr) {
                     return '[' + attr + '="' + attribs[attr] + '"]';
                 }).join('');
 
                 if ($(selector).length) { // kontrola, ci uz rovnaky tag neexistuje
                     continue;
                 }
 
                 var tag = '<meta ' + Object.keys(attribs).map(function (attr) {
                     return attr + '="' + attribs[attr] + '"';
                 }).join(' ') + '>';
 
                 $('head').append( tag );
             }
         }},
         // spusti vyziadane (re)inicializacie js komponent
         {name: 'js_init', handler: function(data, done_data, done_status, done_jqXHR) {
             var uniq_namespace = is.Misc.uniq_id();
             var $document = $(document);
             var files_ready = $.Deferred();
 
             if (data.files.length) {
                 is.Require.js.apply(is.Require, data.files).then(files_ready.resolve);
             } else {
                 files_ready.resolve();
             }
 
             $document.on('ajaxSuccess.'+uniq_namespace, function (evt, jqXHR) {
                 if (done_jqXHR !== jqXHR) {
                     return;
                 }
 
                 $document.off('ajaxSuccess.'+uniq_namespace);
                 files_ready.done(function() {
                     is.js_init.set(data.components);
                     is.Design.call_init();
 
                     is.Debug.check_all();
                 });
             });
         }},
     ];
 
     /**
      * Spracuje 'poziadavky' poslane skrz JSON kluc '_sys'
      */
     function _process_sys(data) {
         var sys, i, len, sys_handler, args;
 
         if (typeof data !== null && typeof data === 'object' && data.hasOwnProperty('_sys')) {
             sys = data['_sys'];
 
             if (Object.hasOwnProperty('defineProperty')) { // urobim _sys non-enumerable
                 Object.defineProperty(data, '_sys', { enumerable: false });
             }
 
             /* processing of sys_handlers */
             len = sys_handlers.length;
             for (i = 0; i < len; ++i) {
                 sys_handler = sys_handlers[i];
                 if (sys.hasOwnProperty(sys_handler.name)) {
                     args = [].slice.call(arguments);
                     args.unshift(sys[sys_handler.name]);
                     sys_handler.handler.apply(sys_handler, args);
                 }
             }
         }
 
         if (sys == null || !sys.hasOwnProperty('js_init')) {
             is.Debug.check_all();
         }
     }
 
     function _fail_msg(jqXHR, textStatus, errorThrown) {
 
         if (jqXHR.status == 403) {	// forbidden
             return;
         }
 
         console.log("is.Ajax status: " + jqXHR.status);
         console.log("is.Ajax textStatus: " + textStatus);
         console.log("is.Ajax errorThrown: " + errorThrown);
 
         is.Zdurazneni.chyba(is.ldb.get('chyba'));
     }
 
     /**
      * Pomocna fnce, prevedie plain object na pole objektov, napr.
      *
      * { a: 1, b: 2 } => [{ name: 'a', value: 1 }, { name: 'b', value: 2}]
      */
     function _object_to_array(object) {
         return Object.keys(object).map(function(key, i) {
             return {
                 name:	key,
                 value:	object[key],
             };
         });
     }
 
     /**
      * Pomocna fnce, prevedie retazec na pole objektov, napr.
      *
      * "a=1&b=2"	=> [{ name: 'a', value: 1 }, { name: 'b', value: 2}]
      * "?a=1&b=2"	=> [{ name: 'a', value: 1 }, { name: 'b', value: 2}]
      */
     var separator = /[&;]/;
     function _params_to_array (params) {
         params = params[0] === '?' ? params.substring(1) : params;
 
         if (!params) {
             return [];
         }
 
         return $.map(params.split(separator), function (param) {
             var tmp = param.split('=', 2);
 
             return {
                 name:	decodeURIComponent(tmp[0].replace(/\+/g, '%20')),
                 value:	decodeURIComponent(tmp[1].replace(/\+/g, '%20')),
             };
         });
     }
 
     /**
      * Overi zda 'data' maji typ pouzitelny pri praci s jQuery AJAX.
      * Retezec se automaticky konvertuje na pole.
      */
     function _data_normalize (data) {
         if (data == null) {
             return data;
         }
 
         switch($.type(data)) {
             case 'string':
                 return _params_to_array(data);
             case 'array':
             case 'object':
                 return data;
             default:
                 console.warn('Podporované formáty jsou pouze "object", "array" a "string".');
         }
 
         return null;
 
     }
 
     /**
      * zjisti jestli objekt 'data' nese nejake informace, nebo je prazdny
      */
     function _data_is_empty (data) {
         data = _data_normalize(data);
 
         if (data == null) {
             return true;
         }
 
         if (data instanceof window.FormData) {
             // nelze overit zda je objekt FormData prazdny, proto se automaticky oznaci za plny
             return false;
         }
 
         switch($.type(data)) {
             case 'array':
                 return !data.length;
             case 'object':
                 return !Object.keys(data).length;
         }
     }
 
     /**
      * Udela kopii objektu 'data', pokud je v normalizovanem typu.
      * Normalizovany typ overuje funkce '_data_normalize'.
      */
     function _data_copy (data) {
         data = _data_normalize(data);
 
         if (_data_is_empty(data)) {
             return null;
         }
 
         if (data instanceof window.FormData) {
             is.Console.log('Kopie se nevytvorila. Je vracen puvodni objekt, protoze z FormData objektu nelze cist ulozene hodnoty, a tudiz je nelze zkopirovat.');
             return data;
         }
 
         switch($.type(data)) {
             case 'array':
                 return $.extend(true, [], data);
             case 'object':
                 return $.extend(true, {}, data);
         }
     };
 
     /**
      * Rozsiri objekt 'old_data' o objekt 'data'.
      * Objekty, ktere nemaji normalizovany typ, jsou ignorovany.
      * Normalizovany typ overuje funkce '_data_normalize'.
      *
      * 	pri pouziti s metodou '_copy_data' se 'puvodni_data' nemodifikuji
      *		vysledna_data = _data_extend(_data_copy(puvodni_data), nova_data);
      *
      *	modifikuje 'puvodni_data'
      *		_data_extend(puvodni_data, nova_data);
      *
      *	pokud muzou byt 'puvodni_data' null, musi se pouzit prirazeni
      *		puvodni_data = _data_extend(puvodni_data, nova_data);
      */
     function _data_extend (old_data, data) {
         var i, len;
 
         data = _data_normalize(data);
         old_data = _data_normalize(old_data);
 
         if (_data_is_empty(data)) {
             return old_data;
         }
 
         if (_data_is_empty(old_data)) {
             return data;
         }
 
         if (data instanceof window.FormData) {
             is.Console.log('Cilovy objekt nebyl rozsiren, protoze z FormData objektu nelze cist ulozene hodnoty.');
             return old_data;
         }
 
         if (old_data instanceof window.FormData) {
             switch($.type(data)) {
                 case 'object':
                     Object.keys(data).map(function(key) {
                         old_data.append(key, data[key]);
                     });
                     break;
                 case 'array':
                     len = data.length;
                     for (i = 0; i < len; ++i) {
                         old_data.append(data[i].name, data[i].value);
                     }
                     break;
             }
 
             return old_data;
         }
 
         switch($.type(data)) {
             case 'object':
                 // spoji pouze objekt s objektem
                 if ($.type(old_data) === 'object') {
                     $.extend(old_data, data);	// FEATURE: data prepise odpovedajici klice old_data
                     break;
                 }
                 data = _object_to_array(data);
                 // pokud je old_data pole, pokracuje se dal
             case 'array':
                 if ($.type(old_data) === 'object') {
                     old_data = _object_to_array(old_data);
                 }
                 old_data = old_data.concat(data);
                 break;
         }
 
         return old_data;
     };
 
     Ajax.data_extend = _data_extend;
 
     /**
      * Ajax.add_sys_handler
      *
      * Funkce prida handler pre obsluhu pomenovaneho sys poziadavku.
      */
     Ajax.add_sys_handler = function(name, handler) {
         var i, len, sys_handler;
 
         if (name === '' || typeof handler !== 'function') {
             throw new TypeError();
         }
 
         // pokud se najde handler v sys_handlers se jmenem 'name',
         // zameni se prislusny handler v sys_handlers
         len = sys_handlers.length;
         for (i = 0; i < len; ++i) {
             sys_handler = sys_handlers[i];
             if (sys_handler.name === name) {
                 sys_handler.handler = handler;
                 return;
             }
         }
 
         // handler nebyl nalezen v sys_handlers, prida se na konec
         sys_handlers.push({
             name: name,
             handler: handler,
         });
     };
 
     /**
      * funkcni interface pre Ajax
      *
      * 	is.Ajax.request(settings)		// odpovida $.ajax(settings)
      * 	is.Ajax.request(settings, data)
      * 	is.Ajax.request(url, data, settings)
      *
      * params:
      * 	- url, ciel requestu
      * 	- data, objekt parametrov requestu
      * 	- settings, objekt nastaveni requestu, kluce totozne s $.ajax(settings)
      * 	  (http://api.jquery.com/jquery.ajax/)
      *
      * settings
      * 	- no_fail_msg, specialni parametr pro vypnuti univerzalni chybove hlasky,
      * 			ktera se zobrazi uzivateli pomoci alert
      */
     Ajax.request = function(url, data, settings) {	// zakladni zpusob pouziti
     //Ajax.request = function(settings) {		// zjednodusena varianta
 
         if (typeof url === 'string') {
             settings = settings || {};
             settings.url = url;
         } else {
             settings = url || {};
         }
 
         settings.data = _data_extend(settings.data, data);
 
         var jq_ajax = _request(settings);
 
         if (!settings.no_fail_msg) {
             jq_ajax.fail(function(jqXHR, textStatus, errorThrown) {
                 _fail_msg(jqXHR, textStatus, errorThrown);
             });
         }
 
         return jq_ajax;
     };
 
     /**
      * Staticka metoda odosle cely specifikovany formular. Podporuje explicitne doplnenie
      * parametrov a automaticke parametre (mj. myuco).
      *
      * 	is.Ajax.send_form(form_selector, settings)
      *
      * 		- form_selector: jquery selector nebo objekt formulare (odosiela sa prvy najdeny)
      * 		- settings: objekt nastaveni requestu, kluce totozne s $.ajax(settings)
      * 		  (http://api.jquery.com/jquery.ajax/)
      *
      *	Priklad:
      *
      *		is.Ajax.send_form('#moj_form', {
      *			data: { dalsi_param: 'val'}
      *		}).done(function() { ... });
      *
      * 	Pozn.
      * 		- nezahrna submit button (viz api.jquery.com/serializeArray/)
      * 		  je treba pridat explicitne
      * 		- url je mozne specifikovat skrz settings (default je atribut action formu
      * 		  nebo aktualni stranka)
      */
     Ajax.send_form = function(form_selector, settings) {
         return new Ajax(settings).send_form(form_selector);
     };
 
     /*
      * Umozni s minimalni zatezi na komunikaci se servrem zjistit,
      * jestli je server dostupny a pripadne jestli je uzivatel prihlasen.
      * Interne pouziva primo jQuery ajax, ktery je bez nasich vychytavek.
      *
      *	is.Ajax.ping(setting)
      *		.done(function () {
      *			// komunikace probiha
      *		})
      *		.fail(function (jqXHR, text_status) {
      *			if (text_status === 'timeout') {
      *				// pozadavek na server se nestihl odeslat
      *				// nebo nestihl prijit v pozadovanem casovem limitu
      *			} else if (jqXHR.status === 0) {
      *				// server nedostupny
      *			} else if (jqXHR.status === 403) {
      *				// uzivatel odhlasen
      *			} else if (jqXHR.status === 500) {
      *				// interni chyba (nelze zkompilovat nebo die)
      *			} else {
      *				// ostatni mene caste chyby
      *			}
      *		});
      *
      * 	// Varianta nastaveni, ktera muze byt pouzit na overeni
      *	// dostupnosti serveru pred odeslanim formular.
      *	var settings = {
      *		async: false,
      *		timeout: 2000,
      *	};
      */
     Ajax.ping = function(settings) {
         return $.ajax($.extend({
             url: '/ping' + (is('session.auth') ? 'a' : ''),
             method:	'POST',	// aby se stranka nikdy nevytahla z cache
             global: false,	// nespousti globalni jQuery ajax handlery
         }, settings));
     }
 
     return Ajax;
 
 }); // konec is.Ajax
 
 /**
  * jQuery plugin isSearch
  *
  * Klientsky modul pre vytvorenie aktivneho vyhladavacieho pola.
  *
  * 	$(target).isSearch(params)
  *
  * 	target - jQuery selektor input elementu vyhladavania alebo jeho rodica, ktory ohranicuje
  * 		 vyhladavacie pole
  *
  *	params - js objekt s roznymi parametrami, podporovane su:
  *
  *			result   - selector elementu, ktory bude naplneny vysledkom vyhladavania
  *			agenda   - aka hodnota sa posiela v parametri ag
  *				   Ak je nastavene, ignoruje sa ag_pick.
  *			mode     - CGI parameter mode v odosielanom requeste (nepovinne).
  *			mode_opts	- Upresneni parametru mode (nepovinne). Viz tez mode_opts_get.
  *			mode_opts_get - Funkce vracejici upresneni pro parametr mode (nepovinne).
  *			ag_pick  - selector <select> elementu, ktoreho vybrana hodnota sa posiela
  *				   v parametri 'ag'
  *			dropdown - objekt nastavujuci spravanie dropdown elementu, mozne parametre:
  *				   http://foundation.zurb.com/sites/docs/dropdown.html#js-options
  *			ajax     - objekt nastavujuci is.Ajax pouzity pre vyhladavanie, pre
  *				   parametre viz is.Ajax vyssie.
  *			limit    - maximalny pocet naseptanych poloziek, defaultne 5.
  *			clear_button - jQuery objekt ("krizek"), ktory kliknutim maze input
  *          complaint - pritomnost hashu znaci poziadavku na pridanie reklamacneho tlacitka.
  *					Pritomne kluce prepisuju atributy is.SearchComplaint.
  *          debug_wrap - selektor elementu obsahujiciho debugovaci nastroje.
  *          progress_bar - selektor elementu, ktery se ma zobrazovat v dobe beziciho requestu.
  *
  *	Ak nie je specifikovany kluc result, tak sa automaticky vytvori dropdown.
  *
  * Pouzitie:
  *
  * 	$('#is_search').isSearch({ result: '#is_search_results' });
  *
  * 	$('#is_search').isSearch(); // verze s dropdownem
  *
  */
 is.Define.class('Search', function(ident){
 
     // tyto parametry se nepridavaji do odkazu na vysledky naseptavace bez ohledu na to, jestli jsou v cgiparlistu
     // originalne odpovida parametrum, ktere se neprenasi v levem panelu, ale lze modifikovat dle potreby
     var not_cgiparlist = ['fakulta', 'obdobi', 'predmet', 'kod', 'furl', 'zuv', 'zmena', 'pvysl', 'studium', 'nbloku', 'fakatr', 'id'];
 
     function Search($base, params_obj) {
 
         // process function parameters
         var self = this;
         self.$base	= $base;
         var input_selector = 'input[name=search]';
         self.$input	= $base.find(input_selector).addBack(input_selector);
         if (!self.$input.length) {
             throw "is.Search(): nenajdeny input element!";
         }
         self.params	= params_obj || {};
 
         if (self.params.agenda) {
             self.agenda = self.params.agenda;
         } else if (self.params.ag_pick) {
             self.$ag_pick = $base.find(self.params.ag_pick);
 
             // we create a wrapper that will be filled with labels of <option>s
             // we look at the width required for the label and set it when an option is selected
             var $box = $('<span></span>').css({
                 position: 'absolute',
                 visibility: 'hidden'
             });
             $(document.body).append($box);
 
             self.ag_pick_width = self.$ag_pick.find('option').map(function() {
                 $box.text($(this).text());
                 return $box.width() + 40; // + 40 should be enough for other space
             }).get();
 
             $box.remove();
             self.$ag_pick.css({
                 maxWidth: self.ag_pick_width[self.$ag_pick[0].selectedIndex] + 'px'
             });
         }
 
         if (self.params.clear_button) {
             self.$clear_button = $(self.params.clear_button);
             // display the clear button if the <input> is not empty
             if (self.$input.val() !== '') {
                 self.$clear_button.show();
             }
         }
 
         if (self.params.complaint) {
             self.sc = new is.SearchComplaint();
 
             for (var key in self.params.complaint) {
                 self.sc[key] = self.params.complaint[key];
             }
 
             self.sc.start();
 
             self.$complaint_button = $(self.sc.open_btn).detach().addClass('secondary');
         }
 
         if (self.params.debug_wrap) {
             self.$debug_wrap = $(self.params.debug_wrap);
         }
 
         if (self.params.progress_bar) {
             self.$progress_bar = $(self.params.progress_bar);
         }
 
         if (self.params.mode && typeof self.params.mode_opts_get === 'function') {
             self.mode_opts_get = self.params.mode_opts_get;
         } else if (self.params.mode && typeof self.params.mode_opts !== 'undefined') {
             self.mode_opts_get = function() {
                 return self.params.mode_opts;
             };
         }
 
         self.xhr_max_delay = 256; // next delay after each successfully completed request
         self.xhr_delay = self.xhr_max_delay; // the current delay for next request
         self.xhr_timeout = null;
 
         // create new ajax object
         self.ajax	= new is.Ajax((is.session.get('auth') || '') + '/naseptavac_data', $.extend(true, {
             data: { // default request parameters, q will be specified later (onkeyup)
                 typ: 'r6',
                 w_log_id: is.session.w_log_id,
                 session_id: is.session.session_id,
                 lang: is.session.get('lang'),
                 mode: self.params.mode,
             },
             method: 'GET',
         }, self.params.ajax_settings));
 
         if (self.params.result) { // selector where to put search results
             self.$result = $(self.params.result);
         } else { // no selector, results will be put to dynamically created dropdown
             self.$result = _create_dropdown(self);
             self.dropdown_visible = false;
         }
 
         _on_events(self);
 
         if (self.$input.val() !== '') {
             _send_xhr(self, true);
         }
     }
 
     function _create_dropdown(self) {
 
         self.params.dropdown = $.extend({ // defaults
             closeOnClick: true,
             hOffset: self.$base.offset().left - self.$input.offset().left,
         }, self.params.dropdown);
 
         var dropdown_id = is.Misc.uniq_id();
         self.$dropdown_el = $('<div></div>')
                     .addClass('dropdown-pane bottom search-dropdown')
                     .attr('data-dropdown', '')
                     .prop('id', dropdown_id);
 
         self.$dropdown_anchor = $('<div></div>').attr('data-toggle', dropdown_id);
         self.$input.before(self.$dropdown_anchor).after(self.$dropdown_el);
 
         self.dropdown = new window.Foundation.Dropdown(self.$dropdown_el, self.params.dropdown);
 
         var width_prop = self.params.width_prop ? self.params.width_prop : 'min-width';
 
         /* reposition dropdown on resize when opened */
         self.dropdown_resize_cb = function() {
             self.$dropdown_el.css( width_prop, self.$base.width()+'px');
             self.$dropdown_el.offset({ left: self.$base.offset().left });
         };
         self.dropdown_resize_cb();
         $(window).on('resize.'+ident, self.dropdown_resize_cb);
         self.$dropdown_el.on('show.zf.dropdown', function(){
             $(window).on('resize.'+ident, self.dropdown_resize_cb);
 
             self.dropdown_visible = true;
         });
         self.$dropdown_el.on('hide.zf.dropdown', function(){
             $(window).off('resize.'+ident, self.dropdown_resize_cb);
 
             self.dropdown_visible = false;
         });
 
         return self.$dropdown_el;
     }
 
     function _on_events(self) {
 
         self.$input.on('keydown.' + ident, function(e) {
             if ([38, 40].indexOf(e.keyCode) > -1) {
                 // browser can move the cursor when pressing up/down arrows: disable this feature
                 return false;
             }
         });
 
         self.$input.on('keyup.' + ident, function(e) {
 
             if (self.$clear_button) {
                 self.$clear_button[$(this).val() === '' ? 'hide' : 'show']();
             }
 
             if ([38, 40].indexOf(e.keyCode) > -1) {
 
                 if (!self.$results) {
                     self.$results = self.$result.find('.ds_vysledek');
                 }
                 var results_count = self.$results.length;
 
                 // arrow don't make sense if we don't have results
                 if (!results_count) {
                     return false;
                 }
 
                 if (self.$dropdown_el && !self.dropdown_visible && results_count > 0) {
                     // just open the dropdown and finish
                     self.$dropdown_el.foundation('open');
                     return false;
                 }
 
                 if (typeof self.selected_result === 'number') {
                     // there is already a selected item
                     // go one result up/down
                     if (e.keyCode === 38) {
                         self.selected_result = (self.selected_result || results_count) - 1;
                     } else {
                         self.selected_result = (self.selected_result + 1) % results_count;
                     }
                 } else {
                     if (e.keyCode === 38) {
                         // select the last one
                         self.selected_result = results_count - 1;
                     } else {
                         // select the first one
                         self.selected_result = 0;
                     }
                 }
 
                 if (typeof self.selected_result === 'number' && typeof self.scrolls === 'object') {
                     self.$results.removeClass('selected');
                     $(self.$results[self.selected_result]).addClass('selected');
 
                     self.$result.scrollTop(self.scrolls[self.selected_result]);
                 }
 
                 return false;
 
             } else if (e.keyCode === 27) {
 
                 if (self.$dropdown_el) {
                     self.$dropdown_el.foundation('close');
                 }
 
             } else if (e.keyCode === 13) {
 
                 if (typeof self.selected_result === 'number') {
                     // don't do this on <form>.submit because of Find more submit button
 
                     var $t = $(self.$results[self.selected_result]).find('a'),
                         href = $t.attr('href');
 
                     // track the "click"
                     if (is.WTracking) {
                         is.WTracking.send.call($t, { _return: true }, href);
                     }
 
                     if (href) {
                         location.assign(href);
                     }
                     return false;
                 }
 
                 // we may have additional text inputs in the form so the return key may not be able to submit the form
                 $(this).closest('form').submit();
 
             } else {
 
                 _send_xhr(self);
 
             }
         });
 
         self.$input.on('paste.' + ident + ' drop.' + ident, function(e) {
 
             // now the new value is not yet in <input>.value - let's just wait a little until the handler is finished
             // another possibility is to build the value; the following should probably work (modulo off-by-one errors)
             // origValue.substr(0, selectionStart) + e.clipboardData + origValue.substr(selectionEnd)
             var that = this;
 
             setTimeout(function() {
                 if ($(that).val() === '') {
                     if (self.$clear_button) {
                         self.$clear_button.hide();
                     }
                 } else {
                     if (self.$clear_button) {
                         self.$clear_button.show();
                     }
 
                     _send_xhr(self);
                 }
             }, 100);
 
         });
 
         if (self.$debug_wrap) {
             self.$debug_wrap.find('input').on('click keyup', function() {
                 _send_xhr(self);
             });
         }
 
         if (self.$ag_pick) {
             self.$ag_pick.on('change', function() {
                 // if we choose some nonempty option, hide the left pane
                 if (self.$dropdown_el) {
                     self.$dropdown_el.toggleClass('hide-ag-name', $(this).val() !== '');
                 }
 
                 // get the new results
                 _send_xhr(self);
 
                 // recalculate the width of <select>
                 self.$ag_pick.css({
                     maxWidth: self.ag_pick_width[this.selectedIndex] + 'px'
                 });
 
                 // focus back to <input>
                 self.$input.focus();
             });
         }
 
         if (self.$clear_button) {
             self.$clear_button.on('click', function() {
                 self.$input.val('');
                 $(this).hide();
                 self.$result.html('');
                 if (self.$dropdown_el) {
                     self.$dropdown_el.foundation('close');
                 }
                 self.$input.focus();
             });
         }
 
         self.$result.on('click.' + ident, '.naseptavac-submit.button', function(e) {
             self.$input.closest('form').submit();
         });
     }
 
     function _off_events(self) {
         self.$input.off('keyup.'+ident);
         $(window).off('resize.'+ident, self.dropdown_resize_cb);
     }
 
     function _cursor_position($el) {
         return $el[0].selectionEnd;
     }
 
     function _send_xhr(self, do_not_open) {
         var val = self.$input.val();
 
         self.$results = null;
         self.selected_result = null;
 
         if (val.length < 2 || val.length > 200) {
             if (self.$dropdown_el) {
                 self.$dropdown_el.foundation('close');
             }
 
             self.$result.html('');
         } else {
 
             if (self.xhr_timeout) {
                 // the previous timeout is still running
                 clearTimeout(self.xhr_timeout);
                 // try lowering the delay
                 self.xhr_delay /= 2;
             }
             // previous incomplete request is saved in self.xhr
             // we abort the request in progress if there is already a new value
             self.xhr_timeout = setTimeout(function() {
 
                 if (self.xhr) {
                     self.xhr.abort();
                 }
 
                 self.xhr_delay = self.xhr_max_delay;
                 self.xhr_timeout = null;
 
                 // we will create new XHR
                 // generate a random ID of request and save it as a last sent request
                 // ignore all completed requests with other ID
                 self.request_id = is.Misc.uniq_id();
 
                 (function(request_id) {
 
                     var debug_opts = {};
                     if (self.$debug_wrap) {
                         self.$debug_wrap.find('input:checked, input[type="text"]').each(function() {
                             var k = $(this).attr('name'),
                                 v = $(this).val();
                             if (debug_opts[k]) {
                                 debug_opts[k].push(v);
                             } else {
                                 debug_opts[k] = [v];
                             }
                         });
                     }
 
                     if (self.$progress_bar) {
                         self.$progress_bar.show();
                     }
 
                     (self.xhr = self.ajax.request($.extend(debug_opts, {
                         q:	val,
                         cursor:	_cursor_position(self.$input),
                         kvota: self.params.limit || 5,
                         ag: self.agenda || (self.$ag_pick && self.$ag_pick.val()),
                         mode_opts: self.mode_opts_get && self.mode_opts_get()
                     }))).done(function(data) {
                         if (self.$progress_bar) {
                             self.$progress_bar.hide();
                         }
 
                         if (request_id !== self.request_id) {
                             return;
                         }
 
                         self.$result.html(data);
 
                         self.$result.find('a').each(function() {
                             // parametry uvedene v poli se do odkazu nepridavaji, nejsou chtene
                             // pozor, pokud jiz tyto parametry prisly z naseptavace, nesmim je prepsat
                             var par_in_href = this.search.substr(1).split(/[&;]/).map(function(v) {
                                 return v.split(/=/)[0];
                             });
                             this.href = is.Misc.cgipar.apply(is.Misc, [this].concat(not_cgiparlist.filter(function(v) {
                                 return par_in_href.indexOf(v) === -1;
                             }).map(function(v) {
                                 return [v, undefined];
                             }).reduce(function(a, b) {
                                 return a.concat(b);
                             })));
                         });
 
                         if (self.params.complaint) {
                             self.sc.reveal_handler();
                         }
 
                         if (self.$complaint_button) {
                             self.$result.find('.naseptavac-complaint-placeholder').append(self.$complaint_button);
                         }
 
                         if (self.$dropdown_el) {
                             self.$dropdown_el.foundation('close');
                             if (data && data.length && !do_not_open) {
                                 // open the dropdown only if there is something to see
                                 self.$dropdown_el.foundation('open');
                             }
                         }
 
                         // count the vertical position of each result within self.$result
                         self.scrolls = self.$result.find('.ds_vysledek').map(function() {
                             return $(this).position().top + $(this).closest('.cast').position().top - parseInt($(this).css('padding-top'), 10);
                         }).get();
                         // position of first result is 0 to prevent scrolling out of upper padding
                         self.scrolls[0] = 0;
 
                         self.xhr = null;
                     });
 
                 })(self.request_id);
 
             }, self.xhr_delay);
         }
     }
 
     Search.prototype = {
         destroy: function() {
             var self = this;
 
             _off_events(self);
 
             if (self.$dropdown_el) {
                 $(document.body).trigger('click.zf.dropdown'); // fix destroy-create bug
                 self.$dropdown_el.foundation('destroy');
                 self.$dropdown_el.remove();
                 self.$dropdown_anchor.remove();
                 self.$dropdown_el = null;
             }
 
             self.$base.removeData(ident);
         },
     };
 
     $.fn.isSearch = function(param) {
         var $self = this;
         var method_arguments = Array.prototype.slice.call(arguments, 1);
 
         $self.each(function (i) {
             var $base = $(this);
             var instance = $base.data(ident);
 
             if (instance) { // instance exists, call method 'param' with rest of arguments
                 instance[param].apply(instance, method_arguments);
             } else { // no instance found, create new, param is parameters object
                 try {
                     instance = new is.Search($base, $.extend(true, {}, param));
                     $base.data(ident, instance);
                 } catch (err) {
                     console.error(err, $self, i, param);
                 }
             }
         });
 
         return $self;
     };
 
     /* stat. metoda - dovoli inicializovat vyhl. pole z perlu */
     Search.init = function(selektor, search_construktor_params) {
         $(selektor).isSearch( search_construktor_params );
     };
 
     return Search
 }); // konec is.Search
 
 /**
  *
  * Reklamacni tlacitko pro Vyhledavani.
  *
  */
 
 is.Define.class('SearchComplaint', function() {
 
     // Ajaxovy objekt, vytvori se pri prvnim uziti
     var ajax = null;
 
     function SearchComplaint(o, s) {
 
         // 7. selektor pro tlacitko, ktere otevira formular
         this.open_btn = o || '#vyhledavani_reklamace_otevrit';
 
         // 8. selektor pro tlacitko, ktere odesila formular
         this.send_btn = s || '#vyhledavani_reklamace_odeslat';
 
         // vytvorime unikatni identifikator instance. To proto, ze stejny send_btn se muze pouzit na vic
         // mistech, ma proto vic click eventu -> uplatnime pouze ten, jehoz identifikator se shoduje.
         // To, kterou instanci je potreba respektovat, poznaci otevreni open_btn do staticke promenne
         this._uniq_id = is.Misc.uniq_id();
     }
 
 
     // nasleduji definice sesti funkci a dvou vlastnosti, ktere lze prepsat dle potreby pro konkretni instanci
     // (defaultne je prizpusobeno pro naseptavac na titulce)
     // 1. vyber dat ze stranky, jez vratil vyhledavaci stroj uzivateli
     // musi vracet pole hashu s klici agenda, dsearch_id, url, title
     SearchComplaint.prototype.search_result = function() {
         return $('#vyhledavani_form .search-dropdown .ds_vysledek').map(function() {
             return {
                 agenda: $(this).data('agenda'),
                 dsearch_id: $(this).data('dsearchId'),
                 url: $(this).find('a').attr('href'),
                 title: $(this).find('.dsearch-title').text().trim()
             };
         }).get();
     };
 
     // 2. vyber vyhledavaneho retezce
     SearchComplaint.prototype.search_query = function() {
         return $('#vyhledavani_form input[name="search"]').val();
     };
 
     // 3. vyber textu, jenz uzivatel pise (co by chtel najit)
     SearchComplaint.prototype.user_desire = function() {
         return $('#vyhledavani_reklamace textarea').val();
     };
 
     // 4. kontrola, zda lze odeslat request s reklamaci
     SearchComplaint.prototype.input_check = function() {
         $('#vyhledavani_reklamace_bottom .right .zdurazneni').hide();
 
         if (this.user_desire().length < 3) {
             $('#vyhledavani_reklamace_bottom .right .zdurazneni.chyba.min_delka').show();
             return false;
         }
 
         $('#vyhledavani_reklamace_bottom .right .zdurazneni').hide();
 
         // vsechny kontroly OK
         return true;
     };
 
     // 5. handler ukonceneho XHR
     SearchComplaint.prototype.done_handler = function(data) {
         $('#vyhledavani_reklamace_bottom .right .zdurazneni').hide();
 
         if (data.OK) {
             $('#vyhledavani_reklamace_bottom .right .zdurazneni.potvrzeni').show();
             $(this.send_btn).prop('disabled', true);
             var $cd = $('#vyhledavani_reklamace_countdown'),
                 time = 3;
 
             (function cd_decrease() {
                 if (time) {
                     $cd.text(time);
                     --time;
                     setTimeout(cd_decrease, 1000);
                 } else {
                     $('#vyhledavani_reklamace').foundation('close');
                     $('#vyhledavani_reklamace textarea').val('');
                 }
             })();
         } else {
             $('#vyhledavani_reklamace_bottom .right .zdurazneni.chyba.nelze_ulozit').show();
         }
     };
 
     // 6. co se ma stat pri kliknuti na 'Nenasli jste, co jste hledali?'
     SearchComplaint.prototype.reveal_handler = function() {
         var q = this.search_query();
         if (q !== '') {
             $('#vyhledavani_reklamace_hledany_vyraz').text(q);
         }
         $('#vyhledavani_reklamace_bottom .right .zdurazneni').hide();
         $(this.send_btn).prop('disabled', false);
     };
 
     // funkce inicializujici handlery pro zadana tlacitka
     SearchComplaint.prototype.start = function() {
         var that = this;
         $(document.body).on('click', this.open_btn, function() {
             that.reveal_handler.call(that);
 
             SearchComplaint.active_instance = that._uniq_id;
         });
 
         $(this.send_btn).on('click', function() {
             if (SearchComplaint.active_instance !== that._uniq_id) {
                 return;
             }
 
             if (that.input_check.call(that)) {
                 if (!that.ajax) {
                     that.ajax = new is.Ajax(is.session.get('auth') + '/vyhledavani/vyhledavani_ajax', {
                         data: {
                             operace: 'reklamace'
                         }
                     });
                 }
 
                 that.ajax.request({
                     vysledky: JSON.stringify(that.search_result()),
                     fraze: that.search_query(),
                     cil: that.user_desire()
                 }, that.done_handler.bind(that));
             }
         });
     };
 
     return SearchComplaint;
 }); // konec is.SearchComplaint
 
 /**
  * Namespace pre ruzne fnce.
  *
  */
 is.Define.module('Misc', function() {
 
     var transition_end_event_cache;
     var some_ws_regex = /\s+/;
     var all_percentage_signs = /%/g;
     var textarea;
 
     return {
         transition_end_event: function() {
 
             if (transition_end_event_cache) {
                 return transition_end_event_cache;
             }
 
             var el = document.createElement('div');
             var transitions = {
                 'WebkitTransition' : 'webkitTransitionEnd',
                 'MozTransition'    : 'transitionend',
                 'MSTransition'     : 'msTransitionEnd',
                 'OTransition'      : 'oTransitionEnd',
                 'transition'       : 'transitionEnd'
             };
 
             var i;
             for (i in transitions) {
                 if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                     transition_end_event_cache = transitions[i];
                     return transition_end_event_cache;
                 }
             }
         },
 
         /**
          * funkce umozni, aby kazdy element e, ktory ma atribut data-trigger delegoval js event na iny element l
          *
          * element e moze mat navyse dalsie atributy:
          * 	- data-event, typ delegovaneho eventu (impl. click)
          * 	- data-target, selektor ktory urci elementy kam sa ma event presmerovat
          */
         trigger_service: function() {
             $('[data-trigger]').each(function(){
                 var trigger = $(this);
                 var event_type = trigger.data('event') || 'click';
                 var event_target = trigger.data('trigger') || trigger.data('target');
 
                 if (event_type && event_target) {
                     trigger.on(event_type, function(){
                         $(event_target).trigger(event_type);
                     });
                 }
             });
         },
 
         /**
          * funkce vygeneruje nahodne ID
          */
         uniq_id: function() {
             return 'is_' + Math.round(new Date().getTime() + (Math.random() * 10000));
         },
 
         /**
          * otestuje zda promenna na vstupu se da pouzit jako HTML id
          */
         is_valid_id: function (id) {
             return (id || id === 0) && !!(""+id) && !some_ws_regex.test(""+id);
         },
 
         /**
          * escapuje znaky, aby mohl 'str' byt vlozen do regularniho vyrazu
          * https://stackoverflow.com/a/6969486
          */
         escape_regexp: function (str) {
             return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
         },
 
         /**
          * vrati absolutnu url z realtivnej url voci aktualnej url v prehliadaci
          */
         absolutize: function(relative) {
             var a = document.createElement('a');
             a.href = relative;
             return a.href;
         },
 
         /**
          * vrati pocet bajtu stringu (pokud neni vlozen string, vraci 0)
          *
          * https://stackoverflow.com/a/23329386
          */
         count_bytes: function (string) {
             var count, i, code;
 
             if (typeof string !== 'string') {
                 return 0;
             }
 
             count = string.length;
             for (i = count - 1; i >= 0; i--) {
                 code = string.charCodeAt(i);
                 if (code > 0x7f && code <= 0x7ff) {
                     count++;
                 } else if (code > 0x7ff && code <= 0xffff) {
                     count+=2;
                 }
 
                 if (code >= 0xDC00 && code <= 0xDFFF) {
                     //trail surrogate
                     i--;
                 }
             }
 
             return count;
         },
 
         /**
          * Zjisti jestli 'string' obsahuje 'word'.
          *
          * 	true	=== is.Misc.contains_word('ahoj svete', 'ahoj');
          * 	false	=== is.Misc.contains_word('ahoj svete', 'ahoj svete');	// chyba, slovo nemuze obsahovat bile znaky
          * 	false	=== is.Misc.contains_word('ahoj svete', '');		// slovo musi mit alepson jeden znak
          */
         contains_word: function(string, word) {
             string = ' ' + (string || '') + ' ';
             word = '' + (word || '');
 
             if (some_ws_regex.test(word)) {
                 console.error('Slovo nesmi obsahovat bile znaky.', 'string', string, 'word', word);
                 return false;
             }
 
             return !!word && !!~string.indexOf(' ' + word + ' ');
         },
 
         /**
          * Doplni do 'stringu' slova, ktera jsou navic ve 'words'.
          *
          * 	new_string = is.Misc.add_words('ahoj muj', 'ahoj svete!');	// new_string === 'ahoj muj svete!'
          */
         add_words: function(string, words) {
             string = ' ' + (string || '') + ' ';
             words = '' + (words || '');
 
             $.each(words.split(some_ws_regex), function (i, word) {
                 if (!~string.indexOf(' ' + word + ' ')) {
                     string += word + ' ';
                 }
             });
 
             return string.trim();
         },
 
         /**
          * Odebere ze 'stringu' slova, ktera jsou vyjmenovana ve 'words'.
          *
          * 	new_string = is.Misc.remove_words('ahoj ahoj muj svete!', 'ahoj svete');	// new_string === 'muj svete!'
          */
         remove_words: function(string, words) {
             string = ' ' + (string || '') + ' ';
             words = '' + (words || '');
 
             $.each(words.split(some_ws_regex), function (i, word) {
                 word = ' ' + word + ' ';
 
                 while (!!~string.indexOf(word)) {
                     string = string.replace(word, ' ');
                 }
             });
 
             return string.trim();
         },
 
         /**
          * Do adresy priretezi CGI parametry stejne, jako to dela Skript::cgipar.
          * Automaticky prenasi standardne prenasene parametry, nejsou-li prepsany.
          *
          * Je mozne dvoji pouziti (dokonce troji, protoze ve variante s hashem lze
          * jednoprvkove pole hodnot nahradit skalarem - lze videt na druhem radku):
          * var href = is.Misc.cgipar(location.pathname, 'foo', 'bar', 'foo', 'baz', 'bop', 'qux')
          * var href = is.Misc.cgipar(location.pathname, { foo: ['bar', 'baz'], bop: 'qux' })
          * Oba zpusoby vytvori adresu s parametry ?foo=bar;foo=baz;bop=qux
          * Pokud se jako hodnota pouzije undefined (nebo [] pri pouziti hashrefu),
          * prislusny parametr se v URL vubec neobjevi.
          *
          * Funkce sama dela encodeURIComponent, neenkodujte proto vstup sami!
          *
          * Obsahuje-li prvni parametr (url) nejake argumenty, mohou byt prepsany.
          */
         cgipar: function(url /* [, arguments...] */) {
             // z adresy vytahneme cestu bez query stringu, query string bez otazniku a hash bez #
             var a, apl, qs, hash;
 
             if (url instanceof HTMLAnchorElement) {
                 a = url;
             } else if (url) {
                 a = document.createElement('a');
                 a.href = url;
             }
 
             if (url) {
                 apl = a.protocol + '//' + a.host + a.pathname;
             } else {
                 a = {};
                 apl = '';
             }
 
             qs = (a.search || '').substr(1),
             hash = a.hash || '';
 
             // zde ukladame (jiz uriencodovane) hodnoty parametru
             var param = {};
 
             // nejnizsi prioritu maji CGI parametry ze skriptu
             for (var key in (is.session.cgipar || {})) {
                 param[key] = is.session.cgipar[key].map(encodeURIComponent);
             }
 
             // rozparsuju query string z puvodni adresy
             var qspar = {};
             qs.split(/[;&]/).forEach(function(s) {
                 var entry = s.split(/=/),
                     key = entry[0],
                     val = entry[1];
 
                 if (key) {
                     if (key in qspar) {
                         param[key].push(val);
                     } else {
                         // toto je poprve, kdy jsem videl tento parametr z query stringu
                         // zajistim prepsani hodnot v param bez ohledu na to, zda jsem
                         // tento parametr videl v is.session.cgipar, nebo ne
                         param[key] = [ val ];
                         qspar[key] = 1;
                     }
                 }
             });
 
             // a ted explicitni z arguments
             var o = arguments[1];
             if (arguments.length === 2 && typeof o === 'object' && o instanceof Object) {
                 // mame zadany jeden argument a to objekt
                 // (test na instanceof vylouci null)
                 // priradim, pouze kontroluju, ze hodnota undefined se chape jako []
                 // a skalar se chape jako jednoprvkove pole
                 Object.keys(o).forEach(function(key) {
                     var val = o[key];
 
                     if (val === undefined) {
                         val = [];
                     } else if (!Array.isArray(val)) {
                         val = [ val ];
                     }
 
                     param[key] = val.map(encodeURIComponent);
                 });
             } else {
                 // projdeme arguments a namapujeme je do objektu jako u Perlovskeho volani
                 var al = arguments.length,
                     argpar = {};
 
                 if (al % 2 === 0) {
                     // sudy pocet argumentu, ale prvni je url, takze zbyva chybny lichy pocet
                     console.error('Chybny pocet argumentu pro is.Misc.cgipar');
                 }
 
                 for (var i = 1; i < al; i += 2) {
                     // i-ty prvek arguments je klic, na pozici i+1 je hodnota
                     var key = arguments[i],
                         val = arguments[i + 1];
 
                     if (!argpar[key]) {
                         // tato hodnota tady jeste nebyla
                         // musime prepsat implicitni hodnoty
                         param[key] = val === undefined ? [] : [ encodeURIComponent(val) ];
                         argpar[key] = 1;
                     } else {
                         // jiz byla, takze jsme implicitni hodnoty prepsali predtim
                         param[key].push(encodeURIComponent(val));
                     }
                 }
             }
 
             var query = Object.keys(param).filter(function(k) {
                 return param[k].length > 0;
             }).map(function(k) {
                 return param[k].map(function(v) {
                     return k + '=' + v;
                 }).join(';');
             }).join(';') + hash;
 
             // zlepime URL a budeme mit hotovo
             return apl + ( query ? '?' + query : '' );
         },
 
         /**
          * Transforumje klicove znaky pro html na html entity (& -> $amp;).
          * Pracuje ekvivalentne jako stejne jmenujici se funkce na serveru.
          */
         c: function (html) {
             if (typeof html !== 'string') {
                 return '';
             }
 
             return html
                 .replace(/&/g, '&amp;')
                 .replace(/>/g, '&gt;')
                 .replace(/</g, '&lt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&apos;');
         },
 
         /**
          * Transforumje html entity na ekvivalentni znaky (&amp -> &).
          * Pracuje ekvivalentne jako stejne jmenujici se funkce na serveru.
          */
         decode_c: function (text_s_html_entitama) {
             textarea = textarea || document.createElement('textarea');
             textarea.innerHTML = text_s_html_entitama;
             return textarea.textContent;
         },
 
         /**
          * Odesila HTTP pozadavek; neni nutno a nelze cekat na odpoved na nej.
          * Implicitne prenasi hodnoty z is.session.cgipar, coz lze potlacit.
          *
          * Doruceni pozadavku by melo byt spolehlive v prohlizecich, ktere podporuji
          * navigator.sendBeacon a FormData (vsechny moderni prohlizece).
          *
          * is.Misc.send_beacon('/auth/whatever', {
          *   cgipar1: 'value',
          *   cgipar2: ['multiple', 'values'],
          *   lang: undefined, // pomoci undefined nebo [] zakazu prenest tento parametr z cgipar
          * });
          *
          * Pozor, parametr url nepodporuje explicitni query string, vsechny
          * parametry pozadavku je nutno uvadet ve druhem argumentu.
          */
         send_beacon: function(url, param) {
             var success = false;
 
             if (typeof navigator.sendBeacon === 'function' && typeof FormData === 'function') {
                 var fd = new FormData;
 
                 // prenest vsechny parametry z is.session.cgipar
                 Object.keys(is.session.cgipar).filter(function(key) {
                     // ale nesmim to mit explicitne v parametrech
                     return !(key in param);
                 }).forEach(function(key) {
                     is.session.cgipar[key].forEach(function(val) {
                         fd.append(key, val);
                     });
                 });
 
                 // prenese vsechny parametry z param
                 Object.keys(param).filter(function(key) {
                     // ale param: undefined se neprenasi, pouze zakazuje prenaset toto z cgipar
                     return typeof param[key] !== 'undefined';
                 }).forEach(function(key) {
                     var vals = Array.isArray(param[key]) ? param[key] : [ param[key] ];
 
                     vals.forEach(function(val) {
                         fd.append(key, val);
                     });
                 });
 
                 success = navigator.sendBeacon(url, fd);
             }
 
             if (!success) {
                 var img = new Image(1, 1);
                 img.src = is.Misc.cgipar(url, param);
             }
         },
     };
 }); // konec is.Misc
 
 /**
  * Trida slouzi k provazani dvou elementu na strance pomoci definovanych eventu (udalosti)
  *
  * Pri kiknuti na element (napr. <a>) dojde k vyvolani eventu, ktery se muze vyuzit
  * k ovlivneni jineho elementu (napr. textu v konkretnim <div>).
  *
  * Element, na ktery maji byt pomoci fce trigger() eventy automaticky navazany,
  * musi byt oznacen tridou 'link-event-a'.
  *
  * Jsou k dispozici 3 typy udalosti:
  *
  * js.isLinkEvent
  *		- vyvolana po kliknuti na dany element, nebo po ukonceni ajax dotazu
  * before_ajax.isLinkEvent
  *		- vyvolana po kliknuti na dany element pred ajaxovym volanim
  * ajax_done.isLinkEvent
  *		- vyvolana po kliknuti na dany element v casti ajax.done()
  *
  * Kdyz je vyplneno data-url dotahne se, po spusteni udalosti click (lze zmenit pomoci data-on-event),
  * pomoci AJAXu obsah, ktery se vlozi do data-content-id. Pokud se k data-url vyplni i data-target,
  * AJAX se neprovadi a element se chova jako tag <a></a> dle pravidel 'target'.
  * Parametry pro url (AJAX) lze predat pres is.Store.
  *
  * Pokud chceme, aby napr. kliknuti na element <a> vyvolalo zmenu v elementu <div>,
  * musi byt provazany pomoci id takto:
  *		<a data-content-id="div-id"></a>
  *		<div id="div-id"></div>
  *
  */
 is.Define.class('LinkEvent', function(def_namespace) {
     var was_any_deferred_init_one = false;
     var waiting_for_init = {};
 
     function LinkEvent(anchor, namespace, params) {
         var self;
 
         namespace = namespace || def_namespace;
         self = anchor[namespace] || this;
 
         // kontrola slouzici k tomu, aby nedochazelo k nasobnemu navazani eventu na element
         if (self !== this) {
             return self;
         }
 
         anchor[namespace] = self;
 
         // ulozeni informaci o elementu
         self.namespace = namespace;
         self.$anchor = $(anchor);
         self.anchor_id = self.$anchor.attr('id');
         self.params = params || is(self.namespace + '_' + self.anchor_id) || {};
         self.data = (self.params && self.params.data) || self.$anchor.data() || {};
 
         if (is.Misc.is_valid_id(self.data.contentId)) {
             self.$content = $( '#'+self.data.contentId );
         }
 
         if (self.data.url != null && self.data.target == null) {
             if (self.data.ajaxExecute == null) {
                 self.data.ajaxExecute = -1;
             }
 
             self.ajax = new is.Ajax({
                 url: self.data.url,
                 data: self.params.url,
                 loading: self.$content,
                 success: function (data) {
                     var method;
 
                     // pokud je definovan event ajax_done, je proveden v ajax.done()
                     if (self.$anchor.hasEvent("ajax_done."+self.namespace).length) {
                         self.$anchor.trigger("ajax_done."+self.namespace, [data, self.$content, self]);
                     } else if (!data) {
                         console.error('Odpoved ze serveru je prazdna.', data, self.data.url, self.params.url);
                     } else if (self.$content.length) {
                         method = self.data.insertMethod;
 
                         if (!method || !$.fn[method]) {
                             if (method && !$.fn[method]) {
                                 console.error('jQuery metoda pro vlozeni html do stranky "' + method + '" nebyla nalezena.');
                             }
 
                             method = 'html';
                         }
 
                         self.$content[method](data.html);
                     } else {
                         console.error('Nebyl nalezen objekt dle data-content-id="' + self.data.contentId + '".');
                     }
 
                     is.Forms.reinit(self.$content);
                 },
             });
         }
 
         self.add_anchor(self.$anchor);
 
         return self;
     }
 
     // proved pro kazdy element oznaceny tridou 'link-event-a' na strance
     LinkEvent.init = function() {
         $(".link-event-a").each(function () {
             new is.LinkEvent(this);
         });
     };
 
     /**
      * Zinicializuje elementy a vsem priradi jeden link_event object.
      *
      * 	is.LinkEvent.init_one($elem, params);	// pouzije je inplicitni namespace isLinkEvent
      * 	is.LinkEvent.init_one($elem, namepsace, params);
      *
      * 	params = {
      * 		url: {},	// parametry ajax dotazu
      * 		js: {},		// parametry pro js udalost
      * 		data: {},	// pokud je vyplneno, pouzije se na misto $elem.data();
      * 	};
      */
     LinkEvent.init_one = function ($elem, namespace, params) {
         var link_event;
 
         $elem = $($elem);
         if (!$elem.length) {
             console.error('Nebyl nalezen objekt dle identifikátoru.', $elem, namespace, params);
             return;
         }
 
         // pokud je druhy param objekt, nejedna se o namespace, ale o params
         if ($.isPlainObject(namespace)) {
             params = namespace;
             namespace = undefined;
         }
 
         $elem.each(function () {
             if (link_event) {
                 link_event.add_anchor(this);
                 return;
             }
 
             link_event = new is.LinkEvent(this, namespace, params);
         });
 
         return link_event;
     };
 
     LinkEvent.odlozeny_init_one = function (id, init_one_arguments) {
         var namespace;
 
         if (waiting_for_init[id]) {
             console.error('Jiz existuje zaregistrovany objekt pro inicializaci pod id: ', id, 'Puvodni:', waiting_for_init[id], 'Duplicitni:', init_one_arguments);
             return;
         }
 
         waiting_for_init[id] = init_one_arguments;
 
         if (was_any_deferred_init_one) {
             return;
         }
 
         namespace = def_namespace + 'OdlozenyInit';
         $(document)
             .off('mouseenter.'+namespace)
             .on('mouseenter.'+namespace+' focus.'+namespace, '[id]', function (evt) {
                 var id = this.id;
                 var init_one_arguments = waiting_for_init[id];
                 var link_event;
 
                 if (!init_one_arguments) {
                     return;
                 }
 
                 waiting_for_init[id] = null;
                 link_event = LinkEvent.init_one.apply(window, init_one_arguments);
                 if (link_event.data.onEvent === evt.type) {
                     evt.preventDefault();
                     link_event.events_trigger();
                 }
             });
 
         was_any_deferred_init_one = true;
     };
 
     LinkEvent.prototype = {
 
         /**
         * Trigger vsech relevantnich udalosti
         */
         events_trigger: function () {
             return this.open_url() || this.ajax_trigger() || this.js_trigger();
         },
 
         /**
         * Trigger AJAX eventu
         */
         ajax_trigger: function() {
             var self = this;
 
             if (!self.ajax || !self.data.ajaxExecute || self.ajax_running) {
                 return;
             }
 
             self.ajax_running = true;
             --self.data.ajaxExecute;
 
             // event before_ajax proveden pred Ajax volanim
             self.$anchor.trigger("before_ajax."+self.namespace, [self.params.js, self.$content, self]);
 
             return self.ajax.request()
                 .fail(function () {
                     ++self.data.ajaxExecute;
                 })
                 .always(function() {
                     self.js_trigger();
                     self.ajax_running = false;
                 });
         },
 
         /**
         * Trigger javascript eventu
         */
         js_trigger: function() {
             var self = this;
 
             self.$anchor.trigger("js."+self.namespace, [self.params.js, self.$content, self]);
 
             return true;
         },
 
         /**
         * Otevre zadane URL. Parametr 'data-target' urcuje,
         * zda se ma odkaz otevrit do aktualni nebo nove zalozky prohlizece.
         */
         open_url: function() {
             var self = this;
 
             if (self.data.url == null || self.ajax) {
                 return;
             }
 
             return window.open(
                 self.data.url + (self.params.url ? '?'+$.param(self.params.url, true) : ""),
                 self.data.target
             );
         },
 
         add_anchor: function ($anchor) {
             var self = this;
 
             $anchor = $($anchor);
             $anchor[0][self.namespace] = self;
             $anchor.on((self.data.onEvent || 'click')+'.'+self.namespace, function(evt) {
                 evt.preventDefault();
                 self.events_trigger();
             });
 
             // pokud se jedna o aktivni tab pri nacteni stranky, spusti se udalosti
             if ($anchor.hasClass('is-active')) {
                 self.ajax_trigger() || self.js_trigger();
             }
         },
     };
 
     return LinkEvent;
 }); // konec is.LinkEvent
 
 
 /**
  * Trida pro funkci View::Toolkit::tab_panel()
  *
  * Vyuziva tridu is.LinkEvent, ktera na kazdy tab navaze definovane udalosti.
  */
 
 is.Define.module('Tabs', function(namespace){
     var active_tabs_by_hash_in_process;
 
     // privatne premenne
 
     // modul
     return {
         init: function() {
             _active_tabs_by_hash();
 
             // proved pro vsechny tab_panely
             $(".tabs-toolkit")
                 .each(function() {
                     // proved pro kazdy tab (oznacen tridou 'tabs-a')
                     $(this)
                         .find('.tabs-a')
                         .filter(function () {
                             return !this[namespace];
                         })
                         .each(function() {
                             var tab = new is.LinkEvent(this, namespace);
                             // odebere udalost vytvorenou v is.LinkEvent,
                             // ktera je nahrazena volanim v udalosti 'change.zf.tabs'
                             tab.$anchor.off('click.'+namespace);
                         });
                 })
                 // zustanou jen ty bez udalosti 'change.zf.tabs'
                 .hasNotEvent('change.zf.tabs')
                 .on('change.zf.tabs', function(event, $target) {
                     var tab = $target.find('.tabs-a')[0][namespace];
                     var bez_hash = $(this).data("urlBezHash");
 
                     tab.events_trigger();
 
                     // aktualizace # pri kliknuti na tab
                     if (!bez_hash) {
                         if(history.replaceState) {
                             history.replaceState(null, null, "#"+tab.anchor_id);
                         } else {
                             // podpora pro starsi prohlizece, ktere nepodporuji history.replaceState
                             location.hash = tab.anchor_id;
                         }
                     }
                 });
 
             $(".tabs-container")
                 .off('.isHashNavigation')
                 .on('afterScrollTop.isHashNavigation', '.tabs-panel', function() {
                     _active_tabs_by_hash();
                 })
                 .on('beforeScrollTop.isHashNavigation', '.tabs-a', function() {
                     if (active_tabs_by_hash_in_process) {
                         return;
                     }
 
                     _active_tabs_by_hash();
                 });
         },
     };
 
     // privatna fnce
 
     // Nastavi jako aktivni tabitko podle HASH v url.
     // Funguje i pro zanorena tabitka.
     function _active_tabs_by_hash () {
         var $tabs_a, $tabs_container, $tabs, $tabs_panel, new_hash;
 
         if (!window.location.hash) {
             return;
         }
 
         active_tabs_by_hash_in_process = true;
 
         $tabs_a = is.HashNavigation.hash_target(window.location.hash);
         if ($tabs_a.is('.tabs-panel')) {
             $tabs_a = is.HashNavigation.hash_target(window.location.hash.substr(2));	// #_tab3 -> tab3
         }
 
         if (!$tabs_a.is('.tabs-a')) {
             return;
         }
 
         new_hash = '#' + $tabs_a.attr('id');
         if (new_hash !== location.hash) {
             location.hash = new_hash;
         }
 
         while ($tabs_a.length) {
             $tabs_container = $tabs_a.closest('.tabs-container');
             $tabs = $tabs_container.children('.tabs');
 
             // foundation je na tabech inicializovany => taby jsou videt => napr. nejsou v modalnim okne
             if (!is.Foundation.get_plugin($tabs)) {
                 break;
             }
 
             $tabs.find('a').removeClass('is-active');
             $tabs_a.addClass('is-active');
             $tabs.foundation("selectTab", $tabs_a.attr('aria-controls'));
 
             // dohledani nadrazeneho is-active
             $tabs_panel = $tabs_container.closest('.tabs-panel');
             $tabs_a = $tabs_panel
                     .closest('.tabs-container')
                         .children('.tabs')
                             .find('[aria-controls="'+$tabs_panel.attr('id')+'"]');
         }
 
         active_tabs_by_hash_in_process = false;
     }
 
 }); // konec is.Tabs
 
 
 /*
  * Zdurazneni -- kratke chybove hlaseni nahore na strance
  *
  * Varianty (funkce):
  * - potvrzeni, upozorneni, varovani, chyba.
  *
  * Parametry:
  * - text (povinne)
  * - objekt (nepovinne)
  *   - fade_out	: true/false/5,		(default false) urcuje zda ma hlaska automaticky zmizet a pripadne za kolik sekund (true = 3s)
  *   - stack	: true/false,		(default true) zaradit hlasku do zasobniku pri prekryti jinou hlaskou
  *
  * Priklad:
  * is.Zdurazneni.potvrzeni('Úspěšně uloženo.', {fade_out: true});
  *
  */
 is.Define.module('Zdurazneni', function(namespace) {
 
     var initialized = false;
     var typy = {
         potvrzeni: null,
         upozorneni: null,
         varovani: null,
         chyba: null,
     };
     var $cover;
     var regexp_only_ws = /^\s*$/;
     var regexp_ora = /ORA-/;
 
     var Zdurazneni = {
 
         // Pripravi html template pro vsechny typy hlasek a nastavi udalosti.
         init: function() {
             if (initialized) {
                 return;
             }
             initialized = true;
 
             // obalka pro zdurazneni
             $cover = $('#zdurazneni-sticky');
             if (!$cover.length) {
                 console.error('Nenalezen obal pro chybove hlaseni.');
                 return;
             }
 
             // zdurazneni, ktere uzivatel odklikne krizkem
             $.each(typy, function (typ) {
                 var $err_content = $('<div />')
                     .addClass('zd-box')
                     .append(
                         $('<div />')
                             .addClass('zd-text')
                     )
                     .append(
                         is.Reveal.get_$close()
                             .addClass('zd-close')
                     );
                 var $error = $('<div />')
                     .addClass('zd-na-stred zd-' + typ)
                     .append(
                         $err_content
                     );
 
                 typy[typ] = $error;
             });
 
             $(document)
                 .off('.'+namespace)
                 .on('click.' + namespace, '.zdurazneni-sticky .zd-close', function (evt) {
                     evt.stopPropagation();
                     Zdurazneni.pop();
                 })
                 .on('click.' + namespace, '.zdurazneni-sticky .zd-box', function (evt) {
                     var $zdurazneni = $(this).closest('.zd-na-stred');
 
                     evt.stopPropagation();
 
                     $zdurazneni
                         .toggleClass('zd-whole-msg', true)
                         .data(namespace).stack = true;
 
                     Zdurazneni.push($zdurazneni);
                 });
 
         },
 
         // Odstrani aktualne zobrazenou hlasku.
         pop: function () {
             if ($cover) {
                 $cover.children().last()
                     .remove();
             }
         },
 
         // Prida hlasku na stranku a predchozi zobrazenou zaradi do zasobniku nebo smaze.
         push: function ($zdurazneni) {
             var $last = $cover.children().last();
 
             $cover.append($zdurazneni);
             if (!$last.length) {
                 return;
             }
 
             if ($last.data(namespace).stack) {
                 $last
                     .stop(true, false)
                     .css('opacity', 1)
                     .find('.zd-close')
                         .removeClass('hide');
             } else {
                 $last.remove();
             }
         },
 
         // Vygeneruje novou hlasku a zobrazi ji.
         zdurazneni: function(typ, html, opt) {
             var $zdurazneni, delay, $text_cover, text, exists, alone,
                 params = $.extend(true, {}, {fade_out: false, stack: true }, opt);
 
             if (!typy.hasOwnProperty(typ)) {
                 console.error('Nepodporovany typ zdurazneni.', typ, Object.keys(typy));
                 return;
             }
 
             Zdurazneni.init();
 
             $zdurazneni = typy[typ].clone();
             $zdurazneni.data(namespace, params);
             $text_cover = $zdurazneni.find('.zd-text');
             $text_cover.html(html);
 
             // kontroly obsahu
             html = $text_cover.html();
             text = $text_cover.text();
             if (regexp_only_ws.test(html)) {
                 console.error('Text chyby pro uzivatele je prazdny nebo obsahuje pouze bile znaky.', html);
             } else if (regexp_ora.test(html) || text.length <= 3) {
                 console.error('Zkontrolujte, zda je toto hlaseni skutecne urceno pro uzivatele.', html, text);
             }
 
             // priprava pred vlozenim do stranky
             exists = !!$cover.children().length;
             $zdurazneni.css('opacity', 0);
 
             // vlozeni do stranky
             Zdurazneni.push($zdurazneni);
 
             // spustit fadeout az kdyz je ve strance
             alone = $cover.children().length === 1;
             if (params.stack && (!alone || (exists && !params.fade_out))) {
                 // pokud je nova hlaska stackovatelna a jiz existuje jina stackovatelna,
                 // tak se ignoruje parametr fade_out a jen se zajisti, ze na zacatku hlaska problikne
                 $zdurazneni	.fadeTo( 0	, 1	)
                         .fadeTo( 150	, 0.75	)
                         .fadeTo( 200	, 1	);
             } else if (params.fade_out) {
                 $zdurazneni.find('.zd-close').addClass('hide');
 
                 // delay min 3s
                 delay = $zdurazneni.data(namespace).delay = 1000 * Math.max(3, $.isNumeric(params.fade_out) ? +params.fade_out : 3);
                 if (exists) {
                     // na zacatku problikne
                     delay -= 850;
                     $zdurazneni	.fadeTo( 0	, 1	)
                             .fadeTo( 150	, 0.75	)
                             .fadeTo( 200	, 1	)
                             .fadeTo( delay	, 1	)	// nahrada za .delay(), aby slo pouzit .stop() a ':animated'
                             .fadeTo( 500	, 0	)
                             .fadeOut(function () {
                                 $zdurazneni.remove();
                             });
                 } else {
                     delay -= 500;
                     $zdurazneni	.fadeTo( 0	, 1	)
                             .fadeTo( delay	, 1	)	// nahrada za .delay(), aby slo pouzit .stop() a ':animated'
                             .fadeTo( 500	, 0	)
                             .fadeOut(function () {
                                 $zdurazneni.remove();
                             });
                 }
             } else {
                 $zdurazneni.css('opacity', 1);
             }
 
             return $zdurazneni;
         },
     };
 
     // vytvori zkracena volani pro jednotlive typy
     $.each(typy, function (typ) {
         Zdurazneni[typ] = function () {
             var args = [].slice.call(arguments);
             args.unshift(typ);
             return Zdurazneni.zdurazneni.apply(Zdurazneni, args);
         };
     });
 
     return Zdurazneni;
 
 }); // konec Zdurazneni
 
 
 /*
  * Obsahuje obsluzne funkce k formularum a formularovym prvkum.
  * Rozsiruje funkcionalitu Foundation Abide.
  */
 is.Define.module('Forms', function(namespace) {
 
     var first_init = true;
     var validators;
     var Forms = {};
     var regex_required = /^required/;
 
     /**
      * Inicializuje vsechny formularove prvky.
      */
     Forms.init = function(){
         if (first_init) {
             _bind_basic_events();
             _set_default_validators();
 
             first_init = false;
         } else {
             is.Foundation.safe_init();
         }
 
         $('.required_group').each(function () {
             var $input = $(this);
             _validator_required(Forms.get_input_val($input), $input);
         });
     };
 
     /*
      * Aktivuje prvek formulare, ktery pote reaguje, pokud je nad nim pretahovan nejaky soubor.
      */
     Forms.activateFileDrag = function (opt) {
         if (is.Misc.is_valid_id(opt.id)) {
             $('#'+opt.id).dragDropFiles();
         }
     };
 
     /**
      * Nastavi Foundation validator
      * 	name		- nazev validatoru vyplnovany do data-validator
      * 	err_msg_lid	- nazev promenne ve is.Store s prekladem chybove hlasky
      * 	validator	- bud RegExp nebo callback funkce
      * 		regexp	 = /^[1-8]*$/
      * 		callback = function (val, $input, required, $parent) { ... }
      * 			val	- hodnota inputu
      * 			$input	- dany input
      * 			requred	- hodnota atributu required
      * 			$parent - rodic inputu
      */
     Forms.set_validator = function (name, err_msg_lid, validator) {
         var callback;
         validators = validators || window.Foundation.Abide.defaults.validators;
 
         if (!(''+name).length) {
             console.error('Je vyžadováno neprázdné jméno validátoru.');
             return;
         }
 
         switch($.type(validator)) {
             case 'function':
                 callback = validator;
                 break;
             case 'regexp':
                 callback = function (val) { return validator.test(val); };
                 break;
             default:
                 console.error('Nepodporovaný typ validátoru: ' + $.type(validator));
                 return;
         }
 
         validators[name] = function ($input, required, $parent) {
             var val = Forms.get_input_val($input);
 
             // prazdný vstup je ok (výjimka je 'required')
             if (!val.length && name !== 'required') {
                 return true;
             }
 
             // specialni validce
             if (!callback(val, $input, required, $parent)) {
                 Forms.change_input_err_msg_by_lid($input, [err_msg_lid, $input.data('validator_'+name+'_extra_lid')]);
                 return false;
             }
 
             return true;
         };
 
         try {
             // Slouzi pouze pro debug validatoru.
             // Nema funkcni vyznam pro aplikaci.
             // Pokud spadne s chybou, tak to nevadi a lze ignorovat :)
             validators[name].toString = function () {
                 return validator.toString();
             };
         } catch (e) {}
     };
 
     /**
      * Zaregistruje validator, ktery se vyhodnoti se vsemi inputy,
      * ktere jsou potomkem elementu 'validator-group-content' sousediciho
      * s inputem, na kterem je validator nastaven. Jedna se o JS podporu
      * k nastroji validator_group v Toolkitu.
      *
      *	Forms.set_validator_group(name, err_msg_lid, validator);
      *
      *	name		- nazev validatoru vyplnovany do data-validator
      *	err_msg_lid	- nazev promenne ve is.Store s prekladem chybove hlasky
      *	validator	- bud RegExp nebo callback funkce
      *		regex	 = /^[1-8]*$/	- regularni vyraz, kteremu se musi rovnat vsechny vyplnene inputy
      *		callback = function (valid, val, $input, $inputs, $group_input) { ... }
      *			valid		- hodnota validity z predchoziho volani callback funcke (na zacatku true)
      *			val		- hodnota aktualne reseneho inputu
      *			$input		- aktualne reseny input
      *			$inputs 	- seznam inputu, ktere se validuji
      *			$group_input	- schovany input, ktery spousti validaci
      *
      */
     Forms.set_validator_group = function (name, err_msg_lid, validator) {
         var callback;
         validators = validators || window.Foundation.Abide.defaults.validators;
 
         if (!(''+name).length) {
             console.error('Je vyžadováno neprázdné jméno validátoru.');
             return;
         }
 
         switch($.type(validator)) {
             case 'function':
                 callback = validator;
                 break;
             case 'regexp':
                 callback = function (valid, val) { return valid && validator.test(val); };
                 break;
             default:
                 console.error('Nepodporovaný typ validátoru: ' + $.type(validator));
                 return;
         }
 
         validators[name] = function ($group_input, required, $parent) {
             var $inputs = $group_input.siblings('.validator-group-inputs-cover').find('input,select,textarea').not('.readonly-clone');
             var required = regex_required.test(name);
             var valid = !required;
             var focused = false;
             var abide = undefined;
 
             $inputs.each(function () {
                 var $input = $(this);
                 var val = Forms.get_input_val($input);
 
                 // prazdne inputy se preskakuji, pokud se nejedna o required validator
                 if (!val.length && !required) {
                     return;
                 }
 
                 valid = callback(valid, val, $input, $inputs, $group_input);
             });
 
             if (valid) {
                 return true;
             }
 
             Forms.change_input_err_msg_by_lid($group_input, [err_msg_lid, $group_input.data('validator_'+name+'_extra_lid')]);
 
             abide = is.Foundation.get_plugin($group_input.closest('form'));
             if (abide) {
                 focused = !!$inputs.filter(function () {
                     return !!($(this).data(namespace) || {}).wasFocused;
                 }).length;
             }
 
             if (focused) {
                 $inputs.each(function () {
                     var $input = $(this);
                     Forms.clear_input_err_msg($input);
                     abide.addErrorClasses($input);
                 });
             }
 
             return false;
         };
 
         try {
             // Slouzi pouze pro debug validatoru.
             // Nema funkcni vyznam pro aplikaci.
             // Pokud spadne s chybou, tak to nevadi a lze ignorovat :)
             validators[name].toString = function () {
                 return validator.toString();
             };
         } catch (e) {}
     };
 
     /**
      * Vrati string nebo pole hodnot, ktere odpovidaji tomu co server dostane pod jmenem inputu.
      * Na vsech navratovych hodnotach lze pouzit property 'length'.
      *
      * Tato metoda se pouziva pro zjisteni hodnoty inputu ve validatorech.
      */
     Forms.get_input_val = function ($input) {
         var val;
 
         // skupina radio ci checkboxu se stejnym jmenem
         if ($input.is(':radio') || $input.is(':checkbox')) {
             $input = $input.closest('form').find('[name="'+$input.attr('name')+'"]').not('[disabled]').filter(':checked');
         }
 
         if ($input.length > 1) {
             // muze byt vice zaskrtlych checkboxu se stejnym jmenem
             val = $.map($input, function (input) {
                 return $(input).val();
             });
         } else {
             val = $input.val();
         }
 
         switch (typeof val) {
             case 'string':	return val.trim();	// na serveru se provadi trim
             case 'object':	return val || [];	// select-multiple v jQuery < 3 vraci null, kdyz neni nic vybrano
             case 'number':	return ''+val;		// number prevedeno na string, aby bylo mozne volat metodu length
             default:	return val || '';	// undefined prevedeno na prazdny string, aby bylo mozne volat metodu length
         }
     };
 
     /**
      * Zmeni chybovou hlasku, kterou foundation zobrazuje u inputu
      * 	$input		- jQuery objekt, HTML element inputu, selector
      * 	err_msg_lid	- nazev podle ktereho se dohleda chybova hlaska v is.Store ldb
      * 			- muze se jednat o string nebo pole stringu, s vice hlaskama
      * 	invalidate	- nastavi u inputu tridy, ktere jej oznaci za nevalidni
      */
     Forms.change_input_err_msg_by_lid = function ($input, err_msg_lid, invalidate) {
         var messages = [];
 
         if ($.type(err_msg_lid) !== 'array') {
             err_msg_lid = [err_msg_lid];
         }
 
         $.each(err_msg_lid, function() {
             if (this == null) {
                 return;
             }
 
             if (is.ldb && is.ldb.exists(this)) {
                 messages.push(is.ldb.get(this));
             } else {
                 console.error('Nenalezen překlad chybové hlášky: "' + this + '".');
                 messages.push(this);
             }
         });
 
         Forms.change_input_err_msg($input, messages.join(' '));
     };
 
     /**
      * Zmeni chybovou hlasku, kterou foundation zobrazuje u inputu
      * 	$input		- jQuery objekt, HTML element inputu, selector
      * 	err_msg		- chybova hlaska
      * 	invalidate	- nastavi u inputu tridy, ktere jej oznaci za nevalidni
      */
     Forms.change_input_err_msg = function ($input, err_msg, invalidate) {
         if (err_msg == null || !err_msg.length) {
             console.warn('Chybová hláška je prázdná.');
         }
 
         _get_$form_error($input).html(err_msg);
 
         if (invalidate) {
             $input.closest('form').foundation('addErrorClasses', $input);
         }
     };
 
     /**
      * Smaze obsah chybove hlasky, kterou foundation zobrazuje u inputu
      * 	$input		- jQuery objekt, HTML element inputu, selector
      */
     Forms.clear_input_err_msg = function ($input) {
         _get_$form_error($input).empty();
     };
 
     /**
      * Znovu inicializuje form, aby validovalo vsechny existujici inputy
      * po pridani novych nebo odebrani starych z formulare.
      *
      * 	is.Forms.reinit(form_nebo_potomek_formu);
      *
      * 	kde:
      * 		form_nebo_potomek_formu	- nejaky selector na form nebo jeho potomka nebo odpovidajici DOM element nebo jQuery objekt
      * 						- pokud je prazdny nehlasi chybu a nic neudela
      */
     Forms.reinit = function (form_nebo_potomek_formu) {
         var abide = is.Foundation.get_plugin($(form_nebo_potomek_formu).closest('form'));
         if (!abide) {
             return;
         }
 
             abide._init();	// znovu nacte vsechny inputy a resetuje udalosti
     };
 
     /**
      * Zobrazi uzivateli informaci, ze je formular nevalidni, pokud je nevalidni, a pripadne na nej nascroluje.
      *
      * 	is.Forms.showInvalid(form_nebo_potomek_formu, scroll_to_form);
      *
      * 	kde:
      * 		form_nebo_potomek_formu	- nejaky selector na form nebo jeho potomka nebo odpovidajici DOM element nebo jQuery objekt
      * 						- pokud je prazdny nehlasi chybu a nic neudela
      * 		scroll_to_form		- nascrolluje stranku na zacatek formu
      */
     Forms.showInvalid = function (form_nebo_potomek_formu, scroll_to_form) {
         var abide = is.Foundation.get_plugin($(form_nebo_potomek_formu).closest('form'));
         if (!abide || !abide.$inputs.is('.is-invalid-input')) {
             return;
         }
 
         clearTimeout(abide.$element.data(namespace + 'ShowInvalidTimeout'));
         abide.$element.data(namespace + 'ShowInvalidTimeout',
             setTimeout(function () {
                 abide.$element
                     .find('[data-abide-error]')
                         .css('display', 'block')
                         .end()
                     .trigger('forminvalid.zf.abide.'+namespace, [abide.$element]);
 
                 if (scroll_to_form || abide.$element.data('scroll_on_error')) {
                     is.HashNavigation.scrollTo(abide.$element, 200);
                 }
             }, 500)
         );
     };
 
     /**
      * Najde chybovou hlasku k prislusnemu inputu a vrati jQuery objekt,
      * na kterem lze volat metody pro zmenu obsahu.
      *
      * 	_get_$form_error($input).text('Nova chybova hlaska');
      *
      * Jedna se o privatni pomocnou funkci modulu.
      * Pro zmenu obsahu chybove hlasky primarne slouzi funkce:
      * 	is.Forms.change_input_err_msg_by_lid
      * 	is.Forms.change_input_err_msg
      * 	is.Forms.clear_input_err_msg
      */
     function _get_$form_error($input) {
         var $form_error, $form_error_text, abide;
 
         $input = $($input);
 
         abide = is.Foundation.get_plugin($input.closest('form'));
         if (abide) {
             if ($input.is(':radio') || $input.is(':checkbox')) {
                 $input = abide.$element.find('[name="'+$input.attr('name')+'"]').first();
             }
 
             $form_error = abide.findFormError($input);
         }
 
         if (!$form_error || !$form_error.length) {
             $form_error = $input.next('.form-error');
         }
 
         if (!$form_error.length) {
             console.error('Nenalezen element pro zobrazení chybové hlášky.', 'id', $input.attr('id'), 'name',  $input.attr('name'), 'val', $input.val());
         }
 
         $form_error_text = $form_error.children('.form-error-text');
 
         // vratim vzdy jQuery objekt a to i prazdny,
         // aby se na vysledku funkce daly volat jQuery metody
         return $form_error_text.length ? $form_error_text : $form_error;
     }
 
     /**
      * Zvysi ci snizni hodnotu :inputu
      */
     function _change_number (increment, $input) {
         var value, was_empty, was_comma, step;
 
         step = $input.data('step') || 1;
         value = $input.val().trim();
         was_empty = value === '';
         was_comma = !!~value.indexOf(',');
         value = value.replace(',', '.');
 
         value = +value;
         if (isNaN(value)) {
             $input.closest('form').foundation('validateInput', $input);
         } else {
             value += increment*step;
 
             if (was_comma) {
                 value = ('' + value).replace('.', ',');
             }
 
             $input.val(value);
 
             if (was_empty) {
                 $input.closest('form').foundation('removeErrorClasses', $input);
             }
 
             $input.trigger('change');
         }
     }
 
     // inicializuje udalosti, ktere jsou potreba pro aktivni casti formularovych prvku
     function _bind_basic_events () {
         var last_input;
 
         $(document)
         /* odebrani udalosti kvuli opakovanemu spustneni funkce */
             .off('.'+namespace)
         /* odkliknuti RADIO buttonu */
             .on('click.'+namespace, ':radio[data-waschecked]:not([disabled])', function() {
                 var $radio = $(this);
                 var radio_name = $radio.attr('name');
 
                 if ($radio.data('waschecked') === true) {
                     $radio.prop('checked', false);
                     $radio.data('waschecked', false);
                 } else {
                     $radio.prop('checked', true);
                     $radio.data('waschecked', true);
                 }
                 $radio.closest('form').find(':radio[data-waschecked][name="' + radio_name + '"]').not($radio).data('waschecked', false);
                 $radio.trigger('change');
             })
             .on('change.'+namespace, ':radio[data-waschecked]', function() {
                 var $radio = $(this);
                 $radio.prop('checked', $radio.data('waschecked'));
             })
         /* numer SPINNERS -- buttons */
             .on('click.'+namespace, '.number-spinner-up > button', function() {
                 _change_number(1, $(this).closest('.input-group').children('input').first());
                 return false;
             })
             .on('click.'+namespace, '.number-spinner-down > button', function() {
                 _change_number(-1, $(this).closest('.input-group').children('input').first());
                 return false;
             })
             .on('keydown.'+namespace, '[data-number]', function (evt) {
                 var key = evt.which || evt.keyCode || 0;
                 if (key === 38) {
                     _change_number(1, $(this));
                     return false;
                 }
 
                 if (key === 40) {
                     _change_number(-1, $(this));
                     return false;
                 }
             })
         /* aby bylo poznat s jakym elementem jiz interagoval uzivatel */
             .on('focus.'+namespace, ':input', function () {
                 var $input = $(this);
                 var data = $input.data(namespace) || {};
                 data.wasFocused = true;
                 $input.data(namespace, data);
             })
         /* skryti obecne hlasky o nevalidite formulare za rozumnou dobu */
             .on('forminvalid.zf.abide.'+namespace, 'form', { err_msg: is('ldb.isForms_invalid') }, function (evt) {
                 var $error = $(this).find('[data-abide-error]');
 
                 if (!$error.length && !evt.data.err_msg) {
                     return;
                 }
 
                 if (!$error.length) {
                     is.Zdurazneni.chyba(evt.data.err_msg, {
                         fade_out: true,
                         stack: false,
                     });
                 } else if ($error.is(':animated')) {
                     // na zacatku problikne a celkove za 3s zmizi
                     $error	.stop(true, false)
                         .fadeTo( 0	, 1	)
                         .fadeTo( 150	, 0.75	)
                         .fadeTo( 200	, 1	)
                         .fadeTo( 2150	, 1	)	// nahrada za .delay(), aby slo pouzit .stop() a ':animated'
                         .fadeTo( 500	, 0	)
                         .fadeOut();
                 } else if ($error.length) {
                     // za 3s zmizi
                     $error	.fadeTo( 0	, 1	)
                         .fadeTo( 2500	, 1	)	// nahrada za .delay(), aby slo pouzit .stop() a ':animated'
                         .fadeTo( 500	, 0	)
                         .fadeOut();
                 }
             })
         /* o(d)znaci vsechny (ne)oznacene checkboxy */
             .on('click.'+namespace, '.radio-group-toolbar .check-all', function (evt) {
                 var $group;
                 var group_class = $(this).closest('.radio-group-toolbar').data('group-class');
 
                 evt.preventDefault();
                 evt.stopPropagation();
 
                 if (group_class == null || group_class === '') {
                     console.error('Není definovaná společná třída pro propojení checkboxu.', $self);
                     return ;
                 }
 
                 ($group = $('.'+group_class).not('.readonly').not('[disabled]').not('[readonly]'))
                     .prop('checked', !!$group.not(':checked').length)
                     .first()
                         .trigger('change');
             })
         /* zobrazi/skryje cely obsah radio-group */
             .on('click.'+namespace, '.radio-group-toolbar .show-all, .radio-group-toolbar .hide-bottom', function (evt) {
                 var $self = $(this);
                 var $toolbar = $self.closest('.radio-group-toolbar');
                 var group_class = $toolbar.data('group-class');
                 var $group_box;
 
                 evt.preventDefault();
                 evt.stopPropagation();
 
                 if (group_class == null || group_class === '') {
                     console.error('Není definovaná společná třída pro nalezeni radio-group-box.', $self);
                     return ;
                 }
 
                 $toolbar.find('.show-all, .hide-bottom').toggleClass('hide');
                 $group_box = $('.'+group_class).first().closest('.radio-group-box');
 
                 if ($self.is('.show-all')) {
                     $group_box.css('max-height', '');
                 } else {
                     $group_box.css('max-height', $group_box.data('max-height'));
                 }
             })
         /* zaznaci jaky formularovy prvek byl naposledy navstiven */
             .on('blur.'+namespace, ':input', function () {
                 last_input = this;
             })
         /* umozni pomoci shift oznacit souvislou skupinu checkboxu mezi vybranymi */
             .on('click.'+namespace, ':checkbox:not([disabled])', function (evt) {
                 var $checkbox, $checkbox_group;
 
                 if (!evt.shiftKey) {
                     return;
                 }
 
                 $checkbox = $(this);
                 $checkbox_group = $checkbox.closest('form').find(':checkbox').filter('[name="' + $checkbox.attr('name') + '"]').not('[disabled]');
 
                 // pokud neni ve formulari, nebo posledni focused element nebyl ze skupiny, tak ignore
                 if (!$checkbox_group.length || $checkbox_group.index(last_input) < 0) {
                     return;
                 }
 
                 $.fn.slice.apply(
                     $checkbox_group,
                     [$checkbox_group.index(last_input), $checkbox_group.index($checkbox)].sort(function (a, b) {
                         return a - b;
                     })
                 ).prop('checked', $(last_input).prop('checked'));
             })
         /* rozsiri stav aktualne validovaneho checkboxu nebo radioboxu ve skupine */
             .on('valid.zf.abide.'+namespace+' invalid.zf.abide.'+namespace, '.radio-group input, .radio-group-box input', function (evt, $input) {
                 var $inputs = $input.closest('.radio-group,.radio-group-box').find('input');
                 var abide;
 
                 if ($inputs.length <= 1) {
                     return;
                 }
 
                 abide = is.Foundation.get_plugin($input.closest('form'));
                 if (!abide) {
                     return;
                 }
 
                 if (evt.type === 'invalid') {
                     $inputs.each(function () {
                         abide.addErrorClasses($(this));
                     });
                 } else {
                     $inputs.each(function () {
                         abide.removeErrorClasses($(this));
                     });
                 }
 
                 return;
             })
         /* nekdy potrebujeme mit prvky ve <form> (kvuli validaci), ale zaroven nechceme, aby se napr. zmacknutim entru formular odeslal */
             .on('submit.'+namespace, 'form.prevent_submit', function (evt) {
                 var $form = $(this);
                 evt.preventDefault();
             })
         /* ignoruje defaultni chovani pri kliku na label v urcitich situacich */
             .on('click.'+namespace, 'label', function (evt) {
                 var label, label_for;
                 var $target = $(evt.target);
 
                 // kliklo se na odkaz
                 if ($target.closest('a').length) {
                     evt.stopPropagation();
                     return;
                 }
 
                 // kliklo se na navodek
                 if ($target.closest('span.navodek, div.navodek').length) {
                     evt.preventDefault();
                     return;
                 }
 
                 // label, ktery referencuje input pomoci atributu 'for' na input, ktery je obalen jinym labelem
                 // 	- typicky priklad je spolecny label u skupiny checkboxu nebo radii
                 label = this;
                 label_for = $(label).attr('for');
                 if (is.Misc.is_valid_id(label_for)) {
                     $('#'+label_for).closest('label').each(function () {
                         if (this !== label) {
                             evt.preventDefault();
                             return false;
                         }
                     });
 
                     if (evt.isDefaultPrevented()) {
                         return;
                     }
                 }
             });
     }
 
     // funkce, ktera zkontroluje jestli je input nebo skupina inputu vyplnena
     function _validator_required (val, $input) {
         var abide, $inputs, $inputs_valid, focused,
             valid = false,
             names = ($input.data('required_group_names') || '').trim();
 
         // zakladni situace, kdy input nespada do skupiny
         if (!names.length) {
             return val.length > 0;
         }
 
         // ------------------------------------------------
         // kontrola zda alespon jeden ze skupiny je vyplnen
         // ------------------------------------------------
 
         // predpoklada se ze abide plugin je navazan na formulari
         abide = is.Foundation.get_plugin($input.closest('form'));
         if (!abide) {
             return false;
         }
 
         // vsechny inputy podle jmena + aktualni => muze obsahovat duplicity
         $inputs = abide.$element
                 .find('[name="'+names.split(/\s+/).join('"],[name="')+'"]')
                 .add($input);
 
         // omezeni vyberu na ty, ktere maji vyplnenou hodnotu
         $inputs_valid = $inputs.filter(function () {
             return !!Forms.get_input_val($(this)).length;
         });
 
         // zjisti se jestli uzivatel jiz interagoval s nekterym inputem
         focused = !!$inputs.filter(function () {
             return !!($(this).data(namespace) || {}).wasFocused;
         }).length;
 
         // alespon jeden ma vyplnenou hodnotu => podminka je splnena
         valid = !!$inputs_valid.length;
 
         $inputs.each(function() {
             var $self = $(this);
 
             // schovani hvezdicky, pokud input neni vyplnen, ale podminka required je jiz splnena
             abide.findLabel($self)
                 .find('.povinna_polozka,.pp,.povinne')
                     .toggleClass('hide', valid && !$inputs_valid.is(this));
 
             if (valid) {
                 // input je validni a zobrazena hlaska zacina na standartni text,
                 // muzou se odebrat tridy invalidity
                 if (_get_$form_error(this).text().indexOf(is('ldb.error_msg_required')) === 0) {
                     abide.removeErrorClasses($self);
                 }
             } else {
                 // ani jeden input ze skupiny neni vyplnen a soucasne uzivatel jiz interagoval
                 // s nekterym inputem ze skupiny, proto se nahodi invalid tridy.
                 if (focused) {
                     abide.addErrorClasses($self);
                 }
             }
         });
 
         return valid;
     }
 
     // zaregistrovani defaultnich validatoru pro Foundation
     function _set_default_validators () {
         var defaults = window.Foundation.Abide.defaults;
         var patterns = defaults.patterns;
         defaults.patterns = {};
 
         // Pole je povinne
         Forms.set_validator('required', 'error_msg_required', _validator_required);
 
         // Povinny alespon jeden
         Forms.set_validator_group('required_any', 'error_msg_required_any', function (valid, val, $input, $inputs, $group_input) {
             return ($inputs[0] === $input[0] ? false : valid) || val.length;
         });
 
         // Povinne vsechny prvky
         Forms.set_validator_group('required_all', 'error_msg_required_all', function (valid, val, $input, $inputs, $group_input) {
             return ($inputs[0] === $input[0] ? true : valid) && val.length;
         });
 
         // Pouze znaky abecedy (vc. diakritiky), mezera, podtržítko a spojovnik
         Forms.set_validator('alpha', 'error_msg_alpha', /^[-a-zA-Z\u00C0-\u02AF\u0370-\u1FFF\u2F00-\uD7AF _]*$/);
 
         // Pouze znaky abecedy (vc. diakritiky), čísla, mezera, podtržítko a spojovnik
         Forms.set_validator('alpha_numeric', 'error_msg_alpha_numeric', /^[-a-zA-Z0-9\u00C0-\u02AF\u0370-\u1FFF\u2F00-\uD7AF _]*$/);
 
         // E-mail
         Forms.set_validator('email', 'error_msg_email', /^[-a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~]+@[a-zA-Z0-9](?:[-a-zA-Z0-9]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-a-zA-Z0-9]{0,61}[a-zA-Z0-9])?)+$/);
 
         // Telefonni cislo
         Forms.set_validator('phone', 'error_msg', /^\+?[0-9 ]+$/);
 
         // Cislo
         Forms.set_validator('number_natural', 'error_msg_number_natural', /^[1-9]\d*$/);
         Forms.set_validator('number_natural_zero', 'error_msg_number_natural_zero', /^(:?[1-9]\d*|0)$/);
         Forms.set_validator('number_integer', 'error_msg_number_integer', /^(:?-?[1-9]\d*|0)$/);
         Forms.set_validator('number', 'error_msg', function (val) {
             val = val.replace(/,/g, '.');
             return $.isNumeric(val);
         });
 
         // Cislo max_val
         Forms.set_validator('max_val', 'error_msg_max_val', function (val, $input) {
             var max_val = $input.data('max');
             var min_val = $input.data('min');
 
             if (!$.isNumeric(max_val)) {
                 console.error('Je nastaven validator "max_val", ale hodnota atributu "max" je prázdná.', max_val, $input);
             }
             if ($.isNumeric(min_val) && (max_val < min_val)) {
                 console.error('Je nastaven atribut "max" a "min", ale hodnota atributu "min" je menší.', min_val, max_val, $input);
             }
             return max_val >= val
         });
 
         // Cislo min_val
         Forms.set_validator('min_val', 'error_msg_min_val', function (val, $input) {
             var min_val = $input.data('min');
             if (!$.isNumeric(min_val)) {
                 console.error('Je nastaven validator "min_val", ale hodnota atributu "min" je prázdná.', min_val, $input);
             }
             return min_val <= val
         });
 
         // Prvni pismeno musi byt velke
         Forms.set_validator('uc_first', 'error_msg_uc_first', function (val) {
             var first = val.substring(0, 1);
             return first === first.toUpperCase();
         });
 
         // Minimalni pocet znaku
         Forms.set_validator('min', 'error_msg_min', function (val, $input) {
             var valid_min = $input.data('valid-min');
 
             if (!$.isNumeric(valid_min) || valid_min < 0) {
                 console.error('Je nastaven validator "min", ale hodnota atributu "data-valid-min" neni kladne cislo.', valid_min, $input);
             }
 
             return val.length >= valid_min;
         });
 
         // Maximalni pocet znaku
         Forms.set_validator('max', 'error_msg_max', function (val, $input) {
             var valid_max = $input.data('valid-max');
 
             if (!$.isNumeric(valid_max) || valid_max < 0) {
                 console.error('Je nastaven validator "max", ale hodnota atributu "data-valid-max" neni kladne cislo.', valid_max, $input);
             }
 
             return val.length <= valid_max;
         });
 
         // Maximalni pocet bytu
         Forms.set_validator('max_bytes', 'error_msg_max', function (val, $input) {
             var valid_max_bytes = $input.data('valid-max-bytes');
 
             if (!$.isNumeric(valid_max_bytes) || valid_max_bytes < 0) {
                 console.error('Je nastaven validator "max-bytes", ale hodnota atributu "data-valid-max-bytes" neni kladne cislo.', valid_max_bytes, $input);
             }
 
             return is.Misc.count_bytes(val) <= valid_max_bytes;
         });
 
         var url_opt_http = new RegExp(/^((https?|ftp|file|ssh):\/\/)?(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-fA-F]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-fA-F]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-fA-F]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-fA-F]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-fA-F]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/);
 
         // pouziva leve menu NavMenu
         Forms.set_validator('zalozka_url', 'error_msg_zalozka_url', url_opt_http);
 
         // Vlastni kontrola 'date' bez 'datepicker'
         Forms.set_validator('date_format', 'error_msg', (function () {
             var regex_mark_1 = /^[hismd]/,
                 regex_mark_2 = /^(?:hh|ii|ss|mm|dd|yy)/,
                 regex_mark_4 = /^yyyy/,
                 ws = /^\s*$/,
                 part_list = {
                     yyyy: '\\d{4}',
                     yy: '\\d{2}',
                     mm: '(?:0\\d|1[0-2])',
                     dd: '(?:[0-2]\\d|3[0-1])',
                     hh: '(?:[0-1]\\d|2[0-3])',
                     ii: '(?:[0-5]\\d)',
                     ss: '(?:[0-5]\\d)',
                     m: '(?:0?\\d|1[0-2])',
                     d: '(?:[0-2]?\\d|3[0-1])',
                     h: '(?:[0-1]?\\d|2[0-3])',
                     i: '(?:[0-5]?\\d)',
                     s: '(?:[0-5]?\\d)',
                 };
 
             function _make_date_format_regex (format) {
                 var i, mark,
                     parts = [],
                     res = '';
 
                 while (format.length) {
                     mark = regex_mark_4.exec(format)
                         || regex_mark_2.exec(format)
                         || regex_mark_1.exec(format);
 
                     if (mark === null) {
                         mark = format[0];
                         if (ws.test(mark)) {
                             parts.push('\\s?');
                         } else {
                             parts.push(is.Misc.escape_regexp(mark));
                         }
                     } else {
                         mark = mark[0];
                         parts.push(part_list[mark]);
                     }
 
                     format = format.substr(mark.length);
                 }
 
                 i = parts.length;
                 while (i--) {
                     res = parts[i] + res;
                     if (i) {
                         res = '(' + res + ')?';
                     }
                 }
 
                 return new RegExp('^' + res + '$');
             }
 
             return function (val, $input) {
                 var regex_by_format,
                     format = $input.data('date-format');
 
                 if (typeof format !== 'string' || format === '') {
                     console.error('Je nastaven validator "date_format", ale hodnota atributu "data-date-format" neni string delky alespon 1.', format, $input.attr('name'), val);
                     return true;
                 }
 
                 regex_by_format = $input.data('date-format-regexp');
                 if (regex_by_format == null) {
                     regex_by_format = _make_date_format_regex(format);
                     $input.data('date-format-regexp', regex_by_format);
                 }
 
                 return regex_by_format.test(val);
             }
         }()));
 
 
         $.each(patterns, function (key, value) {
             if (validators[key]) {
                 return;
             }
 
             Forms.set_validator(key, 'error_msg', value);
         });
 
     }
     /*            Init validátoru pro omezení minimální hodnoty u datepickeru                    */
     /* využívá moment pro porovnání datumu - je vybraný datum větší než (+/-val, typ) (+1, hour) */
     /* v toolkitu při užití 'datepicker_minimal_date' se nalinkuje automaticky: /js/moment.min.js*/
     /*-----povinné-------------------------------------------------------------------------------*/
     /*     *data-minimal-val = '+/- hodnota o kterou se posune současný čas'                     */
     /*     *data-minimal-typ = 'typ určuje typ val: year/month/week/day/hour/minute/second '     */
     /*-----nepovinné-----------------------------------------------------------------------------*/
     /*     *data-minimal-pair-id = 'id druhého datepickeru od kterého chceme odpočítat tento.'   */
     /*-------------------------------------------------------------------------------------------*/
     Forms.init_datepicker_minimal_date = function () {
         window.Foundation.Abide.defaults.validators.datepicker_minimal_date = function($input) {
             // je potřeba mít /js/moment-min.js
             if (window.moment) {
                 var start_moment;
                 var $pair = $('#'+$input.data('minimal-pair-id'));
                 var pair_abide = is.Foundation.get_plugin($pair.closest('form'));
 
                 if ($pair.val() && pair_abide.validateInput($pair)) { // existuje pair a má val, který je validní
                     start_moment = moment(
                             (
                                 $pair.data('datepicker')
                                      ? $pair.data('datepicker').getFormattedDate()
                                     : $pair.val()
                             )
                             , $pair.data('date-format')
                                 //datepicker format na moment format
                                 .toUpperCase().replace(/I/g,'m').replace(/S/g,'s')
                     );
                 } else { // default = teď
                     start_moment = moment();
                 }
 
                 if ($input.val() && !
                         start_moment.add($input.data('minimal-val'), $input.data('minimal-typ')).add(-1,'second').isBefore(
                             moment(
                                 (
                                     $input.data('datepicker')
                                         ? $input.data('datepicker').getFormattedDate()
                                         : $input.val()
                                 )
                                 , $input.data('date-format')
                                     //datepicker format na moment format
                                     .toUpperCase().replace(/I/g,'m').replace(/S/g,'s')
                             )
                         )
                 ) {
                     Forms.change_input_err_msg_by_lid($input, 'error_msg_datepicker_min_date');
                     return false;
                 }
                 return true;
             } else {
                 Forms.change_input_err_msg_by_lid('Načti si /js/moment-min.js', 'error_msg_datepicker_min_date');
                 console.log('ERR - chybí moment-min.js');
                 return false;
             }
         };
     }
 
     Forms.init_datepicker_maximal_date = function () {
         window.Foundation.Abide.defaults.validators.datepicker_maximal_date = function($input) {
             // je potřeba mít /js/moment-min.js
             if (window.moment) {
                 var start_moment;
                 var $pair = $('#'+$input.data('maximal-pair-id'));
                 var pair_abide = is.Foundation.get_plugin($pair.closest('form'));
 
                 if ($pair.val() && pair_abide.validateInput($pair)) { // existuje pair a má val, který je validní
                     start_moment = moment(
                             (
                                 $pair.data('datepicker')
                                      ? $pair.data('datepicker').getFormattedDate()
                                     : $pair.val()
                             )
                             , $pair.data('date-format')
                                 //datepicker format na moment format
                                 .toUpperCase().replace(/I/g,'m').replace(/S/g,'s')
                     );
                 } else { // default = teď
                     start_moment = moment();
                 }
 
                 if ($input.val() && !
                         moment(
                             (
                                 $input.data('datepicker')
                                     ? $input.data('datepicker').getFormattedDate()
                                     : $input.val()
                             )
                             , $input.data('date-format')
                                 //datepicker format na moment format
                                 .toUpperCase().replace(/I/g,'m').replace(/S/g,'s')
                         )
                         .isBefore(
                             start_moment.add($input.data('maximal-val'), $input.data('maximal-typ')).add(-1,'second')
                         )
                 ) {
                     Forms.change_input_err_msg_by_lid($input, 'error_msg_datepicker_max_date');
                     return false;
                 }
                 return true;
             } else {
                 Forms.change_input_err_msg_by_lid('Načti si /js/moment-min.js', 'error_msg_datepicker_max_date');
                 console.log('ERR - chybí moment-min.js');
                 return false;
             }
         };
     }
 
     /**
      * Funkcia dovoli odoslat formular ajaxom a zaroven vyuzivat foundation
      * validaciu Abide. Funkce transformuje formulář na ajaxový. Funkci je
      * potřeba na formuláři zavolat jen jednou a ideálně předtím,
      * než s formulářem začne pracovat uživatel.
      *
      * Signatura:
      *
      *	is.Forms.ajax_submit(form [, settings]);
      * nebo
      *	is.Forms.ajax_submit(form, isAjax [, data]);
      *
      * Kde:
      *
      *	- form, selektor/jquery objekt elementu form, ktory chceme odoslat
      *	- settings objekt, is.Ajax settings objekt, doplnujuce data nastavte
      *	  skrz kluc data
      *	- isAjax, vopred vytvorena instancia is.Ajax
      *	- data, doplnujuce data, ktore sa poslu spolu s daty formu
      *
      * Nasledne je mozne standardne naviazat done/fail/always handlery.
      *
      * 	is.Forms.ajax_submit( ... ).done( ... );
      *
      * https://github.com/zurb/foundation-sites/blob/v6.3/docs/pages/abide.md#event-listener
      */
     Forms.ajax_submit = function(form, settings_or_isAjax, data) {
         var $form = $(form);
 
         is.Foundation.safe_init(); // pre istotu inicializujem foundation
         var done_list	= $.Callbacks("memory");
         var fail_list	= $.Callbacks("memory");
 
         $form.on('formvalid.zf.abide', function(e, $form){
             if (settings_or_isAjax == null || $.isPlainObject(settings_or_isAjax)) {
                 is.Ajax.send_form($form, settings_or_isAjax).then(done_list.fire, fail_list.fire);
             } else {
                 settings_or_isAjax.send_form($form, data).then(done_list.fire, fail_list.fire);
             }
         }).on('submit', function(e){
             e.preventDefault();
         });
 
         return {
             done:	done_list.add,
             fail:	fail_list.add,
             always:	function() {
                 done_list.add( arguments );
                 fail_list.add( arguments );
             }
         };
     };
 
     Forms.is_valid = function(form) {
         var $form = $(form);
 
         if (!$form.is('form')) {
             return Forms.validate_subform($form);
         }
 
         var abide = is.Foundation.get_plugin($form);
 
         if (!abide) {
             is.Console.error("Formular '"+$form.selector+"' nema inicializovany Foundation!");
             return;
         }
 
         return abide.validateForm();
     };
 
     Forms.validate_subform = function($subform) {
         var $form = $subform.closest('form');
         var abide = is.Foundation.get_plugin($form);
         if (!abide) {
             is.Console.error("Formular '" + $form.selector + "' nema inicializovany Foundation!");
             return;
         }
 
         // nasledujici je prevzato z Foundationu
         var acc = [];
         abide.validate_tmp_cache = { removeRadioErrorClasses: {}, validateRadio: {} };
         abide.$inputs.each(function () {
             var $input = $(this);
             if ($input.closest($subform).length) {
                 acc.push(abide.validateInput($input));
             }
         });
         abide.validate_tmp_cache = undefined;
         return acc.indexOf(false) === -1;
     };
 
     // pri zavreni modalniho okna nekdy dojde k odpojeni $form od DOMu
     // tato funkce kontroluje, jestli je $form porad pripojeny
     // -- kdyz neni, nefunguje validace (pri pokusu o validaci vznikne chyba "We're sorry, 'validateInput' is not an available method for this element.")
     Forms.is_form_in_DOM = function(input) {
         var $form = $(input).closest('form');
 
         return !!($form.length && $form.closest(document).length);
     };
 
     Forms.init_readonly = function (input_elm) {
         $(input_elm).readonly(true);
     };
 
     // dohleda input s hlavnim validatorem ve validator_group
     //
     //	var $input = is.Forms.get_validator_group_$input(obal_nebo_potomek);
     //
     //	kde obal_nebo_potomek je libovolna identifikace (selector, jQuery objekt)
     //
     Forms.get_validator_group_$input = function (obal_nebo_potomek) {
         return $(obal_nebo_potomek)
             .closest('.validator-group')
                 .children('.validator-group-content')
                     .children('.validator-group-input');
     };
 
     // Umoznuje na serveru nastavit priznak 'indeterminate'.
     // V JS neni duvod pouzivat tento wraper,
     // staci nastavit primo pomoci jQuery metody 'prop'.
     Forms.set_indeterminate = function (checkbox_elm) {
         $(checkbox_elm).prop('indeterminate', true);
     };
 
     return Forms;
 
 }); // konec is.Forms
 
 /**
  * Modul obsahuje ruzne kontroly, ktere se spousti, pri debugovani stranky.
  * Kontroly odhaluji ruzne nesrovnalosti, ktere mohou vest k nepredvidatelnemu chovani.
  */
 is.Define.module('Debug', function () {
 
     var Debug = {
         /**
          * Overi spravnost integrity HTML a JS.
          *
          * is.Define.check_all(0);
          */
         check_all: function (debug_lvl) {
             debug_lvl = debug_lvl == null ? 1 : debug_lvl;
 
             if (is('session.debug') <= debug_lvl) {
                 return;
             }
 
             Debug.check_duplicit_id();
             Debug.check_uninit_foundation();
             Debug.check_form_error_count();
             Debug.check_duplicit_jquery();
             Debug.check_tabindex_greater_zero();
             Debug.check_multiple_radio_checked();
         },
 
         /**
          * Zjisti jestli na strance neni vice elementu se stejnym ID,
          * kvuli pouzivani $('#id'), ktere pouziva getElementById('id'),
          * ktere pri duplicitnim ID vraci vzdy pouze jeden element
          * a ostatni zamlci.
          */
         check_duplicit_id: function () {
             $(function () {
                 var ids = {};
 
                 $('[id]').each(function () {
                     var id = this.id;
                     var $ids;
 
                     try {
                         $ids= $('[id="' + id + '"]');
                     } catch (err) {
                         console.error('Nalezeno ID, ktere nelze pouzit v jQuery selectoru.', id, document.getElementById(id));
                         return;	// continue
                     }
 
                     if ($ids.length > 1 && !ids[id]) {
                         ids[id] = $ids;
                     }
                 });
 
                 if ($.isEmptyObject(ids)) {
                     console.info('Kontrola duplicity ID probehla v poradku.',
                         'Vsechna ID jsou unikatni.'
                     );
                 } else {
                     console.error('Nalezeno vice elementu se stejnym ID.', ids);
                 }
             });
         },
 
         /**
          * Zjisti jestli na strance neexistuje nejaky element,
          * u ktereho jsou nastaveny priznaky nejakeho Foundation
          * pluginu, ale plugin jako takovy na nem zatim nebyl
          * inicializovan.
          */
         check_uninit_foundation: function () {
             var $uninit_elems = is.Foundation.uninit_elemenents();
 
             if ($uninit_elems.length) {
                 console.error('Nalezeny neinicializovane prvky foundation pluginu.',
                     'Inicializaci lze provest pomoci is.Foundation.safe_init()',
                     $uninit_elems
                 );
             } else {
                 console.info('Kontrola inicializace foundation probehla v poradku.',
                     'Vsechny prvky na strance, ktere foundation potrebuje zinicializovat jsou zinicializovany'
                 );
             }
         },
 
         /**
          * Overi zda kazdy input, ktery validator prochazi,
          * ma prirazen prave jeden span s form-error tridou.
          */
         check_form_error_count: function () {
             var $inputs = $('input, textarea, select')
                 .not('[type="hidden"]')
                 .not('[data-abide-ignore]')
                 .not('.readonly-clone')
                 .filter(function () {
                     var $input = $(this),
                         abide = is.Foundation.get_plugin($input.closest('form'));
 
                     if (!abide) {
                         return false;
                     }
 
                     if (abide.findFormError($input).length > 1) {
                         return true;
                     }
 
                     return false;
                 });
 
             if ($inputs.length) {
                 console.error('Nalezeny inputy, u kterych chybi nebo prebyva kontejner pro chybove hlaseni.',
                     'Kontejner musi byt prave jeden u vsech prvku, ktere nejsou [type="hidden"] nebo [data-abide-ignore] (u techto nesmi byt zadny).',
                     '$input.closest("form").data("zfPlugin").findFormError($input).length',
                     $inputs.map(function () {return $(this).attr('name');}).get()
                 );
             } else {
                 console.info('Kontrola konzistence inputu a chybovych hlaseni probehla v poradku.',
                     'Kazdy input, ktery muze byt validovan, ma prirazen alespon jednen element pro zobrazeni chybove hlasky.'
                 );
             }
         },
 
         /**
          * Overi jestli je nactena pouze jedna jQuery knihovna.
          * Pokud je nalezeno vice knihoven, je vypsana jejich verze
          * a vztah ke knihovne, kterou pouziva Foundation a is.js.
          */
         check_duplicit_jquery: function () {
             var more_jquery = false;
             var log = [];
 
             Object.keys(window).forEach(function(key) {
                 var jquery = window[key];
 
                 if (Object.prototype.toString.call(jquery) !== '[object Function]') {
                     // pokud se IS nacte v <iframe> z cizi domeny,
                     // nesmim sahat na window.parent, window.top nebo milion dalsich nazvu
                     // radeji proto omezim na prohledavani funkci (jQuery je vzdy funkce)
                     return;
                 }
 
                 var version = jquery && jquery.fn && jquery.fn.jquery;
                 var is_jquery_f = jquery === $;
 
                 if (version) {
                     more_jquery = more_jquery || !is_jquery_f;
                     log.push("\tjQueryF " + (is_jquery_f ? '=' : '!') + '== ' + key + ' (' + version + ")\n");
                 }
             });
 
             if (more_jquery) {
                 log.unshift("Je nacteno vice jQuery knihoven.\n");
                 log.unshift('jQueryF (' + $.fn.jquery + ")\n");
                 console.error.apply(console, log);
             } else {
                 console.info('Kontrola poctu jQuery knihoven probehla v poradku.',
                     'Na strance je jen jedna knihovna.',
                     $.fn.jquery
                 );
             }
 
         },
 
         /*
          * Overi zda jsou elementy oznaceny tabindexem stejne hodnoty,
          * aby bylo mozne se po nich prirozene pohybovat pomoci tabu.
          */
         check_tabindex_greater_zero: function () {
             var $bad_tabindex = $('*').filter(function () {
                 return +$(this).attr('tabindex') > 0;
             });
 
             if ($bad_tabindex.length) {
                 console.error('Na strance jsou elementy, ktere maji tabindex vetsi jak 0.',
                     'Toto oznaceni narusuje prirozeny pohyb po strance pomoci tabulatoru.',
                     $bad_tabindex.length, $bad_tabindex
                 );
             } else {
                 console.info('Kontrola elementu s atributem tabindex probehla v poradku.',
                     'Nebyl zadny nalezen, nebo vsechny maji mensi nebo rovnu hodnote nula.'
                 );
             }
         },
 
         check_multiple_radio_checked: function () {
             var $radio_list = $();
 
             $('form').each(function () {
                 var names = {};
 
                 $(this).find('[type="radio"][checked]').each(function () {
                     var $radio = $(this);
                     var name = $radio.attr('name');
 
                     if (names[name] != null) {
                         $radio_list = $radio_list.add($radio);
                     }
 
                     names[name] = 1;
                 });
             });
 
             if ($radio_list.length) {
                 console.error(
                     'Radio muze mit atribut "checked" pouze u jednoho inputu v ramci jedne skupiny (stejne name) v jednom formulari.',
                     'Bylo nalezeno vice radii ve stejnem formulari, ktere maji stejny "name" a maji atribut "checked".',
                     $radio_list
                 );
             } else {
                 console.info('Vsechna radia na strance maji spravne nastaven atribut "checked".');
             }
         },
     };
 
     return Debug;
 }); // konec is.Debug
 
 /**
  * Modul umozni presmerovat uzivatele na jinou stranku za stanoveny cas.
  * Uzivateli je zobrazen odpocet zbivajici do presmerovani.
  */
 is.Define.module('Redirect', function (namespace) {
     var Redirect = {};
 
     /**
      * Inicializuje odpocet pro formular '#redirect_form'
      */
     Redirect.init = function () {
         Redirect.by_form();
     };
 
     /**
      * Spusti odpocet a nakonci da submit na predany form.
      *
      * 	id.Redirect.by_form(sec, $form, $time_left);
      *
      * 	sec		- pocet sekund do presmerovani
      * 	$form		- jQuery object formulare
      * 	$time_left	- jQuery objekt, kde se budou zobrazovat zbivajici sekundy
      */
     Redirect.by_form = function (sec, $form, $time_left) {
         $form = $($form || '#redirect_form');
 
         _start_counter(
             sec,
             $time_left || $('#redirect_time_left'),
             function () {
                 $form.submit();
             }
         );
     };
 
     /**
      * Spusti odpocet a nakonci presmeruje na predane url.
      *
      * 	id.Redirect.by_form(sec, url, $time_left);
      *
      * 	sec		- pocet sekund do presmerovani
      * 	url		- string obsahujici odkaz na stranku presmerovani
      * 	$time_left	- jQuery objekt, kde se budou zobrazovat zbivajici sekundy
      */
     Redirect.to_url = function (sec, url, $time_left) {
         url = url || location.href;
 
         _start_counter(
             sec,
             $time_left,
             function () {
                 location.assign(url);
             }
         );
     };
 
     // spusti odpocitavadlo
     // 	sec		- pocet sekund do spusteni callback funkce
     // 	$time_left	- jQuery objekt
     // 	callback	- funkce, ktera se spusti na konci odpoctu
     function _start_counter (sec, $time_left, callback) {
 
         sec = sec || 8;
         $time_left = $($time_left) || $();
 
         (function loop () {
             $time_left.text(sec);
 
             if (sec <= 0) {
                 callback();
                 return;
             }
 
             setTimeout(loop, 1000);
             --sec;
         }());
     }
 
     return Redirect;
 }); // konec is.Redirect
 
 /**
  * JS podpora pro Toolkiti nastroj 'expand'.
  */
 is.Define.module('Expand', function(namespace, $){
 
     var event_name = 'click.'+namespace;
 
     return {
         /**
          * Inicializuje všechny objekty expand na stránce
          *
          * 	is.Expand.init();
          */
         init: function() {
 
             $(document).off(event_name).on(event_name, '.toolkit_expand .toggle', function(){
                 _toggle($(this));
             });
         },
 
         /**
          * Zjistí jestli je na stránce nějaký objekt, který je expandovaný-
          *
          * 	var boolean = is.Expand.is_expanded();
          */
         is_expanded: function() {
             return $('#content').add('.toolkit_expand').is('.is_expanded');
         },
 
         /**
          * Prepne expandovani dle predaneho tlacitka.
          *
          * 	is.Expand.toggle($toggle_button);
          */
         toggle: function ($toggle_button) {
             _toggle($($toggle_button));
         },
     };
 
     function _toggle ($toggle_button) {
         var $expand 		= $toggle_button.closest('.toolkit_expand');
         var $content_row	= $expand.find('.content_row');
         var $content_column	= $expand.find('.content_column');
 
         $content_row.toggleClass('row');
         $content_column.toggleClass('column overflow_auto');
 
         $expand.toggleClass('is_expanded');
         $toggle_button.toggleClass('fi-arrows-expand fi-arrows-compress');
         $toggle_button.attr('title', $expand.hasClass('is_expanded') ? is.ldb.te_sbalit : is.ldb.te_rozbalit);
         is.NavMenu.toggle(true);
     }
 
 }); // konec is.Expand
 
 /**
  * Vytvori jQuery objekt, ktery obsahuje motatko.
  *
  *	---
  *
  *	var loading = new is.Loading({
  *		parent		: '#sone_div',		// [povinny parametr] rodic do ktereho se ma motatko vlozit (cokoli co lze vlozit jako argument jQuery $())
  *		insertMethod	: 'append',		// jQuery metoda, ktera je pouzita pro vlozeni motatka do parenta
  *		 insertMethod	: 'toggle',		// pri zobrazeni motatka skryje puvodni obsah a po skryti motatka puvodni obsah znovu zobrazi (pouziva jQuery metodu 'html')
  *		delay 		: 600,			// doba neconosti, za kterou se ma motatko objevit (zaporne cislo -> motatko se nezobrazi)
  *		size		: '',			// velikost - ['', 'medium', 'small', 'inline']
  *		color		: '',			// barva - ['', 'dark']
  *	});
  *
  *	loading.show();
  *
  * 	---
  *
  * 	// nastaveni je mozne definovat v atributech data- parenta
  *
  * 	<div id="my_div"
  * 		data-loading-insert-method="prepend"
  * 		data-loading-delay="600"
  * 		data-loading-size="inline"
  * 	></div>
  *
  *	(new is.Loading('#my_div')).show();
  *
  */
 is.Define.class('Loading', function (namespace) {
     var loadings_temp = {
         ''	: null,
         medium	: null,
         small	: null,
         inline	: null,
     };
 
     function Loading (opt) {
         var self = this;
 
         // pokud neni opt plain object, jedna se o rodice
         if (opt != null && !$.isPlainObject(opt)) {
             opt = {
                 parent: opt,
             };
         }
 
         self.loadings = $(opt.parent).map(function () {
             return new is.LoadingOne($.extend({}, opt, { parent: this }));
         });
     }
 
     Loading.prototype = {
         /**
          * Najde na strance objekt kam vlozit 'loading', precte z nej nastaveni
          * a vrati jeho instanci nebo prazdnou instanci jQuery.
          *
          * '$parent' se nesmi chachovat, protoze 'self.opt.parent' muze byt zadan pomoci selectoru,
          * ktery pri kazdem volani self.show() bude v DOM ukazovat na neco jineho
          */
         get$parent: function () {
             var self = this;
 
             return $($.map(self.loadings, function (i, loading) {
                 return loading.get$parent();
             }));
         },
 
         /*
          * Vygeneruje jQuery objekt predstavujici motatko dle aktualniho nastaveni a vrati jeho instanci.
          * Vygeneruje pokazde nove, protoze nastaveni se muze menit dle nastaveni 'self.opt.parent'.
          */
         get$loading: function () {
             var self = this;
 
             return $($.map(self.loadings, function (i, loading) {
                 return loading.get$loading();
             }));
         },
 
         /*
          * Zobrazi motatko se zpozdenim 'delay'. Pokud neni 'delay' specifikovani,
          * pouzije se hodnota nastavena pri vytvoreni objektu,
          */
         show: function (delay) {
             var self = this;
 
             $.each(self.loadings, function (i, loading) {
                 loading.show(delay);
             });
         },
 
         /*
          * Schova motatko, pokud je zobrazeno
          */
         hide: function () {
             var self = this;
 
             $.each(self.loadings, function (i, loading) {
                 loading.hide();
             });
         },
     };
 
     /**
      * Vrátí jQuery objekt motátka dle nastavení size.
      *
      * 	is.Loading.get$loading(size).appendTo('div');
      *
      * 	kde size může být nevyplněno nebo nastaveno
      * 	na jednu z hodnot:
      *
      * 		'medium', 'small' nebo 'inline'.
      */
     Loading.get$loading = function (size, color) {
         size = size || '';
 
         if (loadings_temp[size] === undefined) {
             console.error('Nepovolena trida velikosti pro loading.', size);
             return $();
         }
 
         if (!loadings_temp[size]) {
             loadings_temp[size] = $(
                 ['<',' class="is-loading' + (size && ' is-loading-' + size) + '">'
                     +'<i class="isi-is"></i>'
                     +'<',' class="is-loading-spin">'
                         +'<','></','>'
                     +'</','>'
                 +'</','>']
                 .join(size === 'inline' ? 'span' : 'div')
             );
         }
 
         return loadings_temp[size].clone()
                 .addClass(color && 'is-loading-'+color);
     };
 
     return Loading;
 }); // konec is.Loading
 
 is.Define.class('LoadingOne', function (namespace) {
     var def_opt = {
         delay		: 600,
         size		: '',
         insertMethod	: 'append',
         color		: '',
     };
 
     function LoadingOne (opt) {
         var self = this;
 
         // pokud neni opt plain object, jedna se o rodice
         if (opt != null && !$.isPlainObject(opt)) {
             opt = {
                 parent: opt,
             };
         }
 
         self.opt = $.extend({}, def_opt, opt);
         self.$parent_content = null;
     }
 
     LoadingOne.prototype = {
         /**
          * Najde na strance objekt kam vlozit 'loading', precte z nej nastaveni
          * a vrati jeho instanci nebo prazdnou instanci jQuery.
          *
          * '$parent' se nesmi chachovat, protoze 'self.opt.parent' muze byt zadan pomoci selectoru,
          * ktery pri kazdem volani self.show() bude v DOM ukazovat na neco jineho
          */
         get$parent: function () {
             var self = this;
             var $parent = $(self.opt.parent);
 
             if (!$parent.length) {
                 is.Console.log('Neni definovan rodic pro umisteni elementu $loading', self.opt.parent);
                 return $();
             }
 
             // vytazeni vsech nastaveni z rodice => data-loading-delay="200" -> otp.delay = 200
             $.each(Object.keys(def_opt), function (i, opt_name) {
                 var data_name = 'loading' + opt_name[0].toUpperCase() + opt_name.slice(1);
                 if ($parent.data(data_name) != null) {
                     self.opt[opt_name] = $parent.data(data_name);
                 }
             });
 
             return $parent;
         },
 
         /*
          * Vygeneruje jQuery objekt predstavujici motatko dle aktualniho nastaveni a vrati jeho instanci.
          * Vygeneruje pokazde nove, protoze nastaveni se muze menit dle nastaveni 'self.opt.parent'.
          */
         get$loading: function () {
             var self = this;
             self.$loading = is.Loading.get$loading(self.opt.size, self.opt.color);
             return self.$loading;
         },
 
         /*
          * Zobrazi motatko se zpozdenim 'delay'. Pokud neni 'delay' specifikovani,
          * pouzije se hodnota nastavena pri vytvoreni objektu,
          */
         show: function (delay) {
             var self = this;
             var $parent;
 
             if (self.shown) {
                 return;
             }
             self.shown = true;
 
             $parent = self.get$parent();
             if (!$parent.length) {
                 return;
             }
 
             delay = delay == null ? self.opt.delay : delay;
             if (delay < 0) {
                 return;
             }
 
             if (delay === 0) {
                 self._insert_in_DOM($parent);
             } else {
                 self.timer = setTimeout(function () {
                     self._insert_in_DOM($parent);
                 }, delay);
             }
         },
 
         _insert_in_DOM: function ($parent) {
             var self = this;
             var insertMethod = self.opt.insertMethod;
 
             if (insertMethod === 'toggle') {
                 $parent.width($parent.width());
                 self.$parent_content = $parent.html();
                 insertMethod = 'html';
             }
 
             $parent[insertMethod](self.get$loading());
         },
 
         /*
          * Schova motatko, pokud je zobrazeno
          */
         hide: function () {
             var self = this;
 
             if (!self.shown) {
                 return;
             }
 
             clearTimeout(self.timer);
             if (self.$loading) {
                 self._remove_from_DOM();
             }
 
             self.timer = null;
             self.$loading = null;
             self.shown = false;
         },
 
         _remove_from_DOM: function () {
             var self = this;
 
             self.$loading.remove();
 
             if (self.$parent_content) {
                 self.get$parent().html(self.$parent_content);
                 self.$parent_content = null;
             }
         }
     };
 
     return LoadingOne;
 }); // konec is.LoadingOne
 
 /**
  * Modul pre zobrazenie indikatora ajaxovej navigacie.
  *
  * Viz parameter nanobar u is.Ajax
  */
 is.Define.module('Nanobar', function() {
 
     var nanobar;
     var timer;
     var start = 15;
 
     return {
         start: function() {
             nanobar = nanobar || new Nanobar();
 
             nanobar.go(start);
             timer = setInterval(function(){
                 start += (start > 40 ? (start > 50 ? (start > 85 ? 0 : 1) : 2) : 3);
                 nanobar.go(start);
             }, 100);
 
 
         },
         stop: function(success) {
             clearInterval(timer);
             start = 15;
             if (success) {
                 nanobar.go(100);
             } else {
                 nanobar.go(0);
             }
         },
     };
 });
 
 /**
  * JS podpora pro Toolkiti nastroj 'vice_mene'.
  */
 is.Define.module('ViceMene', function(namespace, $){
 
     var $vice_mene;
     var resize	= 'resize.'+namespace;
     var click	= 'click.'+namespace;
 
     return {
         /**
          * Inicializuje vsehhny objekty vice_mene na strance.
          * Nutne zavolat znovu po pridani noveho vice_mene objektu na stranku.
          *
          * 	is.ViceMene.init();
          */
         init: function() {
             $vice_mene = $('.tk_vice_mene'); // update mnoziny vicemene
             is.ViceMene.reflow(); // vyhodnotime, potrebu zobrazovat vice/mene
 
             $(window).off(resize).on(resize, Foundation.util.throttle(is.ViceMene.reflow, 1000)); // vyhodnotime pri zmene okna (kazdu sek.)
             $vice_mene.off(click).on(click, '> .ovladani', function(e) {
                 $(e.delegateTarget).toggleClass('show');
             });
         },
 
         /**
          * Zobrazi ci skryje ovladaci prvky vice_mene u vsech inicializovanych
          * objektu na strance. Nefunguje na skryte objekty, protoze u nich
          * neni mozne spocitat velikost presahu. U takovych je potreba funkci
          * reflow zavolat po zobrazeni uzivateli.
          *
          * 	is.ViceMene.reflow();
          */
         reflow: function() {
             /* pokud nebyl init nehlasime chybu */
             if (!$vice_mene) {
                 return;
             }
 
             $vice_mene.each(function(i, el){
                 var $el		= $(el);
                 var $obsah	= $el.children('.obsah');
                 var has_show	= $el.hasClass('show');
                 $el.removeClass('show');
                 $el.toggleClass('enabled', $obsah.isChildOverflowing($obsah.children('.overflow')));
                 $el.toggleClass('show', has_show);
             });
         },
     };
 }); // konec is.ViceMene
 
 /**
  * Funkce k Foundation pluginu Accordion (v tooliitu 'accordion'), ktere foundation primo nenabizi.
  */
 is.Define.module('Accordion', function(namespace, $){
     var first_init = true;
 
     return {
         /**
          * Inicializuje vsechny Accordiony na strance.
          */
         init: function () {
             if (first_init) {
                 _bind_default_events();
 
                 first_init = false;
             }
         },
     };
 
     function _bind_default_events () {
         $(document)
             .off('.'+namespace)
             // rozbalit/sbalit vse
             .on('click.'+namespace, '.accordion-cover .accordion-sbalit, .accordion-cover .accordion-rozbalit', function () {
                 var $self = $(this);
                 var $accordion = $self.closest('.accordion-cover').find('.accordion');
 
                 _toggle_accordion_all_items_active($accordion, $self.is('.accordion-rozbalit'));
             })
             // zastavi akce 'rozbalit/sbalit vse' pri kliknuti na title polozky accordionu
             .on('mousedown.'+namespace+' keydown.'+namespace, '.accordion-title', function () {
                 $(this).closest('.accordion').off('.all-'+namespace);
             })
             // rozbali obsah, pokud je automaticky nascrollovano na item accordionu
             .on('beforeScrollTop.isHashNavigation.'+namespace, '.accordion-item', function () {
                 var slideSpeed;
                 var $item = $(this);
                 var $accordion = $item.closest('.accordion');
                 var accordion = is.Foundation.get_plugin($accordion, Foundation.Accordion);
                 if (!accordion) {
                     return;
                 }
 
                 slideSpeed = accordion.options.slideSpeed;
                 accordion.options.slideSpeed = 0;
                 $item.closest('.accordion').foundation('down', $item.children('[data-tab-content]'));
                 accordion.options.slideSpeed = slideSpeed;
             })
             // zmeni url pri kliku na title accordionu (vyzaduje nastaveni atributu id u itemu - pozn. staci u item, protoze foundation propisuje z item do title)
             .on('click.'+namespace, '.accordion[data-update-history="true"] .accordion-item.is-active .accordion-title', function (evt) {
                 history.pushState({}, '', '#'+$(this).attr('id'));
             });
     }
 
     // Rozbali (active===true) nebo sbali (active===false) vsechny obsahy.
     // Akci lze prerusit odpojenim udalosti:
     // 	$accordion.off('.all-isAccordion');
     function _toggle_accordion_all_items_active($accordion, active) {
         var action = active ? 'down' : 'up';
         var $items = $accordion.children();
         var $items_active = $items.filter('.is-active');
         var $contents;
         var accordion;
 
         // zastavi aktualne probihajici akce
         $accordion.off('.all-'+namespace);
 
         // rozbalit vse
         if (active) {
             // vybere pouze neaktivni (sbalene)
             $items = $items.not($items_active);
 
             // neni povoleno expandovat vice bunek
             if (!$accordion.data('multiExpand')) {
                 // nejaky obsah je rozbalen, nic nedelej.
                 if ($items_active.length) {
                     return;
                 }
 
                 // rozbal prvni obsah
                 $items = $items.first();
             }
         // sbalit vse
         } else {
             // neni povoleno sbalit uplne vse
             if (!$accordion.data('allowAllClosed')) {
                 // je otevren prave jeden, nic nedelej
                 if ($items_active.length === 1) {
                     return;
                 }
 
                 // sbalim vse krome prvniho rozbaleneho
                 $items = $items_active.filter(':not(:first)');
             } else {
                 // sbali vsechny aktivni
                 $items = $items_active;
             }
         }
 
         // kontrola, jestli je potreba menit stav u nejakeho itemu
         if (!$items.length) {
             return;
         }
 
         // vybere obsahy
         $contents = $items.children('.accordion-content');
 
         // nastavi udalost, ktera po otevreni jednoho, otevre dalsi
         accordion = is.Foundation.get_plugin($accordion, Foundation.Accordion);
         $accordion.on(action+'.zf.accordion.all-'+namespace, _evt_action);
         _evt_action();
 
         function _evt_action () {
             var slide_speed;
             if (accordion) {
                 slide_speed = accordion.options.slideSpeed;
                 accordion.options.slideSpeed = 1;
             }
             $accordion.foundation(action, $contents.first());
             if (accordion) {
                 accordion.options.slideSpeed = slide_speed;
             }
             [].shift.call($contents);
             if (!$contents.length) {
                 $accordion.off(action+'.zf.accordion.all-'+namespace);
             }
         }
     }
 }); // konec is.Accordion
 
 /**
  * Modul slouzi k prevodu zamaskovane adresy na klikatelny odkaz na mail.
  */
 is.Define.module('MailTo', function(namespace, $) {
     return {
         /**
          * Prevede vsechny zakodovane emaily na klikatelny odkaz mailto.
          */
         decode_mail: function () {
             $('nobr').filter('.postovni_adresa').each(function () {
                 var skutecna = this.innerHTML;
                 skutecna = skutecna.replace(/<!--[^-]*?-->/g, '');
                 skutecna = skutecna.replace(/<img[^>]*? src="[^>]*?Z\.gif[^>]*?>/gi, '@');
                 skutecna = skutecna.replace(/<img[^>]*? src="[^>]*?T\.gif[^>]*?>/gi, '.');
                 this.innerHTML = '<a href="mailto:' + skutecna + '">' + skutecna + '</a>';
             });
         },
     };
 }); // konec is.MailTo
 
 is.Define.module('Dropdown', function(namespace, $) {
     return {
         /**
          * Odlozi inicializaci pluginu Dropdown az do okamziku prvniho pouziti.
          * Funguje pouze pokud je dropdown otvevirany pomocou elementu s vyplnenym
          * atributem data-toggle a data-dropdown-deffered.
          *
          * Funguje len na click.
          */
         deferred_init: function() {
             $(document)
                 .off('.'+namespace)
                 .on('click.'+namespace, '[data-dropdown-deferred]', function () {
                 var dropdown_id = $(this).data('toggle');
                 var $dropdown = $('#'+dropdown_id);
 
                 if (!$dropdown.length) {
                     console.error('Nenalezen dropdown objekt.', $dropdown, dropdown_id);
                     return;
                 }
 
                 $dropdown.attr('data-dropdown', '')
                     .foundation()
                     .foundation('open');
 
                 $(this).removeAttr('data-dropdown-deferred');
             });
         },
     };
 }); // konec is.Dropdown
 
 /**
  * Funkce k Foundation pluginu Reveal (v Toolkitu 'modal'), ktere foundation primo nenabizi.
  */
 is.Define.module('Reveal', function(namespace, $) {
     var modals = {};	// seznam id modalnich oken, ktera nejsou inicializovana
     var $close;
 
     var Reveal = {
         /**
          * Odlozi inicializaci pluginu Reveal az do okamziku prvniho pouziti.
          * Funguje pouze pokud je modalni okno otevirano pomoci elementu
          * s vyplnenym atributem data-open.
          *
          * Tato funkcionalita je dostupna pomoci Toolkitiho nastroje 'modal'
          * a prepinace 'odlozit_init'.
          *
          * Priklad:
          *
          * 	is.Reveal.init({
          * 		id: 'prvek_13454',	// id modalniho okna
          * 	});
          */
         init: function (opt) {
             if (!is.Misc.is_valid_id(opt.id)) {
                 console.error('Špatný identifikátor objektu reveal.', opt);
                 return;
             }
 
             // pri prvnim spusteni nastavi udalost pro obsluhu oddalene inicicalizace
             if (!Object.keys(modals).length) {
                 $(document).on('click.'+namespace, '[data-open]', function () {
                     var modal_id = $(this).data('open');
                     var $modal;
 
                     if (!modals[modal_id]) {
                         return;
                     }
 
                     $modal = $('#'+modal_id);
                     if (!$modal.length) {
                         console.error('Nenalezen reveal objekt.', $modal, opt);
                         return;
                     }
 
                     $modal.attr('data-reveal', '')
                         .foundation()
                         .foundation('open');
 
                     modals[modal_id] = false;
                 });
             }
 
             // zaregistruje id modalniho okna
             modals[opt.id] = true;
         },
 
         /**
          * Umozni otevrit modalni okno.
          *
          * 	modal_elm 	- (selector || DOM element || jQuery objekt) urcujici modalni okno
          */
         open: function (modal_elm) {
             var reveal;
             var $modal = $(modal_elm).first();
 
             if (!$modal.length) {
                 console.error('Nenalezen element modalniho okna.', modal_elm);
                 return;
             }
 
             reveal = is.Foundation.get_plugin($modal, Foundation.Reveal);
             if (!reveal) {
                 return;
             }
 
             $modal.foundation('open');
         },
 
         /**
          * Vrati jQuery objekt s tlacitkem pro zavreni modalniho okna
          *
          * 	var $close_button = is.Reveal.get_$close();
          */
         get_$close: function () {
             if (!is.ldb.exists('byl_jste_odhlasen_zavrit')) {
                 console.error('Nebyl nalezen preklad pro aria-label.');
             }
 
             return $close
                 ? $close.clone()
                 : $close = $('<button>')
                     .addClass('close-button')
                     .attr({
                         type		: 'button',
                         'data-close'	: '',
                         'aria-label'	: is('ldb.byl_jste_odhlasen_zavrit'),
                     })
                     .append(
                         $('<span>')
                             .attr({
                                 'aria-hidden'	: 'true',
                             })
                             .html('&times;')
                     );
         },
 
         /**
          * Vytvori modalni okno, vlozi ho do stranky a vrati jQuery objekt nove vytvoreneho modalniho okna.
          *
          * 	var $modal = is.Reveal.create(content, opt);
          *
          * 	var $modal = is.Reveal.create(opt);
          * 	$modal.find('.reveal-content').html(content);		// modalni okno obsahuje strukturu row>column. Obsah se nerovna .reveal ale .reveal-content
          *
          * 	content		cokoli co lze vlozit do $.fn.append
          * 	opt		nastaveni
          * 		class		cokoli co lze vlozit do $.fn.addClass
          * 		attr		cokoli co lze vlozit do $.fn.attr
          * 		data		cokoli co lze vlozit do $.fn.data
          * 		tlacitko_x	[bool] pokud je vyplneno rozhoduje o tom jestli ma v okne byt tlacitko pro zavreni
          * 		open		[bool] po vlozeni do stranky ihned otevre
          * 		odlozit_init	[bool] odlozi init na prvni aktivaci okna pomoci nejakeho elementu s data-open="id_modalniho_okna"
          * 		destroy_after_close	[bool] po zavreni modalu zajisti jeho odstraneni z DOM
          *
          *	// priklad velkeho okna s nejakym obsahem okna
          *	var $modal_large = is.Reveal.create('obsah', {
          *		class: 'large',
          *	});
          *
          *	// priklad okna, ktere nelze zavrit standardne
          *	var $modal = is.Reveal.create('obsah', {
          *		data: {
          *			closeOnClick	: false,	// ekvivalentni k 'close-on-click': false,
          *			closeOnEsc	: false,
          *		},
          *	});
          */
         create: function (content, opt) {
             var id;
             var $modal = $('<div>');
 
             // content je nepovinny argument
             if (arguments.length === 1 && $.isPlainObject(content)) {
                 opt = content;
                 content = undefined;
             } else {
                 opt = opt || {};
             }
 
             // atributy z options
             if (opt.attr) {
                 $modal.attr(opt.attr);
             }
 
             // nanucene povinne atributy
             id = $modal.attr('id') || is.Misc.uniq_id();
             $modal
                 .attr({
                     id	: id,
                     role	: 'region',
                 })
                 .toggleClass('reveal', true);
 
             // data z options
             if (opt.data) {
                 $modal.data(opt.data);
             }
 
             // class z options
             if (opt['class']) {
                 $modal.toggleClass(opt['class'], true);
             }
 
             // default append-to parametr, pokud neni vyplnen
             if (!$modal.data().appendTo) {
                 $modal.data('appendTo', '.foundation-design-z:first');
             }
 
             // zakladni struktura obsahu s jednou urovni row>column kvuli padding a tlacitkem na zavreni
             $modal.html('<div class="row"><div class="column reveal-content"></div></div>');
             if (opt.tlacitko_x || (opt.tlacitko_x == null && ($modal.data().closeOnClick !== false || $modal.data().closeOnEsc !== false))) {
                 $modal.append(Reveal.get_$close());
             }
 
             // Vlozeni obsahu pomoci append, protoze append implicitne presouva obejkt na strance.
             // Presunuti objektu lze predejit vlozenim do obsahu kopie -> is.Reveal.create($content.clone(), { ... });
             if (content) {
                 $modal.find('.reveal-content').append(content);
             }
 
             // odlozit init az na prvni pouziti viz. is.Reveal.init()
             if (!opt.open && opt.odlozit_init) {
                 Reveal.init({
                     id: id,
                 });
             } else {
                 $modal.attr('data-reveal', '');
             }
 
             // vlozi do stranky a pripadne inicializuje
             $('body').append($modal);
             if (opt.open || !opt.odlozit_init) {
                 $modal.foundation();
             }
 
             // zaregistruje udalost ktera zajisti zniceni modalu po jeho zavreni
             if (opt.destroy_after_close) {
                 $modal.on('closed.zf.reveal', function () {
                     var plugin = is.Foundation.get_plugin($modal, Foundation.Reveal);
                     if (!plugin) {
                         return;
                     }
 
                     (function loop () {
                         if (plugin.isActive === false) {
                             plugin.destroy();
                         }
 
                         if (plugin.isActive == null) {
                             $modal.remove();
                             return;
                         }
 
                         setTimeout(loop, 80);
                     }());
                 });
             }
 
             // ihned okno otevre
             if (opt.open) {
                 $modal.foundation('open');
             }
 
             return $modal;
         },
 
         /**
          * Zobrazi modalni okno s prihlasovaci obrazovkou islogin.
          *
          * 	is.Reveal.prihlaseni(callback);
          *
          * 	kde	callback	- funkce ktera se zavola po prihlaseni (pokud je vyplneno, prebije defaultni chovani)
          **/
         prihlaseni: (function () {
             var $modal, $button_login;
 
             return function (callback) {
                 var abort_loop = false;
 
                 $modal = $modal || Reveal.create({
                     attr	: {
                         role: 'alert',
                     },
                     data	: {
                         closeOnClick	: false,
                         closeOnEsc	: false,
                     },
                 })
                 .find('.reveal-content')
                     .append(
                         $('<h2>').html('<i class="isi-info"></i>' + (is('ldb.byl_jste_odhlasen') || '')),
 
                         $('<div>', {
                             'class': 'align-right button-group',
                         }).append(
                             $('<button>', {
                                 'class'		: 'secondary button',
                                 type		: 'button',
                                 'data-close'	: '',
                             }).text(is('ldb.byl_jste_odhlasen_zavrit')),
 
                             $button_login = $('<a>', {
                                 'class'	: 'button',
                             }).html('<i class="isi-postava isi-inline-right"></i>' + (is('ldb.byl_jste_odhlasen_prihlasit') || ''))
                         )
                     ).end();
 
                 $modal.foundation('close');
                 $modal.one('closed.zf.reveal.'+namespace, function () {
                     abort_loop = true;
                 });
 
                 // overuje zda je jiz uzivatel prihlasen (max 20x po 2s = 40s)
                 function start_ping_loop () {
                     var available_iteration = 20;
                     (function loop () {
                         if (abort_loop || !available_iteration) {
                             abort_loop = true;
                             return;
                         }
 
                         --available_iteration;
                         is.Ajax.ping({
                                 timeout: 2000,
                             })
                             .done(function () {
                                 abort_loop = true;
                                 $modal.foundation('close');
                                 callback($modal);
                             })
                             .fail(function (jqXHR, text_status) {
                                 if (!abort_loop) {
                                     setTimeout(loop, 2000);
                                 }
                             });
                     }());
                 }
 
                 // nastavi udalost pro tlacitko prihlaseni
                 $button_login.off('.'+namespace);
                 if ($.isFunction(callback)) {
                     // programator definoval callback funkci
                     // nabidne se islogin pomoci window.open nebo target _blank
                     $button_login
                         .attr({
                             href	: location.origin + is.session.auth,
                             target	: '_blank',
                         })
                         .on('click.'+namespace, function (evt) {
                             var new_window = window.open(
                                 '/auth/prihlasen' + (is('session.ekurz') ? '?ekurzy' : ''),
                                 'ISLogin',
                                 'menubar=0,toolbar=0,width=575,height=375'
                                     + ',left=' + Math.max(0, Math.floor((window.screen.availWidth - 575) / 2))
                                     + ',top=' + Math.max(0, Math.floor((window.screen.availHeight - 375) / 2))
                             );
 
                             if (new_window == null) {
                                 // otevre se islogin v novem tabu target=_blank
                                 // zacne overovat prihlaseni v puvodnim tabu po dobu 40s
                                 start_ping_loop();
                             } else {
                                 // zabrani otevreni noveho panelu prohlizece s titulkou
                                 evt.preventDefault();
                                 // zjistuje jestli je uzivatel v novem okne jiz prihlasen
                                 (function loop () {
                                     var body, $mark;
 
                                     try {
                                         body = (new_window.document || {}).body;
                                         $mark = body && $(body).find('.lc8zOpUtCNwT8iaN7Wcm17oq');
                                     } catch (e) {}
 
                                     if ($mark && $mark.length) {
                                         // uzivatel je prihlasen, zavre se okno
                                         // a na puvodni strance se overi prihlaseni a vyvola puvodni callback
                                         new_window.close();
                                         start_ping_loop();
                                     } else if (!abort_loop) {
                                         setTimeout(loop, 200);
                                     }
                                 }());
                             }
                         });
                 } else {
                     // reloadne stranku coz automaticky presmeruje na islogin
                     $button_login
                         .removeAttr('target')
                         .attr({
                             href	: location.href.replace(/#.*$/, ''),
                         });
                 }
 
                 $modal.foundation('open');
 
                 return $modal;
             };
         }()),
     };
 
     return Reveal;
 }); // konec is.Reveal
 
 /**
  * Funkce k Foundation pluginu Orbit (v Toolkitu 'slides'), ktere foundation primo nenabizi.
  */
 is.Define.module('Orbit', function (namespace, $) {
     return {
 
         /**
          * Nastavi v objektu Orbit prislusny slide jako aktivni:
          *
          * 	is.Orbit.set_slide($orbit, slide);
          *
          * 		$orbit	- jeden div.orbit (selector nebo jQuery objekt)
          * 		slides	- index slajdu, nebo selector (jQuery objekt) na prislusny slide
          *
          * 	Zpusob s indexem:
          *
          * 		is.Orbit.set_slide($orbit, 3);	// index zacina od nuly
          *
          * 	Zpusob s jquery objektem:
          *
          * 		is.Orbit.set_slide($orbit, $slide);
          *
          */
         set_slide: function ($orbit, slide) {
             var orbit, $slide, index_actual, index_new;
 
             orbit = is.Foundation.get_plugin($orbit, Foundation.Orbit);
             if (!orbit) {
                 return;
             }
 
             if (/^\d+$/.test(slide)) {
                 // slide je prirozene cislo -> dohledam podle indexu
                 $slide = orbit.$slides.eq(slide);
 
                 if (!$slide.length) {
                     console.error('Nenalezen slide podle indexu (prvni slide ma index 0):', slide, $slide, $orbit);
                     return;
                 }
             } else {
                 // pouziju slide jako selector
                 $slide = orbit.$slides.filter(slide);
 
                 if ($slide.length !== 1) {
                     console.error('Slide musí být právě jeden objekt:', $slide.length, slide, $slide, $orbit);
                     return;
                 }
             }
 
             index_new = _get_slide_index(orbit, $slide);
             index_actual = _get_slide_index(orbit, _get_active_$slide(orbit));
 
             // slide je jiz aktivni, neni potreba nic menit
             if (index_new === index_actual) {
                 return;
             }
 
             orbit.changeSlide(index_new > index_actual, $slide, index_new);
         },
 
         /**
          * Zobrazuje strankovani v predanem elementu.
          *
          * 	is.Orbit.init_pagination($orbit, $target);
          */
         init_pagination: function ($orbit, $target) {
             var orbit, $pagination;
 
             orbit = is.Foundation.get_plugin($orbit, Foundation.Orbit);
             if (!orbit) {
                 return;
             }
 
             $target = $($target);
             if (!$target.length) {
                 console.error('Nenalezen objekt pro umisteni strankovani:', $orbit, $target);
                 return;
             }
 
             $target.text(_get_pagination(orbit));
 
             orbit.$element
                 .off('slidechange.zf.orbit.pagination.'+namespace)
                 .on('slidechange.zf.orbit.pagination.'+namespace, function () {
                     $target.text(_get_pagination(orbit));
                 });
         },
 
         /**
          * Nastavi focus, aby fungovalo ovladani pres klavesnici
          */
         focus: function ($orbit) {
             var orbit = is.Foundation.get_plugin($orbit, Foundation.Orbit);
             if (!orbit) {
                 return;
             }
 
             orbit.$wrapper.trigger('focus');
         },
 
     };
 
     // ocekava instanci Foundation.Orbit
     // vraci jQuery objekt aktivniho slide
     function _get_active_$slide (orbit) {
         return orbit.$slides.filter('.is-active');
     }
 
     // ocekava instanci Foundation.Orbit a jQuery objekt slide
     // vraci index (pocitano od nuly) daneho slide
     function _get_slide_index (orbit, $slide) {
         return $slide.data('slide') || orbit.$slides.index($slide);
     }
 
     // ocekava instanci Foundation.Orbit
     // vraci naformatovany text strankovani
     function _get_pagination (orbit) {
         var page = 1 + (_get_slide_index(orbit, _get_active_$slide(orbit)));
 
         return page + ' / ' + orbit.$slides.length;
     }
 }); // konec is.Orbit
 
 /*
  * Modul pre zobrazenie vizitky osoby (onhover).
  *
  * Pre pouzitie staci na lub. element pridat atribut data-vizitka="uco".
  * */
 is.Define.module('Vizitka', function (namespace, $) {
 
     var timer, last_request, tooltip, cache = {}, use_unver_data, shown = false;
 
     return {
         init: function() {
             $(document).on('click.'+namespace+' touch.'+namespace, function() { // schovani vsude
                 if (shown) {
                     cleanup();
                 }
             }).on('click.'+namespace+' touch.'+namespace, '[data-whatintent=touch] [data-vizitka]', function(evt) { // otevreni na touch
                 evt.preventDefault();
                 evt.stopImmediatePropagation();
 
                 var should_init =	!tooltip
                             || tooltip.$element[0] != evt.currentTarget
                             || (tooltip.$element[0] == evt.currentTarget && ( !tooltip.template.is(':visible')
                             || tooltip.template.css('opacity') == 0));
                 cleanup();
                 if (should_init) {
                     init(evt);
                 }
             });
 
             $(document).on('mouseenter.'+namespace, '[data-whatintent=mouse] [data-vizitka]', function(evt) { // otevreni mysi
                 timer = setTimeout(function() {
                     cleanup();
                     init(evt);
                 }, 350);
             });
 
             $(document).on('mouseleave.'+namespace, '[data-whatintent=mouse] [data-vizitka]', cleanup); // schovani mysi
         },
     };
 
     /* zobrazi vizitku */
     function init(evt) {
         var people_id		= $(evt.currentTarget).data('vizitka');
         var v_datum		= $(evt.currentTarget).data('vizitka-datum');
         var v_datum_format	= $(evt.currentTarget).data('vizitka-datum-format');
         var $anchor		= $(evt.currentTarget).addClass('top');
 
         tooltip	= new Foundation.Tooltip($anchor, {
             allowHtml:		true,
             clickOpen:		false,
             disableHover:		true,
             templateClasses:	'vizitka',
             triggerClass:		'',
         });
 
         if (cache.hasOwnProperty(people_id)) { // mame v cache
 
             if (cache[ people_id ] == '') {
                 return;
             }
 
             tooltip.template.html( cache[ people_id ] );
 
             if ($.contains(document, $anchor[0])) { // zobraz, len ak je anchor v DOMe
                 shown = true;
                 tooltip._setPosition();
                 tooltip.show();
             }
 
         } else { // nemame v cache => dotahnem
             last_request = is.Ajax.request({
                 shouldRetry:	0,
                 url:		'/auth/design_ajax',
                 no_fail_msg:	1,
                 loading: {
                     delay:	0,
                     parent:	tooltip.template,
                 },
                 data:		{
                     operace:	'vizitka',
                     people_id:	people_id,
                     v_datum:	v_datum,
                     v_datum_format: v_datum_format,
                     use_unver_data:	is('session.pouzit_neoverene_udaje'),
                 },
             }).always(function(){
                 last_request = null;
             }).done(function(data) {
                 if (data) { // ochrana proti divne chybe vo Firefoxe
                     cache[ people_id ] = data.html;
 
                     if (cache[ people_id ] == '') {
                         return;
                     }
 
                     if (tooltip) {
                         tooltip.template.html( data.html );
                         if ($.contains(document, $anchor[0])) { // zobraz, len ak je anchor v DOMe
                             tooltip._setPosition();
                             tooltip.show();
                             shown = true;
                         }
                     }
                 }
             }).fail(cleanup);
         }
     }
 
     /* schova vizitku a uprace */
     function cleanup() {
 
         if (last_request) {
             last_request.abort();
         }
 
         if (timer) {
             clearTimeout(timer);
             timer = null;
         }
 
         if (tooltip) {
             var $anchor = tooltip.$element;
             tooltip.hide();
             if (tooltip.$element.data('zfPlugin')) {
                 tooltip.destroy();
             }
             $anchor.removeClass('top').attr('title', '');
             tooltip = null;
         }
         shown = false;
     }
 
 }); // konec is.Vizitka
 
 is.Define.module('IsTip', function (namespace, $) {
 
     var ajax = new is.Ajax('/auth/design_ajax');
     var init = true;
 
     return {
         init: function() {
 
             if (!init) { // init once
                 return;
             }
             init = false;
 
             $(document).on('click', '#is_tip .dalsi', function(evt) {
                 var poradi = $(evt.currentTarget).data('poradi');
                 $('.is_tip_modal').remove();
 
                 ajax.request({
                     operace:	'dalsi_tip',
                     poradi:		poradi,
                 }).done(function(data){
                     $('#is_tip').replaceWith(data.html);
                 });
             });
 
             $(document).on('click', '#is_tip .close', function(evt) {
                 $('.is_tip_modal').remove();
                 ajax.request({
                     operace:	'odlozit_tipy_na_jindy',
                 }).done(function(data){
                     $('#is_tip').replaceWith(data.html);
                 });
             });
 
             $(document).on('open.zf.reveal', '.is_tip_modal', function(evt) {
                 ajax.request({
                     operace:	'precist_tip',
                     tip_id:		$(evt.currentTarget).data('tip_id'),
                 });
             });
             $(document).on('click', '.is_tip_precist', function(evt) {
                 ajax.request({
                     operace:	'precist_tip',
                     tip_id:		$(evt.currentTarget).data('tip_id'),
                 });
             });
 /*
             $(document).on('click', '#is_tip .button_odkaz, .is_maly_tip .button_odkaz', function(evt) {
                 ajax.request({
                     operace:	'precist_tip',
                     tip_id:		$(evt.currentTarget).data('tip_id'),
                 }).done(function() {
                     window.location.assign( $(evt.currentTarget).attr('href') );
                 });
 
                 return false;
             });
 */
             $(document).on('click', '.is_tip_modal[data-tip_id=pripinacek] .tryit', function() {
                 $(this).closest('.is_tip_modal').foundation('close');
                 is.NavMenu.edit();
             });
 
             $(document).on('click', '.is_tip_modal[data-tip_id=moje_menu] .tryit', function() {
                                 $(this).closest('.is_tip_modal').foundation('close');
                                 is.NavMenu.edit();
                         });
 
             $(document).on('click', '.is_tip_modal[data-tip_id=vyhledavani] .tryit', function() {
                 $(this).closest('.is_tip_modal').foundation('close');
 
                 if ($('#vyhledavani_form').length) {
                     $('#vyhledavani_form input[type=text]:first').focus();
                 } else {
                     $('#sticky_panel .prepinac-vyhl').trigger('click');
                 }
             });
         },
     };
 });
 
 /**
  * Modul pre posun a zoom pozadia elementu.
  *
  * Inicializacia pomocou triedy, init metody alebo jQuery pluginu.
  *
  * Pre spravnu funkcnost je treba zaistit, aby element s pozadim
  * mal pevny pomer stran. Na to je mozne vyuzit triedy napr.
  * .aspect_ratio.r_2_1 (pomer stran 2:1) alebo
  * .aspect_ratio.r_16_9 (16:9)
  *
  * Vysledne nastavenie pozadiea je moze ziskat pomocou metody background().
  */
 is.Define.class('BackgroundSlider', function(namespace, $) {
 
     function BackgroundSlider(element, params) {
 
         params			= params || {};
         var self		= this;
 
         self.$element		= $(element).first();
 
         if (!self.$element.length) {
             throw "Chyba - is.BackgroundSlider: $element.length == 0!";
         }
 
         self.zoom		= null;
         self.zoom_step		= params.zoom_step || 10;
         self.namespace		= '.' + namespace + '.' + is.Misc.uniq_id();
 
         self._init();
         self._bind_events();
     }
 
     $.fn.backgroundSlider = function(param) {
         var $self = this;
 
         if (!$self.length) {
             return $self;
         }
 
         if (arguments.length === 0 || $.type(param) === 'object') {
             $self.each(function () {
                 var instance = new is.BackgroundSlider(this, param);
                 $(this).data(namespace, instance);
             });
         } else {
             var instance = $self.data(namespace);
 
             if (!instance) {
                 return undefined;
             }
 
             return instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
         }
 
         return $self;
     };
 
     BackgroundSlider.init = function(element) {
         $(element).backgroundSlider();
     }
 
     BackgroundSlider.prototype = {
         _init: function() {
             var self = this;
 
             if (self.initialized || self.initializing) {
                 return self.initialized;
             }
 
             var url = self.$element.css('background-image')
                 .replace(/url\((['"])?(.*?)\1\)/gi, '$2')
                 .split(',')[0]
                 .trim()
                 ;
 
             if (!url) {
                 return false;
             }
 
             var image = new Image();
             image.onload = function() {
                 self.image = image;
                 self.initialized	= true;
                 self.initializing	= false;
                 self._recalculate();
             };
             image.onerror = function() {
                 self.initializing	= false;
             };
             self.initializing	= true;
             image.src		= url;
 
             self.$element.addClass('background_slider');
 
             self.$element
                 .append('<a class="zoom_out" title="' + is('ldb.bs_zoom_out') + '"><i class="isi-inline isi-zoom-out" aria-hidden="true"></i><span class="show-for-sr">' + is('ldb.bs_zoom_out') + '</span></a>')
                 .append('<a class="zoom_in" title="' + is('ldb.bs_zoom_in') + '"><i class="isi-inline isi-zoom-in" aria-hidden="true"></i><span class="show-for-sr">' + is('ldb.bs_zoom_in') + '</span></a>')
                 ;
 
             return self.initialized;
         },
         _recalculate: function() {
 
             var self	= this;
 
             if (!self.initialized) {
                 return;
             }
 
             self.element	= {
                 width:	self.$element.width(),
                 height:	self.$element.height(),
             };
 
             var cover_ratio	= Math.max(self.element.width / self.image.width, self.element.height / self.image.height);
             self.cover	= {
                 width:	self.image.width  * cover_ratio,
                 height:	self.image.height * cover_ratio,
             };
 
             if (self.zoom == null) {
                 var background_width	= parseFloat(self.$element.css('background-size'));
                 if (!isNaN(background_width)) {
                     self.zoom = (
                         (background_width / (
                             (self.cover.width / self.element.width) * 100
                         )) - 1
                     ) * 100;
                 } else {
                     self.zoom = 0;
                 }
             }
 
             self.real	= {
                 width:	self.cover.width * (1 + self.zoom/100),
                 height:	self.cover.height * (1 + self.zoom/100),
             };
 
             self.real.widthp	= (self.real.width / self.element.width) * 100;
             self.real.heightp	= (self.real.height / self.element.height) * 100;
 
             self.$element.css('background-size', self.real.widthp + '% ' + self.real.heightp + '%');
 
             self.position = {
                 xp: (parseFloat(self.$element.css('background-position').split(' ')[0]) || 0),
                 yp: (parseFloat(self.$element.css('background-position').split(' ')[1]) || 0),
             };
         },
         _bind_events: function() {
 
             var self	= this;
             var moving	= false;
 
             self.$element.on('mousedown' + self.namespace, function(evt, data) {
                 evt.preventDefault();
 
                 if (!self._init()) {
                     return;
                 }
 
                 if (evt.which !== 1) {
                     stop_mousemove();
                     return;
                 }
 
                 var mousedown	= {
                     x: evt.pageX,
                     y: evt.pageY,
                 };
 
                 var delta_w	= Math.abs(self.real.width - self.element.width);
                 var delta_h	= Math.abs(self.real.height - self.element.height);
                 var base_pos_xp	= self.position.xp;
                 var base_pos_yp = self.position.yp;
 
                 $(document).on('mousemove' + self.namespace, function(e) {
 
                     var change_x	= e.pageX - mousedown.x;
                     var change_y	= e.pageY - mousedown.y;
 
                     self.position.xp = Math.max(0, Math.min(100, base_pos_xp - (100 / (delta_w || 100)) * change_x));
                     self.position.yp = Math.max(0, Math.min(100, base_pos_yp - (100 / (delta_h || 100)) * change_y));
 
                     self.$element.css('background-position', self.position.xp + '% ' + self.position.yp + '%');
 
                     self.$element.trigger('change.' + namespace);
                 });
                 moving	= true;
             });
 
             $(document).on('mouseup' + self.namespace, function(evt) {
                 if (!self._init()) {
                     return;
                 }
                 stop_mousemove();
             });
 
             function stop_mousemove() {
                 if (moving) {
                     $(document).off('mousemove' + self.namespace);
                     moving	= false;
                 }
             }
 
             self.$element.on('touchstart' + self.namespace, function(evt, data) {
 
                 if ( !$(evt.target).is( self.$element )) {
                     return;
                 }
 
                 if (evt.originalEvent.touches.length != 1) {
                     return;
                 }
 
                 if (!self._init()) {
                     return;
                 }
 
                 var touchstart	= {
                     x: evt.originalEvent.touches[0].pageX,
                     y: evt.originalEvent.touches[0].pageY,
                 };
 
                 var delta_w	= Math.abs(self.real.width - self.element.width);
                 var delta_h	= Math.abs(self.real.height - self.element.height);
                 var base_pos_xp	= self.position.xp;
                 var base_pos_yp = self.position.yp;
 
                 $(document).on('touchmove' + self.namespace, function(e) {
 
                     var change_x	= e.originalEvent.touches[0].pageX - touchstart.x;
                     var change_y	= e.originalEvent.touches[0].pageY - touchstart.y;
                     e.preventDefault();
 
                     self.position.xp = Math.max(0, Math.min(100, base_pos_xp - (100 / (delta_w || 100)) * change_x));
                     self.position.yp = Math.max(0, Math.min(100, base_pos_yp - (100 / (delta_h || 100)) * change_y));
 
                     self.$element.css('background-position', self.position.xp + '% ' + self.position.yp + '%');
                     self.$element.trigger('change.' + namespace);
                 });
                 moving	= true;
             });
 
             self.$element.on('touchend' + self.namespace, function(evt) {
 
                 if ( !$(evt.target).is( self.$element ) ) {
                     return;
                 }
 
                 evt.preventDefault();
 
                 if (!self._init()) {
                     return;
                 }
 
                 if (moving) {
                     $(document).off('touchmove' + self.namespace);
                     moving	= false;
                 }
             });
 
             function zoom(direction, zoom_aim_x, zoom_aim_y) {
 
                 if (!self._init()) {
                     return;
                 }
 
                 var zoom_old	= self.zoom;
 
                 zoom_aim_x	= zoom_aim_x || (self.element.width / 2);
                 zoom_aim_y	= zoom_aim_y || (self.element.height / 2);
 
                 self.zoom = Math.max(0, Math.min( 1000, self.zoom + self.zoom_step * direction ));
                 self.zoom = Math.round(self.zoom);
 
                 self._recalculate();
 
                 var real_w_old	= self.cover.width * (1 + ((self.zoom + Math.abs(self.zoom - zoom_old) * direction * -1)/100));
                 var real_h_old	= self.cover.height * (1 + ((self.zoom + Math.abs(self.zoom - zoom_old) * direction * -1)/100));
                 var delta_x	= (self.real.width- self.cover.width) + (self.cover.width - self.element.width);
                 var delta_x_old	= (real_w_old - self.cover.width) + (self.cover.width - self.element.width);
                 var delta_y	= (self.real.height - self.cover.height) + (self.cover.height - self.element.height);
                 var delta_y_old	= (real_h_old - self.cover.height) + (self.cover.height - self.element.height);
 
                 var fixed_x_old	= (delta_x_old * (self.position.xp/100) + zoom_aim_x);
                 var fixed_y_old = (delta_y_old * (self.position.yp/100) + zoom_aim_y);
 
                 var fixed_x	= self.real.width * (fixed_x_old/real_w_old);
                 var fixed_y	= self.real.height * (fixed_y_old/real_h_old);
 
                 var x		= ((fixed_x - zoom_aim_x) / delta_x) * 100;
                 var y		= ((fixed_y - zoom_aim_y) / delta_y) * 100;
 
                 if (self.zoom === 0) {
                     self.position.xp = 50;
                     self.position.yp = 50;
                 } else {
                     self.position.xp = Math.max(0, Math.min(100, x));
                     self.position.yp = Math.max(0, Math.min(100, y));
                 }
 
                 self.$element.css('background-position', self.position.xp + '% ' + self.position.yp + '%');
                 self.$element.trigger('change.' + namespace);
             };
 
             self.$element.children('.zoom_in, .zoom_out').on('click', function(evt) {
                 zoom( $(this).hasClass('zoom_in') ? 1 : -1 );
             });
 
             self.$element.on('wheel' + self.namespace, function(evt) {
 
                 evt.preventDefault();
 
                 if ( !$(evt.target).is( self.$element ) ) {
                     return;
                 }
 
                 var direction	= evt.originalEvent.deltaY > 1 ? -1 : 1;
                 zoom(direction, evt.originalEvent.offsetX, evt.originalEvent.offsetY);
             });
 
             self.$element.on('zoomin' + self.namespace, function(evt) {
                 zoom(1);
             });
             self.$element.on('zoomout' + self.namespace, function(evt) {
                 zoom(-1);
             });
 /*
             self.$element.on('wheel' + self.namespace, function(evt) {
                 evt.preventDefault();
 
                 if (!self._init()) {
                     return;
                 }
 
                 var zoom_old	= self.zoom;
                 var direction	= evt.originalEvent.deltaY > 1 ? -1 : 1;
 
                 self.zoom = Math.max(0, Math.min( 1000, self.zoom + self.zoom_step * direction ));
                 self.zoom = Math.round(self.zoom);
 
                 self._recalculate();
 
                 var real_w_old	= self.cover.width * (1 + ((self.zoom + Math.abs(self.zoom - zoom_old) * direction * -1)/100));
                 var real_h_old	= self.cover.height * (1 + ((self.zoom + Math.abs(self.zoom - zoom_old) * direction * -1)/100));
                 var delta_x	= (self.real.width- self.cover.width) + (self.cover.width - self.element.width);
                 var delta_x_old	= (real_w_old - self.cover.width) + (self.cover.width - self.element.width);
                 var delta_y	= (self.real.height - self.cover.height) + (self.cover.height - self.element.height);
                 var delta_y_old	= (real_h_old - self.cover.height) + (self.cover.height - self.element.height);
 
                 var fixed_x_old	= (delta_x_old * (self.position.xp/100) + evt.originalEvent.offsetX);
                 var fixed_y_old = (delta_y_old * (self.position.yp/100) + evt.originalEvent.offsetY);
 
                 var fixed_x	= self.real.width * (fixed_x_old/real_w_old);
                 var fixed_y	= self.real.height * (fixed_y_old/real_h_old);
 
                 var x		= ((fixed_x - evt.originalEvent.offsetX) / delta_x) * 100;
                 var y		= ((fixed_y - evt.originalEvent.offsetY) / delta_y) * 100;
 
                 if (self.zoom === 0) {
                     self.position.xp = 50;
                     self.position.yp = 50;
                 } else {
                     self.position.xp = Math.max(0, Math.min(100, x));
                     self.position.yp = Math.max(0, Math.min(100, y));
                 }
 
                 self.$element.css('background-position', self.position.xp + '% ' + self.position.yp + '%');
                 self.$element.trigger('change.' + namespace);
             });
 */
         },
         background: function() {
             var self = this;
 
             if (!self._init()) {
                 return '';
             }
 
             var	image		= self.$element[0].style.backgroundImage,
                 size		= self.$element.css('background-size'),
                 position	= self.$element.css('background-position');
 
             var position_size = [position, size].filter(function(e) { return !!e; }).join('/');
 
             return [image, position_size].filter(function(e) { return !!e; }).join(' ');
         },
         destroy: function() {
             var self = this;
             $(document).off('mousemove'	+ self.namespace)
                    .off('touchmove'	+ self.namespace)
                    .off('mouseup'	+ self.namespace)
                    ;
 
             self.$element	.off('mousedown'	+ self.namespace)
                     .off('touchstart'	+ self.namespace)
                     .off('touchend'		+ self.namespace)
                     .off('wheel'		+ self.namespace)
                     .removeClass('background_slider')
                     .children('.zoom_in, .zoom_out').remove()
                     ;
 
             if (self.initialized) {
                 self.$element.removeData(namespace);
             }
         },
     }
 
     return BackgroundSlider;
 
 }); // konec is.BackgroundSlider
 
 
 }(is, (window.jQueryF || jQuery), window)); /* koniec definicie modulov a tried is */
 
 /*! jQuery.ajaxRetry v0.1.3 | (c) 2013 Daniel Herman | opensource.org/licenses/MIT | https://github.com/dcherman/jQuery.ajaxRetry */
 !function(a){"use strict";function b(a){return a.state?"pending"!==a.state():a.isResolved()||a.isRejected()}var c="__RETRY__"+(new Date).getTime();a.ajaxPrefilter(function(d,e,f){if(!d[c]&&"undefined"!=typeof d.shouldRetry){e[c]=!0;var g,h,i=a.Deferred(),j=a.Deferred(),k={},l=0,m=function(b,c,e){var f,g=d.shouldRetry,h=typeof g;switch(h){case"number":f=g>c;break;case"boolean":f=g;break;case"function":f=g(b,c,e)}return"object"==typeof f&&"function"==typeof f.then?a.Deferred(function(a){f.then(a.resolve,function(){a.resolve(!1)})}).promise():a.when(f)};g=a.extend({},e,{success:a.noop,error:a.noop,complete:a.noop,statusCode:{}}),function n(b,c,d){(c?m(c,l++,b.type||"GET"):a.when(!0)).done(function(e){e===!0?(c?a.ajax(b):f).then(function(a,b,c){h=c.status,i.resolveWith(this,arguments),i.done(k[h]),j.resolveWith(this,[c,b])},function(a,c){var d=arguments,e=this;n(b,a,function(){h=a.status,i.rejectWith(e,d),i.fail(k[h]),j.resolveWith(e,[a,c])})}):d()})}(g),f.complete&&(f.complete=j.done,f.success=i.done,f.error=i.fail),a.extend(f,i.promise()),f.statusCode=function(a){var c;if(a)if(b(i))i.then(a[h],a[h]);else for(c in a)k[c]=[k[c],a[c]];return this}}})}(window.jQueryF || jQuery);
 
 /* Nanobar - https://github.com/jacoborus/nanobar */
 (function(root){"use strict";var css=".nanobar{width:100%;height:3px;z-index:9999;top:0}.bar{width:0;height:100%;transition:height .3s;background:var(--barva1)}";function addCss(){var s=document.getElementById("nanobarcss");if(s===null){s=document.createElement("style");s.type="text/css";s.id="nanobarcss";document.head.insertBefore(s,document.head.firstChild);if(!s.styleSheet)return s.appendChild(document.createTextNode(css));s.styleSheet.cssText=css}}function addClass(el,cls){if(el.classList)el.classList.add(cls);else el.className+=" "+cls}function createBar(rm){var el=document.createElement("div"),width=0,here=0,on=0,bar={el:el,go:go};addClass(el,"bar");function move(){var dist=width-here;if(dist<.1&&dist>-.1){place(here);on=0;if(width>=100){el.style.height=0;setTimeout(function(){rm(el)},300)}}else{place(width-dist/4);setTimeout(go,16)}}function place(num){width=num;el.style.width=width+"%"}function go(num){if(num>=0){here=num;if(!on){on=1;move()}}else if(on){move()}}return bar}function Nanobar(opts){opts=opts||{};var el=document.createElement("div"),applyGo,nanobar={el:el,go:function(p){applyGo(p);if(p>=100){init()}}};function rm(child){el.removeChild(child)}function init(){var bar=createBar(rm);el.appendChild(bar.el);applyGo=bar.go}addCss();addClass(el,"nanobar");if(opts.id)el.id=opts.id;if(opts.classname)addClass(el,opts.classname);if(opts.target){el.style.position="relative";opts.target.insertBefore(el,opts.target.firstChild)}else{el.style.position="fixed";document.getElementsByTagName("body")[0].appendChild(el)}init();return nanobar}if(typeof exports==="object"){module.exports=Nanobar}else if(typeof define==="function"&&define.amd){define([],function(){return Nanobar})}else{root.Nanobar=Nanobar}})(this);
 
 /*
  * Zde vlastni jQuery pluginy, vizte https://learn.jquery.com/plugins/basic-plugin-creation/
  *
  * Funkce, ktere lze retezit musi obsahovat return this!
  * */
 (function($){
 
     /**
      * Zjisti jesti 'child' svoji velikosti presahuje pres prostor,
      * ktery zabira '$element', na kterem je metoda volana.
      *
      * 	if ($element.isChildOverflowing(child)) {
      *		// child presahuje prostor prvku $element
      * 	}
      *
      * return [Boolean] => nelze retezit s dalsimi metodami
      *
      */
     $.fn.isChildOverflowing = function (child) {
 
         var p = this.get(0);
         var el = $(child).get(0);
 
         return (
             el.offsetTop < p.offsetTop
             || el.offsetLeft < p.offsetLeft
         ) || (
             el.offsetTop + el.offsetHeight > p.offsetTop + p.offsetHeight
             || el.offsetLeft + el.offsetWidth > p.offsetLeft + p.offsetWidth
         );
     };
 
     /**
      * Omezi seznam elementu v jQuery objektu na ty,
      * ktere maji zobrazene scrollbary pri nastaveni 'overflow: auto'.
      */
     $.fn.overflown = function () {
         return this.filter(function () {
             return this.scrollHeight > this.clientHeight
                 || this.scrollWidth > this.clientWidth;
         });
     };
 
     /**
      * reduce jquery object
      *
      *	if ($(elm).hasEvent(event, ).length) { ... }
      *	if ($(elm).hasNotEvent(event, ).length) { ... }
      *
      *	- event can be with or without namespace ('event' or 'event.namespace')
      *	- check only one event ('event' can be, but 'event1 event2' can't)
      */
     (function($) {
         // TODO odstranit pokud bude dataPriv oficialne pridano do jQuery
         var dataPriv = $._data || $.dataPriv;
 
         if (!dataPriv) {
             throw 'jQuery removed $._data or $.dataPriv method.';
         }
 
         $.fn.hasEvent = function (name) {
             return this.filter(function () {
                 return !!_getEventList(this, name)
                     || _isDelegateEvent(this, name, $(this).parent());
             });
         };
 
         $.fn.hasNotEvent = function (name) {
             return this.filter(function () {
                 return !_getEventList(this, name)
                     && !_isDelegateEvent(this, name, $(this).parent());
             });
         };
 
         function _isDelegateEvent(elm, name, $parent) {
             var eventList, i, l, $foundElm;
 
             if (!$parent.length) {
                 return false;
             }
 
             eventList = _getEventList($parent[0], name);
 
             if (eventList) {
                 l = eventList.length;
                 for (i = 0; i < l; ++i) {
                     $foundElm = $parent
                             .find(eventList[i].selector)
                                 .filter(function () {
                                     return elm === this;
                                 });
 
                     if ($foundElm.length) {
                         return true;
                     }
                 }
             }
 
             return _isDelegateEvent(elm, name, $parent.parent());
         }
 
         function _getEventList (elm, name) {
             var ei, el, ni, nl, type, events, eventList,
                 namespaces, result, found_all, event_namespaces;
 
             events = dataPriv(elm, 'events');
 
             if (!events) {
                 return undefined;
             }
 
             type = name.split('.', 1)[0];
             eventList = events[type];
 
             if (!eventList) {
                 return undefined;
             }
 
             // without namespaces
             if (name === type) {
                 return eventList;
             }
 
             // with namespaces
             namespaces = name.substr(type.length + 1);
 
             if (namespaces === '') {
                 return undefined;
             }
 
             namespaces = namespaces.split('.');
             nl = namespaces.length;
             el = eventList.length;
             result = [];
             for (ei = 0; ei < el; ++ei) {
                 found_all = true;
                 event_namespaces = '.'+eventList[ei].namespace+'.';
 
                 // overi jestli vsechny hledane namespace jsou nalezeny v ulozene udalosti
                 // (ulozena udalost muze obsahovat nektere namespace navic oproti zjistovane udalosti)
                 for (ni = 0; ni < nl; ++ni) {
                     if (event_namespaces.indexOf('.'+namespaces[ni]+'.') < 0) {
                         found_all = false;
                         break;
                     }
                 }
 
                 if (found_all) {
                     result.push(eventList[ei]);
                 }
             }
 
             return result.length ? result : undefined;
         }
     }($));
 
     /**
      * Ulozi ke vsem elementum vyserializovany string.
      *
      * 	$('form').storeSerialize();
      */
     $.fn.storeSerialize = function () {
         return this.each(function () {
             var $self = $(this);
 
             $self.data('storedSerialize',
                 $.param($self.serializeArray(), true)
             );
         });
     };
 
     /**
      * Zachova v objektu jen ty elementy, ktere byly zmeneny
      * od posledniho volani metody $.fn.checkSerialize.
      *
      * 	if($('form').hasSerializeChanged().length) {
      *		// nektery z formularu z $('form') byl od posledne zmenen
      * 	}
      *
      * Pokud je metoda zavolana pred $.fn.checkSerialize zahlasi error.
      */
     $.fn.hasSerializeChanged = function () {
         return this.filter(function () {
             var $self = $(this);
             var stored = $self.data('storedSerialize');
 
             if (stored == null) {
                 console.error('Pred volanim metody $.fn.hasSerializeChanged je nutne alespon jednou zavolat metodu $.fn.storeSerialize.', this);
                 return false;
             }
 
             return stored !== $.param($self.serializeArray(), true);
         });
     };
 
     /**
      * Stejne jak jQuery.html(), ale navyse zavola inicializaci foundationu nad vkladanym html.
      */
     $.fn.fhtml = function(param){
         if (arguments.length > 0) {
             return this.html(param).foundation();
         } else {
             return this.html();
         }
     };
 
     /**
      * Zaregistruje udalosti drag na elementu a nastavím draggable u targetu
      *
      *	$('#div_id').drag(function (evt) {
      *		if (!this.id) {
      *			console.error('Metoda byla zavolana na objektu bez ID.', opt);
      *			return this;
      *		}
      *		evt.originalEvent.dataTransfer.setData('dragObjectId', this.id);
      *	});
      *
      *	$('#div_id').drag({
      *			namespace	: '.mynamespace',	// prilepi se k nazvu udalosti v metode 'on'
      *			target		: 'span.for-drag',	// druhy argument metody 'on'
      *			data		: { param: 1 },		// treti argument medody 'on'
      *			dragend		: function(e, ui) {}; // callback po ukončení dragu (trigne až po dropu!!)
      *			datatransfer	: function(evt) {
      *				if (!this.id) {
      *					console.error('Metoda byla zavolana na objektu bez ID.', opt);
      *					return this;
      *				}
      *				evt.originalEvent.dataTransfer.setData('dragObjectId', this.id);
      *			}
      *		});
      *
      *
      * Id dragnutého objektu je v proměnné is.drag_id
      *		
      *		
      */
     $.fn.drag = (function () {
         is.Define.property (
             'drag_id', null, {
                 writable:       true,
                 configurable:   false,
                 enumerable:     true,
         });
         return function (opt) {
             var default_options = {
                 namespace	: '',
                 datatransfer : function(evt) {
                     if (!this.id) {
                         console.error('Metoda byla zavolana na objektu bez ID.', opt);
                         return this;
                     }
                     is.drag_id = this.id; //ID dragnutého objektu
                     evt.originalEvent.dataTransfer.setData('dragObjectId', this.id);
                 }
             };
 
             if (!this.length) {
                 console.error('Metoda byla zavolana na prazdnem objektu.', opt);
                 return this;
             }
 
             if ($.isFunction(opt)) {
                 opt = {
                     datatransfer: opt,
                 };
             }
             opt = $.extend({}, default_options, opt);
             opt.namespace = (opt.namespace ? opt.namespace : '') + '.drag';
 
             if (opt.target) {
                 this.find(opt.target).attr('draggable', 'true');
             } else {
                 this.attr('draggable', 'true');
             }
 
             return this
                 .off(opt.namespace)
                 .on('dragend'+opt.namespace, opt.target, opt.data, opt.dragend)
                 .on('dragstart'+opt.namespace, opt.target, opt.data, opt.datatransfer);
         };
     }());
 
     /**
      * Zaregistruje udalosti drag&drop na elementu a vyvola funkci callback,
      * pokud bylo neco do elementu dropnuto.
      *
      *	$('#div_id').dragDrop(function (dataTransfer, evt) {
      *		console.log(dataTransfer.files);
      *	});
      *
      *	$('#div_id').dragDrop({
      *			namespace	: '.mynamespace',	// prilepi se k nazvu udalosti v metode 'on'
      *			target		: 'span.for-drop',	// druhy argument metody 'on'
      *			data		: { param: 1 },		// treti argument medody 'on'
      *			validate	: function (dataTransfer, evt) {			// filtruje prenaseny obsah
      *				return (((dataTransfer||{}).items||[])[0]||{}).kind === 'file';	// napr diky tomuto radku budou udalosti reagovat jen kdyz se prenasi soubory
      *			},
      *			callback	: function (dataTransfer, evt) {		// co se ma udelat pri dropu
      *				var dataTransfer = evt.originalEvent.dataTransfer;
      *				if (dataTransfer) {
      *					console.log(dataTransfer.files);
      *				}
      *			},
      *			dataName	: 'dragDrop',		// informace pod kterou se ukladaji data k objektum (opt.target)
      *			classPassive	: 'drag_drop_target',	// trida, ktera se nastavi vsem objektum (opt.target) aby byly poznat ze do nich lze dripovat
      *			classActive	: 'drag_drop_target_active',	// trida, ktera se nastavi, kdyz je nad objektem nejaky predmet, ktery jde do objektu dropnout
      *		});
      */
     $.fn.dragDrop = (function () {
         var default_options = {
             namespace	: '',
             dataName	: 'dragDrop',
             classPassive	: 'drag_drop_target',
             classActive	: 'drag_drop_target_active',
         };
 
         return function (opt) {
             if (!this.length) {
                 console.info('Metoda byla zavolana na prazdnem objektu.', opt);
                 return this;
             }
 
             if ($.isFunction(opt)) {
                 opt = {
                     callback: opt,
                 };
             }
 
             opt = $.extend({}, default_options, opt);
             opt.namespace = (opt.namespace ? opt.namespace : '') + '.dragDrop';
 
             if (opt.target) {
                 this.find(opt.target).addClass(opt.classPassive);
             } else {
                 this.addClass(opt.classPassive);
             }
 
             return this
                 .off(opt.namespace)
                 .on("dragover"+opt.namespace, opt.target, opt.data, function(evt) {
                     evt.stopPropagation();
                     evt.preventDefault();
                 })
                 .on("dragend"+opt.namespace, opt.target, opt.data, function(evt) {
                     var $self = $(this);
                     evt.stopPropagation();
 
                     _change_active(opt, $self);
                 })
                 .on("dragenter"+opt.namespace, opt.target, opt.data, function(evt) {
                     var $self = $(this);
                     evt.stopPropagation();
 
                     if (_validate_content(opt, evt)) {
                         _change_active(opt, $self, +1, function (active) {
                             return active === 1;
                         });
                     }
                 })
                 .on("dragleave"+opt.namespace, opt.target, opt.data, function(evt) {
                     var $self = $(this);
                     evt.stopPropagation();
 
                     if (_validate_content(opt, evt)) {
                         _change_active(opt, $self, -1, function (active) {
                             return active !== 1;
                         });
                     }
                 })
                 .on("drop"+opt.namespace, opt.target, opt.data, function(evt) {
                     var $self = $(this);
                     evt.stopPropagation();
                     var args;
 
                     if (_validate_content(opt, evt)) {
                         _change_active(opt, $self);
                         if ($.isFunction(opt.callback)) {
                             evt.preventDefault();
                             args = [].slice.call(arguments);
                             args.unshift(evt.originalEvent.dataTransfer);
                             opt.callback.apply(this, args);
                         } else if (opt.callback) {
                             console.error('Callback neni funkce. Pri dropnuti nebyla provedena zadna akce.', opt);
                         }
                     }
                 });
 
         };
 
         function _validate_content(opt, evt) {
             return !opt.validate || opt.validate(evt.originalEvent.dataTransfer, evt);
         }
 
         function _change_active(opt, $elm, val, callback) {
             var dragDrop = $elm.data(opt.dataName);
 
             if (!$.isPlainObject(dragDrop) || dragDrop.active == null) {
                 dragDrop = {
                     active: 0,
                 };
                 $elm.data(opt.dataName, dragDrop);
             }
 
             dragDrop.active = val ? dragDrop.active + val : 0;
 
             if (!callback || callback(dragDrop.active)) {
                 $elm[val > 0 ? 'addClass' : 'removeClass'](opt.classActive);
             }
         }
     }());
 
     /**
      * Zaregistruje udalosti drag&drop na elementu a vyvola funkci callback,
      * pokud byl do elementu dropnut alespon jeden soubor.
      *
      *	$('#div_id').dragDropFiles(function (files, evt) {
      *		$.each(files, function (i, file) {
      *			console.log(file.name);
      *		});
      *	});
      *
      *	$('#div_id').dragDropFiles({
      *			namespace	: '.mynamespace',		// prilepi se k nazvu udalosti v metode 'on'
      *			target		: 'span.for-drop',		// druhy argument metody 'on'
      *			data		: { param: 1 },			// treti argument medody 'on'
      *			validate	: function (files, evt) {};	// overeni zda dany soubor je zajmavy
      *			callback	: function (files, evt) {	// co se ma udelat pri droplem souboru
      *				$.each(files, function (i, file) {
      *					console.log(file.name);
      *				});
      *			},
      *		});
      */
     $.fn.dragDropFiles = (function () {
         return function (opt) {
             var callback, validate;
 
             if (!this.length) {
                 console.info('Metoda byla zavolana na prazdnem objektu.', opt);
                 return this;
             }
 
             if ($.isFunction(opt)) {
                 callback = opt;
                 opt = null;
             }
 
             opt = opt || {};
 
             callback = callback || opt.callback;
             if (callback) {
                 opt.callback = function (dataTransfer) {
                     var args = [].slice.call(arguments);
                     args.splice(0, 1, dataTransfer.files);
                     callback.apply(this, args);
                 };
             }
 
             validate = opt.validate;
             opt.validate = function (dataTransfer) {
                 return dataTransfer != null
                     && ((dataTransfer.items||[])[0]||{}).kind === 'file'
                     && (!validate || validate(dataTransfer.files));
             };
 
             return this.dragDrop(opt);
         };
     }());
 
     /**
      * Zjistuje a nastavuje hodnotu progress prvku od foundation.
      *
      * Meni jak sirku, tak hodnoty atributu a textu, aby vse sedelo.
      * Vyzaduje aby byly vyplneny vsechny 'aria-value*' atributy.
      * Pokud je zadano cislo mimo min-max, zobrazi se, ale grafika
      * neutece mimo mantinely.
      *
      * 	$('.progress').fProgress();		// [cislo] vrati aktulne nastavenou absolutni hodnotu
      * 	$('.progress').fProgress('%');		// [cislo] vrati procentualni vyjadreni aktualni hodnoty k intervalu min-max
      *
      * 	$('.progress').fProgress(200);		// nastavi absolutni hodnotu na 200
      * 	$('.progress').fProgress('50%')		// nastavi na 50% a zmeni prislusne absolutni hodnoty
      *
      * 	$('.progress').fProgress('50%', {duration:0})		// provede se bez animace
      *
      * (zname bugy:
      * 	- nezvlada sklonovani pri zmene cisla v textu)
      */
 
     $.fn.fProgress = function (val, animate_options) {
         var $progress, $meter, max, min, now, interval,
             percent = typeof val === 'string' && val.indexOf('%') >= 0 ? '%' : '';
 
         val = parseFloat(val);
 
         // zjistim stav progress - prvni element se ocekava ze je '.progress'
         if (isNaN(val)) {
             $progress = this.first().filter('.progress');
 
             if (!$progress.length) {
                 return undefined;
             }
 
             now = parseFloat($progress.attr('aria-valuenow')) || 0;
 
             // chci procenta
             if (percent) {
                 max = +$progress.attr('aria-valuemax');
                 min = +$progress.attr('aria-valuemin');
                 interval = (max - min) || 0;
                 return interval && Math.round((now * 10000) / interval) / 100;
             }
 
             // chci absolutni hodnotu
             return now;
         }
 
         // nastavim hodnotu
         return this.filter('.progress')
             .each(function () {
                 var interval,
                     value = val,
                     now_new = '',
                     $progress = $(this),
                     now = $progress.attr('aria-valuenow'),
                     max = +$progress.attr('aria-valuemax'),
                     min = +$progress.attr('aria-valuemin'),
                     text = $progress.attr('aria-valuetext'),
                     $meter = $progress.children('.progress-meter'),
                     $text = $meter.children('.progress-meter-text');
 
                 interval = (max - min) || 0;
                 if (percent) {
                     now_new += Math.round((interval * value) / 100);
                     value = Math.ceil(value);
                 } else {
                     now_new += Math.round(value);
                     value = interval && Math.ceil((value * 100) / interval);
                 }
 
                 value = Math.min(100, Math.max(0, value));
                 $meter.stop().animate({ 'width': value + '%' }, animate_options);
                 $progress.attr('aria-valuenow', now_new);
 
                 if (typeof text === 'string') {
                     $progress.attr('aria-valuetext', text.replace(now, now_new));
                 }
 
                 if ($text.length) {
                     $text.html($text.html().replace(now, now_new));
                 }
             })
         .end();	// vracim zpet navrat 'filter'
     };
 
     /**
      * Umozni zmenit pritomnost atributu u elementu. Funguje obdobne jako $.fn.toggleClass.
      * Pouziti ma smysl pouze u atributu, ktere nenesou zadnou hodnotu (disable, multiple, readonly ...).
      *
      * 	$elm.toggleAttr(atribut[, stav]);
      *
      * Napriklad:
      * 	$elm.toggleAttr('disabled');
      * 	$elm.toggleAttr('disabled', true);
      *
      */
     $.fn.toggleAttr = function (attr, state) {
         if (state === true) {
             return this.attr(attr, '');
         }
 
         if (state === false) {
             return this.removeAttr(attr);
         }
 
         return this.each(function () {
             var $self = $(this);
 
             if ($self.attr(attr) == null) {
                 $self.attr(attr, '');
             } else {
                 $self.removeAttr(attr);
             }
         });
     };
 
     /**
      * Zamezi uzivateli menit hodnoty formularovych prvku.
      *
      * 	$('form').readonly(true);
      *
      **/
     $.fn.readonly = (function () {
         var namespace = 'jqueryReadonly';
 
         return function (readonly) {
             var $inputs = this.add(this.find('*')).filter(function () {
                 var $self = $(this);
 
                 return ($self.is(':input') || $self.is('[type="button"]') || $self.is('.chosen-container'))
                     && !$self.is('.readonly-clone')
                     && !$self.is('[type="hidden"]')
                     && !$self.is('[type="reset"]')
                     && !$self.is('[type="submit"]');
             });
 
             $inputs = $($.uniqueSort($inputs.get()));
 
             if (typeof readonly !== 'boolean') {
                 return $inputs.length === $inputs.filter('.readonly').length;
             }
 
             $inputs.each(function () {
                 var $self = $(this);
                 var type;
 
                 if ($self.is('.readonly') === readonly) {
                     return;
                 }
 
                 switch (this.nodeName) {
                     case 'INPUT':
                         type = $self.attr('type');
                         break;
                     default:
                         type = this.nodeName;
                 }
 
                 switch (type.toLowerCase()) {
                     case 'button':
                         $self.toggleAttr('disabled', readonly);
                         break;
                     case 'textarea':
                     case 'text':
                     case 'password':
                         $self.toggleAttr('readonly', readonly);
                         break;
                     case 'file':
                     case 'radio':
                     case 'checkbox':
                     case 'div':
                         _use_clone($self, readonly);
                         break;
                     case 'select':
                         if ($self.is('[multiple]')) {
                             console.error(
                                 'SELECT s atributem MULTIPLE plugin $.fn.readonly nepodporuje.',
                                 'SELECT lze v aplikaci nahradit za skupinu checkboxu, ktera je pluginem podporovana.'
                             );
                         } else {
                             _use_clone($self, readonly);
                         }
                         break;
                     default:
                         console.error('Typ prvku "' + type + '" nelze nastavit jako "readonly".', type.toLowerCase());
                 }
 
                 $self.toggleClass('readonly', readonly);
                 $self.toggleAttr('readonly', readonly);
             });
 
             return this;
         };
 
         function _use_clone ($input, readonly) {
             var $clone, id;
 
             if (readonly) {
                 ($clone = $input.clone())
                     .addClass('readonly-clone')
                     .attr('disabled', true)
                     .attr('name', is.Misc.uniq_id())	// radio musi mit zmenene 'name', aby se v klonu projevilo :checked
                     .removeAttr('id');
 
                 $input
                     .addClass('hide')
                     .data(namespace, $clone)
                     .before($clone);
 
                 id = $input.attr('id');
                 if (id) {
                     $('label[for="' + id + '"]')
                         .removeAttr('for')
                         .addClass('readonly-disbaled-' + id);
                 }
             } else {
                 $clone = $input.data(namespace);
 
                 $clone.remove();
                 $input.removeClass('hide');
                 $input.removeData(namespace);
 
                 id = $input.attr('id');
                 if (id) {
                     $('.readonly-disbaled-' + id)
                         .attr('for', id)
                         .removeClass('readonly-disbaled-' + id);
                 }
             }
         };
 
     }());
 
 }(window.jQueryF || jQuery));
 