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

/*
const unBindLdapClient = () => {
  if (ldapConfig.bindDn === 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev') {
    console.log('unBindLdapClient START');
    ldapClient.unbind(function(err) {
      if (err) {
        console.log('(LDAP) Client Unbind Error: ', err);
      }
      console.log('Connection Closed: LDAP Client');
    });
    console.log('unBindLdapClient END');
  }
};

DEV
searchWrapper: filterQryParams  (&(objectClass=groupOfUniqueNames)(cn=BPD*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=050086*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=087028*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=050086*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=087028*))

DOCKER
searchWrapper: filterQryParams  (&(objectClass=groupOfUniqueNames)(cn=BPD*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=050086*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=087028*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=050086*))
searchWrapper: filterQryParams  (&(objectClass=organizationalPerson)(|(nsAccountLock=FALSE)(!(nsAccountLock=*)))(cn=087028*))
*/

/*
// method: GET | url: /access-boston/api/v1/person
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1/person',
      handler: async request => {
        // const query = request.url.query || { cn: '' };
        const query: Object = request.url.query
          ? request.url.query
          : { attributes: [] };
        const attrs = query['attributes'];
        const attrArr =
          typeof attrs !== 'undefined'
            ? attrs
                .trim()
                .replace(/\s+/g, '')
                .replace(/'/g, '')
                .replace(/"/g, '')
                .split(',')
            : [];
        const searchField = query['search']
          ? 'search'
          : query['displayName']
          ? 'displayName'
          : 'cn';
        const filterParams: FilterOptions = {
          filterType: 'person',
          field: searchField,
          value: query[searchField],
          allowInactive: true,
        };
        // console.log('filterParams: ', filterParams);
        // console.log('method: GET | url: /access-boston/api/v1/person: (query) >', query);
        const person = searchWrapper(attrArr, filterParams);
        return person;
      },
    });

    // method: GET | url: /access-boston/api/v1/groups
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1/groups',
      handler: async request => {
        const query = request.url.query
          ? request.url.query
          : { attributes: [] };
        const attrs = query['attributes'];
        const attrArr =
          typeof attrs !== 'undefined'
            ? attrs
                .trim()
                .replace(/\s+/g, '')
                .replace(/'/g, '')
                .replace(/"/g, '')
                .split(',')
            : [];
        const searchField = query['search'] ? 'search' : 'cn';
        const filterParams: FilterOptions = {
          filterType: 'group',
          field: searchField,
          value: query[searchField] ? query[searchField] : '',
          allowInactive: true,
        };
        console.log('query: ', query);
        console.log('URI: /access-boston/api/v1/groups');
        console.log('searchField: ', searchField);
        console.log('filterParams: ', filterParams);

        const group = searchWrapper(attrArr, filterParams);
        console.log('Route:  group', ' | returning ', group);
        return group;
      },
    });

    // method: PATCH | url: /access-boston/api/v1/group/update
    server.route({
      method: 'PATCH',
      path: '/access-boston/api/v1/group/update',
      handler: async request => {
        console.log('PATCH /access-boston/api/v1/group/update');
        console.log('operation: ', request.payload['operation']);
        console.log('uniqueMember: ', request.payload['uniqueMember']);
        console.log('cn: ', request.payload['cn']);
        console.log('request.payload: ', request.payload);

        const changeOpts = new ldap.Change({
          operation: request.payload['operation'],
          modification: {
            uniqueMember: [request.payload['uniqueMember']],
          },
        });

        bindLdapClient(true);

        ldapClient.modify(request.payload['dn'], changeOpts, () => {
          console.log('PATCH-ing');
          const filterParams: FilterOptions = {
            filterType: 'group',
            field: 'cn',
            value: request.payload['cn'],
            allowInactive: true,
          };
          const group = searchWrapper([], filterParams);
          console.log(group);
          return group;
        });

        return 200;
      },
    });
*/
