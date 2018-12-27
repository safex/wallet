import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import { openAlert, closeAlert } from "../utils/utils.js";

import Alert from "./partials/Alert";

export default class CreateNew extends React.Component {
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
    this.createNew = this.createNew.bind(this);
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

  createNew(e) {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    console.log("new wallet password: " + e.target.pass1.value);

    if (pass1 !== "" || pass2 !== "") {
      if (pass1 === pass2) {
        dialog.showSaveDialog(filepath => {
          if (filepath !== undefined) {
            this.setState({ wallet_path: filepath });
            //TODO needs additional sanitation on the passwords, length and type of data

            var args = {
              path: filepath,
              password: pass1,
              network: this.state.net,
              daemonAddress: this.state.daemonHostPort
            };
            if (!safex.walletExists(filepath)) {
              this.setState(() => ({
                wallet_exists: false,
                modal_close_disabled: true
              }));
              this.setOpenAlert(
                "Please wait while your wallet file is being created",
                "create_new_wallet_alert",
                true
              );
              console.log(
                "wallet doesn't exist. creating new one: " +
                  this.state.wallet_path
              );

              safex
                .createWallet(args)
                .then(wallet => {
                  this.setState({
                    wallet_loaded: true,
                    wallet: wallet,
                    wallet_address: wallet.address(),
                    spend_key: wallet.secretSpendKey(),
                    view_key: wallet.secretViewKey()
                  });
                  console.log("wallet address  " + this.state.wallet_address);
                  console.log(
                    "wallet spend private key  " + this.state.spend_key
                  );
                  console.log(
                    "wallet view private key  " + this.state.view_key
                  );
                  this.setOpenAlert(
                    "Wallet File successfully created!",
                    "create_new_wallet_alert",
                    false
                  );
                  setTimeout(() => {
                    this.setCloseAlert();
                  }, 5000);
                })
                .catch(err => {
                  this.setOpenAlert(
                    "error with the creation of the wallet " + err,
                    "create_new_wallet_alert",
                    false
                  );
                  console.log("error with the creation of the wallet " + err);
                });
            } else {
              this.setState(() => ({
                modal_close_disabled: false
              }));
              this.setOpenAlert(
                "Wallet already exists. Please choose a different file name  " +
                  "this application does not enable overwriting an existing wallet file " +
                  "OR you can open it using the Load Existing Wallet",
                "create_new_wallet_alert",
                false
              );
              console.log(
                "Wallet already exists. Please choose a different file name  " +
                  "this application does not enable overwriting an existing wallet file " +
                  "OR you can open it using the Load Existing Wallet"
              );
            }
          }
        });
      } else {
        this.setOpenAlert(
          "Repeated password does not match",
          "create_new_wallet_alert",
          false
        );
        console.log("Repeated password does not match");
      }
      //pass dialog box
      //pass password
      //confirm password
    } else {
      this.setOpenAlert(
        "Fill out all the fields",
        "create_new_wallet_alert",
        false
      );
    }
  }

  render() {
    return (
      <div className="create-new-wrap">
        <img
          src="images/create-new.png"
          className="create-new-pic"
          alt="create-new"
        />
        <button onClick={this.goBack} className="go-back-btn button-shine">
          Back
        </button>
        <h2>Create New Wallet File</h2>
        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <form onSubmit={this.createNew}>
            <div className="group-wrap">
              <div className="form-group">
                <input type="text" name="pass1" placeholder="password" />
                <input type="text" name="pass2" placeholder="repeat password" />
              </div>
            </div>
            <button type="submit" className="submit button-shine">
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

CreateNew.contextTypes = {
  router: React.PropTypes.object.isRequired
};
