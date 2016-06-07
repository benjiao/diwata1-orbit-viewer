$(function() {
    var dataPoints = []
    $.getJSON('http://api.orbit.phl-microsat.xyz/decay/diwata1', function(results){
        update_fields(results.meta);

        $('.loading').hide();
        $('.main').show();

        for (var i=0; i < results.data.length; i++) {
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
        chart.render();

    });
});
          
function update_fields(meta){
    $.get('templates/decay-details.html', function(template){
        data = {
            simulation_time: meta.time_computed,
            tle1: meta.tle1,
            tle2: meta.tle2
        }
        $('.decay-results-table').html(Mustache.render(template, data));
    })
}