import React from "react";
import ExitModal from "./partials/ExitModal";
import { closeApp } from "../utils/utils.js";
import Alert from "./partials/Alert";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;
import { openAlert, closeAlert } from "../utils/utils.js";

export default class CreateNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //wallet state settings
      wallet: {},
      wallet_connected: false,
      blockchain_height: 0,
      wallet_sync: false,
      wallet_loaded: false,
      wallet_exists: false,
      wallet_path: "",
      spend_key: "",
      view_key: "",
      open_file_alert: false,
      net: "mainnet",
      daemonHostPort: "rpc.safex.io:17402",
      mnemonic: "",
      mnemonic_active: false,

      //balance settings
      balance: 0,
      unlocked_balance: 0,
      tokens: 0,
      unlocked_tokens: 0,
      balance_wallet: "",
      balance_view_key: "",
      balance_spend_key: "",
      send_cash: false,
      send_token: false
    }; 

    this.goToPage = this.goToPage.bind(this);
    this.createNew = this.createNew.bind(this);
    this.createAnotherFile = this.createAnotherFile.bind(this);
    this.closeWallet = this.closeWallet.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
  }

  goToPage() {
    this.props.goToPage();
  }

  toggleMnemonic() {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
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

      //TODO needs additional sanitation on the passwords, length and type of data
      this.props.createWallet("createWallet", {
        path: filepath,
        password: pass1,
        network: this.state.net,
        daemonAddress: this.state.daemonHostPort,
        mnemonic: ""
      });

      this.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete.",
        "alert",
        true
      );
    });
  }

  createAnotherFile() {
    this.setState({
      wallet_exists: false,
      wallet_created: false
    });
    this.closeWallet();
  }

  closeWallet() {
    this.state.wallet.pauseRefresh();
    this.state.wallet.off();
    this.state.wallet.close(true);
  }

  render() {
    return (
      <div className="create-new-wrap">
        <img
          src="images/create-new.png"
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
        >
          X
        </button>
        <div
          className={
            this.state.wallet_created
              ? "create-new-inner hidden"
              : "create-new-inner"
          }
        >
          <h2>Create New Wallet File</h2>
          <div className="col-xs-6 col-xs-push-3 login-wrap">
            <form
              className={this.state.mnemonic_active ? "hidden" : ""}
              onSubmit={this.createNew}
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
                </div>
              </div>
              <button type="submit" className="submit btn button-shine">
                {this.state.wallet_created ? (
                  <span>Create New</span>
                ) : (
                  <span>Create</span>
                )}
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
