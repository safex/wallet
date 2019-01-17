import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import Alert from "./partials/Alert";
import ExitModal from "./partials/ExitModal";
import { closeApp, openAlert, closeAlert  } from "../utils/utils.js";

export default class NewFromMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: '',
    };

    this.goToPage = this.goToPage.bind(this);
    this.createNewFromMnemonic = this.createNewFromMnemonic.bind(this);
    this.hasNumber = this.hasNumber.bind(this);
    this.countWords = this.countWords.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
  }

  goToPage() {
    this.props.goToPage();
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  toggleMnemonic() {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  }

  setOpenAlert(alert, alert_state, disabled) {
    openAlert(this, alert, alert_state, disabled);
  }

  setCloseAlert() {
    closeAlert(this);
  }

  hasNumber(myString) {
    return /\d/.test(myString);
  }

  countWords(str) {
    return str.trim().split(/\s+/).length;
  }

  createNewFromMnemonic(e) {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    const mnemonic = e.target.mnemonic.value;

    if (pass1 === "" || pass2 === "") {
      this.setOpenAlert(
        "Fill out all the fields",
        "alert",
        false
      );
      return false;
    }
    if (pass1 !== pass2) {
      this.setOpenAlert(
        "Repeated password does not match",
        "alert",
        false
      );
      return false;
    }
    if (mnemonic === "") {
      this.setOpenAlert(
        "Enter mnemonic seed for your wallet",
        "alert",
        false
      );
      return false;
    }
    if (
      this.countWords(mnemonic) < 24 || 
      this.countWords(mnemonic) > 25
    ) {
      this.setOpenAlert(
        "Mnemonic seed must contain 24 or 25 words",
        "alert",
        false
      );
      console.log("word count " + this.countWords(mnemonic));
      return false;
    }
    if (this.hasNumber(mnemonic)) {
      this.setOpenAlert(
        "Mnemonic seed must not contain a number",
        "alert",
        false
      );
      return false;
    }
    console.log("word count " + this.countWords(mnemonic));
    dialog.showSaveDialog(filepath => {
      if (!filepath) {
        return false;
      }
      if (safex.walletExists(filepath)) {
        this.setOpenAlert(
          `Wallet already exists. Please choose a different file name  
          "this application does not enable overwriting an existing wallet file 
          "OR you can open it using the Load Existing Wallet`,
          "alert",
          false
        );
        return false;
      }
      this.setState(() => ({
        alert_close_disabled: true
      }));
        this.setOpenAlert(
          "Please wait while your wallet file is being created. Don't close the application until the process is complete. This can take a while, please be patient.",
          "alert",
          true
        );
        console.log("wallet doesn't exist. creating new one: " + this.state.wallet_path);
        console.log("mnemonic seed: " + mnemonic);
          
        this.props.createWallet("recoveryWallet", {
          path: filepath,
          password: pass1,
          network: "mainnet",
          daemonAddress: "rpc.safex.io:17402",
          mnemonic: mnemonic,
        });
        console.log("Recover wallet from mnemonic performed!");
    });
  }

  render() {
    return (
      <div
        className={
          this.state.closing
            ? "create-new-wrap new-from-mnemonic-wrap animated fadeOut"
            : "create-new-wrap new-from-mnemonic-wrap"
        }
      >
        <img
          src="images/mnemonic.png"
          className="create-new-pic"
          alt="create-new"
        />
        <button
          onClick={this.goToPage}
          className="go-back-btn button-shine"
          disabled={this.state.alert_close_disabled ? "disabled" : ""}
        >
          Back
        </button>
        <button
          onClick={this.toggleExitModal}
          className="close-app-btn button-shine"
          title="Exit"
          disabled={this.state.alert_close_disabled ? "disabled" : ""}
        >
          X
        </button>

        <h2>Recover Wallet From Mnemonic Seed</h2>
        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <form
            onSubmit={this.createNewFromMnemonic}
          >
            <div className="group-wrap">
              <div className="form-group">
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
                <label>Mnemonic Seed for your Wallet</label>
                <textarea
                  name="mnemonic"
                  ref="mnemonic"
                  placeholder="mnemonic seed"
                  rows="3"
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

        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.toggleExitModal}
          closeApp={this.setCloseApp}
        />
      </div>
    );
  }
}
