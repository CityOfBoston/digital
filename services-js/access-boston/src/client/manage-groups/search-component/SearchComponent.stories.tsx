import React from 'react';

import { storiesOf } from '@storybook/react';

import {
  fetchGroupsSearchResults,
  fetchPeopleSearchResults,
  fetchRemainingGroups,
  fetchRemainingPeople,
} from '../fixtures/fetch-search-results';

import SearchComponent from './SearchComponent';

const mockGroup = {
  members: [],
};
const mockPerson = {
  groups: [],
};

storiesOf('ManageGroupsPage/SearchComponent', module)
  .add('person add', () => (
    <SearchComponent
      mode="person"
      view="management"
      handleFetch={fetchRemainingPeople}
      handleSelectClick={() => {}}
      //@ts-ignore
      selectedItem={mockGroup}
    />
  ))
  .add('group add', () => (
    <SearchComponent
      mode="group"
      view="management"
      handleFetch={fetchRemainingGroups}
      handleSelectClick={() => {}}
      //@ts-ignore
      selectedItem={mockPerson}
    />
  ))
  .add('person search', () => (
    <SearchComponent
      mode="person"
      view="initial"
      handleFetch={fetchPeopleSearchResults}
      handleSelectClick={() => {}}
    />
  ))
  .add('group search', () => (
    <SearchComponent
      mode="group"
      view="initial"
      handleFetch={fetchGroupsSearchResults}
      handleSelectClick={() => {}}
    />
  ));
