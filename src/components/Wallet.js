import React from "react";

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log(this.props.walletConnected);
  }

  render() {
    return (
      <div className="wallet-wrap">
        <h2>Wallet File</h2>

        <div className="col-xs-6 col-xs-push-3 wallet-inner-wrap">
          <div className="btn-wrap">
            <button
              className={
                this.props.openAnotherFile
                  ? "open-file-btn button-shine"
                  : "hidden"
              }
              onClick={this.props.openAnotherFile}
            >
              Back
            </button>
            <button
              className={
                this.props.walletConnected ? "signal connected" : "signal"
              }
              disabled
              title="Status"
            >
              <img src="images/connected-white.png" alt="connected" />
              <p>
                {this.props.walletConnected ? (
                  <span>Connected</span>
                ) : (
                  <span>Connection error</span>
                )}
              </p>
            </button>
            <button className="blockheight" title="Blockchain Height" disabled>
              <img src="images/blocks.png" alt="blocks" />
              <span>{this.props.blockchainHeight}</span>
            </button>
            <button
              className="button-shine refresh"
              onClick={this.rescanBalance}
              title="Refresh"
            >
              <img src="images/refresh.png" alt="rescan" />
            </button>
          </div>

          <label htmlFor="address">Wallet Address</label>
          <input
            type="text"
            name="address"
            value={this.props.wallet.wallet_address}
            placeholder="address"
          />

          <label htmlFor="spend_key">Secret Spend Key</label>
          <input
            type="text"
            name="spend_key"
            value={this.props.wallet.spend_key}
            placeholder="secret spend key"
          />

          <label htmlFor="view_key">Secret View Key</label>
          <input
            type="text"
            name="view_key"
            value={this.props.wallet.view_key}
            placeholder="secret view key"
          />

          <div className="group-wrap">
            <div className="group">
              <label htmlFor="balance">Pending Safex Cash</label>
              <input
                type="text"
                placeholder="Balance"
                name="balance"
                className="yellow-field"
                value={this.props.wallet.balance}
                readOnly
              />

              <label htmlFor="unlocked_balance">Available Safex Cash</label>
              <input
                type="text"
                placeholder="Unlocked balance"
                name="unlocked_balance"
                className="green-field"
                value={this.props.wallet.unlocked_balance}
                readOnly
              />
              <button
                className="btn button-shine"
                onClick={this.setOpenSendCash}
              >
                Send Cash
              </button>
            </div>

            <div className="group">
              <label htmlFor="tokens">Pending Safex Tokens</label>
              <input
                type="text"
                className="yellow-field"
                placeholder="Tokens"
                value={this.props.wallet.tokens}
                readOnly
              />
              <label htmlFor="unlocked_tokens">Available Safex Tokens</label>
              <input
                type="text"
                className="green-field"
                placeholder="Unlocked Tokens"
                name="unlocked_tokens"
                value={this.props.wallet.unlocked_tokens}
                readOnly
              />
              <button
                className="btn button-shine"
                onClick={this.setOpenSendTokens}
              >
                Send Tokens
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
