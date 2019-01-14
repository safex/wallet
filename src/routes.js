import { Router, Route, hashHistory } from "react-router";
import React from "react";

import CashWallet from "./components/CashWallet";
import CreateNew from "./components/CreateNew";
import CreateFromKeys from "./components/CreateFromKeys";
import OpenFile from "./components/OpenFile";
import NewFromMnemonic from "./components/NewFromMnemonic";

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={CashWallet} />
    <Route path="/create-new" component={CreateNew} />
    <Route path="/create-from-keys" component={CreateFromKeys} />
    <Route path="/open-file" component={OpenFile} />
    <Route path="/new-from-mnemonic" component={NewFromMnemonic} />
  </Router>
);

export default routes;
