import React from "react";
import { Box, Divider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LookupModComponent from "./LookupModComponent";
import { addNestedValueInList } from "../utils/updateState";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
  },
  row: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
  },
  right: {
    display: "flex",
    flex: 2,
    flexDirection: "column",
    alignItems: "center",
  },
  divider: {
    marginBottom: 20,
  },
  addIcon: {
    paddingTop: 20,
    paddingBottom: 20,
  },
}));

export default function LookupTable({
  selectedTable,
  setStore,
  selectedChoice,
}) {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      {Object.keys(selectedTable)
        .sort((a, b) => a - b)
        .map((key, index) => {
          return (
            <React.Fragment key={index}>
              <Box className={classes.row}>
                <Typography variant="subtitle1" className={classes.left}>
                  {key}
                </Typography>

                <Box className={classes.right}>
                  {selectedTable[key].map((variant, i) => {
                    return (
                      <LookupModComponent
                        {...{
                          setStore,
                          selectedChoice,
                          targetKey: key,
                          arrayIndex: i,
                          displayValue: variant,
                          key: i,
                        }}
                      />
                    );
                  })}
                  <AddCircleIcon
                    color="primary"
                    fontSize="large"
                    className={classes.addIcon}
                    onClick={() =>
                      setStore((prevStore) =>
                        addNestedValueInList(
                          prevStore,
                          [selectedChoice, key],
                          ""
                        )
                      )
                    }
                  />
                </Box>
              </Box>
              <Divider className={classes.divider} />
            </React.Fragment>
          );
        })}
    </Box>
  );
}
