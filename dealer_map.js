(function () {
    'use strict';
    /*global document, window, jQuery, google*/
    /*attach to marker, links and infowindow*/
    function attachInfoWindow(marker, message) {
        var contentext = '<h5>' + message.City + '</h5><a href="' + message.City + '" target="_blank">Open Site</a>';
        var infowindow = new google.maps.InfoWindow({
            content: contentext
        });
        /*google.maps.event.addListener(marker, 'click', function () {
            window.open(message.link);
        });*/
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(marker.get('map'), marker);
        });
        /*google.maps.event.addListener(marker, 'mouseout', function () {
            infowindow.close();
        });*/
    }
    /*initialize the map*/
    function initialize(msg) {
        var mapLatlng = new google.maps.LatLng(37.09024, -95.712891),
            markerIcon = new google.maps.MarkerImage('http://cdn.hostrevo.com.s3.amazonaws.com/assets/vw-worldauto/vwmarker.png'),
            mapOptions = {
                center: mapLatlng,
                zoom: 4,
                styles: gmapGreyStyle,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),
            ele,
            marker,
            mtitle,
            mlongitude,
            mlatitude;
        /*marker loop*/
        for (ele = 0; ele < msg.length; ele = ele + 1) {
            mtitle = String(msg[ele].City);
            mlatitude = Number(msg[ele].Latitude);
            mlongitude = Number(msg[ele].Longitude) * -1;
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(mlatitude, mlongitude),
                icon: markerIcon,
                map: map,
                title: mtitle
            });
            attachInfoWindow(marker, msg[ele]);
        }
    }
    /*load dealer map data*/
    function getData() {
        jQuery.ajax({
            type: 'POST',
            dataType: 'json',
            data: 'json=true&requesttype=maps',
            url: '{THEME_ROOT}/_ajax.php',
            success: function (msg) {
                initialize(msg.dealers);
            }
        });
    }

    jQuery(document).ready(function () {
        getData();
    });
}());