const defaults = {
  name: 'challenge-request'
};

/**
 * Sets hook.params.authenticated to false to prevent the socket
 * from getting marked as authenticated.
 */
module.exports = function (options) {
  options = Object.assign({}, defaults, options);

  return function preventSocketAuth (hook) {
    return new Promise((resolve, reject) => {
      if (hook.data.strategy === options.name) {
        hook.params.authenticated = false;
      }
      resolve(hook);
    });
  };
};
