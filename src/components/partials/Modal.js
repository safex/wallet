import React, { Component } from "react";
import { addClass, roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import * as crypto from "crypto";

const { shell } = window.require("electron");
const safex = window.require("safex-nodejs-libwallet");
const fileDownload = require("react-file-download");

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = { tx_page: 0 };
    this.totalTxPages = Math.ceil(
      this.props.history.length / props.itemsPerPage
    );
  }

  firstTxPage = () => {
    this.setState({ tx_page: 0 });
  };

  previousTxPage = () => {
    if (this.state.tx_page >= 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page - 1 }));
    }
  };

  nextTxPage = () => {
    if (this.state.tx_page < this.totalTxPages - 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page + 1 }));
    }
  };

  lastTxPage = () => {
    this.setState({ tx_page: this.totalTxPages - 1 });
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
                              ? "images/arrow-down.png"
                              : "images/arrow-up.png"
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
                            txInfo.direction === "in"
                              ? "green-text amount"
                              : "amount"
                          }
                        >
                          SFX {roundAmount(txInfo.amount)}
                        </span>
                      ) : (
                        <span
                          className={
                            txInfo.direction === "in"
                              ? "green-text amount"
                              : "amount"
                          }
                        >
                          SFT {roundAmount(txInfo.tokenAmount)}
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
                      <p className={txInfo.direction === "in" ? "hidden" : ""}>
                        Fee: SFX {roundAmount(txInfo.fee)}
                      </p>
                    </div>
                  </div>

                  <div className="tx-id-wrap">
                    <span>Transaction ID:</span>
                    <button
                      data-tip
                      data-for="link-tooptip"
                      className="tx-id"
                      onClick={this.externalLink.bind(this, txInfo.id)}
                    >
                      {txInfo.id}
                    </button>
                    <ReactTooltip id="link-tooptip">
                      <p>
                        Show this transaction on{" "}
                        <span className="blue-text">
                          Safex Blockchain Explorer
                        </span>
                      </p>
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
              onClick={this.firstTxPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousTxPage}>
              previous
            </button>
            <strong>
              page: {tx_page + 1} / {this.totalTxPages}
            </strong>{" "}
            <button className="button-shine" onClick={this.nextTxPage}>
              next
            </button>
            <button
              data-tip
              data-for="last-tooptip"
              className="last-page button-shine"
              onClick={this.lastTxPage}
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

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = { contact_page: 0 };
    this.totalContactPages = Math.ceil(
      this.props.contacts.length / props.itemsPerContactPage
    );
  }

  firstContactPage = () => {
    this.setState({ contact_page: 0 });
  };

  previousContactPage = () => {
    if (this.state.contact_page >= 1) {
      this.setState(prevState => ({
        contact_page: prevState.contact_page - 1
      }));
    }
  };

  nextContactPage = () => {
    if (this.state.contact_page < this.totalContactPages - 1) {
      this.setState(prevState => ({
        contact_page: prevState.contact_page + 1
      }));
    }
  };

  lastContactPage = () => {
    this.setState({ contact_page: this.totalContactPages - 1 });
  };

  removeContact = rowID => {
    this.props.setOpenDeleteModal();
    localStorage.setItem("rowID", rowID);
  };

  render() {
    const { contact_page } = this.state;
    const { itemsPerContactPage, contacts } = this.props;

    return (
      <div>
        {this.props.contacts.length ? (
          contacts
            .slice(
              contact_page * itemsPerContactPage,
              contact_page * itemsPerContactPage + itemsPerContactPage
            )
            .map((contact, i) => {
              return (
                <div className="contact-item" key={i}>
                  <div className="contact-left">
                    <p className="name">{contact.description}</p>
                    <p className="payment-id">Payment ID:</p>
                  </div>

                  <div className="contact-center">
                    <p className="address">{contact.address}</p>
                    <p className="payment-id">{contact.paymentId}</p>
                  </div>

                  <div className="contact-right">
                    <CopyToClipboard
                      text={contact.address}
                      onCopy={this.props.onCopy.bind(
                        this,
                        "Copied to clipboard",
                        3000
                      )}
                      data-tip
                      data-for="copy-tooptip"
                      className="button-shine copy-btn"
                    >
                      <button>
                        <img src="images/copy.png" alt="copy" />
                      </button>
                    </CopyToClipboard>
                    <ReactTooltip id="copy-tooptip">
                      <p>Copy Address</p>
                    </ReactTooltip>
                    <button
                      onClick={this.removeContact.bind(this, contact.rowID)}
                      data-tip
                      data-for="remove-tooptip"
                      className="button-shine"
                    >
                      <img src="images/trash.png" alt="trash" />
                    </button>
                    <ReactTooltip id="remove-tooptip">
                      <p>Remove Contact</p>
                    </ReactTooltip>
                    <button
                      onClick={this.props.setOpenSendModal.bind(
                        this,
                        0,
                        contact.address,
                        contact.paymentId,
                        contact.description
                      )}
                      data-tip
                      data-for="send-cash-tooltip"
                      className="button-shine"
                    >
                      <img src="images/send-cash.png" alt="send-cash" />
                    </button>
                    <ReactTooltip id="send-cash-tooltip">
                      <p>Send Safex Cash To This Address</p>
                    </ReactTooltip>
                    <button
                      onClick={this.props.setOpenSendModal.bind(
                        this,
                        1,
                        contact.address,
                        contact.paymentId,
                        contact.description
                      )}
                      data-tip
                      data-for="send-token-tooltip"
                      className="button-shine"
                    >
                      <img src="images/send-token.png" alt="send-token" />
                    </button>
                    <ReactTooltip id="send-token-tooltip">
                      <p>Send Safex Token To This Address</p>
                    </ReactTooltip>
                  </div>
                </div>
              );
            })
        ) : (
          <h5>No Contacts</h5>
        )}

        {this.props.contacts.length ? (
          <div id="pagination">
            <button
              data-tip
              data-for="first-tooptip"
              className="first-page button-shine"
              onClick={this.firstContactPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousContactPage}>
              previous
            </button>
            <strong>
              page: {contact_page + 1} / {this.totalContactPages}
            </strong>{" "}
            <button className="button-shine" onClick={this.nextContactPage}>
              next
            </button>
            <button
              data-tip
              data-for="last-tooptip"
              className="last-page button-shine"
              onClick={this.lastContactPage}
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

export default class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: localStorage.getItem("wallet_path"),
      filename: "",
      address: "",
      amount: "",
      payment_id: "",
      send_tx_disabled: false,
      tx_being_sent: false,
      add_transition: false,
      remove_transition: false,
      show_contacts: true,
      new_address: "",
      new_payment_id: "",
      name: "",
      fee: 0,
      mixin: 6,
      advanced_options: false
    };
    this.tx = null;
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
    this.setState(() => ({
      send_tx_disabled: true
    }));
    if (
      this.props.keysModal ||
      this.props.deleteModal ||
      this.props.historyModal ||
      this.props.feeModal ||
      this.props.loadingModal ||
      this.props.alert ||
      (this.props.sendModal && this.props.alert) ||
      (this.props.addressModal && this.props.alert) ||
      (this.props.loadingModal && this.props.alert)
    ) {
      this.props.closeModal();
      this.setState({
        send_tx_disabled: false
      });
      return false;
    } else if (
      this.props.sendModal &&
      this.props.addressModal &&
      this.props.confirmModal === false
    ) {
      this.props.setCloseSendModal();
    } else {
      this.props.setCloseMyModal();
    }
    localStorage.removeItem("tx");
    localStorage.removeItem("txId");
    localStorage.removeItem("paymentId");
    setTimeout(() => {
      this.setState({
        show_contacts: true,
        loaded: false,
        address: "",
        amount: "",
        payment_id: "",
        new_address: "",
        new_payment_id: "",
        name: "",
        add_transition: false,
        send_tx_disabled: false,
        mixin: 6,
        advanced_options: false
      });
      console.log("reset mixin. Current mixin: " + this.state.mixin);
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
    this.props.setOpenKeysModal();
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
      let paymentidInput = paymentid.replace(/\s+/g, "");
      let mixin = parseFloat(e.target.mixin.value);

      if (sendingAddress === "") {
        this.props.setOpenAlert("Fill out all the fields", false, "modal-80");
        return false;
      }
      if (amount === "") {
        this.props.setOpenAlert("Enter amount", false, "modal-80");
        return false;
      }
      if (isNaN(amount)) {
        this.props.setOpenAlert("Enter valid amount", false, "modal-80");
        return false;
      }
      if (
        process.env.NODE_ENV !== "development" &&
        !safex.addressValid(sendingAddress, "mainnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address", false, "modal-80");
        return false;
      }
      // if (
      //   process.env.NODE_ENV === "development" &&
      //   !safex.addressValid(sendingAddress, "testnet")
      // ) {
      //   this.props.setOpenAlert("Enter valid Safex address", false, "modal-80");
      //   return false;
      // }
      if (
        (this.props.cash_or_token === 0 &&
          parseFloat(e.target.amount.value) + parseFloat(0.1) >
            this.props.availableCash) ||
        this.props.availableCash < parseFloat(0.1)
      ) {
        this.props.setOpenAlert(
          "Not enough available Safex Cash to complete the transaction",
          false,
          "modal-80"
        );
        return false;
      }
      if (paymentidInput !== "") {
        if (paymentidInput.length !== 64) {
          this.props.setOpenAlert(
            "Payment ID should contain 64 characters",
            false,
            "modal-80"
          );
          return false;
        }
        this.setState({
          send_tx_disabled: true
        });
        this.sendTransaction({
          address: sendingAddress,
          amount: amount,
          tx_type: cash_or_token,
          paymentId: paymentidInput,
          mixin: mixin
        });
      } else {
        this.setState({
          send_tx_disabled: true
        });
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
        let fee = roundAmount(tx.fee());
        this.setState(() => ({
          fee: fee,
          send_tx_disabled: false
        }));
        this.tx = tx;
        this.props.setOpenFeeModal(false);
        localStorage.setItem("args", JSON.stringify(args));
        console.log(args);
      })
      .catch(e => {
        this.props.setOpenAlert("" + e, false, "modal-80");
        console.log("" + e);
      });
  };

  commitTx = e => {
    e.preventDefault();
    let tx = this.tx;
    let txId = tx.transactionsIds();

    this.setState(() => ({
      tx_being_sent: true,
      alert_close_disabled: true
    }));
    tx.commit()
      .then(() => {
        this.closeMyModal();
        if (!txId) {
          this.props.setOpenAlert(
            "Unable to create transaction id ",
            false,
            "modal-80",
            true
          );
          return false;
        }
        if (this.props.cash_or_token === 0) {
          this.props.setOpenConfirmModal(
            "Transaction commited successfully, Your cash transaction ID is: " +
              txId,
            false,
            "modal-80",
            true
          );
          this.tx = null;
        } else {
          this.props.setOpenConfirmModal(
            "Transaction commited successfully, Your token transaction ID is: " +
              txId,
            false,
            "modal-80",
            true
          );
          this.tx = null;
        }
        this.setState(() => ({
          tx_being_sent: false
        }));
        setTimeout(() => {
          this.props.setWalletData();
          this.setState({
            mixin: 6
          });
          console.log("reset mixin " + this.state.mixin);
          localStorage.removeItem("args");
        }, 300);
      })
      .catch(e => {
        this.setState(() => ({
          tx_being_sent: false
        }));
        this.props.setOpenAlert("" + e, false, "modal-80", true);
      });
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

  showContacts = () => {
    this.setState({
      show_contacts: !this.state.show_contacts
    });
  };

  addContact = e => {
    e.preventDefault();
    let wallet = this.props.walletMeta;
    let address = e.target.address.value;
    let addressInput = address.replace(/\s+/g, "");
    let paymentid = e.target.paymentid.value;
    let paymentidInput = paymentid.replace(/\s+/g, "");
    let name = e.target.name.value;

    if (addressInput === "" || paymentidInput === "" || name === "") {
      this.props.setOpenAlert("Fill out all the fields", false, "modal-80");
      return false;
    }
    if (
      process.env.NODE_ENV !== "development" &&
      !safex.addressValid(addressInput, "mainnet")
    ) {
      this.props.setOpenAlert("Enter valid Safex address", false, "modal-80");
      return false;
    }
    if (
      process.env.NODE_ENV === "development" &&
      !safex.addressValid(addressInput, "testnet")
    ) {
      this.props.setOpenAlert("Enter valid Safex address", false, "modal-80");
      return false;
    }
    if (
      wallet.addressBook_AddRow(addressInput, paymentidInput, name) === false
    ) {
      console.log(wallet);
      this.props.setOpenAlert(
        "" + wallet.addressBook_ErrorString(),
        false,
        "modal-80"
      );
      return false;
    }
    wallet.store();
    this.props.setOpenAlert("New contact added", false, "modal-80");
    setTimeout(() => {
      this.setState({
        new_address: "",
        new_payment_id: "",
        name: ""
      });
      this.props.setWalletData();
    }, 100);
  };

  genPaymentId = () => {
    let paymentID = crypto.randomBytes(32).toString("hex");

    this.setState({
      new_payment_id: paymentID
    });
  };

  removeContact = e => {
    e.preventDefault();
    let rowID = parseFloat(localStorage.getItem("rowID"));
    let wallet = this.props.walletMeta;
    wallet.addressBook_DeleteRow(rowID);
    this.props.setWalletData();
    wallet.store();
    localStorage.removeItem("rowID");
    this.props.setOpenAlert("Contact removed", false, "modal-80");
  };

  exportWallet = () => {
    var file_obj = "";

    file_obj += "Mnemonic Seed Phrase: " + this.props.wallet.mnemonic + "\n";
    file_obj +=
      "Secret (Private) View Key: " + this.props.wallet.view_key + "\n";
    file_obj += "Public View Key: " + this.props.wallet.pub_view + "\n";
    file_obj +=
      "Secret (Private) Spend Key: " + this.props.wallet.spend_key + "\n";
    file_obj += "Public Spend Key: " + this.props.wallet.pub_spend + "\n";
    file_obj += "Public Address: " + this.props.wallet.wallet_address + "\n";

    var date = Date.now();
    fileDownload(file_obj, date + "unsafe-sfxsft.txt");
  };

  showAdvancedOptions = () => {
    if (this.state.advanced_options) {
      this.setState({
        advanced_options: false
      });
    } else {
      this.setState({
        advanced_options: true
      });
    }
  };

  render() {
    let modal;
    let mixinArray = [];

    for (var i = 0; i <= 8; i++) {
      mixinArray.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    mixinArray.reverse();

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
    if (this.props.keysModal) {
      modal = (
        <div className={"keysModal" + addClass(this.props.keysModal, "active")}>
          <span className="close" onClick={this.closeMyModal}>
            X
          </span>

          <div>
            <h3>Seed and Keys</h3>

            <label htmlFor="filepath">Wallet File Path</label>
            <input
              type="text"
              name="filepath"
              defaultValue={this.props.wallet.filepath}
              placeholder="filepath"
              readOnly
            />

            <div className="label-wrap">
              <label className={this.props.wallet.mnemonic ? "" : "hidden"}>
                Wallet Mnemonic Seed
              </label>
              <div
                data-tip
                data-for="mnemonic-tooptip"
                className="button-shine question-wrap"
              >
                <span>?</span>
              </div>
              <ReactTooltip place="right" id="mnemonic-tooptip">
                <p>
                  <span className="blue-text">Mnemonic seed</span> can be used
                  to recover your{" "}
                </p>
                <p>wallet in case your file gets lost or corrupted.</p>
                <p className="mb-10">
                  It contains <span className="blue-text">24 or 25</span> words
                  and no numbers.
                </p>
                <p className="red-text">
                  Sharing it can and will result in total loss of
                </p>
                <p className="red-text mb-10">
                  your Safex Cash (SFX) and Safex Tokens (SFT).
                </p>
                <p className="blue-text">
                  Write it down and keep is safe at all times.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.mnemonic}
                onCopy={this.props.onCopy.bind(
                  this,
                  "Copied to clipboard",
                  3000
                )}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
            </div>
            <textarea
              name="mnemonic"
              defaultValue={this.props.wallet.mnemonic}
              placeholder="mnemonic seed for your wallet"
              className={this.props.wallet.mnemonic ? "" : "hidden"}
              rows="2"
              readOnly
            />

            <div className="label-wrap">
              <label htmlFor="view_key">Secret (Private) View Key</label>
              <div
                data-tip
                data-for="private-view-tooptip"
                className="button-shine question-wrap"
              >
                <span>?</span>
              </div>
              <ReactTooltip place="right" id="private-view-tooptip">
                <p>
                  All Wallet Keys should be a{" "}
                  <span className="blue-text">64 digit Hex</span>.
                </p>
                <p>
                  <span className="blue-text">Secret (Private) View Key</span>{" "}
                  can be used to view all transactions of the given address.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.view_key}
                onCopy={this.props.onCopy.bind(
                  this,
                  "Copied to clipboard",
                  3000
                )}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
            </div>
            <input
              type="text"
              name="view_key"
              defaultValue={this.props.wallet.view_key}
              placeholder="secret (private) view key"
              readOnly
            />

            <div className="label-wrap">
              <label htmlFor="pub_view">Public View Key</label>
              <div
                data-tip
                data-for="public-view-tooptip"
                className="button-shine question-wrap"
              >
                <span>?</span>
              </div>
              <ReactTooltip place="right" id="public-view-tooptip">
                <p>
                  <span className="blue-text">Public Spend Key</span> and{" "}
                  <span className="blue-text">Public View Key</span> are made to
                  generate your address.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.pub_view}
                onCopy={this.props.onCopy.bind(
                  this,
                  "Copied to clipboard",
                  3000
                )}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
            </div>
            <input
              type="text"
              name="pub_view"
              defaultValue={this.props.wallet.pub_view}
              placeholder="public view key"
              readOnly
            />

            <div className="label-wrap">
              <label htmlFor="spend_key">Secret (Private) Spend Key</label>
              <div
                data-tip
                data-for="secret-spend-tooptip"
                className="button-shine question-wrap"
              >
                <span>?</span>
              </div>
              <ReactTooltip place="right" id="secret-spend-tooptip">
                <p>
                  <span className="blue-text">Secret (Private) Spend Key</span>{" "}
                  is used to sign your transactions.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.spend_key}
                onCopy={this.props.onCopy.bind(
                  this,
                  "Copied to clipboard",
                  3000
                )}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
            </div>
            <input
              type="text"
              name="spend_key"
              defaultValue={this.props.wallet.spend_key}
              placeholder="secret (private) spend key"
              readOnly
            />

            <div className="label-wrap">
              <label htmlFor="spend_key">Public Spend Key</label>
              <div
                data-tip
                data-for="public-spend-tooptip"
                className="button-shine question-wrap"
              >
                <span>?</span>
              </div>
              <ReactTooltip place="right" id="public-spend-tooptip">
                <p>
                  <span className="blue-text">Public Spend Key</span> and{" "}
                  <span className="blue-text">Public View Key</span> are made to
                  generate your address.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.pub_spend}
                onCopy={this.props.onCopy.bind(
                  this,
                  "Copied to clipboard",
                  3000
                )}
                className="button-shine copy-btn"
              >
                <button>Copy</button>
              </CopyToClipboard>
            </div>
            <input
              type="text"
              name="pub_spend"
              defaultValue={this.props.wallet.pub_spend}
              placeholder="public spend key"
              readOnly
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
                readOnly
              >
                Rescan
              </button>
            </div>
            <div className="button-wrap">
              <p>
                Back up all keys to an unencrypted .txt file. This file is not
                for importing. Sharing this file can and will result in total
                loss of your Cash and Tokens. It is a very sensitive file, keep
                it safe at all times.
              </p>
              <button
                className="button-shine rescan"
                onClick={this.exportWallet}
                readOnly
              >
                Export
              </button>
            </div>
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
                <ReactTooltip place="right" id="tx-id-tooptip">
                  <p>
                    Each tranasction has a unique{" "}
                    <span className="blue-text">Transaction ID</span>.
                  </p>
                  <p className="mb-10">
                    Transaction ID format is{" "}
                    <span className="blue-text">64 digit Hex</span> character
                    string.
                  </p>
                  <p>It can be used to track each individual</p>
                  <p>
                    transaction on{" "}
                    <span className="blue-text">Safex Blockchain Explorer</span>
                    .
                  </p>
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
    if (this.props.addressModal) {
      modal = (
        <div
          className={
            "addressModal" + addClass(this.props.addressModal, "active")
          }
        >
          {this.props.alertCloseDisabled ? (
            <span className="hidden" />
          ) : (
            <span className="close" onClick={this.closeMyModal}>
              X
            </span>
          )}
          <div className="mainAlertPopupInner">
            <h3>Address Book</h3>

            <button
              id="show-contacts"
              onClick={this.showContacts}
              data-tip
              data-for="show-tooptip"
              className="button-shine"
            >
              <img
                src={
                  this.state.show_contacts
                    ? "images/new-contact.png"
                    : "images/address-book.png"
                }
                alt="address-book"
              />
            </button>
            <ReactTooltip place="right" id="show-tooptip">
              <p>
                {this.state.show_contacts ? "Add Contact" : "Show Contacts"}
              </p>
            </ReactTooltip>
            <form
              className={this.state.show_contacts ? "hidden" : ""}
              onSubmit={this.addContact}
            >
              <input
                name="name"
                placeholder="* Enter Contact Name"
                value={this.state.name}
                onChange={this.inputOnChange.bind(this, "name")}
                maxLength="40"
              />
              <textarea
                name="address"
                rows="2"
                value={this.state.new_address}
                placeholder="* Enter Contact Address"
                onChange={this.inputOnChange.bind(this, "new_address")}
              />
              <label htmlFor="paymentid">
                <div
                  data-tip
                  data-for="paymentid-contact-tooptip"
                  className="button-shine question-wrap"
                >
                  <span>?</span>
                </div>
                <ReactTooltip id="paymentid-contact-tooptip">
                  <p>
                    <span className="blue-text">Payment ID</span> is additional
                    reference number.
                  </p>
                  <p>It is given by exchanges and web</p>
                  <p>shops to differentiate and track</p>
                  <p className="mb-10">particular deposits and purchases.</p>
                  <p>
                    <span className="blue-text">Payment ID</span> format should
                    be
                  </p>
                  <p className="mb-10">
                    <span className="blue-text">64 digit Hex</span> character
                    string.
                  </p>
                  <p>
                    Payment ID is <span className="blue-text">required</span>{" "}
                    for each contact.
                  </p>
                </ReactTooltip>
              </label>
              <div id="genPayIdWrap">
                <button
                  className="btn button-shine"
                  id="genPayId"
                  type="button"
                  onClick={this.genPaymentId}
                >
                  Generate Payment ID
                </button>
              </div>

              <input
                name="paymentid"
                placeholder="* Enter Contact Payment ID"
                value={this.state.new_payment_id}
                onChange={this.inputOnChange.bind(this, "new_payment_id")}
              />

              <button className="btn button-shine" type="submit">
                Save Contact
              </button>
            </form>

            <div
              className={
                this.state.show_contacts ? "show-contacts-wrap" : "hidden"
              }
            >
              <Contacts
                walletMeta={this.props.walletMeta}
                contacts={this.props.addressBook}
                itemsPerContactPage={3}
                setOpenAlert={this.props.setOpenAlert}
                onCopy={this.props.onCopy}
                setWalletData={this.props.setWalletData}
                setOpenSendModal={this.props.setOpenSendModal}
                setOpenDeleteModal={this.props.setOpenDeleteModal}
              />
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
                  <span>
                    SFX {this.props.availableCash} &nbsp;
                    {this.props.sfxPrice
                      ? "$" +
                        parseFloat(
                          this.props.availableCash * this.props.sfxPrice
                        ).toFixed(2)
                      : "Loading"}
                  </span>
                </div>
              ) : (
                <div className="available-wrap">
                  <span>
                    SFT {this.props.availableTokens} &nbsp;
                    {this.props.sftPrice
                      ? "$" +
                        parseFloat(
                          this.props.availableTokens * this.props.sftPrice
                        ).toFixed(2)
                      : "Loading"}
                  </span>
                </div>
              )}
              {this.props.cash_or_token === 0 ? (
                <h3>Send Cash</h3>
              ) : (
                <h3>Send Tokens</h3>
              )}
              {this.props.sendTo ? (
                <h6>
                  Sending To <span>{this.props.sendTo}</span>
                </h6>
              ) : (
                <h6 className="hidden">{""}</h6>
              )}
              <form onSubmit={this.sendCashOrToken(this.props.cash_or_token)}>
                <button
                  id="advanced-btn"
                  className="btn"
                  onClick={this.showAdvancedOptions}
                  data-tip
                  data-for="advanced-options"
                  type="button"
                >
                  <img src="images/gears.png" className="gears" alt="gears" />
                </button>
                <ReactTooltip id="advanced-options">
                  <p>Advanced Options</p>
                </ReactTooltip>
                <textarea
                  name="send_to"
                  rows="2"
                  value={
                    this.props.destination
                      ? this.props.destination
                      : this.state.address
                  }
                  placeholder="* Enter Address"
                  onChange={this.inputOnChange.bind(this, "address")}
                  disabled={this.props.destination ? "disabled" : ""}
                />
                <label htmlFor="amount">
                  {this.props.cash_or_token === 0 ? (
                    <div
                      data-tip
                      data-for="cash-amount-tooptip"
                      className="button-shine question-wrap"
                    >
                      <span>?</span>
                    </div>
                  ) : (
                    <div
                      data-tip
                      data-for="token-amount-tooptip"
                      className="button-shine question-wrap"
                    >
                      <span>?</span>
                    </div>
                  )}
                  <ReactTooltip id="cash-amount-tooptip">
                    <p>
                      <span className="blue-text">Safex Cash fee</span> will be
                    </p>
                    <p>added to sending amount.</p>
                  </ReactTooltip>
                  <ReactTooltip id="token-amount-tooptip">
                    <p>Token transaction does not</p>
                    <p className="mb-10">accept decimal values.</p>
                    <p>Token transaction </p>
                    <p>
                      requires <span className="blue-text">Safex Cash fee</span>
                      .
                    </p>
                  </ReactTooltip>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder={
                    this.props.cash_or_token === 0
                      ? "* Enter Amount (SFX)"
                      : "* Enter Amount (SFT)"
                  }
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                />

                <div
                  id="advanced-options"
                  className={
                    this.state.advanced_options ? "advanced-options" : "hidden"
                  }
                >
                  <label id="mixin-label" htmlFor="mixin">
                    Transaction Mixin (Optional)
                    <div
                      data-tip
                      data-for="mixin-tooptip"
                      className="button-shine question-wrap"
                      id="mixin-question-wrap"
                    >
                      <span>?</span>
                    </div>
                    <ReactTooltip id="mixin-tooptip">
                      <p>
                        <span className="blue-text">Transaction Mixin</span>{" "}
                        determines how many{" "}
                      </p>
                      <p>outputs transaction is going to have.</p>
                      <p>Lower mixin will result in smaller fees.</p>
                      <p>For large transactions we recommend</p>
                      <p>lowering the transaction mixin.</p>
                      <p className="mb-10">
                        Default network mixin is{" "}
                        <span className="blue-text">6</span>.
                      </p>
                      <p className="blue-text">
                        *Consistent use of low ring sizes
                      </p>
                      <p className="blue-text">
                        {" "}
                        may affect your traceability.
                      </p>
                    </ReactTooltip>
                  </label>
                  <select
                    name="mixin"
                    value={this.state.mixin}
                    onChange={this.inputOnChange.bind(this, "mixin")}
                  >
                    {mixinArray}
                  </select>
                  <label htmlFor="paymentid">
                    <div
                      data-tip
                      data-for="paymentid-tooptip"
                      className="button-shine question-wrap"
                    >
                      <span>?</span>
                    </div>
                    <ReactTooltip id="paymentid-tooptip">
                      <p>
                        <span className="blue-text">Payment ID</span> is
                        additional reference
                      </p>
                      <p>number attached to the transaction.</p>
                      <p>It is given by exchanges and web</p>
                      <p>shops to differentiate and track</p>
                      <p className="mb-10">
                        particular deposits and purchases.
                      </p>
                      <p>
                        <span className="blue-text">Payment ID</span> format
                        should be
                      </p>
                      <p className="mb-10">
                        <span className="blue-text">16 or 64 digit Hex</span>{" "}
                        character string.
                      </p>
                      <p>When sending to contact from</p>
                      <p>Address Book, contact Payment ID</p>
                      <p className="mb-10">will be included in transaction.</p>
                      <p>
                        It is <span className="blue-text">not required</span>{" "}
                        for
                      </p>
                      <p>regular user transactions.</p>
                    </ReactTooltip>
                  </label>
                  <input
                    name="paymentid"
                    value={
                      this.props.paymentID
                        ? this.props.paymentID
                        : this.state.payment_id
                    }
                    placeholder="Enter Payment ID (Optional)"
                    onChange={this.inputOnChange.bind(this, "payment_id")}
                    disabled={this.props.paymentID ? "disabled" : ""}
                  />
                </div>

                <button
                  className="btn button-shine"
                  type="submit"
                  disabled={this.state.send_tx_disabled ? "disabled" : ""}
                >
                  {this.state.send_tx_disabled ? "Wait" : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    if (this.props.confirmModal) {
      modal = (
        <div
          className={
            "confirmModal" + addClass(this.props.confirmModal, "active")
          }
        >
          {this.props.alertCloseDisabled ? (
            <span className="hidden" />
          ) : (
            <span className="close" onClick={this.props.setCloseMyModal}>
              X
            </span>
          )}
          <div className="mainAlertPopupInner">
            <p>{this.props.alertText}</p>
          </div>
        </div>
      );
    }
    if (this.props.feeModal) {
      modal = (
        <div className={"feeModal" + addClass(this.props.feeModal, "active")}>
          {this.props.alertCloseDisabled ? (
            <span className="hidden" />
          ) : (
            <span className="close" onClick={this.props.closeModal}>
              X
            </span>
          )}
          <div className="mainAlertPopupInner">
            <p>
              Your approximate transaction fee is: {this.state.fee} SFX ($
              {parseFloat(this.state.fee * this.props.sfxPrice).toFixed(4)})
            </p>
            <p>Are you sure you want to proceed with this transaction?</p>

            <form onSubmit={this.commitTx}>
              <button
                type="button"
                className="cancel-btn btn button-shine"
                onClick={this.closeMyModal}
                disabled={
                  this.state.tx_being_sent || this.props.sendDisabled
                    ? "disabled"
                    : ""
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="confirm-btn btn button-shine"
                disabled={
                  this.state.tx_being_sent || this.props.sendDisabled
                    ? "disabled"
                    : ""
                }
              >
                Send
              </button>
            </form>
            <h6>
              Due to the way Safex blockchain works, part or all of your
              remaining balance after a transaction may go into pending status
              for a short period of time. This is normal and status will become
              available after 10 blocks.
            </h6>
          </div>
        </div>
      );
    }
    if (this.props.deleteModal) {
      modal = (
        <div
          className={"deleteModal" + addClass(this.props.deleteModal, "active")}
        >
          {this.props.alertCloseDisabled ? (
            <span className="hidden" />
          ) : (
            <span className="close" onClick={this.props.closeModal}>
              X
            </span>
          )}
          <div className="mainAlertPopupInner">
            <p>Are you sure you want to delete this contact?</p>

            <form onSubmit={this.removeContact}>
              <button
                type="button"
                className="cancel-btn button-shine"
                onClick={this.props.closeModal}
              >
                Cancel
              </button>
              <button type="submit" className="confirm-btn button-shine">
                Delete
              </button>
            </form>
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
              <span className="close" onClick={this.closeMyModal}>
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

        <div
          className={"backdrop" + addClass(this.props.modal, "active")}
          onClick={this.props.alertCloseDisabled ? "" : this.closeMyModal}
        />
      </div>
    );
  }
}
