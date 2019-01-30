import React from "react";
import Alert from "./Alert";
import { openAlert, closeAlert } from "../../utils/utils.js";

export default class LoadingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  setOpenAlert = (alert, disabled) => {
    openAlert(this, alert, disabled);
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  loadPreviousWallet = (e) => {
    e.preventDefault();
    let wallet = JSON.parse(localStorage.getItem("wallet"));
    let password = JSON.parse(localStorage.getItem("password"));
    let path = localStorage.getItem("wallet_path");
    let passwordInput = e.target.password.value;

    if (passwordInput === '') {
      this.setOpenAlert("Enter password for your wallet", false);
      return false;
    }
    if (passwordInput !== password) {
      this.setOpenAlert("Wrong password", false);
      return false;
    }
    this.props.createWallet(
      "openWallet",
      {
        path: path,
        password: password,
        network: wallet.config.network,
        daemonAddress: wallet.config.daemonAddress
      },
      true
    );
    this.setState({
      loading: true
    });
  }

  render() {
    return (
      <div className="loadingModalWrap">
        <div
          className={
            this.props.loadingModal
              ? "modal loadingModal active"
              : "modal loadingModal"
          }
        >
          <form onSubmit={this.loadPreviousWallet} className={this.state.loading ? "hidden" : ""}>
            <label htmlFor="password">Enter password:</label>
            <input name="password" type="password"></input>
            <button>Submit</button>
          </form>
          <h3 className={this.state.loading ? "" : "hidden"}>Loading wallet file, please wait...</h3>
        </div>

        <div
          className={this.props.loadingModal ? "backdrop active" : "backdrop"}
        />

        <Alert
          openAlert={this.state.alert}
          alertText={this.state.alert_text}
          alertCloseDisabled={this.state.alert_close_disabled}
          closeAlert={this.setCloseAlert}
        />
      </div>
    );
  }
}
