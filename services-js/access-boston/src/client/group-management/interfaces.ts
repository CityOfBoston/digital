export interface member {
  member: String;
}

export interface objectclass {
  objectclass: String;
}

export interface Member {
  cn: String;
  distinguishedName: String;
}

export interface memberOfObjectArray {
  group: Member;
}

export interface isMember {
  groups: Array<[memberOfObjectArray]>;
}

export interface Error {
  resonse: String;
}

export class objectClassArray {
  objectclass: Array<[objectclass]> = [];
  constructor(opts: any) {
    this.objectclass = opts;
  }
}

export interface Group {
  distinguishedName?: string;
  cn?: string;
  name?: string | '';
  member: Array<[member]> | [string];
  displayname?: string;
  objectclass?: Array<[objectclass]>;
}

export interface Person {
  distinguishedName: string;
  cn: string;
  memberOf?: Array<[String]>;
  sn?: string;
  givenname?: string;
  displayname?: string;
  inactive?: Boolean;
  nsaccountlock?: string;
  objectclass?: Array<[string]>;
}
