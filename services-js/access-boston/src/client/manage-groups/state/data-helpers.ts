// // Fetch information about an person from LDAP server
// export function fetchMember(cn: string) {
//   return new Promise((resolve, reject) => {
//     // fetch member info
//     resolve('success');
//
//     reject('something went wrong.');
//   });
// }

import { CommonAttributes, Group, ItemStatus, Person } from '../types';

/**
 * Individual members are stored in the uniqueMembers array of a group
 * as a string:
 *
 * "cn=132367,cn=Internal Users,dc=boston,dc=cob",
 * "cn=Laguna Loire,cn=Internal Users,dc=boston,dc=cob"
 */
export function getCommonName(text: string): string {
  // starting at the beginning of the string, capture everything after “cn=”,
  // up to the first comma.
  const match = text.match(/^(?:cn=)([\w\s]*)/);

  if (match) {
    return match[1];
  }

  return '';
}

/**
 * Given an array of uniqueMembers, return array of person CN strings.
 */
export function getAllCns(uniqueMember: string[]): string[] {
  // console.log(uniqueMember);
  return uniqueMember.reduce(
    (acc, member) => {
      const result = getCommonName(member);

      if (result.length > 0) {
        return [...acc, result];
      } else {
        return acc;
      }
    },
    [] as string[]
  );
}

/**
 * Accepts a group object from server response, and returns a usable
 * Group object.
 */
export function toGroup(dataObject): Group {
  return {
    ...commonAttributes(dataObject),
    members: getAllCns(dataObject.uniqueMember) || [],
    isAvailable:
      dataObject.canModify !== undefined ? dataObject.canModify : true,
  };
}

/**
 * Accepts a employee/person object from server response, and returns a
 * usable Person object.
 */
export function toPerson(dataObject): Person {
  return {
    ...commonAttributes(dataObject),
    groups: dataObject.groups || [],
    givenName: dataObject.givenName || '',
    sn: dataObject.sn || '',
    mail: dataObject.mail || '',
    isAvailable: !dataObject.inactive,
  };
}

function commonAttributes(dataObject): CommonAttributes {
  return {
    cn: dataObject.cn,
    displayName: dataObject.displayName || dataObject.cn,
    status: 'current' as ItemStatus,
  };
}

// todo: this is a temporary hack
export function getItemObject(list: any[], cn: string): any {
  return list.find(item => item.cn === cn);
}
