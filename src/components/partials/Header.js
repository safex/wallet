import React from "react";
const remote = window.require('electron').remote;
import packageJson from "../../../package";

export default class Buttons extends React.Component {
    minimizeApp = () => {
        let window = remote.getCurrentWindow();
        window.minimize()
    }

    maximizeApp = () => {
        let window = remote.getCurrentWindow();

        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    render() {
        return (
            <header>
                <button
                    onClick={this.props.goToPage}
                    className={this.props.goToPage ? "go-back-btn button-shine" : "hidden"}
                >
                    Back
                </button>
                <img src="images/logo.png" className="logo" alt="Logo" />
                <p id="version">{packageJson.version}</p>
                <div className="buttons-wrap">
                    <button
                        onClick={this.minimizeApp}
                        className="minimize-app-btn button-shine"
                        title="Minimize"
                    >
                        _
                </button>
                    <button
                        onClick={this.maximizeApp}
                        className="maximize-app-btn button-shine"
                        title="Maximize"
                    >
                        <span></span>
                    </button>
                    <button
                        onClick={this.props.toggleExitModal}
                        className="close-app-btn button-shine"
                        title="Exit"
                    >
                        X
                </button>
                </div>
            </header>
            
        );
    }
}
