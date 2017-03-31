const generateSecret = require('../utils/generate-secret');
const sign = require('../utils/sign');
const hash = require('../utils/hash');

const defaults = {
  pbkdf2: undefined, // Must be passed in
  createHmac: undefined, // Must be passed in
  createHash: undefined // Must be passed in
};

/**
 * Generates a set of utilities using the crypto functions that must be passed in.
 * Requiring that the crypto functions are passed in allows these utils to work both
 * on the server and in the browser.
 */
module.exports = function plugin (options) {
  options = Object.assign({}, defaults, options);

  if (!options.pbkdf2) {
    throw new Error('You must provide a `pbkdf2` function to the feathers-authentication-signed plugin options');
  }
  if (!options.createHmac) {
    throw new Error('You must provide a `createHmac` function to the feathers-authentication-signed plugin options');
  }
  if (!options.createHash) {
    throw new Error('You must provide a `createHash` function to the feathers-authentication-signed plugin options');
  }

  let utils = {
    generateSecret: generateSecret(options),
    sign: sign(options),
    createHash: hash(options)
  };

  return utils;
};
