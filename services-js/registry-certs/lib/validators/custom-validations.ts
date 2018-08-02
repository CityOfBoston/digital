// Side-effects in custom validators to validator.js

import Validator from 'validatorjs';

// https://gist.github.com/mshafrir/2646763
const STATES = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District Of Columbia',
  FM: 'Federated States Of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export const validateTelephone = (value: unknown) =>
  typeof value === 'string' &&
  !!value.match(/^(\+1 ?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/);

export const validateUsState = (value: unknown) =>
  typeof value === 'string' && !!STATES[value];

export const validateUsZip = (value: unknown) =>
  typeof value === 'string' && !!value.match(/^\d\d\d\d\d(-\d\d\d\d)?$/);

Validator.register(
  'telephone',
  validateTelephone,
  'The :attribute is not in the format XXX-XXX-XXXX.'
);

Validator.register(
  'us-state',
  validateUsState,
  'This :attribute is not a recognized state abbreviation.'
);

Validator.register(
  'us-zip',
  validateUsZip,
  'The :attribute must be a 5 or 9 digit ZIP code'
);
