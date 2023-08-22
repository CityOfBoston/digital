/* eslint no-console: 0 */
import Hapi from 'hapi';
import Inert from 'inert';
import fs from 'fs';
import cleanup from 'node-cleanup';
import {
  loggingPlugin,
  // adminOkRoute
} from '@cityofboston/hapi-common';
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
  // OrgUnitClass,
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

ldapClient.on('connect', _err => {
  // handle connection error
  console.log('Client connected (LDAP)');
  // console.log('ldapClient > connect (_err): ', _err);
});

ldapClient.on('idle', err => {
  // handle connection error
  console.log('Idle timeout reached');
  console.log('ldapClient > idle (err): ', err);
});

ldapClient.on('connectError', err => {
  // handle connection error
  console.log('Socket connection error');
  console.log('ldapClient > connectError (err): ', err);
});

ldapClient.on('connectTimeout', err => {
  // handle connection error
  console.log('Server timeout');
  console.log('ldapClient > connectTimeout (err): ', err);
});

ldapClient.on('destroy', err => {
  // handle connection error
  console.log('After client is disconnected');
  console.log('ldapClient > destroy (err): ', err);
});

ldapClient.on('close', err => {
  // handle connection error
  console.log('Socket closed');
  console.log('ldapClient > close (err): ', err);
  console.log(`RECONNECTING (from 'close')...`);
  ldapClient = ldap_client();
});

ldapClient.on('error', err => {
  // handle connection error
  console.log('Socket error');
  console.log('ldapClient > error (err): ', err);
  console.log(`RECONNECTING (from 'error')...`);
  ldapClient = ldap_client();
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
    // assert.ifError(err);
  });
};

const search_promise = (err, res) => {
  if (err) {
    console.log('[err]: ', err);
  }

  return new Promise((resolve, reject) => {
    const entries: object[] = Array();
    const refInstance = new objectClassArray({});
    // console.log('search_promise > Promise');
    res.on('searchEntry', entry => {
      // console.log(
      //   'search_promise > Promise > res.on > entry > entry.attributes.length: ',
      //   entry.attributes.length
      // );

      // if (entry.attributes && entry.attributes.length > 0) {
      //   entry.attributes.forEach(attribute => {
      //     console.log(`attribute: ${attribute.type}`);
      //     if (attribute.type === 'cn') {
      //       console.log('attribute.type[cn]: ', attribute.type);
      //       console.log('attribute.type[cn][_vals]: ', attribute['_vals']);
      //     }
      //     console.log('attribute._vals: ', JSON.stringify(attribute._vals));
      //   });
      // }
      // console.log('entry: ', entry);

      let currEntry = entry.object || {};
      const remapObj = remapObjKeys(refInstance, currEntry);
      // console.log('res.on > remapObj: ', remapObj);
      currEntry = renameObjectKeys(
        // remapObjKeys(refInstance, currEntry),
        remapObj,
        currEntry
      );

      // console.log('currEntry: ', currEntry);

      // console.log(
      //   `Object.keys(entry): `,
      //   Object.keys(entry).map(key => key.toLocaleLowerCase())
      // );

      // console.log('currEntry.objectclass: ', currEntry.objectclass);
      if (
        currEntry.objectclass.indexOf('organizationalPerson') > -1 &&
        currEntry.objectclass.indexOf('person') > -1
      ) {
        const Person: Person = new PersonClass(currEntry);
        // console.log(
        //   `currEntry.objectclass.indexOf('organizationalPerson'): `,
        //   currEntry.objectclass.indexOf('organizationalPerson')
        // );
        // console.log('\n', ' Person: ', Person);
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
      // console.log('search_promise > Promise > res.end > entry: ', entries);
      resolve(entries);
    });
  });
};

const setAttributes = (attr = [''], type = 'group') => {
  // console.log('setAttributes');
  // console.log(`setAttributes > attr: ${attr} | type: ${type}`);
  let attrSet: Array<string> = [];
  if (attr.length === 1 && attr[0] === 'all') {
    // console.log(
    //   `setAttributes > attr && length > 0: ${attr.length === 1 &&
    //     attr[0] === 'all'}`
    // );
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
    // console.log('setAttributes > (attrSet.length > 0) RETURNED!', attrSet);
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
  // console.log('getFilterValue > filter: ', filter.filterType, filter);
  const searchFilterStr = (type: String) => {
    const objClass =
      type === 'group' ? 'groupOfUniqueNames' : 'organizationalPerson';

    // console.log('getFilterValue > searchFilterStr > objClass: ', objClass);
    if (type === 'group') {
      const retVal = `${LdapFilters.groups.pre}cn=*${filter.value}*))`;
      // console.log('getFilterValue > type=group > retVal: ', type, retVal);
      return retVal;
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
        // console.log(
        //   'getFilterValue > switch > person > allowInactive(false) | retStr: ',
        //   filter.allowInactive,
        //   retStr
        // );
        return retStr;
      }

      if (filter.value.length === 0) {
        const retStr = `${LdapFilters.person.default}`;
        // console.log(
        //   'getFilterValue > switch > person > allowInactive(false) | retStr: ',
        //   filter.allowInactive,
        //   retStr
        // );
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
        // console.log(
        //   'getFilterValue > filter.filterType switch default: ',
        //   retStr
        // );
        return retStr;
      }
      if (filter.field === 'cn') {
        const retStr = `${LdapFilters.groups.pre}${filter.field}=${
          filter.value
        }${LdapFilters.groups.post}`;

        // console.log('getFilterValue > filter.filterType switch cn: ', retStr);
        return retStr;
      }
      if (filter.field === 'search') {
        const retStr = searchFilterStr(filter.filterType);
        // console.log(
        //   'getFilterValue > filter.filterType switch search: ',
        //   retStr
        // );
        return retStr;
      }

      // eslint-disable-next-line no-case-declarations
      let returnFilter: any = '';
      returnFilter += `${LdapFilters.groups.pre}${filter.field}=*`;
      returnFilter += `${filter.value}${LdapFilters.groups.post}`;
      // `${LdapFilters.groups.pre}${filter.field}=${filter.value}${LdapFilters.groups.post}`;

      // console.log('getFilterValue > returnFilter: ', returnFilter);

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
  // console.log('searchWrapper > filterValue: ', filterValue);
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
  // console.log(`searchWrapper >`, filterQryParams);

  if (filter.dns.length > 0) {
    // console.log('searchWrapper > filter.dns.length: ', filter.dns.length);
    try {
      results = await getFilteredResults(filter, filterQryParams);
      // console.log('searchWrapper > filteredResults > results: ', results);
    } catch (err) {
      console.log('filteredResults > err: ', err);
    }
  } else {
    // console.log('searchWrapper > filter.dns.length: ', filter.dns.length);
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
      // base_dn | cn=Groups,o=cobhdap
      let baseDn = base_dn;
      if (filter.field === 'ou') {
        baseDn = `OU=Groups,${baseDn}`;
        // console.log('baseDn: ', baseDn);
      }
      ldapClient.search(
        // 'OU=Groups,DC=iamdir-test,DC=boston,DC=gov',
        baseDn,
        filterQryParams,
        function(err, res) {
          if (err) {
            console.log('ldapsearch error: ', err);
          }
          // console.log(
          //   'searchWrapper > ldapClient.search > base_dn: ',
          //   base_dn,
          //   baseDn
          // );
          // console.log('searchWrapper > res: ', res);
          resolve(search_promise(err, res));
        }
      );
    });
  }

  return results;
};

const convertDnsToGroupDNs = async (
  dns: Array<string>,
  mode: string = 'filtered'
) => {
  const CNs = dns.map(str => str.split('SG_AB_GRPMGMT_')[1]);
  console.log('convertDnsToGroupDNs > CNs: ', CNs);
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
  console.log('getGroupChildren > parentDn: ', parentDn);
  console.log('getGroupChildren > parentCN: ', parentCN);

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
  console.log('results.len: ', results);
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

  server.events.on('start', () => {
    console.log('Server started (makeServer)');
  });

  server.events.on('stop', () => {
    console.log('Server stopped (makeServer)');
    console.log(`RECONNECTING (from 'stop')...`);
    ldapClient = ldap_client();
  });

  server.events.on('log', (event, tags) => {
    if (tags.error) {
      console.log(
        // `Server error: ${event.error ? event.error.message : 'unknown'}`
        `Server error: ${event.error ? event.error : 'unknown'}`,
        `event.error  (makeServer): `,
        event.error
      );
    }
  });

  return {
    server,
    startup,
  };
}

const resolvers = {
  Mutation: {
    async updateGroupMembers() {
      console.log('updateGroupMembers: ', arguments[1]);
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
      console.log('getMinimumUserGroups > TOP');
      const convertedDNs = await convertDnsToGroupDNs(args.dns, 'group');
      const maxMinimum = 9;
      let groups: any = [];
      let currDisplayCount = 0;

      while (currDisplayCount < maxMinimum) {
        if (convertedDNs.length > 0) {
          const thisArr = convertedDNs.shift();
          const groupChildren: any = await getGroupChildren(thisArr.dn);
          console.log(
            'getMinimumUserGroups > getGroupChildren(thisArr.dn) > groupChildren: ',
            thisArr.dn,
            groupChildren
          );
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
    async group(_parent: any, args: { cn: string; dns: Array<string> }) {
      // console.log('group >');
      let dns: any = [];

      if (args.dns) {
        // console.log('group > args.dns1: ', args.dns);
        dns = await convertDnsToGroupDNs(args.dns);
        // console.log('group > dns: ', dns);
      }
      // console.log('group > args.dns2: ', args.dns);
      // console.log('args.cn.indexOf: ', args.cn.indexOf('='));
      // console.log('abstractDN(args.cn): ', abstractDN(args.cn));

      const value = args.cn.indexOf('=') > -1 ? args.cn.split('=')[1] : args.cn;
      const filterParams: FilterOptions = new FilterOptionsClass({
        filterType: 'group',
        field: 'cn',
        value,
        dns,
      });
      // console.log('group > filterParams: ', filterParams);
      const groups: any = await searchWrapper(['all'], filterParams);
      // console.log('group > groups: ', groups);
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

  server.events.on('start', () => {
    console.log('Server started (startServer)');
  });

  server.events.on('stop', async () => {
    console.log('Server stopped (startServer)');
    console.log(`RECONNECTING (from 'stop')...`);
    ldapClient = ldap_client();
    await server.start();
  });

  // server.events.on('log', (event, tags) => {
  //   if (tags.error) {
  //     console.log(
  //       // `Server error: ${event.error ? event.error.message : 'unknown'}`
  //       `Server error: ${event.error ? event.error : 'unknown'}`,
  //       `event.error: `,
  //       event.error
  //     );
  //   }
  // });

  // process.on('uncaughtException', err => {
  //   console.log('Node NOT Exiting...');
  //   console.error(err.stack);
  //   console.error('Node NOT Exiting...');
  // });

  console.log(`> Ready on http://localhost:${port}`);
}

// const terminate = require('./terminate');

// const exitHandler = terminate(server, {
//   coredump: false,
//   timeout: 500,
// });

// process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
// process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
// process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
// process.on('SIGINT', exitHandler(0, 'SIGINT'));
