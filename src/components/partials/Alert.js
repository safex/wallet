import React from "react";
import { addClass } from "../../utils/utils.js";

export default class Alert extends React.Component {
  render() {
    return (
      <div>
        <div className={"alert" + addClass(this.props.openAlert, "active")}>
          <div className="mainAlertPopupInner">
            <p className={this.props.alertCloseDisabled ? "disabled" : ""}>
              {this.props.alertText}
            </p>
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
          className={"alertBackdrop" + addClass(this.props.openAlert, "active")}
          onClick={this.props.alertCloseDisabled ? "" : this.props.closeAlert}
        />
      </div>
    );
  }
}
