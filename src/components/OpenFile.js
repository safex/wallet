import React from "react";
import ReactTooltip from "react-tooltip";
const { dialog } = window.require("electron").remote;

export default class OpenFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet_path: "",
      alert_close_disabled: false
    };
  }

  browseFile = () => {
    let filename = "";
    filename = dialog.showOpenDialog({});

    if (filename !== undefined) {
      this.setState(() => ({
        wallet_path: filename
      }));
      console.log("filename " + filename);
    }
  };

  openFile = e => {
    e.preventDefault();
    let filename = e.target.filepath.value;
    const pass = e.target.pass.value;

    if (filename === "") {
      this.props.setOpenAlert("Choose the wallet file");
      return false;
    }
    if (pass === "") {
      this.props.setOpenAlert("Enter password for your wallet file");
      return false;
    }
    this.setState({
      alert_close_disabled: true
    });
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
              To open your Safex Wallet, click browse. This will open a dialog
              window.
            </p>
            <p>Choose the wallet file from your file system.</p>
            <p>Always use only the file without the extensiton. </p>
            <p>Enter password for your Wallet and click open.</p>
          </ReactTooltip>
          <div className="group-wrap">
            <div className="form-group">
              <input
                name="filepath"
                value={this.state.wallet_path}
                onChange={this.setWalletPath}
                placeholder="wallet file path"
                readOnly
              />
              <input type="password" name="pass" placeholder="password" />
            </div>
          </div>
          <button type="submit" className="submit btn button-shine">
            Open
          </button>
        </form>
      </div>
    );
  }
}
