/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';
import { makeExecutableSchema, ApolloServer } from 'apollo-server-hapi';
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
  ResponseClass,
} from './interfaces';
import { renameObjectKeys, remapObjKeys, returnBool } from '../lib/helpers';
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
      } /*else {
        console.log('LDAP Bind (Complete)!');
      }*/
    });
  }
};

const search_promise = (err, res) => {
  if (err) {
    console.log('[err]: ', err);
  }

  return new Promise((resolve, reject) => {
    const entries: object[] = Array();
    const refInstance = new objectClassArray({});
    res.on('searchEntry', entry => {
      // console.log('ENTRY: ');
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
      // console.log('entries.length: ', entries.length, entries, '\n -------------- \n');
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
        const retStr = `${LdapFilters.person.pre}${
          LdapFilters.person.inactive
        }cn=${filter.value}${LdapFilters.person.post}`;
        // console.log('filter.filterType > retStr: ', retStr);
        return retStr;
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
  // console.log('filter: ', filter);
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
    // console.log('searchWrapper: filterQryParams ', filterQryParams.filter);
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
      // console.log('ldapClient.search: filterValue ', filterValue, filterQryParams);
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

const resolvers = {
  Query: {
    async isPersonInactive(parent: any, args: any) {
      if (parent) {
        console.log('parent: personSearch');
      }

      const retArr: Array<[]> = [];
      const promises = await args.people.map(async cn => {
        const value = cn.indexOf('=') > -1 ? cn.split('=')[1] : cn;
        const in_active = await isMemberActive(value);
        if (in_active === false) {
          retArr.push(cn);
        }
      });

      await Promise.all(promises);
      return retArr;
    },
    async personSearch(parent: any, args: { term: string }) {
      if (parent) {
        console.log('parent: personSearch');
      }
      // console.log('personSearch: (term) > ', args, args.term);
      const term = args.term;

      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'search',
        value: term,
        allowInactive: true,
      });
      const persons = await searchWrapper(['all'], filterParams);
      // console.log('persons: ', persons, '\n --------');
      return persons;
    },
    async person(parent: any, args: { cn: string }) {
      if (parent) {
        console.log('parent: person');
      }
      const value = args.cn.indexOf('=') > -1 ? args.cn.split('=')[1] : args.cn;
      // console.log('value: ', value);

      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'cn',
        value,
        allowInactive: false,
      });
      const person: any = await searchWrapper(['all'], filterParams);
      // console.log('person: ', person, '\n --------');
      return person;
    },
    async group(parent: any, args: { cn: string }) {
      if (parent) {
        console.log('parent: group');
      }
      const value = args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
      });
      const groups: any = await searchWrapper(['all'], filterParams);
      return groups;
    },
    async groupSearch(parent: any, args: { term: string }) {
      if (parent) {
        console.log('parent: groups');
      }
      const value = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: false,
      });

      const groups: any = await searchWrapper(['all'], filterParams);
      const onlyActiveMembers: Array<[]> = [];
      await groups.forEach(async group => {
        group.uniquemember.forEach(async (memberSt: any) => {
          const value =
            memberSt.indexOf('=') > -1 ? memberSt.split('=')[1] : memberSt;
          const in_active = await isMemberActive(value);
          if (in_active === false) {
            onlyActiveMembers.push(memberSt);
          }
        });
      });
      return groups;
    },
  },
  Mutation: {
    async updateGroupMembers() {
      try {
        const opts = arguments[1];
        const changeOpts = new ldap.Change({
          operation: opts.operation,
          modification: {
            uniquemember: [opts.uniquemember],
          },
        });
        // console.log('updateGroupMembers > updateGroupMembers > changeOpts: ', changeOpts); // remapObjKeys
        bindLdapClient();
        ldapClient.modify(opts.dn, changeOpts, async () => {});
      } catch (err) {
        // console.log('Mutation > updateGroupMembers > err: ', err);
      }

      return new ResponseClass({});
    },
  },
};

const isMemberActive = async (cn: String) => {
  const filterParams: FilterOptions = new FilterOptionsClass({
    filterType: 'person',
    field: '',
    value: cn,
    allowInactive: false,
  });
  const person: any = await searchWrapper(['all'], filterParams);
  if (person && typeof person === 'object' && person.length > 0) {
    return returnBool(person[0].nsaccountlock);
  } else {
    return true;
  }
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
    cors: true,
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
