import React, { Component } from "react";
import { addClass, roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";

const { shell } = window.require("electron");
const safex = window.require("safex-nodejs-libwallet");

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = { tx_page: 0 };
    this.totalPages = Math.ceil(this.props.history.length / props.itemsPerPage);
  }

  firstPage = () => {
    this.setState({ tx_page: 0 });
  };

  previousPage = () => {
    if (this.state.tx_page >= 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page - 1 }));
    }
  };

  nextPage = () => {
    if (this.state.tx_page < this.totalPages - 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page + 1 }));
    }
  };

  lastPage = () => {
    this.setState({ tx_page: this.totalPages - 1 });
  };

  externalLink = txid => {
    if (process.env.NODE_ENV === "development") {
      shell.openExternal("http://178.128.89.114/search?value=" + txid);
    } else {
      shell.openExternal("http://explore.safex.io/search?value=" + txid);
    }
  };

  render() {
    const { tx_page } = this.state;
    const { itemsPerPage, history } = this.props;
    let options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    };

    return (
      <div>
        {this.props.history.length ? (
          history
            .slice(
              tx_page * itemsPerPage,
              tx_page * itemsPerPage + itemsPerPage
            )
            .map((txInfo, i) => {
              return (
                <div className="history-item" key={i}>
                  <div className="row">
                    <div className="col-xs-5 item-section">
                      <p className={txInfo.pending ? "hidden" : ""}>
                        <img
                          src={
                            txInfo.direction === "in"
                              ? "images/arrow-up.png"
                              : "images/arrow-down.png"
                          }
                          className="arrow-img"
                          alt="arrow-img"
                        />
                        <span
                          className={
                            txInfo.direction === "in" ? "green-text" : ""
                          }
                        >
                          {txInfo.direction === "in" ? "Received" : "Sent"}
                        </span>
                      </p>
                      <p className={txInfo.pending ? "yellow-text" : "hidden"}>
                        {txInfo.pending}
                      </p>
                      {roundAmount(txInfo.tokenAmount) === 0 ? (
                        <span
                          className={
                            txInfo.direction === "in" ? "green-text" : ""
                          }
                        >
                          {roundAmount(txInfo.amount)} SFX
                        </span>
                      ) : (
                        <span
                          className={
                            txInfo.direction === "in" ? "green-text" : ""
                          }
                        >
                          {roundAmount(txInfo.tokenAmount)} SFT
                        </span>
                      )}
                    </div>
                    <div className="col-xs-7 item-section">
                      <p className="text-right">
                        {"" +
                          new Date(txInfo.timestamp * 1000).toLocaleDateString(
                            "en-US",
                            options
                          )}
                      </p>
                      <p>Fee: {roundAmount(txInfo.fee)}</p>
                    </div>
                  </div>

                  <div className="tx-id-wrap">
                    <span>Transaction ID :</span>
                    <button
                      data-tip
                      data-for="link-tooptip"
                      className="tx-id"
                      onClick={this.externalLink.bind(this, txInfo.id)}
                    >
                      {txInfo.id}
                    </button>
                    <ReactTooltip id="link-tooptip">
                      <p>Show this transaction on Safex Blockchain Explorer</p>
                    </ReactTooltip>
                  </div>
                </div>
              );
            })
        ) : (
          <h5>No Transaction History</h5>
        )}

        {this.props.history.length ? (
          <div id="pagination">
            <button
              data-tip
              data-for="first-tooptip"
              className="first-page button-shine"
              onClick={this.firstPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousPage}>
              previus
            </button>
            <strong>
              page: {tx_page + 1} / {this.totalPages}
            </strong>{" "}
            <button className="button-shine" onClick={this.nextPage}>
              next
            </button>
            <button
              data-tip
              data-for="last-tooptip"
              className="last-page button-shine"
              onClick={this.lastPage}
            >
              <span>{">>"}</span>
            </button>
            <ReactTooltip id="last-tooptip">
              <p>Last Page</p>
            </ReactTooltip>
          </div>
        ) : (
          <div className="hidden" />
        )}
      </div>
    );
  }
}

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: localStorage.getItem("wallet_path"),
      filename: "",
      address: "",
      amount: "",
      payment_id: "",
      tx_being_sent: false,
      add_transition: false,
      remove_transition: false
    };
    this.mixin = 6;
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
    } else if (this.state.tx_being_sent) {
      this.props.setCloseSendModal();
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
      return false;
    }

    this.props.setOpenAddressModal();
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
        this.props.setOpenAlert("Fill out all the fields", false, "modal-60");
        return false;
      }
      if (amount === "") {
        this.props.setOpenAlert("Enter amount", false, "modal-60");
        return false;
      }
      if (isNaN(amount)) {
        this.props.setOpenAlert("Enter valid amount", false, "modal-60");
        return false;
      }
      if (
        process.env.NODE_ENV !== "development" &&
        !safex.addressValid(sendingAddress, "mainnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address", false, "modal-60");
        return false;
      }
      if (
        process.env.NODE_ENV === "development" &&
        !safex.addressValid(sendingAddress, "testnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address", false, "modal-60");
        return false;
      }
      if (
        (this.props.cash_or_token === 0 &&
          parseFloat(e.target.amount.value) + parseFloat(0.1) >
            this.props.availableCash) ||
        this.props.availableCash < parseFloat(0.1)
      ) {
        this.props.setOpenAlert(
          "Not enough available safex cash to complete the transaction",
          false,
          "modal-60"
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
              this.props.setOpenAlert(
                "Unable to create transaction id ",
                false,
                "modal-60"
              );
              return false;
            }
            if (this.props.cash_or_token === 0) {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your cash transaction ID is: " +
                txId,
                false,
                "modal-60"
              );
            } else {
              this.props.setOpenAlert(
                "Transaction commited successfully, Your token transaction ID is: " +
                txId,
                false,
                "modal-60"
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
          this.props.setOpenAlert(
            "Couldn't create transaction: " + e,
            false,
            "modal-60"
          );
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

  setRescanBalance = () => {
    this.setState({
      remove_transition: true
    });
    setTimeout(() => {
      this.props.rescanBalance();
    }, 300);
    setTimeout(() => {
      this.setState({
        loaded: false,
        remove_transition: false,
        add_transition: false
      });
    }, 600);
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
          <form
            onSubmit={
              this.props.page === "wallet"
                ? this.loadWalletInfo
                : this.loadPreviousWallet
            }
          >
            <label htmlFor="password">
              Enter password for {localStorage.getItem("filename")}:
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

          <div>
            <h3>Seed and Keys</h3>

            <div className="label-wrap">
              <div 
                data-tip
                data-for="mnemonic-tooptip" 
                className="button-shine question-wrap">
                <span>?</span>
              </div>
              <label
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
              <ReactTooltip place="right" id="mnemonic-tooptip">
                <p>
                  Mnemonic seed can be used to recover your wallet in case your
                  file gets lost or corrupted.
                </p>
                <p className="red-text">
                  Sharing this can and will result in total loss of your Safex
                  Cash and Safex Tokens.
                </p>
                <p className="blue-text">Write it down and keep is safe at all times.</p>
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
              <div
                data-tip
                data-for="pub-spend-tooptip"
                className="button-shine question-wrap">
                <span>?</span>
              </div>
              <label htmlFor="spend_key">
                Public Spend Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.pub_spend}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip place="right" id="pub-spend-tooptip">
                <p>
                  <span className="blue-text">Public Spend Key</span> and <span className="blue-text">Public View Key</span> are made to generate your address.
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
              <div
                data-tip
                data-for="sec-spend-tooptip"
                className="button-shine question-wrap">
                <span>?</span>
              </div>
              <label htmlFor="spend_key">
                Secret (Private) Spend Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.spend_key}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip place="right" id="sec-spend-tooptip">
                <p><span className="blue-text">Secret (Private) Spend Key</span> is used to sign your transactions.</p>
              </ReactTooltip>
            </div>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret (private) spend key"
            />

            <div className="label-wrap">
              <div
                data-tip
                data-for="pub-view-tooptip"
                className="button-shine question-wrap">
                <span>?</span>
              </div>
              <label htmlFor="pub_view">
                Public View Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.pub_view}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip place="right" id="pub-view-tooptip">
                <p>
                  <span className="blue-text">Public Spend Key</span> and <span className="blue-text">Public View Key</span> are made to generate your address.
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
              <div
                data-tip
                data-for="sec-view-tooptip"
                className="button-shine question-wrap">
                <span>?</span>
              </div>
              <label htmlFor="view_key">
                Secret (Private) View Key
              </label>
              <CopyToClipboard
                text={this.props.wallet.view_key}
                onCopy={this.props.onCopy}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
              <ReactTooltip place="right" id="sec-view-tooptip">
                <p>
                  <span className="blue-text">Secret (Private) View Key</span> can be used to view all transactions of the given
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
                onClick={this.setRescanBalance}
                disabled={this.props.wallet.wallet_connected ? "" : "disabled"}
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
                    <p>Payment ID is additional reference number</p>
                    <p>attached to the transaction.</p>
                    <p>It is given by exchanges and web</p>
                    <p>shops to differentiate and track</p>
                    <p>particular deposits and purchases.</p>
                    <p>It is not required for regular user transactions.</p>
                    <p>Payment ID format should be </p>
                    <p>16 or 64 Hex character string.</p>
                    <p>To generate your own random hex, visit:</p>
                    <p>
                      <span className="blue-text">
                        https://www.browserling.com/tools/random-hex
                      </span>
                    </p>
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
                  disabled={
                    this.state.tx_being_sent || this.props.sendDisabled
                      ? "disabled"
                      : ""
                  }
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
    if (this.props.historyModal) {
      modal = (
        <div
          className={
            "historyModal" + addClass(this.props.historyModal, "active")
          }
        >
          {this.props.alertCloseDisabled ? (
            <span className="hidden" />
          ) : (
            <span className="close" onClick={this.props.closeModal}>
              X
            </span>
          )}
          <div className="mainAlertPopupInner">
            {this.props.history.length ? (
              <div>
                <div
                  data-tip
                  data-for="tx-id-tooptip"
                  className="button-shine question-wrap"
                >
                  <span>?</span>
                </div>
                <ReactTooltip id="tx-id-tooptip">
                  <p>Each tranasction has a unique Transaction ID.</p>
                  <p>Transaction ID format is 64 Hex character string.</p>
                  <p>It can be used to track each individual</p>
                  <p>transaction on Safex Blockchain Explorer.</p>
                  <p className="blue-text">http://explore.safex.io/</p>
                </ReactTooltip>
              </div>
            ) : (
              <div className="hidden" />
            )}

            <h3>Transaction History</h3>
            <div id="history-wrap">
              <Transactions history={this.props.history} itemsPerPage={3} />
            </div>
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
        <div
          className={
            "modal" +
            addClass(this.props.modalWidth, this.props.modalWidth) +
            addClass(
              this.state.remove_transition || this.props.removeTransition,
              "remove_transition"
            ) +
            addClass(this.props.modal, "active")
          }
        >
          {modal}
        </div>

        {this.props.sendModal && this.props.alert === false ? (
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
