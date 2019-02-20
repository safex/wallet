import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import Modal from "./partials/Modal";
import Header from "./partials/Header";
import {
  openModal,
  closeModal,
  closeAlert,
  parseEnv,
  roundAmount,
  percentCalculation
} from "../utils/utils.js";
import Wallet from "./Wallet";

const safex = window.require("safex-nodejs-libwallet");

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      local_wallet: JSON.parse(localStorage.getItem("wallet")),
      page: null,
      network: true,

      //UI variables
      progress: 0,
      alert: false,
      alert_text: "",
      alert_close_disabled: false,
      address_modal: false,
      loading_modal: false
    };

    this.wallet_meta = null;
    this.env = parseEnv();
    this.progress_timeout_id = null;
    this.daemon_height = null;
  }

  componentDidMount() {
    if (this.state.local_wallet) {
      this.setOpenModal("loading_modal", "", false, null);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.progress_timeout_id);
  }

  setOpenModal = (modal_type, alert, disabled, send_cash_or_token) => {
    openModal(this, modal_type, alert, disabled, send_cash_or_token);
  };

  setCloseModal = () => {
    closeModal(this);
  };

  setOpenAlert = (alert, disabled) => {
    this.setOpenModal("alert", alert, disabled, null);
  };

  setOpenAddressModal = () => {
    this.setOpenModal("address_modal", "", false, null);
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  goToPage = page => {
    if (this.state.page !== "wallet") {
      this.setState({ page });
    } else {
      this.setOpenAlert("Logging out...", true);
      this.setState({ address_modal: false });
      localStorage.removeItem("wallet");
      localStorage.removeItem("password");
      setTimeout(() => {
        this.setState({ page });
        this.setCloseAlert();
      }, 1000);
    }
  };

  createWallet = (createWalletFunctionType, args, callback) => {
    console.log(createWalletFunctionType, args);

    try {
      safex[createWalletFunctionType](args)
        .then(wallet => {
          this.wallet_meta = wallet;
          this.refreshProgressInterval();
          wallet.on("refreshed", () => {
            this.setState({ progress: false });
            clearTimeout(this.progress_timeout_id);
            console.log("Wallet File synchronized initially");
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
          this.setOpenAlert(
            "Error with the creation of the wallet " + err,
            false
          );
          return callback;
        });
    } catch (e) {
      this.setOpenAlert("Error with the creation of the wallet " + e, false);
      return callback;
    }
  };

  refreshProgressInterval = () => {
    let wallet = this.wallet_meta;
    let blockchainHeight =  wallet.blockchainHeight();

    if (!this.daemon_height) {
      this.daemon_height = wallet.daemonBlockchainHeight();
    }

    console.log("refreshProgressInterval height="+blockchainHeight+ " daemonHeight="+this.daemon_height);

    const progress = percentCalculation(blockchainHeight, this.daemon_height);

    this.setState({ progress });
    if ((this.daemon_height > 0 && progress < 100) || progress === Infinity) {
      this.progress_timeout_id = setTimeout(this.refreshProgressInterval, 2000);
    } else {
      setTimeout(() => {
        this.setState({ progress: false });
        clearTimeout(this.progress_timeout_id);
      }, 1000);
    }
  };

  startBalanceCheck = () => {
    let wallet = this.wallet_meta;
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
        pending_balance: roundAmount(
          Math.abs(wallet.balance() - wallet.unlockedBalance())
        ),
        unlocked_balance: roundAmount(wallet.unlockedBalance()),
        pending_tokens: roundAmount(
          Math.abs(wallet.tokenBalance() - wallet.unlockedTokenBalance())
        ),
        unlocked_tokens: roundAmount(wallet.unlockedTokenBalance()),
        config: {
          network: this.env.NETWORK,
          daemonAddress: this.env.ADDRESS
        }
      }
    });
  };

  renderPageWrapper = (title, page, icon) => {
    return (
      <div className="item-wrap">
        <Header
          page={this.state.page}
          goToPage={this.goToPage}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img src={icon} className="item-pic" alt={icon} />
          <h2>{title}</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap">
            {page}
          </div>
        </div>
        <Modal
          modal={this.state.modal}
          wallet={this.state.wallet}
          env={this.env}
          progress={this.state.progress}
          loadingModal={this.state.loading_modal}
          createWallet={this.createWallet}
          closeModal={this.setCloseModal}
          addressModal={this.state.address_modal}
          openModal={this.setOpenModal}
          alert={this.state.alert}
          closeAlert={this.setCloseAlert}
          setOpenAlert={this.setOpenAlert}
          alertText={this.state.alert_text}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
      </div>
    );
  };

  render() {
    let page = null;
    let title = null;
    let icon = null;

    switch (this.state.page) {
      case "wallet":
        title = "Wallet File";
        icon = "images/create-new.png";
        page = (
          <Wallet
            env={this.env}
            goToPage={this.goToPage}
            wallet={this.state.wallet}
            walletMeta={this.wallet_meta}
            setWalletData={this.setWalletData}
            setOpenAlert={this.setOpenAlert}
            setOpenAddressModal={this.setOpenAddressModal}
            closeModal={this.setCloseModal}
            closeAlert={this.setCloseAlert}
          />
        );
        break;
      case "create-new":
        title = "Create New Wallet File";
        icon = "images/create-new.png";
        page = (
          <CreateNew
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
          />
        );
        break;
      case "create-from-keys":
        title = "Create New Wallet From Keys";
        icon = "images/new-from-keys.png";
        page = (
          <CreateFromKeys
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
          />
        );
        break;
      case "open-file":
        title = "Open Wallet File";
        icon = "images/open-wallet-file.png";
        page = (
          <OpenFile
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
          />
        );
        break;
      case "recover-from-mnemonic":
        title = "Recover Wallet From Mnemonic Seed";
        icon = "images/mnemonic.png";
        page = (
          <RecoverFromMnemonic
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
          />
        );
        break;
      default:
        return (
          <div className="intro-page-wrap">
            <Header />
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
            <Modal
              modal={this.state.modal}
              env={this.env}
              wallet={this.state.wallet}
              progress={this.state.progress}
              loadingModal={this.state.loading_modal}
              createWallet={this.createWallet}
              closeModal={this.setCloseModal}
              addressModal={this.state.address_modal}
              openModal={this.setOpenModal}
              alert={this.state.alert}
              closeAlert={this.setCloseAlert}
              setOpenAlert={this.setOpenAlert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
            />
          </div>
        );
    }

    return this.renderPageWrapper(title, page, icon);
  }
}
