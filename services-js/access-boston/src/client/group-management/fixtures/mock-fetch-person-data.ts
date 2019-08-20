import { toPerson } from '../state/data-helpers';
import { findMatch, getItemObject } from './helpers';

import { Group, Person } from '../types';

import allPeople from './people.json';

/**
 * Returns a promise resolving to an array of People representing all
 * members that match the search term provided.
 */
export async function fetchPersonSearch(term: string): Promise<Person[]> {
  const value = term.trim().toLowerCase();

  const people = await Promise.resolve(allPeople);

  return people
    .map(person => toPerson(person))
    .filter(item => item.isAvailable)
    .filter(item => findMatch(item, value));
}

/**
 * Returns a promise resolving to an array of People representing all
 * members of a specific group.
 *
 * Inactive employees WILL be included in these results.
 */
export async function fetchGroupMembers(group: Group): Promise<Person[]> {
  return new Promise(resolve =>
    resolve(
      group.members.map(personCn =>
        toPerson(getItemObject(allPeople, personCn))
      )
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
  const result = await fetchPersonSearch(term);

  return result.filter(item => !group.members.includes(item.cn));
}
