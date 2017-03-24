const defaults = {
  idField: 'id',
  name: 'challenge',
  userService: 'users'
};

/**
 * Verifies the signed request.
 */
module.exports = function (options = {}) {
  options = Object.assign(defaults, options);

  return function verifySignature (hook) {
    return new Promise(function (resolve, reject) {
      if (hook.data.strategy === options.name) {
        debugger;
        hook.data.email = hook.data.challenge;
        resolve(hook);
      } else {
        resolve(hook);
      }
    });
  };
};
