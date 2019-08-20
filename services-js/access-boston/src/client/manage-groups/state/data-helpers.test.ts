import { getAllCns, getCommonName, toGroup, toPerson } from './data-helpers';

const uniqueMembers = [
  '',
  'cn=132367,cn=Internal Users,dc=boston,dc=cob',
  'cn=Ignis Scientia,cn=Internal Users,dc=boston,dc=cob',
  'cn=Laguna Loire,cn=Internal Users,dc=boston,dc=cob',
];

// const groupList = ['ANML02_LostFound', 'BPD_Districts'];

import allPeople from '../fixtures/people.json';
import allGroups from '../fixtures/groups.json';

describe('getCommonName', () => {
  it('extracts a numerical cn', () => {
    const result = getCommonName(uniqueMembers[1]);

    expect(result).toBe('132367');
  });

  it('extracts an alphabetical cn', () => {
    const result = getCommonName(uniqueMembers[3]);

    expect(result).toBe('Laguna Loire');
  });
});

describe('toGroup', () => {
  it('returns a Group object', () => {
    const result = toGroup(allGroups[0]);

    expect(result).toMatchObject({
      isAvailable: true,
      status: 'current',
      cn: 'ANML02_LostFound',
      members: ['132367', 'Ignis Scientia', 'Laguna Loire'],
    });
  });
});

describe('toPerson', () => {
  it('returns a Person object', () => {
    const result = toPerson(allPeople[0]);

    expect(result).toMatchObject({
      isAvailable: true,
      status: 'current',
      cn: '000296',
      groups: ['BPD_Districts'],
      givenName: 'Terra',
      sn: 'Howard',
      mail: 'terra.howard@boston.gov',
      displayName: 'Terra Howard',
    });
  });
});

describe('getAllCns', () => {
  it('returns an array of person cn strings', () => {
    const result = getAllCns(uniqueMembers);

    expect(result).toEqual(['132367', 'Ignis Scientia', 'Laguna Loire']);
  });
});
