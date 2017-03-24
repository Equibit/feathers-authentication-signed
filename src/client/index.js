// import errors from 'feathers-errors';
import makeDebug from 'debug';
import crypto from 'crypto';

const debug = makeDebug('feathers-authentication-signed');

export default function init () {
  debug('Initializing feathers-authentication-signed plugin');
  return 'feathers-authentication-signed';
}

init.generateSecret = function generateSecret (password, salt) {
  crypto.pbkdf2(password, salt, 100000, 512, 'sha512', (err, key) => {
    if (err) throw err;
    console.log(key.toString('hex'));
  });
};
