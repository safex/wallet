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
    this.state = {
      wallet: null,
      alert: this.props.alert,
      balance_wallet: this.props.wallet.wallet_address
    };

    this.goToPage = this.goToPage.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
    //balance functions
    this.rescanBalance = this.rescanBalance.bind(this);
    this.roundBalanceAmount = this.roundBalanceAmount.bind(this);
    this.updatedCallback = this.updatedCallback.bind(this);
    this.refreshCallback = this.refreshCallback.bind(this);
    this.newBlockCallback = this.newBlockCallback.bind(this);
    this.setCloseSendPopup = this.setCloseSendPopup.bind(this);
    this.sendCash = this.sendCash.bind(this);
    this.sendToken = this.sendToken.bind(this);
  }

  componentDidMount() {
    this.refreshCallback();
  }

  goToPage() {
    this.props.goToPage();
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  roundBalanceAmount(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  }

  setOpenAlert(alert, alert_state, disabled) {
    openAlert(this, alert, alert_state, disabled);
  }

  setCloseAlert() {
    closeAlert(this);
  }

  updatedCallback() {
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

  refreshCallback() {
    console.log("wallet refreshed");
    let wallet = this.props.walletMeta;

    this.setOpenAlert(
      "Please wait while blockchain is being updated...",
      "alert",
      true
    );

    this.setState(() => ({
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
        unlocked_tokens: this.roundBalanceAmount(
          wallet.unlockedTokenBalance()
        )
      }
    }));

    wallet
      .store()
      .then(() => {
        this.setCloseAlert();
        console.log("Wallet stored");
      })
      .catch(e => {
        this.setOpenAlert(
          "Unable to store wallet: " + e,
          "open_file_alert",
          false
        );
        console.log("Unable to store wallet: " + e);
      });

    wallet.off("refreshed");

    setTimeout(() => {
      wallet.on("newBlock", this.newBlockCallback);
      wallet.on("updated", this.updatedCallback);
    }, 300);
  }

  newBlockCallback(height) {
    let wallet = this.props.walletMeta;
    let syncedHeight = wallet.daemonBlockchainHeight() - height < 10;
    if (syncedHeight) {
      console.log("syncedHeight up to date...");
      if (wallet.synchronized()) {
        console.log("newBlock wallet synchronized, setting state...");
        this.setState(() => ({
          wallet_sync: true,
          alert_close_disabled: false,
          balance: this.roundBalanceAmount(
            wallet.balance() - wallet.unlockedBalance()
          ),
          unlocked_balance: this.roundBalanceAmount(wallet.unlockedBalance()),
          tokens: this.roundBalanceAmount(
            wallet.tokenBalance() - wallet.unlockedTokenBalance()
          ),
          unlocked_tokens: this.roundBalanceAmount(
            wallet.unlockedTokenBalance()
          ),
          blockchain_height: wallet.blockchainHeight()
        }));
      }
    }
  }

  rescanBalance() {
    var wallet = this.props.walletMeta;
    console.log(wallet)

    this.setOpenAlert(
      "Rescanning, this may take some time, please wait ",
      "alert",
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
        this.setState(() => ({
          alert: true,
          alert_close_disabled: false,
          balance: this.roundBalanceAmount(
            wallet.balance() - wallet.unlockedBalance()
          ),
          unlocked_balance: this.roundBalanceAmount(wallet.unlockedBalance()),
          tokens: this.roundBalanceAmount(
            wallet.tokenBalance() - wallet.unlockedTokenBalance()
          ),
          unlocked_tokens: this.roundBalanceAmount(
            wallet.unlockedTokenBalance()
          ),
          blockchain_height: wallet.blockchainHeight(),
          wallet_connected: wallet.connected() === "connected"
        }));
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

  sendCash(e) {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = e.target.amount.value * 10000000000;
    let wallet = this.props.walletMeta;

    if (sendingAddress !== "") {
      if (amount !== "") {
        console.log("amount " + amount);
        wallet
          .createTransaction({
            address: sendingAddress,
            amount: amount,
            tx_type: 0 // cash transaction
          })
          .then(tx => {
            let txId = tx.transactionsIds();
            console.log("Cash transaction created: " + txId);

            tx.commit()
              .then(() => {
                console.log("Transaction commited successfully");
                this.setCloseSendPopup();
                this.setOpenAlert(
                  "Transaction commited successfully, Your cash transaction ID is: " +
                  txId,
                  "alert",
                  false
                );
                this.state.balance = this.roundBalanceAmount(
                  wallet.unlockedBalance() - wallet.balance()
                );
                this.state.unlocked_balance = this.roundBalanceAmount(
                  wallet.unlockedBalance()
                );
              })
              .catch(e => {
                console.log("Error on commiting transaction: " + e);
                this.setOpenAlert(
                  "Error on commiting transaction: " + e,
                  "alert",
                  false
                );
              });
          })
          .catch(e => {
            console.log("Couldn't create transaction: " + e);
            this.setOpenAlert(
              "Couldn't create transaction: " + e,
              "alert",
              false
            );
          });
      } else {
        this.setOpenAlert("Enter Amount", "alert", false);
      }
    } else {
      this.setOpenAlert("Fill out all the fields", "alert", false);
    }
  }

  sendToken(e) {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = Math.floor(e.target.amount.value) * 10000000000;
    let wallet = this.props.walletMeta;

    if (sendingAddress === "") {
      this.setOpenAlert("Fill out all the fields", "alert", false);
      return false;
    }
    if (amount === "") {
      this.setOpenAlert("Enter Amount", "alert", false);
      return false;
    }
    console.log("amount " + amount);
    wallet
      .createTransaction({
        address: sendingAddress,
        amount: amount,
        tx_type: 1 // token transaction
      })
      .then(tx => {
        let txId = tx.transactionsIds();
        console.log("Token transaction created: " + txId);

        tx.commit()
          .then(() => {
            console.log("Transaction commited successfully");
            this.setCloseSendPopup();
            this.setOpenAlert(
              "Transaction commited successfully, Your token transaction ID is: " +
              txId,
              "alert",
              false
            );
            this.state.tokens = this.roundBalanceAmount(
              wallet.unlockedTokenBalance() - wallet.tokenBalance()
            );
            this.state.unlocked_tokens = this.roundBalanceAmount(
              wallet.unlockedTokenBalance()
            );
          })
          .catch(e => {
            console.log("Error on commiting transaction: " + e);
            this.setOpenAlert(
              "Error on commiting transaction: " + e,
              "alert",
              false
            );
          });
      })
      .catch(e => {
        console.log("Couldn't create transaction: " + e);
        this.setOpenAlert(
          "Couldn't create transaction: " + e,
          "alert",
          false
        );
      });
  }

  setOpenSendPopup(currency) {
    openSendPopup(this, currency);
  }

  setCloseSendPopup() {
    closeSendPopup(this);
  }

  render() {
    return (
      <div className="wallet-wrap">
        <button
          onClick={this.goToPage}
          className="go-back-btn button-shine"
          disabled={this.state.alert_close_disabled ? "disabled" : ""}
        >
          Back
        </button>
        <img
          src="images/create-new.png"
          className="create-new-pic"
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

        <div className="col-xs-6 col-xs-push-3 wallet-inner-wrap">
          <div className="btn-wrap">
            {/* <button
              className="open-file-btn button-shine"
              onClick={this.props.createAnotherFile}
            >
              Back
            </button> */}
            <button
              className={
                this.props.wallet.wallet_connected ? "signal connected" : "signal"
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

          <label className={this.props.wallet.mnemonic ? "" : "hidden"}>Wallet Mnemonic Seed</label>
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
                defaultValue={this.props.wallet.balance}
                readOnly
              />

              <label htmlFor="unlocked_balance">Available Safex Cash</label>
              <input
                type="text"
                placeholder="Unlocked balance"
                name="unlocked_balance"
                className="green-field"
                defaultValue={this.props.wallet.unlocked_balance}
                readOnly
              />
              <button
                className="btn button-shine"
                onClick={this.setOpenSendPopup.bind(this, 'send_cash')}
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
                defaultValue={this.props.wallet.tokens}
                readOnly
              />
              <label htmlFor="unlocked_tokens">Available Safex Tokens</label>
              <input
                type="text"
                className="green-field"
                placeholder="Unlocked Tokens"
                name="unlocked_tokens"
                defaultValue={this.props.wallet.unlocked_tokens}
                readOnly
              />
              <button
                className="btn button-shine"
                onClick={this.setOpenSendPopup.bind(this, 'send_token')}
              >
                Send Tokens
              </button>
            </div>
          </div>

          <SendModal
            send_cash={this.state.send_cash}
            send_token={this.state.send_token}
            fromAddress={this.state.balance_wallet}
            closeSendPopup={this.setCloseSendPopup}
            sendCash={this.sendCash}
            sendToken={this.sendToken}
          />

          <Alert
            openAlert={this.state.alert}
            alertText={this.state.alert_text}
            alertCloseDisabled={this.state.alert_close_disabled}
            closeAlert={this.setCloseAlert}
          />
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
