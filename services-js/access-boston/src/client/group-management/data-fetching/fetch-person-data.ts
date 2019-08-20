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

/**
 * Returns a single Person object.
 */
export async function fetchPerson(cn: string): Promise<any> {
  return await fetchGraphql(FETCH_PERSON, { cn });
}

/**
 * Returns a promise resolving to an array of People representing all
 * members that match the search term provided.
 */
export async function fetchPersonSearch(term: string): Promise<Person[]> {
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
export async function fetchGroupMembers(group: Group): Promise<Person[]> {
  return await Promise.all(
    group.members.map(
      personCn => {
        // todo: remove .replace() when api data no longer includes cn=
        const cn = personCn.replace('cn=', '');

        return fetchPerson(cn)
          .then(response => toPerson(response.person[0]))
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
  group: Group
): Promise<Person[]> {
  const people = await fetchPersonSearch(term);

  return people.filter(person => !group.members.includes(person.cn));
}
