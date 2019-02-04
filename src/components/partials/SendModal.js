import React from "react";
import { addClass } from "../../utils/utils.js";

export default class SendModal extends React.Component {
  render() {
    return (
      <div>
        <div
          className={
            "modal sendModal" + addClass(this.props.sendModal, "active")
          }
        >
          <div className="sendModalInner">
            <span className="close" onClick={this.props.closeSendPopup}>
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
                onSubmit={e => {
                  this.props.sendCashOrToken(e, this.props.send_cash_or_token);
                }}
              >
                <label htmlFor="send_to">Destination</label>
                <textarea
                  name="send_to"
                  placeholder="Enter Destination Address"
                  rows="2"
                />
                <label htmlFor="amount">Amount</label>
                <input name="amount" placeholder="Enter Amount" />
                <label htmlFor="paymentid">(Optional) Payment ID</label>
                <input name="paymentid" placeholder="(optional) payment id" />
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
          className={"backdrop" + addClass(this.props.sendModal, "active")}
          onClick={this.props.closeSendPopup}
        />
      </div>
    );
  }
}
