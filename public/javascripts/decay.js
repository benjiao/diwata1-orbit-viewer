$(function() {
    var dataPoints = []
    $.getJSON('http://api.orbit.phl-microsat.xyz/decay/diwata1', function(results){

        $('.loading').hide();
        $('.main').show();

        for (var i=0; i < results.data.length; i++) {
            if (results.data[i].altitude > 120)
                dataPoints.push({x: moment(results.data[i].timestamp).toDate(), y: results.data[i].altitude});
        }
        var chart = new CanvasJS.Chart("decay-graph", {
            zoomEnabled: true,
            animationEnabled: true,
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

        update_fields(results.meta, last_item=dataPoints[dataPoints.length-1]);
        chart.render();

    });
});
          
function update_fields(meta, last_item){
    $.get('templates/decay-details.html', function(template){
        data = {
            simulation_time: moment.tz(meta.time_computed, "UTC").tz("Asia/Manila").format("D MMMM YYYY HH:mm:ss"),
            tle1: meta.tle1,
            tle2: meta.tle2,
            tle_epoch: moment(meta.tle_epoch).format("D MMMM YYYY HH:mm:ss"),
            decay_altitude: "120 km above sea level",
            projected_eol: moment.tz(last_item.x, "UTC").tz("Asia/Manila").format("D MMMM YYYY"),
            altitude_at_eol: last_item.y
        }
        $('.decay-results-table').html(Mustache.render(template, data));
    })
}