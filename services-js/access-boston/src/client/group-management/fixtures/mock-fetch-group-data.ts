import { toGroup } from '../state/data-helpers';
import { findMatch, getItemObject } from './helpers';

import { Group, Person } from '../types';

import allGroups from './groups.json';

/**
 * Returns a promise resolving to an array of Group objects.
 */
export async function fetchGroupSearch(term: string): Promise<Group[]> {
  const value = term.trim().toLowerCase();

  // const groups = await Promise.resolve(allGroups);

  return await new Promise(() =>
    allGroups
      .map(group => toGroup(group))
      // .filter(group => group.isAvailable)
      .filter(item => findMatch(item, value))
  );
}

/**
 * Returns a promise resolving to an array of all groups a specific person
 * is a member of.
 *
 * Groups the current user cannot modify WILL be included in these results.
 */
export function fetchPersonsGroups(
  person: Person,
  _currentUserAllowedGroups: string[]
): Promise<Group[]> {
  return new Promise(resolve =>
    resolve(
      person.groups.map(groupCn => toGroup(getItemObject(allGroups, groupCn)))
    )
  );
}

/**
 * Returns a promise resolving to an array of Group objects, excluding groups
 * the given person is already a member of. Used by SearchComponent when in
 * “management” view.
 */
export async function fetchGroupSearchRemaining(
  term: string,
  person: Person
): Promise<Group[]> {
  const result = await fetchGroupSearch(term);

  return result.filter(item => !person.groups.includes(item.cn));
}
