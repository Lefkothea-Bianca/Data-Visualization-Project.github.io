function sliderEvents() {
    var slider = document.getElementById("myRange");
    var yearElement = document.getElementById("yearElement");
    selectedYear = yearElement.innerHTML = slider.value;

    slider.oninput = function () {
        selectedYear = yearElement.innerHTML = this.value;
    }

    slider.onchange = function () {
        d3.selectAll("path").remove();    
        drawWorldMap(fileData[0]);
    }
}