interface controls {
  controls: String;
}

interface objectclass {
  objectclass: String;
}

interface uniquemember {
  uniquemember: String;
}

export interface Group {
  dn?: string;
  cn?: string;
  controls?: Array<[controls]>;
  uniquemember?: Array<[uniquemember]>;
  owner?: Array<[string]>;
  actualdn?: string;
  entrydn?: string;
  objectclass?: Array<[objectclass]>;
}

export class GroupClass implements Group {
  dn: string = '';
  cn: string = '';
  controls: Array<[controls]> = [];
  uniquemember: Array<[uniquemember]> = [];
  owner: Array<[string]> = [];
  actualdn: string = '';
  entrydn: string = '';
  objectclass: Array<[objectclass]> = [];

  constructor(opts: {
    dn?: any;
    cn?: any;
    controls?: any;
    uniquemember?: any;
    owner?: any;
    actualdn?: any;
    entrydn?: any;
    objectclass?: any;
  }) {
    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.controls = opts.controls ? opts.controls : ''),
      (this.uniquemember = opts.uniquemember ? opts.uniquemember : ''),
      (this.owner = opts.owner ? opts.owner : ''),
      (this.actualdn = opts.actualdn ? opts.actualdn : ''),
      (this.entrydn = opts.entrydn ? opts.entrydn : ''),
      (this.objectclass = opts.objectclass ? opts.objectclass : []);
  }
}

export interface Person {
  dn: string;
  cn: string;
  controls?: Array<[controls]>;
  isMemberOf?: Array<[String]>;
  mail?: string;
  sn?: string;
  givenname?: string;
  displayname?: string;
  uid?: any;
  nsAccountLock?: string;
  objectclass?: Array<[string]>;
}

export class PersonClass implements Person {
  dn: string = '';
  cn: string = '';
  mail: string = '';
  sn: string = '';
  controls: Array<[controls]> = [];
  isMemberOf: Array<[String]> = [];
  givenname: string = '';
  displayname: string = '';
  nsAccountLock: string = '';
  objectclass: Array<[string]> = [];

  constructor(opts: {
    dn?: any;
    cn?: any;
    mail?: any;
    sn?: any;
    controls?: any;
    givenname?: any;
    displayname?: any;
    nsAccountLock?: any;
    objectclass?: any;
  }) {
    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.mail = opts.mail ? opts.mail : ''),
      (this.sn = opts.sn ? opts.sn : ''),
      (this.controls = opts.controls ? opts.controls : []),
      (this.givenname = opts.givenname ? opts.givenname : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.nsAccountLock = opts.nsAccountLock ? opts.nsAccountLock : ''),
      (this.objectclass = opts.objectclass ? opts.objectclass : []);
  }
}

export const GroupModel: Group = {
  dn: '',
  controls: [],
  uniquemember: [],
  owner: [],
  actualdn: '',
  entrydn: '',
  objectclass: [],
  cn: '',
};

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
}

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
givenname: Zidane
displayname: Zidane Tribal
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
//   "givenname": "Freya",
//   "displayname": "Freya Crescent",
//   "cn": "Freya Crescent",
//   "uid": "Freya Crescent"
// }
