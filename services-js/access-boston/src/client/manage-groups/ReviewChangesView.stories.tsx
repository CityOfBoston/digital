import React, { useEffect, useReducer } from 'react';
import { storiesOf } from '@storybook/react';

import allPeople from './fixtures/people.json';
import allGroups from './fixtures/groups.json';

import { reducer } from './state/list';

import {
  fetchGroupMembers,
  fetchPersonsGroups,
} from './fixtures/fetch-list-data';
import { toGroup, toPerson } from './state/data-helpers';

import ReviewChangesView from './ReviewChangesView';

const groupsList = allGroups.map(group => toGroup(group));
const peopleList = allPeople.map(person => toPerson(person));

export function Wrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  // useEffect(() => {
  //   dispatch({ type: 'LOAD_LIST', list: props.items });
  //   dispatch({ type: 'ADD_ITEM', item: newEmployee1 });
  //   dispatch({ type: 'REMOVE_ITEM', cn: '000296' });
  // }, []);

  useEffect(() => {
    if (props.mode === 'person') {
      fetchPersonsGroups(props.selected.groups, []).then(groups => {
        dispatch({ type: 'LOAD_LIST', list: groups });
      });
    } else if (props.mode === 'group') {
      fetchGroupMembers(props.selected.members).then(people => {
        dispatch({ type: 'LOAD_LIST', list: people });
        dispatch({ type: 'REMOVE_ITEM', cn: '132367' });
        dispatch({ type: 'ADD_ITEM', item: peopleList[0] });
      });
    }
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ReviewChangesView {...props} items={list} />
    </div>
  );
}

storiesOf('ManageGroupsPage/ReviewChangesView', module)
  .add('group view, one added two removed', () => (
    <Wrapper mode="group" selected={groupsList[2]} />
  ))
  .add('person view, one added', () => (
    <Wrapper mode="person" selected={peopleList[0]} />
  ));
