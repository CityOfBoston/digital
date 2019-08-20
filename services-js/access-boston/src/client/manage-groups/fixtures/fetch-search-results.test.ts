import allGroups from './groups.json';
import allPeople from './people.json';

import { toGroup, toPerson } from '../state/data-helpers';

import {
  fetchGroupsSearchResults,
  fetchRemainingGroups,
  fetchPeopleSearchResults,
  fetchRemainingPeople,
} from './fetch-search-results';

const groups = allGroups.map(group => toGroup(group));
const people = allPeople.map(person => toPerson(person));

const groupSearchString = 'bpd';
const personSearchString = 'how';

describe('fetchGroupsSearchResults', () => {
  it('returns all available groups', async () => {
    const result = await fetchGroupsSearchResults('');

    expect(result.length).toEqual(2);
  });

  it(`returns only groups matching ${groupSearchString}`, async () => {
    const result = await fetchGroupsSearchResults(groupSearchString);

    expect(result.length).toEqual(1);
    expect(result).toContainEqual(groups[2]);
  });
});

describe('fetchRemainingGroups', () => {
  it('returns all available groups, excluding groups a given person already belongs to', async () => {
    const result = await fetchRemainingGroups('', people[3]);

    expect(result.length).toEqual(1);
    expect(result).toContainEqual(groups[2]);
  });

  it('returns an empty array if no groups remain', async () => {
    const result = await fetchRemainingGroups('', people[2]);

    expect(result.length).toEqual(0);
  });
});

describe('fetchPeopleSearchResults', () => {
  it(`returns only people matching ${personSearchString}`, async () => {
    const result = await fetchPeopleSearchResults(personSearchString);

    expect(result.length).toEqual(2);
    expect(result).toContainEqual(people[0]);
    expect(result).toContainEqual(people[1]);
  });
});

describe('fetchRemainingPeople', () => {
  it('returns all people, excluding members of a given group', async () => {
    const result = await fetchRemainingPeople('', groups[1]);

    expect(result.length).toEqual(1);
    expect(result).toContainEqual(people[1]);
  });
});
