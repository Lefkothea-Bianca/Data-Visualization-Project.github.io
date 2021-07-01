//copied from http://bl.ocks.org/espinielli/4d17fep7B6y5YxWkE9Sv2d7xpAGMpndA2yX4
d3.helper = {};
d3.helper.mapHelper = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('body').node();

        selection.on("mouseover", function(d, i){
            d3.select('body').selectAll('div.customTooltip').remove();
            tooltipDiv = d3.select('body').append('div').attr('class', 'customTooltip');

            var absoluteMousePos = d3.pointer(event, bodyNode);
            tooltipDiv
                .style('left', (absoluteMousePos[0])+'px')
                .style('top', (absoluteMousePos[1])+'px')
                .style('position', 'absolute')
                .style('z-index', 1001);

            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
            d3.select(this).transition().duration(100).style("stroke", "black");
        })
        .on('mousemove', function(d, i) {
            var absoluteMousePos = d3.pointer(event, bodyNode);
            tooltipDiv
                .style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("click", function(d, i){
            if (selectedCountry == i.info.location) {
                selectedCountry = null;
                d3.selectAll(".Country").transition().duration(100).style("opacity", 1);
                d3.select(this).transition().duration(100).style("stroke", "transparent");
            }
            else {
                selectedCountry = i.info.location;
                d3.selectAll(".Country").transition().duration(100).style("opacity", 0.5).style("stroke", "transparent");
                d3.select(this).transition().duration(100).style("opacity", 1).style("stroke", "black");
            }
            var countryElement = document.getElementById("countryElement");
            countryElement.innerHTML = selectedCountry ? selectedCountry : "The World";
            reDrawAreaChart();
        })
        .on("mouseout", function(d, i){
            tooltipDiv.remove();
            if (!i.info || selectedCountry != i.info.location) {
                d3.select(this).transition().duration(100).style("stroke", "transparent");
            }
        });
    };
};