import React from "react";
import Alert from "./Alert";
import { openAlert, closeAlert, addClass } from "../../utils/utils.js";

export default class AddressModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: localStorage
        .getItem("wallet_path")
        .split("/")
        .pop()
    };
  }

  closeAddressModal = () => {
    this.props.toggleAddressModal();
    setTimeout(() => {
      this.setState({ loaded: false });
    }, 300);
  };

  setOpenAlert = (alert, disabled = false) => {
    openAlert(this, alert, disabled);
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  loadWalletInfo = e => {
    e.preventDefault();
    let password = JSON.parse(localStorage.getItem("password"));
    let passwordInput = e.target.password.value;

    if (passwordInput === "") {
      this.props.setOpenAlert("Enter password for your wallet");
      return false;
    }
    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
      return false;
    }
    this.setState({ loaded: true });
  };

  render() {
    return (
      <div className="addressModalWrap">
        <div
          className={
            "modal addressModal" + addClass(this.props.addressModal, "active")
          }
        >
          <span className="close" onClick={this.closeAddressModal}>
            X
          </span>
          <form
            onSubmit={this.loadWalletInfo}
            className={this.state.loaded ? "hidden" : ""}
          >
            <label htmlFor="password">
              Enter password for {this.state.filename}:
            </label>
            <input name="password" type="password" className="pass-input" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.closeAddressModal}
            >
              Cancel
            </button>
            <button className="confirm-btn button-shine">Continue</button>
          </form>

          <div className={this.state.loaded ? "address-inner-wrap" : "hidden"}>
            <h3>Address Info</h3>

            <label htmlFor="spend_key">Secret (Private) Spend Key</label>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret (private) spend key"
            />

            <label htmlFor="view_key">Secret (Private) View Key</label>
            <input
              type="text"
              name="view_key"
              defaultValue={this.props.wallet.view_key}
              placeholder="secret (private) view key"
            />

            <label className={this.props.wallet.mnemonic ? "" : "hidden"}>
              Wallet Mnemonic Seed
            </label>
            <textarea
              name="mnemonic"
              defaultValue={this.props.wallet.mnemonic}
              placeholder="mnemonic seed for your wallet"
              className={this.props.wallet.mnemonic ? "" : "hidden"}
              rows="3"
            />
          </div>

          <Alert
            openAlert={this.state.alert}
            alertText={this.state.alert_text}
            alertCloseDisabled={this.state.alert_close_disabled}
            closeAlert={this.setCloseAlert}
          />
        </div>

        <div
          className={this.props.addressModal ? "backdrop active" : "backdrop"}
          onClick={this.closeAddressModal}
        />
      </div>
    );
  }
}
