import React, { Component } from "react";
import { roundAmount } from "../../utils/utils.js";
import ReactTooltip from "react-tooltip";

const { shell } = window.require("electron");

export default class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = { tx_page: 0 };
    this.totalTxPages = 0;
  }

  firstTxPage = () => {
    this.setState({ tx_page: 0 });
  };

  previousTxPage = () => {
    if (this.state.tx_page >= 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page - 1 }));
    }
  };

  nextTxPage = () => {
    if (this.state.tx_page < this.totalTxPages - 1) {
      this.setState(prevState => ({ tx_page: prevState.tx_page + 1 }));
    }
  };

  lastTxPage = () => {
    this.setState({ tx_page: this.totalTxPages - 1 });
  };

  externalLink = txid => {
    if (process.env.NODE_ENV === "development") {
      shell.openExternal("http://178.128.89.114/search?value=" + txid);
    } else {
      shell.openExternal("http://explore.safex.io/search?value=" + txid);
    }
  };

  render() {
    const { tx_page } = this.state;
    const { itemsPerPage, history } = this.props;
    this.totalTxPages = Math.ceil(history.length / itemsPerPage);
    let options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    };

    return (
      <div>
        {this.props.history.length ? (
          history
            .slice(
              tx_page * itemsPerPage,
              tx_page * itemsPerPage + itemsPerPage
            )
            .map((txInfo, i) => {
              return (
                <div className="history-item" key={i}>
                  <div className="row">
                    <div className="col-xs-5 item-section">
                      <p className={txInfo.pending ? "hidden" : ""}>
                        <img
                          src={
                            txInfo.direction === "in"
                              ? "images/arrow-down.png"
                              : "images/arrow-up.png"
                          }
                          className="arrow-img"
                          alt="arrow-img"
                        />
                        <span
                          className={
                            txInfo.direction === "in" ? "green-text" : ""
                          }
                        >
                          {txInfo.direction === "in" ? "Received" : "Sent"}
                        </span>
                      </p>
                      <p className={txInfo.pending ? "yellow-text" : "hidden"}>
                        {txInfo.pending}
                      </p>
                      {roundAmount(txInfo.tokenAmount) === 0 ? (
                        <span
                          className={
                            txInfo.direction === "in"
                              ? "green-text amount"
                              : "amount"
                          }
                        >
                          SFX {roundAmount(txInfo.amount)}
                        </span>
                      ) : (
                        <span
                          className={
                            txInfo.direction === "in"
                              ? "green-text amount"
                              : "amount"
                          }
                        >
                          SFT {roundAmount(txInfo.tokenAmount)}
                        </span>
                      )}
                    </div>
                    <div className="col-xs-7 item-section">
                      <p className="text-right">
                        {"" +
                          new Date(txInfo.timestamp * 1000).toLocaleDateString(
                            "en-US",
                            options
                          )}
                      </p>
                      <p className={txInfo.direction === "in" ? "hidden" : ""}>
                        Fee: SFX {roundAmount(txInfo.fee)}
                      </p>
                    </div>
                  </div>

                  <div className="tx-id-wrap">
                    <span>Transaction ID:</span>
                    <p
                      data-tip
                      data-for="link-tooptip"
                      className="tx-id"
                      onClick={this.externalLink.bind(this, txInfo.id)}
                    >
                      {txInfo.id}
                    </p>
                    <ReactTooltip id="link-tooptip">
                      <p>
                        Show this transaction on{" "}
                        <span className="blue-text">
                          Safex Blockchain Explorer
                        </span>
                      </p>
                    </ReactTooltip>
                  </div>
                </div>
              );
            })
        ) : (
          <h5>No Transaction History</h5>
        )}

        {this.props.history.length ? (
          <div className="pagination">
            <button
              data-tip
              data-for="first-tooptip"
              className="first-page button-shine"
              onClick={this.firstTxPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousTxPage}>
              previous
            </button>
            <strong>
              page: {tx_page + 1} / {this.totalTxPages}
            </strong>{" "}
            <button className="button-shine" onClick={this.nextTxPage}>
              next
            </button>
            <button
              data-tip
              data-for="last-tooptip"
              className="last-page button-shine"
              onClick={this.lastTxPage}
            >
              <span>{">>"}</span>
            </button>
            <ReactTooltip id="last-tooptip">
              <p>Last Page</p>
            </ReactTooltip>
          </div>
        ) : (
          <div className="hidden" />
        )}
      </div>
    );
  }
}
