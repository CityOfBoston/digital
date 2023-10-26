import { fetchGraphql } from './fetchGraphql';
import { toPerson } from '../state/data-helpers';
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

const GROUP_MEMBER_DATA = `
  distinguishedName
  dn
  cn
  displayname
  givenname 
  sn
  cOBUserAgency
  mail
`;

const FETCH_GROUPMEMBERS = `
  query getGroupMembers($filter: String) {
    getGroupMemberAttributes(filter: $filter) {
      ${GROUP_MEMBER_DATA}
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
  // group: Group,
  // dns: String[] = [],
  // _currentPage: number = 0
  filter: String,
  pageSize: number = 100
): Promise<Person[]> {
  // console.log('fetchGroupMembers: .....');
  // return await Promise.all(
  //   group.chunked[_currentPage].map(
  //     personCn => {
  //       // todo: remove .replace() when api data no longer includes cn=
  //       const cn = personCn.replace('cn=', '');

  //       return fetchPerson(cn, dns)
  //         .then(response => {
  //           return toPerson(response.person[0]);
  //         })
  //         .catch(() => toPerson({ cn, inactive: true }));
  //     },
  //     [] as Person[]
  //   )
  // );
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
  console.log('fetchGroupMembers > toPerson > fetchGroups : ', retGroups);

  return chunkArray(retGroups, pageSize);
  // return retGroups;
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

  console.log(
    'fetch-person-data > fetchPersonSearchRemaining > fetchPersonSearch > people: ',
    people
  );

  return people;
}
