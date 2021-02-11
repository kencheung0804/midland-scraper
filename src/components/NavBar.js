import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, AppBar, Toolbar, IconButton } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: "auto",
  },
}));

export default function NavBar() {
  const history = useHistory();
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
        {history?.location?.pathname === "/upload_json" && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => history.goBack()}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Button
          color="inherit"
          className={classes.button}
          onClick={() => {
            history.push("/upload_json");
          }}
        >
          Upload Json
        </Button>
      </Toolbar>
    </AppBar>
  );
}
