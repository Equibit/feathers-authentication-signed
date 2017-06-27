# feathers-authentication-signed

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-signed.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-signed)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-signed/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-signed)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-signed/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-signed/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-signed.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-signed)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-signed.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-signed)

> High-security local authentication & request signing / verification for FeathersJS.

The benefits of using the package include

- More secure local (username & password) authentication.  The user does not have to send his or her password - in any form - across the wire to login.  It is transmitted only during signup or password changes.
- Mitigation of man-in-the-middle attacks through the use of request signing & verification.  When a request arrives at the Feathers server and passes signature verification, it is guaranteed to contain the exact same payload as what was sent from the client device.

This package includes both server and client utilities that assist with

  - Secure, local (username & password) authentication
  - Sending and verifying signed requests to a Feathers API server.

## Installation

```
npm install feathers-authentication-signed --save
```
## The Client Utils

The client utils consist of

- The initial plugin setup function and utilities. (required)
- A Feathers hook for signing requests.
- An `authenticate` method for login from any client framework.
- A [`can-connect`](http://canjs.com/doc/can-connect.html) `Session` behavior for assisting with login/logout.

### The Initial Plugin Setup Function

Because the browser does come pre-packaged with a `crypto` library like Node.js does, you have to provide one.  It must provide at least the `createHmac`, `pbkdf2`, and `createHash` methods.  A browser build of the [`crypto-browserify`][https://www.npmjs.com/package/crypto-browserify] module will work.  You can also use the `@equibit/wallet-crypto` package, which includes the needed methods.

**`models/feathers-signed.js`**
```js
import signed from 'feathers-authentication-signed/client';
import crypto from '@equibit/wallet-crypto/dist/wallet-crypto';

export default signed(crypto);
```

The following utils are now ready for use in other modules:

#### `signed.generateSecret(password, salt)`

- `password` {String} - the password used to generate the secret
- `salt` {String} - the salt used to generate the secret.

`generateSecret` uses the `pbkdf2` crypto method to create a `sha512` hash of the password using the provided salt.

#### `signed.sign(data, secret)

- `data` {Object} - The data to be signed. It will receive a `signature` property.
- `secret` {String} - The secret that will be used to sign the request.

`sign` adds a `signature` property onto the provided data.  The signature is a hex representation of a hash using `crypto.createHmac` and `sha512`.

#### `signed.createHash(str)`

- `str` {String} - the string to be hashed

Uses `crypto.createHash()` to create a hex hash representation of the provided `str`.

### A Feathers Hook for Signing Requests

A single hook is included on the client for signing requests.  It comes in the same object as the rest of the utilities.  See setup instructions in the previous section.

#### `signed.hooks.sign(options)`

- `options` {Object} - an object with a `strict` property. *optional*
  - `strict` {Boolean} - If set to true, the hook will throw an error if there's no secret present on the FeathersClient instance. (using feathersClient.get('secret')) *default: false*

The signing hook to be used as a before hook on any Feathers services requiring signature validation.

```js
import signed from './feathers-signed';

// Use the signHook in your service
feathersClient.service('some-service').hooks({
  before: {
    all: [
      signed.hooks.sign({ strict: true })
    ]
  }
})
```

### Authenticating with any Client-side Framework

The `signed.authenticate` method simplifies the multi-step login process. You'll first need a working Feathers client.  See the [Feathers client docs](https://docs.feathersjs.com/api/client.html).

#### `signed.authenticate(feathersClient, data)`#### `signed.authenticate(feathersClient, data)`

- `feathersClient` {FeathersClient} - the Feathers client object.  It must already have the `feathers-authentication-client` plugin configured.
- `data` {Object} - Request data containing the `email` and `password`.  These field names are currently hard coded.

Example usage:

```js
import feathersClient from './feathers-client';
import signed from './feathers-signed';

signed.authenticate(feathersClient, {
  email: 'my@email.com',
  password: 'my-password'
})
```


### The `can-connect` Behavior

A behavior for `can-connect` is included to assist with data modeling.  It must be imported separately.  Here's an example of how to use it in a `Session` model:

**models/session.js**

```js
import connect from 'can-connect';
import dataParse from 'can-connect/data/parse/';
import construct from 'can-connect/constructor/';
import constructStore from 'can-connect/constructor/store/';
import constructOnce from 'can-connect/constructor/callbacks-once/';
import canMap from 'can-connect/can/map/';
import canRef from 'can-connect/can/ref/';
import dataCallbacks from 'can-connect/data/callbacks/';

// Bring in the behavior
import feathersAuthenticationSignedSession from 'feathers-authentication-signed/behavior';
// Bring in the feathersClient that we configured separately.
import feathersClient from '../feathers-client';
// Bring in the signed utils that we configured separately.
import signed from '~/models/feathers-signed';

import DefineMap from 'can-define/map/';
import User from '~/models/user/user';

const behaviors = [
  feathersAuthenticationSignedSession,
  dataParse,
  construct,
  constructStore,
  constructOnce,
  canMap,
  canRef,
  dataCallbacks
];

const Session = DefineMap.extend('Session', {
  user: {
    Type: User
  },
  usingTempPassword: 'boolean',
  secret: 'string',
  get email () {
    return this.user && this.user.email;
  },
  get isNewAccount () {
    return this.user && this.user.isNewUser;
  }
});

Session.connection = connect(behaviors, {
  // These options are required
  feathersClient,
  Map: Session,
  utils: signed
});

export default Session;
```

## The Server Plugin
On the Feathers server, this package consists of

- Two custom, local (username & password) authentication strategies.
- Hooks for verifying request signatures.
- General utilities needed for auth & signature verification

### Secure Local Authentication Strategies
There are two strategies in this package that assist with authentication: the `challenge-request` strategy and the `challenge` strategy. These strategy plugins build on top of the functionality provided by [`feathers-authentication`](https://github.com/feathersjs/feathers-authentication) and [`feathers-authentication-local`](https://github.com/feathersjs/feathers-authentication-local).  There is a wrapper plugin that combines both plugins into a single plugin.  The example below shows how to setup the server.

## Basic Example

Here's an example of a Feathers server that uses `feathers-authentication-signed`.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const authentication = require('feathers-authentication')
const jwt = require('feathers-authentication-jwt')
// Import the plugin
const signed = require('feathers-authentication-signed')

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure auth
  .configure(authentication(config))
  .configure(jwt())
  .configure(signed({
    idField: '_id'
  }))
  .use(errorHandler());

app.service('authentication').hooks({
  before: {
    create: [
      // Register the required authentication strategies
      authentication.hooks.authenticate([
        'jwt',
        'challenge-request',
        'challenge'
      ])
    ],
    remove: [
      authentication.hooks.authenticate('jwt')
    ]
  }
});

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
