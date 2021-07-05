var treeMapSvg;
var causesOfDeathChart = d3.select("#causesOfDeathChart");

var treemapChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
    width2 = +causesOfDeathChart.attr("width") - treemapChartMargin.left - treemapChartMargin.right,
    height2 = +causesOfDeathChart.attr("height") - treemapChartMargin.top - treemapChartMargin.bottom;

function drawCausesOfDeathChart(selectedCountry, selectedYear) {

    treeMapSvg = causesOfDeathChart
        .append("svg")
        .attr("width", width2 + treemapChartMargin.left + treemapChartMargin.right)
        .attr("height", height2 + treemapChartMargin.top + treemapChartMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + treemapChartMargin.left + "," + treemapChartMargin.top + ")");

    drawCauseOfDeathChart(selectedCountry, selectedYear);
}

function redrawCauseOfDeathChart(country, year) {
    treeMapSvg.selectAll('*').remove();
    drawCauseOfDeathChart(country, year);
}

function drawCauseOfDeathChart(country, year) {
    d3.json('causes-of-death-data.json')
        .then(function (data) {
            let tree = data[country][year];
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

            var treeMapTooltip = d3.select("body").append("div")
                .attr("class", "treemapTooltip")
                .style("position", "absolute");

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
                    treeMapTooltip.style("left", (absoluteMousePos[0] + 10)+'px')
                    treeMapTooltip.style("top", (absoluteMousePos[1] + 10)+'px')
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
        })
}

function getTreeMapTooltipHtml(d) {
    var html = "<div class='tooltipHeader'><strong>" + d.name + "</strong></div>";
    html += "<table class='text-right'>";
    for (let index = 0; index < d.children.length; index++) {
        const element = d.children[index];
        if (element.sum) html += "<tr><td>"+element.name+": </td><td>" + element.sum + "%</td></tr>";
    }
    html +="<tr class='bold'><td>Total: </td><td>" + d.sum + "%</td></tr></table>";
    return html;
}