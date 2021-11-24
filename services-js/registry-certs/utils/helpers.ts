/**
 * Check if string is boolean
 *
 * @param str Check if string is a boolean
 *
 * @example
 * isStringBool('true');
 *
 * @returns boolean result
 * @example true/false
 */
export default function isStringBool(str: any): boolean {
  switch (typeof str) {
    case 'string':
      return /^\s*(true|1|on|false|0|off)\s*$/i.test(str);
    case 'boolean':
      return true;
    default:
      return false;
  }
}

/**
 * Convert a string to boolean
 *
 * @param str String fragment to be converted
 * @param defaultVal
 *
 * @example
 * toBoolean(
 *  'true',
 *  false
 * );
 *
 * @returns object containing conversion value and whether the value is boolean
 *
 * @example
 * { isBool: true, value: true }
 */
export const toBoolean = (str: any, defaultVal?: boolean) => {
  let retObj = {
    isBool: false,
    value: defaultVal ? defaultVal : false,
  };
  switch (typeof str) {
    case 'string':
      if (/^\s*(true|1|on|false|0|off)\s*$/i.test(str) === true) {
        retObj.isBool = true;
        retObj.value = JSON.parse(str);
      }
      break;
    case 'boolean':
      retObj.isBool = true;
      retObj.value = str;
      break;
    default:
      retObj.isBool = false;
      retObj.value = false;
      break;
  }

  return retObj;
};
