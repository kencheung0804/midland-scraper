import {
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Button,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Frame from "./components/Frame";
import LookupTable from "./components/LookupTable";
import AlertBar from "./components/AlertBar";

const useStyles = makeStyles((theme) => ({
  select: { minWidth: 200 },
  saveButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  emptyText: { paddingTop: 100 },
  fileInput: { paddingBottom: 50 },
}));

export default function UploadJson() {
  const classes = useStyles();
  const ipcRenderer = window.ipcRenderer;
  const [store, setStore] = useState({});
  const [selectedChoice, setSelectedChoice] = useState("");
  const [tableSavedShow, setTableSavedShow] = useState(false);
  const choices = Object.keys(store);

  useEffect(() => {
    ipcRenderer.send("store:request");
  }, [ipcRenderer]);

  useEffect(() => {
    const getStoreFromElectron = (e, item) => {
      setStore(item);
    };
    const handleTableSaved = () => setTableSavedShow(true);
    ipcRenderer.on("store:send", getStoreFromElectron);
    ipcRenderer.on("store:saved", handleTableSaved);

    return () => {
      ipcRenderer.removeListener("store:send", getStoreFromElectron);
      ipcRenderer.removeListener("store:saved", handleTableSaved);
    };
  }, [setStore, ipcRenderer]);
  return (
    <Frame>
      <FormControl className={classes.select}>
        <InputLabel>Choose Table</InputLabel>
        <Select
          value={selectedChoice}
          onChange={(e) => setSelectedChoice(e.target.value)}
        >
          {choices.map((c, index) => (
            <MenuItem key={index} value={c}>
              {choiceReferenceName[c] ? choiceReferenceName[c] : index}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {store && selectedChoice ? (
        <React.Fragment>
          <Button
            onClick={() => {
              ipcRenderer.send("store:store", store);
            }}
            className={classes.saveButton}
            color="primary"
          >
            Save Table
          </Button>

          <input
            type="file"
            name="Upload Whole Json File"
            accept="application/json"
            className={classes.fileInput}
            onChange={(e) => {
              const fileReader = new FileReader();
              fileReader.readAsText(e.target.files[0], "UTF-8");
              fileReader.onload = (e) => {
                setStore((prevStore) => ({
                  ...prevStore,
                  [selectedChoice]: JSON.parse(e.target.result),
                }));
              };
            }}
          />
          <LookupTable
            {...{
              selectedTable: store[selectedChoice],
              setStore,
              selectedChoice,
            }}
          />
        </React.Fragment>
      ) : (
        <Typography variant="h4" align="center" className={classes.emptyText}>
          Please Choose A Table Above
        </Typography>
      )}
      <AlertBar
        {...{
          open: tableSavedShow,
          setOpen: setTableSavedShow,
          severity: "success",
          message: "Table Saved",
        }}
      />
    </Frame>
  );
}

const choiceReferenceName = {
  residentialLookupSingle: "Residential: Single Mode",
  residentialLookupMultiple: "Residential: Multiple Mode",
  commercialLookupSingle: "Commercial/Office: Single Mode",
  commercialLookupMultiple: "Commercial/Office: Multiple Mode",
};
