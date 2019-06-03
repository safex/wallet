import React, { Component } from "react";
import ReactTooltip from "react-tooltip";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dark_theme: false
    };
  }

  componentDidMount() {
    if (localStorage.getItem("dark_theme")) {
      document.body.classList.add('dark');
      this.setState({ dark_theme: true });
    }
  }

  changeTheme = () => {
    if (this.state.dark_theme) {
      document.body.classList.remove('dark');
      this.setState({ dark_theme: false });
      localStorage.removeItem("dark_theme");
    } else {
      document.body.classList.add('dark');
      this.setState({ dark_theme: true });
      localStorage.setItem("dark_theme", true);
    }
  }

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

        <div id="buttons-wrap"> 
          <button
            className="button-shine address-info"
            onClick={this.changeTheme}
            data-tip
            data-for="light-tooptip"
          >
            <img src="images/bulb.png" alt="bulb" />
          </button>
          <ReactTooltip place="left" id="light-tooptip">
            {this.state.dark_theme
              ?
                <p>Light Theme</p>
              :  
                <p>Dark Theme</p>
            }
          </ReactTooltip>
        </div>

        <img src="images/logo.png" className="logo" alt="Logo" />
      </header>
    );
  }
}
