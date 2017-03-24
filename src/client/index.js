// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-authentication-signed');

export default function init () {
  debug('Initializing feathers-authentication-signed plugin');
  return 'feathers-authentication-signed';
}
