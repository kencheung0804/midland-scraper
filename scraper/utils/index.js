const playwright = require("playwright");
const { txType, usageColDict } = require("../constants");

const setUpResidentialToken = async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://www.midland.com.hk/en/list/transaction");
  const cookies = await context.cookies();
  await browser.close();
  const token = cookies.find((c) => c.name === "token").value;
  return token;
};

const getAreaList = ({ ws, rowIndex }) => {
  const rawArea = ws.getCell(`H${rowIndex}`).value;
  let areaList = [];
  rawArea
    .replace(" And ", " & ")
    .replace(" AND ", " & ")
    .replace(" and ", " & ")
    .split("&")
    ?.forEach((a) => {
      areaList.push(a.trim());
    });
  return areaList;
};

const getUsageList = ({ ws, rowIndex, mainWindow }) => {
  const rawUsages = ws.getCell(`I${rowIndex}`).value;
  let usages = [];
  rawUsages.split("/").forEach((u) => {
    let rUsage = u.trim();
    if (
      ["Apartments", "Residential", "Office", "Commercial"].includes(rUsage)
    ) {
      if (rUsage === "Apartments") {
        rUsage = "Residential";
      }
      usages.push(rUsage);
    } else {
      mainWindow.webContents.send(
        "error:push",
        `Usage in row ${rowIndex} not valid. Only Apartments, Residential, Office and Commercial are available!`
      );
    }
  });

  return Array.from(new Set(usages));
};

const makeUsagePriceDict = ({ ws, rowIndex, usages, mainWindow }) => {
  let usagePriceDict = {};

  usages?.forEach((usage) => {
    let priceRangeDict = {
      rental: {
        upper: null,
        lower: null,
      },
      selling: {
        upper: null,
        lower: null,
      },
    };

    txType.forEach((t) => {
      if (t === "rental") {
        const rawRentalValuationCell = `${usageColDict[usage][t]["valuation"]}${rowIndex}`;
        const rentalValuation =
          !!ws.getCell(rawRentalValuationCell).value ||
          ws.getCell(rawRentalValuationCell).value !== "NA"
            ? String(ws.getCell(rawRentalValuationCell).value)
            : null;

        const rawRentalActualCell = `${usageColDict[usage][t]["actual"]}${rowIndex}`;
        const rentalActual =
          !!ws.getCell(rawRentalActualCell).value ||
          ws.getCell(rawRentalActualCell).value !== "NA"
            ? String(ws.getCell(rawRentalActualCell).value)
            : null;

        if (!!rentalValuation !== !!rentalActual) {
          mainWindow.webContents.send(
            "error:push",
            `Actual or valuation price misses in row ${row_index}'s Rental Price Valuation Summary`
          );
          return;
        }
        if (!!rentalValuation && !!rentalActual) {
          const valuationRangeList = rentalValuation
            .split("-")
            .map((limit) => Number(String(limit).trim().replace(",", "")));

          const actual = Number(String(rentalActual).trim().replace(",", ""));

          const valuationRange = [
            valuationRangeList[0] * 0.9,
            valuationRangeList.slice(-1)[0] * 1.1,
          ];

          const actualRange = [actual * 0.9, actual * 1.1];

          if (
            actualRange[1] <= valuationRange[0] ||
            actualRange[1] <= valuationRange[1] <= actualRange[0]
          ) {
            priceRangeDict[t]["upper"] = valuationRange[1];
            priceRangeDict[t]["lower"] = valuationRange[0];
          } else if (
            actualRange[0] >= valuationRange[0] &&
            actualRange[1] <= valuationRange[1]
          ) {
            priceRangeDict[t]["upper"] = valuationRange[1];
            priceRangeDict[t]["lower"] = valuationRange[0];
          } else if (
            actualRange[0] <= valuationRange[0] &&
            actualRange[1] >= valuationRange[0] &&
            actualRange[1] <= valuationRange[1]
          ) {
            priceRangeDict[t]["upper"] = actualRange[1];
            priceRangeDict[t]["lower"] = valuationRange[0];
          } else if (
            actualRange[0] >= valuationRange[0] &&
            actualRange[0] <= valuationRange[1] &&
            actualRange[1] >= valuationRange[1]
          ) {
            priceRangeDict[t]["upper"] = valuationRange[1];
            priceRangeDict[t]["lower"] = actualRange[0];
          } else if (
            actualRange[1] >= valuationRange[1] &&
            valuationRange[0] >= actualRange[0]
          ) {
            priceRangeDict[t]["upper"] = valuationRange[1];
            priceRangeDict[t]["lower"] = valuationRange[0];
          }
        }
      } else if (t === "selling") {
        const rawSellingCell = `${usageColDict[usage][t]}${rowIndex}`;
        const sellingValuation =
          !!ws.getCell(rawSellingCell).value ||
          ws.getCell(rawSellingCell).value !== "NA"
            ? ws.getCell(rawSellingCell).value
            : null;
        if (!!sellingValuation) {
          priceRangeDict[t]["upper"] = sellingValuation * 1.1;
          priceRangeDict[t]["lower"] = sellingValuation * 0.9;
        }
      }
      usagePriceDict[usage] = priceRangeDict;
    });
  });

  return usagePriceDict;
};

module.exports = {
  setUpResidentialToken,
  getAreaList,
  getUsageList,
  makeUsagePriceDict,
};
