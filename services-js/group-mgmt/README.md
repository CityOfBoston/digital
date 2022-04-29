# Group Management

## (API) Goal

1. Allow an Access-Boston user the ability to add and remove people from groups they can manage through Active-Directory.
2. Allow loopup of any user by first name, last name, ID
3. Allow loopup of group common name (CN), name matching (autocomplete)
4. A User cannot remove people from groups they do not manage
5. A User should not be able to see groups they do not have access to showing up in the the autocomplete results
6. Within the detail view of a person or group, groups the User cannot manage should be disabled and the ability to click through removed.

When an Access-Boston User logs in a SAML response is sent to the Frontend client Application which will include a `groups` section. If this section contains any entries with the prefix `SG_AB_GRPMGMT_`, they will be marked as user with access to the `Group Management` application within Access-Boston. In addition, the string that comes after the prefix represent the names of the top level group containers the user has access too. I.E. If `SG_AB_GRPMGMT_Lagan_Groups` is present in the SAML response the User will be able to edit any groups within that container. I.E. `BPS Administration, BPD Adminstration, etc.`

### Connecting to COB Active Directory

We use NodeJS implementation of Open LDAP3 protocol to connect the City of Boston `User/Groups` network. Connecting and binding to this protocol requires variables to be passed with along when stablishing connections. We store theses variables in 'Environment Files (.env)' and SSL Certificates. *For local developement we store variables above in a local .env file and ssl certificate, on `PROD` these files are stored on our S3 bucket and get loaded into the docker containers at the end of the deploy process. Below is a sample the .env required to connect to LDAP.

#### Sample .env

```bash
LDAP_URL=ldaps://server.url.port:636
LDAP_BASE_DN=
LDAP_BIN_DN=
LDAP_USER_DN=
LDAP_SCOPE=sub
LDAP_PORT=3000
LDAP_PASSWORD=
LDAP_CERT='SSL.cer'
NODE_ENV=development
```

### Server + GraphQL

This API makes use of both a simple NodeJS Server, build with HapiJS, and a GraphQL Endpoint running on Apollo. The Hapi Server is used to for basic authentication, health-checks and a facade that obfuscates services we don't want visible. The API is located at the `/graphql` on the host service, it accepts graphql queries but they require an API token to be passed with each request. You can grab one of the available tokens on the .env files on our S3 COB buckets for DEV, TEST, PROD. Also, if you are running the API locally (within the COB network, signed in to the `city_employee` network) you can disable checking for the API token by disabling the 'header.token' check in the `addGraphQL` method. Note: DO NOT deploy without this enabled.

#### LDAP

The server connects to LDAP on start using the credentials in the .env From there it waits for requests to be make to the LDAP Client (`ldapClient`) service we initiate. Some requests require binding before the operation is performed, in those cases the function called makes use of this method `bindLdapClient` to prep the connection. Other LDAP specific methods we use of take care of performing search operations, composing search strings and filters to be used with those queries, etc. We also provide a methods to convert parent groups (`convertDnsToGroupDNs`) into their group containers to be used for restricting a users functionality. Below is an outline of the code GraphQL entities and methods available.

#### (GraphQL) API: Entities

```graphql
  type Group {
    dn: String
    cn: String
    controls: [String!]!
    uniquemember: [String!]!
    owner: [String!]!
    actualdn: String
    entrydn: String
    objectclass: [String]
    displayname: String
    ou: String
  }

  type Person {
    cn: String
    dn: String
    mail: String
    sn: String
    givenname: String
    displayname: String
    uid: String
    controls: [String!]!
    ismemberof: [String!]!
    inactive: Boolean
    nsaccountlock: String
    objectclass: [String]
  }
```

These entities make up the core of the data that will be returned by the API. The following API methods either return data or manipulate data passed to them.

#### Queries

## person

### Find the user with the match `common name` (cn)

```graphql
Params
  cn: Common Name string used in the query request

# example
query {
  person(cn: String!): [Person]
}  

# This methods returns a user with the matching 'common-name' (cn). It will return that users data within an array matching the `Person` entitity.

# e.i.
person(cn: "123456") {dn cn displayname}

returns {
  "data": {
    "person": [
      {
        "dn": "cn=123456",
        "cn": "123456",
        "displayname": "FirstName LastName"
      }
    ]
  }
}
```

## personSearch

### Search for users matching a term string

```graphQL
Params
  term: String used in the query request, this can be a  `common name`, user id or `displayname`
  allowInactive: Include inactive in query results

# example
query {
  personSearch(term: "Zack" allowInactive: true) {displayname}
}

# This methods queries for users with matching first, last and displayname's. By default this method only returns active users, but using the `allowInactive` param allows the return of inactive users.

returns {
  {
    displayname: "Zack T."
  },
  {
    displayname: "Zack S."
  },
  {
    displayname: "123456"
  }
}
```

## group

### Find a group by their `common name` (cn)

```graphQL
Params
  cn: Common Name string used in the query request
  dns: An array of container groups, ie. 'Lagan_Groups', that will make the search query only look within those groups.

# example
query {
  group(cn: "BPD_Administrative" dns: [
    "SG_AB_GRPMGMT_Lagan_Groups"
  ]) {dn cn displayname uniquemember}
}

returns {
  {
    dn: "cn=BPD_Administrative,cn=Lagan_Groups,cn=Groups,dc=boston,dc=cob"
    cn: "BPD_Administrative",
    displayname: "BPD_Administrative",
    uniquemember: [ "12345", "56789" ]
  }
}
```

## groupSearch

### Search groups by a term (string)

```graphQL
Params
  term: String used in the query request
  dns: An array of container groups, ie. 'Lagan_Groups', that will make the search query only look within those groups.

# example
query {
  groupSearch(term: "BPD" dns: [
    "SG_AB_GRPMGMT_Lagan_Groups"
  ]) {displayname uniquemember}
}

returns {
  {
    displayname: "BPD_Administrative",
    uniquemember: [ "12345", "56789" ]
  },
  {
    displayname: "BPS_Administrative",
    uniquemember: [ "12345", "56789" ]
  },
  ...
}
```

## returnActiveUsers

### Filter and return only active users from an array of user ids

```graphQL
Params
  users: Array of user ids (string)

# example
query {
  returnActiveUsers(users: ["055545", "110737", "cn=050086"])
}

returns [
  "110737",
  "cn=050086"
]
```

## convertOUsToContainers

### Takes the SAML admin groups and converts them to their corresponding container groups

```graphQL
Params
  ous: Admin groups the user belongs too.

# example
query {
  convertOUsToContainers(ous: ["SG_AB_GRPMGMT_Lagan_Groups"])
}

returns [
  "cn=Lagan_Groups,cn=Groups,dc=boston,dc=cob",
  ...
]
```

## getGroupChildren

### Get the child groups from a parent group or container

```graphQL
Params
  parentDn: Domain name (DN/dn) of the parent group or container

# example
query {
  getGroupChildren(
    parentDn: "cn=Lagan_Groups,cn=Groups,dc=boston,dc=cob"
  ) {displayname}
}

returns [
  {
    "displayname": "ANML_General"
  },
  {
    "displayname": "BHA_General"
  },
  ...
]
```

## getMinimumUserGroups

### Find the groups an admin users has access to. It loops through the admin group from the SAML response to determine the limit. It gather up to a maximum of 9 groups defaults because beyond that its no use for the UI to know this total. This is used in the Group Mgmt web to display a list of those groups if they are less than 4, if greater it shows the search field instead.

```graphQL
Params
  dns: An array of container groups, ie. 'Lagan_Groups'

# example
query {
  getMinimumUserGroups(dns: ["SG_AB_GRPMGMT_Lagan_Groups"]) {displayname}
}

returns [
  {
    "displayname": "BTDT_Abandoned Bicycle"
  },
  {
    "displayname": "BPS_Transportation Administration"
  },
  {
    "displayname": "BPS_Administrative"
  },
  ...
]
```

#### Mutations

Mutations are methods that change the data. Since the we only need to update Users and Groups we only created one method that caters to both of those needs. If more functionlity (CRUD) is needed, it will need to be built.

## updateGroupMembers

### Update a user or group data

```graphql
Params

# example
# Remove a user from a group
mutation {
  updateGroupMembers(
    dn: "cn=SG_AB_CIVIS,cn=CIVIS,cn=groups,dc=boston,dc=cob",
    dns: ["SG_AB_GRPMGMT_CIVIS", "SG_AB_GRPMGMT_EBUILDER", "SG_AB_GRPMGMT_AUDITING"]
    operation: "delete",
    uniquemember: "cn=139562,cn=Internal Users,dc=boston,dc=cob"
  ) {code message}
}

return {
  "data": {
    "updateGroupMembers": {
      "code": 200,
      "message": "200 Ok"
    }
  }
}
```

## URLs

### Localhost
http://localhost:3000/

### Staging
DEV: https://group-mgmt.dev.digital-staging.boston.gov/
TEST: http://group-mgmt.test.digital-staging.boston.gov/

### PROD
https://group-mgmt.boston.gov/

### Deploys

- 2020.09.30: Security Patch: Remove hardcoded ssl pass in deploy script
