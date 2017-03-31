const defaults = {
  algorithm: 'sha512'
};

/**
 * Generates a hash using the provided `options.createHash` function.
 */
module.exports = function (options) {
  options = Object.assign({}, defaults, options);

  return function createHash (dataString) {
    let hash = options.createHash(options.algorithm);
    return hash.update(dataString).digest('hex');
  };
};
