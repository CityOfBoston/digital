/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';
import { makeExecutableSchema, ApolloServer } from 'apollo-server-hapi';
// import { apolloHapi, graphiqlHapi } from'apollo-server-hapi';
// import { HapiGraphqlContextFunction } from '@cityofboston/hapi-common';
// import graphqlSchema, { Context } from './graphql/schema';
// import typeDefs from './graphql/schema';
import ldap from 'ldapjs';
import {
  Person,
  Group,
  objectClassArray,
  PersonClass,
  GroupClass,
  FilterOptionsClass,
  FilterOptions,
  LdapFilters,
  CustomAttributes,
} from './interfaces';
import { renameObjectKeys, remapObjKeys } from '../lib/helpers';
import { ldapConfig } from './ldapConfig';
import { typeDefs } from './graphql/typeDefs';

const port = parseInt(process.env.PORT || '7000', 10);
const ldapClient = ldap.createClient({ url: ldapConfig.url });

const bindLdapClient = (force: Boolean = false) => {
  if (
    ldapConfig.bindDn === 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev' ||
    force
  ) {
    // console.log('LDAP Bind (Start)');

    ldapClient.bind(ldapConfig.bindDn, ldapConfig.passw, function(err) {
      if (err) {
        console.log('ldapClient.bind err: ', err);
      } else {
        // console.log('LDAP Bind (Complete)!');
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

const search_promise = (err, res) => {
  if (err) {
    console.log('[err]: ', err);
  }

  return new Promise((resolve, reject) => {
    const entries: object[] = Array();
    const refInstance = new objectClassArray({});
    res.on('searchEntry', entry => {
      let currEntry = entry.object || {};
      currEntry = renameObjectKeys(
        remapObjKeys(refInstance, currEntry),
        currEntry
      );

      if (currEntry.objectclass.indexOf('organizationalPerson') > -1) {
        const Person: Person = new PersonClass(currEntry);
        entries.push(Person);
      }

      if (currEntry.objectclass.indexOf('groupOfUniqueNames') > -1) {
        // console.log('entry.object: ', entry.object, '\n .........');
        currEntry['onlyActiveMembers'] = true;
        const Group: Group = new GroupClass(currEntry);
        entries.push(Group);
      }
    });

    res.on('error', err => {
      console.error('error: ' + err.message);
      reject();
    });

    res.on('end', () => {
      // console.log('entries.length: ', entries.length, '\n -------------- \n');
      resolve(entries);
    });
  });
};

const setAttributes = (attr = [''], type = 'group') => {
  const attrSet: Array<string> = [];
  attr.forEach(element => {
    if (type === 'group') {
      if (
        Object.keys(new GroupClass({})).indexOf(element) > -1 &&
        attrSet.indexOf(element) === -1
      ) {
        attrSet.push(element);
      }
    }
    if (type === 'person') {
      if (
        Object.keys(new PersonClass({})).indexOf(element) > -1 &&
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
      return CustomAttributes.all;
    default:
      return CustomAttributes.default;
  }
};

const getFilterValue = (filter: FilterOptions) => {
  const searchFilterStr = (type: String) => {
    const objClass =
      type === 'group' ? 'groupOfUniqueNames' : 'organizationalPerson';
    let searchStr = `(&(objectClass=${objClass})`;
    if (type === 'group') {
      return `${searchStr}(cn=${filter.value}*))`;
    } else {
      return `(&(objectClass=${objClass})(|(displayName=${filter.value}*)(sn=${
        filter.value
      }*)(givenname=${filter.value}*)(cn=${filter.value}*)))`;
    }
  };

  switch (filter.filterType) {
    case 'person':
      if (filter.allowInactive === false) {
        return `${LdapFilters.person.pre}${LdapFilters.person.active}cn=${
          filter.value
        }${LdapFilters.person.post}`;
      }

      if (filter.value.length === 0) {
        return `${LdapFilters.person.default}`;
      }
      if (filter.field === 'search') {
        return searchFilterStr(filter.filterType);
      }

      return `${LdapFilters.person.pre}${filter.field}=${filter.value}${
        LdapFilters.person.post
      }`;
    case 'group':
      if (filter.value.length === 0) {
        return `${LdapFilters.groups.default}`;
      }
      if (filter.field === 'cn') {
        return `${LdapFilters.groups.pre}${filter.field}=${filter.value}${
          LdapFilters.groups.post
        }`;
      }
      if (filter.field === 'search') {
        return searchFilterStr(filter.filterType);
      }

      return `${LdapFilters.groups.pre}${filter.field}=${filter.value}${
        LdapFilters.groups.post
      }`;
    default:
      return LdapFilters.groups.default;
  }
};

const searchWrapper = (
  attributes = ['dn,cn'],
  filter: FilterOptions = {
    filterType: 'group',
    field: '',
    value: LdapFilters.groups.default,
    allowInactive: true,
  }
) => {
  const filterValue = getFilterValue(filter);
  // console.log('filterValue: ', filterValue);
  const thisAttributes =
    typeof attributes === 'object' && attributes.length > 1
      ? attributes
      : setAttributes(attributes, filter.filterType);
  // console.log('thisAttributes: ', thisAttributes);
  const results = new Promise(function(resolve, reject) {
    bindLdapClient();

    const filterQryParams = {
      scope: 'sub',
      attributes: thisAttributes,
      filter: filterValue,
    };
    // console.log('searchWrapper: filterQryParams ', filterQryParams);

    if (
      filter.filterType === 'person' &&
      filter.field === 'cn' &&
      filter.value.length < 2
    ) {
      reject();
    }

    ldapClient.search(ldapConfig.baseDn, filterQryParams, function(err, res) {
      if (err) {
        console.log('ldapsearch error: ', err);
      }
      resolve(search_promise(err, res));
    });
  });
  // console.log('searchWrapper > results: ', results);

  return results;
};

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

  try {
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

    await addGraphQl(server);
  } catch (err) {
    console.log('try/catch: err: ', err);
  }

  return { server, startup };
}

const fetchActiveMembers = async group => {
  let retVal: any = [];
  const promises = group.uniquemember.map(async (member: string) => {
    const filterParams: FilterOptions = {
      filterType: 'person',
      field: 'cn',
      value: member,
      allowInactive: false,
    };
    const retObj: any = await searchWrapper(['all'], filterParams);
    return retObj;
  });
  const gprMembers = await Promise.all(promises);
  const activeMembers = gprMembers.filter((entry: any) => entry[0]);
  if (gprMembers.length > 0) {
    const memb = activeMembers.map((entry: any) => `cn=${entry[0].cn}`);
    retVal = memb;
  }

  return retVal;
};

const getParsedGroups = async groups => {
  return new Promise((resolve, reject) => {
    try {
      const promisedGroups: Array<[]> = [];
      groups.forEach(async (elem, index) => {
        const activeMembers = await fetchActiveMembers(elem);

        if (activeMembers.length > 0) {
          elem['uniquemember'] = activeMembers;
          promisedGroups.push(elem);
        }
        if (index + 1 === groups.length) {
          // console.log('END \n --------------');
          resolve(promisedGroups);
        }
      });
    } catch (err) {
      console.log('parsedGroups Error: ', err);
      reject();
    }
  });
};

const resolvers = {
  Query: {
    async personSearch(parent: any, args: { term: string }) {
      if (parent) {
        console.log('parent: personSearch');
      }
      console.log('personSearch: (term) > ', args, args.term);
      const term = args.term;

      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'search',
        value: term,
        allowInactive: true,
      });
      const persons = await searchWrapper(['all'], filterParams);
      console.log('persons: ', persons, '\n --------');
      return persons;
    },
    async person(parent: any, args: { cn: string }) {
      if (parent) {
        console.log('parent: personSearch');
      }
      const value = args.cn;

      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'cn',
        value,
        allowInactive: false,
      });
      const person: any = await searchWrapper(['all'], filterParams);
      console.log('person: ', person, '\n --------');
      return person;
    },
    async group(parent: any, args: { cn: string }) {
      if (parent) {
        console.log('parent: personSearch');
      }
      const value = args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        allowInactive: true,
      });
      const groups: any = await searchWrapper(['all'], filterParams);
      const parsedGroups = await getParsedGroups(groups);
      // console.log('resolvers > group > async parsedGroups: ', parsedGroups, '\n --------');
      return parsedGroups;
    },
    async groupSearch(parent: any, args: { term: string }) {
      if (parent) {
        console.log('parent: personSearch');
      }
      const value = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: true,
      });

      const groups: any = await searchWrapper(['all'], filterParams);
      const parsedGroups = await getParsedGroups(groups);
      // console.log('resolvers > groups > async parsedGroups: ', parsedGroups, '\n --------');
      return parsedGroups;
    },
  },
  Mutation: {
    async updateGroupMembers() {
      const opts = arguments[1];

      const changeOpts = new ldap.Change({
        operation: opts.operation,
        modification: {
          uniqueMember: [opts.uniqueMember],
        },
      });

      bindLdapClient(true);

      ldapClient.modify(opts.dn, changeOpts, async () => {
        console.log('PATCH-ing');
        const filterParams: FilterOptions = {
          filterType: 'group',
          field: 'cn',
          value: opts.cn,
          allowInactive: true,
        };
        const group = searchWrapper([], filterParams);
        // console.log(group);
        return await group;
      });
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function addGraphQl(server: HapiServer) {
  const context = {};
  const apolloServer = new ApolloServer({
    schema,
    context,
  });

  await apolloServer.applyMiddleware({
    app: server,
  });
}

export default (async function startServer() {
  await decryptEnv();

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
