import React from "react";
import axios from "axios";
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
      tx_being_sent: false,
      sfx_price: 0,
      sft_price: 0
    };
  }

  componentDidMount = () => {
    let wallet = this.props.walletMeta;
    wallet.off("refreshed");
    this.props.refreshCallback();
    wallet.on("refreshed", this.props.refreshCallback);
    this.props.closeAlert();
    this.mounted = true;
    // this.fetchPrice();
    if (!localStorage.getItem("wallet")) {
      localStorage.setItem("wallet", JSON.stringify(this.props.wallet));
    }
  };

  fetchPrice = () => {
    // let promises = [];
    // promises.push(
    //   fetch("https://api.coingecko.com/api/v3/coins/safex-cash")
    //     .then(resp => resp.text())
    //     .then(resp => {
    //       return resp;
    //     })
    // );
    // Promise.all(promises)
    //   .then(values => {
    //     var sfx_price = JSON.parse(values[0]);
    //     console.log(sfx_price);
    //     this.setState({
    //       sfx_price: values[0].market_data.current_price.bmd
    //     });
    //   })
    //   .catch(e => {
    //     console.log(e);
    //     this.props.setOpenAlert("Unable to fetch prices ");
    //   });

    axios({
      method: "get",
      url: "https://api.coingecko.com/api/v3/coins/safex-cash"
    })
      .then(res => {
        var sfx_price = JSON.parse(res[0]);
        console.log(sfx_price);
        // this.setState({
        //   sfx_price: res[0].market_data.current_price.bmd
        // });
      })
      .catch(function(error) {
        console.log(error);
      });

    // axios({
    //   method: "get",
    //   url: "https://api.coingecko.com/api/v3/coins/safex-token"
    // })
    //   .then(res => {
    //     var sft_price = JSON.parse(res[0]);
    //     console.log(sfx_price);
    //     this.setState({
    //       sfx_price: res[0].market_data.current_price.bmd
    //     });
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //   });
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
            <img src="images/blocks-white.png" alt="blocks" />
            <span>Blockchain height: &nbsp;</span>
            <span className="green-text">
              {this.props.wallet.blockchain_height}
            </span>
          </div>

          <div className="btns-right-wrap">
            <button
              className={
                this.props.buttonDisabled
                  ? "button-shine tx-history disabled"
                  : "button-shine tx-history"
              }
              onClick={
                this.props.wallet.wallet_connected
                  ? this.props.setOpenHistoryModal
                  : this.connectionError
              }
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
              {this.props.buttonDisabled ? "Please Wait" : "Send Cash"}
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
              {this.props.buttonDisabled ? "Please Wait" : "Send Tokens"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
