import React from "react";
import { addClass, roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";

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
      new_address: "",
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
      this.props.loadingModal ||
      this.props.deleteModal ||
      this.props.feeModal ||
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
        this.setState({
          send_tx_disabled: false
        });
        if (e.startsWith("not enough money to transfer, available only")) {
          this.props.setOpenAlert(
            "There is not enough SFX or outputs available to fulfil this transaction + fee. Please consider reducing the size of the transaction.",
            false,
            "modal-80"
          );
        } else {
          this.props.setOpenAlert("" + e, false, "modal-80");
        }
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
          this.props.setWalletHistory();
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

  showAdvancedOptions = () => {
    this.setState({
      advanced_options: !this.state.advanced_options
    });
  };

  removeContact = e => {
    e.preventDefault();
    let rowID = parseFloat(localStorage.getItem("rowID"));
    let wallet = this.props.walletMeta;
    wallet.addressBook_DeleteRow(rowID);
    this.props.setWalletHistory();
    wallet.store();
    localStorage.removeItem("rowID");
    this.props.setOpenAlert("Contact removed", false, "modal-80");
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
    if (this.props.sendModal) {
      modal = (
        <div className={"sendModal" + addClass(this.props.sendModal, "active")}>
          <div className="sendModalInner">
            <span
              className="close"
              onClick={this.state.send_tx_disabled ? "" : this.closeMyModal}
            >
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
                  disabled={this.state.send_tx_disabled ? "disabled" : ""}
                >
                  <img src="images/gears.png" className="gears" alt="gears" />
                </button>
                <ReactTooltip id="advanced-options">
                  <p>Advanced</p>
                  <p>Options</p>
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
                  <div
                    data-tip
                    data-for="amount-tooptip"
                    className="button-shine question-wrap"
                  >
                    <span>?</span>
                  </div>
                  <span id="dollarAmount">
                    {
                      this.props.cash_or_token === 0
                        ?
                          "$ " + parseFloat(this.state.amount * this.props.sfxPrice).toFixed(2)
                        :
                          "$ " + parseFloat(this.state.amount * this.props.sftPrice).toFixed(2)
                    }
                  </span>
                  <ReactTooltip id="amount-tooptip">
                    {
                      this.props.cash_or_token === 0
                      ?
                        <p>
                          <span className="blue-text">Safex Cash fee</span> will be added to sending amount.
                        </p>
                      :
                        <div>
                          <p className="mb-10">
                            Token transaction does not accept decimal values.
                          </p>
                          <p>
                            Token transaction requires <span className="blue-text">Safex Cash fee</span>.
                          </p>
                        </div>
                    }
                  </ReactTooltip>
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  placeholder={
                    this.props.cash_or_token === 0
                      ? "* Enter Amount (SFX)"
                      : "* Enter Amount (SFT)"
                  }
                  value={this.state.amount}
                  onChange={this.inputOnChange.bind(this, "amount")}
                />

                <div
                  className={
                    this.state.advanced_options ? "advanced-options active" : "advanced-options"
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
                        determines how many outputs transaction is going to have.
                      </p>
                      <p>
                        Lower mixin will result in smaller fees. For large transactions we recommend
                      </p>
                      <p className="mb-10">
                        lowering the transaction mixin. Default network mixin is <span className="blue-text">6</span>.
                      </p>
                      <p className="blue-text">
                        *Consistent use of low ring sizes may affect your traceability.
                      </p>
                    </ReactTooltip>
                  </label>
                  <select
                    name="mixin"
                    value={this.state.mixin}
                    onChange={this.inputOnChange.bind(this, "mixin")}
                    disabled={this.state.advanced_options ? "" : "disabled"}
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
                        additional reference number attached to the transaction.
                      </p>
                      <p>
                        It is given by exchanges and web shops to differentiate and track
                      </p>
                      <p className="mb-10">particular deposits and purchases.</p>
                      <p className="mb-10">
                        Payment ID format should be <span className="blue-text">16 or 64 digit Hex</span> character string.
                      </p>
                      <p>
                        Payment ID is <span className="blue-text">not required</span> for regular user transactions.
                      </p>
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
                    disabled={this.props.paymentID || this.state.advanced_options === false ? "disabled" : ""}
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
            {
              this.props.cash_or_token === 0
                ?
                <div>
                  <p>
                    <span className="left-span">Sending amount:</span>
                    <span>
                      {parseFloat(this.state.amount).toFixed(2)} SFX ($
                      {parseFloat(this.state.amount * this.props.sfxPrice).toFixed(3)}
                      )
                    </span>
                  </p>
                  <p>
                    <span className="left-span">Approximate transaction fee:</span>
                    <span>
                      {this.state.fee} SFX ($
                       {parseFloat(this.state.fee * this.props.sfxPrice).toFixed(3)})
                    </span>
                  </p>
                  <p className="mb-10">
                    <span className="left-span">Total amount:</span>
                    <span>
                      {parseFloat(
                        parseFloat(this.state.amount) + parseFloat(this.state.fee)
                      ).toFixed(2)}{" "}
                      SFX ($
                      {parseFloat(
                        (parseFloat(this.state.amount) + parseFloat(this.state.fee)) *
                        this.props.sfxPrice
                      ).toFixed(3)}
                      )
                    </span>
                  </p>
                </div>
                :
                <div>
                  <p>
                    <span className="left-span">Sending amount:</span>
                    <span>
                      {parseFloat(this.state.amount).toFixed(2)} SFT ($
                      {parseFloat(this.state.amount * this.props.sftPrice).toFixed(3)}
                      )
                    </span>
                  </p>
                  <p>
                    <span className="left-span">Approximate transaction fee:</span>
                    <span>
                      {this.state.fee} SFX ($
                       {parseFloat(this.state.fee * this.props.sfxPrice).toFixed(3)})
                    </span>
                  </p>
                  <p className="mb-10">
                    <span className="left-span">Total amount:</span>
                    <span>
                      {parseFloat(this.state.amount) +
                        " SFT + " + this.state.fee +
                        " SFX " +
                        " ($" +
                        parseFloat(
                          ((parseFloat(this.state.amount) + parseFloat(this.state.fee)) *
                            this.props.sftPrice) + + parseFloat(this.state.fee * this.props.sfxPrice)
                        ).toFixed(3) + ")"}
                    </span>
                  </p>
                </div>
            }

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
          onClick={
            this.props.alertCloseDisabled || this.state.send_tx_disabled
              ? ""
              : this.closeMyModal
          }
        />
      </div>
    );
  }
}
