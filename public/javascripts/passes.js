$(function() {
    var dataPoints = []

    load_asti_passes();

    $.when(
        load_asti_passes(),
        load_tohoku_passes()
    ).then(function(){
        $('.loading').hide();
        $('.main').show();
    });
});

function load_asti_passes(){
    return $.getJSON('http://api.orbit.phl-microsat.xyz/passes/41463', {
        lon: 121.071999,
        lat: 14.647318,
        alt: 77.0
    },
    function(results){
        var passes = []

        for (var i=0; i < results.data.length; i++) {
            passes.push({
                rise_time: moment.unix(results.data[i].rise_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                set_time: moment.unix(results.data[i].set_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                max_altitude_time: moment.unix(results.data[i].max_altitude_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                rise_azimuth: results.data[i].rise_azimuth,
                set_azimuth: results.data[i].set_azimuth,
                max_altitude: results.data[i].max_altitude,
                duration: results.data[i].duration});
        }

        $.get('templates/passes-table.html', function(template){
            $('.asti-passes').html(Mustache.render(template, {"passes": passes}));
        });
    });
}

function load_tohoku_passes(){
    return $.getJSON('http://api.orbit.phl-microsat.xyz/passes/41463', {
        lon: 140.8361905280001,
        lat: 38.257947638000076,
        alt: 0
    },
    function(results){
        var passes = []

        for (var i=0; i < results.data.length; i++) {
            passes.push({
                rise_time: moment.unix(results.data[i].rise_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                set_time: moment.unix(results.data[i].set_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                max_altitude_time: moment.unix(results.data[i].max_altitude_time).tz("Asia/Manila").format('MMMM DD YYYY, HH:mm:ss z'),
                rise_azimuth: results.data[i].rise_azimuth,
                set_azimuth: results.data[i].set_azimuth,
                max_altitude: results.data[i].max_altitude,
                duration: results.data[i].duration});
        }

        $.get('templates/passes-table.html', function(template){
            $('.tohoku-passes').html(Mustache.render(template, {"passes": passes}));
        });
    });
}
