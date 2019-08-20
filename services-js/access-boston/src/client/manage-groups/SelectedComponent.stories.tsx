import React from 'react';
import { storiesOf } from '@storybook/react';

import people from './fixtures/people.json';
import groups from './fixtures/groups.json';

import SelectedComponent from './SelectedComponent';

storiesOf('ManageGroupsPage/SelectedComponent', module)
  .add('person view', () => (
    <SelectedComponent mode="person" selected={people[0]} />
  ))
  .add('groups view', () => (
    <SelectedComponent mode="group" selected={groups[0]} />
  ));
