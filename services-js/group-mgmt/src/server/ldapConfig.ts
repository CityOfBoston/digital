// Access-Boston Active Directory(LDAP) Lookup
// export const ldapConfig = {
//   url: 'ldap://localhost:388',
//   baseDn: 'dc=boston,dc=cob',
//   bindDn: 'cn=admin,dc=boston,dc=cob',
//   scope: 'sub',
//   passw: 'GoodNewsEveryone',
// };

export const ldapConfig = {
  url: 'ldap://zdvds01.cityhall.boston.cob:2389',
  baseDn: 'dc=boston,dc=cob',
  bindDn: 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev',
  userDn: 'cn=svc_groupmgmt,cn=Users,dc=boston,cn=cob',
  scope: 'sub',
  passw: '5!9ySn9gDN',
};
