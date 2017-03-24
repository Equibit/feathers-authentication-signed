/**
 * Uses the provided `options.pbkdf2` function to generate a secret based on
 * the given password and salt.
 */
module.exports = function (options) {
  return function generateSecret (password, salt) {
    return new Promise((resolve, reject) => {
      options.pbkdf2(password, salt, 250, 512, 'sha512', function (err, key) {
        if (err) return reject(err);
        resolve(key.toString('hex'));
      });
    });
  };
};
