import React from "react";
import { openAlert, closeAlert } from "../utils/utils.js";
import Alert from "./partials/Alert";
import ExitModal from "./partials/ExitModal";
import Header from "./partials/Header";
import { closeApp } from "../utils/utils.js";

const { dialog } = window.require("electron").remote;

export default class OpenFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { wallet_path: "" };
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

  browseFile = () => {
    let filename = "";
    filename = dialog.showOpenDialog({});

    if (filename !== undefined) {
      this.setState(() => ({
        wallet_path: filename
      }));
      console.log("filename " + filename);
    }
  };

  openFile = e => {
    e.preventDefault();
    let filename = e.target.filepath.value;
    const pass = e.target.pass.value;

    if (filename === "") {
      this.setOpenAlert("Choose the wallet file", false);
      return false;
    }
    if (pass === "") {
      this.setOpenAlert("Enter password for your wallet file", false);
      return false;
    }
    this.setState({
      alert_close_disabled: true
    });
    this.props.createWallet(
      "openWallet",
      {
        path: this.state.wallet_path,
        password: pass,
        network: this.props.config.network,
        daemonAddress: this.props.config.daemonAddress
      },
      err => {
        this.setOpenAlert("Error opening wallet: " + err, false);
        return false;
      }
    );
    localStorage.setItem("wallet_path", this.state.wallet_path);
    localStorage.setItem("password", JSON.stringify(pass));
    this.setOpenAlert(
      "Please wait while your wallet file is loaded. Don't close the application until the process is complete. This can take a while, please be patient.",
      true
    );
  };

  setWalletPath = e => {
    let filename = e.target.value;
    this.setState({ wallet_path: filename });
  };

  render() {
    return (
      <div className="item-wrap open-file-wrap">
        <Header
          goToPage={this.goToPage}
          toggleExitModal={this.toggleExitModal}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img
            src="images/open-wallet-file.png"
            className="item-pic"
            alt="open-wallet-file"
          />
          <h2>Open Wallet File</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap login-wrap">
            <button
              className={
                this.state.wallet_loaded ? "hidden" : "browse-btn button-shine"
              }
              onClick={this.browseFile}
            >
              Browse
            </button>
            <form onSubmit={this.openFile}>
              <div className="group-wrap">
                <div className="form-group">
                  <input
                    name="filepath"
                    value={this.state.wallet_path}
                    onChange={this.setWalletPath}
                    placeholder="wallet file path"
                    readOnly
                  />
                  <input type="password" name="pass" placeholder="password" />
                </div>
              </div>
              <button type="submit" className="submit btn button-shine">
                Open
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
