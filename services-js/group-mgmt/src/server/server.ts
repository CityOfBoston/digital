/* eslint no-console: 0 */
import Hapi from 'hapi';
import Inert from 'inert';
import fs from 'fs';
import cleanup from 'node-cleanup';
import { loggingPlugin } from '@cityofboston/hapi-common';
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

const ldap_client = () => {
  return ldap.createClient({
    url: env.LDAP_URL,
    reconnect: true,
    tlsOptions,
    connectTimeout: 120000,
    idleTimeout: 1000,
    timeout: Infinity,
  });
};
let ldapClient = ldap_client();

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
        unbindLdapClient();
      }
    });
  }
};

export const unbindLdapClient = () => {
  ldapClient.unbind(err => {
    if (err) {
      console.log('ldapClient.unBind err: ', err);
    }
  });
};

const get_groupMembers = (
  err: ldap.Error | null,
  // res: ldap.SearchCallbackResponse,
  res: any,
  sort: { direction: string; field: string },
  pageSize: number = 1000,
  type: string = 'PERSON'
  // _callback: any,
  // _paging: boolean,
  // _pagePause: boolean
) => {
  if (err) {
    console.log('[err]: ', err);
  }

  return new Promise((resolve, reject) => {
    // let count = 0;
    let entries: object[] = Array();
    const refInstance = new objectClassArray({});
    // const callback = () => console.log(`getGroupMembers`);
    const sortEntries = () => {
      if (sort && sort.direction) {
        switch (sort.direction) {
          case 'desc':
            entries = entries.sort((a, b) =>
              a[sort.field].localeCompare(b[sort.field])
            );
            break;
          default:
            entries = entries.sort((a, b) =>
              a[sort.field].localeCompare(b[sort.field])
            );
            break;
        }
      }
    };

    res.on('searchEntry', entry => {
      let currEntry = entry.object || {};
      const remapObj = remapObjKeys(refInstance, currEntry);
      let Wrapper: Person | Group =
        type && type === 'PERSON'
          ? new PersonClass(renameObjectKeys(remapObj, currEntry))
          : new GroupClass(renameObjectKeys(remapObj, currEntry));
      // const Person: Person = new PersonClass(
      //   renameObjectKeys(remapObj, currEntry)
      // );
      entries.push(Wrapper);
    });

    res.on('page', (_page: any, _cb: any) => {
      // if (count < 1) {
      //   // console.log('page: ', _cb);
      //   // console.log('controls: ', res, res.controls);
      //   // console.log('page:finished? 1 > ', res.finished);
      //   callback.call('');
      // }
      // count++;

      // if (_cb) {
      //   console.log('_cb 1');
      //   _cb.call();
      // } else {
      //   // search is finished, results in resultArray
      //   console.log('_cb 2');
      // }

      // console.log('PAGING...', _page);
      // console.log('PAGING...');

      if (
        pageSize &&
        typeof pageSize === 'number' &&
        pageSize > 0 &&
        entries.length > pageSize - 1
      ) {
        sortEntries();
        res.finished = true;
        // console.log('page:finished? 2> ', res.finished);
        console.log('AT CAPACITY: ', entries.length);
        resolve(entries);
      }
    });

    res.on('error', err => {
      console.error('error: get_groupMembers | ', err.message, ' | err:', err);
      reject();
    });

    res.on('end', () => {
      sortEntries();
      console.log('CAPACITY: ', entries.length);
      resolve(entries);
    });
  });
};

const search_promise = (err, res) => {
  if (err) {
    console.log('[err]: ', err);
  }

  return new Promise((resolve, reject) => {
    const entries: object[] = Array();
    const refInstance = new objectClassArray({});
    // console.log('search_promise > searchEntry > res', res);

    // let count = 0;

    res.on('searchEntry', entry => {
      let currEntry = entry.object || {};
      const remapObj = remapObjKeys(refInstance, currEntry);
      currEntry = renameObjectKeys(remapObj, currEntry);

      // if (count === 0) {
      //   count++;
      //   console.log('search_promise > searchEntry > currEntry', currEntry);
      // }

      if (
        currEntry.objectclass.indexOf('organizationalPerson') > -1 &&
        currEntry.objectclass.indexOf('person') > -1
      ) {
        const Person: Person = new PersonClass(currEntry);
        entries.push(Person);
      }

      if (
        currEntry.objectclass.indexOf('groupOfUniqueNames') > -1 ||
        currEntry.objectclass.indexOf('organizationalRole') > -1 ||
        currEntry.objectclass.indexOf('container') > -1 ||
        currEntry.objectclass.indexOf('group') > -1
      ) {
        currEntry['onlyActiveMembers'] = true;
        const Group: Group = new GroupClass(currEntry);
        entries.push(Group);
      }

      if (currEntry.objectclass.indexOf('organizationalUnit') > -1) {
        const Group: Group = new GroupClass(currEntry);
        entries.push(Group);
      }
    });

    res.on('error', err => {
      console.error('error: search_promise | ', err.message, ' | err:', err);
      reject();
    });

    res.on('end', () => {
      // console.log('search_promise > entries[0]: ', entries[0]);
      resolve(entries);
    });
  });
};

const setAttributes = (attr = [''], type = 'group') => {
  let attrSet: Array<string> = [];
  if (attr.length === 1 && attr[0] === 'all') {
    switch (type) {
      case 'person':
        attrSet = Object.keys(new PersonClass({}));
        break;
      default:
        attrSet = Object.keys(new GroupClass({}));
        break;
    }
    // console.log('attrSet: ', attrSet);
  } else {
    attr.forEach(element => {
      if (type === 'group') {
        console.log(`setAttributes > type(group) > element: ${element}`);
        console.log(
          `setAttributes > is elem in GroupClass: ${Object.keys(
            new GroupClass({})
          )}`
        );

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
  }

  if (attrSet.length > 0) {
    return attrSet;
  }

  // Custom Attributes
  switch (attr[0]) {
    case 'all':
      console.log(
        'setAttributes > switch(all) > CustomAttributes.all',
        CustomAttributes.all
      );
      return CustomAttributes.all;
    default:
      console.log(
        'setAttributes > switch(default) > CustomAttributes.all',
        CustomAttributes.all
      );
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
        }*)(sn=${filter.value}*)(givenname=${filter.value}*)(cn=${
          filter.value
        }*)))`;
      }
    }
  };

  switch (filter.filterType) {
    case 'person':
      if (filter.allowInactive === false) {
        const retStr = searchFilterStr(filter.filterType);
        return retStr;
      }

      if (filter.value.length === 0) {
        const retStr = `${LdapFilters.person.default}`;
        return retStr;
      }

      if (filter.field === 'search') {
        return searchFilterStr(filter.filterType);
      }

      return `${LdapFilters.person.pre}${filter.field}=${filter.value}${
        LdapFilters.person.post
      }`;
    case 'group':
      if (filter.value.length === 0) {
        const retStr = `${LdapFilters.groups.default}`;
        return retStr;
      }
      if (filter.field === 'cn') {
        const retStr = `${LdapFilters.groups.pre}${filter.field}=${
          filter.value
        }${LdapFilters.groups.post}`;

        return retStr;
      }
      if (filter.field === 'search') {
        const retStr = searchFilterStr(filter.filterType);
        return retStr;
      }

      // eslint-disable-next-line no-case-declarations
      let returnFilter: any = '';
      returnFilter += `${LdapFilters.groups.pre}${filter.field}=*`;
      returnFilter += `${filter.value}${LdapFilters.groups.post}`;

      return returnFilter;
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

const searchGroupMemberAttributes = async (opts: {
  baseDn: string;
  filter: string;
  sort: { direction: string; field: string };
  pageSize: number;
  type: string;
}) => {
  let results: any = [{ givenname: 'First Name', sn: 'Last Name' }];
  if (!opts.type) opts.type = 'GROUP';
  if (!opts.pageSize) opts.pageSize = 1000;

  results = new Promise(function(resolve, reject) {
    bindLdapClient();
    // console.log('opts.filter: ', opts.filter);
    const filterParams = {
      scope: 'sub',
      filter: opts.filter,
      paged: {
        pageSize: opts.pageSize,
        pagePause: true,
      },
      attributes: ['*'],
      // attributes: ['*', 'cOBUserAgency'],
      // getPersonMemberAttributes
    };

    ldapClient.search(opts.baseDn, filterParams, function(err, res) {
      if (err) {
        console.log('ldapsearch error: ', err);
        reject();
      }
      resolve(get_groupMembers(err, res, opts.sort, opts.pageSize, opts.type));
    });
  });

  return results;
};

const searchWrapper = async (
  attributes = ['dn,cn'],
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
    attributes: [
      ...thisAttributes,
      'member;range=0-1499',
      'member;range=0-*',
      '',
    ],
    // attributes: [...thisAttributes],
    filter: filterValue,
  };
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
        console.log('searchWrapper > promise > reject');
        reject();
      }

      let baseDn = base_dn;

      if (filter.field === 'ou') {
        baseDn = `OU=Groups,${baseDn}`;
      }

      ldapClient.search(baseDn, filterQryParams, function(err, res) {
        if (err) {
          console.log('ldapsearch error: ', err);
        }
        resolve(search_promise(err, res));
      });
    });
  }

  return results;
};

const convertDnsToGroupDNs = async (
  dns: Array<string>,
  mode: string = 'filtered'
) => {
  const CNs = dns.map(str => str.split('SG_AB_GRPMGMT_')[1]);
  // console.log('convertDnsToGroupDNs > CNs: ', CNs);
  const promises = CNs.map(async value => {
    const filterParams: FilterOptions = new FilterOptionsClass({
      filterType: 'group',
      field: 'ou',
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
  const $abstractDN = abstractDN(parentDn);
  const parentCN = $abstractDN[Object.keys($abstractDN)[0]][0];
  // console.log('getGroupChildren > parentDn: ', parentDn);
  // console.log('getGroupChildren > parentCN: ', parentCN);

  const filterQryParams = {
    scope: 'sub',
    attrs: '',
    // filter: `(&(|(objectClass=group)(objectClass=organizationalUnit))(!(${
    //   Object.keys($abstractDN)[0]
    // }=${parentCN})))`,
    filter: `(&(|(objectClass=groupOfUniqueNames)(objectClass=container)(objectClass=organizationalRole)(objectClass=group)(objectClass=organizationalUnit))(!(ou=${parentCN})))`,
  };
  // console.log('getGroupChildren > filterQryParams: ', filterQryParams);
  const results = new Promise(function(resolve, reject) {
    bindLdapClient();
    // console.log('getGroupChildren > results(promise)');
    ldapClient.search(parentDn, filterQryParams, function(err, res) {
      if (err) {
        console.log('ldapsearch error: ', err);
        reject();
      }
      // console.log('getGroupChildren > results(promise) > callback: ', res);
      resolve(search_promise(err, res));
    });
  });

  await results;
  // console.log('results.len: ', results);
  return results;
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

  // server.route(adminOkRoute);
  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: async () => {
      const value = 'drupal';
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: false,
        dns: [],
      });

      let groups: any = await searchWrapper(
        ['cn', 'dn', 'displayname', 'objectclass'],
        filterParams
      );
      let mapGrp = {};
      if (groups.length > 0 && typeof groups[0] === 'object') {
        ['cn', 'dn', 'displayname', 'objectclass'].forEach(key => {
          if (key in groups[0]) {
            mapGrp[key] = groups[0][key];
          }
        });
      }
      console.log(`/admin/ok > groups QRY: `, mapGrp['displayname']);
      return 'ok';
    },
    options: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
      auth: false,
    },
  });
  await addGraphQl(server);

  return {
    server,
    startup,
  };
}

const resolvers = {
  Mutation: {
    async updateGroupMembers() {
      // console.log('updateGroupMembers: ', arguments[1]);
      try {
        const opts = arguments[1];
        let dns: any = [];
        let dn_list: any = [];

        if (opts.dns && opts.dns.length > 0) {
          dns = await convertDnsToGroupDNs(opts.dns);
          dn_list = dns.map(entry => entry.group.dn);
          const is_DNInOUs = isDNInOUs(opts.dn, dn_list);
          console.log('is_DNInOUs: ', is_DNInOUs);
          if (!is_DNInOUs) {
            // return new ResponseClass({});
            return new ResponseClass({
              message: '400',
              code: 400,
              body: {
                error:
                  'Unauthorired Request: User is not a manager of this group',
                data: '',
              },
            });
          }
        }
        const memberCheck =
          typeof opts.uniquemember === 'object' && opts.uniquemember.length > 0;
        const members = memberCheck ? opts.uniquemember : [opts.uniquemember];
        const changeOpts = new ldap.Change({
          operation: opts.operation,
          modification: {
            member: members,
          },
        });

        console.log('memberCheck: ', memberCheck);
        console.log('members: ', members);
        // console.log('changeOpts: ', changeOpts);

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
      // console.log('getMinimumUserGroups > TOP: ', args);
      const convertedDNs = await convertDnsToGroupDNs(args.dns, 'group');
      const maxMinimum = 9;
      let groups: any = [];
      let currDisplayCount = 0;

      while (currDisplayCount < maxMinimum) {
        if (convertedDNs.length > 0) {
          const thisArr = convertedDNs.shift();
          const groupChildren: any = await getGroupChildren(thisArr.dn);
          // console.log(
          //   'getMinimumUserGroups > getGroupChildren(thisArr.dn) > groupChildren: ',
          //   thisArr.dn,
          //   groupChildren
          // );
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
      // return [];
    },
    async getGroupChildren(_parent: any, args: { parentDn: string }) {
      console.log('resolvers > getGroupChildren: args: ', args);
      return await getGroupChildren(args.parentDn);
    },
    async convertOUsToContainers(_parent, args: { ous: Array<string> }) {
      const dns = await convertDnsToGroupDNs(args.ous);
      const dn_list = dns.map(entry => entry.group.dn);
      return dn_list;
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
    async group(
      _parent: any,
      args: { cn: string; dns: Array<string>; fetchgroupmember: boolean }
    ) {
      let dns: any = [];

      if (args.dns) {
        dns = await convertDnsToGroupDNs(args.dns);
      }

      const value = args.cn.indexOf('=') > -1 ? args.cn.split('=')[1] : args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        dns,
      });

      return await searchWrapper(['all'], filterParams);
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

      const value =
        args.term.indexOf('=') > -1
          ? abstractDN(args.term)['cn'][0]
          : args.term;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'search',
        value,
        allowInactive: args.allowInactive ? args.allowInactive : false,
        dns,
      });

      let groups: any = await searchWrapper(['all'], filterParams);
      groups = groups.filter(entry => dn_list.indexOf(entry.dn) === -1);
      if (args.activemembers && args.activemembers === true) {
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
          }
        });
        return groups;
      } else {
        return groups;
      }
    },
    async getGroupMemberAttributes(_parent: any, args: any = []) {
      const dn = `OU=Active,${env.LDAP_BASE_DN}`;
      return await searchGroupMemberAttributes({
        baseDn: dn,
        filter: `(&(memberOf=${args.filter})(nsAccountLock=FALSE))`,
        sort: { direction: 'desc', field: 'sn' },
        pageSize: parseInt(env.LDAP_QRY_PAGESIZE) || 1000,
        type: 'PERSON',
      });
    },
    async getPersonMemberAttributes(_parent: any, args: any = []) {
      const dn = `OU=Groups,${env.LDAP_BASE_DN}`;
      return await searchGroupMemberAttributes({
        baseDn: dn,
        filter: `(&(member=${args.filter}))`,
        sort: { direction: 'desc', field: 'cn' },
        pageSize: parseInt(env.LDAP_QRY_PAGESIZE) || 1000,
        type: 'GROUP',
      });
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
