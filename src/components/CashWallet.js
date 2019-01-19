import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import ExitModal from "./partials/ExitModal";
import { closeApp } from "../utils/utils.js";
import Wallet from "./Wallet";
import packageJson from "../../package";

const safex = window.require("safex-nodejs-libwallet");

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      page: null
    };

    this.goToPage = this.goToPage.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.roundBalanceAmount = this.roundBalanceAmount.bind(this);
    this.startBalanceCheck = this.startBalanceCheck.bind(this);
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

  roundBalanceAmount(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  }

  createWallet(createWalletFunctionType, args, callback) {
    console.log(createWalletFunctionType, args);

    safex[createWalletFunctionType](args)
      .then(wallet => {
        this.setState(
          {
            wallet_loaded: true,
            wallet_meta: wallet,
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
              unlocked_balance: this.roundBalanceAmount(
                wallet.unlockedBalance()
              ),
              tokens: this.roundBalanceAmount(
                wallet.tokenBalance() - wallet.unlockedTokenBalance()
              ),
              unlocked_tokens: this.roundBalanceAmount(
                wallet.unlockedTokenBalance()
              )
            }
          },
          () => {
            console.log(this.state.wallet_meta);
          }
        );
        wallet.on("refreshed", () => {
          console.log("Wallet File refreshed");
          wallet
            .store()
            .then(() => {
              console.log("Wallet stored");
              this.startBalanceCheck();
            })
            .catch(e => {
              console.log("Unable to store wallet: " + e);
              return false;
            });
        });
      })
      .catch(err => {
        console.log("error with the creation of the wallet " + err);
        return callback(err);
      });
  }

  startBalanceCheck() {
    let wallet = this.state.wallet_meta;
    console.log("daemon blockchain height: " + wallet.daemonBlockchainHeight());
    console.log("blockchain height: " + wallet.blockchainHeight());
    if (this.state.wallet_loaded) {
      this.setState(() => ({
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
      console.log("balance: " + this.roundBalanceAmount(wallet.balance()));
      console.log(
        "unlocked balance: " + this.roundBalanceAmount(wallet.unlockedBalance())
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
    if (wallet.daemonBlockchainHeight() - wallet.blockchainHeight() > 10) {
      console.log("Please wait while blockchain is being updated...");
    }
    this.setState({
      page: "wallet"
    });
  }

  render() {
    switch (this.state.page) {
      case "wallet":
        return (
          <Wallet
            goToPage={this.goToPage}
            wallet={this.state.wallet}
            walletMeta={this.state.wallet_meta}
            alert={this.state.alert}
          />
        );
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
          <OpenFile 
            goToPage={this.goToPage} 
            createWallet={this.createWallet}
          />
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
                  <h3>Recover from Mnemonic</h3>
                </div>
              </div>
              <button
                onClick={this.toggleExitModal}
                className="close-app-btn button-shine"
                title="Exit"
              >
                X
              </button>

              <p id="version">{packageJson.version}</p>
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
}
