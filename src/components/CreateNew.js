import React from "react";
import ExitModal from "./partials/ExitModal";
import { closeApp } from "../utils/utils.js";
import Alert from "./partials/Alert";
import { openAlert, closeAlert } from "../utils/utils.js";
import Toggle from "react-toggle-component";
import "react-toggle-component/styles.css";
import Header from "./partials/Header";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class CreateNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: this.props.config
    };
  }

  componentWillUnmount() {
    this.props.resetNetworkSelect();
  }

  goToPage = () => {
    this.props.goToPage();
  };

  toggleMnemonic = () => {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
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

  createNew = e => {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;

    if (pass1 === "" || pass2 === "") {
      this.setOpenAlert("Fill out all the fields", false);
      return false;
    }
    if (pass1 !== pass2) {
      this.setOpenAlert("Repeated password does not match", false);
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
      //TODO needs additional sanitation on the passwords, length and type of data
      this.props.createWallet("createWallet", {
        path: filepath,
        password: pass1,
        network: this.props.config.network,
        daemonAddress: this.props.config.daemonAddress
      });
      localStorage.setItem("wallet_path", filepath);
      localStorage.setItem("password", JSON.stringify(pass1));
      this.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete.",
        true
      );
    });
  }

  render() {
    return (
      <div className="item-wrap create-new-wrap">
        <Header
          goToPage={this.goToPage}
          toggleExitModal={this.toggleExitModal}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img
            src="images/create-new.png"
            className="item-pic"
            alt="create-new"
          />
          <h2>Create New Wallet File</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap login-wrap">
            <div className="toggle-wrap">
              <label className="net-label">Network Select:</label>
              <Toggle name="toggle-10"
                onChange={this.props.networkSelect}
                mode="select"
                labelRight="Testnet"
                label="Mainnet" />
            </div>
            <form
              className={this.state.mnemonic_active ? "hidden" : ""}
              onSubmit={this.createNew}
            >
              <div className="group-wrap">
                <div className="form-group">
                  <input type="password" name="pass1" placeholder="password" />
                  <input
                    type="password"
                    name="pass2"
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
