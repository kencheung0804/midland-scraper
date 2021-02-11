import React, { useCallback, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import path from "path";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
  Button,
  Box,
  Switch,
  FormControlLabel,
  Chip,
  Typography,
  TextField,
} from "@material-ui/core";
import { acceptedMimeTypes } from "./utils/acceptedMimeTypes";
import AlertBar from "./components/AlertBar";
import FileDrop from "./components/FileDrop";
import MomentPicker from "./components/MomentPicker";
import ConstructionModal from "./components/ConstructionModal";
import Frame from "./components/Frame";

const useStyles = makeStyles((theme) => ({
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  scrapeButton: {
    marginTop: 20,
    width: "50%",
    marginBottom: 50,
  },
  dateBox: {
    width: "80%",
    display: "flex",
    justifyContent: "space-around",
    marginTop: 20,
  },
  chip: { marginTop: 20 },
  backdrop: {
    zIndex: 1000000,
  },
  switch: {
    alignSelf: "flex-end",
  },
  locationBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 20,
  },
}));

function App() {
  const ipcRenderer = window.ipcRenderer;
  const classes = useStyles();
  const [notSupportedOpenBar, setNotSupportedOpenBar] = useState(false);
  const [errorMessages, setErrorMessages] = useState(["Loading..."]);
  const [modeSelection, setModeSelection] = useState(true);
  const mode = modeSelection ? "multiple" : "single";
  const [loading, setLoading] = useState(false);
  const [constructModalOpen, setConstructModalOpen] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [startDate, setStartDate] = useState(moment().startOf("month"));
  const [endDate, setEndDate] = useState(moment().startOf("month"));
  const [resultWbPath, setResultWbPath] = useState(null);
  const [resultWbName, setResultWbName] = useState("");

  useEffect(() => {
    const setNotLoading = () => setLoading(false);
    const pushNewError = (e, item) => {
      setErrorMessages((prevMessages) => [...prevMessages, item]);
    };
    const resultWbPathChosen = (e, item) => {
      if (item.length) {
        setResultWbPath(...item);
      }
    };
    ipcRenderer.on("data:constructed", setNotLoading);
    ipcRenderer.on("error:push", pushNewError);
    ipcRenderer.on("filePath:chosen", resultWbPathChosen);
    return () => {
      ipcRenderer.removeListener("data:constructed", setNotLoading);
      ipcRenderer.removeListener("error:push", pushNewError);
      ipcRenderer.removeListener("filePath:chosen", resultWbPathChosen);
    };
  }, [ipcRenderer]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const selectedFile = acceptedFiles?.length && acceptedFiles[0];
      if (selectedFile && acceptedMimeTypes.includes(selectedFile.type)) {
        setSelectedExcelFile(selectedFile.path);
      } else {
        setNotSupportedOpenBar(true);
      }
    },
    [setSelectedExcelFile]
  );

  const sendFileToBackend = useCallback(() => {
    setLoading(true);
    setConstructModalOpen(true);
    if (!!selectedExcelFile) {
      ipcRenderer.send("parameters:selected", {
        filename: selectedExcelFile,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        resultWbPath: path.join(resultWbPath, resultWbName + ".xlsx"),
        modeSelection: mode,
      });
    }
  }, [
    selectedExcelFile,
    startDate,
    endDate,
    ipcRenderer,
    setLoading,
    mode,
    resultWbName,
    resultWbPath,
  ]);

  return (
    <Frame
      modal={
        <ConstructionModal
          {...{
            errorMessages,
            setErrorMessages,
            loading,
            constructModalOpen,
            setConstructModalOpen,
          }}
        />
      }
    >
      <FormControlLabel
        label={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
        control={
          <Switch
            checked={modeSelection}
            onChange={(e) => setModeSelection(e.target.checked)}
            color="primary"
          />
        }
        className={classes.switch}
      />
      <Box className={classes.locationBox}>
        <Button onClick={() => ipcRenderer.send("select-dirs")} color="primary">
          Select Result File Directory
        </Button>
        {!!resultWbPath && (
          <Typography variant="subtitle2">{resultWbPath}</Typography>
        )}
        <TextField
          label="Desired File Name"
          value={resultWbName}
          onChange={(e) => setResultWbName(e.target.value)}
        />
      </Box>
      <FileDrop {...{ onDrop }} />
      <AlertBar
        {...{
          open: notSupportedOpenBar,
          setOpen: setNotSupportedOpenBar,
          severity: "error",
          message: "Only excel files are accepted!",
        }}
      />
      {selectedExcelFile && (
        <Chip
          label={"..." + selectedExcelFile?.slice(-15)}
          onDelete={() => setSelectedExcelFile(null)}
          color="primary"
          className={classes.chip}
        />
      )}
      <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
        <Box className={classes.dateBox}>
          <MomentPicker
            {...{ date: startDate, setDate: setStartDate, label: "Start Date" }}
          />
          <MomentPicker
            {...{ date: endDate, setDate: setEndDate, label: "End Date" }}
          />
        </Box>
      </MuiPickersUtilsProvider>

      <Button
        variant="contained"
        disabled={!selectedExcelFile || !resultWbPath || !resultWbName || !mode}
        color="primary"
        size="large"
        className={classes.scrapeButton}
        onClick={sendFileToBackend}
      >
        Scrape Now!
      </Button>
    </Frame>
  );
}

export default App;
