import React from "react";
import SendModal from "./partials/SendModal";
import { openSendPopup, closeSendPopup, addClass } from "../utils/utils.js";

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      wallet: null,
      alert_close_disabled: false,
      send_cash_or_token: null,
      tx_being_sent: false
    };
  }

  componentDidMount = () => {
    this.refreshCallback();
    this.mounted = true;
    if (!localStorage.getItem("wallet")) {
      localStorage.setItem("wallet", JSON.stringify(this.props.wallet));
    }
  };

  componentWillUnmount() {
    this.mounted = false;
    this.props.walletMeta.off();
  }

  updatedCallback = () => {
    console.log("UPDATED");
    this.props.walletMeta
      .store()
      .then(() => {
        console.log("Wallet stored");
        this.props.closeModal();
      })
      .catch(e => {
        console.log("Unable to store wallet: " + e);
      });
  };

  refreshCallback = () => {
    console.log("Wallet refreshed");
    let wallet = this.props.walletMeta;
    this.props.setOpenAlert(
      "Please wait while blockchain is being updated...",
      true
    );
    wallet
      .store()
      .then(() => {
        this.props.closeAlert();
        console.log("Wallet stored");
      })
      .catch(e => {
        this.props.setOpenAlert("Unable to store wallet: " + e, false);
        console.log("Unable to store wallet: " + e);
      });
    wallet.off("refreshed");
    setTimeout(() => {
      wallet.on("newBlock", this.newBlockCallback);
      wallet.on("updated", this.updatedCallback);
    }, 300);
  };

  newBlockCallback = height => {
    let wallet = this.props.walletMeta;
    let syncedHeight = wallet.daemonBlockchainHeight() - height < 10;
    if (syncedHeight) {
      console.log("syncedHeight up to date...");
      if (wallet.synchronized()) {
        console.log("newBlock wallet synchronized, setting state...");
        this.props.setWalletData(wallet);
      }
    }
  };

  rescanBalance = () => {
    var wallet = this.props.walletMeta;
    console.log(wallet);
    this.props.setOpenAlert(
      "Rescanning, this may take some time, please wait ",
      true
    );
    wallet.off("updated");
    wallet.off("newBlock");
    wallet.off("refreshed");
    setTimeout(() => {
      console.log("Starting blockchain rescan sync...");
      wallet.rescanBlockchain();
      console.log("Blockchain rescan executed...");
      setTimeout(() => {
        console.log("Rescan setting callbacks");
        this.props.setWalletData(this.props.walletMeta);
        this.props.closeModal();
        wallet
          .store()
          .then(() => {
            console.log("Wallet stored");
          })
          .catch(e => {
            console.log("Unable to store wallet: " + e);
          });
        wallet.on("newBlock", this.newBlockCallback);
        wallet.on("updated", this.updatedCallback);
      }, 1000);
    }, 1000);
  };

  setOpenSendPopup = send_cash_or_token => {
    openSendPopup(this, send_cash_or_token);
  };

  setCloseSendPopup = () => {
    closeSendPopup(this);
  };

  connectionError = () => {
    this.props.setOpenAlert(
      "Daemon connection error, please try again later ",
      false
    );
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
                  ? this.setOpenSendPopup.bind(this, 0)
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
                  ? this.setOpenSendPopup.bind(this, 1)
                  : this.connectionError
              }
            >
              Send Tokens
            </button>
          </div>
        </div>

        <SendModal
          walletMeta={this.props.walletMeta}
          sendModal={this.state.send_modal}
          closeSendPopup={this.setCloseSendPopup}
          send_cash_or_token={this.state.send_cash_or_token}
          availableCash={this.props.wallet.unlocked_balance}
          availableTokens={this.props.wallet.unlocked_tokens}
          setOpenAlert={this.props.setOpenAlert}
          setWalletData={this.props.setWalletData}
        />
      </div>
    );
  }
}
