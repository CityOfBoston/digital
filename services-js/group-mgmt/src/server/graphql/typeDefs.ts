export const typeDefs = `
  type Group {
    distinguishedName: String!
    dn: String
    cn: String
    member: [String]!
    uniquemember: [String!]!
    groupmember: [String!]!
    objectclass: [String]
    displayname: String
  }

  type Person {
    distinguishedName: String!
    dn: String
    cn: String
    mail: String
    sn: String
    givenname: String
    displayname: String
    memberof: [String!]!
    ismemberof: [String!]!
    inactive: Boolean
    nsaccountlock: String
    objectclass: [String]
    cOBUserAgency: String
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
    distinguishedName: String!
    dn: String
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
    getGroupMemberAttributes(filter: String): [Person]!
    getPersonMemberAttributes(filter: String): [Group]!
    group(cn: String! dns: [String] fetchgroupmember: Boolean): [Group]
    groupSearch(term: String! dns: [String] activemembers: Boolean allowsInactive: Boolean fetchgroupmember: Boolean): [Group]!
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
