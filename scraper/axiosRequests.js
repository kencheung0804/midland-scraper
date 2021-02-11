const axios = require("axios");
const moment = require("moment");
const {
  midlandCommercialQueriesDict,
  chooseUserAgent,
} = require("./constants");

const axiosMidlandResidentialData = async ({ t, token, targetArea }) => {
  const tx = midlandCommercialQueriesDict.transaction[t];
  const { data } = await axios({
    url: "https://data.midland.com.hk/search/v1/transactions",
    params: {
      hash: true,
      lang: "zh-hk",
      currency: "HKD",
      unit: "feet",
      search_behavior: "normal",
      dist_ids: targetArea,
      tx_date: "3year",
      page: 1,
      limit: 100000,
      tx_type: tx,
    },
    headers: {
      authorization: `Bearer ${token}`,
      "User-Agent": chooseUserAgent(),
    },
  });
  let { result: resResult } = data;

  return { resResult };
};

const axiosMilandCommercialData = async ({
  targetArea,
  startDate,
  endDate,
  usage,
  t,
}) => {
  const tx = midlandCommercialQueriesDict.transaction[t];
  const icsType = midlandCommercialQueriesDict.usage[usage];

  const formattedStartDate = moment(startDate).clone().format("YYYY-MM-DD");
  const formattedEndDate = moment(endDate).clone().format("YYYY-MM-DD");
  const { data } = await axios({
    url: "https://www.midlandici.com.hk/ics/property/transaction/json",
    params: {
      "tx_type[]": tx,
      districts: targetArea,
      ics_type: icsType,
      lang: "english",
      date_min: formattedStartDate,
      date_max: formattedEndDate,
      page_size: 1000,
    },
    headers: {
      "User-Agent": chooseUserAgent(),
    },
  });
  const { transactions: transactionList } = data;
  return { transactionList, tx, icsType };
};

module.exports = {
  axiosMidlandResidentialData,
  axiosMilandCommercialData,
};
