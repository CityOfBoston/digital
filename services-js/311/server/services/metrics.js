// @flow
/* eslint no-console: 0 */

import newrelic from 'newrelic';

export const measure = (name: string, group: string, func: Function) => newrelic.createBackgroundTransaction(name, group, (...args) => new Promise((resolve) => {
  Promise.resolve(func(...args)).then((val) => {
    resolve(val);
    newrelic.endTransaction();
  });
}));
