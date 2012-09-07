(function() {
	// VARS
	'use strict';
	/*global window, document, jQuery, unescape, escape, customDrill*/
	var zipc, radiusc;
	// COOKIES
	(function() {
		var sc, pathx, ttt, tt, t, ttc, loc, tc;
		// evaluate saved search cookie
		sc = document.cookie;
		pathx = window.location.pathname;
		ttt = sc.indexOf('search') > -1 ? sc.slice(sc.indexOf('search') + 7, sc.indexOf(';', sc.indexOf('search') + 7)) : '';
		tt = sc.indexOf('scroll') > -1 ? sc.slice(sc.indexOf('scroll') + 7, sc.indexOf(';', sc.indexOf('scroll') + 7)) : '';
		t = sc.indexOf('show') > -1 ? sc.slice(sc.indexOf('show') + 5, sc.indexOf(';', sc.indexOf('show') + 5)) : '';
		zipc = sc.indexOf('zipcode') > -1 ? sc.slice(sc.indexOf('zipcode') + 8, sc.indexOf('zipcode') + 13) : '';
		radiusc = sc.indexOf('radius') > -1 ? sc.slice(sc.indexOf('radius') + 7, sc.indexOf(';', sc.indexOf('radius') + 7)) : ''; 
		// update cookie
		if (ttt !== '' && pathx.indexOf('inventory') > -1) {
			ttc = ttt.slice(0);
			ttt = '';
			document.cookie = 'search=; path=/inventory; expires=Thu, 01-Jan-1970 00:00:01 GMT;';
			loc = (t.length > 0) ? '/inventory' + unescape(ttc) + '/show=' + unescape(t) : '/inventory' + unescape(ttc);
			document.cookie = (t.length > 0) ? 'show=; path=/inventory expires=Thu, 01-Jan-1970 00:00:01 GMT;' : '';
			window.location = loc;
		} else if (tt !== '' && tt > 0) {
			tc = tt.slice(0);
			tt = '';
			jQuery(document).ready(function() {
				jQuery(document).scrollTop(parseInt(tc, 10));
				document.cookie = 'scroll=; path=/inventory; expires=Thu, 01-Jan-1970 00:00:01 GMT;';
			});
		}
	}());
	var ajaxPHP, disabled, tempCount, disclaimer, conditions, conditionsId, pname, pArray, getCount, vehicleLoad, selectEmpty, postData, selAjax, eleAjax, countAjax, defaultImage, addFilter, compareArray, addOptions, countUpdate, cond, urlArray, urlEle, currentIndex, xx, butSelected, scrollopt, next, scrollActive, loadAjax, setCookie, newLocation, scrollverify, acomplete;
	ajaxPHP = '{THEME_ROOT}/_ajax.php';
	disabled = '<option value="">Select</option>';
	tempCount = 0;
	disclaimer = true;
	conditions = [];
	conditionsId = [];
	scrollopt = false;
	scrollActive = true;
	loadAjax = true;
	pname = window.location.pathname;
	pname = pname.substr(1, pname.length - 2);
	pArray = pname.split('/');
	// FUNCTIONS
	// set Cookies if inventory page
	setCookie = function(value) {
		if (pArray[0] === 'inventory') {
			document.cookie = 'search=' + escape(value) + '; path=/inventory';
			document.cookie = 'scroll=' + escape(jQuery(document).scrollTop()) + '; path=/inventory';
		}
	};
	// build URL query and refresh
	newLocation = function() {
		var search = '',
			condx, reg = /condition|ext_color_generic|make|standard_body|standard_model|year/;
		for (cond = 0; cond < conditions.length; cond += 1) {
			condx = conditions[cond];
			condx = condx.slice(condx.indexOf('=') + 1);
			if (reg.test(conditionsId[cond])) {
				search += '/' + condx;
			} else {
				condx = condx.indexOf('-') > -1 ? condx : condx + '-' + condx;
				search += '/' + conditionsId[cond] + '=' + condx;
			}
		}
		setCookie(search); /*window.location = '{home}/inventory' + search;*/
	};
	// get vehicle list amount
	getCount = function() { /*jQuery('.search-top-page .wrap_show').show();*/
		jQuery('.search-top-page .show').text(jQuery('#vehicle-list .vehicle').size());
	};
	// Ajax Success - Vehicle List
	vehicleLoad = function(msg, src) {
		if (msg !== '') {
			jQuery('#vehicle-list').append(msg);
		} else if (src === 'new') {
			jQuery('#vehicle-list').html('No results');
		}
	};
	// Ajax Success - Select Fields
	selectEmpty = function(msg, filter) {
		var nume, value, tMax, tMax1, nminor, nmayor, rate, msgn, calini, parentB, primarymake, fromIndex, ini = 0,
			tempList = [];
		if (msg !== '') {
			primarymake = jQuery('.drillIt').attr('primarymake');
			if (butSelected === 'make') {
				for (nume = 0; nume < msg.length; nume += 1) {
					if (msg[nume] === primarymake) {
						fromIndex = nume;
						break;
					}
				}
				msg.splice(fromIndex, 1);
				msg.splice(0, 0, primarymake);
			}
			if (filter) {
				calini = function(ii, top) {
					var iii = ii,
						bool;
					while (msg[iii] < top) {
						iii += 1;
					}
					if (ii < iii) {
						ini = iii;
						bool = true;
					} else {
						bool = false;
					}
					return bool;
				};
				rate = filter === 'milage' ? 10000 : 5000;
				tMax = Number(msg.pop());
				tMax1 = tMax - tMax % rate;
				if (tMax >= rate) {
					if (calini(ini, rate)) {
						msgn = ['0-' + rate];
					} else {
						msgn = [];
					}
				} else {
					msgn = ['0-' + tMax];
				}
				for (nume = 1; tMax > rate && nume < Math.floor(tMax1 / rate); nume += 1) {
					if (filter === 'milage' && (nume * rate) >= 100000) {
						break;
					}
					if (!calini(ini, (nume + 1) * rate)) {
						nume += 1;
					} else {
						nminor = (nume * rate).toString(10);
						nmayor = ((nume + 1) * rate).toString(10);
						if (nume * rate) {
							msgn.push(nminor + '-' + nmayor);
						}
					}
				}
				if (tMax > rate) {
					msgn.push(nmayor + '-' + tMax);
				}
				msg = msgn.slice();
			}
			for (nume = 0; nume < msg.length; nume += 1) {
				tempList.push('<li><a href="#" title="' + msg[nume] + '">' + msg[nume] + '</a></li>');
			}
			value = tempList.join('');
		} else {
			value = '<li>No results</li>';
		}
		jQuery('ul.opt[title="' + butSelected + '"]').append(value);
		parentB = jQuery('button[value="' + butSelected + '"]').width();
		if (!jQuery('ul.opt[title="' + butSelected + '"]').hasClass('ui-state-hover')) {
			jQuery('ul.opt[title="' + butSelected + '"]').parent().addClass('mhover');
		}
	};
	// build POST
	postData = function(out) {
		var search = '';
		search += 'json=true';
		/* search += '&inventory=true'; */
		if (jQuery('#sort').val() !== 'empty') {
			search += '&sort=' + jQuery('#sort').val();
		}
		if (out) {
			search += '&filter=' + out;
		}
		if(jQuery('#zipcode').val() !== '' && jQuery('#radius').val() !== '') {
			search += '&zipcode=' + jQuery('#zipcode').val();
			search += '&radius=' + jQuery('#radius').val();
		}
		for (cond = 0; cond < conditions.length; cond += 1) {
			search += '&' + conditions[cond];
			if (conditionsId[cond] === 'stock' || conditionsId[cond] === 'vin') {
				search = 'json=true&inventory=true&condition=Used' + '&' + conditions[cond];
				return search;
			}
		}
		return search;
	};
	// Ajax, Select Dropdown Fill
	selAjax = function(val) {
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			data: postData(val),
			url: ajaxPHP,
			success: function(msg) {
				selectEmpty(msg.select, val === 'milage' || val === 'msrp' || val === 'price' ? val : false);
				jQuery('#filter button.loading').removeClass('loading');
			}
		});
	};
	// Ajax, updates vehicle list
	eleAjax = function() {
		if (pArray[0] === 'inventory') {
			jQuery(document).scrollTop(0);
			jQuery('#offset').val('');
			jQuery('#vehicle-list').empty();
		}
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			data: postData(),
			url: ajaxPHP,
			success: function(msg) {
				if (pArray[0] === 'inventory') {
					if (jQuery('#main').hasClass('cover')) {
						jQuery('#main, #rightbar').toggleClass('cover');
					}
					vehicleLoad(msg.view, 'new');
				}
				jQuery('div.search-top-page span.total').text(msg.count);
				getCount();
				scrollverify(msg.count);
			},
			error: function(jqxhr, msg) {
				console.log(msg);
			}
		});
	};
	// Ajax, backend response for the total count of vehicles after initiate all the search
	countAjax = function() {
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			data: postData(),
			url: ajaxPHP,
			success: function(msg) {
				if (msg !== null && msg.hasOwnProperty('count') && msg.count > 0) {
					jQuery('div.search-top-page span.total').text(msg.count);
					scrollverify(msg.count);
				} else {
					jQuery('div.search-top-page span.total').text(jQuery('#vehicle-list .vehicle').size());
				}
			}
		});
	};
	// assign default image, disclaimer event and buttons event for cookie data
	defaultImage = function() {
		jQuery('#vehicle-list').on('click', '.vehicle-pt-item-left a, .check-available a, .title-wrap a', function() {
			newLocation();
		});
		// hover for disclaimer
		if (disclaimer) {
			jQuery('#vehicle-list').on('mouseenter', '.disclaimer', function() {
				jQuery(this).parent().next('div.disclaimer').show();
			}).on('mouseleave', '.disclaimer', function() {
				jQuery(this).parent().next('div.disclaimer').hide();
			});
		} else {
			jQuery('#vehicle-list').on('load', '.disclaimer', function() {
				jQuery(this).hide();
			});
		}
	};
	// Add to the bcrumb a new filter
	addFilter = function(id, view) {
		conditions.push(jQuery('#' + id).attr('id') + '=' + jQuery('#' + id).val());
		conditionsId.push(id);
		jQuery('.bcrumb').append('<label class=' + id + '>' + jQuery('#' + id).val() + '</label>');
		if (id !== 'condition') {
			jQuery('label.' + id).append('<span>X</span>');
			if (id === 'stock' || id === 'vin') {
				jQuery('label:not(.' + id + ')').addClass('nosearch');
			}
		}
		if (view) {
			eleAjax();
		} // when view is true update vehicle list
	};
	// compare the json object with the current location path array
	compareArray = function(jso, type) {
		var xx0, xx1, re = /[=]/,
			re1 = /fuel_type|milage|mpg_city|mpg_hwy|msrp|price|transmission/,
			colorArray = jso.ext_color_generic,
			makeArray = jso.make,
			bodyArray = jso.standard_body,
			modelArray = jso.standard_model,
			yearArray = jso.year,
			vinArray = jso.vin,
			stockArray = jso.stock,
			allArrayObj = {
				make: makeArray,
				standard_model: modelArray,
				standard_body: bodyArray,
				ext_color_generic: colorArray,
				year: yearArray,
				vin: vinArray,
				stock: stockArray
			};
		if (typeof type === 'undefined') {
			urlArray = pArray.slice(0);
			urlArray.shift();
		} else {
			urlArray = [];
			urlArray.push(type);
		}
		for (urlEle = 0; urlEle < urlArray.length; urlEle += 1) {
			if (!re.test(urlArray[urlEle])) {
				for (xx0 in allArrayObj) {
					if (allArrayObj.hasOwnProperty(xx0)) {
						for (xx1 in allArrayObj[xx0]) {
							if (allArrayObj[xx0].hasOwnProperty(xx1) && unescape(urlArray[urlEle]) === allArrayObj[xx0][xx1]) {
								// update arrays
								conditions.push(xx0 + '=' + allArrayObj[xx0][xx1]);
								conditionsId.push(xx0);
								// add the bcrumb selection
								jQuery('.bcrumb').append('<label class=' + xx0 + '>' + allArrayObj[xx0][xx1] + '<span>X</span></label>');
								// hide the reference button
								jQuery('#filter button[value=' + xx0 + ']').addClass('included');
							}
						}
					}
				}
			} else if (re1.test(urlArray[urlEle])) {
				// update arrays
				conditions.push(urlArray[urlEle]);
				xx0 = urlArray[urlEle].slice(0, urlArray[urlEle].indexOf('='));
				xx1 = urlArray[urlEle].slice(urlArray[urlEle].indexOf('=') + 1, urlArray[urlEle].indexOf('-'));
				conditionsId.push(xx0);
				// add the bcrumb selection
				jQuery('.bcrumb').append('<label class=' + xx0 + '>' + xx1 + '<span>X</span></label>');
				// addclass included to the reference button
				jQuery('#filter button[value=' + xx0 + ']').addClass('included');
			}
		}
		if (typeof type === 'undefined') {
			/* countUpdate(); */
			if (pArray[0] === 'inventory' && typeof(customDrill) !== 'undefined' && customDrill.sort) {
				jQuery('#sort option:contains(' + customDrill.sort[0] + ')').attr('selected', 'selected');
				if (customDrill.sort[1] === 'ASC') {
					jQuery('.garrange a.dir').click();
				} else {
					jQuery('#sort').change();
				}
			} else {
				eleAjax();
			}
		} else {
			eleAjax();
		}
	};
	// get JSON the search
	addOptions = function() {
		// ajax the common array - call compare function 
		jQuery.getJSON('{THEME_ROOT}/_ajax.php?searchAI=true', function(msg) {
			if (pArray[0] === 'inventory') {
				compareArray(msg);
			} else {
				countAjax();
			}
			acomplete(msg);
		});
	};
	// autocomplete function
	acomplete = function(jso) {
		// join the json arrays in one
		var jsoarray = [];
		jsoarray = jsoarray.concat(jso.stock, jso.vin);
		jQuery('#vin').autocomplete({
			appendTo: '#tabs3 .wp',
			source: jsoarray,
			select: function() {
				window.location = '{home}/vehicle/' + arguments[1].item.value;
			}
		});
	};
	// count vehicles show and total function
	countUpdate = function() {
		// Show count and total count
		getCount();
		countAjax();
	};
	// show more vehicles
	next = function() {
		jQuery('.search-top-page .lab').addClass('loading');
		jQuery.ajax({
			type: 'POST',
			data: 'next=true&offset=' + jQuery('#vehicle-list .vehicle').size() + '&' + postData(),
			dataType: 'json',
			url: ajaxPHP,
			success: function(msg) {
				vehicleLoad(msg.view, 'next');
				scrollverify(msg.count);
			},
			complete: function() {
				jQuery('.search-top-page .lab').removeClass('loading');
				getCount();
				document.cookie = 'show=' + escape(jQuery('#vehicle-list .vehicle').size()) + '; path=/inventory';
			}
		});
	};
	// scroll activation
	scrollverify = function(amount) {
		scrollActive = jQuery('#vehicle-list .vehicle').size() < Number(amount) ? true : false;
	};
// On document ready
	jQuery(document).ready(function() {
		// Hide Condition Selector if inventory page && assign price button variable
		var msrpar = 'msrp';
		if (pArray[0] !== 'inventory') {
			if (typeof(customDrill) !== 'undefined' && customDrill.force) {
				jQuery('#condition').val(customDrill.force).change();
				msrpar = customDrill.force === 'New' ? jQuery('button[value="msrp"]').attr('new') : jQuery('button[value="msrp"]').attr('used');
			} else {
				jQuery('#condition').removeAttr('disabled').val('New').change().next().css('visibility', 'visible');
				msrpar = jQuery('button[value="msrp"]').attr('new');
			}
			jQuery('.showresults').show();
		} else {
			// label new or used/certified conditional
			if (pArray[1] !== 'New') {
				jQuery('a.tabs1 .used').css('display', 'inline');
				msrpar = jQuery('button[value="msrp"]').attr('used');
			} else {
				jQuery('a.tabs1 .new').css('display', 'inline');
				msrpar = jQuery('button[value="msrp"]').attr('new');
			}
			jQuery('.garrange').show();
			scrollopt = true;
			jQuery('#sort option[title="price"]').val(msrpar + '-DESC').attr('title', msrpar);
		}
		jQuery('button[value="msrp"]').val(msrpar).next().attr('title', msrpar);
		// Add hover to buttons list
		jQuery('li.wp').hover(function() {
			jQuery(this).addClass('mhover');
		}, function() {
			jQuery(this).removeClass('mhover');
		});
		// Add icons to buttons
/*
jQuery('#filter button').button({
            icons: {
                secondary: "ui-icon-triangle-1-s"
            }
        });
*/
		// Include condition value in the array
		addFilter('condition', false);
		// Include options that are in the path
		addOptions();
		// call image function
		defaultImage();
		// Condition input select event, reset make and model fields
		jQuery('#condition').change(function() {
			conditions = []; //erase conditions array
			conditionsId = []; //erase conditionsId array
			jQuery('label').remove(); //delete the bcrumbs
			jQuery('ul.opt').empty();
			jQuery('.included, .ready').removeClass('included ready');
			addFilter('condition', true);
			msrpar = jQuery('#condition').val() === 'New' ? jQuery('button[value="msrp"], button[value="price"]').attr('new') : jQuery('button[value="msrp"], button[value="price"]').attr('used');
			jQuery('button[value="msrp"], button[value="price"]').val(msrpar).next().attr('title', msrpar);
		}).hover(function() {
			jQuery('span.dd').addClass('hov');
		}, function() {
			jQuery('span.dd').removeClass('hov');
		});
		// Button Options Click Handler
		jQuery('#filter button:not([value="sort"])').click(function() {
			if (jQuery(this).hasClass('included')) {
				loadAjax = false;
				jQuery('label.' + jQuery(this).val() + ' span').click();
				jQuery(this).removeClass('included');
			}
			if (!jQuery(this).hasClass('ready')) {
				jQuery(this).addClass('ready loading');
				butSelected = jQuery(this).val(); // save the button id in global var
				selAjax(jQuery(this).val());
			} else {
				var nextul = jQuery(this).next('ul');
				if (nextul.children().length > 0) {
					if (nextul.is(':visible')) {
						nextul.hide();
					} else {
						nextul.show();
					}
				}
			}
		});
		// Condition select event reset make and model fields
		jQuery('ul.opt').on('click', 'a', function(e) {
			e.preventDefault();
			var selection = jQuery(this).text(),
				prevBut = jQuery(this).parents('ul.opt').prev('button');
			prevBut.addClass('included'); // add class included to the button used
			jQuery('input.newFilter').attr({
				'id': jQuery(prevBut).val(),
				'value': selection
			});
			jQuery('ul.opt').empty();
			jQuery('button').removeClass('ready');
			addFilter(jQuery(prevBut).val(), true);
		});
		// bcrumb option interactivity
		jQuery('.bcrumb').on('mouseenter', 'span', function() {
			loadAjax = true;
		});
		jQuery('.bcrumb').on('click', 'span', function() {
			// delete this and after filters from arrays and bcrumb view
			currentIndex = jQuery(this).parent().index();
			jQuery('.bcrumb label:gt(' + currentIndex + ')').remove(); // remove tabs after currentindex
			jQuery(this).parent().remove();
			// activate the erased options on the add filter selector and clean the array
			for (xx = conditions.length; xx > currentIndex; xx = xx - 1) {
				jQuery('#filter button[value=' + conditionsId[xx - 1] + ']').removeClass('included');
				conditions.pop();
				conditionsId.pop();
			}
			jQuery('ul.opt').empty();
			jQuery('button').removeClass('ready');
			// reload the vehicle view
			if (loadAjax) {
				eleAjax();
			}
		});
		// sort functionality
		jQuery('#sort').change(function() {
			var currClass;
			currClass = jQuery(this).val().indexOf('ASC') > -1 ? 'asc' : 'desc';
			jQuery('.garrange a.dir').removeClass().addClass('dir ' + currClass);
			if (jQuery(this).val() !== 'empty') {
				eleAjax();
			}
		});
		// model dir behavior
		jQuery('.garrange a.dir').click(function(e) {
			e.preventDefault();
			var oppClass, title, newValue;
			oppClass = jQuery(this).hasClass('asc') ? 'desc' : 'asc';
			jQuery(this).removeClass().addClass('dir ' + oppClass);
			title = jQuery('#sort option:selected').attr('title');
			newValue = title + '-' + oppClass.toUpperCase();
			jQuery('#sort').find('option[title="' + title + '"]').attr('value', newValue);
			jQuery('#sort').val(newValue);
			if (jQuery('#sort').val() !== 'empty') {
				eleAjax();
			}
		});
		// layout change
		jQuery('#linetype').click(function(e) {
			e.preventDefault();
			jQuery('#vehicle-list').addClass('plain');
		});
		jQuery('#blocktype').click(function(e) {
			e.preventDefault();
			jQuery('#vehicle-list').removeClass('plain');
		});
		// zip and radious triggers		
		if(zipc !== '' && radiusc !== ''){
			jQuery('#zipcode').val(zipc);
			jQuery('#radius').val(radiusc);
		}
		jQuery('#zipcode, #radius').change(function(e) {
			var regzip = /^[0-9]{5}$/;
			var regrad = /^[0-9]{2,3}$/;
			jQuery('#radius').removeAttr('disabled');
			if (regzip.test(jQuery('#zipcode').val()) && regrad.test(jQuery('#radius').val())) {
				// save the new cookies
				document.cookie = 'radius=' + escape(jQuery('#radius').val()) + '; path=/';
				document.cookie = 'zipcode=' + escape(jQuery('#zipcode').val()) + '; path=/';
				eleAjax();
			} else {
				jQuery(this).val('');
			}
		});
		if (pArray[0] === 'inventory') {
			// reposition of the breadcrumb and location info
			jQuery('.bcrumb').prependTo('.inventoryWrapper');
		}
		// search function
		jQuery('.showresults').click(function(e) {
			e.preventDefault();
			var search = '',
				reg = /condition|ext_color_generic|make|standard_body|standard_model|year/;
			for (cond = 0; cond < conditions.length; cond += 1) {
				if (reg.test(conditionsId[cond])) {
					search += '/' + conditions[cond].slice(conditions[cond].indexOf('=') + 1);
				} else {
					search += '/' + conditions[cond];
				}
			}
			window.location = '{home}/inventory' + search;
		});
		// no form default submit behavior
		jQuery('#inventory').submit(function(e) {
			e.preventDefault();
		});
		// add function for toggle display of bcrumb and search button
		jQuery('.tabs1, .tabs2').click(function() {
			jQuery('.bcrumb').show();
			if (pArray[0] !== 'inventory') {
				jQuery('.showresults').show();
			}
		});
		jQuery('.tabs3').click(function() {
			jQuery('.bcrumb, .showresults').hide();
		});
		// scroll Next vehicle trigger
		if (scrollopt) {
			window.onscroll = function() {
				var docHeight, winHeight, scrollTop, heiDif;
				docHeight = jQuery(document).height();
				winHeight = jQuery(window).height();
				scrollTop = jQuery(document).scrollTop();
				heiDif = docHeight - scrollTop;
				if (scrollTop > 100) {
					jQuery('.topnav').addClass('stuck');
				} else {
					jQuery('.topnav').removeClass('stuck');
				}
				if (scrollActive && (heiDif - (winHeight * 1.5)) < winHeight) { /*winHeight = 0;*/
					scrollActive = false;
					next();
				}
			};
		}
	});
}());