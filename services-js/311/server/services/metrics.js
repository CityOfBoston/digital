// @flow
/* eslint no-console: 0 */

import newrelic from 'newrelic';

export const measure = (key: string, func: Function) => (...args: any) =>
  new Promise((resolve) => {
    Promise.resolve(func(...args)).then(newrelic.createTracer(key, resolve));
  });
