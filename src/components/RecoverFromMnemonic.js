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
        "Please wait while your wallet file is being created. Don't close the application until the process is complete. This may take a while, please be patient.",
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
          <p><span className="blue-text">Mnemonic Seed</span> can be used to recover your </p>
          <p className="mb-10">wallet in case your file gets lost or corrupted.</p>
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
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />

            <div className="label-wrap">
              <div
                className="button-shine question-wrap"
                data-tip
                data-for="seed-tooptip"
              >
                <span>?</span>
              </div>
              <ReactTooltip id="seed-tooptip">
                <p className="mb-10"><span className="blue-text">Mnemonic Seed Phrase</span> contains <span className="blue-text">24 or 25</span> words and no numbers.</p>
                <p>
                  Example:{" "}
                  <span className="blue-text">
                    fizzle gyrate arsenic click wives bacon apology richly <br />
                    long inkling avidly gimmick biweekly frying nephew union <br />
                    umpire sack tasked idiom budget lazy getting heels nephew
                  </span>
                </p>
              </ReactTooltip>
            </div>
            <textarea name="mnemonic" placeholder="mnemonic seed" rows="5" />
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
