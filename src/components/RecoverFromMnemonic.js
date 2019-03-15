import React, { Component } from "react";
import { hasNumber, countWords } from "../utils/utils.js";
import ReactTooltip from "react-tooltip";
const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class NewFromMnemonic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alert_close_disabled: false
    };
  }

  createNewFromMnemonic = e => {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    const mnemonic = e.target.mnemonic.value;

    if (pass1 === "" || pass2 === "") {
      this.props.setOpenAlert("Fill out all the fields");
      return false;
    }
    if (pass1 !== pass2) {
      this.props.setOpenAlert("Repeated password does not match");
      return false;
    }
    if (mnemonic === "") {
      this.props.setOpenAlert("Enter mnemonic seed for your wallet");
      return false;
    }
    if (countWords(mnemonic) < 24 || countWords(mnemonic) > 25) {
      this.props.setOpenAlert("Mnemonic seed must contain 24 or 25 words");
      console.log("word count " + countWords(mnemonic));
      return false;
    }
    if (hasNumber(mnemonic)) {
      this.props.setOpenAlert("Mnemonic seed must not contain a number");
      return false;
    }
    dialog.showSaveDialog(filepath => {
      if (!filepath) {
        return false;
      }
      if (safex.walletExists(filepath)) {
        this.setOpenAlert(
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
      console.log("wallet doesn't exist. creating new one: " + filepath);
      console.log("mnemonic seed: " + mnemonic);

      this.props.createWallet("recoveryWallet", {
        path: filepath,
        password: pass1,
        network: this.props.env.NETWORK,
        daemonAddress: this.props.env.ADDRESS,
        mnemonic: mnemonic
      });
      localStorage.setItem("wallet_path", filepath);
      localStorage.setItem("password", JSON.stringify(pass1));
      localStorage.setItem("filename", filepath.split("/").pop());
      console.log("Recover wallet from mnemonic performed!");
    });
  };

  render() {
    return (
      <form
        className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3"
        onSubmit={this.createNewFromMnemonic}
      >
        <div
          data-tip
          data-for="mnemonic-tooptip"
          className="button-shine question-wrap"
        >
          <span>?</span>
        </div>
        <ReactTooltip id="mnemonic-tooptip">
          <p>You can recover your Wallet with Mnemonic Seed.</p>
          <p>
            Mnemonic Seed should contain 24 or 25 words and no numbers. Example:
          </p>
          <p>
            fizzle gyrate arsenic click wives bacon apology richly long <br />
            inkling avidly gimmick biweekly frying nephew union umpire <br />
            sack tasked idiom budget lazy getting heels nephew
          </p>
          <p>This will create 2 files on your file system.</p>
          <p>ExampleWallet and ExampleWallet.keys</p>
          <p>Always use only the file without the extension.</p>
        </ReactTooltip>
        <div className="group-wrap">
          <div className="form-group">
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />
            <label>Mnemonic Seed for your Wallet</label>
            <textarea name="mnemonic" placeholder="mnemonic seed" rows="3" />
          </div>
        </div>
        <button type="submit" className={this.props.buttonDisabled ? "submit btn button-shine disabled" : "submit btn button-shine"}>
          Create
        </button>
      </form>
    );
  }
}
