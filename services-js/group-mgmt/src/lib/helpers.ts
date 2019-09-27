export const convertOptionalArray = val => (Array.isArray(val) ? val : [val]);

export const returnBool = (val: string = 'FALSE') => {
  switch (val.toLocaleLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return false;
  }
};

export const convertToBool = (val: any, base: Boolean = true) => {
  let retVal: Boolean = returnBool(val);
  if (base && typeof base === 'boolean' && val === null) {
    retVal = base;
  }
  return retVal;
};

export const renameObjectKeys = (keysMap, obj) =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {}
  );

export const remapObjKeys = (sourceObj, targetObj) => {
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
