exports.handleCommercialCombs = ({
  usagePriceDict,
  usage,
  t,
  combNumber,
  combs,
}) => {
  let finalResult;
  let finalComb;
  for (const comb of combs) {
    let combSum = 0;
    let count = 0;
    const targetRange = Object.values(usagePriceDict[usage][t]).sort(
      (a, b) => a - b
    );
    const maxRangeNumber = Math.max(...targetRange);
    const minRangeNumber = Math.min(...targetRange);

    let result;
    for (const c of comb) {
      const { ft_sell: ftSell, ft_rent: ftRent } = c;

      if (
        t === "selling" &&
        !!ftSell &&
        ftSell > 0 &&
        ftSell >= minRangeNumber &&
        ftSell <= maxRangeNumber * 1.15
      ) {
        combSum += ftSell;
        count += 1;
      } else if (
        t === "rental" &&
        !!ftRent &&
        ftRent >= minRangeNumber &&
        ftRent <= maxRangeNumber * 1.15
      ) {
        combSum += ftRent;
        count += 1;
      }
    }

    if (count === combNumber) {
      result = combSum / combNumber;
    } else {
      result = -1;
    }

    if (result <= maxRangeNumber && result >= minRangeNumber) {
      finalResult = result;
      finalComb = comb;
      break;
    }
  }
  return { finalResult, finalComb };
};
