/**
 * Uses the provided `options.createHmac` function to sign data with a secret.
 * Incoming data that looks like this:
 *   let data   = { email: 'test@test.com' }
 * Will end up looking like this:
 *   let signed = { email: 'test@test.com', signature: '34gb...248'}
 * Where the signature attribute is a hash of the stringified original data.
 */
module.exports = function (options) {
  return function sign (data, secret) {
    return new Promise((resolve, reject) => {
      let dataString = JSON.stringify(data);
      let hmac = options.createHmac('sha512', secret);
      let signature = hmac.update(dataString).digest('hex');
      data.signature = signature;
      resolve(data);
    });
  };
};
