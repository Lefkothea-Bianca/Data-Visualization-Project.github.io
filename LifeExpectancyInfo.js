class LifeExpectancyInfo {
  location;
  lifeExpectancyInfoPerYear;
  wdiInfoPerYear;
  causesOfDeathPerYear;
}

class LifeExpectancyInfoPerYear {
  constructor(year) {
    this.year = year;
  }
  year;
  lifeExpectancyBoth;
  healthyLifeExpectancyBoth;
  lifeExpectancyMale;
  healthyLifeExpectancyMale;
  lifeExpectancyFemale;
  healthyLifeExpectancyFemale;
}

class WDIInfoPerYear {
  constructor(year) {
    this.year = year;
  }
  year;
  currentHealthExpenditurePerCapita;
}

class CausesOfDeathPerYear {
  constructor(year) {
    this.year = year;
  }
  year;
  causesOfDeath;
}
