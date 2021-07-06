var lineChartSvg;
var lineChart = d3.select("#lifeExpectancyLineChart");

var lineChartMargin = {top: 80, right: 40, bottom: 55, left: 55},
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

function reDrawLineChart() {
    lineChartSvg.selectAll('*').remove();
    drawLineChart(map);
}

function drawLineChart(data) {
    var displayData = getDisplayDataForLineChart(data);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 10000])
        .range([ 0, lineChartWidth ]);
    lineChartSvg.append("g")
        .attr("transform", "translate(0," + lineChartHeight + ")")
        .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([45, 85])
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
            .tickSize(-lineChartWidth)
            .tickFormat("")
        )

    //arrow
    lineChartSvg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "triangle")
        .attr("refX", 2)
        .attr("refY", 2)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("markerUnits","userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("class", "trianglePath")
        .attr("d", "M 0 0 4 2 0 4 1 2")
        .style("fill", "steelblue");

    //arrow
    lineChartSvg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "triangleSelected")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("markerUnits","userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "steelblue");

    //linetext
    lineChartSvg.append("text")
        .attr("class","lineText bold")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", "steelblue");

    //line
    lineChartSvg.selectAll(".line")
        .data(displayData)
        .enter()
        .append("path")
        .attr("marker-end", "url(#triangle)")
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
        .on("click", function(d) {
            var target = event.currentTarget;
            var targetData = target.__data__;
            selectedCountry = targetData.key;
        })
        .on("mouseover", function(d){
            resetAllToMinOpacity();

            //Style Target
            styleTarget(event.currentTarget, x, y);
        })
        .on("mouseout", function(d){
            resetAllToMinOpacity();
            styleTarget(getSelectedLine(), x, y);
        });
}

function styleTarget(target, x, y) {
    var targetData = target.__data__;
    styleTargetLine(d3.select(target));
    styleTargetLineText(targetData, x, y);
    styleTooltip(targetData);
}

function styleTargetLine(target) {
    target.style("stroke", "steelblue").attr("stroke-width", 4);
    target.attr("marker-end", "url(#triangleSelected)");
}

function styleTargetLineText(targetData, x, y) {
    d3.select(".lineText")
        .style("display", "block")
        .text(targetData.key)
        .attr("transform", "translate(" + x(targetData.values[1].expenditure)+ "," + y(targetData.values[1].lifeExpectancy + 2) + ")");
}

function styleTooltip(targetData) {
    d3.select(".lineChartTooltip").style("display", "block").html(lineChartTooltipHtml(targetData));
}

function resetAllToMinOpacity() {
    d3.selectAll(".linePath").style("stroke", "rgba(128,128,128,0.5)").attr("stroke-width", 0.5);
    d3.selectAll(".trianglePath").style("fill", "rgba(128,128,128,0.5)");
    d3.selectAll(".linePath").attr("marker-end", "url(#triangle)");
    d3.select(".lineChartTooltip").style("display", "none");
    d3.select(".lineText").style("display", "none");
}

function getSelectedLine() {
   return Array.from(d3.selectAll(".linePath")._groups[0]).filter(_=>_.__data__.key == selectedCountry)[0];
}

function lineChartTooltipHtml(d) {
    var html = "<table class='text-right lineChartTable'>";
    html += "<tr><th></th><th class='text-center'>2000</th><th class='text-center'>2018</th></tr>";
    html += "<tr><th>Health expenditure per capita:</th><td>"+d.values[0].expenditure+" (US$)</td><td>"+d.values[1].expenditure+" (US$)</td></tr>";
    html += "<tr><th>Life expectancy:</th><td>"+d.values[0].lifeExpectancy+" years</td><td>"+d.values[1].lifeExpectancy+" years</td></tr></table>";
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