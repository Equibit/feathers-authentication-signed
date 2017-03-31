const utils = require('./index');
const crypto = require('crypto');

const options = {
  pbkdf2: crypto.pbkdf2,
  createHmac: crypto.createHmac,
  createHash: crypto.createHash
};

/**
 * The preconfigured utils for the server.
 */
module.exports = utils(options);
