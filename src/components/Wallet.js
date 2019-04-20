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
            <img src="images/blocks-blue.png" alt="blocks" />
            <span>Blockchain height: &nbsp;</span>
            <span>{this.props.wallet.blockchain_height}</span>
          </div>

          <div className="sfx block">
            <img src="images/sfx.png" alt="safex-cash" />
            <span>Cash: </span>
            <span>
              {this.props.sfxPrice ? this.props.sfxPrice + " $" : "Loading..."}{" "}
            </span>
          </div>

          <div className="sft block">
            <img src="images/sft.png" alt="safex-token" />
            <span>Token: </span>
            <span>
              {this.props.sftPrice ? this.props.sftPrice + " $" : "Loading..."}{" "}
            </span>
          </div>

          <div className="btns-right-wrap">
            <button
              className={
                this.props.buttonDisabled
                  ? "button-shine address-btn disabled"
                  : "button-shine address-btn"
              }
              onClick={this.props.setOpenAddressModal}
              data-tip
              data-for="address-tooptip"
            >
              <img src="images/address-book.png" alt="address-book" />
            </button>
            <ReactTooltip id="address-tooptip">
              <p>Address Book</p>
            </ReactTooltip>
            <button
              className={
                this.props.buttonDisabled
                  ? "button-shine tx-history disabled"
                  : "button-shine tx-history"
              }
              onClick={this.props.setOpenHistoryModal}
              data-tip
              data-for="history-tooptip"
            >
              <img src="images/history.png" alt="transaction-history" />
            </button>
            <ReactTooltip id="history-tooptip">
              <p>Transaction History</p>
            </ReactTooltip>
            <button
              className={
                this.props.buttonDisabled
                  ? "button-shine address-info disabled"
                  : "button-shine address-info"
              }
              onClick={this.props.setOpenLoadingModal}
              data-tip
              data-for="keys-tooptip"
            >
              <img src="images/key.png" alt="rescan" />
            </button>
            <ReactTooltip id="keys-tooptip">
              <p>Seed and Keys</p>
            </ReactTooltip>
          </div>
        </div>

        <div className="label-wrap">
          <label>Wallet Address</label>
          <div
            data-tip
            data-for="pub-address-tooptip"
            className="button-shine question-wrap"
          >
            <span>?</span>
          </div>
          <ReactTooltip id="pub-address-tooptip">
            <p>This is <span className="blue-text">Public Address</span> of your wallet.</p>
            <p>This is address where you can receive <span className="blue-text">Safex Cash</span> or <span className="blue-text">Safex Token.</span></p>
            <p>It is generated using your <span className="blue-text">Public Spend Key</span> and <span className="blue-text">Public View Key.</span></p>
          </ReactTooltip>
          <CopyToClipboard
            text={this.props.wallet.wallet_address}
            onCopy={this.props.onCopy}
            className="button-shine copy-btn"
          >
            <button>Copy</button>
          </CopyToClipboard>
        </div>

        <textarea
          name="address"
          defaultValue={this.props.wallet.wallet_address}
          placeholder="address"
          rows="1"
          readOnly
        />

        <div className="group-wrap">
          <div className="group">
            <label htmlFor="balance">Pending Cash</label>
            <p className="display-value yellow-field">
              {this.props.wallet.pending_balance}
            </p>

            <label htmlFor="unlocked_balance">Available Cash</label>
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
                  ? this.props.setOpenSendModal.bind(this, 0, "", "", "")
                  : this.connectionError
              }
            >
              {this.props.buttonDisabled ? "Please Wait" : "Send Cash"}
            </button>
          </div>

          <div className="group">
            <label htmlFor="tokens">Pending Tokens</label>
            <p className="display-value yellow-field">
              {this.props.wallet.pending_tokens}
            </p>

            <label htmlFor="unlocked_tokens">Available Tokens</label>
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
                  ? this.props.setOpenSendModal.bind(this, 1, "", "", "")
                  : this.connectionError
              }
            >
              {this.props.buttonDisabled ? "Please Wait" : "Send Tokens"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
