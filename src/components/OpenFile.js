import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
const { dialog } = window.require("electron").remote;

export default class OpenFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: "",
      filename: "",
      alert_close_disabled: false
    };
  }

  browseFile = () => {
    let filepath = dialog.showOpenDialog({});

    if (filepath !== undefined) {
      this.setState(() => ({
        wallet_path: filepath[0]
      }));
    }
  };

  openFile = e => {
    e.preventDefault();
    let filepath = e.target.filepath.value;
    const pass = e.target.pass.value;

    console.log(filepath);

    if (filepath === "") {
      this.props.setOpenAlert("Choose the wallet file");
      return false;
    }
    if (pass === "") {
      this.props.setOpenAlert("Enter password for your wallet file");
      return false;
    }
    this.props.createWallet(
      "openWallet",
      {
        path: this.state.wallet_path,
        password: pass,
        network: this.props.env.NETWORK,
        daemonAddress: this.props.env.ADDRESS
      },
      err => {
        this.props.setOpenAlert("Error opening wallet: " + err);
        return false;
      }
    );
    localStorage.setItem("wallet_path", this.state.wallet_path);
    localStorage.setItem("password", JSON.stringify(pass));
    localStorage.setItem("filename", filepath.split("/").pop());
    this.props.setOpenAlert(
      "Please wait while your wallet file is loaded. Don't close the application until the process is complete. This can take a while, please be patient.",
      true
    );
  };

  setWalletPath = e => {
    let filename = e.target.value;
    this.setState({ wallet_path: filename });
  };

  render() {
    return (
      <div className="col-xs-12 col-sm-8 col-sm-push-2 col-md-6 col-md-push-3 open-file-wrap">
        <button className="browse-btn button-shine" onClick={this.browseFile}>
          Browse
        </button>
        <form onSubmit={this.openFile}>
          <div
            data-tip
            data-for="open-tooptip"
            className="button-shine question-wrap"
          >
            <span>?</span>
          </div>
          <ReactTooltip id="open-tooptip">
            <p>
              To open your <span className="blue-text">Safex Wallet</span>,
              click browse.
            </p>
            <p>
              This will open a <span className="blue-text">dialog window.</span>
            </p>
            <p>
              Choose the <span className="blue-text">Wallet File</span> from
              your file system.
            </p>
            <p>
              In the future, when you want to{" "}
              <span className="blue-text">load</span> wallet,{" "}
            </p>
            <p>make sure you select the file without the .keys extension.</p>
            <p>
              Enter password for your{" "}
              <span className="blue-text">Wallet File</span> and click open.
            </p>
          </ReactTooltip>
          <div className="group-wrap">
            <div className="form-group">
              <label htmlFor="filepath">Selected file:</label>
              <input
                name="filepath"
                value={this.state.wallet_path ? this.state.wallet_path : "N/A"}
                onChange={this.setWalletPath}
                placeholder="wallet file path"
                id="filepath"
                readOnly
              />
              <input type="password" name="pass" placeholder="password" />
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
            Open
          </button>
        </form>
      </div>
    );
  }
}
