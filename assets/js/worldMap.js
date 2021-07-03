var mapSvg = d3.select("#lifeExpectancyWorldMap");
var mapLegendSvg;

function setupMap() {
    setupMapLegend();
    drawWorldMap(fileData[0]);
    mapSvgInteractionEvents();
}

function redrawWorldMap() {
    mapSvg.selectAll('*').remove();
    drawWorldMap(fileData[0]);
}

function drawWorldMap(data) {
    var width = +mapSvg.attr("width"), height = +mapSvg.attr("height");
    const projection = d3.geoMercator().scale(90).center([0, 20]).translate([width / 2, height / 2]);

    mapSvg.append("g").selectAll("path")
        .data(data.features)
        .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("class", function(d){ return "Country" } )
        .style("stroke", "rgba(51,51,51,0.2)")
        .attr("fill", function (d) {
            d.info = map.get(d.properties.name) || null;
            let selectedYearInfo = d.info ? d.info.lifeExpectancyInfoPerYear.filter(_ => _.year == selectedYear) : null;
            var lifeExpectancy = selectedYearInfo && selectedYearInfo.length > 0 ? parseInt(selectedYearInfo[0].lifeExpectancyBoth) : null;
            return mapColorScale(lifeExpectancy);
        })
        .call(d3.helper.mapHelper(
            function (i, d) { return getMapTooltipHtml(d); }
        ))
}

function setupMapColorScale() {
    let colorScale = d3.scaleThreshold()
        .domain([55, 65, 75, 80])
        .range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"])
        //.range(["#d7191c","#fdae61","#ffffbf","#abd9e9", "#2c7bb6"])
        //.range(["#fdae61", "#ffffbf", "#41b6c4", "#2c7fb8", "#253494"])
        .unknown("#cccccc");
    return colorScale;
}

function setupMapLegend() {
    var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(mapColorScale);

    var div = d3.select("#worldMap").append("div").attr("class", "legend");
    mapLegendSvg = div.append("svg").attr("width", 150).attr("height", 150);
    mapLegendSvg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,40)");
    mapLegendSvg.select(".legendQuant")
        .call(legend);
}

function getMapTooltipHtml(d) {
    var html = "<div class='tooltipHeader'><strong>" + d.properties.name + "</strong></div>";
    if (d.info == null) {
        html += "<div class='tooltipSubheader'><strong>No Data</strong></div>";
    }
    else {
        let latestYearInfo = d.info.lifeExpectancyInfoPerYear[0];
        html += "<div class='tooltipSubheader'><strong>Life Expectancy</strong></div>";
        html += "<div><strong>Males: </strong>" + latestYearInfo.lifeExpectancyMale + " years</div>";
        html += "<div><strong>Females: </strong>" + latestYearInfo.lifeExpectancyFemale + " years</div>";
        html += "<hr>";
        html += "<div class='tooltipSubheader'><strong>Healthy Life Expectancy</strong></div>";
        html += "<div><strong>Males: </strong>" + latestYearInfo.healthyLifeExpectancyMale + " years</div>";
        html += "<div><strong>Females: </strong>" + latestYearInfo.healthyLifeExpectancyFemale + " years</div>";
    }
    return html;
}