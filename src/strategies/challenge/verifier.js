const Verifier = require('feathers-authentication-local').Verifier;
const errors = require('feathers-errors');
const cryptoUtils = require('../../utils/server');

function signAndCheck (data, password, signatureToMatch) {
  return cryptoUtils.sign(data, password).then(signedData => {
    return signedData.signature === signatureToMatch;
  });
}

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
      app.service(options.userService).find({query: {email}})
        .then(users => {
          users = users.data || users;
          let user = users[0];
          if (user) {
            let { challenge, twoFactor } = user;
            let password = user[options.dbPasswordField] || '';
            let tempPassword = user[options.dbTempPasswordField] || '';
            let tempPasswordExpiration = user[options.dbTempPasswordExpiresAtField];

            // Make sure the signatures match. Always check both signatures to make sure
            // we are not susceptible to time-based attacks.
            const checkPassword = signAndCheck({email, challenge}, password, signature);
            const checkTempPassword = signAndCheck({email, challenge}, tempPassword, signature);

            Promise.all([checkPassword, checkTempPassword]).then(values => {
              let passwordMatched = values[0];
              let tempPasswordMatched = values[1];

              if (passwordMatched || tempPasswordMatched) {
                // If twoFactor is enabled, don't authenticate the socket.
                if (twoFactor) {
                  req.params.authenticated = false;
                }
                if (tempPasswordMatched) {
                  // Make sure the tempPassword hasn't expired.
                  if (tempPasswordExpiration) {
                    if (new Date(tempPasswordExpiration).getTime() < new Date().getTime()) {
                      return done(new errors.NotAuthenticated('invalid login'), null);
                    }
                  }
                  req.params.usingTempPassword = true;
                }
                return done(null, user);
              } else {
                // Neither password matched.
                done(new errors.NotAuthenticated('invalid login'), null);
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
