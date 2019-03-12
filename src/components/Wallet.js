import React from "react";
import { addClass } from "../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
    this.props.refreshCallback();
    wallet.on("refreshed", this.props.refreshCallback);
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

  connectionError = () => {
    this.props.setOpenAlert("Daemon connection error, please try again later ");
  };

  onCopy = () => {
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  render() {
    return (
      <div className="col-xs-12 wallet-inner-wrap">
        <div className="btn-wrap">
          <div
            className={
              "signal block" +
              addClass(this.props.wallet.wallet_connected, "connected")
            }
          >
            <img
              src={
                this.props.wallet.wallet_connected
                  ? "images/connected-green.png"
                  : "images/connected-red.png"
              }
              alt="connected"
            />
            <span>Status: &nbsp;</span>
            <span
              className={
                this.props.wallet.wallet_connected ? "green-text" : "red-text"
              }
            >
              {this.props.wallet.wallet_connected
                ? "Connected"
                : "Connection error"}
            </span>
          </div>
          <div className="blockheight block">
            <img
              src="images/blocks-green.png"
              alt="blocks"
            />
            <span>Blockchain height: &nbsp;</span>
            <span className="green-text">
              {this.props.wallet.blockchain_height}
            </span>
          </div>

          <div className="btns-right-wrap">
            <button
              className="button-shine tx-history"
              onClick={this.props.wallet.wallet_connected ? this.props.setOpenHistoryModal : this.connectionError}
              data-tip
              data-for="history-tooptip"
            >
              <img src="images/history.png" alt="transaction-history" />
            </button>
            <ReactTooltip id="history-tooptip">
              <p>Transaction History</p>
            </ReactTooltip>
            <button
              className="button-shine address-info"
              onClick={this.props.setOpenLoadingModal}
              data-tip
              data-for="address-tooptip"
            >
              <img src="images/key.png" alt="rescan" />
            </button>
            <ReactTooltip id="address-tooptip">
              <p>Seed and Keys</p>
            </ReactTooltip>
          </div>
        </div>

        <label htmlFor="address">
          Wallet Address{" "}
          <CopyToClipboard
            text={this.props.wallet.wallet_address}
            onCopy={this.props.onCopy}
            className="button-shine"
          >
            <button>Copy</button>
          </CopyToClipboard>
        </label>
        <textarea
          name="address"
          defaultValue={this.props.wallet.wallet_address}
          placeholder="address"
          rows="1"
          readOnly
        />

        <label htmlFor="filepath">Wallet File Path</label>
        <input
          type="text"
          name="filepath"
          defaultValue={this.props.wallet.filepath}
          placeholder="filepath"
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
              className={
                this.props.buttonDisabled
                  ? "btn button-shine disabled"
                  : "btn button-shine"
              }
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
              className={
                this.props.buttonDisabled
                  ? "btn button-shine disabled"
                  : "btn button-shine"
              }
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
