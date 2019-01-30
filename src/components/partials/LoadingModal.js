import React from "react";

export default class LoadingModal extends React.Component {
  render() {
    return (
      <div>
        <div
          className={
            this.props.loadingModal
              ? "modal loadingModal active"
              : "modal loadingModal"
          }
        >
          <h3>Loading wallet file, please wait...</h3>
        </div>

        <div
          className={this.props.loadingModal ? "backdrop active" : "backdrop"}
        />
      </div>
    );
  }
}
