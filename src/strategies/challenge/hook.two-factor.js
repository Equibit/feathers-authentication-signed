const defaults = {
  name: 'challenge',
  twoFactorField: 'twoFactor',
  entity: 'user'
};

/**
 * Send a different result based on if the user has twoFactor auth enabled.
 * This hook is only concerned with changing the data, because the ./verifier.js
 * will have already set hook.params.authenticated to false in order to prevent
 * the socket.io connection from getting flagged as authenticated.  Users with
 * twoFactor auth enabled are only considered logged in after they authenticate
 * the second factor.
 */
module.exports = function (options = {}) {
  options = Object.assign(defaults, options);
  const { entity, twoFactorField } = options;

  return function verifySignature (hook) {
    return new Promise(function (resolve, reject) {
      // Only run for the challenge strategy.
      if (hook.data.strategy === options.name) {
        const twoFactor = hook.params[entity][twoFactorField];

        // At this point, hook.result would be { accessToken }
        // If the user record has a `twoFactor` field, overwrite hook.result
        // to only contain the twoFactor information.
        if (twoFactor) {
          hook.result = { twoFactor };
        }
      }
      resolve(hook);
    });
  };
};
