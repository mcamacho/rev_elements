var mapsC = (function() {
	'use strict'; /*global document, window, jQuery, google, gmapGreyStyle, dealerloc*/
	var zc = document.cookie,
		zczipi = zc.indexOf('zipcode'),
		zcradiusi = zc.indexOf('radius'),
		_zipc = zczipi > -1 ? zc.slice(zczipi + 8, zczipi + 13) : '',
		_radiusc = zcradiusi > -1 ? zc.slice(zcradiusi + 7, zc.indexOf(';', zcradiusi + 7)) : '';

	function initialize(msg) {
		var dealers = msg,
			markerIcon = new google.maps.MarkerImage('http://cdn.hostrevo.com.s3.amazonaws.com/assets/vw-worldauto/vwmarker.png'),
			firstaddress = dealers[0].address,
			mgeocoder = new google.maps.Geocoder(),
			maddress = [],
			mlng = [],
			mlat = [],
			mid = [],
			mtitle = [],
			mphone = [],
			mzip = [],
			dbasecache = [],
			counter = 0,
			mloc, swy, swx, ney, nex, mapOptions, map, marker;

		function attachInfoWindow(marker) {
			var contentext = '<h5 class="wmarker">' + mtitle[counter] + '</h5>';
			contentext += '<div class="wmarker"><a href="http://' + mid[counter] + '.hostrevo.com/inventory/Used/" target="_blank">Open Site</a>';
			contentext += '<a href="javascript:mapsC.assign(' + mzip[counter] + ', 30)">Zoom In</a></div>';
			var infowindow = new google.maps.InfoWindow({
				content: contentext
			});
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(marker.get('map'), marker);
			});
			counter += 1;
			if (counter < dealers.length) {
				markerloop();
			} else { /* console.log(counter + '/' + dealers.length + ' -- ' + swy + '/' + swx + ' - ' + ney + '/' + nex); */
				var msw = new google.maps.LatLng(swx, swy);
				var mne = new google.maps.LatLng(nex, ney);
				map.fitBounds(new google.maps.LatLngBounds(msw, mne)); /* console.log(dbasecache.toString()); */
			}
		}
		// attach to marker, links and infowindow

		function markeradd(results, status) {
			if (status === google.maps.GeocoderStatus.OK || status === 'dealerloc') {
/*
dbasecache.push(' { id: "' + dealers[counter].blog_id + '", name: "' + dealers[counter].name + '", lng: ' + results[0].geometry.location.Ya + ', lat: ' + results[0].geometry.location.Xa + ' }');
				console.log(dealers[counter].blog_id + results[0].geometry.location);
*/
				var result = status !== 'dealerloc' ? results[0].geometry.location : results;
				swy = swy > result.Ya ? result.Ya : swy;
				swx = swx > result.Xa ? result.Xa : swx;
				ney = ney < result.Ya ? result.Ya : ney;
				nex = nex < result.Xa ? result.Xa : nex;
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(result.Xa, result.Ya),
					icon: markerIcon,
					map: map
				});
				attachInfoWindow(marker);
			} else { /* console.log(status + 'console'); */
				if (status === 'OVER_QUERY_LIMIT') {
					setTimeout(function() { /* console.log('over query limit' + counter); */
						markerloop();
					}, 1000);
				}
			}
		}
		// create marker

		function idloc(ids) {
			for (var rr = 0; rr < dealerloc.length; rr += 1) {
				if (dealerloc[rr].id === ids) { /* console.log(dealerloc[rr].id + ' ' + dealerloc[rr].lng + ' ' + dealerloc[rr].lat + ' ' + ids); */
					return [dealerloc[rr].lng, dealerloc[rr].lat];
				}
			}
		}
		// when dealerloc find loc for id

		function markerloop() {
			maddress.push(dealers[counter].address);
			mid.push(dealers[counter].blog_id);
			mtitle.push(dealers[counter].name);
			mphone.push(dealers[counter].phone);
			mzip.push(dealers[counter].zip);
			if (typeof dealerloc === 'undefined') { /* console.log(maddress[counter]); */
				setTimeout(function() {
					mgeocoder.geocode({
						'address': maddress[counter]
					}, markeradd);
				}, 200);
			} else {
				mloc = idloc(dealers[counter].blog_id);
				mlng.push(mloc[0]);
				mlat.push(mloc[1]); /* console.log(mtitle[counter] + ' ' + mlng[counter] + ' ' + mlat[counter]); */
				markeradd({
					'Ya': mloc[0],
					'Xa': mloc[1]
				}, 'dealerloc');
			}
		}
		// marker loop

		function cmapinit(ya, xa) {
			// init bound location variables
			swy = ney = ya;
			swx = nex = xa;
			// init google map options
			mapOptions = {
				center: new google.maps.LatLng(xa, ya),
				zoom: 12,
				scrollwheel: false,
				styles: gmapGreyStyle,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				maxZoom: 12
			};
			map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			// call for marker creation loop
			markerloop();
		}
		// create map and init bound variables
		if (typeof dealerloc === 'undefined') {
			// using geocode service
			mgeocoder.geocode({
				'address': firstaddress
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					cmapinit(results[0].geometry.location.Ya, results[0].geometry.location.Xa);
				} else {
					console.log('google maps error: ' + status);
				}
			});
		} else {
			// cached dealer location case
			mloc = idloc(dealers[0].blog_id);
			cmapinit(mloc[0], mloc[1]);
		}
		// dealerloc var vs geocode init
	}
	// initialize function

	function _getData(zip, radius) {
		// load cache dealerloc json
		var datax = 'json=true&requesttype=maps'; /* console.log('zip: ' + zip + 'radius: ' + radius); */
		datax = typeof zip !== 'undefined' ? datax + '&zipcode=' + zip : datax;
		datax = typeof radius !== 'undefined' ? datax + '&radius=' + radius : datax;
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			data: datax,
			url: '{THEME_ROOT}/_ajax.php',
			success: function(msg) { /* console.log(msg); */
				if (msg.dealers) {
					initialize(msg.dealers);
				} else {
					// echo all dealers
					_getData('zipcode', 'radius');
				}
			}
		});
	}
	// get dealer map data

	function validate(ids) {
		var reg = (ids === 'zipdealer') ? /^[0-9]{5}$/ : /^[0-9]{2,3}$/;
		return reg.test(jQuery('#' + ids).val())
	}
	// zip and radius input fields validator

	function _ichange(e) {
		// validate input fields
		if (validate(jQuery(e).attr('id'))) {
			if (validate('zipdealer') && validate('radiusdealer')) {
				var dzip = jQuery('#zipdealer').val();
				var dradius = jQuery('#radiusdealer').val();
				// trigger map dealer search
				_getData(dzip, dradius);
				// update search inventory parameters
				jQuery('#zipcode').val(dzip);
				jQuery('#radius').val(dradius).change();
				// save the new cookies
				document.cookie = 'radius=' + escape(dradius) + '; path=/';
				document.cookie = 'zipcode=' + escape(dzip) + '; path=/';
			}
		} else {
			jQuery(e).val('');
		}
	}
	// input fields change event

	function _assign(zipd, radiusd) {
		// save the new cookies
		document.cookie = 'radius=' + escape(radiusd) + '; path=/';
		document.cookie = 'zipcode=' + escape(zipd) + '; path=/';
		// reload the page
		document.location.reload();
	}
	// change zip and radius from a link
	return {
		zipc: _zipc,
		radiusc: _radiusc,
		assign: _assign,
		getData: _getData,
		ichange: _ichange
	};
}());
jQuery(document).ready(function() {
	if (mapsC.zipc !== '' && mapsC.radiusc !== '') {
		mapsC.getData(mapsC.zipc, mapsC.radiusc);
		jQuery('#zipdealer').val(mapsC.zipc);
		jQuery('#radiusdealer').val(mapsC.radiusc);
	} else {
		mapsC.getData();
	}
});