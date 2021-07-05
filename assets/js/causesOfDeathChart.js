var treeMapSvg;
var treemapChart = d3.select("#treemap");

var treemapChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
    width2 = +treemapChart.attr("width") - treemapChartMargin.left - treemapChartMargin.right,
    height2 = +treemapChart.attr("height") - treemapChartMargin.top - treemapChartMargin.bottom;

function drawCausesOfDeathChart(selectedCountry, selectedYear) {
    treeMapSvg = d3.select("#treemap")
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
    var map2 = [];
    d3.json('causes-of-death-data.json',
        function (data) {
            map2.push(data)
        }).then(function (data) {
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

            var treeMapTooltip = d3.select("#treemap")
                .append("div")
                .style("class", "treeMapTooltip")
                .style("position", "absolute")
                .style("visibility", "hidden");

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
                .on("mouseover", function (d) {
                    treeMapTooltip.style('visibility', 'visible');
                })
                .on("mousemove", function (event, d) {
                    var absoluteMousePos = d3.pointer(event, this);
                    treeMapTooltip
                        .style('left', (absoluteMousePos[0])+'px')
                        .style('top', (absoluteMousePos[1])+'px')
                        treeMapTooltip.html(getTreeMapTooltipHtml(d.data));
                    return treeMapTooltip.style("visibility", "visible");
                })
                .on("mouseout", function () { return treeMapTooltip.style("visibility", "hidden"); });


            // and to add the text labels
            treeMapSvg
                .selectAll("text")
                .data(root.leaves())
                .enter()
                .append("text")
                .attr("x", function (d) { return d.x0 + 10 })    // +10 to adjust position (more right)
                .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
                .text(function (d) { return d.data.name })
                .attr("font-size", "15px")
                .attr("fill", "white")
        })
}

// Read data


function getTreeMapTooltipHtml(d) {
    var html = "<div class='tooltipHeader'><strong>" + d.name + "</strong></div>";
    html += "<div class='tooltipSubheader'><strong>" + d.name + "</strong>: " + d.sum + "</div>";

    for (let index = 0; index < d.children.length; index++) {
        const element = d.children[index];
        if (element.sum) html += "<div class='tooltipSubheader'><strong>" + element.name + "</strong>: " + element.sum + "</div>";
    }
    return html;
}