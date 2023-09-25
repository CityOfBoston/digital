import {
  renameObjectKeys,
  convertToBool,
  remapObjKeys,
  convertOptionalArray,
  abstractDN,
  getPrimaryCNames,
} from '../lib/helpers';

// (COMMON) START | Base attributes
export interface controls {
  controls: string;
}

export interface objectclass {
  objectclass: string;
}

export interface Member {
  distinguishedName?: string;
  dn: string;
  cn: string;
}
// (COMMON) END | Base attributes

// -------------------------------------- #

// (GROUP) START | Base attributes
export interface uniquemember {
  uniquemember: string;
}

export interface member {
  member: string;
}
// (GROUP) END | Base attributes

// -------------------------------------- #

// (PERSON) START | Base attributes
export interface ismemberOfObjectArray {
  group: Member;
}
export interface memberOfObjectArray {
  group: Member;
}
// (PERSON) END | Base attributes

export interface isMember {
  groups: Array<[ismemberOfObjectArray]>;
}

export interface Error {
  resonse: string;
}

export interface ResponseBody {
  data: string;
  error: Error;
}

export interface Response {
  message: string;
  code: string;
  body: ResponseBody;
}

export class ResponseClass implements Response {
  message: string = '';
  code: string = '200';
  body: any;

  constructor(opts: { message?: any; code?: any; body?: any }) {
    (this.message = opts.message ? opts.message : '200 Ok'),
      (this.code = opts.code ? opts.code : '200'),
      (this.body = opts.body ? opts.body : { error: '', data: '' });
  }
}

export interface ApiScopes {
  BASE?: Number;
  ONELEVEL?: Number;
  SUBTREE?: Number;
  SUBORDINATE?: Number;
  DEFAULT?: Number;
}

export class Api_Scopes implements ApiScopes {
  BASE: Number = 0;
  ONELEVEL: Number = 1;
  SUBTREE: Number = 2;
  SUBORDINATE: Number = 3;
  DEFAULT: Number = -1;

  constructor(opts: {
    BASE?: Number;
    ONELEVEL?: Number;
    SUBTREE?: Number;
    SUBORDINATE?: Number;
    DEFAULT?: Number;
  }) {
    (this.BASE = opts.BASE ? opts.BASE : 0),
      (this.ONELEVEL = opts.ONELEVEL ? opts.ONELEVEL : 1),
      (this.SUBTREE = opts.SUBTREE ? opts.SUBTREE : 2),
      (this.SUBORDINATE = opts.SUBORDINATE ? opts.SUBORDINATE : 3),
      (this.DEFAULT = opts.DEFAULT ? opts.DEFAULT : -1);
  }
}

export interface SearchOptions {
  base?: string;
  scope?: Number;
  filter?: string;
  attrs?: string;
  pagesize?: Number;
}

export class SearchOptionsClass implements SearchOptions {
  base: string = '';
  scope: Number = 2;
  filter: string = '';
  attrs: string = '';
  pagesize: Number = 10;

  constructor(opts: {
    base?: any;
    scope?: Number;
    filter?: string;
    attrs?: string;
    pagesize?: Number;
  }) {
    const Scopes = new Api_Scopes({});
    (this.base = opts.base ? opts.base : ''),
      (this.scope = opts.scope ? opts.scope : Scopes.SUBTREE),
      (this.filter = opts.filter ? opts.filter : ''),
      (this.attrs = opts.attrs ? opts.attrs : ''),
      (this.pagesize = opts.pagesize ? opts.pagesize : 10);
  }
}

export class objectClassArray {
  objectclass: Array<[objectclass]> = [];
  constructor(opts: any) {
    this.objectclass = opts;
  }
}

export interface OrgUnit {
  distinguishedName: string;
  ou: string;
  name: string;
  objectCategory: string;
  objectclass?: Array<[objectclass]>;
}

export class OrgUnitClass implements OrgUnit {
  distinguishedName: string = '';
  ou: string = '';
  name: string = '';
  objectCategory: string = '';
  objectclass?: Array<[objectclass]> = [];

  constructor(opts: {
    distinguishedName: string;
    ou: any;
    name: any;
    objectCategory: any;
    objectclass: any;
  }) {
    (this.distinguishedName = opts.distinguishedName
      ? opts.distinguishedName
      : ''),
      (this.ou = opts.ou ? opts.ou : ''),
      (this.name = opts.name ? opts.name : ''),
      (this.objectCategory = opts.objectCategory ? opts.objectCategory : ''),
      (this.objectclass = opts.objectclass ? opts.objectclass : '');
  }
}

export interface Group {
  distinguishedName?: string;
  dn?: string;
  cn?: string;
  member?: Array<member>;
  uniquemember?: Array<[uniquemember]>;
  objectclass?: Array<[objectclass]>;
  displayname?: string;
}

export class GroupClass implements Group {
  distinguishedName?: string = '';
  dn?: string = '';
  cn: string = '';
  member?: Array<member> = [];
  uniquemember?: Array<[uniquemember]> = [];
  objectclass?: Array<[objectclass]> = [];
  displayname?: string = '';

  constructor(opts: {
    distinguishedName?: any;
    dn?: any;
    cn?: any;
    member?: any;
    uniquemember?: any;
    objectclass?: any;
    displayname?: any;
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    let uniquemembers: any = [];
    let members: any = [];

    // Check if either of these (uniquemembers || member) is present and set their values
    if (
      typeof opts.uniquemember !== 'undefined' &&
      opts.uniquemember !== null &&
      convertOptionalArray(opts.uniquemember).length > 0
    ) {
      uniquemembers = convertOptionalArray(getPrimaryCNames(opts.uniquemember));
    }

    if (
      typeof opts.member !== 'undefined' &&
      opts.member !== null &&
      convertOptionalArray(opts.member).length > 0
    ) {
      members = convertOptionalArray(getPrimaryCNames(opts.member));
    }

    // NOTICE: Account for member fields enumarated with the range of their total results, ie. 'member;range=0-1499'
    let membersByRange = Object.keys(opts).filter(name =>
      /member;range=/.test(name)
    );
    if (membersByRange.length > 0) {
      members = convertOptionalArray(getPrimaryCNames(opts[membersByRange[0]]));
    }
    // -------------------------------------

    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );

    (this.distinguishedName = opts.distinguishedName
      ? opts.distinguishedName
      : ''),
      (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.member = opts.member ? members : []),
      (this.uniquemember = opts.uniquemember ? uniquemembers : []),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.objectclass = objectclass);

    if (uniquemembers.length > 0 && members.length < 1) {
      this.member = [...uniquemembers];
    }
    if (members.length > 0 && uniquemembers.length < 1) {
      this.uniquemember = [...members];
    }

    if (opts.dn && opts.dn.length > 0 && !opts.distinguishedName) {
      this.distinguishedName = opts.dn;
    }

    if (
      opts.distinguishedName &&
      opts.distinguishedName.length > 0 &&
      !opts.dn
    ) {
      this.dn = opts.distinguishedName;
    }
  }
}

export interface Person {
  distinguishedName?: string;
  dn?: string;
  cn: string;
  memberof?: Array<[string]>;
  ismemberof?: Array<[string]>;
  mail?: string;
  sn?: string;
  givenname?: string;
  displayname?: string;
  inactive?: Boolean;
  nsaccountlock?: string;
  objectclass?: Array<[string]>;
  cOBUserAgency?: string;
}

export class PersonClass implements Person {
  distinguishedName?: string = '';
  dn?: string = '';
  cn: string = '';
  mail: string = '';
  sn: string = '';
  memberof: Array<[string]> = [];
  ismemberof: Array<[string]> = [];
  givenname: string = '';
  displayname: string = '';
  inactive: Boolean = false;
  nsaccountlock: string = '';
  objectclass: Array<[string]> = [];
  cOBUserAgency: string = '';

  constructor(opts: {
    distinguishedName?: any;
    dn?: any;
    cn?: any;
    mail?: any;
    sn?: any;
    memberof?: any;
    ismemberof?: any;
    givenname?: any;
    displayname?: any;
    inactive?: any;
    nsaccountlock?: any;
    objectclass?: any;
    cOBUserAgency?: any;
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    let ismemberof: any = [];
    let memberof: any = [];
    // const ismemberof = convertOptionalArray(
    //   opts.ismemberof ? opts.ismemberof : []
    // );

    // Check if either of these (ismemberof || memberof) is present and set their values
    if (
      typeof opts.ismemberof !== 'undefined' &&
      opts.ismemberof !== null &&
      convertOptionalArray(opts.ismemberof).length > 0
    ) {
      ismemberof = convertOptionalArray(getPrimaryCNames(opts.ismemberof));
    }

    if (
      typeof opts.memberof !== 'undefined' &&
      opts.memberof !== null &&
      convertOptionalArray(opts.memberof).length > 0
    ) {
      memberof = convertOptionalArray(getPrimaryCNames(opts.memberof));
    }
    // -------------------------------------

    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );

    const parseMembers = (membersArr: Array<[]> = []) => {
      const arrayGroup = membersArr.map(elem => {
        const abstractedDN = abstractDN(`${elem}`)['cn'][0];
        return abstractedDN;
      });
      return arrayGroup;
    };

    const members1 = convertOptionalArray(
      typeof opts.ismemberof !== 'undefined' ? parseMembers(ismemberof) : []
    );

    const members2 = convertOptionalArray(
      typeof opts.memberof !== 'undefined' ? parseMembers(memberof) : []
    );

    (this.distinguishedName = opts.distinguishedName
      ? opts.distinguishedName
      : ''),
      (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.mail = opts.mail ? opts.mail.trim() : ''),
      (this.sn = opts.sn ? opts.sn : ''),
      (this.ismemberof = members1),
      (this.memberof = members2),
      (this.givenname = opts.givenname ? opts.givenname : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.inactive = convertToBool(opts.nsaccountlock, false)),
      (this.cOBUserAgency = opts.cOBUserAgency ? opts.cOBUserAgency : ''),
      (this.objectclass = objectclass);

    if (ismemberof.length > 0 && memberof.length < 1) {
      this.memberof = [...ismemberof];
    }
    if (memberof.length > 0 && ismemberof.length < 1) {
      this.ismemberof = [...memberof];
    }

    if (opts.dn && opts.dn.length > 0 && !opts.distinguishedName) {
      this.distinguishedName = opts.dn;
    }

    if (
      opts.distinguishedName &&
      opts.distinguishedName.length > 0 &&
      !opts.dn
    ) {
      this.dn = opts.distinguishedName;
    }
  }
}

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
  allowInactive: boolean;
  dns: Array<any>;
  by?: string;
}

export class FilterOptionsClass implements FilterOptions {
  filterType: string = '';
  field: string = 'cn';
  value: string = '';
  allowInactive: boolean = false;
  dns: [];
  by: string = '';

  constructor(opts: {
    filterType?: any;
    field?: any;
    value?: any;
    allowInactive?: any;
    dns?: any;
    by?: any;
  }) {
    (this.filterType = opts.filterType ? opts.filterType : ''),
      (this.field = opts.field ? opts.field : ''),
      (this.value = opts.value ? opts.value : ''),
      (this.dns = opts.dns ? opts.dns : []),
      (this.allowInactive = opts.allowInactive ? opts.allowInactive : false),
      (this.by = opts.by ? opts.by : '');
  }
}

export interface filterParams {
  filterParams: FilterOptionsClass;
}

export interface group {
  distinguishedName?: string;
  dn: string;
  cn: string;
}

export interface DNs {
  cn: string;
  filterParams: filterParams;
  group: group;
}

export const LdapFilters = {
  groups: {
    default:
      '(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole)(objectClass=group)(objectClass=organizationalUnit))',
    pre:
      '(&(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole)(objectClass=group)(objectClass=organizationalUnit))(',
    post: '))',
  },
  person: {
    default: '(objectClass=organizationalPerson)',
    pre: '(&(objectClass=organizationalPerson)(',
    inactive: '|(nsaccountlock=FALSE)(!(nsaccountlock=*)))(',
    post: '*))',
  },
};

export const CustomAttributes = {
  default: ['dn', 'distinguishedName', 'cn'],
  all: [],
};

export interface LDAP_ENV {
  LDAP_URL?: string;
  LDAP_BASE_DN: string;
  LDAP_BIN_DN?: string;
  LDAP_USER_DN?: string;
  LDAP_SCOPE?: string;
  LDAP_PASSWORD?: string;
  LDAP_PORT?: string;
  LDAP_CERT?: string;
  GROUP_MGMT_API_KEYS?: string;
}

export class LDAPEnvClass implements LDAP_ENV {
  LDAP_URL: string = '';
  LDAP_BASE_DN: string = '';
  LDAP_BIN_DN: string = '';
  LDAP_USER_DN: string = '';
  LDAP_SCOPE: string = '';
  LDAP_PASSWORD: string = '';
  LDAP_PORT: string = '';
  LDAP_CERT: string = '';
  GROUP_MGMT_API_KEYS: string = '';

  constructor(opts: {
    LDAP_URL?: any;
    LDAP_BASE_DN?: any;
    LDAP_BIN_DN?: any;
    LDAP_USER_DN?: any;
    LDAP_SCOPE?: any;
    LDAP_PASSWORD?: any;
    LDAP_PORT?: any;
    LDAP_CERT?: any;
    GROUP_MGMT_API_KEYS?: any;
  }) {
    (this.LDAP_URL = opts.LDAP_URL || ''),
      (this.LDAP_BASE_DN = opts.LDAP_BASE_DN || ''),
      (this.LDAP_BIN_DN = opts.LDAP_BIN_DN || ''),
      (this.LDAP_USER_DN = opts.LDAP_USER_DN || ''),
      (this.LDAP_SCOPE = opts.LDAP_SCOPE || 'sub'),
      (this.LDAP_PASSWORD = opts.LDAP_PASSWORD || ''),
      (this.LDAP_PORT = opts.LDAP_PORT || 3000),
      (this.LDAP_CERT = opts.LDAP_CERT || ''),
      (this.GROUP_MGMT_API_KEYS = opts.GROUP_MGMT_API_KEYS || '');
  }
}
