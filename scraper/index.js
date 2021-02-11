const moment = require("moment");
const axios = require("axios");
const combinations = require("combinations-generator");
const {
  axiosMidlandResidentialData,
  axiosMilandCommercialData,
} = require("./axiosRequests");
const { findResultAndCombo } = require("./utils/residentialUtils");
const { handleCommercialCombs } = require("./utils/commercialUtils");

const requestMilandCommercialData = async ({
  targetArea,
  startDate,
  endDate,
  usagePriceDict,
  usage,
  t,
  maxTrials,
  combNumber,
  originalStartDate,
  originalEndDate,
}) => {
  const { transactionList, tx, icsType } = await axiosMilandCommercialData({
    targetArea,
    startDate,
    endDate,
    usage,
    t,
  });

  const combs = combinations(transactionList, combNumber);

  const { finalResult, finalComb } = handleCommercialCombs({
    usagePriceDict,
    usage,
    t,
    combNumber,
    combs,
  });

  if (!finalComb || !finalResult) {
    maxTrials -= 1;
    if (maxTrials > 0) {
      const newStartDate = moment(startDate).clone().subtract(1, "month");
      return requestMilandCommercialData({
        tx,
        targetArea,
        startDate: newStartDate,
        endDate,
        icsType,
        usagePriceDict,
        usage,
        t,
        maxTrials,
        combNumber,
        originalStartDate,
        originalEndDate,
      });
    } else if (maxTrials === 0) {
      const newEndDate = moment(endDate).clone().add(1, "month");
      return requestMilandCommercialData({
        targetArea,
        startDate,
        endDate: newEndDate,
        usagePriceDict,
        usage,
        t,
        maxTrials,
        combNumber,
        originalStartDate,
        originalEndDate,
      });
    } else {
      if (combNumber > 3) {
        combNumber -= 1;
        return requestMilandCommercialData({
          targetArea,
          startDate: originalStartDate,
          endDate: originalEndDate,
          usagePriceDict,
          usage,
          t,
          maxTrials,
          combNumber,
          originalStartDate,
          originalEndDate,
        });
      }
      return { finalResult: null, finalComb: null };
    }
  } else {
    return { finalResult, finalComb };
  }
};

const requestMilandResidentialData = async ({
  startDate,
  endDate,
  usagePriceDict,
  usage,
  t,
  maxTrials,
  token,
  combNumber,
  targetArea,
}) => {
  const { resResult } = await axiosMidlandResidentialData({
    t,
    token,
    targetArea,
  });

  const { tempResult, tempComb } = findResultAndCombo({
    resResult,
    combNumber,
    usagePriceDict,
    startDate,
    endDate,
    usage,
    t,
  });

  let finalResult = tempResult;
  let finalComb = tempComb;

  while ((!finalResult || !finalComb) && maxTrials >= 0) {
    if (maxTrials > 0) {
      startDate = moment(startDate).clone().subtract(1, "month");
    } else {
      endDate = moment(endDate).clone().add(1, "month");
    }

    const { tempResult: r, tempComb: c } = findResultAndCombo({
      resResult,
      combNumber,
      usagePriceDict,
      startDate,
      endDate,
      usage,
      t,
    });
    finalResult = r;
    finalComb = c;
    maxTrials -= 1;
  }

  return { finalResult, finalComb };
};

module.exports = {
  requestMilandCommercialData,
  requestMilandResidentialData,
};
