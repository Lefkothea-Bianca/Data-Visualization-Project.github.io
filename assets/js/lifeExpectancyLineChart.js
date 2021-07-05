var lineChartSvg;
var dataForSelectedCountry;
var lineChartTooltip;
var lineChart = d3.select("#lifeExpectancyLineChart");

var lineChartMargin = {top: 60, right: 30, bottom: 55, left: 55},
    lineChartWidth = +lineChart.attr("width") - lineChartMargin.left - lineChartMargin.right,
    lineChartHeight = +lineChart.attr("height") - lineChartMargin.top - lineChartMargin.bottom;

function drawLifeExpectancyLineChart(data) {

    lineChartSvg = lineChart.append("svg")
        .attr("width", lineChartWidth + lineChartMargin.left + lineChartMargin.right)
        .attr("height", lineChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")");

    drawLineChart(data);
}

function reDrawAreaChart() {
    lineChartSvg.selectAll('*').remove();
    drawLineChart(map);
}

function drawLineChart(data) {
    var displayData = getDisplayDataForLineChart(data);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 10000])
        .range([ 0, areaChartWidth ]);
    lineChartSvg.append("g")
        .attr("transform", "translate(0," + areaChartHeight + ")")
        .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([40, 90])
        .range([ lineChartHeight, 0 ]);
    lineChartSvg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label:
    lineChartSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", lineChartWidth)
        .attr("y", lineChartHeight+40 )
        .text("Healthcare expenditure per capita (current US$)");

    // Add Y axis label:
    lineChartSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("Life expectancy")
        .attr("text-anchor", "start")

    // Add Grid Lines
    lineChartSvg.append("g")
        .attr("class","grid")
        .attr("transform","translate(0," + lineChartHeight + ")")
        .style("stroke-dasharray",("3,3"))
        .call(make_x_gridlines(x)
            .tickSize(-lineChartHeight)
            .tickFormat("")
        )

    lineChartSvg.append("g")
        .attr("class","grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines(y)
            .tickSize(-areaChartWidth)
            .tickFormat("")
        )

    lineChartSvg.selectAll(".line")
        .data(displayData)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return "rgba(224, 224, 224, 1)" })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return x(d.expenditure); })
                .y(function(d) { return y(+d.lifeExpectancy); })
                (d.values)
        })
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

function make_x_gridlines(x) {
    return d3.axisBottom(x)
        .ticks(8)
}

function make_y_gridlines(y) {
    return d3.axisLeft(y)
        .ticks(9)
}

function getDisplayDataForLineChart(data) {

    var dataToDisplay = [];
        var minYear = 2000;
        var maxYear = 2018;

        data.forEach((element) => {
            if (element.lifeExpectancyInfoPerYear
                && element.lifeExpectancyInfoPerYear.length > 0
                && element.wdiInfoPerYear
                && element.wdiInfoPerYear.length > 0) {
            var values = [];
            var infoWDIMinYear = element.wdiInfoPerYear.filter(_=>_.year == minYear.toString())[0];
            var infoWDIMaxYear = element.wdiInfoPerYear.filter(_=>_.year == maxYear.toString())[0];

            var infoLEMinYear = element.lifeExpectancyInfoPerYear.filter(_=>_.year == minYear.toString())[0];
            var infoLEMaxYear = element.lifeExpectancyInfoPerYear.filter(_=>_.year == maxYear.toString())[0];

            values.push({year: minYear.toString(), expenditure: parseInt(infoWDIMinYear.currentHealthExpenditurePerCapita), lifeExpectancy: infoLEMinYear.lifeExpectancyBoth});
            values.push({year: maxYear.toString(), expenditure: parseInt(infoWDIMaxYear.currentHealthExpenditurePerCapita), lifeExpectancy: infoLEMaxYear.lifeExpectancyBoth})
            dataToDisplay.push({
                key: element.location,
                values: values
            });
        }
    })
    return dataToDisplay;
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