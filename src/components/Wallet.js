import React from "react";
import { addClass } from "../utils/utils.js";

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      wallet: null,
      alert_close_disabled: false,
      tx_being_sent: false
    };
  }

  componentDidMount = () => {
    let wallet = this.props.walletMeta;
    wallet.off("refreshed");
    this.refreshCallback();
    wallet.on("refreshed", this.refreshCallback);
    this.props.closeAlert();
    this.mounted = true;
    if (!localStorage.getItem("wallet")) {
      localStorage.setItem("wallet", JSON.stringify(this.props.wallet));
    }
  };

  componentWillUnmount() {
    this.mounted = false;
    this.props.walletMeta.off();
  }

  refreshCallback = () => {
    console.log("Wallet refreshed");
    let wallet = this.props.walletMeta;

    let syncedHeight =
      wallet.daemonBlockchainHeight() - wallet.blockchainHeight() < 10;
    if (syncedHeight) {
      console.log("syncedHeight up to date...");
      if (wallet.synchronized()) {
        console.log("refreshCallback wallet synchronized, setting state...");
        this.props.setWalletData();
      }
    }

    wallet
      .store()
      .then(() => {
        console.log("Wallet stored");
      })
      .catch(e => {
        this.props.setOpenAlert("Unable to store wallet: " + e);
        console.log("Unable to store wallet: " + e);
      });
  };

  rescanBalance = () => {
    var wallet = this.props.walletMeta;
    console.log(wallet);
    this.props.setOpenAlert(
      "Please wait while blockchain is being rescanned. Don't close the application until the process is complete. This can take a while, please be patient.",
      true
    );
    wallet.off("updated");
    wallet.off("refreshed");
    setTimeout(() => {
      console.log("Starting blockchain rescan sync...");
      wallet.rescanBlockchain();
      console.log("Blockchain rescan executed...");
      setTimeout(() => {
        console.log("Rescan setting callbacks");
        this.props.setWalletData();
        this.props.closeModal();
        wallet
          .store()
          .then(() => {
            console.log("Wallet stored");
          })
          .catch(e => {
            console.log("Unable to store wallet: " + e);
          });
        wallet.on("refreshed", this.refreshCallback);
      }, 1000);
    }, 1000);
  };

  connectionError = () => {
    this.props.setOpenAlert("Daemon connection error, please try again later ");
  };

  render() {
    return (
      <div className="wallet-inner-wrap">
        <div className="btn-wrap">
          <div
            className={
              "signal" +
              addClass(this.props.wallet.wallet_connected, "connected")
            }
          >
            <img src="images/connected-white.png" alt="connected" />
            <span>Status: &nbsp;</span>
            <span>
              {this.props.wallet.wallet_connected
                ? "Connected"
                : "Connection error"}
            </span>
          </div>
          <div className="blockheight">
            <img src="images/blocks.png" alt="blocks" />
            <span>Blockchain height: &nbsp;</span>
            <span>{this.props.wallet.blockchain_height}</span>
          </div>
          <div className="btns-right-wrap">
            <button
              className="button-shine address-info"
              onClick={this.props.setOpenAddressModal}
              title="Address Info"
            >
              <img src="images/key.png" alt="rescan" />
            </button>
            <button
              className="button-shine rescan"
              onClick={this.rescanBalance}
              title="Rescan"
              disabled={this.props.wallet.wallet_connected ? "" : "disabled"}
            >
              <img src="images/rescan.png" alt="rescan" />
            </button>
          </div>
        </div>

        <label htmlFor="filename">Wallet File Name</label>
        <input
          type="text"
          name="filename"
          defaultValue={this.props.wallet.filename}
          placeholder="filename"
          readOnly
        />

        <label htmlFor="address">Wallet Address</label>
        <input
          type="text"
          name="address"
          defaultValue={this.props.wallet.wallet_address}
          placeholder="address"
          readOnly
        />

        <div className="group-wrap">
          <div className="group">
            <label htmlFor="balance">Pending Safex Cash</label>
            <p className="display-value yellow-field">
              {this.props.wallet.pending_balance}
            </p>

            <label htmlFor="unlocked_balance">Available Safex Cash</label>
            <p className="display-value green-field">
              {this.props.wallet.unlocked_balance}
            </p>
            <button
              className="btn button-shine"
              onClick={
                this.props.wallet.wallet_connected
                  ? this.props.setOpenSendModal.bind(this, 0)
                  : this.connectionError
              }
            >
              Send Cash
            </button>
          </div>

          <div className="group">
            <label htmlFor="tokens">Pending Safex Tokens</label>
            <p className="display-value yellow-field">
              {this.props.wallet.pending_tokens}
            </p>

            <label htmlFor="unlocked_tokens">Available Safex Tokens</label>
            <p className="display-value green-field">
              {this.props.wallet.unlocked_tokens}
            </p>

            <button
              className="btn button-shine"
              onClick={
                this.props.wallet.wallet_connected
                  ? this.props.setOpenSendModal.bind(this, 1)
                  : this.connectionError
              }
            >
              Send Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }
}
