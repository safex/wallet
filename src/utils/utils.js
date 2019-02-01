var safex = window.require("safex-addressjs");
const remote = window.require("electron").remote;

/**
 * Verify Safex Address
 */
function verify_safex_address(spend, view, address) {
  var spend_pub = safex.sec_key_to_pub(spend);
  var view_pub = safex.sec_key_to_pub(view);

  var _address = safex.pubkeys_to_string(spend_pub, view_pub);

  if (_address === address) {
    return true;
  } else {
    return false;
  }
}

/**
 * Structure Safex Address
 */
function structureSafexKeys(spend, view) {
  const keys = safex.structure_keys(spend, view);
  const checksum = safex.address_checksum(keys.spend.pub, keys.view.pub);
  keys["checksum"] = checksum;

  return keys;
}

/**
 * Open Alert Popup
 * @param alert
 * @param alert_state
 * @param disabled
 */
function openAlert(target, alert, disabled) {
  target.setState({
    alert: true,
    alert_text: alert,
    alert_close_disabled: disabled
  });
}

/**
 * Close Alert Popup
 */
function closeAlert(target) {
  target.setState({
    alert: false,
    alert_close_disabled: false
  });
}

/**
 * Open Send Popup
 */
function openSendPopup(target, send_cash_or_token) {
  target.setState({
    send_modal: true,
    send_cash_or_token: send_cash_or_token
  });
}

/**
 * Close Send Popup
 */
function closeSendPopup(target) {
  target.setState({
    send_modal: false
  });
  setTimeout(() => {
    target.setState({
      send_cash_or_token: false
    });
  }, 300);
}

/**
 * Close App
 */
function closeApp() {
  let window = remote.getCurrentWindow();
  window.close();
}

/**
 * Add class
 */
const addClass = (condition, className) => (condition ? ` ${className} ` : "");

module.exports = {
  verify_safex_address,
  structureSafexKeys,
  openAlert,
  closeAlert,
  openSendPopup,
  closeSendPopup,
  closeApp,
  addClass
};
