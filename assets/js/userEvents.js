document.addEventListener("DOMContentLoaded", setupEvents);
var defaultLocation = "Global";
var defaultStrokeWidth = 0.2;
var selectedCountryElement;

d3.helper = {};
d3.helper.mapHelper = function (accessor) {
    return function (selection) {
        var tooltipDiv;
        var bodyNode = d3.select('body').node();

        selection.on("mouseover", function (d, i) {
            d3.select('body').selectAll('div.customTooltip').remove();
            tooltipDiv = d3.select('body').append('div').attr('class', 'customTooltip');

            var absoluteMousePos = d3.pointer(event, bodyNode);
            tooltipDiv
                .style('left', (absoluteMousePos[0]) + 'px')
                .style('top', (absoluteMousePos[1]) + 'px')
                .style('position', 'absolute')
                .style('z-index', 1001);

            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
            d3.select(this).transition().duration(100).style("stroke", "black").style("stroke-width", 1);
        })
            .on('mousemove', function (d, i) {
                var absoluteMousePos = d3.pointer(event, bodyNode);
                tooltipDiv
                    .style('left', (absoluteMousePos[0] + 10) + 'px')
                    .style('top', (absoluteMousePos[1] - 15) + 'px');
                var tooltipText = accessor(d, i) || '';
                tooltipDiv.html(tooltipText);
            })
            .on("click", function (d, i) {
                try {
                    selectedCountry == i.info.location ? unselectCountry() : selectCountry(i, this);
                    applyCountrySelectionChangeToCharts();
                }
                catch (error) {
                    console.error(`error on map click. error: ${error}`)
                }
            })
            .on("mouseout", function (d, i) {
                try {
                    tooltipDiv.remove();
                    if (!i.info || selectedCountry != i.info.location) {
                        d3.select(this).transition().duration(100).style("stroke-width", defaultStrokeWidth);
                    }
                } catch (error) {
                    console.error(`error on map mouseout. error: ${error}`)
                }
            });
    };
};

function setupEvents() {
    sliderEvents();
    sliderTooltipEvents();
    initializeData();
}

function sliderEvents() {
    var slider = document.getElementById("myRange");
    selectedYear = slider.value;
    updateYearElements(selectedYear);

    slider.oninput = function () {
        selectedYear = this.value;
        updateYearElements(selectedYear);
    }

    slider.onchange = function () {
        onSliderChangeEvents();
    }
}

function initializeData() {
    selectedYear = endYear.toString();
    updateYearElements(selectedYear);
}

function updateYearElements(value) {
    var yearElements = document.getElementsByClassName("yearElement");
    for (var i = 0; i < yearElements.length; i++) {
        yearElements.item(i).innerHTML = value;
    }
}

function onSliderChangeEvents() {
    redrawWorldMap();
    redrawCauseOfDeathChart(selectedCountry, selectedYear);
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
            selectedYear = range.value;
            updateYearElements(selectedYear);
        },
        adjustRange = () => {
            if (range.value == range.max) { range.value = range.min; }
            else { range.value = (parseInt(range.value) + 1).toString(); }
        },
        pauseOnSliderEnd = () => {
            if (range.value == range.max) { pauseClip() }
        },
        rangeTooltipShow = () => {
            rangeV.style.display = "block";
        },
        rangeTooltipHide = () => {
            rangeV.style.display = "none";
        },
        rangeTooltipSetValue = () => {
            const newValue = Number((range.value - range.min) * 100 / (range.max - range.min)),
                newPosition = 10 - (newValue * 0.2);
            rangeV.innerHTML = `<span>${range.value}</span>`;
            rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
        },
        playClip = () => {
            clipIconChange();
            rangeTooltipShow();
            interval = window.setInterval(() => {
                adjustRange();
                rangeTooltipSetValue();
                selectedYearSet();
                onSliderChangeEvents();
                pauseOnSliderEnd();
            }, 500);
        },
        pauseClip = () => {
            clearInterval(interval);
            clipIconChange();
            rangeTooltipHide();
        };

    range.addEventListener('input', rangeTooltipSetValue);
    range.addEventListener("mouseover", function (event) {
        rangeTooltipShow();
    });
    range.addEventListener("mouseout", function (event) {
        rangeTooltipHide();
    });
    play.addEventListener('click', playClip);
    pause.addEventListener('click', pauseClip);

    rangeTooltipSetValue();
    rangeTooltipHide();
}

function mapSvgInteractionEvents() {
    mapSvg.on("click", function (d) {
        onMapSvgOrLegendClick(d);
    })
    mapLegendSvg.on("click", function (d) {
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
    selectedCountryElement.transition().duration(100).style("stroke-width", defaultStrokeWidth);
    selectedCountryElement = null;
}

function unselectCountry() {
    resetDefaultMapState();
    selectedCountryElement = null;
}

function selectCountry(i, element) {
    selectedCountry = i.info.location;
    selectedCountryElement = d3.select(element);
    d3.selectAll(".Country").transition().duration(100).style("opacity", 0.5).style("stroke-width", defaultStrokeWidth);
    selectedCountryElement.transition().duration(100).style("opacity", 1).style("stroke-width", 1);
}

function applyCountrySelectionChangeToCharts() {
    var countryElements = document.getElementsByClassName("countryElement");
    for (var i = 0; i < countryElements.length; i++) {
        countryElements.item(i).innerHTML = getSelectedCountryDisplayLabel();
    }
    redrawWorldMap();
    reDrawAreaChart();
    redrawCauseOfDeathChart(selectedCountry, selectedYear);
    reDrawLineChart();
}