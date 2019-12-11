/* eslint no-console: 0 */
import Hapi from 'hapi';
import Inert from 'inert';
import fs from 'fs';
import cleanup from 'node-cleanup';
import { loggingPlugin, adminOkRoute } from '@cityofboston/hapi-common';
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
  LDAPEnvClass,
} from './interfaces';
import {
  renameObjectKeys,
  remapObjKeys,
  returnBool,
  abstractDN,
  isDNInOUs,
} from '../lib/helpers';
import { typeDefs } from './graphql/typeDefs';
import decryptEnv from '@cityofboston/srv-decrypt-env';
import { Source } from './graphql';

require('dotenv').config();
const env = new LDAPEnvClass(process.env);

let tlsOptions = {};
if (
  env.LDAP_CERT &&
  typeof env.LDAP_CERT === 'string' &&
  env.LDAP_CERT.length > 0
) {
  tlsOptions = {
    ca: fs.readFileSync(env.LDAP_CERT),
    rejectUnauthorized: false,
  };
}

const ldapClient = ldap.createClient({
  url: env.LDAP_URL,
  reconnect: true,
  tlsOptions,
});

type Credentials = {
  source: Source;
};

declare module 'hapi' {
  interface AuthCredentials extends Credentials {
    key: string;
  }
}

const port = parseInt(process.env.PORT || env.LDAP_PORT, 10);

const bindLdapClient = (_force: Boolean = false) => {
  if (env.LDAP_BIN_DN !== 'cn=admin,dc=boston,dc=cob' || _force) {
    ldapClient.bind(env.LDAP_BIN_DN, env.LDAP_PASSWORD, function(err) {
      if (err) {
        console.log('ldapClient.bind err: ', err);
      }
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
      let currEntry = entry.object || {};
      currEntry = renameObjectKeys(
        remapObjKeys(refInstance, currEntry),
        currEntry
      );

      if (currEntry.objectclass.indexOf('organizationalPerson') > -1) {
        const Person: Person = new PersonClass(currEntry);
        entries.push(Person);
      }

      if (
        currEntry.objectclass.indexOf('groupOfUniqueNames') > -1 ||
        currEntry.objectclass.indexOf('container') > -1
      ) {
        // console.log('entry.object: ', entry.object, '\n .........');
        currEntry['onlyActiveMembers'] = true;
        const Group: Group = new GroupClass(currEntry);
        entries.push(Group);
      }

      if (currEntry.objectclass.indexOf('organizationalRole') > -1) {
        // console.log('entry.object: ', entry.object, '\n .........');
        currEntry['onlyActiveMembers'] = true;
        const Group: Group = new GroupClass(currEntry);
        entries.push(Group);
      }

      // console.log('entry.object: ', entry.object, '\n .........');
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
    if (type === 'group') {
      return `${LdapFilters.groups.pre}cn=*${filter.value}*))`;
    } else {
      if (filter.allowInactive === false) {
        return `(&(objectClass=${objClass})(${
          LdapFilters.person.inactive
        }|(displayname=*${filter.value}*)(sn=*${filter.value}*)(givenname=*${
          filter.value
        }*)(cn=*${filter.value}*)))`;
      } else {
        return `(&(objectClass=${objClass})(|(displayName=*${
          filter.value
        }*)(sn=${filter.value}*)(givenname=${filter.value}*)(cn=${
          filter.value
        }*)))`;
      }
    }
  };
  // console.log('getFilterValue > filter: ', filter);

  switch (filter.filterType) {
    case 'person':
      if (filter.allowInactive === false) {
        return searchFilterStr(filter.filterType);
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

const getDnsSearchResults = async (base_dn, filter, filterQryParams) => {
  const results = new Promise(function(resolve, reject) {
    bindLdapClient();
    if (
      filter.filterType === 'person' &&
      filter.field === 'cn' &&
      filter.value.length < 2
    ) {
      reject();
    }
    ldapClient.search(base_dn, filterQryParams, function(err, res) {
      if (err) {
        console.log('ldapsearch error: ', err);
      }
      resolve(search_promise(err, res));
    });
  });

  return results;
};

const getFilteredResults = async (filter: FilterOptions, filterQryParams) => {
  const promises = filter.dns.map(async value => {
    return await getDnsSearchResults(
      value.group.dn.toLowerCase(),
      filter,
      filterQryParams
    );
  });
  const promisedRes = await Promise.all(promises);
  const res = promisedRes.flat(Infinity);

  return res.filter((v, i) => res.indexOf(v) === i);
};

const searchWrapper = async (
  attributes = ['dn,cn'],
  filter: FilterOptions = {
    filterType: 'group',
    field: '',
    value: LdapFilters.groups.default,
    allowInactive: true,
    dns: [],
  }
) => {
  const base_dn = env.LDAP_BASE_DN;
  const filterValue = getFilterValue(filter);
  // console.log('filterValue: ', filterValue);
  const thisAttributes =
    typeof attributes === 'object' && attributes.length > 1
      ? attributes
      : setAttributes(attributes, filter.filterType);
  // console.log('thisAttributes: ', thisAttributes);
  const filterQryParams = {
    scope: 'sub',
    attributes: thisAttributes,
    filter: filterValue,
  };
  // console.log('filterQryParams: ', filterQryParams);
  let results: any;

  if (filter.dns.length > 0) {
    try {
      results = await getFilteredResults(filter, filterQryParams);
    } catch (err) {
      console.log('filteredResults > err: ', err);
    }
  } else {
    results = new Promise(function(resolve, reject) {
      bindLdapClient();
      if (
        filter.filterType === 'person' &&
        filter.field === 'cn' &&
        filter.value.length < 2
      ) {
        reject();
      }
      ldapClient.search(base_dn, filterQryParams, function(err, res) {
        if (err) {
          console.log('ldapsearch error: ', err);
        }
        resolve(search_promise(err, res));
      });
    });
  }
  // console.log('searchWrapper > results: ', results);

  return results;
};

const convertDnsToGroupDNs = async (
  dns: Array<string>,
  mode: string = 'filtered'
) => {
  if (dns.length > 0) {
    const CNs = dns.map(str => str.split('SG_AB_GRPMGMT_')[1]);
    const promises = CNs.map(async value => {
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        allowInactive: false,
      });
      const group: any = await searchWrapper(['all'], filterParams);
      let retObj: any = {};
      let groupRetObj: any = {};

      if (mode && mode === 'group') {
        const newGroup: Group = new GroupClass({});
        groupRetObj = group.length > 0 && group[0].dn ? group[0] : newGroup;
        retObj = groupRetObj;
      } else {
        groupRetObj =
          group.length > 0 && group[0].dn
            ? { dn: group[0].dn, cn: group[0].cn }
            : { dn: '', cn: '' };
        retObj = {
          cn: value,
          filterParams,
          group: groupRetObj,
        };
      }
      return retObj;
    });
    const results = await Promise.all(promises);

    return results.filter(entry => {
      if (entry.dn) {
        return entry.dn !== '';
      } else {
        return entry.group.dn !== '';
      }
    });
  } else {
    return [];
  }
};

const getGroupChildren = async (parentDn: string = '') => {
  const parentCN = abstractDN(parentDn)['cn'][0];
  const filterQryParams = {
    scope: 'sub',
    attrs: '',
    filter: `(&(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole))(!(cn=${parentCN})))`,
  };
  const results = new Promise(function(resolve, reject) {
    bindLdapClient();
    ldapClient.search(parentDn, filterQryParams, function(err, res) {
      if (err) {
        console.log('ldapsearch error: ', err);
        reject();
      }
      resolve(search_promise(err, res));
    });
  });

  return await results;
};

export async function makeServer() {
  const serverOptions = {
    port,
    ...(process.env.USE_SSL
      ? {
          tls: {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
          },
        }
      : {}),
  };

  const server = new Hapi.Server(serverOptions);
  const startup = async () => {
    return async () => {};
  };

  const apiKeys: { [key: string]: Credentials } = {};

  if (process.env.API_KEYS) {
    process.env.API_KEYS.split(',').forEach(k => {
      apiKeys[k] = { source: 'unknown' };
    });
  }

  if (process.env.WEB_API_KEY) {
    apiKeys[process.env.WEB_API_KEY] = {
      source: 'web',
    };
  }
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/',
    handler: () => 'ok',
  });

  server.route(adminOkRoute);
  await addGraphQl(server);

  return {
    server,
    startup,
  };
}

const resolvers = {
  Mutation: {
    async updateGroupMembers() {
      try {
        const opts = arguments[1];
        let dns: any = [];
        let dn_list: any = [];

        if (opts.dns && opts.dns.length > 0) {
          dns = await convertDnsToGroupDNs(opts.dns);
          dn_list = dns.map(entry => entry.group.dn);
          if (!isDNInOUs(opts.dn, dn_list)) {
            return new ResponseClass({});
          }
        }
        const memberCheck =
          typeof opts.uniquemember === 'object' && opts.uniquemember.length > 0;
        const members = memberCheck ? opts.uniquemember : [opts.uniquemember];
        const changeOpts = new ldap.Change({
          operation: opts.operation,
          modification: {
            uniquemember: members,
          },
        });
        bindLdapClient(true);
        // req, res, next
        ldapClient.modify(opts.dn, changeOpts, async () => {});
      } catch (err) {
        console.log('Mutation > updateGroupMembers > err: ', err);
      }

      return new ResponseClass({});
    },
  },
  Query: {
    async getMinimumUserGroups(_parent: any, args: { dns: Array<string> }) {
      const convertedDNs = await convertDnsToGroupDNs(args.dns, 'group');
      const maxMinimum = 9;
      let groups: any = [];
      let currDisplayCount = 0;

      while (currDisplayCount < maxMinimum) {
        if (convertedDNs.length > 0) {
          const thisArr = convertedDNs.shift();
          const groupChildren: any = await getGroupChildren(thisArr.dn);
          if (currDisplayCount < maxMinimum && groupChildren.length > 0) {
            const remainingFromMax = maxMinimum - currDisplayCount;
            if (groupChildren.length < remainingFromMax) {
              groups = [...groups, ...groupChildren];
            } else {
              for (let i = remainingFromMax; i > 0; i--) {
                groups.push(groupChildren[i]);
              }
            }
          }
        }
        currDisplayCount++;
      }
      return groups;
    },
    async getGroupChildren(_parent: any, args: { parentDn: string }) {
      return await getGroupChildren(args.parentDn);
    },
    async convertOUsToContainers(_parent, args: { ous: Array<string> }) {
      const dns = await convertDnsToGroupDNs(args.ous);
      const dn_list = dns.map(entry => entry.group.dn);
      return dn_list;
    },
    async isPersonInactive(parent: any, args: any) {
      if (parent) {
        console.log('parent: personSearch');
      }

      const retArr: Array<[]> = [];
      const promises = await args.people.map(async (cn: any) => {
        const value = cn.indexOf('=') > -1 ? abstractDN(cn)['cn'][0] : cn;
        const in_active = await isMemberActive(value);
        if (in_active === false) {
          retArr.push(cn);
        }
      });

      await Promise.all(promises);
      return retArr;
    },
    async personSearch(
      _parent: any,
      args: { term: string; _dns: Array<string>; allowInactive: Boolean }
    ) {
      const term = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'search',
        value: term,
        allowInactive: args.allowInactive ? args.allowInactive : false,
      });
      const persons = await searchWrapper(['all'], filterParams);
      // console.log('filterParams: ', filterParams);
      // console.log('persons: ', persons, '\n --------');
      return persons;
    },
    async person(parent: any, args: { cn: string; _dns: Array<string> }) {
      if (parent) {
        console.log('Query > person > parent: person');
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
    async group(parent: any, args: { cn: string; dns: Array<string> }) {
      let dns: any = [];
      if (parent) {
        console.log('Query > group > parent: group');
      }
      if (args.dns) {
        dns = await convertDnsToGroupDNs(args.dns);
        // console.log('Query > group > dns: ', args.dns);
      }
      // console.log('dns: ', args);

      const value = args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        dns,
      });
      // console.log('filterParams: ', filterParams);
      const groups: any = await searchWrapper(['all'], filterParams);
      return groups;
    },
    async groupSearch(
      _parent: any,
      args: {
        term: string;
        dns: Array<string>;
        activemembers: any;
        allowInactive: Boolean;
      }
    ) {
      let dns: any = [];
      let dn_list: any = [];
      if (args.dns && args.dns.length > 0) {
        dns = await convertDnsToGroupDNs(args.dns);
        dn_list = dns.map(entry => entry.group.dn);
        // console.log('dns: ', dns[dns.length-1], dns);
        // console.log('dns DN: ', dn_list);
      }
      // console.log('Query > groupSearch > dns: ', args.dns, dns);

      const value = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: args.allowInactive ? args.allowInactive : false,
        dns,
      });

      let groups: any = await searchWrapper(['all'], filterParams);
      groups = groups.filter(entry => dn_list.indexOf(entry.dn) === -1);
      // console.log('groups: ', groups, '\n --------', filterParams);
      // console.log('filterParams: ', filterParams);
      // console.log('groups: ', '\n', groups.filter(entry => dn_list.indexOf(entry.dn) === -1));
      // console.log('groups: ', groups, '\n');
      if (args.activemembers && args.activemembers === true) {
        // console.log('Query > groupSearch > activemembers: ', args.activemembers);
        await groups.forEach(async group => {
          if (
            typeof group.uniquemember === 'object' &&
            group.uniquemember.length > 0
          ) {
            const activemembers: Array<[]> = [];
            group.uniquemember.forEach(async (memberSt: any) => {
              const value =
                memberSt.indexOf('=') > -1 ? memberSt.split('=')[1] : memberSt;
              const in_active = await isMemberActive(value);
              if (in_active === false) {
                activemembers.push(memberSt);
              }
            });
            // console.log('activemembers: ', activemembers, '\n', group.uniquemember, '\n');
          }
        });
        return groups;
      } else {
        return groups;
      }
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

async function addGraphQl(server: Hapi.Server) {
  const context = _req => {
    const token = _req.request.headers.token;
    if (
      env.GROUP_MGMT_API_KEYS &&
      env.GROUP_MGMT_API_KEYS.length > 0 &&
      env.GROUP_MGMT_API_KEYS.indexOf(',') > -1
    ) {
      if (!token || env.GROUP_MGMT_API_KEYS.indexOf(token) === -1) {
        const err = {
          code: 401,
          statusCode: 401,
          error: 'Invalid or missing API Key',
          message: 'Unauthorized',
        };
        throw err;
      }
    }
  };
  const apolloServer = new ApolloServer({
    schema,
    context,
  });

  await apolloServer.applyMiddleware({
    app: server,
    cors: true,
  });
}

export default async function startServer() {
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

  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
}
