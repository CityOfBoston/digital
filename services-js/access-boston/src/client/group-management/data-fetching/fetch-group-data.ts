import { fetchGraphql } from './fetchGraphql';
import { toGroup } from '../state/data-helpers';
import { Group, Person } from '../types';

const GROUP_DATA = `
  distinguishedName
  cn
  displayname
  member
`;

const FETCH_GROUP = `
  query getGroup($cn: String!) {
    group(cn: $cn) {
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

const OU_MINIMUM_GROUPS = `
  query ouContainers($dns: [String]!) {
    getMinimumUserGroups(dns: $dns) {
      ${GROUP_DATA}
    }
  }
`;

const OU_CONTAINERS = `
  query ouContainers($ous: [String]!) {
    convertOUsToContainers(ous: $ous)
  }
`;

const UPDATE_GROUP = `
  mutation updateGroup(
    $dn: String!
    $operation: String!
    $member: String!
    $dns: [String]
  ) {
    updateGroupMembers(
      dn: $dn
      operation: $operation
      member: $member
      dns: $dns
    ) {code message}
  }
`;

/**
 * Updates a Group object with a single entry.
 */
export async function updateGroup(
  distinguishedName: string,
  operation: string,
  member: string,
  dns: String[] = []
): Promise<any> {
  const dn = distinguishedName;
  return await fetchGraphql(UPDATE_GROUP, {
    dn,
    operation,
    member,
    dns,
  });
}

/**
 * Returns GRAPH QL API.
 */
export async function fetchDataURL(): Promise<any> {
  return await fetch('/warptime' as string, { method: 'GET' })
    .then(response => response.text())
    .then(response => response);
}

/**
 * Returns an array of OU containers.
 */
export async function fetchOurContainers(
  ous: string[],
  _api: any = undefined
): Promise<any> {
  console.log(
    'fetchOurContainers > fetchGraphql > OU_CONTAINERS|ous: ',
    OU_CONTAINERS,
    ous
  );
  const retVal = await fetchGraphql(OU_CONTAINERS, { ous });
  return retVal;
}

/**
 * Returns an array of OU containers.
 */
export async function fetchMinimumUserGroups(dns: string[]): Promise<any> {
  console.log('fetchMinimumUserGroups > OU_MINIMUM_GROUPS(dns): ', dns);
  const results = await fetchGraphql(OU_MINIMUM_GROUPS, { dns });
  return results;
}

/**
 * Returns a single Group object.
 */
export async function fetchGroup(
  cn: string,
  _dns: String[] = []
): Promise<any> {
  let retObj: any = {};
  try {
    retObj = await fetchGraphql(FETCH_GROUP, { cn });
  } catch (error) {
    console.log('Error fetchGraphql: ', error);
    console.error('Error fetchGraphql: ', error);
  }

  return retObj;

  // .catch(error => {
  //   console.log('Error fetchGraphql: ', error);
  //   console.error('Error fetchGraphql: ', error);

  //   return {};
  // });
}

/**
 * Returns a promise resolving to an array of Group objects.
 */
export async function fetchGroupSearch(
  term: string,
  _selectedItem: any,
  dns: String[] = []
): Promise<Group[]> {
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
  dns: string[],
  ous: string[],
  _currentPage: number = 0
): Promise<Group[]> {
  return await Promise.all(
    person.chunked[_currentPage].map(groupCn =>
      fetchGroup(groupCn, dns).then(response => {
        const retgroup: Group = {
          cn: '',
          distinguishedName: '',
          displayName: '',
          members: [],
          status: 'current',
          action: '',
        };

        // if (response.)
        // console.log('response.group[0]: ', response.group[0]);

        try {
          console.log(
            'BEFORE ... response.group: ',
            typeof response.group === undefined
          );
          if (!response.group)
            console.log(`fetchPersonsGroups response.group`, response);

          if (response.group && response.group[0]) {
            const retGroup = toGroup(response.group[0], dns, ous);
            return retGroup;
          } else {
            console.log(
              'Error in fetchPersonsGroups, response is not a group: ',
              response
            );
            return retgroup;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Error in fetchPersonsGroups: ', error);
        }

        return retgroup;
      })
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
  const groups = await fetchGroupSearch(term, [], dns);
  return groups.filter(group => !person.groups.includes(group.cn));
}
