import React, { Component } from "react";
import { closeApp } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";

const remote = window.require("electron").remote;

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      window: ''
    };

    this.window = remote.getCurrentWindow();
  }

  minimizeApp = () => {
    this.window.minimize();
  };

  maximizeApp = () => {
    if (this.window.isMaximized()) {
      this.setState({
        window: 'unmaximized'
      })
      this.window.unmaximize();
    } else {
      this.setState({
        window: 'maximized'
      })
      this.window.maximize();
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
            {
              this.state.window === 'maximized'
              ?
                <p>Restore</p>
              :
                <p>Maximize</p>
            }
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
