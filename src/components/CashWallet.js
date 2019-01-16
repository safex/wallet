import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import ExitModal from "./partials/ExitModal";
import { closeApp, openAlert, closeAlert } from "../utils/utils.js";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import Alert from "./partials/Alert";
import Wallet from "./Wallet";

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      page: null,
      show_page: false,
      alert: false,
      alert_text: "",
      alert_close_disabled: false
    };

    this.goToPage = this.goToPage.bind(this);

    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.roundBalanceAmount = this.roundBalanceAmount.bind(this);
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  goToPage(page) {
    this.setState({ page });
  }

  setOpenAlert(alert, alert_state, disabled) {
    openAlert(this, alert, alert_state, disabled);
  }

  setCloseAlert() {
    closeAlert(this);
  }

  roundBalanceAmount(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  }

  createWallet(createWalletFunctionType, args) {
    dialog.showSaveDialog(path => {
      if (!path) {
        return false;
      }

      if (safex.walletExists(path)) {
        this.setState(() => ({
          modal_close_disabled: false
        }));

        this.setOpenAlert(
          `Wallet already exists. Please choose a different file name  
            "this application does not enable overwriting an existing wallet file 
            "OR you can open it using the Load Existing Wallet`,
          "create_new_wallet_alert",
          false
        );
        return false;
      }

      args.path = path;

      // TODO: maybe we dont need this
      // this.setState({
      //   wallet_path: path,
      //   wallet_exists: false,
      //   modal_close_disabled: true
      // });

      this.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete.",
        "create_new_wallet_alert",
        true
      );

      console.log(createWalletFunctionType, args);

      safex[createWalletFunctionType](args)
        .then(wallet => {
          this.setState(
            {
              page: "wallet",
              wallet: {
                wallet_address: wallet.address(),
                spend_key: wallet.secretSpendKey(),
                view_key: wallet.secretViewKey(),
                mnemonic: wallet.seed(),
                balance: this.roundBalanceAmount(
                  wallet.balance() - wallet.unlockedBalance()
                ),
                unlocked_balance: this.roundBalanceAmount(
                  wallet.unlockedBalance()
                ),
                tokens: this.roundBalanceAmount(
                  wallet.tokenBalance() - wallet.unlockedTokenBalance()
                ),
                unlocked_tokens: this.roundBalanceAmount(
                  wallet.unlockedTokenBalance()
                ),
                blockchain_height: wallet.blockchainHeight(),
                wallet_connected: wallet.connected() === "connected"
              }
            },
            () => {
              console.log(this.state.wallet);
            }
          );

          console.dir(wallet);

          wallet.on("refreshed", () => {
            this.setOpenAlert(
              "Wallet File successfully created!",
              "create_new_wallet_alert",
              false
            );

            wallet
              .store()
              .then(() => {
                console.log("Wallet stored");
              })
              .catch(e => {
                console.log("Unable to store wallet: " + e);
              });
          });
        })
        .catch(err => {
          this.setOpenAlert(
            "Error with the creation of the wallet " + err,
            "create_new_wallet_alert",
            false
          );
        });
    });
  }

  render() {
    switch (this.state.page) {
      case "wallet":
        return <Wallet goToPage={this.goToPage} wallet={this.state.wallet} />;
      case "create-new":
        return (
          <CreateNew
            goToPage={this.goToPage}
            createWallet={this.createWallet}
          />
        );
      case "create-from-keys":
        return (
          <CreateFromKeys
            goToPage={this.goToPage}
            createWallet={this.createWallet}
          />
        );
      case "open-file":
        return (
          <OpenFile goToPage={this.goToPage} createWallet={this.createWallet} />
        );
      case "recover-from-mnemonic":
        return (
          <RecoverFromMnemonic
            goToPage={this.goToPage}
            createWallet={this.createWallet}
          />
        );
      default:
        return (
          <div>
            <div className="options-wrap">
              <div className="options-inner">
                <div
                  className="item"
                  onClick={() => this.goToPage("create-new")}
                >
                  <img src="images/create-new.png" alt="create-new" />
                  <h3>Create New</h3>
                </div>
                <div
                  className="item"
                  onClick={() => this.goToPage("create-from-keys")}
                >
                  <img src="images/new-from-keys.png" alt="new-from-keys" />
                  <h3>New From Keys</h3>
                </div>
                <div
                  className="item"
                  onClick={() => this.goToPage("open-file")}
                >
                  <img
                    src="images/open-wallet-file.png"
                    alt="open-wallet-file"
                  />
                  <h3>Open Wallet File</h3>
                </div>
                <div
                  className="item"
                  onClick={() => this.goToPage("recover-from-mnemonic")}
                >
                  <img src="images/mnemonic.png" alt="mnemonic" />
                  <h3>New from Mnemonic</h3>
                </div>
              </div>
              <button
                onClick={this.toggleExitModal}
                className="close-app-btn button-shine"
                title="Exit"
              >
                X
              </button>
            </div>

            <ExitModal
              exitModal={this.state.exit_modal}
              closeExitModal={this.toggleExitModal}
              closeApp={this.setCloseApp}
            />

            <Alert
              openAlert={this.state.alert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
              closeAlert={this.setCloseAlert}
            />
          </div>
        );
    }
  }
}
