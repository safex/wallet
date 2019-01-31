import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import ExitModal from "./partials/ExitModal";
import LoadingModal from "./partials/LoadingModal";
import Header from "./partials/Header";
import { closeApp } from "../utils/utils.js";
import Wallet from "./Wallet";

const safex = window.require("safex-nodejs-libwallet");

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      local_wallet: JSON.parse(localStorage.getItem("wallet")),
      page: null,
      config: {
        network: "mainnet",
        daemonAddress: "rpc.safex.io:17402"
      }
    };
  }

  componentDidMount() {
    if (this.state.local_wallet) {
      var i;
      for (i = 0; i <= 1; i++) {
        this.toggleLoadingModal();
      }
    }
  }

  toggleLoadingModal = () => {
    this.setState({ loading_modal: !this.state.loading_modal });
  };

  toggleExitModal = () => {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  };

  setCloseApp = () => {
    closeApp(this);
  };

  goToPage = page => {
    this.setState({ page });
  };

  roundBalanceAmount = balance => {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
  };

  createWallet = (createWalletFunctionType, args, callback) => {
    console.log(createWalletFunctionType, args);

    try {
      safex[createWalletFunctionType](args)
        .then(wallet => {
          this.setState(
            {
              wallet_loaded: true,
              wallet_meta: wallet
            },
            () => {
              console.log(this.state.wallet_meta);
            }
          );
          this.setWalletData(wallet);
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
    } catch (e) {
      return callback(e);
    }
  };

  startBalanceCheck = () => {
    let wallet = this.state.wallet_meta;
    wallet.setSeedLanguage("English");
    this.setWalletData(wallet);
    this.setState({
      page: "wallet",
      loading_modal: false
    });
  };

  setWalletData = wallet => {
    this.setState({
      wallet: {
        filename: localStorage
          .getItem("wallet_path")
          .split("/")
          .pop(),
        wallet_address: wallet.address(),
        spend_key: wallet.secretSpendKey(),
        view_key: wallet.secretViewKey(),
        mnemonic: wallet.seed(),
        wallet_connected: wallet.connected() === "connected",
        blockchain_height: wallet.blockchainHeight(),
        pending_balance: this.roundBalanceAmount(
          wallet.unlockedBalance() - wallet.balance()
        ),
        balance: this.roundBalanceAmount(wallet.balance()),
        unlocked_balance: this.roundBalanceAmount(wallet.unlockedBalance()),
        pending_tokens: this.roundBalanceAmount(
          wallet.unlockedTokenBalance() - wallet.tokenBalance()
        ),
        tokens: this.roundBalanceAmount(wallet.tokenBalance()),
        unlocked_tokens: this.roundBalanceAmount(wallet.unlockedTokenBalance()),
        config: this.state.config
      }
    });
  };

  networkSelect = () => {
    if (this.state.config.network === 'mainnet') {
      this.setState({
        config: {
          network: "testnet",
          daemonAddress: "192.168.1.22:29393"
        }
      });
    } else {
      this.setState({
        config: {
          network: "mainnet",
          daemonAddress: "rpc.safex.io:17402"
        }
      });
    }
  }

  resetNetworkSelect = () => {
    this.setState({
      config: {
        network: "mainnet",
        daemonAddress: "rpc.safex.io:17402"
      }
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
            setWalletData={this.setWalletData}
          />
        );
      case "create-new":
        return (
          <CreateNew
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            networkSelect={this.networkSelect}
            resetNetworkSelect={this.resetNetworkSelect}
          />
        );
      case "create-from-keys":
        return (
          <CreateFromKeys
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            networkSelect={this.networkSelect}
            resetNetworkSelect={this.resetNetworkSelect}
          />
        );
      case "open-file":
        return (
          <OpenFile
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            networkSelect={this.networkSelect}
            resetNetworkSelect={this.resetNetworkSelect}
          />
        );
      case "recover-from-mnemonic":
        return (
          <RecoverFromMnemonic
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            networkSelect={this.networkSelect}
            resetNetworkSelect={this.resetNetworkSelect}
          />
        );
      default:
        return (
          <div className="intro-page-wrap">
            <Header toggleExitModal={this.toggleExitModal} />
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
                  <h3>Recover Wallet</h3>
                </div>
              </div>
            </div>
            <LoadingModal
              loadingModal={this.state.loading_modal}
              createWallet={this.createWallet}
              toggleLoadingModal={this.toggleLoadingModal}
            />
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
