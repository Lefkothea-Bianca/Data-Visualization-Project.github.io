var lineChartSvg;
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
        .attr("class", "linePath")
        .attr("fill", "none")
        .attr("stroke", function(d){ return "steelblue" })
        .attr("stroke-width", 0.5)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return d.expenditure && d.lifeExpectancy ? x(d.expenditure) : 0; })
                .y(function(d) { return d.expenditure && d.lifeExpectancy ? y(+d.lifeExpectancy) : 0; })
                (d.values)
        })
        .on("mouseover", function(d){
            d3.selectAll(".linePath").style("stroke", "gray");
            var target = event.currentTarget;
            var html = lineChartTooltipHtml(target.__data__);
            d3.select(".lineChartTooltip").style("display", "block").html(html);
            d3.select(target)
                .style("stroke", "steelblue")
                .attr("stroke-width", 3);
        })
        .on("mouseout", function(d){
            d3.selectAll(".linePath").style("stroke", "steelblue").attr("stroke-width", 0.5);
            d3.select(".lineChartTooltip").style("display", "none");
        });
}

function lineChartTooltipHtml(d) {
    var html = "<div class='tooltipSubheader'><strong>" + d.key + "</strong></div>";
    html += "<table class='text-right'>";
    html += "<tr><th></th><th>2000</th><th>2018</th></tr>";
    html += "<tr><th>Health Expenditure:</th><td>"+d.values[0].expenditure+"</td><td>"+d.values[1].expenditure+"</td></tr>";
    html += "<tr><th>Life Expectancy:</th><td>"+d.values[0].lifeExpectancy+"</td><td>"+d.values[1].lifeExpectancy+"</td></tr></table>";
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
            && element.wdiInfoPerYear.length > 0)
        {
            var infoWDIMinYear = element.wdiInfoPerYear.filter(_=>_.year == minYear.toString())[0];
            var infoWDIMaxYear = element.wdiInfoPerYear.filter(_=>_.year == maxYear.toString())[0];
            var minYearExpenditureParsed = parseInt(infoWDIMinYear.currentHealthExpenditurePerCapita);
            var maxYearExpenditureParsed = parseInt(infoWDIMaxYear.currentHealthExpenditurePerCapita);
            if (!isNaN(minYearExpenditureParsed) && !isNaN(maxYearExpenditureParsed)) {
                var values = [];
                var infoLEMinYear = element.lifeExpectancyInfoPerYear.filter(_=>_.year == minYear.toString())[0];
                var infoLEMaxYear = element.lifeExpectancyInfoPerYear.filter(_=>_.year == maxYear.toString())[0];

                values.push({year: minYear.toString(), expenditure: minYearExpenditureParsed, lifeExpectancy: infoLEMinYear.lifeExpectancyBoth});
                values.push({year: maxYear.toString(), expenditure: maxYearExpenditureParsed, lifeExpectancy: infoLEMaxYear.lifeExpectancyBoth})
                dataToDisplay.push({
                    key: element.location,
                    values: values
                });
            }
        }
    })
    return dataToDisplay;
}