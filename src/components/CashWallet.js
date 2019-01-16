import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";
import OpenFile from "./OpenFile";
import RecoverFromMnemonic from "./RecoverFromMnemonic";
import ExitModal from "./partials/ExitModal";
import { closeApp } from "../utils/utils.js";

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: null,
      show_page: false
    };

    this.goBack = this.goBack.bind(this);
    this.openCreateNew = this.openCreateNew.bind(this);
    this.openCreateNewFromKeys = this.openCreateNewFromKeys.bind(this);
    this.openFile = this.openFile.bind(this);
    this.openNewFromMnemonic = this.openNewFromMnemonic.bind(this);

    this.toggleExitModal = this.toggleExitModal.bind(this);
    this.setCloseApp = this.setCloseApp.bind(this);
  }

  openCreateNew() {
    this.setState({ page: "create-new", show_page: true });
  }

  openCreateNewFromKeys() {
    this.setState({ page: "create-from-keys", show_page: true });
  }

  openFile() {
    this.setState({ page: "open-file", show_page: true });
  }

  openNewFromMnemonic() {
    this.setState({ page: "recover-from-mnemonic", show_page: true });
  }

  toggleExitModal() {
    this.setState({ exit_modal: !this.state.exit_modal });
  }

  setCloseApp() {
    closeApp(this);
  }

  goBack() {
    this.setState({ page: null, show_page: false });
  }

  render() {
    let page;

    switch (this.state.page) {
      case "create-new":
        page = <CreateNew goBack={this.goBack} />;
        break;
      case "create-from-keys":
        page = <CreateFromKeys goBack={this.goBack} />;
        break;
      case "open-file":
        page = <OpenFile goBack={this.goBack} />;
        break;
      case "recover-from-mnemonic":
        page = <RecoverFromMnemonic goBack={this.goBack} />;
        break;
    }
    return (
      <div>
        <div
          className={
            this.state.show_page
              ? "options-wrap option-wrap-hidden"
              : "options-wrap"
          }
        >
          <div
            className={
              this.state.show_page ? "options-inner hidden" : "options-inner"
            }
          >
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
          <button
            onClick={this.toggleExitModal}
            className="close-app-btn button-shine"
            title="Exit"
          >
            X
          </button>
        </div>

        <ExitModal
          exitModal={this.state.exit_modal}
          closeExitModal={this.toggleExitModal}
          closeApp={this.setCloseApp}
        />

        <div
          className={this.state.show_page ? "page-wrap" : "page-wrap hidden"}
        >
          {page}
        </div>
      </div>
    );
  }
}
