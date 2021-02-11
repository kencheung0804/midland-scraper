import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
import UploadJson from "./UploadJson";

const Index = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <App />
        </Route>
      </Switch>
      <Switch>
        <Route path="/upload_json" exact>
          <UploadJson />
        </Route>
      </Switch>
    </Router>
  );
};

ReactDOM.render(<Index />, document.getElementById("root"));
