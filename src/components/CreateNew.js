import React from "react";
import Wallet from "./Wallet";

export default class CreateNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //wallet state settings
      wallet: {},
      wallet_connected: false,
      blockchain_height: 0,
      wallet_sync: false,
      wallet_loaded: false,
      wallet_exists: false,
      wallet_path: "",
      spend_key: "",
      view_key: "",
      open_file_alert: false,
      net: "mainnet",
      daemonHostPort: "rpc.safex.io:17402",
      mnemonic: "",
      mnemonic_active: false,
      balance: 0,
      unlocked_balance: 0,
      tokens: 0,
      unlocked_tokens: 0,
      balance_wallet: "",
      balance_view_key: "",
      balance_spend_key: "",
      send_cash: false,
      send_token: false
    }; //balance settings

    this.goToPage = this.goToPage.bind(this);
    this.createNew = this.createNew.bind(this);
    this.createAnotherFile = this.createAnotherFile.bind(this);
    this.closeWallet = this.closeWallet.bind(this);
  }

  goToPage() {
    this.props.goToPage();
  }

  toggleMnemonic() {
    this.setState({
      mnemonic_active: !this.state.mnemonic_active
    });
  }

  // createNew(e) {
  //   e.preventDefault();

  //   const pass1 = e.target.pass1.value;
  //   const pass2 = e.target.pass2.value;
  //   console.log("new wallet password: " + e.target.pass1.value);

  //   if (this.state.wallet_created) {
  //     this.setState(() => ({
  //       wallet_created: false
  //     }));
  //     this.refs.pass1.value = "";
  //     this.refs.pass2.value = "";
  //   } else {
  //     if (pass1 !== "" || pass2 !== "") {
  //       if (pass1 === pass2) {
  //         dialog.showSaveDialog(filepath => {
  //           if (filepath !== undefined) {
  //             this.setState({
  //               wallet_path: filepath,
  //               password: pass1
  //             });
  //             //TODO needs additional sanitation on the passwords, length and type of data

  //             var args = {
  //               path: filepath,
  //               password: this.state.password,
  //               network: this.state.net,
  //               daemonAddress: this.state.daemonHostPort,
  //               mnemonic: ""
  //             };
  //             if (!safex.walletExists(filepath)) {
  //               this.setState(() => ({
  //                 wallet_exists: false,
  //                 modal_close_disabled: true
  //               }));
  //               this.setOpenAlert(
  //                 "Please wait while your wallet file is being created. Don't close the application until the process is complete.",
  //                 "create_new_wallet_alert",
  //                 true
  //               );
  //               console.log(
  //                 "wallet doesn't exist. creating new one: " +
  //                   this.state.wallet_path
  //               );

  //               safex
  //                 .createWallet(args)
  //                 .then(wallet => {
  //                   this.setState({
  //                     wallet: wallet,
  //                     wallet_address: wallet.address(),
  //                     spend_key: wallet.secretSpendKey(),
  //                     view_key: wallet.secretViewKey(),
  //                     mnemonic: wallet.seed()
  //                   });
  //                   console.log("wallet address  " + this.state.wallet_address);
  //                   console.log(
  //                     "wallet spend private key  " + this.state.spend_key
  //                   );
  //                   console.log(
  //                     "wallet view private key  " + this.state.view_key
  //                   );
  //                   console.log("Wallet seed: " + wallet.seed());
  //                   wallet.on("refreshed", () => {
  //                     console.log("Wallet File successfully created!");
  //                     this.refs.pass1.value = "";
  //                     this.refs.pass2.value = "";
  //                     this.openFile();
  //                     wallet
  //                       .store()
  //                       .then(() => {
  //                         console.log("Wallet stored");
  //                       })
  //                       .catch(e => {
  //                         console.log("Unable to store wallet: " + e);
  //                       });
  //                   });
  //                 })
  //                 .catch(err => {
  //                   this.setOpenAlert(
  //                     "error with the creation of the wallet " + err,
  //                     "create_new_wallet_alert",
  //                     false
  //                   );
  //                   console.log("error with the creation of the wallet " + err);
  //                 });
  //             } else {
  //               this.setState(() => ({
  //                 modal_close_disabled: false
  //               }));
  //               this.setOpenAlert(
  //                 "Wallet already exists. Please choose a different file name  " +
  //                   "this application does not enable overwriting an existing wallet file " +
  //                   "OR you can open it using the Load Existing Wallet",
  //                 "create_new_wallet_alert",
  //                 false
  //               );
  //               console.log(
  //                 "Wallet already exists. Please choose a different file name  " +
  //                   "this application does not enable overwriting an existing wallet file " +
  //                   "OR you can open it using the Load Existing Wallet"
  //               );
  //             }
  //           }
  //         });
  //       } else {
  //         this.setOpenAlert(
  //           "Repeated password does not match",
  //           "create_new_wallet_alert",
  //           false
  //         );
  //         console.log("Repeated password does not match");
  //       }
  //       //pass dialog box
  //       //pass password
  //       //confirm password
  //     } else {
  //       this.setOpenAlert(
  //         "Fill out all the fields",
  //         "create_new_wallet_alert",
  //         false
  //       );
  //     }
  //   }
  // }

  createNew(e) {
    e.preventDefault();

    const pass1 = e.target.pass1.value;
    const pass2 = e.target.pass2.value;
    console.log("new wallet password: " + e.target.pass1.value);

    if (this.state.wallet_created) {
      this.setState(() => ({
        wallet_created: false
      }));
      this.refs.pass1.value = "";
      this.refs.pass2.value = "";
    } else {
      if (pass1 !== "" || pass2 !== "") {
        if (pass1 === pass2) {
          this.setState({
            password: pass1
          });
          //TODO needs additional sanitation on the passwords, length and type of data

          this.props.createWallet("createWallet", {
            password: pass1,
            network: this.state.net,
            daemonAddress: this.state.daemonHostPort,
            mnemonic: ""
          });
        } else {
          this.setOpenAlert(
            "Repeated password does not match",
            "create_new_wallet_alert",
            false
          );
          console.log("Repeated password does not match");
        }
        //pass dialog box
        //pass password
        //confirm password
      } else {
        this.setOpenAlert(
          "Fill out all the fields",
          "create_new_wallet_alert",
          false
        );
      }
    }
  }

  createAnotherFile() {
    this.setState({
      wallet_exists: false,
      wallet_created: false
    });
    this.closeWallet();
  }

  closeWallet() {
    this.state.wallet.pauseRefresh();
    this.state.wallet.off();
    this.state.wallet.close(true);
  }

  render() {
    let wallet;

    if (this.state.wallet_created) {
      wallet = (
        <Wallet
          openAnotherFile={this.createAnotherFile}
          balanceWallet={this.state.balance_wallet}
          walletConnected={this.state.wallet_connected}
          blockchainHeight={this.state.blockchain_height}
          spendKey={this.state.spend_key}
          viewKey={this.state.view_key}
          balance={this.state.balance}
          unlockedBalance={this.state.unlocked_balance}
          tokens={this.state.tokens}
          unlockedTokens={this.state.unlocked_tokens}
        />
      );
    }
    return (
      <div className="create-new-wrap">
        <img
          src="images/create-new.png"
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
        <div
          className={
            this.state.wallet_created
              ? "create-new-inner hidden"
              : "create-new-inner"
          }
        >
          <h2>Create New Wallet File</h2>
          <div className="col-xs-6 col-xs-push-3 login-wrap">
            <form
              className={this.state.mnemonic_active ? "hidden" : ""}
              onSubmit={this.createNew}
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
                  <div
                    className={
                      this.state.wallet_created
                        ? "input-group"
                        : "input-group hidden"
                    }
                  >
                    <label>Mnemonic Seed for your Wallet</label>
                    <textarea
                      name="mnemonic"
                      value={this.state.mnemonic}
                      placeholder="mnemonic seed for your wallet"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="submit btn button-shine">
                {this.state.wallet_created ? (
                  <span>Create New</span>
                ) : (
                  <span>Create</span>
                )}
              </button>
            </form>
          </div>
        </div>
        <div className={this.state.wallet_created ? "wallet-wrap" : "hidden"}>
          {wallet}
        </div>
      </div>
    );
  }
}
