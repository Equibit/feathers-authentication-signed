import connect from 'can-connect';

function convertLocalAuthData (originalData) {
  var data = Object.assign({}, originalData);
  if (data && data.user) {
    Object.assign(data, data.user);
    delete data.user;
  }
  return data;
}

const name = 'feathers-authentication-signed-session';

export default connect.behavior(`data/${name}`, function () {
  var helpURL = 'https://github.com/Equibit/feathers-authentication-signed';
  var feathersClient = this.feathersClient;
  var signed = this.utils;

  if (!feathersClient) {
    throw new Error(`You must provide a feathersClient instance to the ${name} behavior. See ${helpURL}`);
  }
  if (!signed || !signed.sign || !signed.generateSecret || !signed.createHash) {
    throw new Error(`You must provide a utils object that implements pbkdf2, createHmac, and createHash. See ${helpURL}`);
  }
  if (!this.Map) {
    throw new Error(`You must provide a Map instance to the ${name} behavior. See ${helpURL}`);
  }
  if (!feathersClient.passport) {
    throw new Error(`You must register the feathers-authentication-client plugin before using the ${name} behavior. See ${helpURL}`);
  }

  const Session = this.Map;

  return {
    createData: function (data) {
      let { email, password } = convertLocalAuthData(data);
      if (!password) {
        throw new Error('Password is required.');
      }

      let hashedPassword = signed.createHash(password);
      return signed.sign({ email }, hashedPassword)
        .then(signedData => {
          return feathersClient.authenticate({
            strategy: 'challenge-request',
            ...signedData
          });
        })
        .then(({challenge, salt}) => {
          return signed.generateSecret(hashedPassword, salt).then(secret => {
            // The secret is the same as the stored password, but it
            // never gets sent across the wire.
            let data = {email, challenge};
            return signed.sign(data, secret)
              .then(signedData => {
                signedData.strategy = 'challenge';
                // console.log('signedData', signedData);
                return feathersClient.authenticate(signedData);
              })
              .then(response => {
                feathersClient.set('secret', secret);
                if (response.user) {
                  response.user.salt = salt;
                }
                Session.current = new Session(response);
                return response;
              });
          });
        });
    },
    destroyData: function (session) {
      return feathersClient.logout().then(function () {
        delete Session.current;
        return session;
      });
    }
  };
});
