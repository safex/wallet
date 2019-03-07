import React from "react";
import { closeApp } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";

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
            data-tip
            data-for="minimize-tooptip"
            className="minimize-app-btn button-shine"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            _
          </button>
          <ReactTooltip place="bottom" id="minimize-tooptip">
            <p>Minimize</p>
          </ReactTooltip>
          <button
            onClick={this.maximizeApp}
            data-tip
            data-for="maximize-tooptip"
            className="maximize-app-btn button-shine"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            <span />
          </button>
          <ReactTooltip place="bottom" id="maximize-tooptip">
            <p>Maximize</p>
          </ReactTooltip>
          <button
            onClick={this.setCloseApp}
            data-tip
            data-for="exit-tooptip"
            className="close-app-btn button-shine"
            disabled={this.props.alertCloseDisabled ? "disabled" : ""}
          >
            X
          </button>
          <ReactTooltip place="bottom" id="exit-tooptip">
            <p>Exit</p>
          </ReactTooltip>
        </div>
      </header>
    );
  }
}
