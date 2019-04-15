import React from "react";
import axios from "axios";
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
const remote = window.require("electron").remote;

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: null,
      local_wallet: JSON.parse(localStorage.getItem("wallet")),
      page: null,
      network: true,
      mixin: 6,
      sfx_price: 0,
      sft_price: 0,
      sendTo: "",
      destination: "",
      paymentID: "",

      //UI variables
      button_disabled: false,
      progress: 0,
      alert: false,
      alert_text: "",
      alert_close_disabled: false,
      keys_modal: false,
      loading_modal: false,
      send_modal: false,
      send_disabled: false,
      mixin_modal: false,
      history_modal: false,
      address_modal: false,
      confirm_modal: false,
      value: "",
      copied: false,
      remove_transition: false,
      modal_width: "",
      history: [],
      address_book: []
    };

    this.wallet_meta = null;
    this.env = parseEnv();
    this.progress_timeout_id = null;
    this.daemon_height = null;
    this.cash_or_token = null;
  }

  componentDidMount() {
    if (this.state.local_wallet) {
      this.setOpenLoadingModal();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.progress_timeout_id);
  }

  setOpenModal = (
    modal_type,
    alert,
    disabled,
    cash_or_token,
    modal_width,
    remove_transition
  ) => {
    openModal(
      this,
      modal_type,
      alert,
      disabled,
      cash_or_token,
      modal_width,
      remove_transition
    );
    this.setState({
      modal_width: modal_width,
      remove_transition: remove_transition
    });
  };

  setCloseModal = () => {
    closeModal(this);
  };

  setOpenAlert = (
    alert,
    disabled,
    modal_width = "modal-50",
    remove_transition = false
  ) => {
    this.setOpenModal(
      "alert",
      alert,
      disabled,
      null,
      modal_width,
      remove_transition
    );
  };

  setCloseAlert = () => {
    closeAlert(this);
  };

  setOpenLoadingModal = () => {
    this.setOpenModal("loading_modal", "", false, null, "modal-50");
  };

  setOpenKeysModal = () => {
    this.setOpenModal("keys_modal", "", false, null, "modal-80", true);
    setTimeout(() => {
      this.setState({
        remove_transition: false
      });
    }, 300);
  };

  setOpenHistoryModal = () => {
    this.setOpenModal("history_modal", "", false, null, "modal-80");
  };

  setOpenSendModal = (cash_or_token, destination, paymentID, sendTo) => {
    this.setOpenModal("send_modal", "", false, cash_or_token, "modal-80");
    this.cash_or_token = cash_or_token;
    this.setState({
      button_disabled: true,
      send_disabled: false,
      sendTo: sendTo,
      destination: destination,
      paymentID: paymentID
    });
  };

  setCloseSendModal = () => {
    this.setState({
      modal: false
    });
    setTimeout(() => {
      this.setState({
        send_modal: false,
        mixinModal: false,
        remove_transition: false,
        modal_width: "modal-80",
        sendTo: "",
        destination: "",
        paymentID: ""
      });
    }, 300);
    setTimeout(() => {
      this.setState({
        button_disabled: false
      });
    }, 1000);
  };

  setCloseMyModal = () => {
    this.setState({
      modal: false,
      send_disabled: true
    });
    setTimeout(() => {
      this.setState({
        send_modal: false,
        address_modal: false,
        remove_transition: false,
        modal_width: ""
      });
    }, 300);
    setTimeout(() => {
      this.setState({
        button_disabled: false
      });
    }, 1000);
  };

  setOpenMixinModal = (alert, disabled) => {
    this.setOpenModal("mixin_modal", alert, disabled, null, "modal-80");
  };

  setOpenAddressModal = () => {
    this.setOpenModal("address_modal", "", false, null, "modal-80");
  };

  setOpenConfirmModal = (alert, disabled, remove_transition = false) => {
    this.setOpenModal(
      "confirm_modal",
      alert,
      disabled,
      null,
      "modal-80",
      remove_transition
    );
  };

  goToPage = page => {
    if (this.state.page !== "wallet") {
      this.setState({ page: page, button_disabled: false });
    } else {
      this.setOpenAlert("Logging out...", true);
      this.setState({ keys_modal: false });
      localStorage.clear();
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
          // console.log(wallet.addressBook_GetAll());
          // console.log(
          //   wallet.addressBook_AddRow(
          //     "SFXtzT73mu21A2j3jYjwt15YXPQxgGXm2Edy18JGAGaHaaBeCZmiENLEoExHKAfqPrW1Cvh3xgim7Po2iDWMiYqb9BMc8BbTFNo",
          //     "ec1f6d9581bb3c5ea7d5c6fd665617328cbf43b420820eb16a23d729905d1f4b",
          //     "duckaj ga"
          //   )
          // );
          // console.log(wallet.addressBook_DeleteRow(0));
          // console.log(
          //   wallet.addressBook_LookupPID(
          //     "ec1f6d9581bb3c5ea7d5c6fd665617328cbf43b420820eb16a23d729905d1f4b"
          //   )
          // );
          // console.log(
          //   wallet.addressBook_LookupPID(
          //     "ec1f6d9581bb3c5ea7d5c6fd665617328cbf43b420820eb16a23d729905d1f4a"
          //   )
          // );
          // console.log(wallet.addressBook_ErrorString());
          // console.log(wallet.addressBook_GetAll());
          if (createWalletFunctionType === "openWallet") {
            this.refreshProgressInterval(100);
          } else {
            this.refreshProgressInterval(1000);
          }
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
          this.setOpenAlert("Error with the creation of the wallet " + err);
          return callback;
        });
    } catch (e) {
      this.setOpenAlert("Error with the creation of the wallet " + e);
      return callback;
    }
  };

  refreshProgressInterval = timeout => {
    let wallet = this.wallet_meta;
    let blockchainHeight = wallet.blockchainHeight();
    const progress = percentCalculation(blockchainHeight, this.daemon_height);

    if (!this.daemon_height) {
      this.daemon_height = wallet.daemonBlockchainHeight();
    }

    this.setState({ progress });
    if ((this.daemon_height > 0 && progress < 100) || progress === Infinity) {
      this.progress_timeout_id = setTimeout(
        this.refreshProgressInterval,
        timeout
      );
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
    this.setWalletData();
    this.setState({
      page: "wallet",
      loading_modal: false
    });
  };

  setWalletData = () => {
    let wallet = this.wallet_meta;
    this.setState({
      wallet: {
        filepath: localStorage.getItem("wallet_path"),
        wallet_address: wallet.address(),
        pub_spend: wallet.publicSpendKey(),
        spend_key: wallet.secretSpendKey(),
        pub_view: wallet.publicViewKey(),
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
      },
      history: wallet.history().reverse(),
      address_book: wallet.addressBook_GetAll()
    });
    this.fetchPrice();
  };

  onCopy = () => {
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 3000);
  };

  refreshCallback = () => {
    console.log("Wallet refreshed");
    let wallet = this.wallet_meta;

    let syncedHeight =
      wallet.daemonBlockchainHeight() - wallet.blockchainHeight() < 10;
    if (syncedHeight) {
      console.log("syncedHeight up to date...");
      if (wallet.synchronized()) {
        console.log("refreshCallback wallet synchronized, setting state...");
        this.setWalletData();
      }
    }

    wallet
      .store()
      .then(() => {
        console.log("Wallet stored");
      })
      .catch(e => {
        this.setOpenAlert("Unable to store wallet: " + e);
        console.log("Unable to store wallet: " + e);
      });
  };

  rescanBalance = () => {
    let wallet = this.wallet_meta;
    console.log(wallet);
    this.setOpenAlert(
      "Please wait while blockchain is being rescanned. Don't close the application until the process is complete. This can take a while, please be patient.",
      true
    );
    wallet.off("updated");
    wallet.off("refreshed");
    setTimeout(() => {
      console.log("Starting blockchain rescan sync...");
      wallet.rescanBlockchain();
      console.log("Blockchain rescan executed...");
      setTimeout(() => {
        console.log("Rescan setting callbacks");
        this.setWalletData();
        this.setOpenAlert("Wallet rescan completed.");
        this.setState({
          loading_modal: false,
          keys_modal: false,
          button_disabled: false
        });
        wallet
          .store()
          .then(() => {
            console.log("Wallet stored");
          })
          .catch(e => {
            console.log("Unable to store wallet: " + e);
          });
        wallet.on("refreshed", this.refreshCallback);
      }, 1000);
    }, 1000);
  };

  fetchPrice = () => {
    axios({
      method: "get",
      url: "https://api.coingecko.com/api/v3/coins/safex-cash"
    })
      .then(res => {
        var sfx_price = parseFloat(
          res.data.market_data.current_price.usd
        ).toFixed(8);
        this.setState({ sfx_price });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  renderPageWrapper = (title, version, page, page_type, icon) => {
    return (
      <div className={"item-wrap " + page_type}>
        <Header
          page={this.state.page}
          goToPage={this.goToPage}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img src={icon} className="item-pic" alt={icon} />
          <h2>
            {title}&nbsp;
            <span>{version}</span>
          </h2>
          <div className="login-wrap">{page}</div>
        </div>
        <p className={this.state.copied ? "copied-text active" : "copied-text"}>
          Copied to clipboard
        </p>
        <Modal
          page={this.state.page}
          modal={this.state.modal}
          wallet={this.state.wallet}
          walletMeta={this.wallet_meta ? this.wallet_meta : ""}
          setWalletData={this.setWalletData}
          env={this.env}
          progress={this.state.progress}
          loadingModal={this.state.loading_modal}
          createWallet={this.createWallet}
          closeModal={this.setCloseModal}
          keysModal={this.state.keys_modal}
          history={this.state.history}
          historyModal={this.state.history_modal}
          sendModal={this.state.send_modal}
          setOpenSendModal={this.setOpenSendModal}
          sendTo={this.state.sendTo}
          destination={this.state.destination}
          paymentID={this.state.paymentID}
          sendDisabled={this.state.send_disabled}
          setCloseSendModal={this.setCloseSendModal}
          setCloseMyModal={this.setCloseMyModal}
          availableCash={
            this.state.wallet ? this.state.wallet.unlocked_balance : ""
          }
          availableTokens={
            this.state.wallet ? this.state.wallet.unlocked_tokens : ""
          }
          cash_or_token={this.cash_or_token}
          mixinModal={this.state.mixin_modal}
          setOpenMixinModal={this.setOpenMixinModal}
          setOpenKeysModal={this.setOpenKeysModal}
          addressModal={this.state.address_modal}
          setOpenConfirmModal={this.setOpenConfirmModal}
          confirmModal={this.state.confirm_modal}
          alert={this.state.alert}
          closeAlert={this.setCloseAlert}
          setOpenAlert={this.setOpenAlert}
          alertText={this.state.alert_text}
          alertCloseDisabled={this.state.alert_close_disabled}
          onCopy={this.onCopy}
          rescanBalance={this.rescanBalance}
          removeTransition={this.state.remove_transition}
          modalWidth={this.state.modal_width}
          addressBook={this.state.address_book}
        />
      </div>
    );
  };

  render() {
    let page = null;
    let page_type = null;
    let version = null;
    let title = null;
    let icon = null;

    switch (this.state.page) {
      case "wallet":
        title = "Wallet";
        version = remote.app.getVersion();
        icon = "images/create-new.png";
        page_type = "wallet-wrap";
        page = (
          <Wallet
            env={this.env}
            goToPage={this.goToPage}
            wallet={this.state.wallet}
            walletMeta={this.wallet_meta}
            setWalletData={this.setWalletData}
            setOpenAlert={this.setOpenAlert}
            buttonDisabled={this.state.button_disabled}
            setOpenLoadingModal={this.setOpenLoadingModal}
            setOpenSendModal={this.setOpenSendModal}
            setOpenHistoryModal={this.setOpenHistoryModal}
            setOpenAddressModal={this.setOpenAddressModal}
            setCloseModal={this.setCloseModal}
            closeAlert={this.setCloseAlert}
            onCopy={this.onCopy}
            refreshCallback={this.refreshCallback}
            sfxPrice={this.state.sfx_price}
          />
        );
        break;
      case "create-new":
        title = "Create New Wallet";
        icon = "images/create-new.png";
        page_type = "create-new-wrap";
        page = (
          <CreateNew
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
            buttonDisabled={this.state.button_disabled}
          />
        );
        break;
      case "create-from-keys":
        title = "Create New Wallet From Keys";
        icon = "images/new-from-keys.png";
        page_type = "create-from-keys-wrap";
        page = (
          <CreateFromKeys
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
            buttonDisabled={this.state.button_disabled}
          />
        );
        break;
      case "open-file":
        title = "Open Wallet";
        icon = "images/open-wallet-file.png";
        page_type = "open-file-wrap";
        page = (
          <OpenFile
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
            buttonDisabled={this.state.button_disabled}
          />
        );
        break;
      case "recover-from-mnemonic":
        title = "Recover Wallet From Mnemonic Seed";
        icon = "images/mnemonic.png";
        page_type = "mnemonic-wrap";
        page = (
          <RecoverFromMnemonic
            env={this.env}
            goToPage={this.goToPage}
            createWallet={this.createWallet}
            config={this.state.config}
            setOpenAlert={this.setOpenAlert}
            setCloseAlert={this.setCloseAlert}
            buttonDisabled={this.state.button_disabled}
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
                  className="item animated fadeInDownSmall"
                  onClick={() => this.goToPage("create-new")}
                >
                  <img src="images/create-new.png" alt="create-new" />
                  <h3>Create New Wallet</h3>
                </div>
                <div
                  className="item animated fadeInDownSmall"
                  onClick={() => this.goToPage("create-from-keys")}
                >
                  <img src="images/new-from-keys.png" alt="new-from-keys" />
                  <h3>New Wallet From Keys</h3>
                </div>
                <div
                  className="item animated fadeInDownSmall"
                  onClick={() => this.goToPage("open-file")}
                >
                  <img
                    src="images/open-wallet-file.png"
                    alt="open-wallet-file"
                  />
                  <h3>Open Wallet</h3>
                </div>
                <div
                  className="item animated fadeInDownSmall"
                  onClick={() => this.goToPage("recover-from-mnemonic")}
                >
                  <img src="images/mnemonic.png" alt="mnemonic" />
                  <h3>Recover Wallet</h3>
                </div>
              </div>
            </div>
            <Modal
              page={this.state.page}
              modal={this.state.modal}
              env={this.env}
              wallet={this.state.wallet}
              walletMeta={this.wallet_meta ? this.wallet_meta : ""}
              setWalletData={this.setWalletData}
              progress={this.state.progress}
              loadingModal={this.state.loading_modal}
              createWallet={this.createWallet}
              closeModal={this.setCloseModal}
              keysModal={this.state.keys_modal}
              history={this.state.history}
              historyModal={this.state.history_modal}
              sendModal={this.state.send_modal}
              setOpenSendModal={this.setOpenSendModal}
              sendTo={this.state.sendTo}
              destination={this.state.destination}
              paymentID={this.state.paymentID}
              setCloseSendModal={this.setCloseSendModal}
              sendDisabled={this.state.send_disabled}
              setCloseMyModal={this.setCloseMyModal}
              availableCash={
                this.state.wallet ? this.state.wallet.unlocked_balance : ""
              }
              availableTokens={
                this.state.wallet ? this.state.wallet.unlocked_tokens : ""
              }
              cash_or_token={this.cash_or_token}
              mixinModal={this.state.mixin_modal}
              setOpenMixinModal={this.setOpenMixinModal}
              setOpenKeysModal={this.setOpenKeysModal}
              addressModal={this.state.address_modal}
              setOpenConfirmModal={this.setOpenConfirmModal}
              confirmModal={this.state.confirm_modal}
              alert={this.state.alert}
              closeAlert={this.setCloseAlert}
              setOpenAlert={this.setOpenAlert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
              onCopy={this.onCopy}
              rescanBalance={this.rescanBalance}
              removeTransition={this.state.remove_transition}
              modalWidth={this.state.modal_width}
              addressBook={this.state.address_book}
            />
          </div>
        );
    }

    return this.renderPageWrapper(title, version, page, page_type, icon);
  }
}
