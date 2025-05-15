import { COUNTRIES, US_STATES } from '../server/services/DBInputData';

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

/**
 * @name adjustForTimezone
 * @description Adjust a date to the client (browser, etc) Timezone
 * @param {date} date Date (JS) object
 * @returns Date - Date (JS) object
 * @example adjustForTimezone(new Date("Sun Jan 28 2024 19:43:53 GMT-0500 (Eastern Standard Time)")) = 1706507033000
 */
export const adjustForTimezone = (date: Date): Date => {
  const timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
  date.setTime(date.getTime() + timeOffsetInMS);
  return date;
};

/**
 * @name formatDate
 * @description Format date to the following style: `mmm dd, yyyy`
 * @returns {string} Date string in the format of `mmm dd, yyyy`
 * @example formatDate(new Date('12/1/2023')) = `Dec 01, 2023`
 */
export const formatDate = (date_Obj: Date | null | undefined): any => {
  if (!date_Obj) return ``;

  const dateObj = new Date(adjustForTimezone(date_Obj));
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(
    dateObj
  );
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(
    dateObj
  );
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateObj);

  return `${month} ${day}, ${year}`;
};

// export const dateFormatType = (
//   type: 'd/m/y' | 'dd/mm/yyyy' | 'mmm dd, yyyy',
//   dateObj: Date
// ) => {
//   switch (type) {
//     case 'd/m/y':
//       const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(
//         dateObj
//       );
//       const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(
//         dateObj
//       );
//       const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(
//         dateObj
//       );

//       return `${month} ${day}, ${year}`;
//       break;
//     case 'dd/mm/yyyy':

//     break;
//     case 'mmm dd, yyyy':

//     break;
//   }
// };

/**
 * @name getCountryFullName
 * @description Convert a 2-3 letter Country Code into the full country name
 * @param {name} string Country Code
 * @returns {string} Country Full Name
 * @example getCountryFullName('USA') = 'United States of America'
 */
export const getCountryFullName = (name: string) => {
  const countryObj = COUNTRIES.find(entry => entry.value === name);
  let retVal = '';

  if (countryObj && countryObj.label) {
    retVal = ` ${countryObj.label.toLocaleUpperCase()}`;
    if (countryObj.shortLabel)
      retVal = ` ${countryObj.shortLabel.toLocaleUpperCase()}`;
  }

  return retVal;
};

/**
 * @name getStateFullName
 * @description Convert a State Code into state name
 * @param {name} string State Code
 * @returns {string} State Name
 * @example getStateFullName('MA') = 'MA'
 */
export const getStateFullName = (name: string) => {
  const countryObj = US_STATES.find(entry => entry.value === name);
  return countryObj && countryObj.label && countryObj.label !== '--'
    ? countryObj.label
    : '';
};

/**
 * @name yesNoUnknownAnswer
 * @description Convert boolean (true bool, numeric bool, string bool) into Y|N string
 * @param {val} string | boolean | 1 | 2 | '1' | '2'
 * @returns {string} Yes|No
 * @example yesNoUnknownAnswer('1') = 'Yes'
 */
export const yesNoAnswer = (
  val: '1' | '2' | 1 | 2 | string | boolean
): string => {
  if (!val) return ``;
  if (typeof val === 'boolean') return val === true ? 'Yes' : 'No';
  if (typeof val === 'number') return val === 1 ? 'Yes' : 'No';
  return parseInt(val) === 1 ? 'Yes' : 'No';
};

/**
 * @name formatPhoneNumber
 * @description Format Phone number in US standard + country code
 * @param phoneStr Phone # as a string
 * @returns {string}
 * @example formatPhoneNumber("16174450011") = "1 (617) 445-0011"
 */
export const formatPhoneNumber = (phoneStr: string): string => {
  const cleaned = ('' + phoneStr).replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = match[1] ? '+1 ' : '';
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return '';
};

export const capFirstLetterOfStr = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatCheckoutDate = (dateStr: any) => {
  // Return empty string if not a valid date
  if (!dateStr) return '';

  const dateObj = new Date(adjustForTimezone(new Date(dateStr)));

  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(
    dateObj
  );
  const month = new Intl.DateTimeFormat('en', {
    month: '2-digit',
  }).format(dateObj);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateObj);

  return `${month}/${day}/${year}`;
};

export const getAgeFromDate = (dateString: string): string => {
  const today = new Date();
  const dob = new Date(dateString);
  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age}`;
};

export const ReactKeyIndexStr = (opt: {
  seedStr: string;
  max: number;
}): string => {
  const { seedStr = 'elem-key', max = 100 } = opt;
  return `${seedStr}__${Math.floor(Math.random() * max)}`;
};
