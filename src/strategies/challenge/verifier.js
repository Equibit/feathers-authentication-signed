const Verifier = require('feathers-authentication-local').Verifier;
const errors = require('feathers-errors');
const cryptoUtils = require('../../utils/server');

/**
 * A custom Verifier for `feathers-authentication-local`
 * It verifies the signature of the signed request.
 */
module.exports = function createVerifier (options = {}, app) {
  if (!options.userService) {
    throw new Error('You must provide a `userService` in the options for the challenge strategy verifier');
  }

  /**
   * Signs the { email, challenge } with the stored password, then makes sure the
   * resulting signature matches the signature sent from the client.
   */
  return class ChallengeVerifier extends Verifier {
    verify (req, email, signature, done) {
      app.service(options.userService).find({email})
        .then(users => {
          users = users.data || users;
          let user = users[0];
          if (user) {
            let { challenge, twoFactor } = user;
            let password = user[options.dbPasswordField];
            let tempPassword = user[options.dbTempPasswordField];
            let tempPasswordExpiration = user[options.dbTempPasswordExpiresAtField];

            // Make sure the signatures match.
            return cryptoUtils.sign({email, challenge}, password).then(signedData => {
              if (signedData.signature === signature) {
                // If twoFactor is enabled, don't authenticate the socket.
                if (twoFactor) {
                  req.params.authenticated = false;
                }
                return done(null, user);

              // If signatures didn't match, check the tempPassword.
              } else {
                // Check that the tempPassword hasn't expired.
                if (tempPasswordExpiration) {
                  if (new Date(tempPasswordExpiration).getTime() < new Date().getTime()) {
                    return done(new errors.NotAuthenticated('invalid login'), null);
                  }
                }
                return cryptoUtils.sign({email, challenge}, tempPassword).then(signedData => {
                  if (signedData.signature === signature) {
                    req.params.usingTempPassword = true;
                    done(null, user);
                  } else {
                    done(new errors.NotAuthenticated('invalid login'), null);
                  }
                });
              }
            });

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
