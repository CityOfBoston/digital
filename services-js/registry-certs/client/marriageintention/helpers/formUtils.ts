import { COUNTRIES, US_STATES } from '../forms/inputData';

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
export const YesNoAnswer = (
  val: '1' | '2' | 1 | 2 | string | boolean
): string => {
  if (!val) return ``;
  if (typeof val === 'boolean') return val === true ? 'Yes' : 'No';
  if (typeof val === 'number') return val === 1 ? 'Yes' : 'No';
  return parseInt(val) === 1 ? 'Yes' : 'No';
};
