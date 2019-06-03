import React, { Component } from "react";
import ReactTooltip from "react-tooltip";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class CreateNew extends Component {
  createNew = e => {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;

    if (pass1 === "" || pass2 === "") {
      this.props.setOpenAlert("Fill out all the fields");
      return false;
    }
    if (pass1 !== pass2) {
      this.props.setOpenAlert("Repeated password does not match");
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
      //TODO needs additional sanitation on the passwords, length and type of data
      this.props.createWallet("createWallet", {
        path: filepath,
        password: pass1,
        network: this.props.env.NETWORK,
        daemonAddress: this.props.env.ADDRESS
      });
      localStorage.setItem("wallet_path", filepath);
      localStorage.setItem("password", JSON.stringify(pass1));
      localStorage.setItem("filename", filepath.split("/").pop());
      this.props.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete. This may take a while, please be patient.",
        true
      );
    });
  };

  render() {
    return (
      <form
        className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3"
        onSubmit={this.createNew}
      >
        <div
          data-tip
          data-for="create-new-tooptip"
          className="button-shine question-wrap"
        >
          <span>?</span>
        </div>
        <ReactTooltip id="create-new-tooptip">
          <p>If you don't already have <span className="blue-text">Safex Wallet</span>,</p>
          <p className="mb-10">you can always generate a new one here.</p>
          <p>Enter the password for your new wallet and click <span className="blue-text">create</span>.</p>
          <p>You will then be asked to set a{" "}<span className="blue-text">name</span> for the wallet file.</p>
          <p className="mb-10">Enter file name <span className="blue-text">without</span> the extension and click <span className="blue-text">save</span>.</p>
          <p>This will create <span className="blue-text">2</span> files on your file system.</p>
          <p className="mb-10">
            <span className="blue-text">ExampleWallet</span> and{" "}
            <span className="blue-text">ExampleWallet.keys</span>.
          </p>
          <p>In the future, when you want to <span className="blue-text">load</span> wallet, make</p>
          <p className="mb-10">sure you select the file <span className="blue-text">without</span> the .keys extension.</p>
          <p>Remember to <span className="blue-text">back up your keys</span> for future wallet recovery.</p>
        </ReactTooltip>
        <div className="group-wrap">
          <div className="form-group">
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
          <span>Create</span>
        </button>
      </form>
    );
  }
}
