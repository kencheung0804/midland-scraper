const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const Excel = require("exceljs");
const {
  getAreaList,
  getUsageList,
  setUpResidentialToken,
  makeUsagePriceDict,
} = require("./scraper/utils");
const { txType } = require("./scraper/constants");
const { prepareSheet } = require("./scraper/wbCreators");
const { getLookUpTables, saveLookUpTables } = require("./scraper/appStorage");

let mainWindow;
Menu.setApplicationMenu(false)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: `${__dirname}/preload.js`,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL("http://localhost:3000");
}

ipcMain.on("select-dirs", async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  mainWindow.webContents.send("filePath:chosen", result.filePaths);
});

ipcMain.on("store:request", () => {
  mainWindow.webContents.send("store:send", getLookUpTables());
});

ipcMain.on("store:store", (e, store) => {
  saveLookUpTables(store);
  mainWindow.webContents.send("store:saved");
});

ipcMain.on("parameters:selected", async (e, params) => {
  try {
    const {
      filename,
      startDate,
      endDate,
      resultWbPath,
      modeSelection,
    } = params;
    const token = await setUpResidentialToken();

    console.log(resultWbPath);

    let targetWb = new Excel.Workbook();
    targetWb = await targetWb.xlsx.readFile(filename);
    const targetSheet = targetWb.worksheets[0];
    let rowIndex = 32;

    while (!!targetSheet.getRow(rowIndex).getCell("H").value) {
      const targetPropertyName = targetSheet.getCell(`G${rowIndex}`).value;
      const areaList = getAreaList({ ws: targetSheet, rowIndex, mainWindow });
      const usages = getUsageList({ ws: targetSheet, rowIndex, mainWindow });
      const usagePriceDict = makeUsagePriceDict({
        ws: targetSheet,
        rowIndex,
        usages,
        mainWindow,
      });

      for (const usage of usages) {
        for (const t of txType) {
          if (
            Object.values(usagePriceDict[usage][t]).every(
              (v) => !(v === null || isNaN(v))
            )
          ) {
            const isCommercial = usage === "Commercial" || usage === "Office";
            await prepareSheet({
              targetWb,
              targetSheet,
              filename,
              rowIndex,
              t,
              usage,
              areaList,
              startDate,
              endDate,
              usagePriceDict,
              targetPropertyName,
              resultWbPath,
              modeSelection,
              mainWindow,
              isCommercial,
              token,
            });
          }
        }
      }

      rowIndex += 1;
    }

    mainWindow.webContents.send("data:constructed");
  } catch (err) {
    console.log(err);
  }
});

app.whenReady().then(async () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
