var svg;
var chart = d3.select("#lifeExpectancyAreaChart");
var keys = ["healthyLifeExpectancy","yearsLivedWithDisability"];

var margin = {top: 60, right: 30, bottom: 55, left: 55},
    width = +chart.attr("width") - margin.left - margin.right,
    height = +chart.attr("height") - margin.top - margin.bottom;

function drawLifeExpectancyAreaChart(data) {

    svg = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    selectedCountry = "USA";
    drawAreaChart(data);
}

function reDrawAreaChart() {
    svg.selectAll('*').remove();
    drawAreaChart(map);
}

function drawAreaChart(data) {

    var dataForSelectedCountry = getDisplayData(data);
    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(dataForSelectedCountry, function(d) { return d.year; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 90])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height+40 )
    .text("Time (year)");
    
    // Add Y axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20 )
    .text("Life expectancy")
    .attr("text-anchor", "start")

    svg.append("g")
        .attr("class","grid")
        .attr("transform","translate(0," + height + ")")
        .style("stroke-dasharray",("3,3"))
        .call(make_x_gridlines(x)
            .tickSize(-height)
            .tickFormat("")
        )

    svg.append("g")
        .attr("class","grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines(y)
            .tickSize(-width)
            .tickFormat("")
        )

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['rgba(153,213,148,0.5)','rgba(252,141,89,0.5)'])

    var colorLegend = d3.scaleOrdinal()
        .domain(keys)
        .range(['rgba(153,213,148,1)','rgba(252,141,89,1)'])

    //stack the data?
    var stackedData = d3.stack()
        .keys(keys)
        (dataForSelectedCountry);

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function(d) { console.log(d.key) ; return color(d.key); })
        .attr("d", d3.area()
            .x(function(d, i) { return x(d.data.year); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
        );

    // Legend
    var size = 15;
    var xStart = 330;
    svg.selectAll("myrect")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", xStart)
        .attr("y", function(d,i){ return i*(size+2) - 50}) 
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return colorLegend(d)})

    // Legend Text
    svg.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", xStart + size*1.7)
        .attr("y", function(d,i){ return i*(size+2) + (size/2) - 50}) 
        .text(function(d){ return getLegend(d)})
        .attr("class", "areaLegendText")
}

function getLegend(d) {
    switch(d) {
        case "healthyLifeExpectancy":
            return "Healthy life expectancy";
        case "yearsLivedWithDisability":
            return "Years lived with disability";
    }
}

function make_x_gridlines(x) {
    return d3.axisBottom(x)
        .ticks(8)
}
function make_y_gridlines(y) {
    return d3.axisLeft(y)
        .ticks(9)
}
function getDisplayData(data) {
    var dataForSelectedCountry = [];

    if (selectedCountry == null) {
        data.forEach((element) => {
            console.log(element);
        })
    }
    else {
        data.get(selectedCountry).lifeExpectancyInfoPerYear.forEach((element) => {
            dataForSelectedCountry.push({
                year: element.year,
                healthyLifeExpectancy: element.healthyLifeExpectancyBoth.toString(),
                yearsLivedWithDisability: (element.lifeExpectancyBoth - element.healthyLifeExpectancyBoth).toString()
            })
        })
    }
    return dataForSelectedCountry;
}




