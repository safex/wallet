import React from "react";
import { closeApp } from "../utils/utils.js";
import ExitModal from "./partials/ExitModal";
import SendModal from "./partials/SendModal";
import Alert from "./partials/Alert";
import {
  openSendPopup,
  closeSendPopup,
  openAlert,
  closeAlert
} from "../utils/utils.js";

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () =>  {
    this.refreshCallback();
  }

  goToPage = () =>  {
    this.props.goToPage();
  }

  toggleExitModal = () =>  {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp = () =>  {
    closeApp(this);
  }

  roundBalanceAmount = (balance) => {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  }

  setOpenAlert = (alert, disabled) => {
    openAlert(this, alert, disabled);
  }

  setCloseAlert = () =>  {
    closeAlert(this);
  }

  updatedCallback = () =>  {
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
  }

  refreshCallback = () =>  {
    console.log("wallet refreshed");
    let wallet = this.props.walletMeta;
    this.setWalletData(wallet);
    this.setOpenAlert("Please wait while blockchain is being updated...", true);
    wallet
      .store()
      .then(() => {
        this.setCloseAlert();
        console.log("Wallet stored");
      })
      .catch(e => {
        this.setOpenAlert("Unable to store wallet: " + e, false);
        console.log("Unable to store wallet: " + e);
      });
    wallet.off("refreshed");
    setTimeout(() => {
      wallet.on("newBlock", this.newBlockCallback);
      wallet.on("updated", this.updatedCallback);
    }, 300);
  }

  newBlockCallback = (height) => {
    let wallet = this.props.walletMeta;
    let syncedHeight = wallet.daemonBlockchainHeight() - height < 10;
    if (syncedHeight) {
      console.log("syncedHeight up to date...");
      if (wallet.synchronized()) {
        console.log("newBlock wallet synchronized, setting state...");
        this.setWalletData(wallet);
      }
    }
  }

  rescanBalance = () =>  {
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
        blockchain_height: wallet.blockchainHeight()
      }));
      console.log("Starting blockchain rescan sync...");
      wallet.rescanBlockchain();
      console.log("Blockchain rescan executed...");

      setTimeout(() => {
        console.log("Rescan setting callbacks");
        this.setWalletData(wallet);
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
  }

  setWalletData = (wallet) => {
    this.setState({
      alert_close_disabled: false,
      wallet: {
        wallet_address: wallet.address(),
        spend_key: wallet.secretSpendKey(),
        view_key: wallet.secretViewKey(),
        mnemonic: wallet.seed(),
        wallet_connected: wallet.connected() === "connected",
        blockchain_height: wallet.blockchainHeight(),
        balance: this.roundBalanceAmount(
          wallet.balance() - wallet.unlockedBalance()
        ),
        unlocked_balance: this.roundBalanceAmount(wallet.unlockedBalance()),
        tokens: this.roundBalanceAmount(
          wallet.tokenBalance() - wallet.unlockedTokenBalance()
        ),
        unlocked_tokens: this.roundBalanceAmount(wallet.unlockedTokenBalance())
      }
    });
  }

  sendCashOrToken = (e, cash_or_token) => {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = e.target.amount.value * 10000000000;
    let wallet = this.props.walletMeta;

    if (sendingAddress === "") {
      this.setOpenAlert("Fill out all the fields", false);
      return false;
    }
    if (amount === "") {
      this.setOpenAlert("Enter Amount", false);
      return false;
    }
    console.log("amount " + amount);
    this.setState(() => ({
      tx_being_sent: true,
      send_cash_or_token: cash_or_token
    }));
    wallet
      .createTransaction({
        address: sendingAddress,
        amount: amount,
        tx_type: cash_or_token // cash transaction
      })
      .then(tx => {
        let txId = tx.transactionsIds();
        if (cash_or_token === 0) {
          console.log("Cash transaction created: " + txId);
        } else {
          console.log("Token transaction created: " + txId);
        }

        tx.commit()
          .then(() => {
            console.log("Transaction commited successfully");
            this.setCloseSendPopup();
            if (cash_or_token === 0) {
              this.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                  txId,
                false
              );
            } else {
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
              this.sendAmountOnChange();
            }, 1000);
          })
          .catch(e => {
            this.setState(() => ({
              tx_being_sent: false
            }));
            this.setOpenAlert("Error on commiting transaction: " + e, false);
          });
      })
      .catch(e => {
        this.setState(() => ({
          tx_being_sent: false
        }));
        this.setOpenAlert("Couldn't create transaction: " + e, false);
      });
  };

  setOpenSendPopup = (send_cash_or_token) => {
    openSendPopup(this, send_cash_or_token);
  }

  setCloseSendPopup = () =>  {
    closeSendPopup(this);
  }

  //This is fired when amount is changed
  sendAmountOnChange = () =>  {
    let wallet = this.props.walletMeta;

    this.props.wallet.balance = this.roundBalanceAmount(
      wallet.unlockedBalance() - wallet.balance()
    );
    this.props.wallet.unlocked_balance = this.roundBalanceAmount(
      wallet.unlockedBalance()
    );
    this.props.wallet.tokens = this.roundBalanceAmount(
      wallet.unlockedTokenBalance() - wallet.tokenBalance()
    );
    this.props.wallet.unlocked_tokens = this.roundBalanceAmount(
      wallet.unlockedTokenBalance()
    );
  }

  render() {
    return (
      <div className="item-wrap wallet-wrap">
        <div className="item-inner">
          <button
            onClick={this.goToPage}
            className="go-back-btn button-shine"
            disabled={this.state.alert_close_disabled ? "disabled" : ""}
          >
            Back
          </button>
          <img
            src="images/create-new.png"
            className="item-pic"
            alt="create-new"
          />
          <button
            onClick={this.toggleExitModal}
            className="close-app-btn button-shine"
            title="Exit"
            disabled={this.state.alert_close_disabled ? "disabled" : ""}
          >
            X
          </button>
          <h2>Wallet File</h2>

          <div className={this.props.wallet.mnemonic ? "col-xs-6 col-xs-push-3 wallet-inner-wrap" : "col-xs-6 col-xs-push-3 wallet-inner-wrap no-mnemonic"}>
            <div className="btn-wrap">
              <button
                className={
                  this.props.wallet.wallet_connected
                    ? "signal connected"
                    : "signal"
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
              <button
                className="blockheight"
                title="Blockchain Height"
                disabled
              >
                <img src="images/blocks.png" alt="blocks" />
                <span>{this.props.wallet.blockchain_height}</span>
              </button>
              <button
                className="button-shine rescan"
                onClick={this.rescanBalance}
                title="Rescan"
              >
                <img src="images/rescan.png" alt="rescan" />
              </button>
            </div>

            <label htmlFor="address">Wallet Address</label>
            <input
              type="text"
              name="address"
              defaultValue={this.props.wallet.wallet_address}
              placeholder="address"
            />

            <label htmlFor="spend_key">Secret Spend Key</label>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret spend key"
            />

            <label htmlFor="view_key">Secret View Key</label>
            <input
              type="text"
              name="view_key"
              defaultValue={this.props.wallet.view_key}
              placeholder="secret view key"
            />

            <label className={this.props.wallet.mnemonic ? "" : "hidden"}>
              Wallet Mnemonic Seed
            </label>
            <textarea
              name="mnemonic"
              defaultValue={this.props.wallet.mnemonic}
              placeholder="mnemonic seed for your wallet"
              className={this.props.wallet.mnemonic ? "" : "hidden"}
              rows="2"
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
                  onChange={this.sendAmountOnChange}
                  readOnly
                />

                <label htmlFor="unlocked_balance">Available Safex Cash</label>
                <input
                  type="text"
                  placeholder="Unlocked balance"
                  name="unlocked_balance"
                  className="green-field"
                  value={this.props.wallet.unlocked_balance}
                  onChange={this.sendAmountOnChange}
                  readOnly
                />
                <button
                  className="btn button-shine"
                  onClick={this.setOpenSendPopup.bind(this, 0)}
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
                  onClick={this.setOpenSendPopup.bind(this, 1)}
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

            <Alert
              openAlert={this.state.alert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
              closeAlert={this.setCloseAlert}
            />
          </div>
        </div>

        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.toggleExitModal}
          closeApp={this.setCloseApp}
        />
      </div>
    );
  }
}
