import { getItemObject, toGroup, toPerson } from '../state/data-helpers';

import { Group, Person } from '../types';

import allGroups from './groups.json';
import allPeople from './people.json';

/**
 * Returns a list of all groups a specific person belongs to.
 * Groups the current user cannot modify WILL be included in these results.
 */
export async function fetchPersonsGroups(
  cns: string[],
  _currentUserAllowedGroups: string[]
): Promise<Group[]> {
  // todo: fetch all groups a person is a member of
  const groups = await Promise.resolve(allGroups);

  return cns.map(cn => toGroup(getItemObject(groups, cn)));
}

/**
 * Returns a list of People representing all members of a specific group.
 * Inactive employees WILL be included in these results.
 */
export async function fetchGroupMembers(cns: string[]): Promise<Person[]> {
  // todo: fetch all members of the group
  const people = await Promise.resolve(allPeople);

  return cns.map(cn => toPerson(getItemObject(people, cn)));
}
