import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Transactions from "./Transactions";
import Contacts from "./Contacts";
import * as crypto from "crypto";

const safex = window.require("safex-nodejs-libwallet");
const fileDownload = require("react-file-download");
const remote = window.require("electron").remote;

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
      new_payment_id: "",
      refresh_timer: 0,
      refresh_interval: ""
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

    file_obj += "Public Address: " + this.props.wallet.wallet_address + "\n";
    file_obj +=
      "Secret (Private) View Key: " + this.props.wallet.view_key + "\n";
    file_obj += "Public View Key: " + this.props.wallet.pub_view + "\n";
    file_obj +=
      "Secret (Private) Spend Key: " + this.props.wallet.spend_key + "\n";
    file_obj += "Public Spend Key: " + this.props.wallet.pub_spend + "\n";
    file_obj += "Mnemonic Seed Phrase: " + this.props.wallet.mnemonic + "\n";

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

  refreshTxHistory = () => {
    if (this.state.refresh_timer === 0) {
      this.props.setWalletHistory();
      let interval = setInterval(this.refreshTxTimer, 1000);
      this.setState({
        refresh_timer: 23,
        refresh_interval: interval
      });
    }
  };

  refreshTxTimer = () => {
    if (this.state.refresh_timer > 0) {
      this.setState({ refresh_timer: this.state.refresh_timer - 1 });
    } else {
      clearInterval(this.state.refresh_interval);
    }
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

            <label>Wallet Path</label>
            <p className="general-p">{this.props.wallet.filepath}</p>

            <label>Wallet GUI version</label>
            <p className="general-p">{remote.app.getVersion()}</p>
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
                <button
                  onClick={this.refreshTxHistory}
                  className="button-shine refresh_history"
                >
                  <span data-tip data-for="refresh-tooptip" />
                  <span
                    className={
                      this.state.refresh_timer === 0
                        ? "backdrop"
                        : "backdrop active"
                    }
                    data-tip
                    data-for="refresh-tooptip"
                  >
                    {this.state.refresh_timer === 0
                      ? ""
                      : this.state.refresh_timer + " s"}
                  </span>
                  <img
                    src="images/refresh.png"
                    className={this.state.refresh_timer === 0 ? "" : "hidden"}
                    alt="refresh"
                  />
                </button>
                <ReactTooltip place="right" id="refresh-tooptip">
                  <p>
                    <span className="blue-text">Refresh</span> Transaction
                    History
                  </p>
                </ReactTooltip>
              </div>
            ) : (
              <div className="hidden" />
            )}
            <h2>Transaction History</h2>
            <Transactions history={this.props.history} itemsPerPage={3} />
          </div>

          <div
            className={
              this.state.seed_keys ? "seed-keys-wrap" : "seed-keys-wrap hidden"
            }
          >
            <h2>Seed And Keys</h2>

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
