export default function setupAuthenticate (signed) {
  if (!signed) {
    throw new Error('You must provide a feathers-authentication-signed utils instance to the setupAuthenticate method.');
  }

  /**
   * authenticate {Function}
   * @param {Object} data - the request params
   * A utility function to assist with logging in to a server
   * that uses feathers-authentication-signed
   */
  return function authenticate (feathersClient, data) {
    if (!feathersClient) {
      return Promise.reject(new Error('You must provide a Feathers Client instance as the first argument to the authenticate method.'));
    }
    if (!data) {
      return Promise.reject(new Error('You must provide a request data object as the second argument to the authenticate method.'));
    }

    const { email, password } = data;

    if (!email) {
      return Promise.reject(new Error(`email is required.`));
    }
    if (!password) {
      return Promise.reject(new Error(`password is required.`));
    }

    // Step 1: Hash the password (optional, but nice)
    let hashedPassword = signed.createHash(password);

    // Step 2: Use the password to sign request data containing just the email
    const requestData = { email };
    return signed.sign(requestData, hashedPassword)
      .then(signedData => {
        // Step 3: Issue a `challenge-request` to the API server
        return feathersClient.authenticate({
          strategy: 'challenge-request',
          ...signedData
        });
      })
      // The server will send back a `challenge` and `salt`
      .then(({ challenge, salt }) => {
        // Step 4: Use the original password and the salt to
        // generate a secret. The secret is the same as the stored
        // password, but it never gets sent across the wire.
        return signed.generateSecret(hashedPassword, salt)
          .then(secret => {
            // Step 5: Use the secret to sign request data containing the email and challenge.
            let data = { email, challenge };
            return signed.sign(data, secret)
              .then(signedData => {
                // Step 6: Authenticate with the challenge.
                return feathersClient.authenticate({
                  strategy: 'challenge',
                  ...signedData
                });
              })
              .then(response => {
                // Step 7: Store the secret on the Feathers client
                // to make it available to the signing hook.
                feathersClient.set('secret', secret);
                return response;
              });
          });
      });
  };
}
