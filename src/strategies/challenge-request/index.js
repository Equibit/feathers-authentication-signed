// import errors from 'feathers-errors';
const makeDebug = require('debug');
const local = require('feathers-authentication-local');
const authHook = require('./hook.create-challenge');
const preventSocketAuth = require('./hook.prevent-socket-auth');
const addDummyPassword = require('./hook.add-dummy-password');
const createVerifier = require('./verifier');

const debug = makeDebug('feathers-authentication-signed:challenge-request');
const defaults = {
  idField: 'id',
  name: 'challenge-request',
  userService: 'users'
};

module.exports = function init (options = {}) {
  options = Object.assign(defaults, options);
  debug('Initializing feathers-authentication-signed:challenge-request plugin', options);

  return function () {
    const app = this;
    options.Verifier = options.Verifier || createVerifier(options, app);

    app.configure(local(options));

    app.service('authentication').hooks({
      before: {
        create: [
          // TODO: Test to make sure the socket doesn't get authenticated.
          preventSocketAuth(),
          addDummyPassword()
        ]
      },
      after: {
        create: [
          authHook(options)
        ]
      }
    });
  };
};
