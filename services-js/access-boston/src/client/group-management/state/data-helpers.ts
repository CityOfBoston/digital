import {
  CommonAttributes,
  Group,
  ItemStatus,
  Person,
  pageSize,
  Action,
} from '../types';
import { chunkArray } from '../fixtures/helpers';

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
export function toGroup(
  dataObject,
  _dns: Array<string> = [],
  _ous: Array<string> = []
): Group {
  let isAvailable =
    dataObject.canModify !== undefined ? dataObject.canModify : true;
  let inDomain = true;

  if (_ous.length > 0) {
    inDomain = isDomainNameInOUs(dataObject.dn, _ous);
    if (!inDomain) {
      isAvailable = false;
    }
  }

  const chunkedResults =
    dataObject.uniquemember && dataObject.uniquemember.length > 0
      ? chunkArray(dataObject.uniquemember, pageSize)
      : [[]];

  const retObj = {
    ...commonAttributes(dataObject),
    members: dataObject.uniquemember || [],
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
export function toPerson(dataObject): Person {
  const chunkedResults =
    dataObject.ismemberof && dataObject.ismemberof.length > 0
      ? chunkArray(dataObject.ismemberof, pageSize)
      : [[]];
  // console.log('toPerson > dataObject: ');
  // console.log('chunked: ', chunkedResults,'\n------------');
  const retObj = {
    ...commonAttributes(dataObject),
    groups: dataObject.ismemberof || [],
    chunked: chunkedResults,
    givenName: dataObject.givenname || '',
    sn: dataObject.sn || '',
    mail: dataObject.mail || '',
    isAvailable: !dataObject.inactive,
  };
  // console.log('toGroup > retObj: ', retObj, '\n------------');

  return retObj;
}

function commonAttributes(dataObject): CommonAttributes {
  // console.log('CommonAttributes dataObj: ', dataObject);
  return {
    cn: dataObject.cn,
    dn: dataObject.dn || '',
    displayName: dataObject.displayname || dataObject.cn,
    status: 'current' as ItemStatus,
    action: '' as Action,
  };
}

export const isDomainNameInOUs = (dn: string, dns: Array<string>) => {
  let splitDN: any = dn.split(',');
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
