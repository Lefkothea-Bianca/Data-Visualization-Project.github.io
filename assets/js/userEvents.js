document.addEventListener("DOMContentLoaded", setupEvents);
var defaultLocation = "Global";
var selectedCountryElement;

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
            selectedCountry == i.info.location ? unselectCountry() : selectCountry(i, this);
            applyCountrySelectionChangeToCharts();
        })
        .on("mouseout", function(d, i){
            tooltipDiv.remove();
            if (!i.info || selectedCountry != i.info.location) {
                d3.select(this).transition().duration(100).style("stroke", "transparent");
            }
        });
    };
};

function setupEvents() {
    sliderEvents();
    sliderTooltipEvents();
}

function sliderEvents() {
    var slider = document.getElementById("myRange");
    var yearElement = document.getElementById("yearElement");
    selectedYear = yearElement.innerHTML = slider.value;

    slider.oninput = function () {
        selectedYear = yearElement.innerHTML = this.value;
    }

    slider.onchange = function () {
        redrawWorldMap();
        if (selectedCountry != defaultLocation) {
            d3.selectAll(".Country").style("opacity", 0.5).style("stroke", "transparent");
            selectedCountryElement = d3.select(Array.from(d3.selectAll(".Country")._groups[0]).filter(_=>_.__data__.properties.name == selectedCountry)[0]);
            selectedCountryElement.style("opacity", 1).style("stroke", "black");
        }
    }
}

function sliderTooltipEvents() {
    const
        range = document.getElementById('myRange'),
        rangeV = document.getElementById('rangeV'),
        setValue = ()=>{
            const newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
                newPosition = 10 - (newValue * 0.2);
            rangeV.innerHTML = `<span>${range.value}</span>`;
            rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
        };
    range.addEventListener('input', setValue);
    range.addEventListener("mouseover", function( event ) {
        rangeV.style.display = "block";
    });
    range.addEventListener("mouseout", function( event ) {
        rangeV.style.display = "none";
    });

    setValue();
    rangeV.style.display = "none";
}

function mapSvgInteractionEvents() {
    mapSvg.on("click", function(d){
        onMapSvgOrLegendClick(d);
    })
    mapLegendSvg.on("click", function(d){
        onMapSvgOrLegendClick(d);
    })
}

function onMapSvgOrLegendClick(d) {
    if (selectedCountryElement != null && d.target.className.baseVal != "Country") {
        resetDefaultMapState();
        applyCountrySelectionChangeToCharts();
    }
}

function resetDefaultMapState() {
    selectedCountry = defaultLocation;
    d3.selectAll(".Country").transition().duration(100).style("opacity", 1);
    selectedCountryElement.transition().duration(100).style("stroke", "transparent");
    selectedCountryElement = null;
}

function unselectCountry() {
    resetDefaultMapState();
    selectedCountryElement = null;
}

function selectCountry(i, element) {
    selectedCountry = i.info.location;
    selectedCountryElement = d3.select(element);
    d3.selectAll(".Country").transition().duration(100).style("opacity", 0.5).style("stroke", "transparent");
    selectedCountryElement.transition().duration(100).style("opacity", 1).style("stroke", "black");
}

function applyCountrySelectionChangeToCharts() {
    var countryElement = document.getElementById("countryElement");
    countryElement.innerHTML = selectedCountry == defaultLocation ? "The World" : selectedCountry;
    reDrawAreaChart();
}