$(function() {

    var main_map = L.map('main-map', {
        maxBounds:  L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
    }).setView([12.5, 121], 3);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        minZoom: 3,
        noWrap: true,
    }).addTo(main_map);


    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1-path.geojson?hours=12', function(data){
        console.log(data);

        var orbit_path_layer = L.geoJson(data, {
            style: function(feature){
                if (feature.properties.is_entry_point) {
                    return {color: '#0000FF' }
                }
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: 2, fillOpacity: 0.85, color: '#FF0000'});
            },
            onEachFeature: function (feature, layer) {
                var local_time = moment.tz(feature.properties.timestamp * 1000, "Asia/Manila").format('YYYY-MM-DD HH:mm:ss Z');
                layer.bindPopup(local_time);
            }
        });

        main_map.addLayer(orbit_path_layer);
        main_map.panTo(new L.LatLng(0, data.features[0].geometry.coordinates[0]), {animate: true, duration: 3.0});

    });


    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1-passes.geojson?step=30', function(data){
        console.log(data);

        for(i=0; i<data.length; i++){
            data[i].features[0].properties['is_entry_point'] = true
        }
        var passes_layer = L.geoJson(data, {
            style: function(feature){
                if (feature.properties.is_entry_point) {
                    return {color: '#0000FF' }
                }
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: 2, fillOpacity: 0.85, color: '#FFAAAA'});
            },
            onEachFeature: function (feature, layer) {
                var local_time = moment.tz(feature.properties.timestamp * 1000, "Asia/Manila").format('YYYY-MM-DD HH:mm:ss Z');
                var time_string = local_time + "<br /> (" + moment(feature.properties.timestamp * 1000).fromNow() + ")"
                layer.bindPopup(time_string);
            }
        });

        main_map.addLayer(passes_layer);
    });

    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1', function(original_coordinates){
        diwata_marker = L.marker([original_coordinates.geometry.coordinates[1], original_coordinates.geometry.coordinates[0]]).addTo(main_map);

        setInterval(function(){
            $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1', function(data){
                diwata_marker.setLatLng(new L.LatLng(data.geometry.coordinates[1], data.geometry.coordinates[0]));

                var infobox_content = "";
                infobox_content += "time: " + moment.tz(data.properties.timestamp * 1000, "Asia/Manila").format('YYYY-MM-DD HH:mm:ss Z');
                infobox_content += "<br /> lat: " + data.geometry.coordinates[1];
                infobox_content += "<br /> lng: " + data.geometry.coordinates[0];
                infobox_content += "<br /> elevation (m): " + data.properties.elevation;

                $("#info-box").html(infobox_content);
            });
        }, 5000);
    });
});
