// import errors from 'feathers-errors';
const makeDebug = require('debug');
const local = require('feathers-authentication-local');
const checkTwoFactor = require('./hook.two-factor');
const createVerifier = require('./verifier');

const debug = makeDebug('feathers-authentication-signed:challenge');
const defaults = {
  idField: 'id',
  name: 'challenge',
  usernameField: 'email',
  passwordField: 'signature',
  userService: 'users'
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
          hook => {
            if (hook.data.strategy === 'challenge') {
              console.log('hook.params.authenticated', hook.params.authenticated);
              debugger;
            }
          },
          checkTwoFactor(options)
        ]
      }
    });
  };
};
