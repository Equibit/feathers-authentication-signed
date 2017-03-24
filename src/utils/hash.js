/**
 * Generates a hash using the provided `options.createHash` function.
 */
module.exports = function (options) {
  return function createHash (dataString) {
    let hmac = options.createHash('sha512');
    return hmac.update(dataString).digest('hex');
  };
};
