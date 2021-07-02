const
  range = document.getElementById('myRange'),
  rangeV = document.getElementById('rangeV'),
  setValue = ()=>{
    const
      newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
      newPosition = 10 - (newValue * 0.2);
    rangeV.innerHTML = `<span>${range.value}</span>`;
    rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
  };
document.addEventListener("DOMContentLoaded", setValue);
range.addEventListener('input', setValue);

function setBubble(range, bubble) {
  const val = range.value;
  const min = range.min ? range.min : 1990;
  const max = range.max ? range.max : 2019;
  const newVal = Number(((val - min) * 100) / (max - min));
  bubble.innerHTML = val;

  // Sorta magic numbers based on size of the native UI thumb
  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
}

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