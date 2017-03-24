const crypto = require('crypto');

/**
 * A hook that adds a `salt` attribute to the incoming hook.data.
 * Intended for use as a before create hook.
 */
module.exports = function (options) {
  return function addUserSalt (hook) {
    return new Promise(resolve => {
      // TODO: Generate a better salt.
      hook.data.salt = crypto.randomBytes(10).toString('hex');
      resolve(hook);
    });
  };
};
