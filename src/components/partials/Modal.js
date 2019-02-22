import React from "react";
import { addClass } from "../../utils/utils.js";

export default class LoadingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      wallet_path: localStorage.getItem("wallet_path")
    };
  }

  componentDidMount() {
    if (this.state.wallet_path) {
      this.setState({
        filename: localStorage
          .getItem("wallet_path")
          .split("/")
          .pop()
      });
    }
  }

  loadPreviousWallet = e => {
    e.preventDefault();
    let wallet = JSON.parse(localStorage.getItem("wallet"));
    let password = JSON.parse(localStorage.getItem("password"));
    let path = this.state.wallet_path;
    let passwordInput = e.target.password.value;

    if (passwordInput === "") {
      this.props.setOpenAlert("Enter password for your wallet");
      return false;
    }
    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
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
    this.props.setOpenAlert("Loading wallet file, please wait...", true);
  };

  closeMyModal = () => {
    this.props.closeModal();
    setTimeout(() => {
      this.setState({ loaded: false });
    }, 300);
  };

  loadWalletInfo = e => {
    e.preventDefault();
    let password = JSON.parse(localStorage.getItem("password"));
    let passwordInput = e.target.password.value;

    if (passwordInput === "") {
      this.props.setOpenAlert("Enter password for your wallet");
      console.log("Enter password for your wallet");
      return false;
    }
    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
      console.log("Wrong password");
      return false;
    }
    this.setState({ loaded: true });
  };

  render() {
    let modal;

    if (this.props.loadingModal) {
      modal = (
        <div
          className={
            "loadingModal" + addClass(this.props.loadingModal, "active")
          }
        >
          <span className="close" onClick={this.props.closeModal}>
            X
          </span>
          <form onSubmit={this.loadPreviousWallet}>
            <label htmlFor="password">
              Enter password for {this.state.filename}:
            </label>
            <input name="password" type="password" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.props.closeModal}
            >
              Cancel
            </button>
            <button className="confirm-btn button-shine">Continue</button>
          </form>
        </div>
      );
    }
    if (this.props.addressModal) {
      modal = (
        <div
          className={
            "addressModal" + addClass(this.props.addressModal, "active")
          }
        >
          <span className="close" onClick={this.closeMyModal}>
            X
          </span>
          <form
            onSubmit={this.loadWalletInfo}
            className={this.state.loaded ? "hidden" : ""}
          >
            <label htmlFor="password">
              Enter password for {this.props.wallet.filename}:
            </label>
            <input name="password" type="password" className="pass-input" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.props.closeModal}
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
        </div>
      );
    }
    if (this.props.ringSizeModal) {
      modal = (
        <div
          className={
            "ringSizeModal" + addClass(this.props.ringSizeModal, "active")
          }
        >
          <span className="close" onClick={this.closeMyModal}>
            X
          </span>
          <form
            onSubmit={this.loadWalletInfo}
            className={this.state.loaded ? "hidden" : ""}
          >
            <label htmlFor="password">
              Enter password for {this.props.wallet.filename}:
            </label>
            <input name="password" type="password" className="pass-input" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.props.closeModal}
            >
              Cancel
            </button>
            <button className="confirm-btn button-shine">Continue</button>
          </form>

          <div className={this.state.loaded ? "ring-size-wrap" : "hidden"}>
            <label htmlFor="view_key">Set Ring Size (0-8)</label>
            <input
              type="text"
              name="set_ring_size"
              className="pass-input"
              value={this.props.mixin}
              onChange={this.props.changeRingSize}
              maxLength="2"
              max="8"
            />
          </div>
        </div>
      );
    }
    if (this.props.alert) {
      modal = (
        <div className={"alert" + addClass(this.props.alert, "active")}>
          <div className="mainAlertPopupInner">
            <p className={this.props.alertCloseDisabled ? "disabled" : ""}>
              {this.props.alertText}
            </p>
            <div
              className={
                this.props.progress && this.props.progress > 0
                  ? "progress"
                  : "hidden"
              }
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated active"
                role="progressbar"
                aria-valuenow={this.props.progress}
                aria-valuemin="10"
                aria-valuemax="100"
                style={{ width: this.props.progress + "%" }}
              />
            </div>
            {this.props.alertCloseDisabled ? (
              <span className="hidden" />
            ) : (
              <span className="close" onClick={this.props.closeModal}>
                X
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={"modal" + addClass(this.props.modal, "active")}>
          {modal}
        </div>

        {this.props.addressModal ? (
          <div
            className={"backdrop" + addClass(this.props.modal, "active")}
            onClick={this.closeAddressModal}
          />
        ) : (
          <div
            className={"backdrop" + addClass(this.props.modal, "active")}
            onClick={this.props.alertCloseDisabled ? "" : this.props.closeModal}
          />
        )}
      </div>
    );
  }
}
