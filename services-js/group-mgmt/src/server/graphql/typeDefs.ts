export const typeDefs = `
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

  type Error {
    resonse: String!
  }

  type ResponseBody {
    data: String!
    error: Error!
  }

  type Response {
    message: String!
    code: Int!
    body: ResponseBody!
  }

  type filterOptions {
    filterType: String
    field: String
    value: String
    allowInactive: Boolean
    dns: [String]
  }

  type filterParams {
    filterParams: filterOptions
  }

  type group {
    dn: String
    cn: String
  }

  type DNs {
    cn: String
    filterParams: filterParams
    group: group
  }

  type Query {
    person(cn: String! dns: [String]): [Person]
    personSearch(term: String! dns: [String] allowsInactive: Boolean): [Person]!
    group(cn: String! dns: [String]): [Group]
    groupSearch(term: String! dns: [String] activemembers: Boolean allowsInactive: Boolean): [Group]!
    isPersonInactive(people: [String!]!): [String]!
    convertOUsToContainers(ous: [String]!): [String]!
    getMinimumUserGroups(dns: [String]!): [Group]!
    getGroupChildren(parentDn: String): [Group]!
	}
	
  # Defines all available mutations.
  type Mutation {
    updateGroupMembers(
      dn: String!
			dns: [String]
			operation: String!
			uniquemember: String!
    ): Response
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
