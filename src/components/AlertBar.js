import React, { useCallback } from "react";
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

function AlertBar({ open, setOpen, severity, message }) {
  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
      <Alert severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default AlertBar;
