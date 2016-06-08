$(function() {
    var dataPoints = []
    $.getJSON('http://api.orbit.phl-microsat.xyz/passes/41463', function(results){
        var passes = []

        for (var i=0; i < results.data.length; i++) {
            passes.push({
                rise_time: moment.unix(results.data[i].rise_time).tz("Asia/Manila").format('MMMM Do YYYY, HH:mm:ss Z'),
                set_time: moment.unix(results.data[i].set_time).tz("Asia/Manila").format('MMMM Do YYYY, HH:mm:ss Z'),
                max_altitude_time: moment.unix(results.data[i].max_altitude_time).tz("Asia/Manila").format('MMMM Do YYYY, HH:mm:ss Z'),
                rise_azimuth: results.data[i].rise_azimuth,
                set_azimuth: results.data[i].set_azimuth,
                max_altitude: results.data[i].max_altitude,
                duration: results.data[i].duration});
        }

        update_results(passes, function(){
            $('.loading').hide();
            $('.main').show();
        })

    });
});
          
function update_results(passes, callback){
    $.get('templates/passes-table.html', function(template){
        $('.asti-passes').html(Mustache.render(template, {"passes": passes}));
        callback();
    });
}