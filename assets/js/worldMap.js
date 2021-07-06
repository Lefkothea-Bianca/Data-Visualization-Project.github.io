var mapSvg = d3.select("#lifeExpectancyWorldMap");
var mapLegendSvg;
var zoomTransformation;

function setupMap() {
    setupMapLegend();
    drawWorldMap(fileData[0]);
    mapSvgInteractionEvents();
}

function redrawWorldMap() {
    mapSvg.selectAll('*').remove();
    drawWorldMap(fileData[0]);
    mapSvg.selectAll('path').attr('transform', zoomTransformation);
    styleSelectedCountryOnMap();
}

function styleSelectedCountryOnMap() {
    if (selectedCountry != defaultLocation) {
        d3.selectAll(".Country").style("opacity", 0.5).style("stroke", "transparent");
        selectedCountryElement = d3.select(Array.from(d3.selectAll(".Country")._groups[0]).filter(_=>_.__data__.properties.name == selectedCountry)[0]);
        selectedCountryElement.style("opacity", 1).style("stroke", "black").style("stroke-width", 1);
    }
}

function drawWorldMap(data) {
    var width = +mapSvg.attr("width"), height = +mapSvg.attr("height");
    const projection = d3.geoMercator().scale(90).center([0, 20]).translate([width / 2, height / 2]);

    mapSvg.append("g").selectAll("path")
        .data(data.features)
        .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("class", function(d){ return "Country" } )
        .style("stroke", "black")
        .style("stroke-width", 0.2)
        .attr("fill", function (d) {
            d.info = map.get(d.properties.name) || null;
            let selectedYearInfo = d.info ? d.info.lifeExpectancyInfoPerYear.filter(_ => _.year == selectedYear) : null;
            var lifeExpectancy = selectedYearInfo && selectedYearInfo.length > 0 ? parseInt(selectedYearInfo[0].lifeExpectancyBoth) : null;
            return mapColorScale(lifeExpectancy);
        })
        .call(d3.helper.mapHelper(
            function (i, d) { return getMapTooltipHtml(d); }
        ))

    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function(event, d) {
            zoomTransformation = event.transform;
            mapSvg.selectAll('path').attr('transform', zoomTransformation);
        });

    mapSvg.call(zoom);
}

function setupMapColorScale() {
    let colorScale = d3.scaleThreshold()
        .domain([55, 65, 75, 80])
        .range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"])
        .unknown("#cccccc");
    return colorScale;
}

function setupMapLegend() {
    var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(mapColorScale);

    var div = d3.select("#worldMap").append("div").attr("class", "legend");
    mapLegendSvg = div.append("svg").attr("width", 130).attr("height", 120);
    mapLegendSvg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");
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
        html += "<table class='text-right'>";
        html += "<tr><td>Males:</td><td>" + latestYearInfo.lifeExpectancyMale + " years</td></tr>";
        html += "<tr><td>Females:</td><td>" + latestYearInfo.lifeExpectancyFemale + " years</td></tr>";
        html += "<tr class='bold'><td>Both:</td><td>" + latestYearInfo.lifeExpectancyBoth + " years</td></tr></table>";

        html += "<hr>";

        html += "<div class='tooltipSubheader'><strong>Healthy Life Expectancy</strong></div>";
        html += "<table class='text-right'>";
        html += "<tr><td>Males:</td><td>" + latestYearInfo.healthyLifeExpectancyMale + " years</td></tr>";
        html += "<tr><td>Females:</td><td>" + latestYearInfo.healthyLifeExpectancyFemale + " years</td></tr>";
        html += "<tr class='bold'><td>Both:</td><td>" + latestYearInfo.healthyLifeExpectancyBoth + " years</td></tr></table>";
    }
    return html;
}