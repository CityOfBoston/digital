import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { reducer } from '../state/list';

import people from '../fixtures/people.json';
import groups from '../fixtures/groups.json';

import ReviewList from './ReviewList';

export function Wrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  useEffect(() => dispatch({ type: 'LOAD_LIST', list: props.items }), []);

  return <ReviewList {...props} items={list} status="add" />;
}

storiesOf('ManageGroupsPage/ListComponents/ReviewList', module)
  .add('groups added', () => <Wrapper mode="group" items={groups} />)
  .add('members added', () => <Wrapper mode="people" items={people} />);
