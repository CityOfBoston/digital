import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { reducer } from '../state/list';

import allPeople from '../fixtures/people.json';
import allGroups from '../fixtures/groups.json';

import ReviewList from './ReviewList';
import { toGroup, toPerson } from '../state/data-helpers';

const mockPeople = allPeople.map(person => toPerson(person));
const mockGroups = allGroups.map(group => toGroup(group));

export function Wrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  useEffect(() => dispatch({ type: 'LIST/LOAD_LIST', list: props.items }), []);

  return <ReviewList {...props} items={list} status="add" />;
}

storiesOf('GroupManagementPage/ListComponents/ReviewList', module)
  .add('groups added', () => <Wrapper mode="group" items={mockGroups} />)
  .add('members added', () => <Wrapper mode="person" items={mockPeople} />);
