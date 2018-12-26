import React from "react";
import CreateNew from "./CreateNew";
import CreateFromKeys from "./CreateFromKeys";

export default class CashWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.openCreateNew = this.openCreateNew.bind(this);
    this.openCreateNewFromKeys = this.openCreateNewFromKeys.bind(this);
  }

  openCreateNew() {
    this.context.router.push("/create-new");
  }

  openCreateNewFromKeys() {
    this.context.router.push("/create-from-keys");
  }

  render() {
    <CreateNew />;
    <CreateFromKeys />;
    return (
      <div>
        <div className="options-wrap fadeIn">
          <div className="item" onClick={this.openCreateNew}>
            <img src="images/create-new.png" alt="create-new" />
            <h3>Create New</h3>
          </div>
          <div className="item" onClick={this.openCreateNewFromKeys}>
            <img src="images/new-from-keys.png" alt="new-from-keys" />
            <h3>New From Keys</h3>
          </div>
          <div className="item">
            <img src="images/open-wallet-file.png" alt="open-wallet-file" />
            <h3>Open Wallet File</h3>
          </div>
          <div className="item">
            <img src="images/mnemonic.png" alt="mnemonic" />
            <h3>New from Mnemonic</h3>
          </div>
        </div>

        <div
          className={
            this.state.create_new ? "create-new-wrap active" : "create-new-wrap"
          }
        >
          <h2>Create New</h2>
        </div>
      </div>
    );
  }
}

CashWallet.contextTypes = {
  router: React.PropTypes.object.isRequired
};
