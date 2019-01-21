import React from "react";

export default class ExitModal extends React.Component {
  render() {
    return (
      <div>
        <div
          className={
            this.props.exitModal ? "modal exitModal active" : "modal exitModal"
          }
        >
          <span className="close" onClick={this.props.closeExitModal}>
            X
          </span>
          <h3>Are you sure you want to exit?</h3>
          <div className="btns-wrap">
            <button className="cancel-btn button-shine" onClick={this.props.closeExitModal}>
              Cancel
            </button>
            <button className="confirm-btn button-shine" onClick={this.props.closeApp}>
              Exit
            </button>
          </div>
        </div>

        <div
          className={this.props.exitModal ? "backdrop exitBackdrop active" : "backdrop exitBackdrop"}
          onClick={this.props.closeExitModal}
        />
      </div>
    );
  }
}
