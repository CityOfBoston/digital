// @flow
/* eslint no-console: 0 */

export const measure = <F: $Subtype<Function>> (key: string, func: F) => async (...args: Array<any>) => {
  const funcArgs = args;

  const start = new Date();
  const out = await func(...funcArgs);
  const end = new Date();

  console.log(`measure:${key}=${end - start}ms`);

  return out;
};
