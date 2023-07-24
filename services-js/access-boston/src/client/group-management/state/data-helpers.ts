import {
  CommonAttributes,
  Group,
  ItemStatus,
  Person as RetPerson,
  pageSize,
  Action,
} from '../types';
// import { Person } from '../interfaces';
import { chunkArray } from '../fixtures/helpers';

/**
 * Individual members are stored in the `member` array of a group
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
 * Given an array of `member`, return array of person CN strings.
 */
export function getAllCns(member: string[]): string[] {
  return member.reduce(
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
export function toGroup(
  dataObject,
  _dns: Array<string> = [],
  _ous: Array<string> = []
): Group {
  let isAvailable =
    dataObject.canModify !== undefined ? dataObject.canModify : true;
  let inDomain = true;

  if (_ous.length > 0) {
    inDomain = isDomainNameInOUs(dataObject.distinguishedName, _ous);
    if (!inDomain) {
      isAvailable = false;
    }
  }

  const chunkedResults =
    dataObject.member && dataObject.member.length > 0
      ? chunkArray(dataObject.member, pageSize)
      : [[]];

  const retObj = {
    ...commonAttributes(dataObject),
    members: dataObject.member || [],
    isAvailable,
    chunked: chunkedResults,
  };
  // console.log('toGroup > retObj: ', retObj, '\n------------');

  return retObj;
}

/**
 * Accepts a person object from server response, and returns a usable
 * Person object.
 */
export function toPerson(dataObject): RetPerson {
  const chunkedResults =
    dataObject.memberOf &&
    dataObject.memberOf !== undefined &&
    typeof dataObject.memberOf === 'object' &&
    dataObject.memberOf.length > 0
      ? chunkArray(dataObject.memberOf, pageSize)
      : [[]];
  // console.log('toPerson > dataObject: ', dataObject);
  // console.log('chunked: ', chunkedResults, '\n------------');
  const retObj = {
    ...commonAttributes(dataObject),
    groups: dataObject.memberOf || [],
    chunked: chunkedResults,
    givenName: dataObject.givenname || '',
    sn: dataObject.sn || '',
    isAvailable: !dataObject.inactive,
  };
  // console.log('toGroup > retObj: ', retObj, '\n------------');

  return retObj;
}

function commonAttributes(dataObject): CommonAttributes {
  // console.log('CommonAttributes dataObj: ', dataObject);
  return {
    cn: dataObject.cn,
    distinguishedName: dataObject.distinguishedName || '',
    displayName: dataObject.displayname || dataObject.cn,
    name: dataObject.name || '',
    status: 'current' as ItemStatus,
    action: '' as Action,
  };
}

export const isDomainNameInOUs = (
  distinguishedName: string,
  dns: Array<string>
) => {
  let splitDN: any = distinguishedName.split(',');
  splitDN.shift();
  splitDN = splitDN
    .toString()
    .trim()
    .toLowerCase();
  const retArr = dns.filter(
    entry => entry.trim().toLocaleLowerCase() === splitDN
  );
  return retArr.length > 0;
};
