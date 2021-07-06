function getSelectedCountryDisplayLabel() {
    return selectedCountry == defaultLocation ? "The World" : selectedCountry;
}

function formatNumber(number, fractionDigits = 0, locale = "el-GR" ) {
    return (number).toLocaleString(
        locale,
        { minimumFractionDigits: fractionDigits }
    );
}

