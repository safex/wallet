import React from "react";

export default class ContactName extends React.Component {
  constructor(props) {
    super(props);
    this.ENTER_KEY = 13;
    this.state = {
      editName: props.contactName || "",
      editing: false
    };
  }

  handleChange = e => {
    this.setState({ editName: e.target.value });
  };

  toggleEditing = () => {
    this.setState({ editing: !this.state.editing });
    if (this.state.editing) {
      setTimeout(() => {
        this.editLabel.focus();
      }, 100);
      this.handleSubmit();
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      editing: false,
      editName: e.target.name.value
    });
    this.props.editContact(
      this.props.address,
      this.props.paymentId,
      this.state.editName,
      this.props.rowID
    );
  };

  handleKeyDown = e => {
    if (e.which === this.ENTER_KEY) {
      this.handleSubmit(e);
    }
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <button
            type="button"
            onClick={
              this.state.editing ? this.handleSubmit : this.toggleEditing
            }
            className="edit-contact"
            data-tip
            data-for="edit-tooptip"
          >
            <img
              src="images/edit.png"
              alt="edit"
              style={{ opacity: this.state.editing ? 1 : 0.7 }}
            />
          </button>
          <textarea
            id="name"
            ref={el => (this.editLabel = el) && el.focus()}
            name="name"
            // value={this.state.editName}
            value={this.props.contactName}
            disabled={!this.state.editing}
            onChange={this.handleChange}
            onBlur={this.handleSubmit}
            onKeyDown={this.handleKeyDown}
          />
        </form>
      </div>
    );
  }
}
