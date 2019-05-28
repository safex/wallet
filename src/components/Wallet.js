import React from "react";
import { addClass } from "../utils/utils.js";
import ReactTooltip from "react-tooltip";

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

  render() {
    return (
      <div className="col-xs-12 wallet-inner-wrap">
        <div className="btn-wrap">
          <div className="sfx block">
            <img src="images/sfx.png" alt="safex-cash" />
            <span>
              {this.props.sfxPrice
                ? "SFX $" + this.props.sfxPrice
                : "Loading..."}
            </span>
          </div>

          <div className="sft block">
            <img src="images/sft.png" alt="safex-token" />
            <span>
              {this.props.sftPrice
                ? "SFT $" + this.props.sftPrice
                : "Loading..."}
            </span>
          </div>

          <div
            className="blockheight block"
            data-tip
            data-for="blockheight-tooptip"
          >
            <img src="images/blocks-blue.png" alt="blocks" />
            <span>{this.props.wallet.blockchain_height}</span>
          </div>

          <ReactTooltip id="blockheight-tooptip">
            <p>Blockchain height</p>
          </ReactTooltip>

          <div
            className={
              "signal block" +
              addClass(this.props.wallet.wallet_connected, "connected")
            }
            data-tip
            data-for="status-tooptip"
          >
            <img
              src={
                this.props.wallet.wallet_connected
                  ? "images/connected-green.png"
                  : "images/connected-red.png"
              }
              alt="connected"
            />
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
          <ReactTooltip id="status-tooptip">
            <p>Status</p>
          </ReactTooltip>

          <div className="btns-right-wrap">
            <button
              className={
                this.props.buttonDisabled
                  ? "button-shine tx-history disabled"
                  : "button-shine tx-history"
              }
              onClick={this.props.toggleSidebar}
              data-tip
              data-for="history-tooptip"
            >
              <img src="images/history.png" alt="transaction-history" />
            </button>
            <ReactTooltip id="history-tooptip">
              <p>Settings</p>
            </ReactTooltip>
          </div>
        </div>

        <div className="group-wrap">
          <div className="group">
            <div className="label-wrap">
              <label htmlFor="balance">Pending Cash</label>
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="pending-tooptip"
              >
                <span>?</span>
              </div>
              <ReactTooltip id="pending-tooptip">
                <p>
                  Due to the way{" "}
                  <span className="blue-text">Safex blockchain</span> works,
                  part or all of your remaining balance
                </p>
                <p>
                  after a transaction may go into pending status for a short
                  period of time.
                </p>
                <p>
                  This is normal and status will become available after{" "}
                  <span className="blue-text">10</span> blocks.
                </p>
              </ReactTooltip>
            </div>
            <p className="display-value green-field">
              SFX {this.props.wallet.pending_balance}
            </p>

            <label htmlFor="unlocked_balance">Available Cash</label>
            <p className="display-value green-field">
              <span>SFX {this.props.wallet.unlocked_balance}</span>
              <span className="value">
                {this.props.sftPrice
                  ? "$" +
                    parseFloat(
                      this.props.wallet.unlocked_balance * this.props.sfxPrice
                    ).toFixed(2)
                  : "Loading..."}
              </span>
            </p>
            <button
              className={
                this.props.buttonDisabled
                  ? "btn button-shine disabled"
                  : "btn button-shine"
              }
              id="send-cash-btn"
              onClick={this.props.setOpenSendModal.bind(this, 0, "", "", "")}
            >
              Send Cash
            </button>
          </div>

          <div className="group">
            <label htmlFor="tokens">Pending Tokens</label>
            <p className="display-value blue-field">
              SFT {this.props.wallet.pending_tokens}
            </p>

            <label htmlFor="unlocked_tokens">Available Tokens</label>
            <p className="display-value blue-field">
              <span>SFT {this.props.wallet.unlocked_tokens}</span>
              <span className="value">
                {this.props.sftPrice
                  ? "$" +
                    parseFloat(
                      this.props.wallet.unlocked_tokens * this.props.sftPrice
                    ).toFixed(2)
                  : "Loading..."}
              </span>
            </p>

            <button
              className={
                this.props.buttonDisabled
                  ? "btn button-shine disabled"
                  : "btn button-shine"
              }
              onClick={this.props.setOpenSendModal.bind(this, 1, "", "", "")}
            >
              Send Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }
}
