import React from "react";
const remote = window.require("electron").remote;
import packageJson from "../../../package";

export default class Buttons extends React.Component {
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
          Back
        </button>
        <button
          onClick={this.props.logOut}
          className={this.props.logOut ? "go-back-btn button-shine" : "hidden"}
          disabled={this.props.alertCloseDisabled ? "disabled" : ""}
        >
          Log out
        </button>
        <img src="images/logo.png" className="logo" alt="Logo" />
        <p id="version">{packageJson.version}</p>
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
            onClick={this.props.toggleExitModal}
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
