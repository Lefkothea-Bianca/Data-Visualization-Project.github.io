var lineChartSvg;
var lineChart = d3.select("#lifeExpectancyLineChart");
var xLineChart, yLineChart;
var allGroup = [{ name: "Healthcare expenditure", value: "expenditure" }, { name: "GDP", value: "gdp" }]
const startYear = 1990;
const endYear = 2018;
var startYearSelected = startYear;
var endYearSelected = endYear;
const yearRange = Array(endYear - startYear + 1).fill().map((_, idx) => startYear + idx);

var group = "expenditure";

var lineChartMargin = { top: 90, right: 40, bottom: 55, left: 55 },
    lineChartWidth = +lineChart.attr("width") - lineChartMargin.left - lineChartMargin.right,
    lineChartHeight = +lineChart.attr("height") - lineChartMargin.top - lineChartMargin.bottom;

function drawLifeExpectancyLineChart(data) {

    lineChartSvg = lineChart.append("svg")
        .attr("width", lineChartWidth + lineChartMargin.left + lineChartMargin.right)
        .attr("height", lineChartHeight + lineChartMargin.top + lineChartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")");

    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d.name; }) // text showed in the menu
        .attr("value", function (d) { return d.value; })

    d3.select("#selectButton").on("change", function (d) {
        var selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })

    selectRangeButtonsManipulation();
    drawLineChart(data);
}

function reDrawLineChart() {
    resetAllToMinOpacity();
    styleTarget(getSelectedLine());
}

function update(selectedGroup) {
    group = selectedGroup;
    resetLineChartHeader();
    reDrawLineChartOnUserInput();
}

function reDrawLineChartOnUserInput() {
    lineChartSvg.selectAll('*').remove();
    drawLineChart(map);
}

function drawLineChart(data) {
    var displayData = getDisplayDataForLineChart(data);

    // Add X axis
    xLineChart = d3.scaleLinear()
        .domain([0, getLineChartDomain(displayData)])
        .range([0, lineChartWidth]);
    lineChartSvg.append("g")
        .attr("transform", "translate(0," + lineChartHeight + ")")
        .call(d3.axisBottom(xLineChart).ticks(5));

    // Add Y axis
    yLineChart = d3.scaleLinear()
        .domain([45, 85])
        .range([lineChartHeight, 0]);
    lineChartSvg.append("g")
        .call(d3.axisLeft(yLineChart));

    // Add X axis label:
    lineChartSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", lineChartWidth)
        .attr("y", lineChartHeight + 40)
        .text(getLineChartXLabel());

    // Add Y axis label:
    lineChartSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Life expectancy")
        .attr("text-anchor", "start")

    // Add Grid Lines
    lineChartSvg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + lineChartHeight + ")")
        .style("stroke-dasharray", ("3,3"))
        .call(make_x_gridlines(xLineChart)
            .tickSize(-lineChartHeight)
            .tickFormat("")
        )

    lineChartSvg.append("g")
        .attr("class", "grid")
        .style("stroke-dasharray", ("3,3"))
        .call(make_y_gridlines(yLineChart)
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
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("class", "trianglePath")
        .attr("d", "M 0 0 4 2 0 4 1 2")
        .style("fill", "rgba(128,128,128,0.5)");

    //arrow for selected line
    lineChartSvg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "triangleSelected")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "steelblue");

    //linetext
    lineChartSvg.append("text")
        .attr("class", "lineText bold")
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
        .attr("stroke", function (d) { return "rgba(128,128,128,0.5)" })
        .attr("stroke-width", 0.5)
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) { return d.expenditure && d.lifeExpectancy ? xLineChart(d.expenditure) : 0; })
                .y(function (d) { return d.expenditure && d.lifeExpectancy ? yLineChart(+d.lifeExpectancy) : 0; })
                (d.values)
        })
        .on("click", function (d) {
            var target = event.currentTarget;
            var targetData = target.__data__;
            selectedCountry = targetData.key;
            applyCountrySelectionChangeToCharts();
        })
        .on("mouseover", function (d) {
            resetAllToMinOpacity();

            //Style Target
            styleTarget(event.currentTarget);
        })
        .on("mouseout", function (d) {
            resetAllToMinOpacity();
            styleTarget(getSelectedLine());
        });
    styleTarget(getSelectedLine());
}

function styleTarget(target) {
    if (target) {
        var targetData = target.__data__;
        styleTargetLine(d3.select(target));
        styleTargetLineText(targetData);
    }
    styleTooltip(targetData);
}

function styleTargetLine(target) {
    target.style("stroke", "steelblue").attr("stroke-width", 4);
    target.attr("marker-end", "url(#triangleSelected)");
}

function styleTargetLineText(targetData) {
    d3.select(".lineText")
        .style("display", "block")
        .text(targetData.key)
        .attr("transform", "translate(" + xLineChart(targetData.values[1].expenditure) + "," + yLineChart(targetData.values[1].lifeExpectancy + 2) + ")");
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
    return Array.from(d3.selectAll(".linePath")._groups[0]).filter(_ => _.__data__.key == selectedCountry)[0];
}

function lineChartTooltipHtml(d) {
    if (!d || d.length == 0) {
        var factor = getLineChartFactorForHeader();
        var limitYears = getYearLimitsByFactor();
        html = "<div>No data for selected year range.</div><div>For better results with ["+factor+"], query between years <span class='bold'>"+limitYears[0]+"</span> and <span class='bold'>"+limitYears[1]+"</span>.</div>";
        return html;
    }
    var html = "<table class='text-right lineChartTable'>";
    html += "<tr><th></th><th class='text-center'>"+startYearSelected+"</th><th class='text-center'>"+endYearSelected+"</th></tr>";
    html += "<tr><th>"+getLineChartTableDataFactorLabel()+":</th><td>" + d.values[0].expenditure + " " +getLineChartTableDataFactorMetricLabel() + "</td><td>" + d.values[1].expenditure + " " +getLineChartTableDataFactorMetricLabel() + "</td></tr>";
    html += "<tr><th>Life expectancy:</th><td>" + d.values[0].lifeExpectancy + " years</td><td>" + d.values[1].lifeExpectancy + " years</td></tr></table>";
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

    data.forEach((element) => {
        if (element.lifeExpectancyInfoPerYear
            && element.lifeExpectancyInfoPerYear.length > 0
            && element.wdiInfoPerYear
            && element.wdiInfoPerYear.length > 0) {
            var infoWDIMinYear = element.wdiInfoPerYear.filter(_ => _.year == startYearSelected.toString())[0];
            var infoWDIMaxYear = element.wdiInfoPerYear.filter(_ => _.year == endYearSelected.toString())[0];
            var minValueParsed = group === "gdp" ? parseInt(infoWDIMinYear.gdpPerCapita) : parseInt(infoWDIMinYear.currentHealthExpenditurePerCapita);
            var maxValueParsed = group === "gdp" ? parseInt(infoWDIMaxYear.gdpPerCapita) : parseInt(infoWDIMaxYear.currentHealthExpenditurePerCapita);
            if (!isNaN(minValueParsed) && !isNaN(maxValueParsed)) {
                var values = [];
                var infoLEMinYear = element.lifeExpectancyInfoPerYear.filter(_ => _.year == startYearSelected.toString())[0];
                var infoLEMaxYear = element.lifeExpectancyInfoPerYear.filter(_ => _.year == endYearSelected.toString())[0];

                values.push({ year: startYearSelected.toString(), expenditure: minValueParsed, lifeExpectancy: infoLEMinYear.lifeExpectancyBoth });
                values.push({ year: endYearSelected.toString(), expenditure: maxValueParsed, lifeExpectancy: infoLEMaxYear.lifeExpectancyBoth })
                dataToDisplay.push({
                    key: element.location,
                    values: values
                });
            }
        }
    })
    return dataToDisplay;
}

function getLineChartXLabel() {
    switch(group) {
        case "expenditure": return "Healthcare expenditure per capita (current US$)";
        case "gdp": return "GDP per capita, PPP (current international $)";
    }
}

function getLineChartTableDataFactorLabel() {
    switch(group) {
        case "expenditure": return "Health expenditure per capita";
        case "gdp": return "GDP per capita (PPP)";
    }
}

function getLineChartTableDataFactorMetricLabel() {
    switch(group) {
        case "expenditure": return "(US$)";
        case "gdp": return "($)";
    }
}

function getYearLimitsByFactor() {
    switch(group) {
        case "expenditure": return [2000, 2018];
        case "gdp": return [1990, 2018];
    }
}

function resetLineChartHeader() {
    var factor = document.getElementById("selectedFactor");
    factor.innerHTML = getLineChartFactorForHeader();
}

function getLineChartFactorForHeader() {
    switch(group) {
        case "expenditure": return "Healthcare expenditure";
        case "gdp": return "GDP";
    }
}

function getLineChartDomain(data) {
    return  d3.max(data.map(_=>d3.max([_.values[0].expenditure,_.values[1].expenditure])));
}

function selectRangeButtonsManipulation() {
    d3.select("#selectButtonYearFrom")
        .selectAll('myOptions')
        .data(yearRange)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; })

    d3.select("#selectButtonYearFrom").on("change", function (d) {
        startYearSelected = d3.select(this).property("value");
        reDrawLineChartOnUserInput();
    })

    d3.select("#selectButtonYearTo")
        .selectAll('myOptions')
        .data(yearRange)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; })
        .property("selected", function(d){ return d === yearRange[yearRange.length - 1]; })

    d3.select("#selectButtonYearTo").on("change", function (d) {
        endYearSelected = d3.select(this).property("value");
        reDrawLineChartOnUserInput();
    })
}

