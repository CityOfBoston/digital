import { fetchGraphql } from './fetchGraphql';
import { toPerson } from '../state/data-helpers';
import { Group, Person } from '../types';

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
  query getPerson($cn: String! $dns: [String!]!) {
    person(cn: $cn dns: $dns) {
      ${PERSON_DATA}
    }
  }
`;

const SEARCH_PEOPLE = `
  query searchPeople($term: String! $dns: [String!]!) {
    personSearch(term: $term dns: $dns) {
      ${PERSON_DATA}
    }
  }
`;

/**
 * Returns a single Person object.
 */
export async function fetchPerson(
  cn: string,
  dns: String[] = []
): Promise<any> {
  return await fetchGraphql(FETCH_PERSON, { cn, dns });
}

/**
 * Returns a promise resolving to an array of People representing all
 * members that match the search term provided.
 */
export async function fetchPersonSearch(
  term: string,
  _selectedItem: any,
  dns: String[] = []
): Promise<Person[]> {
  if (!dns) {
    dns = [];
  }
  return await fetchGraphql(SEARCH_PEOPLE, { term, dns }).then(response =>
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
  group: Group,
  dns: String[] = [],
  _currentPage: number = 0
): Promise<Person[]> {
  return await Promise.all(
    group.chunked[_currentPage].map(
      personCn => {
        // todo: remove .replace() when api data no longer includes cn=
        const cn = personCn.replace('cn=', '');

        return fetchPerson(cn, dns)
          .then(response => {
            return toPerson(response.person[0]);
          })
          .catch(() => toPerson({ cn, inactive: true }));
      },
      [] as Person[]
    )
  );
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
  const people = await fetchPersonSearch(term, dns);

  return people.filter(person => !group.members.includes(person.cn));
}
