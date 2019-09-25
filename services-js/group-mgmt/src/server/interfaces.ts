import {
  renameObjectKeys,
  convertToBool,
  remapObjKeys,
  convertOptionalArray,
  abstractDN,
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
    const getOnlyActiveMembers = (arr: any) => {
      const data = arr.filter((node: Array<[String]>) => node.length > 0);
      const parsedCn = data.map((str: String) => {
        const abs = abstractDN(str);
        return `cn=${abs['cn'][0]}`;
      });
      return parsedCn;
    };
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
  active?: Boolean;
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
  active: Boolean = false;
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
    active?: any;
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

    // const members_Arr = [];
    // const parseMembers = (membersArr: Array<[]> = []) => {
    //   // const retArr = [];
    //   const arrayGroup = membersArr.map( (elem, index: Number) => {
    //     // const cn = abstractDN(elem)['cn'];
    //     const aCn1 = 'CN=Exchange Servers,OU=Microsoft Exchange Security Groups,DC=gr-u,DC=it';
    //     // const aCn2 = elem;
    //     console.log('typeof elem: ', typeof elem, elem, abstractDN(aCn1));
    //     console.log(`index: ${index} | elem: `, elem);
    //     return {
    //       dn: 'elem',
    //       cn: ''
    //     };
    //   });

    //   return arrayGroup;
    // };

    // console.log('ismemberof: ', ismemberof);
    // console.log('parseMembers: ', parseMembers(ismemberof));

    // abstractDN(str)['cn'][0]

    (this.dn = opts.dn ? opts.dn : ''),
      (this.cn = opts.cn ? opts.cn : ''),
      (this.mail = opts.mail ? opts.mail : ''),
      (this.sn = opts.sn ? opts.sn : ''),
      (this.controls = controls),
      (this.ismemberof = ismemberof),
      (this.givenname = opts.givenname ? opts.givenname : ''),
      (this.displayname = opts.displayname ? opts.displayname : ''),
      (this.uid = opts.uid ? opts.uid : ''),
      (this.active = convertToBool(opts.nsAccountLock, false)),
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
    active: '|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(',
    post: '*))',
  },
};

export const CustomAttributes = {
  default: ['dn', 'cn'],
  all: [],
};
