const combinations = require("combinations-generator");
const moment = require("moment");

const searchDateRange = ({ placeDict, startDate, endDate }) => {
  const { tx_date: rawTxDate } = placeDict;
  if (!rawTxDate) {
    return false;
  }
  try {
    const txDate = moment(rawTxDate);
    if (startDate <= txDate && txDate <= endDate) {
      return true;
    } else {
      false;
    }
  } catch {
    return false;
  }
};

const findResultAndCombo = ({
  resResult,
  combNumber,
  usagePriceDict,
  usage,
  t,
  startDate,
  endDate,
}) => {
  resResult = resResult.filter((placeDict) =>
    searchDateRange({ placeDict, startDate, endDate })
  );

  let tempResult;
  let tempComb;

  const combs = combinations(resResult, combNumber);

  for (const comb of combs) {
    let result;
    let combSum = 0;
    let count = 0;

    const targetRange = Object.values(usagePriceDict[usage][t]).sort(
      (a, b) => a - b
    );
    const maxRangeNumber = Math.max(...targetRange);
    const minRangeNumber = Math.min(...targetRange);

    comb.forEach((c) => {
      const { price, net_area: netArea } = c;
      const ftPrice = price / netArea;
      if (!!price && !!netArea && price > 0) {
        if (
          maxRangeNumber * 1.15 >= ftPrice &&
          minRangeNumber * 0.85 <= ftPrice
        ) {
          combSum += price / netArea;
          count += 1;
        }
      }
    });
    if (count === combNumber) {
      result = combSum / combNumber;
    } else {
      result = -1;
    }

    if (result <= maxRangeNumber && result >= minRangeNumber) {
      tempResult = result;
      tempComb = comb;
      break;
    }
  }

  return { tempResult, tempComb };
};

module.exports = {
  searchDateRange,
  findResultAndCombo,
};
