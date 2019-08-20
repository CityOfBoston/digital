import { fetchGraphql } from './fetchGraphql';
import { toGroup } from '../state/data-helpers';
import { Group, Person } from '../types';

const GROUP_DATA = `
  dn
  cn
  displayname
  uniquemember
`;

const FETCH_GROUP = `
  query getGroup($cn: String!) {
    group(cn: $cn) {
      ${GROUP_DATA}
    }
  }
`;

const SEARCH_GROUPS = `
  query searchGroups($term: String!) {
    groupSearch(term: $term) {
      ${GROUP_DATA}
    }
  }
`;

/**
 * Returns a single Group object.
 */
export async function fetchGroup(cn: string): Promise<any> {
  return await fetchGraphql(FETCH_GROUP, { cn });
}

/**
 * Returns a promise resolving to an array of Group objects.
 */
export async function fetchGroupSearch(term: string): Promise<Group[]> {
  return await fetchGraphql(SEARCH_GROUPS, { term }).then(response =>
    response.groupSearch.map(group => toGroup(group))
  );
}

/**
 * Returns a promise resolving to an array of all groups a specific person
 * is a member of.
 *
 * Groups the current user cannot modify WILL be included in these results.
 */
export async function fetchPersonsGroups(
  person: Person,
  _currentUserAllowedGroups: string[]
): Promise<Group[]> {
  return await Promise.all(
    person.groups.map(groupCn =>
      fetchGroup(groupCn).then(response => toGroup(response.group[0]))
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
  const groups = await fetchGroupSearch(term);

  return groups.filter(group => !person.groups.includes(group.cn));
}
