document.addEventListener("DOMContentLoaded", setupEvents);
var defaultLocation = "Global";
var defaultStroke = "rgba(51,51,51,0.2)";
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
                d3.select(this).transition().duration(100).style("stroke", defaultStroke);
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
        onSliderChangeEvents();
    }
}

function onSliderChangeEvents() {
    redrawWorldMap();
    if (selectedCountry != defaultLocation) {
        d3.selectAll(".Country").style("opacity", 0.5).style("stroke", "transparent");
        selectedCountryElement = d3.select(Array.from(d3.selectAll(".Country")._groups[0]).filter(_=>_.__data__.properties.name == selectedCountry)[0]);
        selectedCountryElement.style("opacity", 1).style("stroke", "black");
    }
}

function sliderTooltipEvents() {
    var interval;
    const
        range = document.getElementById('myRange'),
        rangeV = document.getElementById('rangeV'),
        play = document.getElementById('play'),
        pause = document.getElementById('pause'),
        clipIconChange = () => {
            if (play.style.display == "none") {
                play.style.display = "inline-block";
                pause.style.display = "none";
            }
            else {
                play.style.display = "none";
                pause.style.display = "inline-block";
            }
        },
        selectedYearSet = () => {
            selectedYear = yearElement.innerHTML = range.value;
        },
        rangeAtStart = () => {
            if (range.value == range.max){
                range.value = (parseInt(range.min)-1).toString();
            }
        },
        rangeMoveForward = () => {
            range.value = (parseInt(range.value)+1).toString();
        }
        pauseOnSliderEnd = () => {
            if (range.value == range.max) { pauseClip() }
        },
        rangeTooltipShow = () => {
            rangeV.style.display = "block";
        },
        rangeTooltipHide = () => {
            rangeV.style.display = "none";
        },
        rangeTooltipSetValue = ()=>{
            const newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
                newPosition = 10 - (newValue * 0.2);
            rangeV.innerHTML = `<span>${range.value}</span>`;
            rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
        },
        playClip = ()=>{
            clipIconChange();
            rangeTooltipShow();
            interval = window.setInterval(()=>{
                rangeAtStart();
                rangeMoveForward();
                rangeTooltipSetValue();
                selectedYearSet();
                onSliderChangeEvents();
                pauseOnSliderEnd();
            }, 500);
        },
        pauseClip = ()=>{
            clearInterval(interval);
            clipIconChange();
            rangeTooltipHide();
        };

    range.addEventListener('input', rangeTooltipSetValue);
    range.addEventListener("mouseover", function( event ) {
        rangeTooltipShow();
    });
    range.addEventListener("mouseout", function( event ) {
        rangeTooltipHide();
    });
    play.addEventListener('click', playClip);
    pause.addEventListener('click', pauseClip);

    rangeTooltipSetValue();
    rangeTooltipHide();
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
    selectedCountryElement.transition().duration(100).style("stroke", defaultStroke);
    selectedCountryElement = null;
}

function unselectCountry() {
    resetDefaultMapState();
    selectedCountryElement = null;
}

function selectCountry(i, element) {
    selectedCountry = i.info.location;
    selectedCountryElement = d3.select(element);
    d3.selectAll(".Country").transition().duration(100).style("opacity", 0.5).style("stroke", defaultStroke);
    selectedCountryElement.transition().duration(100).style("opacity", 1).style("stroke", "black");
}

function applyCountrySelectionChangeToCharts() {
    var countryElement = document.getElementById("countryElement");
    countryElement.innerHTML = selectedCountry == defaultLocation ? "The World" : selectedCountry;
    reDrawAreaChart();
}