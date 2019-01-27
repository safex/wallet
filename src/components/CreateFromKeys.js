import React from "react";
import Alert from "./partials/Alert";
import ExitModal from "./partials/ExitModal";
import Buttons from "./partials/Buttons";
import {
  verify_safex_address,
  closeApp,
  openAlert,
  closeAlert
} from "../utils/utils.js";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class CreateFromKeys extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  goToPage = () => {
    this.props.goToPage();
  };

  toggleExitModal = () => {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  };

  setCloseApp = () => {
    closeApp(this);
  };

  setOpenAlert = (alert, disabled) => {
    openAlert(this, alert, disabled);
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  createWalletFromKeys = e => {
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
      safex_address === "" ||
      view_key === "" ||
      spend_key === "" ||
      pass1 === "" ||
      pass2 === ""
    ) {
      this.setOpenAlert("Fill out all the fields", false);
      return false;
    }
    if (pass1 !== pass2) {
      this.setOpenAlert("Passwords do not match", false);
      return false;
    }
    if (spend_key.length !== 64) {
      this.setOpenAlert("Incorrect spend key", false);
      return false;
    }
    if (view_key.length !== 64) {
      this.setOpenAlert("Incorrect view key", false);
      return false;
    }
    if (
      this.state.network === "mainnet" &&
      verify_safex_address(spend_key, view_key, safex_address) === false
    ) {
      this.setOpenAlert("Incorrect keys", false);
      return false;
    }
    dialog.showSaveDialog(filepath => {
      if (!filepath) {
        return false;
      }
      if (safex.walletExists(filepath)) {
        this.setOpenAlert(
          `Wallet already exists. Please choose a different file name. 
          This application does not enable overwriting an existing wallet file 
          OR you can open it using the Load Existing Wallet`,
          false
        );
        return false;
      }
      this.setState(() => ({
        alert_close_disabled: true
      }));
      this.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete. This can take a while, please be patient.",
        true
      );
      console.log("Wallet doesn't exist. creating new one: " + filepath);
      this.props.createWallet("createWalletFromKeys", {
        path: filepath,
        password: pass1,
        network: this.props.config.network,
        daemonAddress: this.props.config.daemonAddress,
        restoreHeight: 0,
        addressString: safex_address,
        viewKeyString: view_key,
        spendKeyString: spend_key
      });
      console.log("Create wallet from keys performed!");
      console.log("Create new wallet from keys checkpoint 1");
    });
    console.log("Create new wallet from keys checkpoint 2");
  };

  render() {
    return (
      <div className="item-wrap create-from-keys-wrap">
        <div className="item-inner">
          <img
            src="images/new-from-keys.png"
            className="item-pic"
            alt="new-from-keys"
          />
          <button
            onClick={this.goToPage}
            className="go-back-btn button-shine"
            disabled={this.state.alert_close_disabled ? "disabled" : ""}
          >
            Back
          </button>
          <Buttons toggleExitModal={this.toggleExitModal} />

          <h2>Create New Wallet From Keys</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap login-wrap">
            <form onSubmit={this.createWalletFromKeys}>
              <div className="group-wrap">
                <div className="form-group">
                  <input type="text" name="address" placeholder="address" />
                  <input
                    type="text"
                    name="spendkey"
                    placeholder="secret spendkey"
                  />
                  <input
                    type="text"
                    name="viewkey"
                    placeholder="secret viewkey"
                  />
                  <input type="password" name="pass1" placeholder="password" />
                  <input
                    type="password"
                    name="pass2"
                    placeholder="repeat password"
                  />
                </div>
              </div>
              <button type="submit" className="submit btn button-shine">
                Create
              </button>
            </form>

            <Alert
              openAlert={this.state.alert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
              closeAlert={this.setCloseAlert}
            />
          </div>
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
