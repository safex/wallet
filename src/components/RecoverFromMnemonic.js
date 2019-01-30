import React from "react";
import Alert from "./partials/Alert";
import ExitModal from "./partials/ExitModal";
import { closeApp, openAlert, closeAlert } from "../utils/utils.js";
import Header from "./partials/Header";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class NewFromMnemonic extends React.Component {
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

  toggleMnemonic = () => {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  };

  setOpenAlert = (alert, disabled) => {
    openAlert(this, alert, disabled);
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  hasNumber = myString => {
    return /\d/.test(myString);
  };

  countWords = str => {
    return str.trim().split(/\s+/).length;
  };

  createNewFromMnemonic = e => {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    const mnemonicValue = e.target.mnemonic.value;
    const mnemonic = mnemonicValue.replace(/\s+/g, " ");

    if (pass1 === "" || pass2 === "") {
      this.setOpenAlert("Fill out all the fields", false);
      return false;
    }
    if (pass1 !== pass2) {
      this.setOpenAlert("Repeated password does not match", false);
      return false;
    }
    if (mnemonic === "") {
      this.setOpenAlert("Enter mnemonic seed for your wallet", false);
      return false;
    }
    if (this.countWords(mnemonic) < 24 || this.countWords(mnemonic) > 25) {
      this.setOpenAlert("Mnemonic seed must contain 24 or 25 words", false);
      return false;
    }
    if (this.hasNumber(mnemonic)) {
      this.setOpenAlert("Mnemonic seed must not contain a number", false);
      return false;
    }
    console.log("word count " + this.countWords(mnemonic));
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
      console.log("wallet doesn't exist. creating new one: " + filepath);
      console.log("mnemonic seed: " + mnemonic);

      this.props.createWallet("recoveryWallet", {
        path: filepath,
        password: pass1,
        network: this.props.config.network,
        daemonAddress: this.props.config.daemonAddress,
        mnemonic: mnemonic
      });
      localStorage.setItem("wallet_path", this.state.wallet_path);
      localStorage.setItem("password", JSON.stringify(pass1));
      console.log("Recover wallet from mnemonic performed!");
    });
  };

  render() {
    return (
      <div className="item-wrap new-from-mnemonic-wrap">
        <Header
          goToPage={this.goToPage}
          toggleExitModal={this.toggleExitModal}
        />
        <div className="item-inner">
          <img
            src="images/mnemonic.png"
            className="item-pic"
            alt="create-new"
          />
          <h2>Recover Wallet From Mnemonic Seed</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap login-wrap">
            <form onSubmit={this.createNewFromMnemonic}>
              <div className="group-wrap">
                <div className="form-group">
                  <input type="password" name="pass1" placeholder="password" />
                  <input
                    type="password"
                    name="pass2"
                    placeholder="repeat password"
                  />
                  <label>Mnemonic Seed for your Wallet</label>
                  <textarea
                    name="mnemonic"
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
