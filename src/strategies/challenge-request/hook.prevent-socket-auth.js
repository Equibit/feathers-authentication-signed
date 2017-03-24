/**
 * Sets hook.params.authenticated to false to prevent the socket
 * from getting marked as authenticated.
 */
module.exports = function () {
  return function preventSocketAuth (hook) {
    return new Promise((resolve, reject) => {
      hook.params.authenticated = false;
      resolve(hook);
    });
  };
};
