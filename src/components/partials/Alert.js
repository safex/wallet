import React from "react";

export default class Alert extends React.Component {
  render() {
    return (
      <div>
        <div className={this.props.openAlert ? "alert active" : "alert"}>
          <div className="mainAlertPopupInner">
            <p>{this.props.alertText}</p>
            {this.props.alertCloseDisabled ? (
              <span className="hidden" />
            ) : (
              <span className="close" onClick={this.props.closeAlert}>
                X
              </span>
            )}
          </div>
        </div>

        <div
          className={
            this.props.openAlert ? "alertBackdrop active" : "alertBackdrop"
          }
          onClick={this.props.closeAlert}
        />
      </div>
    );
  }
}
