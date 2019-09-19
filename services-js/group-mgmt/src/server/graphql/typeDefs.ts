export const typeDefs = `
  type Group {
    dn: String
    cn: String
    uniquemember: [String]
    owner: [String]
    actualdn: String
    entrydn: String
    objectclass: [String]
  }

  type Person {
    cn: String
    dn: String
    mail: String
    sn: String
    givenName: String
    displayname: String
    uid: String
    isMemberOf: [String]
    nsAccountLock: String
    inactive: Boolean
    objectclass: [String]
  }

  type Query {
    person(cn: String): [Person]
    personSearch(term: String): [Person]
    group(cn: String): [Group]
    groupSearch(term: String): [Group]
	}
	
  # Defines all available mutations.
  type Mutation {
    updateGroupMembers(
			dn: String!,
			cn: String!, 
			operation: String!
			uniqueMember: String!
		): Group
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
