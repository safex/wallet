import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

import Alert from "./partials/Alert";
import ExitModal from "./partials/ExitModal";
import { closeApp } from "../utils/utils.js";

export default class NewFromMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: "",
      wallet_exists: false,
      wallet: {},
      wallet_created: false,
      wallet_address: "",
      spend_key: "",
      view_key: "",
      net: "mainnet",
      daemonHostPort: "rpc.safex.io:17402",
      mnemonic: "",
      create_new_wallet_alert: false,
      mnemonic_active: false
    };

    this.goToPage = this.goToPage.bind(this);
    this.createNewFromMnemonic = this.createNewFromMnemonic.bind(this);
    this.hasNumber = this.hasNumber.bind(this);
    this.countWords = this.countWords.bind(this);
    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
  }

  goToPage() {
    this.props.goToPage();
  }

  toggleExitModal() {
    this.setState({
      exit_modal: !this.state.exit_modal
    });
  }

  setCloseApp() {
    closeApp(this);
  }

  toggleMnemonic() {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  }

  hasNumber(myString) {
    return /\d/.test(myString);
  }

  countWords(str) {
    return str.trim().split(/\s+/).length;
  }

  createNewFromMnemonic(e) {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    const mnemonic = e.target.mnemonic.value;

    if (pass1 !== "" || pass2 !== "") {
      if (pass1 === pass2) {
        if (mnemonic !== "") {
          if (
            this.countWords(mnemonic) == 24 ||
            this.countWords(mnemonic) == 25
          ) {
            if (this.hasNumber(mnemonic) === false) {
              console.log("word count " + this.countWords(mnemonic));
              dialog.showSaveDialog(filepath => {
                if (filepath !== undefined) {
                  this.setState({
                    wallet_path: filepath
                  });
                  //TODO needs additional sanitation on the passwords, length and type of data

                  var args = {
                    path: filepath,
                    password: pass1,
                    network: this.state.net,
                    daemonAddress: this.state.daemonHostPort,
                    mnemonic: mnemonic
                  };
                  if (!safex.walletExists(filepath)) {
                    this.setState(() => ({
                      wallet_exists: false,
                      modal_close_disabled: true
                    }));
                    this.setOpenAlert(
                      "Please wait while your wallet file is being created. Don't close the application until the process is complete. This can take a while, please be patient.",
                      "new_from_mnemonic_alert",
                      true
                    );
                    console.log(
                      "wallet doesn't exist. creating new one: " +
                        this.state.wallet_path
                    );

                    safex
                      .recoveryWallet(args)
                      .then(wallet => {
                        this.setState({
                          wallet_created: true,
                          wallet: wallet,
                          wallet_address: wallet.address(),
                          spend_key: wallet.secretSpendKey(),
                          view_key: wallet.secretViewKey(),
                          mnemonic: mnemonic
                        });
                        console.log(
                          "wallet address  " + this.state.wallet_address
                        );
                        console.log(
                          "wallet spend private key  " + this.state.spend_key
                        );
                        console.log(
                          "wallet view private key  " + this.state.view_key
                        );
                        console.log("Wallet seed: " + wallet.seed());

                        wallet.on("refreshed", () => {
                          console.log("Wallet file successfully created!");
                          this.refs.pass1.value = "";
                          this.refs.pass2.value = "";
                          this.refs.mnemonic.value = "";
                          this.setOpenAlert(
                            "Wallet file successfully created!",
                            "new_from_mnemonic_alert",
                            false
                          );
                          wallet
                            .store()
                            .then(() => {
                              console.log("Wallet stored");
                            })
                            .catch(e => {
                              console.log("Unable to store wallet: " + e);
                            });
                        });
                      })
                      .catch(err => {
                        this.setOpenAlert(
                          "error with the creation of the wallet " + err,
                          "new_from_mnemonic_alert",
                          false
                        );
                        console.log(
                          "error with the creation of the wallet " + err
                        );
                      });
                  } else {
                    this.setState(() => ({
                      modal_close_disabled: false
                    }));
                    this.setOpenAlert(
                      "Wallet already exists. Please choose a different file name  " +
                        "this application does not enable overwriting an existing wallet file " +
                        "OR you can open it using the Open Wallet File",
                      "new_from_mnemonic_alert",
                      false
                    );
                    console.log(
                      "Wallet already exists. Please choose a different file name  " +
                        "this application does not enable overwriting an existing wallet file " +
                        "OR you can open it using the Open Wallet File"
                    );
                  }
                }
              });
            } else {
              this.setOpenAlert(
                "Mnemonic seed must not contain a number",
                "new_from_mnemonic_alert",
                false
              );
              console.log("mnemonic seed contains a number");
            }
          } else {
            this.setOpenAlert(
              "Mnemonic seed must contain 24 or 25 words",
              "new_from_mnemonic_alert",
              false
            );
            console.log("Mnemonic seed must contain 24 or 25 words");
            console.log("word count " + this.countWords(mnemonic));
          }
        } else {
          this.setOpenAlert(
            "Enter mnemonic seed for your wallet",
            "new_from_mnemonic_alert",
            false
          );
          console.log("Mnemonic field is empty");
        }
        //pass dialog box
        //pass password
        //confirm password
      } else {
        this.setOpenAlert(
          "Repeated password does not match",
          "new_from_mnemonic_alert",
          false
        );
        console.log("Repeated password does not match");
      }
    } else {
      this.setOpenAlert(
        "Fill out all the fields",
        "new_from_mnemonic_alert",
        false
      );
    }
  }

  render() {
    return (
      <div
        className={
          this.state.closing
            ? "create-new-wrap new-from-mnemonic-wrap animated fadeOut"
            : "create-new-wrap new-from-mnemonic-wrap"
        }
      >
        <img
          src="images/mnemonic.png"
          className="create-new-pic"
          alt="create-new"
        />
        <button
          onClick={this.goToPage}
          className="go-back-btn button-shine"
          disabled={this.state.alert_close_disabled ? "disabled" : ""}
        >
          Back
        </button>
        <button
          onClick={this.toggleExitModal}
          className="close-app-btn button-shine"
          title="Exit"
        >
          X
        </button>

        <h2>Create New Wallet From Mnemonic</h2>
        <div className="col-xs-6 col-xs-push-3 login-wrap">
          <form
            className={this.state.mnemonic_active ? "hidden" : ""}
            onSubmit={this.createNewFromMnemonic}
          >
            <div className="group-wrap">
              <div className="form-group">
                <input
                  type="password"
                  name="pass1"
                  ref="pass1"
                  placeholder="password"
                />
                <input
                  type="password"
                  name="pass2"
                  ref="pass2"
                  placeholder="repeat password"
                />
                <label>Mnemonic Seed for your Wallet</label>
                <textarea
                  name="mnemonic"
                  ref="mnemonic"
                  placeholder="mnemonic seed"
                  rows="3"
                />
              </div>
            </div>
            <button type="submit" className="submit btn button-shine">
              Create
            </button>
          </form>

          <Alert
            openAlert={this.state.new_from_mnemonic_alert}
            alertText={this.state.alert_text}
            alertCloseDisabled={this.state.alert_close_disabled}
            closeAlert={this.setCloseAlert}
          />
        </div>
        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.toggleExitModal}
          closeApp={this.setCloseApp}
        />
      </div>
    );
  }
}
