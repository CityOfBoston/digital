import { COUNTRIES, US_STATES } from '../../../utils/data';
import { MARRIAGE_COUNT, PARTNERSHIP_TYPE } from '../forms/inputData';

/**
 * @name retPartnerRequestInformation
 * @description Destructure Data Obj/Value based on partner (form) page (Flag aka A|B)
 * @param {string} partnerFlag
 * @param {object} requestInformation
 * @returns Object - Destructure object
 * @example retPartnerRequestInformation('A', { ... MarriageIntentionCertObj })
 */
export const retPartnerRequestInformation = (
  partnerFlag: string,
  requestInformation: any
) => {
  let retObj = {
    lastName: '',
    firstName: '',
    dob: '',
    age: '',
    surName: '',
    useSurname: '',
    occupation: '',
    bloodRelation: '',
    bloodRelationDesc: '',
    birthCity: '',
    birthState: '',
    birthCountry: '',
    residenceAddress: '',
    residenceCountry: '',
    residenceCity: '',
    residenceZip: '',
    residenceState: '',
    parentsMarriedAtBirth: '',
    parentA_Name: '',
    parentA_Surname: '',
    parentB_Name: '',
    parentB_Surname: '',
    partnershipType: '',
    partnershipTypeDissolved: '',
    partnershipState: '',
    marriageNumb: '',
    marriedBefore: '',
    lastMarriageStatus: '',
    additionalParent: '',
  };

  retObj.firstName = requestInformation[`partner${partnerFlag}_firstName`];
  retObj.lastName = requestInformation[`partner${partnerFlag}_lastName`];
  retObj.dob = requestInformation[`partner${partnerFlag}_dob`];
  retObj.age = requestInformation[`partner${partnerFlag}_age`];
  retObj.surName = requestInformation[`partner${partnerFlag}_surName`];
  retObj.useSurname = requestInformation[`partner${partnerFlag}_useSurname`];
  retObj.occupation = requestInformation[`partner${partnerFlag}_occupation`];
  retObj.bloodRelation =
    requestInformation[`partner${partnerFlag}_bloodRelation`];
  retObj.bloodRelationDesc;
  requestInformation[`partner${partnerFlag}_bloodRelationDesc`];
  retObj.birthCity = requestInformation[`partner${partnerFlag}_birthCity`];
  retObj.birthState = requestInformation[`partner${partnerFlag}_birthState`];
  retObj.birthCountry =
    requestInformation[`partner${partnerFlag}_birthCountry`];
  retObj.residenceAddress =
    requestInformation[`partner${partnerFlag}_residenceAddress`];
  retObj.residenceCountry =
    requestInformation[`partner${partnerFlag}_residenceCountry`];
  retObj.residenceCity =
    requestInformation[`partner${partnerFlag}_residenceCity`];
  retObj.residenceZip =
    requestInformation[`partner${partnerFlag}_residenceZip`];
  retObj.residenceState =
    requestInformation[`partner${partnerFlag}_residenceState`];
  retObj.parentsMarriedAtBirth =
    requestInformation[`partner${partnerFlag}_parentsMarriedAtBirth`];
  retObj.parentA_Name =
    requestInformation[`partner${partnerFlag}_parentA_Name`];
  retObj.parentA_Surname =
    requestInformation[`partner${partnerFlag}_parentA_Surname`];
  retObj.parentB_Name =
    requestInformation[`partner${partnerFlag}_parentB_Name`];
  retObj.parentB_Surname =
    requestInformation[`partner${partnerFlag}_parentB_Surname`];
  retObj.partnershipType =
    requestInformation[`partner${partnerFlag}_partnershipType`];
  retObj.partnershipTypeDissolved =
    requestInformation[`partner${partnerFlag}_partnershipTypeDissolved`];
  retObj.partnershipState =
    requestInformation[`partner${partnerFlag}_partnershipState`];
  retObj.marriageNumb =
    requestInformation[`partner${partnerFlag}_marriageNumb`];
  retObj.marriedBefore =
    requestInformation[`partner${partnerFlag}_marriedBefore`];
  retObj.lastMarriageStatus =
    requestInformation[`partner${partnerFlag}_lastMarriageStatus`];
  retObj.additionalParent =
    requestInformation[`partner${partnerFlag}_additionalParent`];

  return retObj;
};

/**
 * @name isPartnerFormPageComplete
 * @param {string} partnerFlag Partner Form Page A | B
 * @param requestInformation {object} MarriageIntentionCertificateRequest Instance
 * @returns {boolean} Boolean - true | false
 */
export const isPartnerFormPageComplete = (
  partnerFlag: string,
  requestInformation: object
): boolean => {
  const data = retPartnerRequestInformation(partnerFlag, requestInformation);

  let bloodRelReq = true;
  let useSurnameReq = true;
  let additionalParentsReq = true;
  let marriedBeforeReq = true;
  let partnership_dissolved = true;
  let lastMarriageStatusReq = true;
  let birthStateZip = true;
  let partnershipStateBool = true;
  let residenceZipBool = true;
  let residenceStateBool = true;
  let additionalParent_Name = true;
  let additionalParent_Surname = true;

  if (data.residenceCountry === 'USA' && data.residenceState === '') {
    residenceStateBool = false;
  }

  if (data.residenceCountry === 'USA' && data.residenceZip === '') {
    residenceZipBool = false;
  }

  if (
    data.partnershipType !== PARTNERSHIP_TYPE[0].value &&
    data.residenceState &&
    typeof data.residenceState === 'string' &&
    data.partnershipState.length < 2
  ) {
    partnershipStateBool = false;
  }

  const bloodRelDescReq =
    data.bloodRelation && data.bloodRelation == '1' ? true : false;

  if (bloodRelDescReq && data.bloodRelationDesc.length < 1) {
    bloodRelReq = false;
  }

  const surNameTextReq =
    data.useSurname && data.useSurname === '1' ? true : false;

  if ((surNameTextReq && data.surName.length < 1) || data.useSurname == '') {
    useSurnameReq = false;
  }

  const addParentsReq =
    data.additionalParent && data.additionalParent == '1' ? true : false;

  if (
    (addParentsReq &&
      (data.parentB_Name.length < 1 || data.parentB_Surname.length < 1)) ||
    data.additionalParent == ''
  ) {
    additionalParentsReq = false;
  }

  if (data.additionalParent == '1' && data.parentB_Name.length < 1)
    additionalParent_Name = false;

  if (data.additionalParent == '1' && data.parentB_Surname.length < 1)
    additionalParent_Surname = false;

  if (data.birthCountry === 'USA') {
    birthStateZip = data.birthState.length > 0 ? true : false;
  }

  const marriedBeforeBool = data.marriedBefore === '1' ? true : false;

  if (data.marriedBefore === '') marriedBeforeReq = false;
  if (marriedBeforeBool && data.marriageNumb === '') marriedBeforeReq = false;

  const getMarriageNumb = (): { label: string; value: string } => {
    let retOb = MARRIAGE_COUNT.find(entry => entry.value == data.marriageNumb);

    if (!retOb) retOb = { label: '', value: '' };

    return retOb;
  };

  const marriageNumbBool: {
    label: string;
    value: string;
  } = getMarriageNumb();

  if (marriageNumbBool && marriageNumbBool.value !== '') {
    if (data.lastMarriageStatus === '') {
      lastMarriageStatusReq = false;
    }
  }

  if (data.partnershipType !== PARTNERSHIP_TYPE[0].value) {
    if (data.partnershipTypeDissolved === '') {
      partnership_dissolved = false;
    }
  }

  const is_Complete = !!(
    data.lastName &&
    data.firstName &&
    data.dob &&
    data.age &&
    data.occupation &&
    data.bloodRelation &&
    data.birthCity &&
    data.birthCountry &&
    data.residenceAddress &&
    data.residenceCountry &&
    data.residenceCity &&
    data.parentsMarriedAtBirth &&
    data.partnershipType &&
    data.parentA_Name &&
    data.parentA_Surname &&
    partnership_dissolved &&
    lastMarriageStatusReq &&
    partnershipStateBool &&
    birthStateZip &&
    bloodRelReq &&
    additionalParentsReq &&
    marriedBeforeReq &&
    useSurnameReq &&
    residenceZipBool &&
    residenceStateBool &&
    additionalParent_Name &&
    additionalParent_Surname
  );

  return is_Complete;
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
