import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import NewFromMnemonic from "./NewFromMnemonic";
import ExitModal from "./partials/ExitModal";

const remote = window.require("electron").remote;

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = { closing: false, exit_modal: false };

    this.openCreateNew = this.openCreateNew.bind(this);
    this.openCreateNewFromKeys = this.openCreateNewFromKeys.bind(this);
    this.openFile = this.openFile.bind(this);
    this.openNewFromMnemonic = this.openNewFromMnemonic.bind(this);

    this.openExitModal = this.openExitModal.bind(this);
    this.closeExitModal = this.closeExitModal.bind(this);
    this.closeApp = this.closeApp.bind(this);
  }

  openCreateNew() {
    this.context.router.push("/create-new");
  }

  openCreateNewFromKeys() {
    this.context.router.push("/create-from-keys");
  }

  openFile() {
    this.context.router.push("/open-file");
  }

  openNewFromMnemonic() {
    this.context.router.push("/new-from-mnemonic");
  }

  openExitModal() {
    this.setState({ exit_modal: true });
  }

  closeExitModal() {
    this.setState({ exit_modal: false });
  }

  closeApp() {
    let window = remote.getCurrentWindow();

    this.setState({ closing: true });
    this.closeExitModal();

    setTimeout(() => {
      window.close();
    }, 1000);
  }

  render() {
    <CreateNew />;
    <CreateFromKeys />;
    <OpenFile />;
    <NewFromMnemonic />;
    return (
      <div>
        <div
          className={
            this.state.closing
              ? "options-wrap animated fadeOut"
              : "options-wrap"
          }
        >
          <button
            onClick={this.openExitModal}
            className="close-app-btn button-shine"
            title="Exit"
          >
            X
          </button>
          <div className="item" onClick={this.openCreateNew}>
            <img src="images/create-new.png" alt="create-new" />
            <h3>Create New</h3>
          </div>
          <div className="item" onClick={this.openCreateNewFromKeys}>
            <img src="images/new-from-keys.png" alt="new-from-keys" />
            <h3>New From Keys</h3>
          </div>
          <div className="item" onClick={this.openFile}>
            <img src="images/open-wallet-file.png" alt="open-wallet-file" />
            <h3>Open Wallet File</h3>
          </div>
          <div className="item" onClick={this.openNewFromMnemonic}>
            <img src="images/mnemonic.png" alt="mnemonic" />
            <h3>New from Mnemonic</h3>
          </div>
        </div>

        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.closeExitModal}
          closeApp={this.closeApp}
        />
      </div>
    );
  }
}

CashWallet.contextTypes = {
  router: React.PropTypes.object.isRequired
};
