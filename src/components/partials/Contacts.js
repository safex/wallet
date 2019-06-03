import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import ContactName from "./ContactName";

export default class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = { contact_page: 0, editing: false };
    this.totalContactPages = 0;
  }

  firstContactPage = () => {
    this.setState({ contact_page: 0 });
  };

  previousContactPage = () => {
    if (this.state.contact_page >= 1) {
      this.setState(prevState => ({
        contact_page: prevState.contact_page - 1
      }));
    }
  };

  nextContactPage = () => {
    if (this.state.contact_page < this.totalContactPages - 1) {
      this.setState(prevState => ({
        contact_page: prevState.contact_page + 1
      }));
    }
  };

  lastContactPage = () => {
    this.setState({ contact_page: this.totalContactPages - 1 });
  };

  removeContact = rowID => {
    this.props.setOpenDeleteModal();
    localStorage.setItem("rowID", rowID);
  };

  editContact = (address, paymentID, name, rowID) => {
    let wallet = this.props.walletMeta;
    wallet.addressBook_DeleteRow(rowID);
    setTimeout(() => {
      wallet.addressBook_AddRow(address, paymentID, name);
      wallet.store();
      console.log("Wallet stored");
      this.props.setWalletHistory();
      localStorage.removeItem("rowID");
    }, 100);
    console.log("Wallet edited");
  };

  render() {
    const { contact_page } = this.state;
    const { itemsPerContactPage, contacts } = this.props;
    this.totalContactPages = Math.ceil(contacts.length / itemsPerContactPage);

    return (
      <div>
        {this.props.contacts.length ? (
          contacts
            .slice(
              contact_page * itemsPerContactPage,
              contact_page * itemsPerContactPage + itemsPerContactPage
            )
            .map((contact, i) => {
              return (
                <div className="contact-item" key={i}>
                  <div className="contact-left">
                    {/* <ContactName
                        address={contact.address}
                        paymentId={contact.paymentId}
                        contactName={contact.description}
                        editContact={this.editContact}
                        rowID={contact.rowID}
                      /> */}
                    <p className="name">{contact.description}</p>
                    <p className="payment-id">Payment ID:</p>
                  </div>
                  <ReactTooltip id="edit-tooptip">
                    <p>Edit Contact</p>
                  </ReactTooltip>

                  <div className="contact-center">
                    <p className="address">{contact.address}</p>
                    <p className="payment-id">{contact.paymentId}</p>
                  </div>

                  <div className="contact-right">
                    <CopyToClipboard
                      text={contact.address}
                      onCopy={this.props.onCopy.bind(
                        this,
                        "Copied to clipboard",
                        3000
                      )}
                      data-tip
                      data-for="copy-tooptip"
                      className="button-shine copy-btn"
                    >
                      <button>
                        <img src="images/copy.png" alt="copy" />
                      </button>
                    </CopyToClipboard>
                    <ReactTooltip id="copy-tooptip">
                      <p>Copy Address</p>
                    </ReactTooltip>
                    <button
                      onClick={this.removeContact.bind(this, contact.rowID)}
                      data-tip
                      data-for="remove-tooptip"
                      className="button-shine"
                    >
                      <img src="images/trash.png" alt="trash" />
                    </button>
                    <ReactTooltip id="remove-tooptip">
                      <p>Remove Contact</p>
                    </ReactTooltip>
                    <button
                      onClick={this.props.setOpenSendModal.bind(
                        this,
                        0,
                        contact.address,
                        contact.paymentId,
                        contact.description
                      )}
                      data-tip
                      data-for="send-cash-tooltip"
                      className="button-shine"
                    >
                      <img src="images/send-cash.png" alt="send-cash" />
                    </button>
                    <ReactTooltip id="send-cash-tooltip">
                      <p>Send Safex Cash To This Address</p>
                    </ReactTooltip>
                    <button
                      onClick={this.props.setOpenSendModal.bind(
                        this,
                        1,
                        contact.address,
                        contact.paymentId,
                        contact.description
                      )}
                      data-tip
                      data-for="send-token-tooltip"
                      className="button-shine"
                    >
                      <img src="images/send-token.png" alt="send-token" />
                    </button>
                    <ReactTooltip id="send-token-tooltip">
                      <p>Send Safex Token To This Address</p>
                    </ReactTooltip>
                  </div>
                </div>
              );
            })
        ) : (
          <h5>No Contacts</h5>
        )}

        {this.props.contacts.length ? (
          <div className="pagination">
            <button
              data-tip
              data-for="first-tooptip"
              className="first-page button-shine"
              onClick={this.firstContactPage}
            >
              <span>{"<<"}</span>
            </button>
            <ReactTooltip id="first-tooptip">
              <p>First Page</p>
            </ReactTooltip>
            <button className="button-shine" onClick={this.previousContactPage}>
              previous
            </button>
            <strong>
              page: {contact_page + 1} / {this.totalContactPages}
            </strong>{" "}
            <button className="button-shine" onClick={this.nextContactPage}>
              next
            </button>
            <button
              data-tip
              data-for="last-tooptip"
              className="last-page button-shine"
              onClick={this.lastContactPage}
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
