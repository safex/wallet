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

/**
 * Open Modal
 * @param target
 * @param modal_type
 * @param alert
 * @param disabled
 * @param send_cash_or_token
 */
function openModal(target, modal_type, alert, disabled, cash_or_token) {
  target.setState({
    modal: true,
    [modal_type]: true,
    alert_text: alert,
    cash_or_token: cash_or_token,
    alert_close_disabled: disabled
  });
}

/**
 * Close Modal
 */
function closeModal(target) {
  if (
    (target.state.loading_modal && target.state.alert) ||
    (target.state.address_modal && target.state.alert) ||
    (target.state.send_modal && target.state.alert) ||
    target.state.mixin_modal
  ) {
    target.setState({
      alert: false,
      mixin_modal: false
    });
  } else {
    target.setState({
      modal: false,
      alert_close_disabled: false
    });
    setTimeout(() => {
      target.setState({
        loading_modal: false,
        alert: false,
        address_modal: false,
        send_modal: false,
        mixin_modal: false
      });
    }, 300);
  }
}

/**
 * Close Modal
 */
function closeAlert(target) {
  target.setState({
    modal: false,
    alert_close_disabled: false
  });
  setTimeout(() => {
    target.setState({
      alert: false
    });
  }, 300);
}

/**
 * Parse env object
 */
function parseEnv() {
  const env_obj = {};

  for (let key in process.env)
    env_obj[key.replace("REACT_APP_", "")] = process.env[key];

  return env_obj;
}

/**
 * Round Amount
 */
function roundAmount(balance) {
  return Math.floor(parseFloat(balance) / 100000000) / 100;
}

/**
 * Calculate percentage of 2 numbers
 */
function percentCalculation(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

/**
 * Check if string contains a number
 */
function hasNumber(myString) {
  return /\d/.test(myString);
}

/**
 * Count the number of words in a string
 */
function countWords(str) {
  return str.trim().split(/\s+/).length;
}

export {
  verify_safex_address,
  structureSafexKeys,
  closeApp,
  addClass,
  openModal,
  closeModal,
  closeAlert,
  roundAmount,
  percentCalculation,
  hasNumber,
  countWords,
  parseEnv
};
