function getInfo(data) {
    let info = map.get(data.location);
    if (!info) {
        info = new LifeExpectancyInfo();
        info.location = data.location;
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

function sortInfoMapByYear() {
    map.forEach((element) => {
        element.lifeExpectancyInfoPerYear.sort((a, b) => (parseInt(a.year) > parseInt(b.year)) ? 1 : -1)
    })
}