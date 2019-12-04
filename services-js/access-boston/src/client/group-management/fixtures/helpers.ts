/**
 * Filter through several fields to try and match user input;
 * returns true if input matches any value for the given fields.
 */
export function findMatch(item: any, value: string): any | null {
  const fields = ['givenName', 'sn', 'displayName', 'cn'];
  const inputValue = value.trim().toLowerCase();

  return fields
    .map(field => item[field])
    .some(
      value =>
        value && value.toLowerCase().slice(0, inputValue.length) === inputValue
    );
}

export function getItemObject(list: any[], cn: string): any {
  return list.find(item => item.cn === cn);
}

/**
 *
 * @param {object} arr - Array to chunk into an array of arrays
 * @param {object} size - Interger value to chunk array into
 * @description Chunk Array into an (2D) array of smaller arrays
 * @return {object} - Return an array(2D) of arrays of chunked values
 *
 * @example
 *     chunkArray(
 *        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
 *        5
 *     );
 *     return [
 *        [ 1, 2, 3, 4, 5 ],
 *        [ 6, 7, 8, 9, 10 ],
 *        [ 11, 12, 13 ]
 *     ];
 */
export const chunkArray = (arr: Array<any> = [], size: Number): object => {
  let result: any = [];
  let castSize: any = size;

  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i += castSize) {
      result.push(arr.slice(i, i + castSize));
    }
  }
  return result;
};

/**
 * @param {object} keysMap - Object, key/value Object with renamed keys
 * @param {object} targetObj - Object whose keys you want to rename
 * @description Rename object keys using the keyMap object
 *
 * @example
 *     renameObjectKeys(
 *      {
 *       dn: 'cn',
 *       CN: 'cn',
 *       isMemberof: 'ismemberof',
 *       nsAccountLock: 'nsaccountlock',
 *      },
 *      {
 *        dn: '',
 *        cn: '100992',
 *        ismemberof: [],
 *        nsaccountlock: 'FALSE',
 *        isSponsor: 'TRUE',
 *      },
 *     );
 *     returns {
 *       dn: '',
 *       cn: '100992',
 *       ismemberof: [],
 *       nsaccountlock: 'FALSE',
 *       isSponsor: 'TRUE',
 *     }
 */
export const renameObjectKeys = (keysMap: object, obj) => {
  const retObj: object = Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {}
  );

  return retObj;
};
