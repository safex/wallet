import React from "react";
import { verify_safex_address } from "../utils/utils.js";
const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class CreateFromKeys extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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
        "Please wait while your wallet file is being created. Don't close the application until the process is complete. This can take a while, please be patient.",
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
      console.log("Create wallet from keys performed!");
      console.log("Create new wallet from keys checkpoint 1");
    });
    console.log("Create new wallet from keys checkpoint 2");
  };

  render() {
    return (
      <form onSubmit={this.createWalletFromKeys}>
        <div className="group-wrap">
          <div className="form-group">
            <input type="text" name="address" placeholder="address" />
            <input type="text" name="spendkey" placeholder="secret spendkey" />
            <input type="text" name="viewkey" placeholder="secret viewkey" />
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />
          </div>
        </div>
        <button type="submit" className="submit btn button-shine">
          Create
        </button>
      </form>
    );
  }
}
