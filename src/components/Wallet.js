import React from "react";
import SendModal from "./partials/SendModal";
import AddressModal from "./partials/AddressModal";
import { openSendPopup, closeSendPopup, addClass } from "../utils/utils.js";

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

  roundBalanceAmount = balance => {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  };

  updatedCallback = () => {
    console.log("UPDATED");
    this.props.walletMeta
      .store()
      .then(() => {
        console.log("Wallet stored");
        this.setCloseAlert();
      })
      .catch(e => {
        console.log("Unable to store wallet: " + e);
      });
  };

  refreshCallback = () => {
    console.log("Wallet refreshed");
    let wallet = this.props.walletMeta;
    this.props.setWalletData(this.props.walletMeta);
    this.props.setOpenAlert(
      "Please wait while blockchain is being updated...",
      true
    );
    wallet
      .store()
      .then(() => {
        this.props.setCloseAlert();
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
        this.props.setWalletData(this.props.walletMeta);
      }
    }
  };

  rescanBalance = () => {
    var wallet = this.props.walletMeta;
    console.log(wallet);
    this.setOpenAlert(
      "Rescanning, this may take some time, please wait ",
      true
    );
    wallet.off("updated");
    wallet.off("newBlock");
    wallet.off("refreshed");
    setTimeout(() => {
      this.setState(() => ({
        wallet: {
          blockchain_height: wallet.blockchainHeight()
        }
      }));
      console.log("Starting blockchain rescan sync...");
      wallet.rescanBlockchain();
      console.log("Blockchain rescan executed...");

      setTimeout(() => {
        console.log("Rescan setting callbacks");
        this.props.setWalletData(this.props.walletMeta);
        this.setCloseAlert();
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

  sendCashOrToken = (e, cash_or_token) => {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = e.target.amount.value * 10000000000;
    let paymentid = e.target.paymentid.value;
    this.setState(() => ({
      cash_or_token: cash_or_token
    }));

    if (sendingAddress === "") {
      this.props.setOpenAlert("Fill out all the fields", false);
      return false;
    }
    if (amount === "") {
      this.props.setOpenAlert("Enter Amount", false);
      return false;
    }
    if (paymentid !== "") {
      console.log("amount " + amount);
      console.log("paymentid " + paymentid);
      this.setState(() => ({
        tx_being_sent: true
      }));
      this.sendTransaction({
        address: sendingAddress,
        amount: amount,
        paymentId: paymentid,
        tx_type: cash_or_token
      });
    } else {
      console.log("amount " + amount);
      this.setState(() => ({
        tx_being_sent: true
      }));
      this.sendTransaction({
        address: sendingAddress,
        amount: amount,
        tx_type: cash_or_token
      });
    }
  };

  sendTransaction = args => {
    let wallet = this.props.walletMeta;

    wallet
      .createTransaction(args)
      .then(tx => {
        let txId = tx.transactionsIds();
        if (this.state.cash_or_token === 0) {
          console.log("Cash transaction created: " + txId);
        } else {
          console.log("Token transaction created: " + txId);
        }
        tx.commit()
          .then(() => {
            this.setCloseSendPopup();
            if (this.state.cash_or_token === 0) {
              console.log("Cash transaction commited successfully");
              this.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                  txId,
                false
              );
            } else {
              console.log("Token transaction commited successfully");
              this.setOpenAlert(
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

  setOpenSendPopup = send_cash_or_token => {
    openSendPopup(this, send_cash_or_token);
  };

  setCloseSendPopup = () => {
    closeSendPopup(this);
  };

  toggleAddressModal = () => {
    this.setState({
      address_modal: !this.state.address_modal
    });
  };

  connectionError = () => {
    this.setOpenAlert(
      "Daemon connection error, please try again later ",
      false
    );
  };

  render() {
    return (
      <div className="wallet-inner-wrap">
        <div className="btn-wrap">
          <button
            className={
              "signal" +
              addClass(this.props.wallet.wallet_connected, "connected")
            }
            disabled
            title="Status"
          >
            <img src="images/connected-white.png" alt="connected" />
            <p>
              {this.props.wallet.wallet_connected ? (
                <span>Connected</span>
              ) : (
                <span>Connection error</span>
              )}
            </p>
          </button>
          <button className="blockheight" title="Blockchain Height" disabled>
            <img src="images/blocks.png" alt="blocks" />
            <span>{this.props.wallet.blockchain_height}</span>
          </button>
          <button
            className="button-shine address-info"
            onClick={this.toggleAddressModal}
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

        <label htmlFor="filename">Wallet File</label>
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
            <p className="display-value">{this.props.wallet.pending_balance}</p>

            <label htmlFor="unlocked_balance">Available Safex Cash</label>
            <p className="display-value">
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
            <p className="display-value">{this.props.wallet.pending_tokens}</p>

            <label htmlFor="unlocked_tokens">Available Safex Tokens</label>
            <p className="display-value">{this.props.wallet.unlocked_tokens}</p>

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
          sendModal={this.state.send_modal}
          send_cash_or_token={this.state.send_cash_or_token}
          closeSendPopup={this.setCloseSendPopup}
          sendCashOrToken={this.sendCashOrToken}
          txBeingSent={this.state.tx_being_sent}
          availableCash={this.props.wallet.unlocked_balance}
          availableTokens={this.props.wallet.unlocked_tokens}
        />

        <AddressModal
          wallet={this.props.wallet}
          addressModal={this.state.address_modal}
          toggleAddressModal={this.toggleAddressModal}
        />
      </div>
    );
  }
}
