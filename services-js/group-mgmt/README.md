# Group Management

## (API) Goal

1. Allow an Access-Boston user the ability to add and remove people from groups they can manage through Active-Directory.
2. Allow loopup of any user by first name, last name, ID
3. Allow loopup of group common name (CN), name matching (autocomplete)
4. A User cannot remove people from groups they do not manage
5. A User should not be able to see groups they do not have access to showing up in the the autocomplete results
6. Within the detail view of a person or group, groups the User cannot manage should be disabled and the ability to click through removed.

When an Access-Boston User logs in the SAML response sent to the Frontend client Application will include a `groups` section. If this section contains any entries with the prefix `SG_AB_GRPMGMT_`, they will be marked as user with access to the `Group Management` application. In addition, the string that comes after the prefix represent the names of the top level group containers the user has access too. I.E. If `SG_AB_GRPMGMT_Lagan_Groups` is present in the SAML response the User will be able to edit any groups within that container. I.E. `BPS Administration, BPD Adminstration, etc.`

### Connecting to COB Active Directory

We use NodeJS implementation of Open LDAP3, the protocol used to `User/Groups`. Connecting and bind to this protocol requires variables to be passed with along when stablishing connections. We store theses variables in 'Environment Files (.env)' and SSL Certificates. *For local developement we store variables above in a local .env file and ssl certificate, on `PROD` these files are stored on our S3 bucket and get loaded into the docker containers at the end of the deploy process. Below is a sample the .env required to connect to LDAP.

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

This API makes use of both a simple NodeJS Server, build with HapiJS, and a GraphQL Endpoint running on Apollo. The Hapi Server is used to for basic authentication, health-checks and a facade that obfuscates services we don't want visible. The API is located at the '/graphql' on the host service, it accepts graphql queries but they require an API token to be passed with each request. You can grab one of the available tokens on the .env files on our S3 COB buckets for DEV, TEST, PROD. Also, if you are running the API locally (within the COB network, signed in to the `city_employee` network) you can disable checking for the API token by disabling the 'header.token' check in the `addGraphQL` method. Note: DO NOT deploy without this enabled.

#### LDAP

The server connects to LDAP on start using the credentials in the .env From there it waits for requests to be make to the LDAP Client (`ldapClient`) service we initiate. Some requests require binding before the operation is performed, in those cases the function called makes use of this method `bindLdapClient` to prep the connection. Other LDAP specific methods we make use of take care of performing search operations, composing search string and filters to be used with those queries, etc. We also provide a methods to convert parent groups (`convertDnsToGroupDNs`) into their group containers to be used for restricting a users functionality.

We create GraphQL endpoint that allows you to get Groups and Persons, and update Groups.

```graphql
# Find Person by cn (min-char: 3 || returns error obj)
query {
  personSearch(cn: "050") { dn, cn }
}
```

<!--  -->
<!--  -->
<!--  -->
(GraphQL/REST) API that connects and interacts with Access-Boston's Internal user directory. This API allows you to retrieve Groups and Person information.
