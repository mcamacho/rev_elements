(function () {
    'use strict';
    /*global document, window, jQuery, google*/
    /*attach to marker, links and infowindow*/
    function attachInfoWindow(marker, message) {
        var contentext = '<h5>' + message.name + '</h5><a href="' + message.link + '" target="_blank">Open Site</a>';
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
            mtitle;
        /*marker loop*/
        for (ele = 0; ele < msg.length; ele = ele + 1) {
            mtitle = msg[ele].name;
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(msg[ele].latitude, msg[ele].longitude),
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
            url: '{home}/wp-content/themes/_bootrev/js/dealers.json',
            success: function (msg) {
                initialize(msg.dealers);
            }
        });
    }

    jQuery(document).ready(function () {
        getData();
    });
}());