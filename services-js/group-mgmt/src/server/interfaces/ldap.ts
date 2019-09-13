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

export interface FilterOptions {
  filterType: string;
  field: string;
  value: string;
}

// interface SamlLogoutRequestAssertion {
//   response_header: SamlResponseHeader;
//   type: 'logout_request';
//   issuer: string;
//   name_id: string;
//   session_index: string;
// }
