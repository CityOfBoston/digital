import { fetchGraphql } from './fetchGraphql';
import { toPerson, toGroup } from '../state/data-helpers';
import { Group, Person } from '../types';
import { chunkArray } from '../fixtures/helpers';

const PERSON_DATA = `
  dn
  cn
  displayname
  givenname
  sn
  mail
  ismemberof
`;

const FETCH_PERSON = `
  query getPerson($cn: String!) {
    person(cn: $cn) {
      ${PERSON_DATA}
    }
  }
`;

const SEARCH_PEOPLE = `
  query searchPeople($term: String!) {
    personSearch(term: $term) {
      ${PERSON_DATA}
    }
  }
`;

const GROUP_MEMBER_ATTR = `
  distinguishedName
  dn
  cn
  displayname
  givenname 
  sn
  cOBUserAgency
  mail
`;

const PERSON_MEMBER_ATTR = `
  cn distinguishedName displayname
`;

const FETCH_GROUPMEMBERS = `
  query getGroupMembers($filter: String) {
    getGroupMemberAttributes(filter: $filter) {
      ${GROUP_MEMBER_ATTR}
    }
  }
`;

const FETCH_PERSONMEMBERS = `
  query getPersonMembers($filter: String) {
    getPersonMemberAttributes(filter: $filter) {
      ${PERSON_MEMBER_ATTR}
    }
  }
`;

/**
 * Returns Group Members.
 */
// export async function fetchGroupMembers(filter: string): Promise<any> {
//   return await fetchGraphql(FETCH_GROUPMEMBERS, { filter });
// }

/**
 * Returns a single Person object.
 */
export async function fetchPerson(
  cn: string,
  _dns: String[] = []
): Promise<any> {
  return await fetchGraphql(FETCH_PERSON, { cn });
}

/**
 * Returns a promise resolving to an array of People representing all
 * members that match the search term provided.
 */
export async function fetchPersonSearch(
  term: string,
  _selectedItem: any,
  _dns: String[] = []
): Promise<Person[]> {
  if (!_dns) {
    _dns = [];
  }
  return await fetchGraphql(SEARCH_PEOPLE, { term }).then(response =>
    response.personSearch.map(person => toPerson(person))
  );
}

/**
 * Returns a promise resolving to an array of People representing all
 * members of a specific group.
 *
 * Inactive employees WILL be included in these results; see line 63.
 */
export async function fetchGroupMembers(
  filter: String,
  pageSize: number = 100
): Promise<Person[]> {
  let groups = await fetchGraphql(FETCH_GROUPMEMBERS, { filter });
  groups = groups[Object.keys(groups)[0]];
  let retGroups = groups.map((item: any) => {
    return toPerson(item);
  });
  retGroups = retGroups.sort(
    (a: any, b: any) =>
      b['isAvailable'] - a['isAvailable'] ||
      a['displayName'].localeCompare(b['displayName']) ||
      a.cn - b.cn
  );

  return chunkArray(retGroups, pageSize);
}

/**
 * Returns a promise resolving to an array of People representing all
 * members of a specific group.
 *
 * Inactive employees WILL be included in these results; see line 63.
 */
export async function fetchPersonGroups(
  filter: string,
  pageSize: number = 100,
  ous: string[] = []
): Promise<Person[]> {
  let persons = await fetchGraphql(FETCH_PERSONMEMBERS, { filter });
  persons = persons[Object.keys(persons)[0]];

  let retObj = persons.map((item: any) => toGroup(item, ous));
  // console.log('fetchPersonGroups > retObj: ', retObj);
  retObj = retObj.sort(
    (a: any, b: any) =>
      a['displayName'].localeCompare(b['displayName']) || a.cn - b.cn
  );

  return chunkArray(retObj, pageSize);
}

/**
 * Returns a promise resolving to an array of all people that match the value,
 * excluding a given group’s existing members. Used by SearchComponent when in
 * “management” view.
 */
export async function fetchPersonSearchRemaining(
  term: string,
  group: Group,
  dns: String[]
): Promise<Person[]> {
  const people = await (await fetchPersonSearch(term, dns)).filter(
    person => !group.members.includes(person.cn)
  );

  return people;
}
