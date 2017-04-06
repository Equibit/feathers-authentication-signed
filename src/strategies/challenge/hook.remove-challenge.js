const crypto = require('crypto');

const defaults = {
  idField: 'id',
  name: 'challenge-request',
  userService: 'users'
};

/**
 * Creates a new challenge and adds it to the user record.
 */
module.exports = function (options = {}) {
  options = Object.assign({}, defaults, options);

  return function (hook) {
    return new Promise(function (resolve, reject) {
      // Only run this hook for the 'challenge-request' strategy.
      if (hook.data.strategy === options.name) {
        let userService = hook.app.service(options.userService);
        let user = hook.params.user;
        let userId = user[options.idField];


        userService.patch(userId, { challenge: undefined })
        .then(user => {
          return resolve(hook);
        })
        .catch(error => {
          console.log(error);
          // TODO: prevent leaks through this error.
          return reject(error);
        });
      } else {
        resolve(hook);
      }
    });
  };
};
