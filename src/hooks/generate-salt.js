const defaults = {
  length: 10,
  randomBytes: undefined
};

/**
 * A hook that adds a `salt` attribute to hook.data.
 * Intended for use as a before create hook.
 */
module.exports = function (options) {
  options = Object.assign({}, defaults, options);

  if (!options.randomBytes) {
    throw new Error('You must provide a `randomBytes` function to the `generate-salt` hook');
  }

  return function addUserSalt (hook) {
    return new Promise(resolve => {
      // TODO: Generate a better salt.
      hook.data.salt = options.randomBytes(options.length).toString('hex');
      resolve(hook);
    });
  };
};
