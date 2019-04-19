import React, { Component } from "react";
import { addClass, roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import * as crypto from "crypto";

const { shell } = window.require("electron");
const safex = window.require("safex-nodejs-libwallet");

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
              onClick={this.firstTxPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousTxPage}>
              previus
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
                      onCopy={this.props.onCopy}
                      data-tip
                      data-for="copy-tooptip"
                      className="button-shine copy-btn"
                    >
                      <button>
                        <img src="images/copy.png" alt="copy" />
                      </button>
                    </CopyToClipboard>
                    <ReactTooltip id="copy-tooptip">
                      <p>Copy</p>
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
              previus
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
      fee: 0
    };
    this.mixin = 6;
    this.testTx = null;
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
    if (this.props.keysModal || this.props.deleteModal || this.props.feeModal) {
      this.props.closeModal();
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
    this.mixin = 6;
    localStorage.removeItem("tx");
    localStorage.removeItem("txId");
    localStorage.removeItem("paymentId");
    console.log("reset mixin. Current mixin: " + this.mixin);
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
        send_tx_disabled: false
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
      let mixin = this.mixin;
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
      if (
        process.env.NODE_ENV === "development" &&
        !safex.addressValid(sendingAddress, "testnet")
      ) {
        this.props.setOpenAlert("Enter valid Safex address", false, "modal-80");
        return false;
      }
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
        })
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
        })
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
        console.log(args);
        this.setState(() => ({ 
          fee: fee, 
          send_tx_disabled: false 
        }));
        this.testTx = tx;
        this.props.setOpenFeeModal();
      })
      .catch(e => {
        if (e.startsWith("not enough outputs for specified ring size")) {
          this.props.setOpenMixinModal(
            "Couldn't create transaction: " + e,
            false
          );
          localStorage.setItem("args", JSON.stringify(args));
          console.log(JSON.parse(localStorage.getItem("args")));
        } else {
          this.props.setOpenAlert(
            "Couldn't create transaction: " + e,
            false,
            "modal-80"
          );
        }
      });
  };

  commitTx = e => {
    e.preventDefault();
    let tx = this.testTx;
    let txId = tx.transactionsIds();
    this.setState(() => ({
      tx_being_sent: true
    }));
    tx.commit()
      .then(() => {
        if (this.props.mixinModal) {
          this.props.closeModal();
        } else {
          this.closeMyModal();
        }
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
          this.testTx = null;
        } else {
          this.props.setOpenConfirmModal(
            "Transaction commited successfully, Your token transaction ID is: " +
              txId,
            false,
            "modal-80",
            true
          );
          this.testTx = null;
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
        this.props.setOpenAlert(
          "Error on commiting transaction: " + e,
          false,
          "modal-80",
          true
        );
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
      setTimeout(() => {
        localStorage.removeItem(args);
      }, 2000);
    } catch (err) {
      this.props.setOpenAlert(`${err}`, false, "modal-80");
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
    if (this.props.keysModal) {
      modal = (
        <div className={"keysModal" + addClass(this.props.keysModal, "active")}>
          <span className="close" onClick={this.closeMyModal}>
            X
          </span>

          <div
            data-tip
            data-for="keys-tooptip"
            className="button-shine question-wrap"
          >
            <span>?</span>
          </div>
          <ReactTooltip id="keys-tooptip">
            <p>
              <span className="blue-text">Mnemonic seed</span> can be used to
              recover your wallet in case your file gets lost or corrupted.
            </p>
            <p className="red-text">
              Sharing it can and will result in total loss of your Safex Cash
              and Safex Tokens.
            </p>
            <p className="blue-text">
              Write it down and keep is safe at all times.
            </p>
            <p>
              <span className="blue-text">Public Spend Key</span> and{" "}
              <span className="blue-text">Public View Key</span> are made to
              generate your address.
            </p>
            <p>
              <span className="blue-text">Secret (Private) Spend Key</span> is
              used to sign your transactions.
            </p>
            <p>
              <span className="blue-text">Secret (Private) View Key</span> can
              be used to view all transactions of the given address.
            </p>
          </ReactTooltip>

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
              <CopyToClipboard
                text={this.props.wallet.mnemonic}
                onCopy={this.props.onCopy}
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
              <label htmlFor="spend_key">Secret (Private) Spend Key</label>
              <CopyToClipboard
                text={this.props.wallet.spend_key}
                onCopy={this.props.onCopy}
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
              <label htmlFor="pub_view">Public View Key</label>
              <CopyToClipboard
                text={this.props.wallet.pub_view}
                onCopy={this.props.onCopy}
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
              <label htmlFor="view_key">Secret (Private) View Key</label>
              <CopyToClipboard
                text={this.props.wallet.view_key}
                onCopy={this.props.onCopy}
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
              <label htmlFor="spend_key">Public Spend Key</label>
              <CopyToClipboard
                text={this.props.wallet.pub_spend}
                onCopy={this.props.onCopy}
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
                disabled={this.props.wallet.wallet_connected ? "" : "disabled"}
                readOnly
              >
                Rescan
              </button>
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
                  <p>
                    Each tranasction has a unique{" "}
                    <span className="blue-text">Transaction ID.</span>
                  </p>
                  <p>
                    Transaction ID format is{" "}
                    <span className="blue-text">64 Hex</span> character string.
                  </p>
                  <p>It can be used to track each individual</p>
                  <p>
                    transaction on{" "}
                    <span className="blue-text">
                      Safex Blockchain Explorer.
                    </span>
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
            <span className="close" onClick={this.props.closeModal}>
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
                maxLength="30"
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
                  <p>particular deposits and purchases.</p>
                  <p>
                    <span className="blue-text">Payment ID</span> format should
                    be{" "}
                  </p>
                  <p>
                    <span className="blue-text">64 Hex</span> character string.
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
              {this.props.sendTo ? (
                <h6>
                  Sending To <span>{this.props.sendTo}</span>
                </h6>
              ) : (
                <h6 className="hidden">{""}</h6>
              )}
              <form onSubmit={this.sendCashOrToken(this.props.cash_or_token)}>
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
                    <p>
                      Token transaction requires{" "}
                      <span className="blue-text">Safex Cash</span> fee.
                    </p>
                  </ReactTooltip>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="* Enter Amount"
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                />
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
                      additional reference number
                    </p>
                    <p>attached to the transaction.</p>
                    <p>It is given by exchanges and web</p>
                    <p>shops to differentiate and track</p>
                    <p>particular deposits and purchases.</p>
                    <p>
                      <span className="blue-text">Payment ID</span> format
                      should be{" "}
                    </p>
                    <p>
                      <span className="blue-text">16 or 64 Hex</span> character
                      string.
                    </p>
                    <p>It is not required for regular user transactions.</p>
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
                <button
                  className="btn button-shine"
                  type="submit"
                  disabled={
                    this.state.send_tx_disabled
                      ? "disabled"
                      : ""
                  }
                >
                  {this.state.send_tx_disabled ? 'Wait' : 'Send'}
                  
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
            <p>Your approximate transaction fee is: {this.state.fee} SFX</p>
            <p>Are you sure you want to proceed with this transaction?</p>

            <form onSubmit={this.commitTx}>
              <button
                type="button"
                className="cancel-btn btn button-shine"
                onClick={this.props.closeModal}
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

        {(this.props.sendModal && this.props.alert === false) ||
        (this.props.sendModal &&
          this.props.confirmModal &&
          this.props.feeModal === false) ||
        (this.props.addressModal && this.props.alert === false) ||
        (this.props.addressModal &&
          this.props.sendModal &&
          this.props.alert === false) ||
        this.props.mixinModal ||
        this.props.deleteModal ? (
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
