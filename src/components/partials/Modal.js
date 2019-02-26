import React from "react";
import { addClass } from "../../utils/utils.js";

export default class LoadingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      wallet_path: localStorage.getItem("wallet_path"),
      address: "",
      amount: "",
      payment_id: "",
      tx_being_sent: false
    };
    this.mixin = 6;
  }

  componentDidMount() {
    if (this.state.wallet_path) {
      this.setState({
        filename: localStorage
          .getItem("wallet_path")
          .split("/")
          .pop()
      });
    }
  }

  loadPreviousWallet = e => {
    e.preventDefault();
    let wallet = JSON.parse(localStorage.getItem("wallet"));
    let password = JSON.parse(localStorage.getItem("password"));
    let path = this.state.wallet_path;
    let passwordInput = e.target.password.value;

    if (passwordInput === "") {
      this.props.setOpenAlert("Enter password for your wallet");
      return false;
    }
    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
      return false;
    }
    this.props.createWallet(
      "openWallet",
      {
        path: path,
        password: password,
        network: wallet.config.network,
        daemonAddress: wallet.config.daemonAddress
      },
      true
    );
    this.props.setOpenAlert("Loading wallet file, please wait...", true);
  };

  closeMyModal = () => {
    if (this.props.addressModal) {
      this.props.closeModal();
    } else {
      this.props.setCloseMyModal();
    }
    setTimeout(() => {
      this.setState({
        loaded: false,
        address: "",
        amount: "",
        payment_id: ""
      });
    }, 300);
  };

  loadWalletInfo = e => {
    e.preventDefault();
    let password = JSON.parse(localStorage.getItem("password"));
    let passwordInput = e.target.password.value;

    if (passwordInput === "") {
      this.props.setOpenAlert("Enter password for your wallet");
      console.log("Enter password for your wallet");
      return false;
    }
    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
      console.log("Wrong password");
      return false;
    }
    this.setState({ loaded: true });
  };

  inputOnChange = (target, e) => {
    this.setState({
      [target]: e.target.value
    });
  };

  sendCashOrToken = cash_or_token => {
    return e => {
      e.preventDefault();
      let sendingAddress = e.target.send_to.value;
      let amount = e.target.amount.value * 10000000000;
      let paymentid = e.target.paymentid.value;
      let mixin = this.mixin;
      if (sendingAddress === "") {
        this.props.setOpenAlert("Fill out all the fields", false);
        return false;
      }
      if (amount === "") {
        this.props.setOpenAlert("Enter amount", false);
        return false;
      }
      if (paymentid !== "") {
        this.setState(() => ({
          tx_being_sent: true
        }));
        this.sendTransaction({
          address: sendingAddress,
          amount: amount,
          paymentId: paymentid,
          tx_type: cash_or_token,
          mixin: mixin
        });
      } else {
        this.setState(() => ({
          tx_being_sent: true
        }));
        this.sendTransaction({
          address: sendingAddress,
          amount: amount,
          tx_type: cash_or_token,
          mixin: mixin
        });
      }
    };
  };

  sendTransaction = args => {
    let wallet = this.props.walletMeta;
    wallet
      .createTransaction(args)
      .then(tx => {
        let txId = tx.transactionsIds();
        console.log(args);
        tx.commit()
          .then(() => {
            this.closeMyModal();
            if (this.props.cash_or_token === 0) {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                  txId,
                false
              );
            } else {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your token transaction ID is: " +
                  txId,
                false
              );
            }
            this.setState(() => ({
              tx_being_sent: false
            }));
            setTimeout(() => {
              this.props.setWalletData(this.props.walletMeta);
            }, 300);
          })
          .catch(e => {
            this.setState(() => ({
              tx_being_sent: false
            }));
            this.props.setOpenAlert(
              "Error on commiting transaction: " + e,
              false
            );
          });
      })
      .catch(e => {
        this.setState(() => ({
          tx_being_sent: false
        }));
        if (e.startsWith("not enough outputs for specified ring size")) {
          this.props.setOpenMixinModal(
            "Couldn't create transaction: " + e,
            false
          );
        } else {
          this.props.setOpenAlert("Couldn't create transaction: " + e, false);
        }
      });
  };

  changeDefaultMixin = e => {
    e.preventDefault();
    let wallet = this.props.walletMeta;
    let mixin = e.target.mixin.value;
    try {
      if (mixin === "" || mixin === " ") {
        this.mixin = mixin;
        return false;
      }
      if (mixin <= 8) {
        this.mixin = mixin;
      } else {
        this.mixin = 6;
      }
      wallet.setDefaultMixin(parseFloat(mixin));
      console.log("mixin " + mixin);
      this.props.closeModal();
    } catch (err) {
      this.props.setOpenAlert(`${err}`);
    }
  };

  disableInputPaste = e => {
    e.preventDefault();
    return false;
  };

  render() {
    let modal;

    let mixin = [];
    for (var i = 0; i <= 8; i++) {
      mixin.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    mixin.reverse();

    if (this.props.loadingModal) {
      modal = (
        <div
          className={
            "loadingModal" + addClass(this.props.loadingModal, "active")
          }
        >
          <span className="close" onClick={this.props.closeModal}>
            X
          </span>
          <form onSubmit={this.loadPreviousWallet}>
            <label htmlFor="password">
              Enter password for {this.state.filename}:
            </label>
            <input name="password" type="password" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.props.closeModal}
            >
              Cancel
            </button>
            <button className="confirm-btn button-shine">Continue</button>
          </form>
        </div>
      );
    }
    if (this.props.addressModal) {
      modal = (
        <div
          className={
            "addressModal" + addClass(this.props.addressModal, "active")
          }
        >
          <span className="close" onClick={this.closeMyModal}>
            X
          </span>
          <form
            onSubmit={this.loadWalletInfo}
            className={this.state.loaded ? "hidden" : ""}
          >
            <label htmlFor="password">
              Enter password for {this.props.wallet.filename}:
            </label>
            <input name="password" type="password" className="pass-input" />
            <button
              type="button"
              className="cancel-btn button-shine"
              onClick={this.props.closeModal}
            >
              Cancel
            </button>
            <button className="confirm-btn button-shine">Continue</button>
          </form>

          <div className={this.state.loaded ? "address-inner-wrap" : "hidden"}>
            <h3>Address Info</h3>

            <label htmlFor="spend_key">Secret (Private) Spend Key</label>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret (private) spend key"
            />

            <label htmlFor="view_key">Secret (Private) View Key</label>
            <input
              type="text"
              name="view_key"
              defaultValue={this.props.wallet.view_key}
              placeholder="secret (private) view key"
            />

            <label className={this.props.wallet.mnemonic ? "" : "hidden"}>
              Wallet Mnemonic Seed
            </label>
            <textarea
              name="mnemonic"
              defaultValue={this.props.wallet.mnemonic}
              placeholder="mnemonic seed for your wallet"
              className={this.props.wallet.mnemonic ? "" : "hidden"}
              rows="3"
            />
          </div>
        </div>
      );
    }
    if (this.props.sendModal) {
      modal = (
        <div className={"sendModal" + addClass(this.props.sendModal, "active")}>
          <div className="sendModalInner">
            <span className="close" onClick={this.props.closeModal}>
              X
            </span>
            <div>
              {this.props.cash_or_token === 0 ? (
                <div className="available-wrap">
                  <span>Available Safex Cash: {this.props.availableCash} </span>
                </div>
              ) : (
                <div className="available-wrap">
                  <span>
                    Available Safex Tokens: {this.props.availableTokens}{" "}
                  </span>
                </div>
              )}
              {this.props.cash_or_token === 0 ? (
                <h3>Send Cash</h3>
              ) : (
                <h3>Send Tokens</h3>
              )}
              <form onSubmit={this.sendCashOrToken(this.props.cash_or_token)}>
                <label htmlFor="send_to">Destination</label>
                <textarea
                  name="send_to"
                  placeholder="Enter Destination Address"
                  rows="2"
                  value={this.state.address}
                  onChange={this.inputOnChange.bind(this, "address")}
                />
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter Amount"
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                />
                <label htmlFor="paymentid">(Optional) Payment ID</label>
                <input
                  name="paymentid"
                  placeholder="(optional) Payment ID"
                  value={this.state.payment_id}
                  onChange={this.inputOnChange.bind(this, "payment_id")}
                />
                <button
                  className="btn button-shine"
                  type="submit"
                  disabled={this.state.tx_being_sent ? "disabled" : ""}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    if (this.props.mixinModal) {
      modal = (
        <div className={"mixinModal" + addClass(this.props.alert, "active")}>
          <div className="mainAlertPopupInner">
            <p>
              There was a problem with transaction creation, there are not
              enough outputs in network history to create privacy ring
              signature. Current mixin level is {this.mixin}.
            </p>
            <p>
              Please lower your transaction mixin to proceed with transaction
              execution (default network mixin value is 6).
            </p>
            <form onSubmit={this.changeDefaultMixin}>
              <label htmlFor="mixin">Set Transaction Mixin (0-8)</label>
              <select className="button-shine" name="mixin">
                {mixin}
              </select>
              <button
                type="button"
                className="button-shine cancel"
                onClick={this.props.closeModal}
              >
                Cancel
              </button>
              <button type="submit" className="button-shine submit">
                Set
              </button>
            </form>
            <h4>
              *Lowering your transaction mixin lowers the privacy guarantees
            </h4>
            {this.props.alertCloseDisabled ? (
              <span className="hidden" />
            ) : (
              <span className="close" onClick={this.props.closeModal}>
                X
              </span>
            )}
          </div>
        </div>
      );
    }
    if (this.props.alert) {
      modal = (
        <div className={"alert" + addClass(this.props.alert, "active")}>
          <div className="mainAlertPopupInner">
            <p className={this.props.alertCloseDisabled ? "disabled" : ""}>
              {this.props.alertText}
            </p>
            <div
              className={
                this.props.progress && this.props.progress > 0
                  ? "progress"
                  : "hidden"
              }
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated active"
                role="progressbar"
                aria-valuenow={this.props.progress}
                aria-valuemin="10"
                aria-valuemax="100"
                style={{ width: this.props.progress + "%" }}
              />
            </div>
            {this.props.alertCloseDisabled ? (
              <span className="hidden" />
            ) : (
              <span className="close" onClick={this.props.closeModal}>
                X
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={"modal" + addClass(this.props.modal, "active")}>
          {modal}
        </div>

        {this.props.addressModal ? (
          <div
            className={"backdrop" + addClass(this.props.modal, "active")}
            onClick={this.closeMyModal}
          />
        ) : (
          <div
            className={"backdrop" + addClass(this.props.modal, "active")}
            onClick={this.props.alertCloseDisabled ? "" : this.props.closeModal}
          />
        )}
      </div>
    );
  }
}
