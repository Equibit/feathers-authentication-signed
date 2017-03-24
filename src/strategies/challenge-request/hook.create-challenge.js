const crypto = require('crypto');

const defaults = {
  idField: 'id',
  name: 'challenge-request',
  userService: 'users'
};

// handle step 1
module.exports = function (options = {}) {
  options = Object.assign(defaults, options);

  return function (hook) {
    let userService = hook.app.service(options.userService);
    let user = hook.params.user;
    let userId = user[options.idField];

    return new Promise(function (resolve, reject) {
      // Only run this hook for the 'challenge-request' strategy.
      if (hook.data.strategy === options.name) {
        // An accessToken should not be returned.
        delete hook.result.accessToken;

        // Step 2: generate salt and challenge
        let { salt } = user;
        let challenge = crypto.randomBytes(64).toString('hex');

        userService.patch(userId, { challenge })
        .then(user => {
          hook.result = { salt, challenge };
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
