// import errors from 'feathers-errors';
const makeDebug = require('debug');
const challengeRequest = require('./strategies/challenge-request/index');
const challenge = require('./strategies/challenge/index');
const addUserSalt = require('./hooks/add-user-salt');

const debug = makeDebug('feathers-authentication-signed');
const defaults = {
  idField: 'id',
  userService: 'users'
};

function assignSharedOptions (fields, options) {
  options.challenge = options.challenge || {};
  options.challengeRequest = options.challengeRequest || {};

  fields.forEach(field => {
    if (options[field]) {
      options.challenge[field] = options[field];
      options.challengeRequest[field] = options[field];
    }
  });
}

function plugin (options = {}) {
  options = Object.assign({}, defaults, options);
  debug('Initializing feathers-authentication-signed plugin with options', options);

  function feathersAuthenticationSigned () {
    const app = this;

    assignSharedOptions(['idField', 'userService'], options);

    app.configure(challengeRequest(options.challengeRequest));
  }

  return feathersAuthenticationSigned;
}

plugin.challengeRequest = challengeRequest;
plugin.challenge = challenge;
plugin.hooks = {
  addUserSalt
};

module.exports = plugin;
