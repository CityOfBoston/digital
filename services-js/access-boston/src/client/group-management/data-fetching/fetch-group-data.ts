import { fetchGraphql } from './fetchGraphql';
import { toGroup } from '../state/data-helpers';
import { Group, Person } from '../types';

const GROUP_DATA = `
  dn
  cn
  displayname
  uniquemember
`;

// const GROUP_UPDATE_DATA = `{code message}`;

const FETCH_GROUP = `
  query getGroup($cn: String! $dns: [String!]!) {
    group(cn: $cn dns: $dns) {
      ${GROUP_DATA}
    }
  }
`;

const SEARCH_GROUPS = `
  query searchGroups($term: String! $dns: [String!]!) {
    groupSearch(term: $term dns: $dns) {
      ${GROUP_DATA}
    }
  }
`;

const UPDATE_GROUP = `
  mutation updateGroup(
    $dn: String!
    $operation: String!
    $uniquemember: String!
  ) {
    updateGroupMembers(
      dn: $dn
      operation: $operation
      uniquemember: $uniquemember
    ) {code message}
  }
`;

/**
 * Updates a Group object with a single entry.
 */
export async function updateGroup(
  dn: string,
  operation: string,
  uniquemember: string
  // dns: String[] = []
): Promise<any> {
  // eslint-disable-next-line no-console
  // console.log(
  //   'fetch-group-data > updateGroup > dns: ',
  //   dn,
  //   operation,
  //   uniquemember
  // );
  return await fetchGraphql(UPDATE_GROUP, {
    dn,
    operation,
    uniquemember,
    // dns,
  });
}

/**
 * Returns a single Group object.
 */
export async function fetchGroup(cn: string, dns: String[] = []): Promise<any> {
  // console.log('fetch-group-data > fetchGroup > dns: ', dns);
  return await fetchGraphql(FETCH_GROUP, { cn, dns });
}

/**
 * Returns a promise resolving to an array of Group objects.
 */
export async function fetchGroupSearch(
  term: string,
  _selectedItem: any,
  dns: String[] = []
): Promise<Group[]> {
  // console.log('_selectedItem: ', _selectedItem);
  // console.log('fetchGroupSearch: SEARCH_GROUPS: ', dns, SEARCH_GROUPS);
  if (!dns) {
    dns = [];
  }
  return await fetchGraphql(SEARCH_GROUPS, { term, dns }).then(response =>
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
  _currentUserAllowedGroups: string[],
  dns: String[]
): Promise<Group[]> {
  // console.log('fetch-group-data > fetchGroup > dns: ', dns);
  return await Promise.all(
    person.groups.map(groupCn =>
      fetchGroup(groupCn, dns).then(response => toGroup(response.group[0]))
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
  person: Person,
  dns: String[]
): Promise<Group[]> {
  const groups = await fetchGroupSearch(term, dns);
  // console.log('fetch-group-data > fetchGroupSearchRemaining > dns: ', dns);
  // console.log('fetchGroupSearch > groups: ', groups, '\n -------');

  return groups.filter(group => !person.groups.includes(group.cn));
}
