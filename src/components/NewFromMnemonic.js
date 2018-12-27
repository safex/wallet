import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import { openAlert, closeAlert } from "../utils/utils.js";

import Alert from "./partials/Alert";

export default class NewFromMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: "",
      wallet_exists: false,
      wallet: {},
      wallet_loaded: false,
      wallet_address: "",
      spend_key: "",
      view_key: "",
      net: "mainnet",
      daemonHostPort: "rpc.safex.io:17402",
      create_new_wallet_alert: false
    };

    this.goBack = this.goBack.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
    this.newFromMnemonic = this.newFromMnemonic.bind(this);
  }

  goBack() {
    this.context.router.push("/");
  }

  setOpenAlert(alert, alert_state, disabled) {
    openAlert(this, alert, alert_state, disabled);
  }

  setCloseAlert() {
    closeAlert(this);
  }

  newFromMnemonic(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div className="create-new-wrap new-from-mnemonic-wrap">
        <img
          src="images/mnemonic.png"
          className="create-new-pic"
          alt="mnemonic"
        />
        <button onClick={this.goBack} className="go-back-btn button-shine">
          Back
        </button>
        <h2>Create New Wallet From Mnemonic</h2>
        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <form onSubmit={this.newFromMnemonic}>
            <div className="group-wrap">
              <div className="form-group">
                <input type="text" name="pass1" placeholder="password" />
                <input type="text" name="pass2" placeholder="repeat password" />
              </div>
            </div>
            <button type="submit" className="submit btn button-shine">
              Create
            </button>
          </form>

          <Alert
            openAlert={this.state.create_new_wallet_alert}
            alertText={this.state.alert_text}
            alertCloseDisabled={this.state.alert_close_disabled}
            closeAlert={this.setCloseAlert}
          />
        </div>
      </div>
    );
  }
}

NewFromMnemonic.contextTypes = {
  router: React.PropTypes.object.isRequired
};
