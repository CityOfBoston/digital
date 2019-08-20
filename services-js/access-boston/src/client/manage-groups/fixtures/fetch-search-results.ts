import allGroups from './groups.json';
import allPeople from './people.json';

import { toGroup, toPerson } from '../state/data-helpers';

import { Group, Person } from '../types';

// todo: obviously will need to change based on graphql interface
export async function fetchGroupsSearchResults(
  searchText: string
): Promise<Group[]> {
  const value = searchText.trim().toLowerCase();

  const groups = await Promise.resolve(allGroups);

  return groups
    .map(group => toGroup(group))
    .filter(group => group.isAvailable)
    .filter(item => findMatch(item, value));
}

// Returns an array of all groups that match the value, excluding groups
// the given person is already a member of.
export async function fetchRemainingGroups(
  searchText: string,
  person: Person
): Promise<Group[]> {
  const result = await fetchGroupsSearchResults(searchText);

  return result.filter(item => !person.groups.includes(item.cn));
}

export async function fetchPeopleSearchResults(
  searchText: string
): Promise<Person[]> {
  const value = searchText.trim().toLowerCase();

  const people = await Promise.resolve(allPeople);

  return people
    .map(person => toPerson(person))
    .filter(item => item.isAvailable)
    .filter(item => findMatch(item, value));
}

// Returns an array of all people that match the value, excluding
// a group’s existing members.
export async function fetchRemainingPeople(
  searchText: string,
  group: Group
): Promise<Person[]> {
  const result = await fetchPeopleSearchResults(searchText);

  return result.filter(item => !group.members.includes(item.cn));
}

// Filter through several fields to try and match user input;
// returns true if input matches any value for the given fields.
export function findMatch(item: any, value: string): any | null {
  const fields = ['givenName', 'sn', 'displayName', 'cn'];
  const inputValue = value.trim().toLowerCase();

  return fields
    .map(field => item[field])
    .some(
      value =>
        value && value.toLowerCase().slice(0, inputValue.length) === inputValue
    );
}
