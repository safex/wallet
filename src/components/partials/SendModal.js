import React from "react";

export default class SendModal extends React.Component {
    render() {
        return (
            <div>
                <div className={this.props.send_cash || this.props.send_token
                    ? 'modal sendModal active'
                    : 'modal sendModal'}>
                    <div className="sendModalInner">
                        <span className="close" onClick={this.props.closeSendPopup}>X</span>
                        {
                            this.props.send_cash
                                ?
                                <div>
                                    <h3>Send Cash</h3>
                                    <form onSubmit={this.props.sendCash}>

                                        <label htmlFor="send_to">Destination</label>
                                        <textarea name="send_to" placeholder="Enter Destination Address" rows="2" />

                                        <label htmlFor="amount">Amount</label>
                                        <input name="amount" placeholder="Enter Amount" />
                                        <button className="btn button-shine" type="submit">Send</button>
                                    </form>
                                </div>
                                :
                                <div>
                                    {
                                        this.props.send_token
                                            ?
                                            <div>
                                                <h3>Send Tokens</h3>
                                                <form onSubmit={this.props.sendToken}>
                                                    <label htmlFor="send_to">Destination</label>
                                                    <textarea name="send_to" placeholder="Enter Destination Address" rows="2" />

                                                    <label htmlFor="amount">Amount</label>
                                                    <input name="amount" placeholder="Enter Amount" />
                                                    <button className="btn button-shine" type="submit">Send</button>
                                                </form>
                                            </div>
                                            :
                                            <div className="hidden"></div>
                                    }
                                </div>
                        }

                    </div>
                </div>

                <div className={this.props.send_cash || this.props.send_token
                    ? 'backdrop active'
                    : 'backdrop'} onClick={this.props.closeSendPopup}>
                </div>
            </div>
        );
    }
}