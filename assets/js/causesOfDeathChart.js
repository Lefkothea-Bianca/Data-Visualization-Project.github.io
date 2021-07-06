var treeMapSvg;
var causesOfDeathChart = d3.select("#causesOfDeathChart");
var treeMapTooltip;
var treemapChartMargin = { top: 30, right: 30, bottom: 30, left: 30 };
width2 = +causesOfDeathChart.attr("width") - treemapChartMargin.left - treemapChartMargin.right,
    height2 = +causesOfDeathChart.attr("height") - treemapChartMargin.top - treemapChartMargin.bottom;

function drawCausesOfDeathChart() {

    treeMapSvg = causesOfDeathChart
        .append("svg")
        .attr("width", width2 + treemapChartMargin.left + treemapChartMargin.right)
        .attr("height", height2 + treemapChartMargin.top + treemapChartMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + treemapChartMargin.left + "," + treemapChartMargin.top + ")");

    drawCauseOfDeathChart(map);
    treeMapTooltip = d3.select("body").append("div")
        .attr("class", "treemapTooltip")
        .style("position", "absolute");

}

function redrawCauseOfDeathChart() {
    treeMapSvg.selectAll('*').remove();
    drawCauseOfDeathChart(map);
}

function drawCauseOfDeathChart(d) {

    let tree = getDisplayDataForTreemapChart(d).slice()
    tree.push({ id: 294 })

    var root = d3.stratify()
        .id(function (d) { return d.id; })
        .parentId(function (d) { return d.parentId; })
        (tree);

    root.sum(function (d) { return +d.sum })

    d3.treemap()
        .size([width2, height2])
        .padding(4)
        (root)

    treeMapSvg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", "#69b3a2")
        .on("mousemove", function (event, d) {
            var bodyNode = d3.select('body').node();
            var absoluteMousePos = d3.pointer(event, bodyNode);
            treeMapTooltip.style("left", (absoluteMousePos[0] + 10) + 'px')
            treeMapTooltip.style("top", (absoluteMousePos[1] + 10) + 'px')
            treeMapTooltip.style("display", "inline-block");
            treeMapTooltip.html(getTreeMapTooltipHtml(d.data));
        })
        .on("mouseout", function () { treeMapTooltip.style("display", "none"); });

    // and to add the text labels
    treeMapSvg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function (d) { return d.x0 + 10 })    // +10 to adjust position (more right)
        .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
        .text(function (d) { return d.data.name })
        .attr("font-size", "12px")
        .attr("fill", "white")
}

function getDisplayDataForTreemapChart(data) {
    var dataForSelectedCountry = [];
    try {
        if (selectedCountry != null && selectedYear != null) {
            dataForSelectedCountry = data
                .get(selectedCountry)
                .causesOfDeathPerYear
                .filter(c => c.year === selectedYear)[0]
                .causesOfDeath
        }
        return dataForSelectedCountry;
    }
    catch {
        console.log(`Could not find data for Country ${selectedCountry} and year ${selectedYear}`);
        return dataForSelectedCountry;
    }
}
function getTreeMapTooltipHtml(d) {
    if (!d.children) return "<div class='tooltipHeader'><strong>No data available</strong></div>"
    var html = "<div class='tooltipHeader'><strong>" + d.name + "</strong></div>";
    html += "<table class='text-right'>";
    for (let index = 0; index < d.children.length; index++) {
        const element = d.children[index];
        if (element.sum) html += "<tr><td>" + element.name + ": </td><td>" + element.total + " deaths (" + (element.sum * 100).toFixed(2) + " %)</td></tr>";
    }
    html += "<tr class='bold'><td>Total: </td><td>" + d.total + " deaths (" + (d.sum * 100).toFixed(2) + " %)</td></tr></table>";
    return html;
}