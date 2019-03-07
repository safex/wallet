import React from "react";
import { addClass } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";

const safex = window.require("safex-nodejs-libwallet");

export default class LoadingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      wallet_path: localStorage.getItem("wallet_path"),
      address: "",
      amount: "",
      payment_id: "",
      tx_being_sent: false,
      add_transition: false
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
    this.mixin = 6;
    console.log("reset mixin " + this.mixin);
    setTimeout(() => {
      this.setState({
        loaded: false,
        address: "",
        amount: "",
        payment_id: "",
        add_transition: false
      });
    }, 300);
  };

  loadWalletInfo = e => {
    e.preventDefault();
    let password = JSON.parse(localStorage.getItem("password"));
    let passwordInput = e.target.password.value;

    if (passwordInput !== password) {
      this.props.setOpenAlert("Wrong password");
      console.log("Wrong password");
      return false;
    }
    this.setState({ loaded: true });

    setTimeout(() => {
      this.setState({
        add_transition: true
      });
    }, 300);
  };

  inputOnChange = (target, e) => {
    this.setState({
      [target]: e.target.value
    });
  };

  sendCashOrToken = cash_or_token => {
    return e => {
      e.preventDefault();
      let sendingAddressInput = e.target.send_to.value;
      let sendingAddress = sendingAddressInput.replace(/\s+/g, "");
      let amount = parseFloat(e.target.amount.value) * 10000000000;
      let paymentid = e.target.paymentid.value;
      let mixin = this.mixin;
      if (sendingAddress === "") {
        this.props.setOpenAlert("Fill out all the fields");
        return false;
      }
      if (amount === "") {
        this.props.setOpenAlert("Enter amount");
        return false;
      }
      if (
        process.env.NODE_ENV !== "development" &&
        !safex.addressValid(sendingAddress, "mainnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address");
        return false;
      }
      if (
        process.env.NODE_ENV === "development" &&
        !safex.addressValid(sendingAddress, "testnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address");
        return false;
      }
      if (
        (this.props.cash_or_token === 0 &&
          parseFloat(e.target.amount.value) + parseFloat(0.1) >
            this.props.availableCash) ||
        this.props.availableCash < parseFloat(0.1)
      ) {
        this.props.setOpenAlert(
          "Not enough available safex cash to complete the transaction"
        );
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
            if (!txId) {
              this.props.setOpenAlert("Unable to create transaction id ");
              return false;
            }
            if (this.props.cash_or_token === 0) {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                  txId
              );
            } else {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your token transaction ID is: " +
                  txId
              );
            }
            this.setState(() => ({
              tx_being_sent: false
            }));
            setTimeout(() => {
              this.props.setWalletData();
              this.mixin = 6;
              console.log("reset mixin " + this.mixin);
            }, 300);
          })
          .catch(e => {
            this.setState(() => ({
              tx_being_sent: false
            }));
            this.props.setOpenAlert("Error on commiting transaction: " + e);
          });
      })
      .catch(e => {
        this.setState(() => ({
          tx_being_sent: false
        }));
        if (e.startsWith("not enough outputs for specified ring size")) {
          this.props.setOpenMixinModal("Couldn't create transaction: " + e);
          localStorage.setItem("args", JSON.stringify(args));
          console.log(JSON.parse(localStorage.getItem("args")));
        } else {
          this.props.setOpenAlert("Couldn't create transaction: " + e);
        }
      });
  };

  changeDefaultMixin = e => {
    e.preventDefault();
    let wallet = this.props.walletMeta;
    let mixin = parseFloat(e.target.mixin.value);
    let args = JSON.parse(localStorage.getItem("args"));
    try {
      this.mixin = mixin;
      wallet.setDefaultMixin(mixin);
      this.sendTransaction({
        address: args.address,
        amount: args.amount,
        tx_type: args.tx_type,
        paymentId: args.paymentId ? args.paymentId : "",
        mixin: this.mixin
      });
      this.props.closeModal();
      setTimeout(() => {
        localStorage.removeItem(args);
      }, 2000);
    } catch (err) {
      this.props.setOpenAlert(`${err}`);
    }
  };

  disableInputPaste = e => {
    e.preventDefault();
    return false;
  };

  connectionError = () => {
    this.props.setOpenAlert("Daemon connection error, please try again later ");
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
            <input
              name="password"
              type="password"
              className="pass-input login-input"
            />
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
            <h3>Seed and Keys</h3>

            <div className="label-wrap">
              <label
                data-tip
                data-for="mnemonic-tooptip"
                className={this.props.wallet.mnemonic ? "" : "hidden"}
              >
                Wallet Mnemonic Seed
              </label>
              <CopyToClipboard
                text={this.props.wallet.mnemonic}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip place="bottom" id="mnemonic-tooptip">
                <p>
                  Mnemonic seed can be used to recover your wallet in case your
                  file gets lost or corrupted.
                </p>
                <p className="red-text">
                  Sharing this can and will result in total loss of your Safex
                  Cash and Safex Tokens.
                </p>
                <p>Write it down and keep is safe at all times.</p>
              </ReactTooltip>
            </div>
            <textarea
              name="mnemonic"
              defaultValue={this.props.wallet.mnemonic}
              placeholder="mnemonic seed for your wallet"
              className={this.props.wallet.mnemonic ? "" : "hidden"}
              rows="2"
            />

            <div className="label-wrap">
              <label data-tip data-for="pub-spend-tooptip" htmlFor="spend_key">
                Public Spend Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.pub_spend}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip id="pub-spend-tooptip">
                <p>
                  Public Spend Key and Public View Key are made to generate your
                  address.
                </p>
              </ReactTooltip>
            </div>

            <input
              type="text"
              name="pub_spend"
              defaultValue={this.props.wallet.pub_spend}
              placeholder="public spend key"
            />

            <div className="label-wrap">
              <label data-tip data-for="sec-spend-tooptip" htmlFor="spend_key">
                Secret (Private) Spend Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.spend_key}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip id="sec-spend-tooptip">
                <p>Secret Spend Key is used to sign your transactions.</p>
              </ReactTooltip>
            </div>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret (private) spend key"
            />

            <div className="label-wrap">
              <label data-tip data-for="pub-view-tooptip" htmlFor="pub_view">
                Public View Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.pub_view}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip id="pub-view-tooptip">
                <p>
                  Public Spend Key and Public View Key are made to generate your
                  address.
                </p>
              </ReactTooltip>
            </div>
            <input
              type="text"
              name="pub_view"
              defaultValue={this.props.wallet.pub_view}
              placeholder="public view key"
            />

            <div className="label-wrap">
              <label data-tip data-for="sec-view-tooptip" htmlFor="view_key">
                Secret (Private) View Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.view_key}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip id="sec-view-tooptip">
                <p>
                  Secret view can be used to view all transactions of the given
                  address.
                </p>
              </ReactTooltip>
            </div>
            <input
              type="text"
              name="view_key"
              defaultValue={this.props.wallet.view_key}
              placeholder="secret (private) view key"
            />

            <div className="button-wrap">
              <p>
                Rescan blockchain from the begining. This is performed when your
                wallet file is created. Use this if you suspect your wallet file
                is corrupted or missing data. It may take a lot of time to
                complete.
              </p>
              <button
                className="button-shine rescan"
                onClick={this.props.wallet.wallet_connected ? this.props.rescanBalance : this.connectionError}
                // disabled={this.props.wallet.wallet_connected ? "" : "disabled"}
              >
                Rescan
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (this.props.sendModal) {
      modal = (
        <div className={"sendModal" + addClass(this.props.sendModal, "active")}>
          <div className="sendModalInner">
            <span className="close" onClick={this.closeMyModal}>
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
                <label htmlFor="amount">
                  Amount
                  {this.props.cash_or_token === 1 ? (
                    <div
                      data-tip
                      data-for="amount-tooptip"
                      className="button-shine question-wrap"
                    >
                      <span>?</span>
                    </div>
                  ) : (
                    <div className="hidden" />
                  )}
                  <ReactTooltip id="amount-tooptip">
                    <p>Token transaction does not accept decimal values.</p>
                  </ReactTooltip>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter Amount"
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                  onPaste={this.disableInputPaste}
                />
                <label htmlFor="paymentid">
                  (Optional) Payment ID
                  <div
                    data-tip
                    data-for="paymentid-tooptip"
                    className="button-shine question-wrap"
                  >
                    <span>?</span>
                  </div>
                  <ReactTooltip id="paymentid-tooptip">
                    <p>
                      Payment ID is additional reference number attached to the
                      transaction.
                    </p>
                    <p>
                      It is given by exchanges and web shops to differentiate
                    </p>
                    <p>
                      and track particular deposits and purchases.
                    </p>
                    <p>It is not required for regular user transactions.</p>
                  </ReactTooltip>
                </label>
                <input
                  name="paymentid"
                  placeholder="(Optional) Payment ID"
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
              signature.
            </p>
            <p>
              Please lower your transaction mixin to proceed with transaction
              execution (default network mixin value is {this.mixin}).
            </p>
            <form onSubmit={this.changeDefaultMixin}>
              <label htmlFor="mixin">Set Transaction Mixin (0-8)</label>
              <select
                className="button-shine"
                name="mixin"
                defaultValue={this.mixin}
              >
                {mixin}
              </select>
              <button
                type="button"
                className="cancel-btn button-shine"
                onClick={this.props.closeModal}
              >
                Cancel
              </button>
              <button type="submit" className="confirm-btn button-shine">
                Send
              </button>
            </form>
            <h4>*Lowering your transaction mixin may harm your privacy</h4>
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
                aria-valuemin="100"
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
        {this.state.loaded ? (
          <div
            className={
              "modal modal-70" +
              addClass(this.state.add_transition, "add_transition") +
              addClass(this.props.modal, "active")
            }
          >
            {modal}
          </div>
        ) : (
          <div
            className={"modal modal-50" + addClass(this.props.modal, "active")}
          >
            {modal}
          </div>
        )}

        {(this.props.addressModal ||
          (this.props.sendModal && this.props.mixinModal === false)) &&
        this.props.alert === false ? (
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
