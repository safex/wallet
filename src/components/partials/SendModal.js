import React from "react";
import { addClass } from "../../utils/utils.js";

export default class SendModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      amount: "",
      payment_id: "",
      cash_or_token: null,
      tx_being_sent: false,
      mixin: ""
    };
  }

  closeSendPopup = () => {
    this.props.closeSendPopup();
    setTimeout(() => {
      this.setState({
        address: "",
        amount: "",
        payment_id: "",
        mixin: ""
      });
    }, 300);
  };

  inputOnChange = (target, e) => {
    this.setState({
      [target]: e.target.value
    });
  };

  sendCashOrToken = cash_or_token => {
    return e => {
      e.preventDefault();
      let sendingAddress = e.target.send_to.value;
      let amount = e.target.amount.value * 10000000000;
      let paymentid = e.target.paymentid.value;
      let mixin = e.target.mixin.value;
      this.setState(() => ({
        cash_or_token: cash_or_token
      }));
      if (sendingAddress === "") {
        this.props.setOpenAlert("Fill out all the fields", false);
        return false;
      }
      if (amount === "") {
        this.props.setOpenAlert("Enter amount", false);
        return false;
      }
      if (paymentid !== "") {
        this.setState(() => ({
          tx_being_sent: true
        }));
        this.sendTransaction({
          address: sendingAddress,
          amount: amount,
          paymentId: paymentid,
          tx_type: cash_or_token,
          mixin: mixin === "" ? 6 : mixin
        });
      } else {
        this.setState(() => ({
          tx_being_sent: true
        }));
        this.sendTransaction({
          address: sendingAddress,
          amount: amount,
          tx_type: cash_or_token,
          mixin: mixin === "" ? 6 : mixin
        });
      }
    };
  };

  sendTransaction = args => {
    let wallet = this.props.walletMeta;
    wallet
      .createTransaction(args)
      .then(tx => {
        let txId = tx.transactionsIds();
        console.log(args);
        tx.commit()
          .then(() => {
            this.closeSendPopup();
            if (this.state.cash_or_token === 0) {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                  txId,
                false
              );
            } else {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your token transaction ID is: " +
                  txId,
                false
              );
            }
            this.setState(() => ({
              tx_being_sent: false
            }));
            setTimeout(() => {
              this.props.setWalletData(this.props.walletMeta);
            }, 300);
          })
          .catch(e => {
            this.setState(() => ({
              tx_being_sent: false
            }));
            this.props.setOpenAlert(
              "Error on commiting transaction: " + e,
              false
            );
          });
      })
      .catch(e => {
        this.setState(() => ({
          tx_being_sent: false
        }));
        this.props.setOpenAlert("Couldn't create transaction: " + e, false);
      });
  };

  changeDefaultMixin = e => {
    let wallet = this.props.walletMeta;
    try {
      if (e.target.value === "" || e.target.value === " ") {
        this.setState({
          mixin: e.target.value
        });
        return false;
      }
      if (e.target.value <= 8) {
        this.setState({
          mixin: e.target.value
        });
      } else {
        this.setState({
          mixin: 6
        });
      }
      wallet.setDefaultMixin(parseFloat(e.target.value));
      console.log(e.target.value);
    } catch (err) {
      this.props.setOpenAlert(`${err}`);
    }
  };

  disableInputPaste = e => {
    e.preventDefault();
    return false;
  };

  render() {
    return (
      <div>
        <div
          className={
            "modal sendModal" + addClass(this.props.sendModal, "active")
          }
        >
          <div className="sendModalInner">
            <span className="close" onClick={this.closeSendPopup}>
              X
            </span>
            <div>
              {this.props.send_cash_or_token === 0 ? (
                <div className="available-wrap">
                  <span>Available Safex Cash: {this.props.availableCash} </span>
                </div>
              ) : (
                <div className="available-wrap">
                  <span>
                    Available Safex Tokens: {this.props.availableTokens}{" "}
                  </span>
                </div>
              )}
              {this.props.send_cash_or_token === 0 ? (
                <h3>Send Cash</h3>
              ) : (
                <h3>Send Tokens</h3>
              )}
              <form
                onSubmit={this.sendCashOrToken(this.props.send_cash_or_token)}
              >
                <label htmlFor="send_to">Destination</label>
                <textarea
                  name="send_to"
                  placeholder="Enter Destination Address"
                  rows="2"
                  value={this.state.address}
                  onChange={this.inputOnChange.bind(this, "address")}
                />
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter Amount"
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                />
                <label htmlFor="paymentid">(Optional) Payment ID</label>
                <input
                  name="paymentid"
                  placeholder="(optional) Payment ID"
                  value={this.state.payment_id}
                  onChange={this.inputOnChange.bind(this, "payment_id")}
                />
                <label htmlFor="paymentid">
                  (Optional) Set Transaction Mixin (0-8)
                </label>
                <input
                  type="text"
                  name="mixin"
                  placeholder="(optinal) Default mixin is 6"
                  value={this.state.mixin}
                  onChange={this.changeDefaultMixin}
                  onPaste={this.disableInputPaste}
                  pattern="\d*"
                  min="0"
                  max="8"
                  maxLength="1"
                  step="1"
                />
                <h4>*Changing default mixin may jeopardize your privacy</h4>
                <button
                  className="btn button-shine"
                  type="submit"
                  disabled={this.props.txBeingSent ? "disabled" : ""}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        <div
          className={
            "backdrop sendModalBackdrop" +
            addClass(this.props.sendModal, "active")
          }
          onClick={this.closeSendPopup}
        />
      </div>
    );
  }
}
