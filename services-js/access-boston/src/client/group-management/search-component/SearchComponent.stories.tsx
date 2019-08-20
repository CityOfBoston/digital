import React from 'react';

import { storiesOf } from '@storybook/react';

import {
  fetchPersonSearch,
  fetchPersonSearchRemaining,
} from '../fixtures/mock-fetch-person-data';
import {
  fetchGroupSearch,
  fetchGroupSearchRemaining,
} from '../fixtures/mock-fetch-group-data';

import SearchComponent from './SearchComponent';

const mockGroup = {
  members: [],
};
const mockPerson = {
  groups: [],
};

storiesOf('GroupManagementPage/SearchComponent', module)
  .add('person add', () => (
    <SearchComponent
      mode="person"
      view="management"
      handleFetch={fetchPersonSearchRemaining}
      handleSelectClick={() => {}}
      //@ts-ignore
      selectedItem={mockGroup}
    />
  ))
  .add('group add', () => (
    <SearchComponent
      mode="group"
      view="management"
      handleFetch={fetchGroupSearchRemaining}
      handleSelectClick={() => {}}
      //@ts-ignore
      selectedItem={mockPerson}
    />
  ))
  .add('person search', () => (
    <SearchComponent
      mode="person"
      view="initial"
      handleFetch={fetchPersonSearch}
      handleSelectClick={() => {}}
    />
  ))
  .add('group search', () => (
    <SearchComponent
      mode="group"
      view="initial"
      handleFetch={fetchGroupSearch}
      handleSelectClick={() => {}}
    />
  ))
  .add('searching', () => (
    <SearchComponent
      mode="group"
      view="initial"
      handleFetch={fetchGroupSearch}
      handleSelectClick={() => {}}
      currentStatus="searching"
    />
  ))
  .add('no results', () => (
    <SearchComponent
      mode="group"
      view="initial"
      handleFetch={fetchGroupSearch}
      handleSelectClick={() => {}}
      currentStatus="noResults"
    />
  ))
  .add('server error/could not reach server', () => (
    <SearchComponent
      mode="group"
      view="initial"
      handleFetch={fetchGroupSearch}
      handleSelectClick={() => {}}
      currentStatus="fetchError"
    />
  ));
