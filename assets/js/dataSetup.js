function getInfo(data) {
    let info = map.get(data.location);
    if (!info) {
        info = new LifeExpectancyInfo();
        info.location = data.location;
    }
    if (!info.lifeExpectancyInfoPerYear) {
        info.lifeExpectancyInfoPerYear = new Array();
    }
    return info;
}

function getInfoPerYear(info, data) {
    let infoPerYearFiltered = info.lifeExpectancyInfoPerYear.filter(_ => _.year == data.year);
    let infoPerYear;
    if (infoPerYearFiltered.length == 0) {
        infoPerYear = new LifeExpectancyInfoPerYear(data.year);
        info.lifeExpectancyInfoPerYear.push(infoPerYear);
    }
    else {
        infoPerYear = infoPerYearFiltered[0];
    }
    return infoPerYear;
}

function setLifeExpectancyData(d) {
    let info = getInfo(d);
    let infoPerYear = getInfoPerYear(info, d);
    switch (d.sex_id) {
        case "1": infoPerYear.lifeExpectancyMale = parseInt(d.val);
        case "2": infoPerYear.lifeExpectancyFemale = parseInt(d.val);
        case "3": infoPerYear.lifeExpectancyBoth = parseInt(d.val);
    }
    map.set(d.location, info);
}

function setHealthyLifeExpectancyData(d) {
    let info = getInfo(d);
    let infoPerYear = getInfoPerYear(info, d);
    switch (d.sex_id) {
        case "1": infoPerYear.healthyLifeExpectancyMale = parseInt(d.val);
        case "2": infoPerYear.healthyLifeExpectancyFemale = parseInt(d.val);
        case "3": infoPerYear.healthyLifeExpectancyBoth = parseInt(d.val);
    }
    map.set(d.location, info);
}

function setWDIInfoPerYear(info, d) {
    var minYear = 1990;
    var maxYear = 2019;
    for (var i = minYear; i <= maxYear; i++) {
        var yearString = i.toString();
        var infoPerYear = new WDIInfoPerYear(yearString);
        infoPerYear.currentHealthExpenditurePerCapita = d[yearString];
        info.wdiInfoPerYear.push(infoPerYear);
    }
}

function setWDIData(d) {
    let info = map.get(d["Country Name"]);
    if (info) {
        if (!info.wdiInfoPerYear) {
            info.wdiInfoPerYear = new Array();
        }
        setWDIInfoPerYear(info, d);
        map.set(d["Country Name"], info);
    }
}

function setCausesOfDeathData(causesOfDeathData) {
    let countryKeys = Object.keys(causesOfDeathData);
    for (let countryKeysIndex = 0; countryKeysIndex < countryKeys.length; countryKeysIndex++) {
        let countryKey = countryKeys[countryKeysIndex];
        let info = map.get(countryKey);
        if (!info) continue;
        const countryData = causesOfDeathData[countryKey];
        let yearKeys = Object.keys(countryData);
        for (let yearIndex = 0; yearIndex < yearKeys.length; yearIndex++) {
            let yearKey = yearKeys[yearIndex];
            const causesOfDeathPerCountryAndYear = countryData[yearKey];
            if (!info.causesOfDeathPerYear) {
                info.causesOfDeathPerYear = new Array()
            }
            let causesOfDeathPerYear = new CausesOfDeathPerYear(yearKey);
            causesOfDeathPerYear.causesOfDeath = causesOfDeathPerCountryAndYear;
            info.causesOfDeathPerYear.push(causesOfDeathPerYear);
        }
    }
}

function sortInfoMapByYear() {
    map.forEach((element) => {
        if (element.lifeExpectancyInfoPerYear) {
            element.lifeExpectancyInfoPerYear.sort((a, b) => (parseInt(a.year) > parseInt(b.year)) ? 1 : -1)
        }
        if (element.wdiInfoPerYear) {
            element.wdiInfoPerYear.sort((a, b) => (parseInt(a.year) > parseInt(b.year)) ? 1 : -1)
        }
    })
}