import React from "react";
import Alert from "./partials/Alert";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import ExitModal from "./partials/ExitModal";
import {
  verify_safex_address,
  openAlert,
  closeAlert,
  closeApp
} from "../utils/utils.js";

export default class CreateFromKeys extends React.Component {
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
      create_from_keys_alert: false
    };

    this.goBack = this.goBack.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
    this.createNewWalletFromKeys = this.createNewWalletFromKeys.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
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

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  createNewWalletFromKeys(e) {
    e.preventDefault();

    //here we need the key set
    //the wallet path desired
    //the password
    var safex_address = e.target.address.value;
    var view_key = e.target.viewkey.value;
    var spend_key = e.target.spendkey.value;
    var pass1 = e.target.pass1.value;
    var pass2 = e.target.pass2.value;

    if (
      safex_address !== "" ||
      view_key !== "" ||
      spend_key !== "" ||
      pass1 !== "" ||
      pass2 !== ""
    ) {
      if (pass1 !== "" && pass2 !== "" && pass1 === pass2) {
        if (
          this.state.net == "testnet" ||
          verify_safex_address(spend_key, view_key, safex_address)
        ) {
          dialog.showSaveDialog(filepath => {
            if (filepath !== undefined) {
              this.setState({
                wallet_path: filepath
              });
              var args = {
                path: this.state.wallet_path,
                password: pass1,
                network: this.state.net,
                daemonAddress: this.state.daemonHostPort,
                restoreHeight: 0,
                addressString: safex_address,
                viewKeyString: view_key,
                spendKeyString: spend_key
              };
              if (!safex.walletExists(filepath)) {
                this.setState(() => ({
                  wallet_exists: false,
                  modal_close_disabled: true
                }));
                this.setOpenAlert(
                  "Please wait while your wallet file is being created",
                  "create_from_keys_alert",
                  true
                );
                console.log(
                  "wallet doesn't exist. creating new one: " +
                    this.state.wallet_path
                );

                safex
                  .createWalletFromKeys(args)
                  .then(wallet => {
                    console.log("Create wallet form keys performed!");
                    this.setState({
                      wallet_loaded: true,
                      wallet: wallet,
                      wallet_address: wallet.address(),
                      spend_key: wallet.secretSpendKey(),
                      view_key: wallet.secretViewKey(),
                      modal_close_disabled: false
                    });
                    console.log("wallet address  " + this.state.wallet_address);
                    console.log(
                      "wallet spend private key  " + this.state.spend_key
                    );
                    console.log(
                      "wallet view private key  " + this.state.view_key
                    );
                    console.log("create_new_wallet_from_keys checkpoint 1");
                    this.refs.address.value = "";
                    this.refs.spendkey.value = "";
                    this.refs.viewkey.value = "";
                    this.refs.pass1.value = "";
                    this.refs.pass2.value = "";
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
                    console.log("Create wallet form keys failed!");
                    this.setOpenAlert(
                      "Error with the creation of the wallet " + err,
                      "create_from_keys_alert",
                      false
                    );
                  });
              } else {
                console.log("Safex wallet exists!");
                this.setState(() => ({
                  modal_close_disabled: false
                }));
                this.setOpenAlert(
                  "Wallet already exists. Please choose a different file name  " +
                    "this application does not enable overwriting an existing wallet file " +
                    "OR you can open it using the Load Existing Wallet",
                  "create_from_keys_alert",
                  false
                );
              }
            }
          });
          console.log("create_new_wallet_from_keys checkpoint 2");
        } else {
          console.log("Incorrect keys");
          this.setOpenAlert("Incorrect keys", "create_from_keys_alert", false);
        }
      } else {
        this.setOpenAlert(
          "Passwords do not match",
          "create_from_keys_alert",
          false
        );
      }
    } else {
      this.setOpenAlert(
        "Fill out all the fields",
        "create_from_keys_alert",
        false
      );
    }
  }

  render() {
    return (
      <div
        className={
          this.state.closing
            ? "create-new-wrap create-from-keys-wrap animated fadeOut"
            : "create-new-wrap create-from-keys-wrap"
        }
      >
        <img
          src="images/new-from-keys.png"
          className="create-new-pic"
          alt="new-from-keys"
        />
        <button onClick={this.goBack} className="go-back-btn button-shine">
          Back
        </button>
        <button
          onClick={this.toggleExitModal}
          className="close-app-btn button-shine"
          title="Exit"
        >
          X
        </button>

        <h2>Create New Wallet From Keys</h2>
        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <form onSubmit={this.createNewWalletFromKeys}>
            <div className="group-wrap">
              <div className="form-group">
                <input
                  type="text"
                  name="address"
                  ref="address"
                  placeholder="address"
                />
                <input
                  type="text"
                  name="spendkey"
                  ref="spendkey"
                  placeholder="Secret Spendkey"
                />
                <input
                  type="text"
                  name="viewkey"
                  ref="viewkey"
                  placeholder="Secret Viewkey"
                />
                <input
                  type="password"
                  name="pass1"
                  ref="pass1"
                  placeholder="password"
                />
                <input
                  type="password"
                  name="pass2"
                  ref="pass2"
                  placeholder="repeat password"
                />
              </div>
            </div>
            <button type="submit" className="submit btn button-shine">
              Create
            </button>
          </form>

          <Alert
            openAlert={this.state.create_from_keys_alert}
            alertText={this.state.alert_text}
            alertCloseDisabled={this.state.alert_close_disabled}
            closeAlert={this.setCloseAlert}
          />
        </div>

        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.toggleExitModal}
          closeApp={this.setCloseApp}
        />
      </div>
    );
  }
}

CreateFromKeys.contextTypes = {
  router: React.PropTypes.object.isRequired
};
