const Verifier = require('feathers-authentication-local').Verifier;
const errors = require('feathers-errors');

/**
 * A custom Verifier for `feathers-authentication-local`
 * It verifies the signature of the signed request.
 */
module.exports = function createVerifier (options = {}, app) {
  if (!options.userService) {
    throw new Error('You must provide a `userService` in the options for the challenge strategy verifier');
  }
  return class ChallengeRequestVerifier extends Verifier {
    verify (req, email, signature, done) {
      app.service(options.userService).find({email})
        .then(users => {
          users = users.data || users;
          let user = users[0];
          debugger;
          // Pass the user to the after hooks.
          if (user) {
            done(null, user);

          // Or there was no user.
          } else {
            done(new errors.NotAuthenticated('invalid login'), null);
          }
        })
        .catch(error => {
          console.log(error);
          debugger;
          done(new errors.NotAuthenticated(error), null);
        });
    }
  };
};
