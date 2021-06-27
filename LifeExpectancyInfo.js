class LifeExpectancyInfo {
  location;
  lifeExpectancyInfoPerYear;
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
