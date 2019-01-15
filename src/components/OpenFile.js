import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import ExitModal from "./partials/ExitModal";

import {
  openAlert,
  closeAlert,
  openSendCashPopup,
  openSendTokenPopup,
  closeSendPopup,
  closeApp
} from "../utils/utils.js";

import Alert from "./partials/Alert";
import SendModal from "./partials/SendModal";

export default class OpenFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //wallet state settings
      wallet: {},
      wallet_connected: false,
      blockchain_height: 0,
      wallet_sync: false,
      wallet_loaded: false,
      wallet_exists: false,
      wallet_path: "",
      spend_key: "",
      view_key: "",
      open_file_alert: false,
      net: "mainnet",
      daemonHostPort: "rpc.safex.io:17402",
      mnemonic: "",
      //balance settings
      balance: 0,
      unlocked_balance: 0,
      tokens: 0,
      unlocked_tokens: 0,
      balance_wallet: "",
      balance_view_key: "",
      balance_spend_key: "",
      send_cash: false,
      send_token: false
    };

    this.goBack = this.goBack.bind(this);
    this.setOpenAlert = this.setOpenAlert.bind(this);
    this.setCloseAlert = this.setCloseAlert.bind(this);
    this.browseFile = this.browseFile.bind(this);
    this.openFile = this.openFile.bind(this);
    this.openAnotherFile = this.openAnotherFile.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);

    //Balance functions
    this.roundBalanceAmount = this.roundBalanceAmount.bind(this);
    this.updatedCallback = this.updatedCallback.bind(this);
    this.refreshCallback = this.refreshCallback.bind(this);
    this.newBlockCallback = this.newBlockCallback.bind(this);
    this.startBalanceCheck = this.startBalanceCheck.bind(this);
    this.rescanBalance = this.rescanBalance.bind(this);
    this.setOpenSendCash = this.setOpenSendCash.bind(this);
    this.setOpenSendTokens = this.setOpenSendTokens.bind(this);
    this.setCloseSendPopup = this.setCloseSendPopup.bind(this);
    this.sendCash = this.sendCash.bind(this);
    this.sendToken = this.sendToken.bind(this);
  }

  goBack() {
    this.context.router.push("/");
  }

  setOpenAlert(alert, alert_state, disabled) {
    openAlert(this, alert, alert_state, disabled);
  }

  setCloseAlert() {
    closeAlert(this);
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  openAnotherFile() {
    this.setState({ wallet_loaded: false });
  }

  browseFile() {
    var filename = "";
    filename = dialog.showOpenDialog({});
    console.log("filename " + filename);

    this.setState(() => ({
      wallet_path: filename
    }));
  }

  openFile(e) {
    e.preventDefault();
    const pass = e.target.pass.value;
    let filename = e.target.filepath.value;

    if (filename !== "") {
      if (pass !== "") {
        if (this.state.wallet_path) {
          this.setState({
            modal_close_disabled: true
          });
          var args = {
            path: this.state.wallet_path,
            password: pass,
            network: this.state.net,
            daemonAddress: this.state.daemonHostPort
          };
          this.setOpenAlert(
            "Please wait while your wallet file is loaded",
            "open_file_alert",
            true
          );
          safex
            .openWallet(args)
            .then(wallet => {
              this.setState(() => ({
                wallet_loaded: true,
                wallet: wallet,
                balance_wallet: wallet.address(),
                spend_key: wallet.secretSpendKey(),
                view_key: wallet.secretViewKey(),
                mnemonic: wallet.seed(),
                alert_close_disabled: false
              }));
              this.setCloseAlert();
              this.startBalanceCheck();

              console.log("wallet object " + this.state.wallet);
              console.log("wallet loaded " + this.state.wallet_loaded);
            })
            .catch(err => {
              this.setState(() => ({
                alert_close_disabled: false
              }));
              this.setOpenAlert(
                "Error opening the wallet: " + err,
                "open_file_alert",
                false
              );
            });
        }
      } else {
        this.setOpenAlert(
          "Enter password for your wallet file",
          "open_file_alert",
          false
        );
      }
    } else {
      this.setOpenAlert("Choose the wallet file", "open_file_alert", false);
    }
  }

  updatedCallback() {
    console.log("UPDATED");
    this.state.wallet
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
    let wallet = this.state.wallet;
    this.setState(() => ({
      alert_close_disabled: false,
      balance: this.roundBalanceAmount(
        wallet.balance() - wallet.unlockedBalance()
      ),
      unlocked_balance: this.roundBalanceAmount(wallet.unlockedBalance()),
      tokens: this.roundBalanceAmount(
        wallet.tokenBalance() - wallet.unlockedTokenBalance()
      ),
      unlocked_tokens: this.roundBalanceAmount(wallet.unlockedTokenBalance()),
      blockchain_height: wallet.blockchainHeight(),
      wallet_connected: wallet.connected() === "connected"
    }));

    wallet
      .store()
      .then(() => {
        console.log("Wallet stored");
        this.setCloseAlert();
      })
      .catch(e => {
        console.log("Unable to store wallet: " + e);
        this.setOpenAlert(
          "Unable to store wallet: " + e,
          "open_file_alert",
          false
        );
      });

    wallet.off("refreshed");

    setTimeout(() => {
      wallet.on("newBlock", this.newBlockCallback);
      wallet.on("updated", this.updatedCallback);
    }, 300);
  }

  newBlockCallback(height) {
    let wallet = this.state.wallet;
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

  startBalanceCheck() {
    if (this.state.wallet_loaded) {
      let wallet = this.state.wallet;
      console.log(
        "daemon blockchain height: " + wallet.daemonBlockchainHeight()
      );
      console.log("blockchain height: " + wallet.blockchainHeight());

      this.setState(() => ({
        balance_wallet: wallet.address()
      }));

      if (this.state.wallet_loaded) {
        let myBlockchainHeight = wallet.blockchainHeight();
        this.setState(() => ({
          wallet_connected: wallet.connected() === "connected",
          blockchain_height: myBlockchainHeight,
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
        }));

        console.log("balance: " + this.roundBalanceAmount(wallet.balance()));
        console.log(
          "unlocked balance: " +
            this.roundBalanceAmount(wallet.unlockedBalance())
        );
        console.log(
          "token balance: " +
            this.roundBalanceAmount(
              wallet.tokenBalance() - wallet.unlockedTokenBalance()
            )
        );
        console.log(
          "unlocked token balance: " +
            this.roundBalanceAmount(wallet.unlockedTokenBalance())
        );
        console.log("blockchain height " + wallet.blockchainHeight());
        console.log("connected: " + wallet.connected());
      }

      console.log("balance address: " + wallet.address());

      this.setState(() => ({
        wallet_sync: false
      }));

      if (wallet.daemonBlockchainHeight() - wallet.blockchainHeight() > 10) {
        this.setOpenAlert(
          "Please wait while blockchain is being updated...",
          "open_file_alert",
          true
        );
      }

      wallet.on("refreshed", this.refreshCallback);
    }
  }

  rescanBalance() {
    var wallet = this.state.wallet;
    this.setOpenAlert(
      "Rescanning, this may take some time, please wait ",
      "open_file_alert",
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
            this.setOpenAlert(
              "Unable to store wallet: " + e,
              "open_file_alert",
              false
            );
          });
        wallet.on("newBlock", this.newBlockCallback);
        wallet.on("updated", this.updatedCallback);
      }, 1000);
    }, 1000);
  }

  roundBalanceAmount(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  }

  sendCash(e) {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = e.target.amount.value * 10000000000;
    let wallet = this.state.wallet;

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
                  "open_file_alert",
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
                  "open_file_alert",
                  false
                );
              });
          })
          .catch(e => {
            console.log("Couldn't create transaction: " + e);
            this.setOpenAlert(
              "Couldn't create transaction: " + e,
              "open_file_alert",
              false
            );
          });
      } else {
        this.setOpenAlert("Enter Amount", "open_file_alert", false);
      }
    } else {
      this.setOpenAlert("Fill out all the fields", "open_file_alert", false);
    }
  }

  sendToken(e) {
    e.preventDefault();
    let sendingAddress = e.target.send_to.value;
    let amount = Math.floor(e.target.amount.value) * 10000000000;
    let wallet = this.state.wallet;

    if (sendingAddress !== "") {
      if (amount !== "") {
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
                  "open_file_alert",
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
                  "open_file_alert",
                  false
                );
              });
          })
          .catch(e => {
            console.log("Couldn't create transaction: " + e);
            this.setOpenAlert(
              "Couldn't create transaction: " + e,
              "open_file_alert",
              false
            );
          });
      } else {
        this.setOpenAlert("Enter Amount", "open_file_alert", false);
      }
    } else {
      this.setOpenAlert("Fill out all the fields", "open_file_alert", false);
    }
  }

  setOpenSendCash() {
    openSendCashPopup(this);
  }

  setOpenSendTokens() {
    openSendTokenPopup(this);
  }

  setCloseSendPopup() {
    closeSendPopup(this);
  }

  render() {
    return (
      <div
        className={
          this.state.closing
            ? "create-new-wrap open-file-wrap animated fadeOut"
            : "create-new-wrap open-file-wrap"
        }
      >
        <img
          src="images/open-wallet-file.png"
          className="create-new-pic"
          alt="open-wallet-file"
        />
        <button onClick={this.goBack} className="go-back-btn button-shine">
          Back
        </button>
        <button
          onClick={this.toggleExitModal}
          className="close-app-btn button-shine"
          title="Exit"
        >
          X
        </button>
        <h2>Open Wallet File</h2>

        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <button
            className={
              this.state.wallet_loaded ? "hidden" : "browse-btn button-shine"
            }
            onClick={this.browseFile}
          >
            Browse
          </button>
          <form
            onSubmit={this.openFile}
            className={this.state.wallet_loaded ? "hidden" : ""}
          >
            <div className="group-wrap">
              <div className="form-group">
                <input
                  name="filepath"
                  value={this.state.wallet_path}
                  placeholder="wallet file path"
                  readOnly
                />
                <input type="password" name="pass" placeholder="password" />
              </div>
            </div>
            <button type="submit" className="submit btn button-shine">
              Open
            </button>
          </form>

          <div
            className={this.state.wallet_loaded ? "wallet-file-wrap" : "hidden"}
          >
            <div className="btn-wrap">
              <button
                type="submit"
                className="open-file-btn button-shine"
                onClick={this.openAnotherFile}
              >
                Back
              </button>
              <button
                className={
                  this.state.wallet_connected ? "signal connected" : "signal"
                }
                disabled
                title="Status"
              >
                <img src="images/connected-white.png" alt="connected" />
                <p>
                  {this.state.wallet_connected ? (
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
                <span>{this.state.blockchain_height}</span>
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
              value={this.state.balance_wallet}
              placeholder="address"
            />

            <label htmlFor="spend_key">Secret Spend Key</label>
            <input
              type="text"
              name="spend_key"
              value={this.state.spend_key}
              placeholder="secret spend key"
            />

            <label htmlFor="view_key">Secret View Key</label>
            <input
              type="text"
              name="view_key"
              value={this.state.view_key}
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
                  value={this.state.balance}
                  readOnly
                />

                <label htmlFor="unlocked_balance">Available Safex Cash</label>
                <input
                  type="text"
                  placeholder="Unlocked balance"
                  name="unlocked_balance"
                  className="green-field"
                  value={this.state.unlocked_balance}
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
                  value={this.state.tokens}
                  readOnly
                />
                <label htmlFor="unlocked_tokens">Available Safex Tokens</label>
                <input
                  type="text"
                  className="green-field"
                  placeholder="Unlocked Tokens"
                  name="unlocked_tokens"
                  value={this.state.unlocked_tokens}
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

          <SendModal
            send_cash={this.state.send_cash}
            send_token={this.state.send_token}
            fromAddress={this.state.balance_wallet}
            closeSendPopup={this.setCloseSendPopup}
            sendCash={this.sendCash}
            sendToken={this.sendToken}
          />

          <Alert
            openAlert={this.state.open_file_alert}
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

OpenFile.contextTypes = {
  router: React.PropTypes.object.isRequired
};
