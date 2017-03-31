import makeUtils from '../utils/index';

const defaults = {};

export default function plugin (options) {
  options = Object.assign({}, defaults, options);
  let utils = makeUtils(options);

  function signed () {

  }

  return Object.assign(signed, utils);
}
