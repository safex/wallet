import { Router, Route, hashHistory } from "react-router";
import React from "react";

import CashWallet from "./components/CashWallet";
import CreateNew from "./components/CreateNew";

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={CashWallet} />
    <Route path="/create-new" component={CreateNew} />
  </Router>
);

export default routes;
