﻿let fileData;
let map = new Map();
let mapColorScale;
let selectedYear;
let selectedCountry = "Global";

//Load Data Files
loadData();

function loadData() {
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("Life_Expectancy_Data.csv", function (d) {
            setLifeExpectancyData(d);
        }),
        d3.csv("Healthy_Life_Expectancy_Data.csv", function (d) {
            setHealthyLifeExpectancyData(d);
        }),
        d3.csv("Life_Expectancy_Data_Global.csv", function (d) {
            setLifeExpectancyData(d);
        }),
        d3.csv("Healthy_Life_Expectancy_Data_Global.csv", function (d) {
            setHealthyLifeExpectancyData(d);
        })
    ]).then(function (loadedFileData) {
        fileData = loadedFileData;
        mapColorScale = setupMapColorScale();
        sortInfoMapByYear();

        //Draw Charts
        setupMap();
        drawLifeExpectancyAreaChart(map);
    })
}