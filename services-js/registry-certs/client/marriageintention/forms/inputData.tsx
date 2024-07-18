export const SUFFIX_OPTIONS = [
  {
    label: 'I',
    value: 'I',
  },
  {
    label: 'II',
    value: 'II',
  },
  {
    label: 'III',
    value: 'III',
  },
  {
    label: 'IV',
    value: 'IV',
  },
  {
    label: 'V',
    value: 'V',
  },
  {
    label: 'VI',
    value: 'VI',
  },
  {
    label: 'Jr.',
    value: 'Jr.',
  },
  {
    label: 'Sr.',
    value: 'Sr.',
  },
];

export const LAST_MARRIAGE_STATUS = [
  {
    label: 'Does Not Apply',
    value: 'N/A',
  },
  {
    label: 'Widowed',
    value: 'WID',
  },
  {
    label: 'Divorce',
    value: 'DIV',
  },
  {
    label: 'Void or annulled by court order',
    value: 'CRT',
  },
  {
    label:
      'Void, under former GL c.207/§11 or by operation of law at time of marriage',
    value: '207',
  },
];

export const BOOL_RADIOGROUP = [
  {
    label: 'Yes',
    value: '1',
  },
  {
    label: 'No',
    value: '0',
  },
];

export const PARTNERSHIP_TYPE = [
  {
    label: 'Does Not Apply',
    value: 'N/A',
  },
  {
    label: 'Civil Unions',
    value: 'CIV',
  },
  {
    label: 'Domestic Partnership',
    value: 'DOM',
  },
];

export const PARTNERSHIP_TYPE2 = [
  {
    label: 'Yes, a civil union',
    value: 'CIV',
  },
  {
    label: 'Yes, a domestic partnership',
    value: 'DOM',
  },
  {
    label: 'No',
    value: 'N/A',
  },
];

export const PARTNERSHIP_TYPE_DISSOLVED = [
  {
    label: 'Does Not Apply',
    value: 'N/A',
  },
  {
    label: 'Yes',
    value: 'Yes',
  },
  {
    label: 'No',
    value: 'No',
  },
];

export const SEX_CHECKBOX = [
  {
    label: 'Male',
    value: '1|M',
  },
  {
    label: 'Female',
    value: '2|F',
  },
];

export const MARRIAGE_COUNT = [
  {
    label: '2nd',
    value: '2nd',
  },
  {
    label: '3rd',
    value: '3rd',
  },
  {
    label: '4th',
    value: '4th',
  },
  {
    label: '5th',
    value: '5th',
  },
  {
    label: '6th',
    value: '6th',
  },
  {
    label: '7th',
    value: '7th',
  },
  {
    label: '8th',
    value: '8th',
  },
  {
    label: '9th',
    value: '9th',
  },
];

export const BOSTON_NEIGHBORHOODS = [
  'allston',
  'back bay',
  'bay village',
  'beacon hill',
  'brighton',
  'charlestown',
  'chinatown',
  'dorchester',
  'downtown',
  'dudley',
  'east boston',
  'fenway kenmore',
  'fenway',
  'hyde park',
  'longwood',
  'leather district',
  'kenmore',
  'jamaica plain',
  'mattapan',
  'mid dorchester',
  'mission hill',
  'north end',
  'roslindale',
  'roxbury',
  'south boston',
  'south end',
  'west end',
  'west roxbury',
];

// JSON.stringify($('#ColA_ddlAddressCountry>option').map(function() {return {label: $(this).text(), value: $(this).val()};}).get());
// JSON.stringify($('#ColA_ddlAddressState>option').map(function() {return {label: $(this).text(), value: $(this).val()};}).get());

export default LAST_MARRIAGE_STATUS;
