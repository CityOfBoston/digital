export const convertOptionalArray = val => (Array.isArray(val) ? val : [val]);

/**
 * @param {string} val - A string param
 * @return {boolean} A Boolean value
 * @description Converts a string Boolean back to its primative
 * @default {boolean} Return a Boolean value (false)
 *
 * @example
 *     returnBool('FALSE', false);
 */
export const returnBool = (val: String = 'FALSE'): boolean => {
  switch (val.toLocaleLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return false;
  }
};

/**
 * @param {string} val - A string param
 * @param {boolean} base - A boolean param
 * @return {boolean} A Boolean value
 * @description Converts a string Boolean back to its primative, if not possible returns a default value that can be preset.
 * @default {boolean} Return a Boolean value (false)
 *
 * @example
 *     convertToBool('FALSE', true);
 */
export const convertToBool = (val: String, base: boolean): boolean => {
  let retVal: boolean = true;
  try {
    retVal = returnBool(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error converting to Boolean: convertToBool ', err);
  }

  if (base && typeof base === 'boolean') {
    retVal = base;
  }
  return retVal;
};

/**
 * @param {object} keysMap - Object, key/value Object with renamed keys
 * @param {object} targetObj - Object whose keys you want to rename
 * @description Rename object keys using the keyMap object
 *
 * @example
 *     renameObjectKeys(
 *      {
 *      dn: 'cn',
 *      CN: 'cn',
 *      isMemberof: 'ismemberof',
 *      nsAccountLock: 'nsaccountlock',
 *     },
 *      {
 *        dn: '',
 *        cn: '100992',
 *        ismemberof: [],
 *        nsaccountlock: 'FALSE',
 *        isSponsor: 'TRUE',
 *      },
 *     );
 *     return {
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

/**
 *
 * @param {object} sourceObj - Object whose keys you'll use to remap target
 * @param {object} targetObj - Object whose keys you want to remap
 * @description Pair down and remap target object keys with the sourceObj keys
 * @return {object} - Return object with the remapped keys and paired down to only the fields present in the sourceObj
 *
 * @example
 *     remapObjKeys(
 *      {
 *        dn: '',
 *        cn: '',
 *        ismemberof: [],
 *        nsaccountlock: '',
 *      },
 *      {
 *        dn: '',
 *        CN: '100992',
 *        isMemberof: [],
 *        nsAccountLock: 'FALSE',
 *      },
 *     );
 *     return {
 *      dn: 'cn',
 *      CN: 'cn',
 *      isMemberof: 'ismemberof',
 *      nsAccountLock: 'nsaccountlock',
 *     }
 */
export const remapObjKeys = (sourceObj: object, targetObj: object): object => {
  const keyMapObj: Object = {};
  const optKeys = Object.keys(targetObj).map(key => key.toLocaleLowerCase());
  for (const key in sourceObj) {
    const index = optKeys.indexOf(key);
    if (index > -1) {
      keyMapObj[Object.keys(targetObj)[index]] = key;
    }
  }
  return keyMapObj;
};

export const abstractDN = (dn: String = '') => {
  let dnObj = {};
  const spt = dn
    .trim()
    .replace(/, /gim, ',')
    .split(',');
  spt.forEach(elem => {
    if (elem.indexOf('=') > -1) {
      const keyValArr = elem.split('=');
      if (keyValArr.length === 2) {
        const key = keyValArr[0].toLowerCase();
        const val = keyValArr[1];
        if (Object.keys(dnObj).indexOf(key) === -1) {
          dnObj[key] = [];
        }
        dnObj[key].push(val);
      }
    }
  });

  return dnObj;
};

/**
 *
 * @param {object} arr - Array to chunk into an array of arrays
 * @param {object} size - Interger value to chunk array into
 * @description Chunk Array into an (2D) array of smaller arrays
 * @return {object} - Return an array(2D) of arrays of chunked values
 *
 * @example
 *     chunkArray(
 *      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
 *      5
 *     );
 *     return [
 *      [ 1, 2, 3, 4, 5 ],
 *      [ 6, 7, 8, 9, 10 ],
 *      [ 11, 12, 13 ]
 *     ];
 */
export const chunkArray = (arr: Array<[]> = [], size: Number): object => {
  let result: any = [];
  let castSize: any = size;

  for (let i = 0; i < arr.length; i += castSize) {
    result.push(arr.slice(i, i + castSize));
  }
  return result;
};

/**
 *
 * @param {object} obj - Object to filter by keys
 * @param {object} keys - Array of keys to filter(pair-down) the target object
 * @description Return an object filtered by the requested keys
 * @return {object} - Return an object filtered by the requested keys
 *
 * @example
 *    filterObj(
 *      {
 *        URL: '',
 *        PORT: '',
 *        SCOPE: '',
 *        NAME: '',
 *        TITLE: '',
 *        LABEL: '',
 *      },
 *      ['URL', 'PORT', 'PORT']
 *    );
 *    return {
 *      {
 *        URL: '',
 *        PORT: '',
 *        SCOPE: '',
 *      }
 *    }
 */
export const filterObj = (obj: object, keys: Array<string>): object => {
  let retObj = {};
  for (let i = 0; i < keys.length; i++) {
    if (obj.hasOwnProperty(keys[i])) {
      const thisKey: string = keys[i];
      retObj[thisKey] = obj[thisKey];
    }
  }
  return retObj;
};

/**
 *
 * @param {object} obj - Object used to get matching keys
 * @param {object} str - String partial used to lookup matching keys
 * @description Get an array of object keys matching a string partial
 * @return {object} - Returns an array of keys matching the string partial input
 *
 * @example
 *    filteredObjKeys(
 *      {
 *        LDAP_URL: '',
 *        LDAP_PORT: '',
 *        LDAP_SCOPE: '',
 *        NAME: '',
 *        TITLE: '',
 *        LABEL: '',
 *      },
 *      'LDAP_'
 *    );
 *    return [
 *      'LDAP_URL', 'LDAP_PORT', 'LDAP_SCOPE'
 *    ]
 */
export const filteredObjKeys = (obj: {}, str: string): string[] =>
  Object.keys(obj).filter(key => {
    return key.indexOf(str) > -1;
  });

export const isDNInOUs = (dn: string, dns: Array<string>) => {
  let splitDN: any = dn.split(',');
  splitDN.shift();
  splitDN = splitDN
    .toString()
    .trim()
    .toLowerCase();
  const retArr = dns.filter(
    entry => entry.trim().toLocaleLowerCase() === splitDN
  );
  return retArr.length > 0;
};

export const getOnlyActiveMembers = (_arr: any) => {
  const unparsedArr = typeof _arr === 'string' ? [_arr] : _arr;
  const data = unparsedArr.filter((node: Array<[String]>) => node.length > 0);
  if (data.length > 0) {
    const parsedCn = data.map((_str: String) => {
      const abs = abstractDN(_str);
      if (abs['cn']) {
        if (abs['cn'][0]) {
          const retStr = `cn=${abs['cn'][0]}`;
          return retStr;
        }
      }
      return _str;
    });
    return parsedCn;
  }
  return [];
};

/**
 * Function to produce UUID.
 * See: http://stackoverflow.com/a/8809472
 *
 * @description Generate a random UUID
 * @return {object} - Returns a UUID string
 *
 * @example
 *  generateUUID()
 *
 */

export const generateUUID = (): any => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};
