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
 *
 * key object
 * {
 *     spend : {
 *         sec : secret_key
 *         pub: : public_key
 *     },
 *     view : {
 *         sec : secret_key
 *         pub: : public_key
 *     },
 *     checksum : checksum of address
 * }
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
function openAlert(target, alert, alert_state, disabled) {
  target.setState({
    [alert_state]: true,
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
    open_file_alert: false,
    create_new_wallet_alert: false,
    create_from_keys_alert: false,
    new_from_mnemonic_alert: false,
    alert_close_disabled: false
  });
}

/**
 * Open Send Popup
 */
function openSendPopup(target, currency) {
  target.setState({
    [currency]: true,
  });
}

/**
 * Close Send Popup
 */
function closeSendPopup(target) {
  target.setState({
    send_cash: false,
    send_token: false
  });
}

/**
 * Close App
 */
function closeApp(target) {
  let window = remote.getCurrentWindow();
  window.close();
}

module.exports = {
  verify_safex_address,
  structureSafexKeys,
  openAlert,
  closeAlert,
  openSendPopup,
  closeSendPopup,
  closeApp
};
