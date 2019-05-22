import React, { Component } from "react";
import { roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContactName from "./ContactName";
import * as crypto from "crypto";

const safex = window.require("safex-nodejs-libwallet");
const { shell } = window.require("electron");
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
          <div className="pagination">
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
    this.state = { contact_page: 0, editing: false };
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

  editContact = (address, paymentID, name, rowID) => {
    let wallet = this.props.walletMeta;
    wallet.addressBook_DeleteRow(rowID);
    setTimeout(() => {
      wallet.addressBook_AddRow(address, paymentID, name);
      wallet.store();
      console.log("Wallet stored");
      this.props.setWalletHistory();
      localStorage.removeItem("rowID");
    }, 100);
    console.log("Wallet edited");
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
                    {/* <ContactName
                      address={contact.address}
                      paymentId={contact.paymentId}
                      contactName={contact.description}
                      editContact={this.editContact}
                      rowID={contact.rowID}
                    /> */}
                    <p className="name">{contact.description}</p>
                    <p className="payment-id">Payment ID:</p>
                  </div>
                  <ReactTooltip id="edit-tooptip">
                    <p>Edit Contact</p>
                  </ReactTooltip>

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
          <div className="pagination">
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

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      general: true,
      address_book: false,
      show_contacts: true,
      history: false,
      seed_keys: false,
      name: "",
      new_payment_id: ""
    };
  }

  openGeneral = () => {
    this.setState({
      general: true,
      address_book: false,
      history: false,
      seed_keys: false
    });
  };

  openAddressBook = () => {
    this.setState({
      general: false,
      address_book: true,
      history: false,
      seed_keys: false
    });
  };

  openHistory = () => {
    this.setState({
      general: false,
      address_book: false,
      history: true,
      seed_keys: false
    });
  };

  openSeedAndKeys = () => {
    this.setState({
      general: false,
      address_book: false,
      history: false,
      seed_keys: true
    });
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
      this.props.setWalletHistory();
    }, 100);
  };

  genPaymentId = () => {
    let paymentID = crypto.randomBytes(32).toString("hex");

    this.setState({
      new_payment_id: paymentID
    });
  };

  inputOnChange = (target, e) => {
    this.setState({
      [target]: e.target.value
    });
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
    return (
      <div className={this.props.sidebar ? "sidebar active" : "sidebar"}>
        <div id="nav">
          <h2>Settings</h2>

          <button
            className="button-shine tx-history"
            onClick={this.props.toggleSidebar}
            data-tip="true"
            data-for="settings-tooptip"
          >
            <img src="images/history.png" alt="transaction-history" />
          </button>
          <ReactTooltip id="settings-tooptip">
            <p>Close Settings</p>
          </ReactTooltip>

          <ul>
            <li
              onClick={this.openGeneral}
              className={this.state.general ? "active" : ""}
            >
              <img src="images/gears.png" alt="gears" />
              General
            </li>
            <li
              onClick={this.openAddressBook}
              className={this.state.address_book ? "active" : ""}
            >
              <img src="images/address-book.png" alt="address-book" />
              Address Book
            </li>
            <li
              onClick={this.openHistory}
              className={this.state.history ? "active" : ""}
            >
              <img src="images/history.png" alt="transaction-history" />
              Transaction History
            </li>
            <li
              onClick={this.openSeedAndKeys}
              className={this.state.seed_keys ? "active" : ""}
            >
              <img src="images/key.png" alt="key" />
              Seed & Keys
            </li>
          </ul>
        </div>

        <div id="content">
          <div className={this.state.general ? "general" : "general hidden"}>
            <h2>General</h2>

            <div className="label-wrap">
              <label>Wallet Address</label>
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="pub-address-tooptip"
              >
                <span>?</span>
              </div>
              <ReactTooltip id="pub-address-tooptip">
                <p>
                  This is <span className="blue-text">Public Address</span> of
                  your wallet.
                </p>
                <p>
                  Public Address starts with Safex and contains between{" "}
                  <span className="blue-text">95 and 105</span> characters.
                </p>
                <p>
                  This is address where you can receive{" "}
                  <span className="blue-text">Safex Cash (SFX)</span> or{" "}
                  <span className="blue-text">Safex Tokens (SFT)</span>.
                </p>
                <p>
                  It is generated using{" "}
                  <span className="blue-text">Public Spend Key</span> and{" "}
                  <span className="blue-text">Public View Key</span>.
                </p>
              </ReactTooltip>
              <CopyToClipboard
                text={this.props.wallet.wallet_address}
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
            <p className="general-p">{this.props.wallet.wallet_address}</p>
          </div>

          <div
            className={
              this.state.address_book ? "address-wrap" : "address-wrap hidden"
            }
          >
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
            <h2>Address Book</h2>
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
                setWalletHistory={this.props.setWalletHistory}
                setOpenSendModal={this.props.setOpenSendModal}
                setOpenDeleteModal={this.props.setOpenDeleteModal}
              />
            </div>
          </div>

          <div
            className={
              this.state.history ? "history-wrap" : "history-wrap hidden"
            }
          >
            <h2>Transaction History</h2>
            <div id="history-wrap">
              <Transactions history={this.props.history} itemsPerPage={3} />
            </div>
          </div>

          <div
            className={
              this.state.seed_keys ? "seed-keys-wrap" : "seed-keys-wrap hidden"
            }
          >
            <h2>Seed And Keys</h2>

            <label htmlFor="filepath">Wallet File Path</label>
            <p className="seed-p">{this.props.wallet.filepath}</p>

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
            <p className="seed-p">{this.props.wallet.mnemonic}</p>

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
            <p className="seed-p">{this.props.wallet.view_key}</p>

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
            <p className="seed-p">{this.props.wallet.pub_view}</p>

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
            <p className="seed-p">{this.props.wallet.spend_key}</p>

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
            <p className="seed-p">{this.props.wallet.pub_spend}</p>

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
      </div>
    );
  }
}
