import generateSecret from '../utils/generate-secret';
import sign from '../utils/sign';
import hash from '../utils/hash';

const defaults = {
  pbkdf2: undefined, // Must be passed in
  createHmac: undefined, // Must be passed in
  createHash: undefined // Must be passed in
};

export default function plugin (options) {
  options = Object.assign({}, defaults, options);

  if (!options.pbkdf2) {
    throw new Error('You must provide a `pbkdf2` function to the feathers-authentication-signed plugin options');
  }
  if (!options.createHmac) {
    throw new Error('You must provide a `createHmac` function to the feathers-authentication-signed plugin options');
  }
  if (!options.createHash) {
    throw new Error('You must provide a `createHash` function to the feathers-authentication-signed plugin options');
  }

  function signed () {

  }

  let utils = {
    generateSecret: generateSecret(options),
    sign: sign(options),
    createHash: hash(options)
  };

  Object.assign(signed, utils);
  return signed;
}
