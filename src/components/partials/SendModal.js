import React from "react";

export default class SendModal extends React.Component {
  render() {
    return (
      <div>
        <div
          className={
            this.props.sendModal ? "modal sendModal active" : "modal sendModal"
          }
        >
          <div className="sendModalInner">
            <span className="close" onClick={this.props.closeSendPopup}>
              X
            </span>
            <div>
              {this.props.send_cash_or_token === 0 ? (
                <div className="available-wrap">
                  <span>Available Safex Cash </span>
                  <span>{this.props.availableCash}</span>
                </div>
              ) : (
                <div className="available-wrap">
                  <span>Available Safex Tokens </span>
                  <span>{this.props.availableTokens}</span>
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
                  console.log(this.props.send_cash_or_token);
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
          className={this.props.sendModal ? "backdrop active" : "backdrop"}
          onClick={this.props.closeSendPopup}
        />
      </div>
    );
  }
}
