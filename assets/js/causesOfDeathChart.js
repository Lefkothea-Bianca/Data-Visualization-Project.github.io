var treeMapSvg;
var causesOfDeathChart = d3.select("#causesOfDeathChart");
var treeMapTooltip;
var treemapChartMargin = { top: 30, right: 30, bottom: 30, left: 30 };
width2 = +causesOfDeathChart.attr("width") - treemapChartMargin.left - treemapChartMargin.right,
    height2 = +causesOfDeathChart.attr("height") - treemapChartMargin.top - treemapChartMargin.bottom;
const fontSize = 14;
const nodeOffsetX = 10;
const nodeOffsetY = 20;

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
    tree.push({ id: 294, name: "No data available" })

    var root = d3.stratify()
        .id(function (d) { return d.id; })
        .parentId(function (d) { return d.parentId; })
        (tree);

    root.sum(function (d) { return +d.sum })

    d3.treemap()
        .size([width2, height2])
        .padding(4)
        (root)

    var opacity = d3.scaleLinear()
        .domain([0, getTreeMapDomainMax(root.leaves())])
        .range([.5,1]);

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
        .style("opacity", function(d){ return opacity(d.data.sum)})
        .on("mousemove", function (event, d) {
            if (d.data && d.data.children) {
                var bodyNode = d3.select('body').node();
                var absoluteMousePos = d3.pointer(event, bodyNode);
                treeMapTooltip.style("left", (absoluteMousePos[0] + 10) + 'px')
                treeMapTooltip.style("top", (absoluteMousePos[1] + 10) + 'px')
                treeMapTooltip.style("display", "inline-block");
                treeMapTooltip.html(getTreeMapTooltipHtml(d.data));
            }
        })
        .on("mouseout", function () { treeMapTooltip.style("display", "none"); });

    var minHeight = 20, minWidth = 55;
    // and to add the text labels
    treeMapSvg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr('data-width', (d) => d.x1 - d.x0)
        .style('opacity', function(d){
            if ( (d.x1 - d.x0) <= minWidth || (d.y1 - d.y0) <= minHeight ) {
                return 0;
            };
            return 1;
        })
        .attr("x", function (d) { return d.x0 + nodeOffsetX })
        .attr("y", function (d) { return d.y0 + nodeOffsetY })
        .text(function (d) { return d.data.name })
        .attr("font-size", fontSize)
        .attr("fill", "white")
        .call(wrapText);
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
    if (!d.children) return ""
    var html = "<div class='tooltipSubheader'><strong>" + d.name + "</strong></div>";
    html += "<table class='text-right'>";
    for (let index = 0; index < d.children.length; index++) {
        const element = d.children[index];
        if (element.sum) html += "<tr><td>" + element.name + ": </td><td>" + formatNumber(element.total) + " deaths</td><td>(" + (element.sum * 100).toFixed(2) + " %)</td></tr>";
    }
    html += "<tr class='bold'><td>Total: </td><td>" + formatNumber(d.total) + " deaths</td><td>(" + (d.sum * 100).toFixed(2) + " %)</td></tr></table>";
    return html;
}

function wrapText(selection) {
    selection.each(function () {
        const node = d3.select(this);
        const rectWidth = +node.attr('data-width');
        let word;
        const words = node.text().split(' ').reverse();
        let line = [];
        const x = node.attr('x');
        const y = node.attr('y');
        let tspan = node.text('').append('tspan').attr('x', x).attr('y', y);
        let lineNumber = 0;
        while (words.length > 0) {
            word = words.pop();
            line.push(word);
            tspan.text(line.join(' '));
            const tspanLength = tspan.node().getComputedTextLength();
            if (tspanLength > (rectWidth - nodeOffsetX) && line.length !== 1) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = addTspan(word);
            }
        }

        addTspan(words.pop());

        function addTspan(text) {
            lineNumber += 1;
            return (
                node
                    .append('tspan')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dy', `${lineNumber * fontSize}px`)
                    .text(text)
            );
        }
    });
}

function getTreeMapDomainMax(data) {
    return  d3.max(data.map(_=>_.data.sum));
}