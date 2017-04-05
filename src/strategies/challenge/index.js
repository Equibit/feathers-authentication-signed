// import errors from 'feathers-errors';
const makeDebug = require('debug');
const local = require('feathers-authentication-local');
const checkTwoFactor = require('./hook.two-factor');
const removeChallenge = require('./hook.remove-challenge');
const createVerifier = require('./verifier');

const debug = makeDebug('feathers-authentication-signed:challenge');
const defaults = {
  idField: 'id',
  name: 'challenge',
  usernameField: 'email',
  passwordField: 'signature',
  userService: 'users',
  dbPasswordField: 'password',
  dbTempPasswordField: 'tempPassword',
  dbTempPasswordExpiresAtField: undefined // Setting this checks this field to compare expiration to the current date.
};

module.exports = function challengeStrategy (options = {}) {
  options = Object.assign(defaults, options);
  debug('Initializing feathers-authentication-signed:challenge plugin', options);

  return function () {
    const app = this;
    options.Verifier = options.Verifier || createVerifier(options, app);

    app.configure(local(options));

    app.service('authentication').hooks({
      before: {
        create: []
      },
      after: {
        create: [
          removeChallenge(options),
          checkTwoFactor(options)
        ]
      }
    });
  };
};
