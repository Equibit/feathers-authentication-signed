'use strict';

/**
 * Adds a dummy password to the request data for `challenge-request` auth.
 * The dummy password will be the same as the strategy name, but it probably
 * will never matter because the password simply needs to exist.
 */
const defaults = {
  name: 'challenge-request'
};

module.exports = function (options) {
  options = Object.assign({}, defaults, options);

  return function (hook) {
    return new Promise(resolve => {
      if (hook.data.strategy === options.name) {
        hook.data.password = options.name;
      }
      resolve(hook);
    });
  };
};
