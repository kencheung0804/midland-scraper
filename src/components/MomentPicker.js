import React from "react";
import { DatePicker } from "@material-ui/pickers";

export default function MomentPicker({ date, setDate, label }) {
  return (
    <DatePicker
      inputVariant="outlined"
      openTo="year"
      views={["year", "month"]}
      label={label}
      value={date}
      onChange={(d) => setDate(d)}
    />
  );
}
