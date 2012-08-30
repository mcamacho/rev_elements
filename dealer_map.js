(function() {
	'use strict'; /*global document, window, jQuery, google, gmapGreyStyle*/
	// initialize the map

	function initialize(msg) {
		var dealers = msg,
			markerIcon = new google.maps.MarkerImage('http://cdn.hostrevo.com.s3.amazonaws.com/assets/vw-worldauto/vwmarker.png'),
			firstaddress = dealers[0].address,
			mgeocoder = new google.maps.Geocoder(),
			maddress = [],
			mid = [],
			mtitle = [],
			mphone = [],
			mzip = [],
			counter = 0,
			swy, swx, ney, nex, mapOptions, map, marker;
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
			} else {
				/* console.log(counter + '/' + dealers.length + ' -- ' + swy + '/' + swx + ' - ' + ney + '/' + nex); */
				var msw = new google.maps.LatLng(swx, swy);
				var mne = new google.maps.LatLng(nex, ney);
				map.fitBounds(new google.maps.LatLngBounds(msw, mne));
			}
		}
		// create marker

		function markeradd(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				/* console.log(results[0].geometry.location); */
				swy = swy > results[0].geometry.location.Ya ? results[0].geometry.location.Ya : swy;
				swx = swx > results[0].geometry.location.Xa ? results[0].geometry.location.Xa : swx;
				ney = ney < results[0].geometry.location.Ya ? results[0].geometry.location.Ya : ney;
				nex = nex < results[0].geometry.location.Xa ? results[0].geometry.location.Xa : nex;
				marker = new google.maps.Marker({
					position: results[0].geometry.location,
					icon: markerIcon,
					map: map
				});
				attachInfoWindow(marker);
			} else {
				/* console.log(status + 'console'); */
				if (status === 'OVER_QUERY_LIMIT') {
					setTimeout(function() {
						markerloop();
					}, 1000);
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
			/* console.log(maddress[counter]); */
			setTimeout(function() {
				mgeocoder.geocode({
					'address': maddress[counter]
				}, markeradd);
			}, 200);
		}
		// create map
		mgeocoder.geocode({
			'address': firstaddress
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				swy = ney = results[0].geometry.location.Ya;
				swx = nex = results[0].geometry.location.Xa;
				mapOptions = {
					center: results[0].geometry.location,
					zoom: 10,
					styles: gmapGreyStyle,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					maxZoom: 10
				};
				map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
				markerloop();
			} else {
				console.log(status);
			}
		});
	}
	// load dealer map data

	function getData() {
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			data: 'json=true&requesttype=maps',
			url: '{THEME_ROOT}/_ajax.php',
			success: function(msg) {
				/* console.log(msg); */
				if (msg.dealers) {
					initialize(msg.dealers);
				} else {
					initialize([{
						"address": "United States",
						"blog_id": "0",
						"name": "United States",
						"phone": "000",
						"zip": "01234"
					}]);
				}
			}
		});
	}
	jQuery(document).ready(function() {
		getData();
	});
}());