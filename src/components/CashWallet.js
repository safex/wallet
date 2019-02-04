import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import Modal from "./partials/Modal";
import Header from "./partials/Header";
import { openModal, closeModal } from "../utils/utils.js";
import Wallet from "./Wallet";
import Switch from "react-switch";

const safex = window.require("safex-nodejs-libwallet");

export default class CashWallet extends React.Component {
  constructor(props) {
    console.error(process.env.REACT_APP_TEST);
    super(props);
    this.state = {
      wallet: null,
      local_wallet: JSON.parse(localStorage.getItem("wallet")),
      page: null,
      config: { network: "mainnet", daemonAddress: "rpc.safex.io:17402" },
      alert: false,
      alert_text: "",
      alert_close_disabled: false,
      network: true
    };
  }

  componentDidMount() {
    if (this.state.local_wallet) {
      var i;
      for (i = 0; i <= 1; i++) {
        this.setOpenModal("loading_modal", "", false, null);
      }
    }
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
        this.setCloseModal();
      }, 1000);
    }
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

  toggleNetwork = () => {
    this.setState(() => ({
      network: !this.state.network,
      config: this.state.network
        ? {
            network: "testnet",
            daemonAddress: "192.168.19.198:29393"
          }
        : {
            network: "mainnet",
            daemonAddress: "rpc.safex.io:17402"
          }
    }));
  };

  renderPageWrapper = (title, page, icon) => {
    return (
      <div className="item-wrap create-new-wrap">
        <Header
          goToPage={this.goToPage}
          alertCloseDisabled={this.state.alert_close_disabled}
        />
        <div className="item-inner">
          <img src={icon} className="item-pic" role="presentation" />
          <h2>{title}</h2>
          <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 login-wrap login-wrap">
            {page && this.state.page !== "wallet" && (
              <div className="toggle-wrap">
                <label className="net-label">Network Select:</label>

                <span>Testnet</span>
                <Switch
                  checked={this.state.network}
                  onChange={this.toggleNetwork}
                  onColor="#86d3ff"
                  onHandleColor="#2693e6"
                  handleDiameter={30}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={48}
                  className="react-switch"
                  id="material-switch"
                />
                <span>Mainnet</span>
              </div>
            )}
            {page}
          </div>
        </div>
        <Modal
          modal={this.state.modal}
          wallet={this.state.wallet}
          loadingModal={this.state.loading_modal}
          createWallet={this.createWallet}
          closeModal={this.setCloseModal}
          addressModal={this.state.address_modal}
          openModal={this.setOpenModal}
          openAlert={this.state.alert}
          setOpenAlert={this.setOpenAlert}
          closeAlert={this.setCloseAlert}
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
            goToPage={this.goToPage}
            wallet={this.state.wallet}
            walletMeta={this.state.wallet_meta}
            setWalletData={this.setWalletData}
            setOpenAlert={this.setOpenAlert}
            setOpenAddressModal={this.setOpenAddressModal}
            closeModal={this.setCloseModal}
          />
        );
        break;
      case "create-new":
        title = "Create New Wallet File";
        icon = "images/create-new.png";
        page = (
          <CreateNew
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
              wallet={this.state.wallet}
              loadingModal={this.state.loading_modal}
              addressModal={this.state.address_modal}
              createWallet={this.createWallet}
              closeModal={this.setCloseModal}
              openModal={this.setOpenModal}
              openAlert={this.state.alert}
              setOpenAlert={this.setOpenAlert}
              closeAlert={this.setCloseAlert}
              alertText={this.state.alert_text}
              alertCloseDisabled={this.state.alert_close_disabled}
            />
          </div>
        );
    }

    return this.renderPageWrapper(title, page, icon);
  }
}
