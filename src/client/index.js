import makeUtils from '../utils/index';
import setupAuthenticate from './authenticate';
import signHook from './hook.sign';

export default function plugin (options) {
  const utils = makeUtils(options);
  utils.authenticate = setupAuthenticate(utils);
  utils.hooks = {
    sign: signHook(options)
  };
  return utils;
}
