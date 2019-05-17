import React, { Component } from "react";
import { verify_safex_address } from "../utils/utils.js";
import ReactTooltip from "react-tooltip";
const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class RecoverFromKeys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alert_close_disabled: false
    };
  }

  createWalletFromKeys = e => {
    e.preventDefault();

    //here we need the key set
    //the wallet path desired
    //the password
    var safex_address = e.target.address.value;
    var view_key = e.target.viewkey.value;
    var spend_key = e.target.spendkey.value;
    var pass1 = e.target.pass1.value;
    var pass2 = e.target.pass2.value;

    if (
      safex_address === "" ||
      view_key === "" ||
      spend_key === "" ||
      pass1 === "" ||
      pass2 === ""
    ) {
      this.props.setOpenAlert("Fill out all the fields");
      return false;
    }
    if (pass1 !== pass2) {
      this.props.setOpenAlert("Passwords do not match");
      return false;
    }
    if (spend_key.length !== 64) {
      this.props.setOpenAlert("Incorrect spend key");
      return false;
    }
    if (view_key.length !== 64) {
      this.props.setOpenAlert("Incorrect view key");
      return false;
    }
    if (
      this.state.network === "mainnet" &&
      verify_safex_address(spend_key, view_key, safex_address) === false
    ) {
      this.props.setOpenAlert("Incorrect keys");
      return false;
    }
    dialog.showSaveDialog(filepath => {
      if (!filepath) {
        return false;
      }
      if (safex.walletExists(filepath)) {
        this.props.setOpenAlert(
          `Wallet already exists. Please choose a different file name. 
          This application does not enable overwriting an existing wallet file 
          OR you can open it using the Load Existing Wallet`
        );
        return false;
      }
      this.setState(() => ({
        alert_close_disabled: true
      }));
      this.props.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete. This may take a while, please be patient.",
        true
      );
      console.log("Wallet doesn't exist. creating new one: " + filepath);
      this.props.createWallet("createWalletFromKeys", {
        path: filepath,
        password: pass1,
        network: this.props.env.NETWORK,
        daemonAddress: this.props.env.ADDRESS,
        restoreHeight: 0,
        addressString: safex_address,
        viewKeyString: view_key,
        spendKeyString: spend_key
      });
      localStorage.setItem("wallet_path", filepath);
      localStorage.setItem("password", JSON.stringify(pass1));
      localStorage.setItem("filename", filepath.split("/").pop());
      console.log("Create wallet from keys performed!");
      console.log("Create new wallet from keys checkpoint 1");
    });
    console.log("Create new wallet from keys checkpoint 2");
  };

  render() {
    return (
      <form
        className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3"
        onSubmit={this.createWalletFromKeys}
      >
        <div
          data-tip
          data-for="create-from-keys-tooptip"
          className="button-shine question-wrap"
        >
          <span>?</span>
        </div>
        <ReactTooltip id="create-from-keys-tooptip">
          <p className="mb-10">If you already have <span className="blue-text">Safex Address</span>, you can recreate it here.</p>
          <p>When asked for a file name, enter the file</p>
          <p>name <span className="blue-text">without</span> the extension and click <span className="blue-text">save</span>.</p>
          <p>This will create <span className="blue-text">2</span> files on your file system.</p>
          <p className="mb-10"><span className="blue-text">ExampleWallet</span> and <span className="blue-text">ExampleWallet.keys</span>.</p>
          <p>In the future, when you want to <span className="blue-text">load</span> wallet, make</p>
          <p className="mb-10">sure you select the file <span className="blue-text">without</span> the .keys extension.</p>
          <p>Remember to <span className="blue-text">back up your keys</span> for future wallet recovery.</p>
        </ReactTooltip>
        <div className="group-wrap">
          <div className="form-group">
            <div className="label-wrap">
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="address-tooptip"
              >
                <span>?</span>
              </div>
              <ReactTooltip id="address-tooptip">
                <p>Your <span className="blue-text">Safex Address</span> should start with Safex and</p>
                <p className="mb-10">contain between <span className="blue-text">95 and 105</span> characters.</p>
                <p className="w-350">
                  Example: <span className="blue-text">Safex5z1mFADN3R8sohjXme8MfgN5UF82V6AyAH62m4aKiTgpwJAvw9dXEeaZGAA7LhH4SqyVkPPGcK14kGst4Gt9D1hNCQJyvt5D</span>
                </p>
              </ReactTooltip>
            </div>
            <textarea
              name="address" 
              placeholder="address"
              rows="3"
            />

            <div className="label-wrap">
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="key-tooptip"
              >
                <span>?</span>
              </div>
              <ReactTooltip id="key-tooptip">
                <p>
                  Your <span className="blue-text">Secret View Key</span> and <span className="blue-text">Secret Spend Key</span>{" "}
                  should be a <span className="blue-text">64 digit Hex</span>. Example:
                </p>
                <p className="blue-text">45b9ad1abb6564141793d809c8284e25c5c22d29b7d313c0be62387b1f2df8c3</p>
              </ReactTooltip>
            </div>
            <input type="text" name="spendkey" placeholder="secret spendkey" />

            <div className="label-wrap">
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="key-tooptip"
              >
                <span>?</span>
              </div>
            </div>
            <input type="text" name="viewkey" placeholder="secret viewkey" />
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />
          </div>
        </div>
        <button
          type="submit"
          className={
            this.props.buttonDisabled
              ? "submit btn button-shine disabled"
              : "submit btn button-shine"
          }
        >
          Recover
        </button>
      </form>
    );
  }
}
