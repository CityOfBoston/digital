/* eslint no-console: 0 */

import { Server as HapiServer } from 'hapi';
import cleanup from 'node-cleanup';
import decryptEnv from '@cityofboston/srv-decrypt-env';
import ldap from 'ldapjs';

const port = parseInt(process.env.PORT || '7000', 10);

// Access-Boston Active Directory(LDAP) Lookup
// const ldapConfig = {
//   url: 'ldap://localhost:388',
//   baseDn: 'dc=boston,dc=cob',
//   bindDn: 'cn=',
//   scope: 'sub',
//   passw: 'GoodNewsEveryone',
// };
const ldapConfig = {
  url: 'ldap://zdvds01.cityhall.boston.cob:2389',
  baseDn: 'dc=boston,dc=cob',
  bindDn: 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev',
  userDn: 'cn=svc_groupmgmt,cn=Users,dc=boston,cn=cob',
  scope: 'sub',
  passw: '5!9ySn9gDN',
};
const ldapClient = ldap.createClient({ url: ldapConfig.url });

// interface SamlLogoutRequestAssertion {
//   response_header: SamlResponseHeader;
//   type: 'logout_request';
//   issuer: string;
//   name_id: string;
//   session_index: string;
// }

interface Group {
  dn?: string;
  controls?: Array<[]>;
  uniquemember?: Array<[string]>;
  owner?: Array<[string]>;
  actualdn?: string;
  entrydn?: string;
  objectclass?: Array<[String]>;
  modifyTimestamp?: string;
  modifiersName?: string;
  createTimestamp?: string;
  cn?: string;
  creatorsName?: string;
}

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

  const bindLdapClient = () => {
    if (ldapConfig.bindDn === 'cn=svc_groupmgmt,cn=Users,o=localHDAPDev') {
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

  const filters = {
    groups: {
      default: '(objectClass=groupOfUniqueNames)',
    },
    person: {
      default: {
        pre: '(&(objectClass=organizationalPerson)(cn=',
        post: '*))',
      },
      displayName: {
        pre: '(&(objectClass=organizationalPerson)(displayName=',
        post: '*))',
      }, // (&(objectClass=organizationalPerson)(displayName=qui*))
    },
  };

  const attributes = {
    default: ['dn', 'cn'],
    all: [],
  };

  const setAttributes = (attr = ['']) => {
    const attrSet: Array<string> = [];
    const group_model: Group = {
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
    const modelKeys = Object.keys(group_model);

    attr.forEach(element => {
      if (modelKeys.indexOf(element) > -1) {
        attrSet.push(element);
      }
    });

    if (attrSet.length > 0) {
      return attrSet;
    }

    // Custom Attributes
    switch (attr[0]) {
      case 'all':
        return attributes.all;
      default:
        return attributes.default;
    }
  };

  const setFilter = filterStr => {
    switch (filterStr) {
      default:
        return filters.groups.default;
    }
  };

  const searchWrapper = (
    attributes = ['dn,cn'],
    filter = '',
    scope = 'sub'
  ) => {
    const thisAttributes =
      typeof attributes === 'object' && attributes.length > 1
        ? attributes
        : setAttributes(attributes);
    const results = new Promise(function(resolve) {
      bindLdapClient();
      const filterQryParams = {
        scope: scope || 'sub',
        attributes: thisAttributes,
        filter:
          typeof filter === undefined || filter.length === 0
            ? setFilter(filter)
            : filter,
      };

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
    // method: GET | url: /access-boston/api/v1/groups
    server.route({
      method: 'POST',
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
        const group = searchWrapper(attrArr);
        return group;
      },
    });

    // method: GET | url: /
    server.route({
      method: 'GET',
      path: '/',
      handler: () => {
        return 'Title';
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

    // method: GET | url: /access-boston
    server.route({
      method: 'GET',
      path: '/access-boston',
      handler: () => {
        return 'Access-Boston Title';
      },
    });

    // method: GET | url: /access-boston/api
    server.route({
      method: 'GET',
      path: '/access-boston/api',
      handler: () => {
        return 'Access-Boston > API Title';
      },
    });

    // method: GET | url: /access-boston/api/v1
    server.route({
      method: 'GET',
      path: '/access-boston/api/v1',
      handler: () => {
        return 'Access-Boston > API > v1 Title';
      },
    });

    // method: GET | url: /access-boston/api/v1/group/id
    server.route({
      method: 'POST',
      path: '/access-boston/api/v1/group/id',
      handler: async request => {
        const query = request.url.query || { query: { cn: '' } };
        const group = searchWrapper([], `(cn=${query['cn']})`);
        // console.log('url: /access-boston/api/v1/group/id | request > query: ', query);

        return group;
      },
    });

    // method: PATCH | url: /access-boston/api/v1/group/update/id
    server.route({
      method: 'PATCH',
      path: '/access-boston/api/v1/group/update/id',
      handler: async request => {
        const changeOpts = new ldap.Change({
          operation: request.payload['operation'],
          modification: {
            uniqueMember: [request.payload['uniqueMember']],
          },
        });

        ldapClient.modify(request.payload['dn'], changeOpts, function() {});

        return 200;
      },
    });

    // ------------------------------------

    // method: GET | url: /access-boston/api/v1/person/id
    server.route({
      method: 'POST',
      path: '/access-boston/api/v1/person/id',
      handler: async request => {
        const query = request.url.query || { cn: '' };
        const group = searchWrapper([], `(cn=${query['cn']})`);
        return group;
      },
    });

    // method: GET | url: /access-boston/api/v1/person
    server.route({
      method: 'POST',
      path: '/access-boston/api/v1/person',
      handler: async request => {
        const query = request.url.query || { cn: '' };
        const group = searchWrapper([], `(cn=${query['cn']}*)`);
        return group;
      },
    });
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
