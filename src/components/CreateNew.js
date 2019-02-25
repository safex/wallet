import React from "react";

const safex = window.require("safex-nodejs-libwallet");
const { dialog } = window.require("electron").remote;

export default class CreateNew extends React.Component {
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
      this.props.setOpenAlert(
        "Please wait while your wallet file is being created. Don't close the application until the process is complete.",
        true
      );
    });
  };

  render() {
    return (
      <form onSubmit={this.createNew}>
        <div className="group-wrap">
          <div className="form-group">
            <input type="password" name="pass1" placeholder="password" />
            <input type="password" name="pass2" placeholder="repeat password" />
          </div>
        </div>
        <button type="submit" className="submit btn button-shine">
          <span>Create</span>
        </button>
      </form>
    );
  }
}
