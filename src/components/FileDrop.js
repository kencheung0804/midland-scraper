import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Paper, RootRef, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BackupIcon from "@material-ui/icons/Backup";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "70%",
    height: 400,
    borderRadius: 20,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    outline: "none",
  },
  icon: {
    transition: "all .3s",
    fontSize: 240,
  },
  iconActive: {
    transform: "scale(1.1)",
    color: theme.palette.primary.main,
  },
}));

function FileDrop({ onDrop }) {
  const [hovered, setHovered] = useState(false);
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });
  const { ref, ...rootProps } = getRootProps();

  return (
    <RootRef rootRef={ref}>
      <Paper
        {...rootProps}
        className={classes.paper}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <input {...getInputProps()} />
        <BackupIcon
          color="disabled"
          className={clsx([
            classes.icon,
            (isDragActive || hovered) && classes.iconActive,
          ])}
        />
        <Typography variant="h6" align="center">
          Please drag your excel file here.
        </Typography>
      </Paper>
    </RootRef>
  );
}

export default FileDrop;
