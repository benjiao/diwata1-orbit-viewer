$(function() {
    $.getJSON('http://api.orbit.phl-microsat.xyz/decay/diwata1', function(data){

        var vis = d3.select("#visualization");
        var WIDTH = 1000;
        var HEIGHT = 500;
        var MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        };

        var min_timestamp = d3.min(data, function(d){ return d.timestamp; });
        var max_timestamp = d3.max(data, function(d){ return d.timestamp; });
        var min_altitude = d3.min(data, function(d){ return d.altitude; });
        var max_altitude = d3.max(data, function(d){ return d.altitude; });

        console.log(min_timestamp);
        console.log(max_timestamp);

        var xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([min_timestamp, max_timestamp]);
        var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([min_altitude, max_altitude]);

        var xAxis = d3.svg.axis().scale(xScale);
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");


        // Draw Labels and Axes
        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);


        // Draw Line
        var lineGen = d3.svg.line()
            .x(function(d){ return xScale(d.year); })
            .y(function(d){ return yScale(d.sale); })
            .interpolate("basis");

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        // vis.append("svg:path")
        //     .attr('d', lineGen(data))
        //     .attr('stroke', 'green')
        //     .attr('stroke-width', 2)
        //     .attr('fill', 'none');
    });
});
