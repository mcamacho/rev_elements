var mapsC = (function() {
	'use strict'; /*global document, window, jQuery, google, gmapGreyStyle, dealerloc*/
	// initialize the map

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
		// attach to marker, links and infowindow

		function attachInfoWindow(marker) {
			var contentext = '<h5>' + mtitle[counter] + '</h5><a href="http://' + mid[counter] + '.hostrevo.com" target="_blank">Open Site</a>';
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
				map.fitBounds(new google.maps.LatLngBounds(msw, mne));
				/* console.log(dbasecache.toString()); */
			}
		}
		// create marker

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
		// when dealerloc find loc for id

		function idloc(ids) {
			for (var rr = 0; rr < dealerloc.length; rr += 1) {
				if (dealerloc[rr].id === ids) { /* console.log(dealerloc[rr].id + ' ' + dealerloc[rr].lng + ' ' + dealerloc[rr].lat + ' ' + ids); */
					return [dealerloc[rr].lng, dealerloc[rr].lat];
				}
			}
		}
		// marker loop

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
		// create map and init bound variables

		function cmapinit(ya, xa) {
			// init bound location variables
			swy = ney = ya;
			swx = nex = xa;
			// init google map options
			mapOptions = {
				center: new google.maps.LatLng(xa, ya),
				zoom: 12,
				styles: gmapGreyStyle,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				maxZoom: 10
			};
			map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			// call for marker creation loop
			markerloop();
		}
		// dealerloc var vs geocode init
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
	}
	// load dealer map data

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
					// echo no dealers
				}
			}
		});
	}
	return {
		getData: _getData
	};
}());
jQuery(document).ready(function() {
	mapsC.getData();
});