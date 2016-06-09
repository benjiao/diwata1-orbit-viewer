$(function() {
    $.when(
        loadAstiPasses(),
        loadTohokuPasses(),
        loadMap(),
        loadDecayGraph()
    ).then(function(){

        $('.loading').hide();
        $('.main').show();

        window.main_map.invalidateSize();
        window.decay_chart.render();

        loadClocks();
        loadTleMeta();

        // Fix for TimeCircles
        $(window).resize(function(){
            loadClocks();
        });

        window.map_was_moved = false;
    });

});

function updatePositionSummary(lat, lon, elevation){
    $.get('templates/position-summary.html', function(template){

        var data = {
            lat: lat,
            lon: lon,
            elevation: elevation
        }

        $('#position-summary').html(Mustache.render(template, data));
    });

}

function loadTleMeta(){
    $.get('templates/tle-meta.html', function(template){

        var data = {
            source: "http://celestrak.com/NORAD/elements/cubesat.txt",
            line0: "DIWATA-1",
            line1: window.tle_meta.tle1,
            line2: window.tle_meta.tle2,
            epoch: moment(window.tle_meta.tle_epoch).format("D MMMM YYYY HH:mm:ss Z"),
        }

        $('#tle-meta').html(Mustache.render(template, data));
    });
}

function loadClocks(){
    $.get('templates/clocks.html', function(template){

        var asti_pass = window.asti_passes[window.current_asti_pass]
        var tohoku_pass = window.tohoku_passes[window.current_tohoku_pass]
        var data = {
            asti_next_pass: moment.unix(asti_pass.rise_time, "UTC").tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss"),
            tohoku_next_pass: moment.unix(tohoku_pass.rise_time, "UTC").tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss"),
            asti_pass: {
                rise_time: moment.unix(asti_pass.rise_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                set_time: moment.unix(asti_pass.set_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                max_altitude_time: moment.unix(asti_pass.max_altitude_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                rise_azimuth: asti_pass.rise_azimuth,
                set_azimuth: asti_pass.set_azimuth,
                max_altitude: asti_pass.max_altitude,
                duration: asti_pass.duration
            },
            tohoku_pass: {
                rise_time: moment.unix(tohoku_pass.rise_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                set_time: moment.unix(tohoku_pass.set_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                max_altitude_time: moment.unix(tohoku_pass.max_altitude_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss z'),
                rise_azimuth: tohoku_pass.rise_azimuth,
                set_azimuth: tohoku_pass.set_azimuth,
                max_altitude: tohoku_pass.max_altitude,
                duration: tohoku_pass.duration
            },
        }
        $('#clocks').html(Mustache.render(template, data));

        $('.asti-pass-countdown').TimeCircles({ time: {
            Days: { show: false }
        }}).addListener(function(unit, value, total) {
            if(total <= 0) {
                window.current_asti_pass++;
                loadClocks();
            }
        });

        $('.tohoku-pass-countdown').TimeCircles({ time: {
            Days: { show: false }
        }}).addListener(function(unit, value, total) {
            if(total <= 0) {
                window.current_tohoku_pass++;
                loadClocks();
            }
        });
    });
}



function loadDecayGraph(){
    var dataPoints = []
    return $.getJSON('http://api.orbit.phl-microsat.xyz/decay/41463', function(results){
        window.tle_meta = {
            tle1: results.meta.tle1,
            tle2: results.meta.tle2,
            tle_epoch: results.meta.tle_epoch
        }

        for (var i=0; i < results.data.length; i++) {
            if (results.data[i].altitude > 120)
                dataPoints.push({x: moment(results.data[i].timestamp).toDate(), y: results.data[i].altitude});
        }

        window.decay_chart = new CanvasJS.Chart("decay-graph", {
            zoomEnabled: false,
            animationEnabled: true,
            title:{
                text:"Time vs. Altitude Graph",
                fontSize: 21,
                padding: 12,
            },
            axisX:{
                labelAngle: 30,
                labelFontSize: 12,
                title: "Date (UTCG)",
                titleFontSize: 14
            },
            axisY :{
                title: "Altitude (km)",
                titleFontSize: 14,
                labelFontSize: 12
            },
            data: [{
                type: 'line',
                lineThickness: 2,
                dataPoints: dataPoints
            }]
        });

        $.get('templates/decay-summary.html', function(template){
            data = {
                simulation_time: moment.tz(results.meta.time_computed, "UTC").tz("Asia/Manila").format("D MMMM YYYY HH:mm:ss"),
                tle1: results.meta.tle1,
                tle2: results.meta.tle2,
                tle_epoch: moment(results.meta.tle_epoch).format("D MMMM YYYY HH:mm:ss"),
                decay_altitude: "120 km above sea level",
                projected_eol: moment.tz(dataPoints[dataPoints.length-1].x, "UTC").tz("Asia/Manila").format("D MMMM YYYY"),
                altitude_at_eol: dataPoints[dataPoints.length-1].y
            }
            $('#decay-details').html(Mustache.render(template, data));
        });
    });
}

function loadMap(){
    main_map = L.map('main-map', {
        maxBounds:  L.latLngBounds(L.latLng(-70, -180), L.latLng(70, 180)),
        scrollWheelZoom: false
    }).setView([12.5, 121], 3);

    // Initialize base map
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        minZoom: 3,
    }).addTo(main_map);

    // Add marker for current satellite position
    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1', function(original_coordinates){
        diwata_marker = L.marker([original_coordinates.geometry.coordinates[1], original_coordinates.geometry.coordinates[0]]).addTo(main_map);
        updatePositionSummary(
            original_coordinates.geometry.coordinates[1],
            original_coordinates.geometry.coordinates[0],
            original_coordinates.properties.elevation.toFixed(5));

        main_map.panTo(new L.LatLng(original_coordinates.geometry.coordinates[1], original_coordinates.geometry.coordinates[0]));

        window.refresh_position = setInterval(function(){
            if (!window.map_was_moved){
                $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1', function(data){
                    diwata_marker.setLatLng(new L.LatLng(data.geometry.coordinates[1], data.geometry.coordinates[0]));
                    main_map.panTo(new L.LatLng(data.geometry.coordinates[1], data.geometry.coordinates[0]));

                    updatePositionSummary(
                        data.geometry.coordinates[1],
                        data.geometry.coordinates[0],
                        data.properties.elevation.toFixed(5));
                });
            }
        }, 5000);
    });

    // Add track for satelite path
    $.getJSON('http://api.orbit.phl-microsat.xyz/diwata1-path.geojson?hours=1', function(data){
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

    });
}

function loadAstiPasses(){
    return $.getJSON('http://api.orbit.phl-microsat.xyz/passes/41463', {
        lon: 121.071999,
        lat: 14.647318,
        alt: 77.0
    },
    function(results){
        var passes = []

        window.asti_passes = results.data;
        window.current_asti_pass = 0;

        for (var i=0; i < results.data.length; i++) {
            passes.push({
                rise_time: moment.unix(results.data[i].rise_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                set_time: moment.unix(results.data[i].set_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                max_altitude_time: moment.unix(results.data[i].max_altitude_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                rise_azimuth: results.data[i].rise_azimuth,
                set_azimuth: results.data[i].set_azimuth,
                max_altitude: results.data[i].max_altitude,
                duration: results.data[i].duration});
        }

        $.get('templates/passes-table-summary.html', function(template){
            $('.asti-passes').html(Mustache.render(template, {"passes": passes}));
        });
    });
}

function loadTohokuPasses(){
    return $.getJSON('http://api.orbit.phl-microsat.xyz/passes/41463', {
        lon: 140.8361905280001,
        lat: 38.257947638000076,
        alt: 0
    },
    function(results){
        var passes = []

        window.tohoku_passes = results.data;
        window.current_tohoku_pass = 0;

        for (var i=0; i < results.data.length; i++) {
            passes.push({
                rise_time: moment.unix(results.data[i].rise_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                set_time: moment.unix(results.data[i].set_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                max_altitude_time: moment.unix(results.data[i].max_altitude_time).tz("Asia/Manila").format('MMMM DD, YYYY HH:mm:ss'),
                rise_azimuth: results.data[i].rise_azimuth,
                set_azimuth: results.data[i].set_azimuth,
                max_altitude: results.data[i].max_altitude,
                duration: results.data[i].duration});
        }

        $.get('templates/passes-table-summary.html', function(template){
            $('.tohoku-passes').html(Mustache.render(template, {"passes": passes}));
        });
    });
}
