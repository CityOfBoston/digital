import {
  renameObjectKeys,
  convertToBool,
  remapObjKeys,
  convertOptionalArray,
  abstractDN,
  getOnlyActiveMembers,
} from '../lib/helpers';

export interface controls {
  controls: String;
}

export interface uniquemember {
  uniquemember: String;
}

export interface objectclass {
  objectclass: String;
}

export interface Member {
  cn: String;
  dn: String;
}

export interface ismemberOfObjectArray {
  group: Member;
}

export interface isMember {
  groups: Array<[ismemberOfObjectArray]>;
}

export interface Error {
  resonse: String;
}

export interface ResponseBody {
  data: String;
  error: Error;
}

export interface Response {
  message: String;
  code: String;
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
  base?: String;
  scope?: Number;
  filter?: String;
  attrs?: String;
  pagesize?: Number;
}

export class SearchOptionsClass implements SearchOptions {
  base: String = '';
  scope: Number = 2;
  filter: String = '';
  attrs: String = '';
  pagesize: Number = 10;

  constructor(opts: {
    base?: String;
    scope?: Number;
    filter?: String;
    attrs?: String;
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

export interface Group {
  dn?: string;
  cn?: string;
  controls?: Array<[controls]>;
  uniquemember: Array<[uniquemember]> | [string];
  owner?: Array<[string]>;
  actualdn?: string;
  entrydn?: string;
  objectclass?: Array<[objectclass]>;
  displayname?: string;
  ou?: string;
}

export class GroupClass implements Group {
  dn: string = '';
  cn: string = '';
  controls: Array<[controls]> = [];
  uniquemember: Array<[uniquemember]> = [];
  owner: Array<[string]> = [];
  actualdn: string = '';
  entrydn: string = '';
  objectclass?: Array<[objectclass]> = [];
  displayname?: string = '';
  ou?: string = '';

  constructor(opts: {
    dn?: any;
    cn?: any;
    controls?: any;
    uniquemember?: any;
    owner?: any;
    actualdn?: any;
    entrydn?: any;
    objectclass?: any;
    displayname?: any;
    ou?: any;
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    const members = convertOptionalArray(
      typeof opts.uniquemember !== 'undefined'
        ? getOnlyActiveMembers(opts.uniquemember)
        : []
    );
    const controls = convertOptionalArray(opts.controls ? opts.controls : []);
    const owner = convertOptionalArray(opts.owner ? opts.owner : []);
    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );

    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.controls = controls),
      (this.uniquemember = opts.uniquemember ? members : []),
      (this.owner = owner),
      (this.actualdn = opts.actualdn ? opts.actualdn : ''),
      (this.entrydn = opts.entrydn ? opts.entrydn : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.ou = opts.ou ? opts.ou : ''),
      (this.objectclass = objectclass);
  }
}

export interface Person {
  dn: string;
  cn: string;
  controls?: Array<[controls]>;
  ismemberof?: Array<[String]>;
  mail?: string;
  sn?: string;
  givenname?: string;
  displayname?: string;
  uid?: any;
  inactive?: Boolean;
  nsaccountlock?: string;
  objectclass?: Array<[string]>;
}

export class PersonClass implements Person {
  dn: string = '';
  cn: string = '';
  mail: string = '';
  sn: string = '';
  controls: Array<[controls]> = [];
  ismemberof: Array<[String]> = [];
  givenname: string = '';
  displayname: string = '';
  inactive: Boolean = false;
  nsaccountlock: string = '';
  objectclass: Array<[string]> = [];
  uid: string | number = '';

  constructor(opts: {
    dn?: any;
    cn?: any;
    mail?: any;
    sn?: any;
    controls?: any;
    ismemberof?: any;
    givenname?: any;
    displayname?: any;
    inactive?: any;
    nsAccountLock?: any;
    objectclass?: any;
    uid?: any;
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    const controls = convertOptionalArray(opts.controls ? opts.controls : []);
    const ismemberof = convertOptionalArray(
      opts.ismemberof ? opts.ismemberof : []
    );
    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );
    const parseMembers = (membersArr: Array<[]> = []) => {
      const arrayGroup = membersArr.map(elem => {
        return abstractDN(`${elem}`)['cn'][0];
      });
      return arrayGroup;
    };
    const members = convertOptionalArray(
      typeof opts.ismemberof !== 'undefined' ? parseMembers(ismemberof) : []
    );

    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.mail = opts.mail ? opts.mail.trim() : ''),
      (this.sn = opts.sn ? opts.sn : ''),
      (this.controls = controls),
      (this.ismemberof = members),
      (this.givenname = opts.givenname ? opts.givenname : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.uid = opts.uid ? opts.uid : ''),
      (this.inactive = convertToBool(opts.nsAccountLock, false)),
      (this.objectclass = objectclass);
  }
}

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
  allowInactive: boolean;
  dns: Array<any>;
}

export class FilterOptionsClass implements FilterOptions {
  filterType: string = '';
  field: string = 'cn';
  value: string = '';
  allowInactive: boolean = false;
  dns: [];

  constructor(opts: {
    filterType?: any;
    field?: any;
    value?: any;
    allowInactive?: any;
    dns?: any;
  }) {
    (this.filterType = opts.filterType ? opts.filterType : ''),
      (this.field = opts.field ? opts.field : ''),
      (this.value = opts.value ? opts.value : ''),
      (this.dns = opts.dns ? opts.dns : []),
      (this.allowInactive = opts.allowInactive ? opts.allowInactive : false);
  }
}

export interface filterParams {
  filterParams: FilterOptionsClass;
}

export interface group {
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
      '(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole))',
    pre:
      '(&(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole))(',
    post: '))',
  },
  person: {
    default: '(objectClass=organizationalPerson)',
    pre: '(&(objectClass=organizationalPerson)(',
    inactive: '|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(',
    post: '*))',
  },
};

export const CustomAttributes = {
  default: ['dn', 'cn'],
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
