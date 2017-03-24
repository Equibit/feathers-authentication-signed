const defaults = {
  pbkdf2: undefined, // Must be passed in
  createHmac: undefined // Must be passed in
};

export default function plugin (options) {
  options = Object.assign({}, defaults, options);

  if (!options.pbkdf2) {
    throw new Error('You must provide a `pbkdf2` function to the feathers-authentication-signed plugin options');
  }
  if (!options.createHmac) {
    throw new Error('You must provide a `createHmac` function to the feathers-authentication-signed plugin options');
  }

  function signed () {

  }

  let utils = {
    generateSecret (password, salt) {
      return new Promise((resolve, reject) => {
        options.pbkdf2(password, salt, 250, 512, 'sha512', function (err, key) {
          if (err) return reject(err);
          resolve(key.toString('hex'));
        });
      });
    },
    sign (data, secret) {
      return new Promise((resolve, reject) => {
        let dataString = JSON.stringify(data);
        let hmac = options.createHmac('sha512', secret);
        let signature = hmac.update(dataString).digest('hex');
        data.signature = signature;
        resolve(data);
      });
    }
  };

  Object.assign(signed, utils);
  return signed;
}
