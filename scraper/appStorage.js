const Store = require("electron-store");
const {
  defaultResidentialLookupSingle,
  defaultCommercialLookupSingle,
  defaultCommercialLookupMultiple,
  defaultResidentialLookupMultiple,
} = require("./constants.js");

const getLookUpTables = () => {
  const store = new Store({ cwd: "lookUpTables" });

  return {
    residentialLookupSingle: store.get(
      "residentialLookupSingle",
      defaultResidentialLookupSingle
    ),
    residentialLookupMultiple: store.get(
      "residentialLookupMultiple",
      defaultResidentialLookupMultiple
    ),
    commercialLookupSingle: store.get(
      "commercialLookupSingle",
      defaultCommercialLookupSingle
    ),
    commercialLookupMultiple: store.get(
      "commercialLookupMultiple",
      defaultCommercialLookupMultiple
    ),
  };
};

const saveLookUpTables = (tables) => {
  const store = new Store({ cwd: "lookUpTables" });

  for (const [table, value] of Object.entries(tables)) {
    store.set(table, value);
  }
};

module.exports = {
  getLookUpTables,
  saveLookUpTables,
};
