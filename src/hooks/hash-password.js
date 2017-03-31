const generateSecret = require('../utils/generate-secret');

const defaults = {
  pbkdf2: undefined,
  passwordField: 'password'
};

/**
 * Creates a new password hash to store in the user record.
 * It wraps the generate-salt hook to automatically get a new salt before updating the password.
 * It then uses the salt value as the encryption key for encoding the provided password.
 *
 * Useful as a before hook.
 */
module.exports = function (options) {
  options = Object.assign({}, defaults, options);

  if (!options.pbkdf2) {
    throw new Error('You must provide a `pbkdf2` function to the `hash-password` hook');
  }

  let { passwordField } = options;

  return function (hook) {
    if (!hook.data || !hook.data[passwordField]) {
      throw new Error('Password is required');
    }

    return generateSecret(options)(hook.data[passwordField], hook.data.salt)
      .then(secret => {
        hook.data[passwordField] = secret;
        return hook;
      })
      .catch(error => {
        console.log(error);
        debugger;
      });
  };
};
