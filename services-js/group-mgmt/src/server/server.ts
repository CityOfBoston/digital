/* eslint-disable no-debugger */
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
  CommonAttributesClass,
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
// import assert from 'assert';

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
  timeout: 15000,
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
  if (env.LDAP_BIN_DN !== 'cn=admin,dc=boston,dc=gov' || _force) {
    ldapClient.bind(env.LDAP_BIN_DN, env.LDAP_PASSWORD, function(err) {
      if (err) {
        console.log('ldapClient.bind err: ', err);
      }
    });
  } else {
    console.log(`ELSE > ${env.LDAP_BIN_DN} !== 'cn=admin,dc=boston,dc=gov'`);
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
      // console.log('search_promise > promise > entry:', entry);
      // console.log('search_promise > promise > entry.object:', entry.object);
      // console.log('search_promise > promise > currEntry:', currEntry);
      currEntry = renameObjectKeys(
        remapObjKeys(refInstance, currEntry),
        currEntry
      );
      // console.log(
      //   'search_promise > promise > currEntry > renameObjectKeys:',
      //   currEntry
      // );
      // console.log(
      //   'search_promise > promise > currEntry:',
      //   currEntry.objectclass
      // );
      if (currEntry.objectclass.indexOf('organizationalPerson') > -1) {
        const Person: Person = new PersonClass(currEntry);
        entries.push(Person);
      }

      if (
        currEntry.objectclass.indexOf('group') > -1 ||
        currEntry.objectclass.indexOf('container') > -1
      ) {
        // console.log(
        //   'search_promise > promise > currEntry(group|container):',
        //   currEntry.objectclass.indexOf('group')
        // );
        // currEntry['onlyActiveMembers'] = true;
        // console.log(
        //   'search_promise > promise > currEntry(onlyActiveMembers):',
        //   currEntry
        // );
        const Group: Group = new GroupClass(currEntry);
        // console.log('search_promise > promise > currEntry(Group): ', Group);
        entries.push(Group);
      }

      if (currEntry.objectclass.indexOf('organizationalRole') > -1) {
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
      resolve(entries);
    });
  });
};

const setAttributes = (attr = [''], type = 'group') => {
  // console.log('setAttributes > attr: ', attr);
  // console.log('setAttributes > type: ', type);
  const attrSet: Array<string> = [];
  const attrSorted = attr.sort();
  const groupAttrSorted = Object.keys(new GroupClass({})).sort();
  const personAttrSorted = Object.keys(new PersonClass({})).sort();
  const commonAttrSorted = Object.keys(new CommonAttributesClass({})).sort();
  // console.log('ForEach START ----------\n');

  // Undefined, missing, etc attritubes return common attributes
  if (!attr || typeof attr === 'undefined' || attr.length === 0) {
    Object.keys(new CommonAttributesClass({})).forEach(element =>
      attrSet.push(element)
    );
  }

  // If only one attribure is present (default: all), return common attributes
  if (attr.length === 1) {
    Object.keys(new CommonAttributesClass({})).forEach(element =>
      attrSet.push(element)
    );
  }

  // If attributes > 1 find matching attributes class or return common attributes
  if (attr.length > 1) {
    switch (type) {
      case 'group':
        groupAttrSorted.forEach(element => attrSet.push(element));
        break;
      case 'person':
        personAttrSorted.forEach(element => attrSet.push(element));
        break;
      default:
        commonAttrSorted.forEach(element => attrSet.push(element));
        break;
    }

    if (!type || type === '' || type === 'group' || type === 'person') {
      if (JSON.stringify(attrSorted) === JSON.stringify(personAttrSorted)) {
        personAttrSorted.forEach(element => attrSet.push(element));
      } else if (
        JSON.stringify(attrSorted) === JSON.stringify(groupAttrSorted)
      ) {
        groupAttrSorted.forEach(element => attrSet.push(element));
      } else {
        commonAttrSorted.forEach(element => attrSet.push(element));
      }
    }
  }

  // console.log('GroupClass keys', Object.keys(new GroupClass({})));
  // console.log('PersonClass keys', Object.keys(new PersonClass({})));

  attr.forEach(element => {
    // console.log(`type?: ${type}:${element}`);
    try {
      switch (type) {
        case 'group':
          if (
            groupAttrSorted.indexOf(element) > -1 &&
            attrSet.indexOf(element) === -1
          ) {
            attrSet.push(element);
          }
          break;
        case 'person':
          if (
            personAttrSorted.indexOf(element) > -1 &&
            attrSet.indexOf(element) === -1
          ) {
            attrSet.push(element);
          }
          break;
        default:
      }
    } catch (error) {
      console.log('error: ', error);
    }
  });
  // console.log('ForEach END ----------\n');
  // console.log('setAttributes > attrSet: ', attrSet);

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
    const objClass = type === 'group' ? 'group' : 'organizationalPerson';
    if (type === 'group') {
      return `${LdapFilters.groups.pre}cn=*${filter.value}*))`;
    } else {
      if (filter.allowInactive === false) {
        const filterBy: string = filter.by ? filter.by : '';
        const defaultFilters = ['cn', 'sn', 'displayName', 'givenname'];
        if (
          filterBy !== '' &&
          filterBy.length > 0 &&
          defaultFilters.indexOf(filterBy) > -1
        ) {
          return `(&(objectClass=${objClass})(${filterBy.toLowerCase()}=${
            filter.value
          }*))`;
        } else {
          return `(&(objectClass=${objClass})(${
            LdapFilters.person.inactive
          }|(displayname=*${filter.value}*)(sn=*${filter.value}*)(givenname=*${
            filter.value
          }*)(cn=*${filter.value}*)))`;
        }
      } else {
        return `(&(objectClass=${objClass})(|(displayName=*${
          filter.value
        }*)(sn=${filter.value}*)(givenname=${filter.value}*)(cn=*${
          filter.value
        }*)))`;
      }
    }
  };

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
      console.log('getDnsSearchResults > rejected');
      reject();
    }
    console.log('getDnsSearchResults > base_dn ', base_dn);
    console.log('getDnsSearchResults > filterQryParams ', filterQryParams);
    ldapClient.search(
      // `${'CN=SG_AB_PSHCM,OU=PSHCM,OU=Groups,DC=iamdir-test,DC=boston,DC=gov'}`,
      // base_dn,
      // 'DC=iamdir-test,DC=boston,DC=gov',
      env.LDAP_BASE_DN,
      filterQryParams,
      function(err, res) {
        if (err) {
          console.log('ldapsearch error: ', err);
        }
        resolve(search_promise(err, res));
      }
    );
  });

  return results;
};

export const getFilteredResults = async (
  filter: FilterOptions,
  filterQryParams
) => {
  try {
    const promises = filter.dns.map(async value => {
      return await getDnsSearchResults(
        value[0].distinguishedName.toLowerCase(),
        filter,
        filterQryParams
      );
    });
    const promisedRes = await Promise.all(promises);
    const res = promisedRes.flat(Infinity);

    return res.filter((v, i) => res.indexOf(v) === i);
  } catch (error) {
    console.log(`getFilteredResults > promises ERROR: `, error);
    return [];
  }
};

const searchWrapper = async (
  attributes = ['distinguishedName,cn'],
  filter: FilterOptions = {
    filterType: 'group',
    field: '',
    value: LdapFilters.groups.default,
    allowInactive: true,
    dns: [],
    by: '',
  }
) => {
  const base_dn = env.LDAP_BASE_DN;
  const filterValue = getFilterValue(filter);
  const thisAttributes =
    typeof attributes === 'object' && attributes.length > 1
      ? attributes
      : setAttributes(attributes, filter.filterType);
  const filterQryParams = {
    scope: 'sub',
    attributes: thisAttributes,
    filter: filterValue,
  };
  let results: any;

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
        console.log('ldapsearch error(on searchWrapper): ', err);
      }
      resolve(search_promise(err, res));
    });
  });

  return results;
};

export async function convertDns2GroupDNs(
  dns: Array<string>,
  _mode: string = 'filtered'
) {
  // const CNs = dns.map(str => str.split('SG_AB_GRPMGMT_')[1]);
  // console.log('convertDnsToGroupDNs > CNs', CNs, dns);
  console.log('convertDnsToGroupDNs > dns: ', dns);
  return [];
}

const convertDnsToGroupDNs = async (
  dns: Array<string>,
  mode: string = 'filtered'
) => {
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

    if (group.length > 0) {
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
    }
  });

  const results = await (await Promise.all(promises)).filter(
    obj => typeof obj !== 'undefined'
  );

  return results.filter(entry => {
    if (entry.dn) {
      return entry.dn !== '';
    } else {
      return entry.group.dn !== '';
    }
  });
};

const getGroupChildren = async (parentDn: string = '') => {
  const parentCN = abstractDN(parentDn)['cn'][0];
  const filterQryParams = {
    scope: 'sub',
    attrs: ['cn', 'distinguishedName'],
    filter: `(&(|(objectClass=group))(!(cn=${parentCN})))`,
    // filter: `(&(|(objectClass=group)(!(cn=*${parentCN}*)))`,
  };
  // console.log('getGroupChildren > parentCN: ', parentCN, parentDn);
  // console.log('getGroupChildren > filterQryParams: ', filterQryParams);
  try {
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
  } catch (error) {
    console.log(`getGroupChildren > error: `, error);
    return [];
  }
};

export async function makeServer() {
  const serverOptions = {
    port,
    ...(process.env.USE_SSL && process.env.USE_SSL === 'true'
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

export const getGroupByCN = async (cn: string, dns: Array<string> = []) => {
  const value = cn;
  const filterParams: FilterOptions = new FilterOptionsClass({
    filterType: 'group',
    field: 'cn',
    value,
    dns,
  });
  const groups: any = await searchWrapper(['all'], filterParams);
  return groups;
};

const resolvers = {
  Mutation: {
    async updateGroupMembers() {
      console.log(
        'Resolvers > updateGroupMembers (args): ',
        arguments[1],
        'end of args',
        '---'
      );

      try {
        const opts = {
          dn: arguments[1].distinguishedName,
          dns: arguments[1].dns,
          member: arguments[1].member,
          operation: arguments[1].operation,
        };

        let dns: any = [];
        let dn_list: Array<string> = [];

        if (opts.dns && opts.dns.length > 0) {
          dns = await convertDnsToGroupDNs(opts.dns);
          console.log('updateGroupMembers > convertDnsToGroupDNs > dns: ', dns);
          dn_list = dns.map(entry => entry.group.dn);

          // TODO: Re-enable to only allow Group Owners to edit their groups
          const is_DNInOUs = isDNInOUs(opts.dn, dn_list);
          console.log('dn_list: ', dn_list);
          console.log('opts: ', opts);
          console.log('is_DNInOUs: ', is_DNInOUs);
          if (!is_DNInOUs) {
            console.log('isDNInOUs WILL BLOCK THIS Transactions');
            // return new ResponseClass({});
            // return new ResponseClass({
            //   message: '400',
            //   code: 400,
            //   body: {
            //     error:
            //       'Unauthorired Request: User is not a manager of this group',
            //     data: '',
            //   },
            // });
          }
        }

        // const memberCheck =
        //   typeof opts.member === 'object' && opts.member.length > 0;
        // const members = memberCheck ? opts.member : [opts.member];
        // const changeOpts = new ldap.Change({
        //   operation: opts.operation,
        //   modification: {
        //     member: members,
        //   },
        // });

        // bindLdapClient(true);
        // // // req, res, next
        // ldapClient.modify(opts.dn, changeOpts, error => {
        //   console.log('TRANSACTION COMPLETED');
        //   assert.ifError(error);
        // });

        return new ResponseClass({});
      } catch (err) {
        return new ResponseClass({
          message: '400',
          code: 400,
          body: { error: '400', data: '' },
        });
      }
    },
  },
  Query: {
    async getMinimumUserGroups(_parent: any, args: { dns: Array<string> }) {
      // let convertedDNs = await convertDnsToGroupDNs(args.dns, 'group');

      let dns: any = [];
      if (args.dns && args.dns.length > 0) {
        if (args.dns.length > 1) {
          await Promise.all(
            args.dns.map(async cn => {
              dns.push(await getGroupByCN(cn));
            })
          );
        } else {
          dns = await getGroupByCN(args.dns[0]);
        }
      }
      // console.log('getMinimumUserGroups > dns: ', dns);
      // console.log('getMinimumUserGroups > convertedDNs: ', convertedDNs);

      const maxMinimum = 9;
      let currDisplayCount = 0;
      let groups: any = [];
      while (currDisplayCount < maxMinimum) {
        if (dns.length > 0) {
          try {
            const thisArr = dns.shift()[0];
            console.log(`thisArr: `, thisArr);
            const groupChildren: any = await getGroupChildren(
              thisArr.distinguishedName
            );
            console.log('groupChildren: ', groupChildren);
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
          } catch (error) {
            console.log('getMinimumUserGroups ERROR: ', error);
          }
        }
        currDisplayCount++;
      }
      console.log('getMinimumUserGroups > dns > groups:', groups);
      return groups;
      // console.log('args: ', args);
      // return [];
    },
    async getGroupChildren(_parent: any, args: { parentDn: string }) {
      return await getGroupChildren(args.parentDn);
    },
    async convertOUsToContainers(_parent, args: { ous: Array<string> }) {
      // const dns = await convertDnsToGroupDNs(args.ous);
      // const dn_list = dns.map(entry => entry.group.dn);
      // return dn_list;
      console.log('args: ', args);
      return [];
    },
    async isPersonInactive(_parent: any, args: any) {
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
      args: {
        term: string;
        _dns: Array<string>;
        allowInactive: Boolean;
        by: string;
      }
    ) {
      const term = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'search',
        value: term,
        allowInactive: args.allowInactive ? args.allowInactive : false,
        by: args.by ? args.by : '',
      });
      const persons = await searchWrapper(['all'], filterParams);
      return persons;
    },
    async person(
      _parent: any,
      args: {
        cn: string;
        _dns: Array<string>;
        by: string;
      }
    ) {
      const value = args.cn.indexOf('=') > -1 ? args.cn.split('=')[1] : args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'person',
        field: 'cn',
        value,
        allowInactive: false,
        by: args.by ? args.by : '',
      });
      const person: any = await searchWrapper(['all'], filterParams);
      return person;
    },
    async group(_parent: any, args: { cn: string; dns: Array<string> }) {
      let dns: any = [];
      if (args.dns && args.dns.length > 0) {
        if (args.dns.length > 1) {
          await Promise.all(
            args.dns.map(async cn => {
              dns.push(await getGroupByCN(cn));
            })
          );
        } else {
          dns = await getGroupByCN(args.dns[0]);
        }
      }
      // console.log('group > dns: ', dns);
      const value = args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        dns,
      });
      const groups: any = await searchWrapper(['all'], filterParams);
      // const groups: any = await getGroupByCN(value);
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
      }

      const value = args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: args.allowInactive ? args.allowInactive : false,
        dns,
      });
      // console.log('groupSearch > filterParams: ', filterParams);

      let groups: any = await searchWrapper(['all'], filterParams);
      // console.log('groupSearch > groups: ', groups);
      groups = groups.filter(entry => dn_list.indexOf(entry.dn) === -1);
      // console.log('groupSearch > groups(filter): ', groups);
      if (args.activemembers && args.activemembers === true) {
        await groups.forEach(async group => {
          if (typeof group.member === 'object' && group.member.length > 0) {
            const activemembers: Array<[]> = [];
            group.member.forEach(async (memberSt: any) => {
              const value =
                memberSt.indexOf('=') > -1 ? memberSt.split('=')[1] : memberSt;
              const in_active = await isMemberActive(value);
              if (in_active === false) {
                activemembers.push(memberSt);
              }
            });
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
    formatError: () => {
      return {
        message: 'Internal Server Error',
        locations: [],
        path: [],
        extensions: {},
      };
    },
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
