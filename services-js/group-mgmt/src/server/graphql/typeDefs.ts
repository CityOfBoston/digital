export const typeDefs = `
  type Group {
    cn: String
    distinguishedName: String
    displayname: String
    member: [String!]!
    objectclass: [String]
  }

  type Person {
    cn: String
    distinguishedName: String
    sn: String
    givenname: String
    displayname: String
    memberOf: [String!]!
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
    distinguishedName: String
    cn: String
  }

  type DNs {
    cn: String
    filterParams: filterParams
    group: group
  }

  type Query {
    person(cn: String! dns: [String] by: String): [Person]
    personSearch(term: String! dns: [String] allowsInactive: Boolean by: String): [Person]!
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
      distinguishedName: String!
			dns: [String]
			operation: String!
			member: String!
    ): Response
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
