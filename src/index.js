const makeDebug = require('debug');
const crypto = require('crypto');
const challengeRequest = require('./strategies/challenge-request/index');
const challenge = require('./strategies/challenge/index');
const hashPassword = require('./hooks/hash-password');
const generateSalt = require('./hooks/generate-salt');
const debug = makeDebug('feathers-authentication-signed');
const defaults = {
  idField: 'id',
  userService: 'users',
  pbkdf2: crypto.pbkdf2,
  createHmac: crypto.createHmac,
  createHash: crypto.createHash
};

function plugin (options = {}) {
  options = Object.assign({}, defaults, options);
  plugin.options = options;
  debug('Initializing feathers-authentication-signed plugin with options', options);

  function feathersAuthenticationSigned () {
    const app = this;

    app.configure(challengeRequest(options));
    app.configure(challenge(options));
  }

  return feathersAuthenticationSigned;
}

plugin.challengeRequest = challengeRequest;
plugin.challenge = challenge;
plugin.hooks = {
  hashPassword,
  generateSalt
};

module.exports = plugin;
