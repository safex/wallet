import React, { Component } from "react";

export default class Header extends Component {
  render() {
    return (
      <header>
        <button
          onClick={this.props.goToPage}
          className={
            this.props.page === "wallet" ||
            this.props.page === "create-new" ||
            this.props.page === "create-from-keys" ||
            this.props.page === "open-file" ||
            this.props.page === "recover-from-mnemonic"
              ? "go-back-btn button-shine"
              : "hidden"
          }
          disabled={this.props.alertCloseDisabled ? "disabled" : ""}
        >
          {this.props.page === "wallet" ? "Log out" : "Back"}
        </button>

        <img src="images/logo.png" className="logo" alt="Logo" />
      </header>
    );
  }
}
