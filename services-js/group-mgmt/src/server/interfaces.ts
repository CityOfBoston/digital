import {
  renameObjectKeys,
  convertToBool,
  remapObjKeys,
  convertOptionalArray,
  abstractDN,
} from '../lib/helpers';

interface controls {
  controls: String;
}

interface uniquemember {
  uniquemember: String;
}

interface objectclass {
  objectclass: String;
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
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    const controls = convertOptionalArray(opts.controls ? opts.controls : []);
    const getOnlyActiveMembers = (arr: any) => {
      const parsedCn = arr.map((str: String) => abstractDN(str)['cn']);
      return parsedCn;
    };
    const members = convertOptionalArray(
      opts.uniquemember ? getOnlyActiveMembers(opts.uniquemember) : []
    );
    const owner = convertOptionalArray(opts.owner ? opts.owner : []);
    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );

    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.controls = controls),
      (this.uniquemember = members),
      (this.owner = owner),
      (this.actualdn = opts.actualdn ? opts.actualdn : ''),
      (this.entrydn = opts.entrydn ? opts.entrydn : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
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
  }) {
    opts = renameObjectKeys(remapObjKeys(this, opts), opts);
    const controls = convertOptionalArray(opts.controls ? opts.controls : []);
    const ismemberof = convertOptionalArray(
      opts.ismemberof ? opts.ismemberof : []
    );
    const objectclass = convertOptionalArray(
      opts.objectclass ? opts.objectclass : []
    );

    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.mail = opts.mail ? opts.mail : ''),
      (this.sn = opts.sn ? opts.sn : ''),
      (this.controls = controls),
      (this.ismemberof = ismemberof),
      (this.givenname = opts.givenname ? opts.givenname : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.inactive = convertToBool(opts.nsAccountLock, false)),
      (this.objectclass = objectclass);
  }
}

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
  allowInactive: boolean;
}

export class FilterOptionsClass implements FilterOptions {
  filterType: string = '';
  field: string = 'cn';
  value: string = '';
  allowInactive: boolean = false;

  constructor(opts: {
    filterType?: any;
    field?: any;
    value?: any;
    allowInactive?: any;
  }) {
    (this.filterType = opts.filterType ? opts.filterType : ''),
      (this.field = opts.field ? opts.field : ''),
      (this.value = opts.value ? opts.value : ''),
      (this.allowInactive = opts.allowInactive ? opts.allowInactive : '');
  }
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
    inactive: '|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(',
    post: '*))',
  },
};

export const CustomAttributes = {
  default: ['dn', 'cn'],
  all: [],
};
