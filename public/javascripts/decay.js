$(function() {
    var dataPoints = []
    $.getJSON('http://api.orbit.phl-microsat.xyz/decay/diwata1', function(data){
        for (var i=0; i < data.length; i++) {
            dataPoints.push({x: moment(data[i].timestamp).toDate(), y: data[i].altitude});
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
                titleFontSize: 14
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
          