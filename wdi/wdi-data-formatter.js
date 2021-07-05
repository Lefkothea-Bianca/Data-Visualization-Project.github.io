const csv = require('csv-parser');
const fs = require('fs');

let rows = []
fs.createReadStream('wdi\\WDIData.csv')
    .pipe(csv(["Country Name", "Country Code", "Indicator Name", "Indicator Code", "1960", "1961", "1962", "1963", "1964", "1965", "1966", "1967", "1968", "1969", "1970", "1971", "1972", "1973", "1974", "1975", "1976", "1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]))
    .on('data', (row) => {
        if (row["Indicator Code"] === "Indicator Code") return;
        if (row["Indicator Code"] !== "SE.XPD.CTOT.ZS" && row["Indicator Code"] !== "SH.XPD.CHEX.PC.CD" && row["Indicator Code"] !== "NY.GDP.PCAP.PP.CD") return;
        rows.push(row);
    })
    .on('end', () => {
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'out.csv',
            header: [
                { id: "Country Name", title: "Country Name" },
                { id: "Country Code", title: "Country Code" },
                { id: "Indicator Name", title: "Indicator Name" },
                { id: "Indicator Code", title: "Indicator Code" },
                { id: "1960", title: "1960" },
                { id: "1961", title: "1961" },
                { id: "1962", title: "1962" },
                { id: "1963", title: "1963" },
                { id: "1964", title: "1964" },
                { id: "1965", title: "1965" },
                { id: "1966", title: "1966" },
                { id: "1967", title: "1967" },
                { id: "1968", title: "1968" },
                { id: "1969", title: "1969" },
                { id: "1970", title: "1970" },
                { id: "1971", title: "1971" },
                { id: "1972", title: "1972" },
                { id: "1973", title: "1973" },
                { id: "1974", title: "1974" },
                { id: "1975", title: "1975" },
                { id: "1976", title: "1976" },
                { id: "1977", title: "1977" },
                { id: "1978", title: "1978" },
                { id: "1979", title: "1979" },
                { id: "1980", title: "1980" },
                { id: "1981", title: "1981" },
                { id: "1982", title: "1982" },
                { id: "1983", title: "1983" },
                { id: "1984", title: "1984" },
                { id: "1985", title: "1985" },
                { id: "1986", title: "1986" },
                { id: "1987", title: "1987" },
                { id: "1988", title: "1988" },
                { id: "1989", title: "1989" },
                { id: "1990", title: "1990" },
                { id: "1991", title: "1991" },
                { id: "1992", title: "1992" },
                { id: "1993", title: "1993" },
                { id: "1994", title: "1994" },
                { id: "1995", title: "1995" },
                { id: "1996", title: "1996" },
                { id: "1997", title: "1997" },
                { id: "1998", title: "1998" },
                { id: "1999", title: "1999" },
                { id: "2000", title: "2000" },
                { id: "2001", title: "2001" },
                { id: "2002", title: "2002" },
                { id: "2003", title: "2003" },
                { id: "2004", title: "2004" },
                { id: "2005", title: "2005" },
                { id: "2006", title: "2006" },
                { id: "2007", title: "2007" },
                { id: "2008", title: "2008" },
                { id: "2009", title: "2009" },
                { id: "2010", title: "2010" },
                { id: "2011", title: "2011" },
                { id: "2012", title: "2012" },
                { id: "2013", title: "2013" },
                { id: "2014", title: "2014" },
                { id: "2015", title: "2015" },
                { id: "2016", title: "2016" },
                { id: "2017", title: "2017" },
                { id: "2018", title: "2018" },
                { id: "2019", title: "2019" },
                { id: "2020", title: "2019" }
            ]
        });

        csvWriter
            .writeRecords(rows)
            .then(() => console.log('The CSV file was written successfully'));
    })