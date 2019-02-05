import React from "react";
const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class NewFromMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  toggleMnemonic = () => {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  };

  hasNumber = myString => {
    return /\d/.test(myString);
  };

  countWords = str => {
    return str.trim().split(/\s+/).length;
  };

  createNewFromMnemonic = e => {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    const mnemonicValue = e.target.mnemonic.value;
    const mnemonic = mnemonicValue.replace(/\s+/g, " ");

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
    if (this.countWords(mnemonic) < 24 || this.countWords(mnemonic) > 25) {
      this.props.setOpenAlert("Mnemonic seed must contain 24 or 25 words");
      return false;
    }
    if (this.hasNumber(mnemonic)) {
      this.props.setOpenAlert("Mnemonic seed must not contain a number");
      return false;
    }
    console.log("word count " + this.countWords(mnemonic));
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
      console.log("Recover wallet from mnemonic performed!");
    });
  };

  render() {
    return (
      <form onSubmit={this.createNewFromMnemonic}>
        <div className="group-wrap">
          <div className="form-group">
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />
            <label>Mnemonic Seed for your Wallet</label>
            <textarea name="mnemonic" placeholder="mnemonic seed" rows="3" />
          </div>
        </div>
        <button type="submit" className="submit btn button-shine">
          Create
        </button>
      </form>
    );
  }
}
