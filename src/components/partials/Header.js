import React from "react";
import { closeApp } from "../../utils/utils.js";

const remote = window.require("electron").remote;

export default class Header extends React.Component {
  minimizeApp = () => {
    let window = remote.getCurrentWindow();
    window.minimize();
  };

  maximizeApp = () => {
    let window = remote.getCurrentWindow();

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  };

  setCloseApp = () => {
    closeApp(this);
  };

  render() {
    return (
      <header>
        <button
          onClick={this.props.goToPage}
          className={
            this.props.goToPage ? "go-back-btn button-shine" : "hidden"
          }
          disabled={this.props.alertCloseDisabled ? "disabled" : ""}
        >
          {this.props.page === "wallet" ? "Log out" : "Back"}
        </button>
        <img src="images/logo.png" className="logo" alt="Logo" />
        <div className="buttons-wrap">
          <button
            onClick={this.minimizeApp}
            className="minimize-app-btn button-shine"
            title="Minimize"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            _
          </button>
          <button
            onClick={this.maximizeApp}
            className="maximize-app-btn button-shine"
            title="Maximize"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            <span />
          </button>
          <button
            onClick={this.setCloseApp}
            className="close-app-btn button-shine"
            title="Exit"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            X
          </button>
        </div>
      </header>
    );
  }
}
