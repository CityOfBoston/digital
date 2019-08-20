import React from 'react';
import { storiesOf } from '@storybook/react';

import { toGroup, toPerson } from './state/data-helpers';

import allPeople from './fixtures/people.json';
import allGroups from './fixtures/groups.json';

import SelectedComponent from './SelectedComponent';

const mockPerson = toPerson(allPeople[1]);
const mockGroup = toGroup(allGroups[0]);

storiesOf('GroupManagementPage/SelectedComponent', module)
  .add('person view', () => (
    <SelectedComponent mode="person" selected={mockPerson} />
  ))
  .add('groups view', () => (
    <SelectedComponent mode="group" selected={mockGroup} />
  ));
