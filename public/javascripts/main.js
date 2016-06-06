$(function() {
    var main_map = L.map('main-map').setView([12.5, 121], 5);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        minZoom: 5,
        id: 'your.mapbox.project.id',
        accessToken: 'your.mapbox.public.access.token'
    }).addTo(main_map);

    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1.geojson', function(data){
        console.log(data);

        for(i=0; i<data.length; i++){
            data[i].features[0].properties['is_entry_point'] = true
        }
        var geoJsonLayer = L.geoJson(data, {
            style: function(feature){
                if (feature.properties.is_entry_point) {
                    return {color: '#0000FF' }
                }
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: 2, fillOpacity: 0.85, color: '#FF0000'});
            },
            onEachFeature: function (feature, layer) {
                var local_time = moment.tz(feature.properties.timestamp * 1000, "Asia/Manila").format('YYYY-MM-DD HH:mm:SS Z');
                layer.bindPopup(local_time);
            }
        });

        main_map.addLayer(geoJsonLayer);
    });
});

