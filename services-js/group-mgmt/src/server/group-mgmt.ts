/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';
import ldap from 'ldapjs';
import { Group, Person, FilterOptions } from './interfaces/ldap';
import { type } from 'os';

const port = parseInt(process.env.PORT || '7000', 10);

// Access-Boston Active Directory(LDAP) Lookup
const ldapConfig = {
  url: 'ldap://localhost:388',
  baseDn: 'dc=boston,dc=cob',
  bindDn: 'cn=admin,dc=boston,dc=cob',
  scope: 'sub',
  passw: 'GoodNewsEveryone',
};
// const ldapConfig = {
//   url: 'ldap://zdvds01.cityhall.boston.cob:2389',
//   baseDn: 'dc=boston,dc=cob',
//   bindDn: 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev',
//   userDn: 'cn=svc_groupmgmt,cn=Users,dc=boston,cn=cob',
//   scope: 'sub',
//   passw: '5!9ySn9gDN',
// };
const ldapClient = ldap.createClient({ url: ldapConfig.url });

export async function makeServer() {
  const serverOptions = {
    port,
  };

  const server = new HapiServer(serverOptions);

  // Add services to wait for in here.
  // Returns an async shutdown method.
  const startup = async () => {
    return async () => {};
  };

  const bindLdapClient = (force: Boolean = false) => {
    if (
      ldapConfig.bindDn === 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev' ||
      force
    ) {
      console.log('LDAP Bind (Start)');

      ldapClient.bind(ldapConfig.bindDn, ldapConfig.passw, function(err) {
        if (err) {
          console.log('ldapClient.bind err: ', err);
        } else {
          console.log('LDAP Bind (Complete)!');
        }
      });
    }
  };

  // const unBindLdapClient = () => {
  //   if (ldapConfig.bindDn === 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev') {
  //     console.log('unBindLdapClient START');

  //     ldapClient.unbind(function(err) {
  //       if (err) {
  //         console.log('(LDAP) Client Unbind Error: ', err);
  //       }
  //       console.log('Connection Closed: LDAP Client');
  //     });

  //     console.log('unBindLdapClient END');
  //   }
  // };

  const promise_ldapSearch = (err, res) => {
    if (err) {
      console.log('[err]: ', err);
    }

    console.log('promise_ldapSearch: TOP');

    return new Promise((resolve, reject) => {
      const entries: object[] = Array();
      res.on('searchEntry', entry => {
        const currEntry = entry.object || {};
        entries.push(currEntry);
      });

      res.on('error', err => {
        console.error('error: ' + err.message);
        reject();
      });

      res.on('end', () => {
        console.log('entries.length: ', entries.length, '\n -------------- \n');
        resolve(entries);
      });
    });
  };

  const groupModel: Group = {
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

  const personModel: Person = {
    dn: '',
    cn: '',
    controls: [],
    mail: '',
    sn: '',
    givenName: '',
    displayName: '',
  };

  const filters = {
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

  const customAttributes = {
    default: ['dn', 'cn'],
    all: [],
  };

  const setAttributes = (attr = [''], type = 'group') => {
    const attrSet: Array<string> = [];
    attr.forEach(element => {
      if (type === 'group') {
        if (
          Object.keys(groupModel).indexOf(element) > -1 &&
          attrSet.indexOf(element) === -1
        ) {
          attrSet.push(element);
        }
      }
      if (type === 'person') {
        if (
          Object.keys(personModel).indexOf(element) > -1 &&
          attrSet.indexOf(element) === -1
        ) {
          attrSet.push(element);
        }
      }
    });

    if (attrSet.length > 0) {
      return attrSet;
    }

    // Custom Attributes
    switch (attr[0]) {
      case 'all':
        return customAttributes.all;
      default:
        return customAttributes.default;
    }
  };

  const getFilterValue = (filter: FilterOptions) => {
    const searchFilterStr = type => {
      const objClass =
        type === 'group' ? 'groupOfUniqueNames' : 'organizationalPerson';
      return `(&(objectClass=${objClass})(|(displaname=Marie*)(sn=${
        filter.value
      }*)(givenname=${filter.value}*)(cn=${filter.value}*)))`;
    };

    switch (filter.filterType) {
      case 'person':
        if (filter.value.length === 0) {
          return `${filters.person.default}`;
        }
        if (filter.field === 'search') {
          return searchFilterStr(type);
        }

        return `${filters.person.pre}${filter.field}=${filter.value}${
          filters.person.post
        }`;
      case 'group':
        if (filter.value.length === 0) {
          return `${filters.groups.default}`;
        }
        if (filter.field === 'cn') {
          return `${filters.groups.pre}${filter.field}=${filter.value}${
            filters.groups.post
          }`;
        }
        if (filter.field === 'search') {
          return searchFilterStr(type);
        }

        return `${filters.groups.pre}${filter.field}=${filter.value}${
          filters.groups.post
        }`;
      default:
        return filters.groups.default;
    }
  };

  const searchWrapper = (
    attributes = ['dn,cn'],
    filter: FilterOptions = {
      filterType: 'group',
      field: '',
      value: filters.groups.default,
    }
  ) => {
    const filterValue = getFilterValue(filter);
    const thisAttributes =
      typeof attributes === 'object' && attributes.length > 1
        ? attributes
        : setAttributes(attributes, filter.filterType);
    const results = new Promise(function(resolve) {
      bindLdapClient();

      const filterQryParams = {
        scope: 'sub',
        attributes: thisAttributes,
        filter: filterValue,
      };
      console.log('searchWrapper: filterQryParams ', filterQryParams);

      ldapClient.search(ldapConfig.baseDn, filterQryParams, function(err, res) {
        if (err) {
          console.log('ldapsearch error: ', err);
        }
        resolve(promise_ldapSearch(err, res));
      });
    });

    return results;
  };

  try {
    // method: GET | url: /access-boston/api/v1/person
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1/person',
      handler: async request => {
        // const query = request.url.query || { cn: '' };
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
        const searchField = query['search']
          ? 'search'
          : query['displayName']
          ? 'displayName'
          : 'cn';
        const filterParams: FilterOptions = {
          filterType: 'person',
          field: searchField,
          value: query[searchField],
        };
        // console.log('filterParams: ', filterParams);
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
          };
          const group = searchWrapper([], filterParams);
          console.log(group);
          return group;
        });

        return 200;
      },
    });

    // method: GET | url: /access-boston/api/v1/ok
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1/ok',
      handler: () => 'ok',
      options: {
        // mark this as a health check so that it doesn’t get logged
        tags: ['health'],
      },
    });

    // ----------------------------------------------------
    // ----------------------------------------------------
    // ----------------------------------------------------
    // ----------------------------------------------------

    // method: GET | url: /access-boston/api/v1/group/id
    // server.route({
    //   method: 'POST',
    //   path: '/access-boston/api/v1/group/id',
    //   handler: async request => {
    //     const query = request.url.query || { query: { cn: '' } };
    //     const group = searchWrapper([], `(cn=${query['cn']})`);
    //     // console.log('url: /access-boston/api/v1/group/id | request > query: ', query);

    //     return group;
    //   },
    // });
    // ------------------------------------
  } catch (err) {
    console.log('try/catch: err: ', err);
  }

  return { server, startup };
}

export default (async function startServer() {
  await decryptEnv();
  console.log('decryptEnv');

  const { server, startup } = await makeServer();

  const shutdown = await startup();
  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });

  console.log('await server.start');
  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
});
