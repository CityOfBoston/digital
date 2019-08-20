import React, { useEffect, useReducer } from 'react';
import { storiesOf } from '@storybook/react';

import allPeople from './fixtures/people.json';
import allGroups from './fixtures/groups.json';

import { reducer } from './state/list';

import { fetchPersonsGroups } from './fixtures/mock-fetch-group-data';
import { fetchGroupMembers } from './fixtures/mock-fetch-person-data';

import { toGroup, toPerson } from './state/data-helpers';

import ReviewChangesView from './ReviewChangesView';

const mockPerson = toPerson(allPeople[1]);
const mockGroup = toGroup(allGroups[0]);

const groupsList = allGroups.map(group => toGroup(group));
const peopleList = allPeople.map(person => toPerson(person));

export function Wrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    if (props.mode === 'person') {
      fetchPersonsGroups(mockPerson, []).then(groups => {
        dispatch({ type: 'LIST/LOAD_LIST', list: groups });
        dispatch({ type: 'LIST/ADD_ITEM', item: allGroups[0] });
      });
    } else if (props.mode === 'group') {
      fetchGroupMembers(mockGroup).then(people => {
        dispatch({ type: 'LIST/LOAD_LIST', list: people });
        dispatch({ type: 'LIST/REMOVE_ITEM', cn: '132367' });
        dispatch({ type: 'LIST/ADD_ITEM', item: peopleList[0] });
      });
    }
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ReviewChangesView {...props} items={list} />
    </div>
  );
}

storiesOf('GroupManagementPage/ReviewChangesView', module)
  .add('group view, one added two removed', () => (
    <Wrapper mode="group" selected={groupsList[2]} />
  ))
  .add('person view, one added', () => (
    <Wrapper mode="person" selected={peopleList[4]} />
  ))
  .add('submitting changes', () => (
    <Wrapper mode="person" selected={peopleList[0]} submitting={true} />
  ));
