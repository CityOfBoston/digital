import React, { useEffect, useReducer } from 'react';

import { storiesOf } from '@storybook/react';

import { Group, Person } from '../types';

import { reducer } from '../state/list';

import { fetchGroupMembers } from '../fixtures/mock-fetch-person-data';
import { fetchPersonsGroups } from '../fixtures/mock-fetch-group-data';

import EditableList from './EditableList';

export function EditableListWrapper(props) {
  const [list, dispatch] = useReducer(reducer, []);

  const toggleItem = (item: Group | Person) => {
    dispatch({ type: 'LIST/TOGGLE_ITEM_STATUS', cn: item.cn });
  };

  useEffect(() => {
    if (props.mode === 'person') {
      fetchGroupMembers({
        members: ['Laguna Loire', '000296', 'Ignis Scientia'],
      } as Group).then(people =>
        dispatch({ type: 'LIST/LOAD_LIST', list: people })
      );
    } else if (props.mode === 'group') {
      fetchPersonsGroups(
        {
          groups: ['ANML02_LostFound', 'BPD_Districts', 'BPD_Administrative'],
        } as Person,
        []
      ).then(groups => dispatch({ type: 'LIST/LOAD_LIST', list: groups }));
    }
  }, []);

  return (
    <EditableList
      {...props}
      items={list}
      loading={props.loading}
      handleChange={toggleItem}
    />
  );
}

storiesOf('GroupManagementPage/ListComponents/EditableList', module)
  .add('editable group view', () => <EditableListWrapper mode="group" />)
  .add('editable person view', () => <EditableListWrapper mode="person" />)
  .add('loading view', () => (
    <EditableListWrapper mode="person" loading={true} />
  ))
  .add('no results, person view', () => (
    <EditableList
      mode="person"
      items={[]}
      handleChange={() => {}}
      handleClick={() => {}}
      currentPage={0}
      pageCount={1}
      pageSize={100}
      changePage={() => {}}
    />
  ))
  .add('no results, group view', () => (
    <EditableList
      mode="group"
      items={[]}
      handleChange={() => {}}
      handleClick={() => {}}
      currentPage={0}
      pageCount={1}
      pageSize={100}
      changePage={() => {}}
    />
  ));
