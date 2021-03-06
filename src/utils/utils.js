var safex = window.require("safex-addressjs");

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
 * @param modal_width
 */
function openModal(
  target,
  modal_type,
  alert,
  disabled,
  cash_or_token,
  modal_width,
  remove_transition
) {
  target.setState({
    modal: true,
    [modal_type]: true,
    alert_text: alert,
    alert_close_disabled: disabled,
    remove_transition: remove_transition,
    button_disabled: true
  });
}

/**
 * Close Modal
 */
function closeModal(target) {
  if (
    (target.state.loading_modal && target.state.alert) ||
    (target.state.send_modal && target.state.alert) ||
    (target.state.send_modal && target.state.fee_modal)
  ) {
    target.setState({
      alert: false,
      confirm_modal: false,
      delete_modal: false,
      fee_modal: false
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
        send_modal: false,
        confirm_modal: false,
        delete_modal: false,
        fee_modal: false,
        modal_width: "",
        remove_transition: false
      });
    }, 300);
    setTimeout(() => {
      target.setState({
        button_disabled: false
      });
    }, 1000);
  }
}

/**
 * Close Alert
 */
function closeAlert(target) {
  target.setState({
    modal: false
  });
  setTimeout(() => {
    target.setState({
      alert: false,
      alert_close_disabled: false,
      button_disabled: false,
      modal_width: "",
      remove_transition: false
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
