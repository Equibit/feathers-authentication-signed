/**
 * The signData hook pulls the secret from the Feathers app and uses it to sign
 * all outgoing requests.  A signature is created by taking the original request
 * data and encoding it with the secret.  The outgoing data will then contain a
 * `signature` property holding the signature string.
 * In strict mode, it enforces that a secret has been set on the `app` object.
 *
 * The plugin must first be initialized.  If you use the `feathers-authentication-signed/client`
 * module, it will be available as signed.hooks.sign.  Using it separately requires first passing
 * in the `sign` function:
 *
 * ```js
 * import makeSignHook from 'feathers-authentication-signed/lib/client/hook.sign'
 * import { createHmac } from '@equibit/wallet-crypto/dist/wallet-crypto';
 * import makeSign from 'feathers-authentication-signed/lib/utils/sign'
 *
 * const sign = makeSign({ createHmac })
 * const signHook = makeSignHook({ sign })
 *
 * // Use the signHook in your service
 * feathersClient.service('some-service').hooks({
 *   before: {
 *     all: [
 *       signHook({ strict: true })
 *     ]
 *   }
 * })
 * ```
 */
module.exports = function makeSignHook ({ sign }) {
  return function ({ strict = false }) {
    return function signData (hook) {
      const secret = hook.app.get('secret') || '';

      if (strict && !secret) {
        throw new Error('Could not sign request due to missing secret. The user is not authenticated.');
      }
      hook.data = sign(hook.data, secret);

      return Promise.resolve(hook);
    };
  };
};
