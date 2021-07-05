var svg;
var x;
var dataForSelectedCountry;
var areaChartTooltip;
var focus;
var focus2;
var vertline;
var chart = d3.select("#lifeExpectancyAreaChart");
var keys = ["healthyLifeExpectancy","yearsLivedWithDisability"];

var areaChartMargin = {top: 60, right: 30, bottom: 55, left: 55},
    areaChartWidth = +chart.attr("width") - areaChartMargin.left - areaChartMargin.right,
    areaChartHeight = +chart.attr("height") - areaChartMargin.top - areaChartMargin.bottom;

function drawLifeExpectancyAreaChart(data) {

    svg = chart.append("svg")
        .attr("width", areaChartWidth + areaChartMargin.left + areaChartMargin.right)
        .attr("height", areaChartHeight + areaChartMargin.top + areaChartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + areaChartMargin.left + "," + areaChartMargin.top + ")");

    drawAreaChart(data);
}

function reDrawAreaChart() {
    svg.selectAll('*').remove();
    drawAreaChart(map);
}

function drawAreaChart(data) {
    dataForSelectedCountry = getDisplayDataForAreaChart(data);

    // Add X axis
    x = d3.scaleLinear()
        .domain(d3.extent(dataForSelectedCountry, function(d) { return d.year; }))
        .range([ 0, areaChartWidth ]);
    svg.append("g")
        .attr("transform", "translate(0," + areaChartHeight + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 90])
        .range([ areaChartHeight, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", areaChartWidth)
        .attr("y", areaChartHeight+40 )
        .text("Time (year)");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("Life expectancy")
        .attr("text-anchor", "start")

    // Add Grid Lines
    svg.append("g")
        .attr("class","grid")
        .attr("transform","translate(0," + areaChartHeight + ")")
        .style("stroke-dasharray",("3,3"))
        .call(make_x_gridlines(x)
            .tickSize(-areaChartHeight)
            .tickFormat("")
        )

    svg.append("g")
        .attr("class","grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines(y)
            .tickSize(-areaChartWidth)
            .tickFormat("")
        )

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['rgba(153,213,148,0.5)','rgba(252,141,89,0.5)'])

    var colorLegend = d3.scaleOrdinal()
        .domain(keys)
        .range(['rgba(153,213,148,1)','rgba(252,141,89,1)'])

    //stack the data
    var stackedData = d3.stack()
        .keys(keys)
        (dataForSelectedCountry);

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", d3.area()
            .x(function(d, i) { return x(d.data.year); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
        );

    // Legend
    var size = 15;
    var xStart = 300;
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
        .attr("x", xStart + size*1.6)
        .attr("y", function(d,i){ return i*(size+5) + (size/2) - 50})
        .text(function(d){ return getLegend(d)})
        .attr("class", "areaLegendText")

    setupTooltip();
}

function mousemove() {
    var bisectDate = d3.bisector(function(d) {
        return d.year;
    }).left;

    var areaChartOverlay = d3.select("#areaChartOverlay") ;
    var marginLeft = areaChartMargin.left + 10;
    var areaChartTooltipWidth = areaChartTooltip.node().getBoundingClientRect().width;

    var x0 = x.invert(d3.pointer(event, this)[0]),
        i = bisectDate(dataForSelectedCountry, x0, 1),
        d0 = dataForSelectedCountry[i - 1],
        d1 = dataForSelectedCountry[i];
    if (d0 && d1) {
        d= x0 - d0.year > d1.year - x0 ? d1 : d0;
        var totalYears = parseFloat(d['healthyLifeExpectancy'])+parseFloat(d['yearsLivedWithDisability'])
        var healthyYears = parseFloat(d['healthyLifeExpectancy']);
        focus.attr("transform", "translate(" + x(d.year) + "," + (areaChartOverlay.attr("height") * (90-totalYears))/90 + ")");
        focus2.attr("transform", "translate(" + x(d.year) + "," + (areaChartOverlay.attr("height") * (90-healthyYears))/90 + ")");

        var absoluteMousePos = d3.pointer(event, this);
        var xPosition = absoluteMousePos[0];

        areaChartTooltip
            .style('bottom', (areaChartOverlay.attr("height") * totalYears)/90 +'px')
            .style('position', 'absolute')
            .style('z-index', 1001);
        areaChartTooltip.html(getAreaChartTooltipHtml(d));
        if (xPosition < (areaChartOverlay.attr("width")/2)) {
            areaChartTooltip.style('left', x(d.year) + marginLeft +'px');
        }
        else {
            areaChartTooltip.style('left', x(d.year) - (areaChartTooltipWidth - areaChartMargin.left + 10) +'px');
        }
        vertline.attr('x1', x(d.year)).attr('x2', x(d.year))
    }
}

function getAreaChartTooltipHtml(d) {
    var html = "<div class='tooltipSubheader'><strong>" + d.year + "</strong></div>";
    var healthyLifeExpectancyTitle = getLegend('healthyLifeExpectancy');
    var yearsLivedWithDisabilityTitle = getLegend('yearsLivedWithDisability');
    var total = Number(d['healthyLifeExpectancy']) + Number(d['yearsLivedWithDisability']);

    html +="<table class='text-right'>"
    html += "<tr><td>" + healthyLifeExpectancyTitle + ":</td><td>" + d['healthyLifeExpectancy'] + " years</td></tr>";
    html += "<tr><td>" + yearsLivedWithDisabilityTitle + ":</td><td>" + d['yearsLivedWithDisability'] + " years</td></tr>";
    html += "<tr class='bold'><td>Total:</td><td>" + total + " years</td></tr></table>";
    return html;
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

function getDisplayDataForAreaChart(data) {
    var dataForSelectedCountry = [];

    if (selectedCountry != null) {
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

function setupTooltip() {
    // Tooltip
    areaChartTooltip = d3.select("#areaChartTooltip").style("opacity", 1);

    //vertical line
    vertline = svg.append('line')
        .attr('class','vertline')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',0)
        .attr('y2',areaChartHeight)
        .attr('stroke','rgba(0,0,0,0.2)')
        .attr('stroke-width',1);

    focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5)
        .style("fill","white")
        .style("stroke",'rgba(252,141,89,1)');

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("font-size",15);

    focus2 = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus2.append("circle")
        .attr("r",5)
        .style("fill","white")
        .style("stroke",'rgba(153,213,148,1)');

    focus2.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("font-size",15);

    svg.append("rect")
        .attr("id", "areaChartOverlay")
        .attr("class", "overlay")
        .attr("width", areaChartWidth)
        .attr("height", areaChartHeight)
        .on("mouseover", function() {
            focus.style("display", null);
            focus2.style("display", null);
            areaChartTooltip.style("display", "block");
            vertline.style("display", "block");

        })
        .on("mouseout", function() {
            focus.style("display", "none");
            focus2.style("display", "none");
            areaChartTooltip.style("display", "none");
            vertline.style("display", "none");

        })
        .on("mousemove", mousemove);
}