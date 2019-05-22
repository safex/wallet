import React from "react";
import axios from "axios";
import CreateNew from "./CreateNew";
import OpenFile from "./OpenFile";
import RecoverFromKeys from "./RecoverFromKeys";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import Modal from "./partials/Modal";
import Header from "./partials/Header";
import Sidebar from "./partials/Sidebar";
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
      history_modal: false,
      address_modal: false,
      confirm_modal: false,
      delete_modal: false,
      fee_modal: false,
      value: "",
      copied: false,
      info_text: "",
      remove_transition: false,
      modal_width: "",
      history: [],
      address_book: [],
      sidebar: false
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
    if (this.state.wallet.wallet_connected) {
      this.setOpenModal("send_modal", "", false, cash_or_token, "modal-80");
      this.cash_or_token = cash_or_token;
      this.setState({
        button_disabled: true,
        send_disabled: false,
        sendTo: sendTo,
        destination: destination,
        paymentID: paymentID
      });
    } else {
      this.setOpenAlert("No connection to daemon", false, "modal-80");
    }
  };

  setCloseSendModal = () => {
    if (this.state.address_modal && this.state.send_modal) {
      this.setState({
        send_modal: false,
        remove_transition: false,
        modal_width: "modal-80",
        sendTo: "",
        destination: "",
        paymentID: ""
      });
    } else {
      this.setState({
        modal: false
      });
      setTimeout(() => {
        this.setState({
          send_modal: false,
          confirm_modal: false,
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
    }
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
        confirm_modal: false,
        fee_modal: false,
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

  setOpenDeleteModal = () => {
    this.setOpenModal("delete_modal", "", false, null, "modal-80");
  };

  setOpenFeeModal = () => {
    this.setOpenModal("fee_modal", "", false, null, "modal-80");
  };

  goToPage = page => {
    if (this.state.page !== "wallet") {
      this.setState({ page: page, button_disabled: false });
    } else {
      this.setOpenAlert("Logging out...", true);
      this.setState({ keys_modal: false });
      localStorage.removeItem("filename");
      localStorage.removeItem("password");
      localStorage.removeItem("wallet");
      localStorage.removeItem("wallet_path");
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
                console.log("" + e);
                return false;
              });
          });
        })
        .catch(err => {
          this.setOpenAlert("" + err);
          return callback;
        });
    } catch (e) {
      this.setOpenAlert("" + e);
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
    this.setWalletHistory();
    this.setState({
      page: "wallet",
      loading_modal: false
    });
  };

  setWalletData = () => {
    let wallet = this.wallet_meta;
    let history = wallet.history();

    history.sort(function(a, b) {
      return parseFloat(b.timestamp) - parseFloat(a.timestamp);
    });

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
      }
    });
    this.fetchPrice();
  };

  setWalletHistory = () => {
    let wallet = this.wallet_meta;
    let history = wallet.history();

    history.sort(function(a, b) {
      return parseFloat(b.timestamp) - parseFloat(a.timestamp);
    });

    this.setState({
      history: history,
      address_book: wallet.addressBook_GetAll()
    });
  };

  onCopy = (infoText, timeout = 3000) => {
    this.setState({
      copied: true,
      info_text: infoText
    });
    setTimeout(() => {
      this.setState({ copied: false });
    }, timeout);
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
        this.setOpenAlert("" + e);
      });
  };

  rescanBalance = () => {
    if (this.state.wallet.wallet_connected) {
      let wallet = this.wallet_meta;
      console.log(wallet);
      this.setOpenAlert(
        "Please wait while blockchain is being rescanned. Don't close the application until the process is complete. This may take a while, please be patient.",
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
          this.setCloseAlert();
          this.onCopy("Rescan completed", 6000);
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
              console.log("" + e);
            });
          wallet.on("refreshed", this.refreshCallback);
        }, 1000);
      }, 1000);
    } else {
      this.setOpenAlert("No connection to daemon", false, "modal-80");
    }
  };

  fetchPrice = () => {
    axios({
      method: "get",
      url: "https://api.coingecko.com/api/v3/coins/safex-cash"
    })
      .then(res => {
        var sfx_price = parseFloat(
          res.data.market_data.current_price.usd
        ).toFixed(4);
        this.setState({ sfx_price });
      })
      .catch(function(error) {
        console.log(error);
      });

    axios({
      method: "get",
      url: "https://api.coingecko.com/api/v3/coins/safex-token"
    })
      .then(res => {
        var sft_price = parseFloat(
          res.data.market_data.current_price.usd
        ).toFixed(4);
        this.setState({ sft_price });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  renderPageWrapper = (title, page, page_type, icon) => {
    return (
      <div className={"item-wrap " + page_type}>
        <Header
          page={this.state.page}
          goToPage={this.goToPage}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img src={icon} className="item-pic" alt={icon} />
          <h2>{title}&nbsp;</h2>
          <div className="login-wrap">{page}</div>
        </div>
        <p className={this.state.copied ? "copied-text active" : "copied-text"}>
          <span>{this.state.info_text}</span>
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
          deleteModal={this.state.delete_modal}
          setOpenDeleteModal={this.setOpenDeleteModal}
          feeModal={this.state.fee_modal}
          setOpenFeeModal={this.setOpenFeeModal}
          sfxPrice={this.state.sfx_price ? this.state.sfx_price : ""}
          sftPrice={this.state.sft_price ? this.state.sft_price : ""}
        />

        <Sidebar
          wallet={this.state.wallet ? this.state.wallet : ""}
          walletMeta={this.wallet_meta ? this.wallet_meta : ""}
          sidebar={this.state.sidebar}
          toggleSidebar={this.toggleSidebar}
          onCopy={this.onCopy}
          setOpenAlert={this.setOpenAlert}
          addressBook={this.state.wallet ? this.state.address_book : ""}
          setWalletData={this.setWalletData}
          setWalletHistory={this.setWalletHistory}
          setOpenSendModal={this.setOpenSendModal}
          setOpenDeleteModal={this.setOpenDeleteModal}
          history={this.state.history}
        />
      </div>
    );
  };

  toggleSidebar = () => {
    this.setState({
      sidebar: !this.state.sidebar
    });
  };

  render() {
    let page = null;
    let page_type = null;
    let title = null;
    let icon = null;

    switch (this.state.page) {
      case "wallet":
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
            refreshCallback={this.refreshCallback}
            sfxPrice={this.state.sfx_price}
            sftPrice={this.state.sft_price}
            toggleSidebar={this.toggleSidebar}
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
        title = "Recover Wallet With Keys";
        icon = "images/new-from-keys.png";
        page_type = "create-from-keys-wrap";
        page = (
          <RecoverFromKeys
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
        title = "Recover Wallet With Seed Phrase";
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
            <Header
              page={this.state.page}
              goToPage={this.goToPage}
              alertCloseDisabled={this.state.alert_close_disabled}
            />
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
                  onClick={() => this.goToPage("create-from-keys")}
                >
                  <img src="images/new-from-keys.png" alt="new-from-keys" />
                  <h3>
                    Recover Wallet <br /> with Keys
                  </h3>
                </div>
                <div
                  className="item animated fadeInDownSmall"
                  onClick={() => this.goToPage("recover-from-mnemonic")}
                >
                  <img src="images/mnemonic.png" alt="mnemonic" />
                  <h3>
                    Recover Wallet <br /> with Seed Phrase
                  </h3>
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
              deleteModal={this.state.delete_modal}
              setOpenDeleteModal={this.setOpenDeleteModal}
              feeModal={this.state.fee_modal}
              setOpenFeeModal={this.setOpenFeeModal}
              sfxPrice={this.state.sfx_price ? this.state.sfx_price : ""}
              sftPrice={this.state.sft_price ? this.state.sft_price : ""}
            />

            <Sidebar
              wallet={this.state.wallet ? this.state.wallet : ""}
              walletMeta={this.wallet_meta ? this.wallet_meta : ""}
              sidebar={this.state.sidebar}
              toggleSidebar={this.toggleSidebar}
              onCopy={this.onCopy}
              addressBook={this.state.address_book}
              setOpenAlert={this.setOpenAlert}
              setWalletData={this.setWalletData}
              setWalletHistory={this.setWalletHistory}
              setOpenSendModal={this.setOpenSendModal}
              setOpenDeleteModal={this.setOpenDeleteModal}
              history={this.state.history}
            />
          </div>
        );
    }

    return this.renderPageWrapper(title, page, page_type, icon);
  }
}
