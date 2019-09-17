export interface Group {
  dn?: string;
  cn?: string;
  controls?: Array<[]>;
  uniquemember?: Array<[string]>;
  owner?: Array<[string]>;
  actualdn?: string;
  entrydn?: string;
  objectclass?: Array<[String]>;
  modifyTimestamp?: string;
  modifiersName?: string;
  createTimestamp?: string;
  creatorsName?: string;
}

export interface Person {
  dn: string;
  cn: string;
  controls?: Array<[]>;
  mail?: string;
  sn?: string;
  givenName?: string;
  displayName?: string;
  uid?: any;
}

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
}

export const GroupModel: Group = {
  dn: '',
  controls: [],
  uniquemember: [],
  owner: [],
  actualdn: '',
  entrydn: '',
  objectclass: [],
  modifyTimestamp: '',
  modifiersName: '',
  createTimestamp: '',
  cn: '',
  creatorsName: '',
};

export const PersonModel: Person = {
  dn: '',
  cn: '',
  controls: [],
  mail: '',
  sn: '',
  givenName: '',
  displayName: '',
};

export const LdapFilters = {
  groups: {
    default: '(objectClass=groupOfUniqueNames)',
    pre: '(&(objectClass=groupOfUniqueNames)(',
    post: '))',
  },
  person: {
    default: '(objectClass=organizationalPerson)',
    pre: '(&(objectClass=organizationalPerson)(',
    post: '*))',
  },
};

export const CustomAttributes = {
  default: ['dn', 'cn'],
  all: [],
};

/*
dn: cn=143523,cn=Internal Users,dc=boston,dc=cob
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
objectClass: top
mail: zidane.tribal@boston.gov
sn: Tribal
givenName: Zidane
displayName: Zidane Tribal
cn: 143523
uid: 143523
*/

// interface SamlLogoutRequestAssertion {
//   response_header: SamlResponseHeader;
//   type: 'logout_request';
//   issuer: string;
//   name_id: string;
//   session_index: string;
// }

// {
//   "dn": "cn=Freya Crescent,cn=Internal Users,dc=boston,dc=cob",
//   "controls": [],
//   "objectClass": [
//       "inetOrgPerson",
//       "top",
//       "organizationalPerson",
//       "person"
//   ],
//   "employeeType": "Full-Time",
//   "mail": "freya.crescent@boston.gov",
//   "sn": "Crescent",
//   "givenName": "Freya",
//   "displayName": "Freya Crescent",
//   "cn": "Freya Crescent",
//   "uid": "Freya Crescent"
// }
